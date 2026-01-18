const express = require('express');
const bcrypt = require('bcryptjs');
const { URL } = require('url');

const { getDb, getSetting, setSetting } = require('../lib/db');
const { requireAdminApi } = require('../lib/auth');
const { safeParseJsonObject, safeParseJsonArray } = require('../lib/json');
const {
  resolveCatPawOpenFullConfigUrl,
  normalizeCatPawOpenApiBaseOrThrow,
  resolveCatPawOpenWebsiteUrl,
  resolveCatPawOpenSpiderUrl,
} = require('../lib/catpaw');
const { httpGetJsonWithRedirects, httpRequestJsonWithRedirects, httpGetStatusWithRedirects } = require('../lib/httpClient');

function catPawHeadersFromReq(req) {
  const username = req && req.user && typeof req.user.username === 'string' ? req.user.username.trim() : '';
  return username ? { 'X-TV-User': username } : {};
}

function extractVideoSitesFromFullConfig(fullConfig) {
  const sites = fullConfig && fullConfig.video ? fullConfig.video.sites : null;
  if (!Array.isArray(sites)) return [];
  return sites
    .map((s) => ({
      key: s && typeof s.key === 'string' ? s.key : '',
      name: s && typeof s.name === 'string' ? s.name : '',
      type: s && typeof s.type === 'number' ? s.type : undefined,
      api: s && typeof s.api === 'string' ? s.api : '',
    }))
    .filter((s) => s.key && s.api);
}

function parseFormBool(value) {
  const v = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return v === '1' || v === 'true' || v === 'on' || v === 'yes';
}

function normalizeHttpBase(value) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';
  let url;
  try {
    url = new URL(raw);
  } catch (_e) {
    return '';
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
  url.hash = '';
  url.search = '';
  url.pathname = (url.pathname || '/').replace(/\/+$/, '') || '/';
  const normalized = url.toString();
  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
}

function normalizeGoProxyServers(value) {
  const list = Array.isArray(value) ? value : safeParseJsonArray(String(value || '[]'));
  const out = [];
  const seen = new Set();
  for (const it of list) {
    const base =
      typeof it === 'string'
        ? normalizeHttpBase(it)
        : normalizeHttpBase(it && typeof it.base === 'string' ? it.base : '');
    if (!base || seen.has(base)) continue;
    const pans = it && typeof it === 'object' && typeof it.pans === 'object' && it.pans ? it.pans : {};
    const hasBaidu = Object.prototype.hasOwnProperty.call(pans, 'baidu');
    const hasQuark = Object.prototype.hasOwnProperty.call(pans, 'quark');
    out.push({
      base,
      pans: {
        baidu: hasBaidu ? !!pans.baidu : true,
        quark: hasQuark ? !!pans.quark : true,
      },
    });
    seen.add(base);
  }
  return out;
}

function unwrapCatPawOpenWebsiteData(resp) {
  if (resp && resp.code === 0) return resp.data;
  const msg = resp && typeof resp.message === 'string' ? resp.message : '';
  throw new Error(msg || 'CatPawOpen 网站接口返回异常');
}

function resolveCatPawOpenPanSavePath(key, type) {
  const k = typeof key === 'string' ? key.trim() : '';
  const t = typeof type === 'string' ? type.trim() : '';
  if (!k || !t) return '';

  if (t === 'cookie') {
    const allowed = new Set(['baidu', 'quark', 'uc', '115', 'bili', 'wuming', 'pan123ziyuan']);
    if (!allowed.has(k)) return '';
    return `website/${k}/cookie`;
  }

  if (t === 'account') {
    if (k === 'tianyi') return 'website/tianyi/account';
    if (k === 'pan123') return 'website/pan123/account';
    if (k === 'yunchao') return 'website/yunchao/account';
    return '';
  }

  return '';
}

async function savePanSettingToCatPawOpen(apiBase, key, type, payload, headers = {}) {
  const trimmed = typeof apiBase === 'string' ? apiBase.trim() : '';
  if (!trimmed) throw new Error('CatPawOpen 接口地址未设置');
  const path = resolveCatPawOpenPanSavePath(key, type);
  if (!path) throw new Error('CatPawOpen 保存路径未配置');
  const url = resolveCatPawOpenWebsiteUrl(trimmed, path);
  const resp = await httpRequestJsonWithRedirects(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(headers && typeof headers === 'object' ? headers : {}) },
    body: JSON.stringify(payload || {}),
  });
  unwrapCatPawOpenWebsiteData(resp);
}

async function syncAllPanLoginSettingsToCatPawOpen(apiBase, store, headers = {}) {
  const settings = store && typeof store === 'object' && !Array.isArray(store) ? store : {};
  const entries = Object.keys(settings)
    .map((k) => ({ key: k, value: settings[k] }))
    .filter((it) => it && typeof it.key === 'string' && it.key.trim());

  const results = [];
  for (let i = 0; i < entries.length; i += 1) {
    const key = entries[i].key.trim();
    const value = entries[i].value && typeof entries[i].value === 'object' ? entries[i].value : {};

    const isAccount = key === 'tianyi' || key === 'pan123' || key === 'yunchao';
    const type = isAccount ? 'account' : 'cookie';
    const path = resolveCatPawOpenPanSavePath(key, type);
    if (!path) continue;

    if (type === 'cookie') {
      const cookie = value && typeof value.cookie === 'string' ? value.cookie : '';
      if (!cookie) continue;
      try {
        // eslint-disable-next-line no-await-in-loop
        await savePanSettingToCatPawOpen(apiBase, key, 'cookie', { cookie }, headers);
        results.push({ key, ok: true });
      } catch (e) {
        results.push({ key, ok: false, message: e && e.message ? String(e.message) : '同步失败' });
      }
      continue;
    }

    const username = value && typeof value.username === 'string' ? value.username : '';
    const password = value && typeof value.password === 'string' ? value.password : '';
    if (!username && !password) continue;
    try {
      // eslint-disable-next-line no-await-in-loop
      await savePanSettingToCatPawOpen(apiBase, key, 'account', { username, password }, headers);
      results.push({ key, ok: true });
    } catch (e) {
      results.push({ key, ok: false, message: e && e.message ? String(e.message) : '同步失败' });
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  const failCount = results.length - okCount;
  return { okCount, failCount, results };
}

async function fetchSitesFromCatPawOpen(apiBase, headers = {}) {
  const trimmed = typeof apiBase === 'string' ? apiBase.trim() : '';
  if (!trimmed) return [];
  const fullConfigUrl = resolveCatPawOpenFullConfigUrl(trimmed);
  if (!fullConfigUrl) throw new Error('CatPawOpen 接口地址不是合法 URL');
  const fullConfig = await httpGetJsonWithRedirects(fullConfigUrl, headers && typeof headers === 'object' ? headers : {}, {
    maxBytes: 10 * 1024 * 1024,
  });
  return extractVideoSitesFromFullConfig(fullConfig);
}

async function fetchPansFromCatPawOpenWebsite(apiBase, headers = {}) {
  const trimmed = typeof apiBase === 'string' ? apiBase.trim() : '';
  if (!trimmed) return [];
  const url = resolveCatPawOpenWebsiteUrl(trimmed, 'website/pans/list');
  const resp = await httpGetJsonWithRedirects(url, headers && typeof headers === 'object' ? headers : {});
  const data = unwrapCatPawOpenWebsiteData(resp);
  if (!Array.isArray(data)) return [];
  return data
    .map((it) => ({
      key: it && typeof it.key === 'string' ? it.key : '',
      name: it && typeof it.name === 'string' ? it.name : '',
      enable: !!(it && it.enable),
    }))
    .filter((it) => it.key);
}

async function savePansToCatPawOpenWebsite(apiBase, list, headers = {}) {
  const trimmed = typeof apiBase === 'string' ? apiBase.trim() : '';
  if (!trimmed) throw new Error('CatPawOpen 接口地址未设置');
  const url = resolveCatPawOpenWebsiteUrl(trimmed, 'website/pans/list');
  const body = JSON.stringify({ list });
  const resp = await httpRequestJsonWithRedirects(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(headers && typeof headers === 'object' ? headers : {}) },
    body,
  });
  unwrapCatPawOpenWebsiteData(resp);
}

function createDashboardRouter() {
  const router = express.Router();

  const requireAdmin = requireAdminApi();
  const normalizeVideoSourceSites = (sites) => {
    const list = Array.isArray(sites) ? sites : [];
    const out = [];
    const seen = new Set();
    for (let i = 0; i < list.length; i += 1) {
      const s = list[i];
      const key = s && typeof s.key === 'string' ? s.key.trim() : '';
      const name = s && typeof s.name === 'string' ? s.name : '';
      const api = s && typeof s.api === 'string' ? s.api.trim() : '';
      const type = s && typeof s.type === 'number' ? s.type : undefined;
      if (!key || !api) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ key, name, api, type });
    }
    return out;
  };
  const getVideoSourceSites = () => {
    const raw = safeParseJsonArray(getSetting('video_source_sites') || '[]');
    return normalizeVideoSourceSites(raw);
  };

  const normalizePansList = (list) => {
    if (!Array.isArray(list)) return [];
    return list
      .map((it) => ({
        key: it && typeof it.key === 'string' ? it.key.trim() : '',
        name: it && typeof it.name === 'string' ? it.name : '',
        enable: !!(it && it.enable),
      }))
      .filter((it) => it.key);
  };

  const getCachedCatPawOpenPans = () => {
    const raw = safeParseJsonArray(getSetting('catpawopen_pans_list') || '[]');
    return normalizePansList(raw);
  };

  const setCachedCatPawOpenPans = (pans) => {
    setSetting('catpawopen_pans_list', JSON.stringify(normalizePansList(pans)));
  };
  const setVideoSourceSites = (sites) => {
    setSetting('video_source_sites', JSON.stringify(normalizeVideoSourceSites(sites)));
  };
  const getVideoSourceSiteStatusMap = () => safeParseJsonObject(getSetting('video_source_site_status') || '{}');
  const setVideoSourceSiteStatusMap = (map) => {
    const next = map && typeof map === 'object' && !Array.isArray(map) ? map : {};
    setSetting('video_source_site_status', JSON.stringify(next));
  };
  const getVideoSourceSiteHomeMap = () => safeParseJsonObject(getSetting('video_source_site_home') || '{}');
  const setVideoSourceSiteHomeMap = (map) => {
    const next = map && typeof map === 'object' && !Array.isArray(map) ? map : {};
    setSetting('video_source_site_home', JSON.stringify(next));
  };
  const getVideoSourceSiteOrder = () => safeParseJsonArray(getSetting('video_source_site_order') || '[]');
  const setVideoSourceSiteOrder = (order) => {
    const list = Array.isArray(order) ? order.filter((v) => typeof v === 'string' && v.trim()) : [];
    const uniq = [];
    const seen = new Set();
    list.forEach((k) => {
      const key = k.trim();
      if (!key) return;
      if (seen.has(key)) return;
      seen.add(key);
      uniq.push(key);
    });
    setSetting('video_source_site_order', JSON.stringify(uniq));
  };

  const getVideoSourceSearchOrder = () => safeParseJsonArray(getSetting('video_source_search_order') || '[]');
  const setVideoSourceSearchOrder = (order) => {
    const list = Array.isArray(order) ? order.filter((v) => typeof v === 'string' && v.trim()) : [];
    const uniq = [];
    const seen = new Set();
    list.forEach((k) => {
      const key = k.trim();
      if (!key) return;
      if (seen.has(key)) return;
      seen.add(key);
      uniq.push(key);
    });
    setSetting('video_source_search_order', JSON.stringify(uniq));
  };
  const getVideoSourceSearchCoverSite = () => String(getSetting('video_source_search_cover_site') || '');
  const setVideoSourceSearchCoverSite = (key) => setSetting('video_source_search_cover_site', String(key || ''));

  const getMagicEpisodeRules = () =>
    safeParseJsonArray(getSetting('magic_episode_rules') || '[]').filter((v) => typeof v === 'string' && v.trim());
  const normalizeMagicEpisodeCleanRegexRules = (rules) => {
    const list = Array.isArray(rules) ? rules : [];
    const next = [];
    const seen = new Set();
    list.forEach((v) => {
      const raw = typeof v === 'string' ? v.trim() : '';
      if (!raw) return;
      if (raw.length > 600) return;
      if (seen.has(raw)) return;
      seen.add(raw);
      next.push(raw);
    });
    return next;
  };
  const getMagicEpisodeCleanRegex = () => {
    const raw = typeof getSetting('magic_episode_clean_regex') === 'string' ? getSetting('magic_episode_clean_regex') : '';
    const s = String(raw || '').trim();
    return s && s.length <= 600 ? s : '';
  };
  const getMagicEpisodeCleanRegexRules = () => {
    const list = safeParseJsonArray(getSetting('magic_episode_clean_regex_rules') || '[]').filter(
      (v) => typeof v === 'string' && v.trim()
    );
    const normalized = normalizeMagicEpisodeCleanRegexRules(list);
    if (normalized.length) return normalized;
    const legacy = getMagicEpisodeCleanRegex();
    return legacy ? [legacy] : [];
  };
  const setMagicEpisodeCleanRegexRules = (rules) => {
    const next = normalizeMagicEpisodeCleanRegexRules(rules);
    setSetting('magic_episode_clean_regex_rules', JSON.stringify(next));
    // Backward compatibility: keep the legacy single-string setting as the first rule.
    setSetting('magic_episode_clean_regex', next[0] || '');
  };
  const setMagicEpisodeRules = (rules) => {
    const list = Array.isArray(rules) ? rules : [];
    const next = [];
    const seen = new Set();
    list.forEach((v) => {
      const raw = typeof v === 'string' ? v.trim() : '';
      if (!raw) return;
      if (raw.length > 300) return;
      if (seen.has(raw)) return;
      seen.add(raw);
      next.push(raw);
    });
    setSetting('magic_episode_rules', JSON.stringify(next));
  };
  const getMagicAggregateRules = () =>
    safeParseJsonArray(getSetting('magic_aggregate_rules') || '[]').filter((v) => typeof v === 'string' && v.trim());
  const setMagicAggregateRules = (rules) => {
    const list = Array.isArray(rules) ? rules : [];
    const next = [];
    const seen = new Set();
    list.forEach((v) => {
      const raw = typeof v === 'string' ? v.trim() : '';
      if (!raw) return;
      if (raw.length > 300) return;
      if (seen.has(raw)) return;
      seen.add(raw);
      next.push(raw);
    });
    setSetting('magic_aggregate_rules', JSON.stringify(next));
  };
  const getMagicAggregateRegexRules = () =>
    safeParseJsonArray(getSetting('magic_aggregate_regex_rules') || '[]').filter(
      (v) => typeof v === 'string' && v.trim()
    );
  const setMagicAggregateRegexRules = (rules) => {
    const list = Array.isArray(rules) ? rules : [];
    const next = [];
    const seen = new Set();
    list.forEach((v) => {
      const raw = typeof v === 'string' ? v.trim() : '';
      if (!raw) return;
      if (raw.length > 600) return;
      if (seen.has(raw)) return;
      seen.add(raw);
      next.push(raw);
    });
    setSetting('magic_aggregate_regex_rules', JSON.stringify(next));
  };

  const normalizeAvailability = (v) => {
    const raw = typeof v === 'string' ? v.trim() : '';
    if (raw === 'valid' || raw === 'invalid' || raw === 'unknown' || raw === 'unchecked') return raw;
    return 'unchecked';
  };
  const getVideoSourceSiteAvailabilityMap = () =>
    safeParseJsonObject(getSetting('video_source_site_availability') || '{}');
  const setVideoSourceSiteAvailabilityMap = (map) => {
    const raw = map && typeof map === 'object' && !Array.isArray(map) ? map : {};
    const next = {};
    Object.keys(raw).forEach((k) => {
      const key = typeof k === 'string' ? k.trim() : '';
      if (!key) return;
      next[key] = normalizeAvailability(raw[k]);
    });
    setSetting('video_source_site_availability', JSON.stringify(next));
  };

  const extractSpiderNameFromApi = (api) => {
    const raw = typeof api === 'string' ? api.trim() : '';
    if (!raw) return '';
    const m = raw.match(/\/spider\/([^/]+)\//);
    return m && m[1] ? String(m[1]) : '';
  };
  const getDefaultHomeForSite = (site) => {
    const name = extractSpiderNameFromApi(site && site.api);
    if (name === 'baseset') return false;
    return true;
  };

  const applySiteOrder = (sites) => {
    const list = Array.isArray(sites) ? sites : [];
    const order = getVideoSourceSiteOrder();
    if (!order.length) return list;
    const index = new Map();
    for (let i = 0; i < order.length; i += 1) index.set(order[i], i);
    const decorated = list.map((s, i) => ({
      s,
      i,
      o: index.has(s && s.key) ? index.get(s && s.key) : 1e9,
    }));
    decorated.sort((a, b) => (a.o - b.o) || (a.i - b.i));
    return decorated.map((d) => d.s);
  };

  const mergeSiteStatus = (sites) => {
    const map = getVideoSourceSiteStatusMap();
    const homeMap = getVideoSourceSiteHomeMap();
    const availabilityMap = getVideoSourceSiteAvailabilityMap();
    const ordered = applySiteOrder(sites);
    return ordered.map((s) => {
      const key = s && typeof s.key === 'string' ? s.key : '';
      const enabled = key && Object.prototype.hasOwnProperty.call(map, key) ? !!map[key] : true;
      const home =
        key && Object.prototype.hasOwnProperty.call(homeMap, key) ? !!homeMap[key] : getDefaultHomeForSite(s);
      const availability =
        key && Object.prototype.hasOwnProperty.call(availabilityMap, key)
          ? normalizeAvailability(availabilityMap[key])
          : 'unchecked';
      return { ...s, enabled, home, availability };
    });
  };

  const reconcileVideoSourceSitesFromCatPawOpen = (newSites) => {
    const normalizedNew = normalizeVideoSourceSites(newSites);
    const keysInNewOrder = normalizedNew.map((s) => s.key);
    const newKeySet = new Set(keysInNewOrder);

    // Remove deleted keys from status/home maps (keep others), then fill defaults for added keys.
    const prevStatus = getVideoSourceSiteStatusMap();
    const nextStatus = {};
    Object.keys(prevStatus || {}).forEach((k) => {
      const key = typeof k === 'string' ? k.trim() : '';
      if (!key || !newKeySet.has(key)) return;
      nextStatus[key] = !!prevStatus[key];
    });
    normalizedNew.forEach((s) => {
      if (!Object.prototype.hasOwnProperty.call(nextStatus, s.key)) nextStatus[s.key] = true;
    });

    const prevHome = getVideoSourceSiteHomeMap();
    const nextHome = {};
    Object.keys(prevHome || {}).forEach((k) => {
      const key = typeof k === 'string' ? k.trim() : '';
      if (!key || !newKeySet.has(key)) return;
      nextHome[key] = !!prevHome[key];
    });
    normalizedNew.forEach((s) => {
      if (!Object.prototype.hasOwnProperty.call(nextHome, s.key)) nextHome[s.key] = getDefaultHomeForSite(s);
    });

    const prevAvailability = getVideoSourceSiteAvailabilityMap();
    const nextAvailability = {};
    Object.keys(prevAvailability || {}).forEach((k) => {
      const key = typeof k === 'string' ? k.trim() : '';
      if (!key || !newKeySet.has(key)) return;
      nextAvailability[key] = normalizeAvailability(prevAvailability[key]);
    });
    normalizedNew.forEach((s) => {
      if (!Object.prototype.hasOwnProperty.call(nextAvailability, s.key)) nextAvailability[s.key] = 'unchecked';
    });

    // Preserve old order for existing keys; insert new keys based on the new JS order.
    const prevOrder = getVideoSourceSiteOrder().filter((k) => typeof k === 'string' && newKeySet.has(k));
    const nextOrder = [];
    const seenOrder = new Set();
    prevOrder.forEach((k) => {
      const key = k.trim();
      if (!key || seenOrder.has(key)) return;
      seenOrder.add(key);
      nextOrder.push(key);
    });

    let lastIndex = -1;
    keysInNewOrder.forEach((key) => {
      const idx = nextOrder.indexOf(key);
      if (idx >= 0) {
        lastIndex = idx;
        return;
      }
      const insertAt = Math.min(Math.max(lastIndex + 1, 0), nextOrder.length);
      nextOrder.splice(insertAt, 0, key);
      lastIndex = insertAt;
    });

    setVideoSourceSites(normalizedNew);
    setVideoSourceSiteStatusMap(nextStatus);
    setVideoSourceSiteHomeMap(nextHome);
    setVideoSourceSiteOrder(nextOrder);
    setVideoSourceSiteAvailabilityMap(nextAvailability);

    return normalizedNew;
  };

  router.post('/site/save', requireAdmin, (req, res) => {
    const siteName = typeof req.body.siteName === 'string' ? req.body.siteName.trim() : '';
    const doubanDataProxy = typeof req.body.doubanDataProxy === 'string' ? req.body.doubanDataProxy : '';
    const doubanDataCustom =
      typeof req.body.doubanDataCustom === 'string' ? req.body.doubanDataCustom.trim() : '';
    const doubanImgProxy = typeof req.body.doubanImgProxy === 'string' ? req.body.doubanImgProxy : '';
    const doubanImgCustom =
      typeof req.body.doubanImgCustom === 'string' ? req.body.doubanImgCustom.trim() : '';

    if (!doubanDataProxy || !doubanImgProxy) {
      return res.status(400).json({ success: false, message: '参数无效' });
    }

    if (siteName) {
      setSetting('site_name', siteName);
    }
    setSetting('douban_data_proxy', doubanDataProxy);
    setSetting('douban_data_custom', doubanDataCustom);
    setSetting('douban_img_proxy', doubanImgProxy);
    setSetting('douban_img_custom', doubanImgCustom);

    return res.json({ success: true });
  });

  router.post('/catpawopen/save', requireAdmin, (req, res) => {
    const catPawOpenApiBase = typeof req.body.catPawOpenApiBase === 'string' ? req.body.catPawOpenApiBase : '';

    const prevApiBase = getSetting('catpawopen_api_base') || '';
    try {
      setSetting('catpawopen_api_base', normalizeCatPawOpenApiBaseOrThrow(catPawOpenApiBase));
    } catch (_e) {
      return res.status(400).json({ success: false, message: 'CatPawOpen 接口地址不是合法 URL' });
    }

    const apiBase = getSetting('catpawopen_api_base') || '';
    // IMPORTANT: TV_Server does not call CatPawOpen directly for sync; browser clients should sync
    // and render the result, because TV_Server may not be able to reach a user's local CatPawOpen.
    return res.json({
      success: true,
      apiBaseChanged: String(prevApiBase || '') !== String(apiBase || ''),
      proxySync: { ok: null, skipped: true },
      goProxySync: { ok: null, skipped: true },
    });
  });

  router.get('/site/settings', requireAdmin, (req, res) => {
    return res.json({
      success: true,
      siteName: getSetting('site_name') || '',
      catPawOpenApiBase: getSetting('catpawopen_api_base') || '',
      goProxyEnabled: String(getSetting('goproxy_enabled') || '') === '1',
      goProxyAutoSelect: String(getSetting('goproxy_auto_select') || '') === '1',
      goProxyServersJson: getSetting('goproxy_servers') || '[]',
      doubanDataProxy: getSetting('douban_data_proxy') || 'direct',
      doubanDataCustom: getSetting('douban_data_custom') || '',
      doubanImgProxy: getSetting('douban_img_proxy') || 'direct-browser',
      doubanImgCustom: getSetting('douban_img_custom') || '',
    });
  });

  router.post('/goproxy/save', requireAdmin, async (req, res) => {
    const enabled = parseFormBool(req.body.goProxyEnabled);
    const autoSelect = parseFormBool(req.body.goProxyAutoSelect);
    const serversJson = typeof req.body.goProxyServersJson === 'string' ? req.body.goProxyServersJson : '[]';
    const servers = normalizeGoProxyServers(serversJson);

    setSetting('goproxy_enabled', enabled ? '1' : '0');
    setSetting('goproxy_auto_select', autoSelect ? '1' : '0');
    setSetting('goproxy_servers', JSON.stringify(servers));
    // See /catpawopen/save: sync is client-side.
    return res.json({ success: true, goProxySync: { ok: null, skipped: true } });
  });

  const getPanLoginSettings = () => safeParseJsonObject(getSetting('pan_login_settings') || '{}');
  const setPanLoginSettings = (next) => {
    setSetting('pan_login_settings', JSON.stringify(next || {}));
  };

  router.get('/pan/settings', requireAdmin, (req, res) => {
    const key = req.query && typeof req.query.key === 'string' ? req.query.key.trim() : '';
    const store = getPanLoginSettings();
    if (key) {
      const value =
        store && Object.prototype.hasOwnProperty.call(store, key) && store[key] && typeof store[key] === 'object'
          ? store[key]
          : {};
      return res.json({ success: true, settings: { [key]: value } });
    }
    return res.json({ success: true, settings: store });
  });

  router.post('/pan/settings', requireAdmin, (req, res) => {
    const key = typeof req.body.key === 'string' ? req.body.key.trim() : '';
    const type = typeof req.body.type === 'string' ? req.body.type.trim() : '';
    if (!key) return res.status(400).json({ success: false, message: 'key 不能为空' });
    if (type !== 'cookie' && type !== 'account') {
      return res.status(400).json({ success: false, message: 'type 参数无效' });
    }

    const store = getPanLoginSettings();

    if (type === 'cookie') {
      const cookie = typeof req.body.cookie === 'string' ? req.body.cookie : '';
      store[key] = Object.assign({}, store[key], { cookie });
    } else {
      const username = typeof req.body.username === 'string' ? req.body.username : '';
      const password = typeof req.body.password === 'string' ? req.body.password : '';
      store[key] = Object.assign({}, store[key], { username, password });
    }
    setPanLoginSettings(store);

    const payload =
      type === 'cookie'
        ? { cookie: (store[key] && store[key].cookie) || '' }
        : {
            username: (store[key] && store[key].username) || '',
            password: (store[key] && store[key].password) || '',
          };

    // IMPORTANT: TV_Server does not call CatPawOpen; client should sync and render result.
    return res.json({ success: true, settings: store, sync: { ok: null, skipped: true }, payload });
  });

  router.get('/video/pans/list', requireAdmin, async (req, res) => {
    return res.json({ success: true, pans: getCachedCatPawOpenPans() });
  });

  router.post('/video/pans/list', requireAdmin, async (req, res) => {
    let list = req.body && Object.prototype.hasOwnProperty.call(req.body, 'list') ? req.body.list : null;
    if (typeof list === 'string') {
      try {
        list = JSON.parse(list);
      } catch (_e) {
        list = null;
      }
    }
    if (!Array.isArray(list)) return res.status(400).json({ success: false, message: 'list 参数无效' });

    const normalized = list
      .map((it) => ({
        key: it && typeof it.key === 'string' ? it.key.trim() : '',
        name: it && typeof it.name === 'string' ? it.name : '',
        enable: !!(it && it.enable),
      }))
      .filter((it) => it.key);

    setCachedCatPawOpenPans(normalized);
    return res.json({ success: true, pans: getCachedCatPawOpenPans() });
  });

  router.post('/video/source/save', requireAdmin, async (req, res) => {
    const rawUrl = typeof req.body.videoSourceUrl === 'string' ? req.body.videoSourceUrl.trim() : '';

    setSetting('video_source_url', rawUrl);

    const storedSites = getVideoSourceSites();
    return res.json({
      success: true,
      sites: mergeSiteStatus(storedSites),
      sitesRefreshed: false,
      pans: getCachedCatPawOpenPans(),
      panSync: { ok: null, skipped: true },
    });
  });

  router.get('/video/source/settings', requireAdmin, (req, res) => {
    const videoSourceUrl = getSetting('video_source_url') || '';
    return res.json({ success: true, videoSourceUrl });
  });

  router.get('/video/source/sites', requireAdmin, async (req, res) => {
    const storedSites = getVideoSourceSites();
    return res.json({ success: true, sites: mergeSiteStatus(storedSites) });
  });

  router.post('/video/source/sites/check', requireAdmin, async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    let input = body && Object.prototype.hasOwnProperty.call(body, 'results') ? body.results : null;
    if (typeof input === 'string') {
      try {
        input = JSON.parse(input);
      } catch (_e) {
        input = null;
      }
    }
    input = input && typeof input === 'object' && !Array.isArray(input) ? input : null;
    if (!input || Array.isArray(input)) {
      return res.status(400).json({ success: false, message: 'results 参数无效' });
    }

    const results = {};
    Object.keys(input).forEach((k) => {
      const key = typeof k === 'string' ? k.trim() : '';
      if (!key) return;
      results[key] = normalizeAvailability(input[k]);
    });

    const availabilityMap = getVideoSourceSiteAvailabilityMap();
    Object.keys(results).forEach((k) => {
      availabilityMap[k] = normalizeAvailability(results[k]);
    });
    setVideoSourceSiteAvailabilityMap(availabilityMap);

    const statusMap = getVideoSourceSiteStatusMap();
    Object.keys(results).forEach((k) => {
      if (results[k] === 'invalid') statusMap[k] = false;
    });
    setVideoSourceSiteStatusMap(statusMap);

    const nextSites = mergeSiteStatus(getVideoSourceSites());
    return res.json({ success: true, results, sites: nextSites });
  });

  // Client-side CatPawOpen full-config -> import sites into TV_Server DB.
  router.post('/video/source/sites/import', requireAdmin, (req, res) => {
    let sites = req.body && Object.prototype.hasOwnProperty.call(req.body, 'sites') ? req.body.sites : null;
    if (typeof sites === 'string') {
      try {
        sites = JSON.parse(sites);
      } catch (_e) {
        sites = null;
      }
    }
    if (!Array.isArray(sites)) return res.status(400).json({ success: false, message: 'sites 参数无效' });

    const normalized = sites
      .map((s) => ({
        key: s && typeof s.key === 'string' ? s.key.trim() : '',
        name: s && typeof s.name === 'string' ? s.name : '',
        api: s && typeof s.api === 'string' ? s.api.trim() : '',
        type: s && typeof s.type === 'number' ? s.type : undefined,
      }))
      .filter((s) => s.key && s.api);

    reconcileVideoSourceSitesFromCatPawOpen(normalized);
    return res.json({ success: true, sites: mergeSiteStatus(getVideoSourceSites()) });
  });

  router.post('/video/source/sites/status', requireAdmin, (req, res) => {
    const key = typeof req.body.key === 'string' ? req.body.key.trim() : '';
    const enabledRaw = req.body && Object.prototype.hasOwnProperty.call(req.body, 'enabled') ? req.body.enabled : '';
    const enabled = enabledRaw === true || enabledRaw === 'true' || enabledRaw === 1 || enabledRaw === '1';
    if (!key) return res.status(400).json({ success: false, message: 'key 不能为空' });

    const map = getVideoSourceSiteStatusMap();
    map[key] = enabled;
    setVideoSourceSiteStatusMap(map);
    return res.json({ success: true, key, enabled });
  });

  router.post('/video/source/sites/home', requireAdmin, (req, res) => {
    const key = typeof req.body.key === 'string' ? req.body.key.trim() : '';
    const homeRaw = req.body && Object.prototype.hasOwnProperty.call(req.body, 'home') ? req.body.home : '';
    const home = homeRaw === true || homeRaw === 'true' || homeRaw === 1 || homeRaw === '1';
    if (!key) return res.status(400).json({ success: false, message: 'key 不能为空' });

    const map = getVideoSourceSiteHomeMap();
    map[key] = home;
    setVideoSourceSiteHomeMap(map);
    return res.json({ success: true, key, home });
  });

  router.post('/video/source/sites/order', requireAdmin, (req, res) => {
    const raw = req.body && Object.prototype.hasOwnProperty.call(req.body, 'order') ? req.body.order : '';
    const text = typeof raw === 'string' ? raw : '';
    const order = safeParseJsonArray(text);
    setVideoSourceSiteOrder(order);
    return res.json({ success: true });
  });

  router.get('/search/settings', requireAdmin, (req, res) => {
    const sites = mergeSiteStatus(getVideoSourceSites());
    const keys = sites.map((s) => s.key);
    const keySet = new Set(keys);
    const orderRaw = getVideoSourceSearchOrder();
    const uniq = [];
    const seen = new Set();
    orderRaw.forEach((k) => {
      const key = typeof k === 'string' ? k.trim() : '';
      if (!key || !keySet.has(key) || seen.has(key)) return;
      seen.add(key);
      uniq.push(key);
    });
    keys.forEach((k) => {
      if (!k || seen.has(k)) return;
      seen.add(k);
      uniq.push(k);
    });

    const coverRaw = getVideoSourceSearchCoverSite().trim();
    const cover = coverRaw && keySet.has(coverRaw) ? coverRaw : '';
    const enabledFirst = sites.find((s) => s && s.enabled) || null;
    const fallbackCover = cover || (enabledFirst && enabledFirst.key) || uniq[0] || '';
    return res.json({
      success: true,
      sites,
      search: { order: uniq, coverSite: fallbackCover },
    });
  });

  router.post('/search/settings', requireAdmin, (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const sites = mergeSiteStatus(getVideoSourceSites());
    const keys = sites.map((s) => s.key);
    const keySet = new Set(keys);
    const orderIn = Array.isArray(body.order) ? body.order : typeof body.order === 'string' ? safeParseJsonArray(body.order) : [];
    const uniq = [];
    const seen = new Set();
    orderIn.forEach((k) => {
      const key = typeof k === 'string' ? k.trim() : '';
      if (!key || !keySet.has(key) || seen.has(key)) return;
      seen.add(key);
      uniq.push(key);
    });
    keys.forEach((k) => {
      if (!k || seen.has(k)) return;
      seen.add(k);
      uniq.push(k);
    });
    const coverRaw = typeof body.coverSite === 'string' ? body.coverSite.trim() : '';
    const cover = coverRaw && keySet.has(coverRaw) ? coverRaw : '';
    const enabledFirst = sites.find((s) => s && s.enabled) || null;
    const fallbackCover = cover || (enabledFirst && enabledFirst.key) || uniq[0] || '';

    setVideoSourceSearchOrder(uniq);
    setVideoSourceSearchCoverSite(fallbackCover);
    return res.json({ success: true, search: { order: uniq, coverSite: fallbackCover } });
  });

  router.get('/magic/settings', requireAdmin, (req, res) => {
    const episodeCleanRegexRules = getMagicEpisodeCleanRegexRules();
    return res.json({
      success: true,
      episodeCleanRegex: episodeCleanRegexRules[0] || '',
      episodeCleanRegexRules,
      episodeRules: getMagicEpisodeRules(),
      aggregateRules: getMagicAggregateRules(),
      aggregateRegexRules: getMagicAggregateRegexRules(),
    });
  });

  router.post('/magic/settings', requireAdmin, (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const episodeCleanRegex = typeof body.episodeCleanRegex === 'string' ? body.episodeCleanRegex : '';
    const episodeCleanRegexRules = Array.isArray(body.episodeCleanRegexRules)
      ? body.episodeCleanRegexRules
      : typeof body.episodeCleanRegexRules === 'string'
        ? safeParseJsonArray(body.episodeCleanRegexRules)
        : [];
    const episodeRules = Array.isArray(body.episodeRules)
      ? body.episodeRules
      : typeof body.episodeRules === 'string'
        ? safeParseJsonArray(body.episodeRules)
        : [];
    const aggregateRules = Array.isArray(body.aggregateRules)
      ? body.aggregateRules
      : typeof body.aggregateRules === 'string'
        ? safeParseJsonArray(body.aggregateRules)
        : [];
    const aggregateRegexRules = Array.isArray(body.aggregateRegexRules)
      ? body.aggregateRegexRules
      : typeof body.aggregateRegexRules === 'string'
        ? safeParseJsonArray(body.aggregateRegexRules)
        : [];
    if (episodeCleanRegexRules.length) setMagicEpisodeCleanRegexRules(episodeCleanRegexRules);
    else setMagicEpisodeCleanRegexRules(episodeCleanRegex ? [episodeCleanRegex] : []);
    setMagicEpisodeRules(episodeRules);
    setMagicAggregateRules(aggregateRules);
    setMagicAggregateRegexRules(aggregateRegexRules);
    const outEpisodeCleanRegexRules = getMagicEpisodeCleanRegexRules();
    return res.json({
      success: true,
      episodeCleanRegex: outEpisodeCleanRegexRules[0] || '',
      episodeCleanRegexRules: outEpisodeCleanRegexRules,
      episodeRules: getMagicEpisodeRules(),
      aggregateRules: getMagicAggregateRules(),
      aggregateRegexRules: getMagicAggregateRegexRules(),
    });
  });

  router.get('/user/list', requireAdmin, (req, res) => {
    const db = getDb();
    const users = db
      .prepare(
        "SELECT username, role, status, cat_api_base, cat_proxy FROM users ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END, username"
      )
      .all();
    return res.json({ success: true, users: users || [], userCount: Array.isArray(users) ? users.length : 0 });
  });

  router.post('/user/add', requireAdmin, (req, res) => {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password.trim() : '';
    const roleRaw = typeof req.body.role === 'string' ? req.body.role.trim() : '';
    const role = roleRaw === 'shared' ? 'shared' : 'user';
    const catApiBase = typeof req.body.catApiBase === 'string' ? req.body.catApiBase.trim() : '';
    const catProxy = typeof req.body.catProxy === 'string' ? req.body.catProxy.trim() : '';
    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: '添加用户失败，可能是用户名已存在或参数无效' });
    }
    const db = getDb();
    try {
      const hashed = bcrypt.hashSync(password, 10);
      db.prepare(
        "INSERT INTO users(username, password, role, status, cat_api_base, cat_proxy) VALUES (?, ?, ?, 'active', ?, ?)"
      ).run(username, hashed, role, catApiBase, catProxy);
      return res.json({ success: true });
    } catch (e) {
      return res
        .status(400)
        .json({ success: false, message: '添加用户失败，可能是用户名已存在或参数无效' });
    }
  });

  router.post('/user/ban', requireAdmin, (req, res) => {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    if (!username) {
      return res.status(400).json({ success: false, message: '用户名不能为空' });
    }
    const db = getDb();
    const u = db
      .prepare('SELECT role, status FROM users WHERE username = ? LIMIT 1')
      .get(username);
    if (!u || u.role === 'admin') {
      return res.status(400).json({ success: false, message: '操作失败' });
    }
    const next = u.status === 'active' ? 'banned' : 'active';
    const updated = db
      .prepare("UPDATE users SET status = ? WHERE username = ? AND role <> 'admin'")
      .run(next, username);
    if (!updated || updated.changes <= 0) {
      return res.status(400).json({ success: false, message: '操作失败' });
    }
    return res.json({ success: true, status: next });
  });

  router.post('/user/delete', requireAdmin, (req, res) => {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    if (!username) {
      return res.status(400).json({ success: false, message: '用户名不能为空' });
    }
    const db = getDb();
    const row = db.prepare('SELECT id, role FROM users WHERE username = ? LIMIT 1').get(username);
    if (!row || row.role === 'admin') {
      return res.status(400).json({ success: false, message: '删除失败' });
    }

    const del = db.transaction(() => {
      const tokens = db.prepare('DELETE FROM auth_tokens WHERE user_id = ?').run(row.id);
      const history = db.prepare('DELETE FROM search_history WHERE user_id = ?').run(row.id);
      const playHistory = db.prepare('DELETE FROM play_history WHERE user_id = ?').run(row.id);
      const favorites = db.prepare('DELETE FROM favorites WHERE user_id = ?').run(row.id);
      const user = db.prepare('DELETE FROM users WHERE id = ? AND role <> \'admin\'').run(row.id);
      return {
        tokenDeleted: tokens && typeof tokens.changes === 'number' ? tokens.changes : 0,
        historyDeleted: history && typeof history.changes === 'number' ? history.changes : 0,
        playHistoryDeleted: playHistory && typeof playHistory.changes === 'number' ? playHistory.changes : 0,
        favoritesDeleted: favorites && typeof favorites.changes === 'number' ? favorites.changes : 0,
        userDeleted: user && typeof user.changes === 'number' ? user.changes : 0,
      };
    });

    const result = del();
    if (!result || result.userDeleted <= 0) {
      return res.status(400).json({ success: false, message: '删除失败' });
    }
    return res.json({ success: true, deleted: result });
  });

  router.post('/user/update', requireAdmin, (req, res) => {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const newUsername = typeof req.body.newUsername === 'string' ? req.body.newUsername.trim() : '';
    const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword.trim() : '';
    const roleRaw = typeof req.body.role === 'string' ? req.body.role.trim() : '';
    const hasCatApiBase = !!(req.body && Object.prototype.hasOwnProperty.call(req.body, 'catApiBase'));
    const hasCatProxy = !!(req.body && Object.prototype.hasOwnProperty.call(req.body, 'catProxy'));
    const catApiBase = hasCatApiBase && typeof req.body.catApiBase === 'string' ? req.body.catApiBase.trim() : '';
    const catProxy = hasCatProxy && typeof req.body.catProxy === 'string' ? req.body.catProxy.trim() : '';
    if (!username) {
      return res.status(400).json({ success: false, message: '用户名不能为空' });
    }
    if (!newUsername && !newPassword && !roleRaw && !hasCatApiBase && !hasCatProxy) {
      return res.status(400).json({ success: false, message: '未提供修改内容' });
    }

    const db = getDb();
    const idRow = db.prepare('SELECT id FROM users WHERE username = ? LIMIT 1').get(username);
    if (!idRow) {
      return res.status(400).json({ success: false, message: '用户不存在' });
    }

    const id = idRow.id;
    const currentRow = db.prepare('SELECT username, role FROM users WHERE id = ? LIMIT 1').get(id);
    if (!currentRow) {
      return res.status(400).json({ success: false, message: '用户不存在' });
    }

    let finalUsername = currentRow.username;
    let finalRole = currentRow.role || 'user';
    if (newUsername && newUsername !== finalUsername) {
      try {
        const changed = db.prepare('UPDATE users SET username = ? WHERE id = ?').run(newUsername, id);
        if (!changed || changed.changes <= 0) {
          return res.status(400).json({ success: false, message: '修改失败' });
        }
        finalUsername = newUsername;
      } catch (e) {
        return res.status(400).json({ success: false, message: '用户名已存在或不合法' });
      }
    }

    if (newPassword) {
      const hashed = bcrypt.hashSync(newPassword, 10);
      const changed = db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, id);
      if (!changed || changed.changes <= 0) {
        return res.status(400).json({ success: false, message: '修改失败' });
      }
    }

    if (roleRaw) {
      if (finalRole === 'admin') {
        return res.status(400).json({ success: false, message: '管理员角色不可修改' });
      }
      const nextRole = roleRaw === 'shared' ? 'shared' : roleRaw === 'user' ? 'user' : '';
      if (!nextRole) return res.status(400).json({ success: false, message: '角色无效' });
      const changed = db.prepare('UPDATE users SET role = ? WHERE id = ?').run(nextRole, id);
      if (!changed || changed.changes <= 0) {
        return res.status(400).json({ success: false, message: '修改失败' });
      }
      finalRole = nextRole;
    }

    if (hasCatApiBase) {
      db.prepare('UPDATE users SET cat_api_base = ? WHERE id = ?').run(catApiBase, id);
    }
    if (hasCatProxy) {
      db.prepare('UPDATE users SET cat_proxy = ? WHERE id = ?').run(catProxy, id);
    }

    const row = db
      .prepare('SELECT role, cat_api_base, cat_proxy FROM users WHERE id = ? LIMIT 1')
      .get(id);
    return res.json({
      success: true,
      username: finalUsername,
      role: (row && row.role) || finalRole || 'user',
      catApiBase: (row && row.cat_api_base) || '',
      catProxy: (row && row.cat_proxy) || '',
    });
  });

  return router;
}

module.exports = { createDashboardRouter };
