const express = require('express');
const bcrypt = require('bcryptjs');
const { URL } = require('url');

const { getDb, getSetting, getSettingsVersion } = require('../lib/db');
const { issueTokenForUsername, writeCookie, deleteToken, clearCookie, readCookie } = require('../lib/auth');
const { safeParseJsonObject, safeParseJsonArray } = require('../lib/json');
const { normalizeCatPawOpenApiBase } = require('../lib/catpaw');
const { requestBufferWithRedirects } = require('../lib/httpClient');

function normalizeHttpBase(value) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
    u.search = '';
    u.hash = '';
    return u.toString().replace(/\/+$/g, '');
  } catch (_e) {
    return '';
  }
}

function normalizeGoProxyServers(value) {
  const list = Array.isArray(value) ? value : safeParseJsonArray(value);
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

function rewriteCatPawOpenProxyUrlToConfiguredBase(urlString, apiBase, tvUser) {
  const normalized = normalizeCatPawOpenApiBase(apiBase);
  if (!normalized) return '';
  const raw = typeof urlString === 'string' ? urlString.trim() : '';
  if (!raw) return '';

  const isAbsoluteHttp = /^https?:\/\//i.test(raw);
  const cacheBust = () => String(Date.now());
  const safeUser = typeof tvUser === 'string' ? tvUser.trim() : '';

  // Relative path: resolve against configured base (preserve any base path prefix).
  if (!isAbsoluteHttp) {
    try {
      const next = new URL(raw.replace(/^\//, ''), normalized);
      if (String(next.pathname || '').toLowerCase().endsWith('.bin')) next.searchParams.set('__tvts', cacheBust());
      if (safeUser && !next.searchParams.has('__tvuser')) next.searchParams.set('__tvuser', safeUser);
      return next.toString();
    } catch (_e) {
      return '';
    }
  }

  // Absolute URL: drop origin, keep path+search+hash, then resolve against configured base.
  try {
    const u = new URL(raw);
    const next = new URL(String(u.pathname || '/').replace(/^\//, ''), normalized);
    next.search = u.search || '';
    next.hash = u.hash || '';
    if (String(next.pathname || '').toLowerCase().endsWith('.bin')) next.searchParams.set('__tvts', cacheBust());
    if (safeUser && !next.searchParams.has('__tvuser')) next.searchParams.set('__tvuser', safeUser);
    return next.toString();
  } catch (_e) {
    return '';
  }
}

function rewriteCatPawOpenPlayPayloadUrls(payload, apiBase, tvUser) {
  if (!payload || typeof payload !== 'object') return payload;
  const out = { ...payload };

  const rewrite = (u) => rewriteCatPawOpenProxyUrlToConfiguredBase(u, apiBase, tvUser) || u;

  if (Array.isArray(out.url) && out.url.length) {
    const next = out.url.slice();
    for (let i = 1; i < next.length; i += 2) {
      if (typeof next[i] !== 'string') continue;
      next[i] = rewrite(next[i]);
    }
    out.url = next;
  } else if (typeof out.url === 'string' && out.url) {
    out.url = rewrite(out.url);
  }

  if (out.extra && typeof out.extra === 'object') {
    const extra = { ...out.extra };
    if (typeof extra.subt === 'string' && extra.subt.trim()) extra.subt = rewrite(extra.subt);
    out.extra = extra;
  }

  // Do not leak pan cookies/UA to browser; CatPawOpen proxy should handle upstream auth itself.
  out.header = {};
  return out;
}

function extractVideoSitesFromFullConfig(fullConfig) {
  const sites = fullConfig && fullConfig.video ? fullConfig.video.sites : null;
  if (!Array.isArray(sites)) return [];
  return sites
    .map((s) => ({
      key: s && typeof s.key === 'string' ? s.key : '',
      name: s && typeof s.name === 'string' ? s.name : '',
      api: s && typeof s.api === 'string' ? s.api : '',
    }))
    .filter((s) => s.key && s.api);
}

function normalizeVideoSourceSitesFromSettings(rawSites) {
  const list = Array.isArray(rawSites) ? rawSites : [];
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
}

function extractSpiderNameFromApi(api) {
  const raw = typeof api === 'string' ? api.trim() : '';
  if (!raw) return '';
  const m = raw.match(/\/spider\/([^/]+)\//);
  return m && m[1] ? String(m[1]) : '';
}

function getDefaultHomeForSite(site) {
  const name = extractSpiderNameFromApi(site && site.api);
  if (name === 'baseset') return false;
  return true;
}

function applySiteOrder(sites, order) {
  const list = Array.isArray(sites) ? sites : [];
  const o = Array.isArray(order) ? order : [];
  if (!o.length) return list;
  const index = new Map();
  for (let i = 0; i < o.length; i += 1) index.set(o[i], i);
  const decorated = list.map((s, i) => ({
    s,
    i,
    o: index.has(s && s.key) ? index.get(s && s.key) : 1e9,
  }));
  decorated.sort((a, b) => (a.o - b.o) || (a.i - b.i));
  return decorated.map((d) => d.s);
}

function readUserCatSitesRow(db, userId) {
  const row = db
    .prepare('SELECT cat_sites, cat_site_status, cat_site_home, cat_site_order, cat_site_availability FROM users WHERE id = ? LIMIT 1')
    .get(userId);
  return (
    row || {
      cat_sites: '[]',
      cat_site_status: '{}',
      cat_site_home: '{}',
      cat_site_order: '[]',
      cat_site_availability: '{}',
    }
  );
}

function normalizeUserCatSites(rawSites) {
  return normalizeVideoSourceSitesFromSettings(Array.isArray(rawSites) ? rawSites : []);
}

function mergeUserCatSiteState(sites, statusMap, homeMap, order) {
  const ordered = applySiteOrder(sites, order);
  return ordered.map((s) => {
    const key = s && typeof s.key === 'string' ? s.key : '';
    const enabled = key && Object.prototype.hasOwnProperty.call(statusMap, key) ? !!statusMap[key] : true;
    const home = key && Object.prototype.hasOwnProperty.call(homeMap, key) ? !!homeMap[key] : getDefaultHomeForSite(s);
    return { ...s, enabled, home };
  });
}

function normalizeAvailability(v) {
  const raw = typeof v === 'string' ? v.trim() : '';
  if (raw === 'valid' || raw === 'invalid' || raw === 'unknown' || raw === 'unchecked') return raw;
  return 'unchecked';
}

function mergeUserCatSiteStateWithAvailability(sites, statusMap, homeMap, order, availabilityMap) {
  const merged = mergeUserCatSiteState(sites, statusMap, homeMap, order);
  const avail = availabilityMap && typeof availabilityMap === 'object' && !Array.isArray(availabilityMap) ? availabilityMap : {};
  return merged.map((s) => {
    const key = s && typeof s.key === 'string' ? s.key : '';
    const availability =
      key && Object.prototype.hasOwnProperty.call(avail, key) ? normalizeAvailability(avail[key]) : 'unchecked';
    return { ...s, availability };
  });
}

function unwrapCatPawOpenWebsiteData(resp) {
  if (resp && typeof resp === 'object' && Object.prototype.hasOwnProperty.call(resp, 'code')) {
    const code = resp.code;
    if (code === 0) return resp.data;
    throw new Error((resp && resp.message) || 'CatPawOpen 网站接口返回异常');
  }
  return resp;
}

function reconcileUserCatSites(prevStore, nextSitesInNewOrder) {
  const prevSites = normalizeUserCatSites(safeParseJsonArray(prevStore && prevStore.cat_sites));
  const prevStatus = safeParseJsonObject(prevStore && prevStore.cat_site_status);
  const prevHome = safeParseJsonObject(prevStore && prevStore.cat_site_home);
  const prevOrder = safeParseJsonArray(prevStore && prevStore.cat_site_order);
  const prevAvailability = safeParseJsonObject(prevStore && prevStore.cat_site_availability);

  const normalizedNew = normalizeUserCatSites(nextSitesInNewOrder);
  const newKeySet = new Set(normalizedNew.map((s) => s.key));
  const keysInNewOrder = normalizedNew.map((s) => s.key);

  const nextStatus = {};
  const nextHome = {};
  const nextAvailability = {};

  // Preserve old state for existing keys
  Object.keys(prevStatus).forEach((k) => {
    const key = typeof k === 'string' ? k.trim() : '';
    if (!key || !newKeySet.has(key)) return;
    nextStatus[key] = !!prevStatus[key];
  });
  Object.keys(prevHome).forEach((k) => {
    const key = typeof k === 'string' ? k.trim() : '';
    if (!key || !newKeySet.has(key)) return;
    nextHome[key] = !!prevHome[key];
  });
  Object.keys(prevAvailability).forEach((k) => {
    const key = typeof k === 'string' ? k.trim() : '';
    if (!key || !newKeySet.has(key)) return;
    nextAvailability[key] = normalizeAvailability(prevAvailability[key]);
  });

  // Default state for new keys
  normalizedNew.forEach((s) => {
    const key = s && typeof s.key === 'string' ? s.key : '';
    if (!key) return;
    if (!Object.prototype.hasOwnProperty.call(nextStatus, key)) nextStatus[key] = true;
    if (!Object.prototype.hasOwnProperty.call(nextHome, key)) nextHome[key] = getDefaultHomeForSite(s);
    if (!Object.prototype.hasOwnProperty.call(nextAvailability, key)) nextAvailability[key] = 'unchecked';
  });

  // Preserve old order for existing keys; insert new keys based on the new JS order.
  const prevOrderFiltered = prevOrder.filter((k) => typeof k === 'string' && newKeySet.has(k));
  const nextOrder = [];
  const seenOrder = new Set();
  prevOrderFiltered.forEach((k) => {
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

  return {
    sites: normalizedNew,
    status: nextStatus,
    home: nextHome,
    order: nextOrder,
    availability: nextAvailability,
  };
}

function getSettingValue(_db, key) {
  return getSetting(key);
}

const BOOTSTRAP_CACHE = new Map();
const USER_VERSION = new Map();
const BOOTSTRAP_CACHE_MAX = 200;
const BOOTSTRAP_CACHE_MAX_AGE_MS = 10 * 1000;

function bumpUserVersion(userId) {
  const id = Number(userId);
  if (!Number.isFinite(id) || id <= 0) return;
  const next = (USER_VERSION.get(id) || 0) + 1;
  USER_VERSION.set(id, next);
}

function getUserVersion(userId) {
  const id = Number(userId);
  if (!Number.isFinite(id) || id <= 0) return 0;
  return USER_VERSION.get(id) || 0;
}

function pruneBootstrapCache(now) {
  for (const [key, entry] of BOOTSTRAP_CACHE.entries()) {
    if (!entry || !entry.t || now - entry.t > BOOTSTRAP_CACHE_MAX_AGE_MS) {
      BOOTSTRAP_CACHE.delete(key);
    }
  }
  const overflow = BOOTSTRAP_CACHE.size - BOOTSTRAP_CACHE_MAX;
  if (overflow <= 0) return;
  let removed = 0;
  for (const key of BOOTSTRAP_CACHE.keys()) {
    BOOTSTRAP_CACHE.delete(key);
    removed += 1;
    if (removed >= overflow) break;
  }
}

function cacheGetOrCreate(key, ttlMs, createPromise) {
  const now = Date.now();
  const entry = BOOTSTRAP_CACHE.get(key);
  if (entry && entry.t && now - entry.t < ttlMs && entry.p) return entry.p;
  const p = Promise.resolve().then(createPromise);
  BOOTSTRAP_CACHE.set(key, { t: now, p });
  pruneBootstrapCache(now);
  p.catch(() => {
    const cur = BOOTSTRAP_CACHE.get(key);
    if (cur && cur.p === p) BOOTSTRAP_CACHE.delete(key);
  });
  return p;
}

function parseBoolQuery(v, def) {
  if (v == null) return !!def;
  const s = String(v).trim().toLowerCase();
  if (s === '') return !!def;
  if (s === '1' || s === 'true' || s === 'yes' || s === 'on') return true;
  if (s === '0' || s === 'false' || s === 'no' || s === 'off') return false;
  return !!def;
}

function parseIntQuery(v, def, min, max) {
  const s = typeof v === 'string' ? v.trim() : '';
  const n = s ? Number.parseInt(s, 10) : NaN;
  if (!Number.isFinite(n)) return def;
  const x = Math.floor(n);
  return Math.min(max, Math.max(min, x));
}

function persistUserCatSitesRow(db, userId, prevStore, reconciled) {
  const store = prevStore && typeof prevStore === 'object' ? prevStore : {};
  const nextSites = JSON.stringify(reconciled.sites || []);
  const nextStatus = JSON.stringify(reconciled.status || {});
  const nextHome = JSON.stringify(reconciled.home || {});
  const nextOrder = JSON.stringify(reconciled.order || []);
  const nextAvailability = JSON.stringify(reconciled.availability || {});

  const prevSites = typeof store.cat_sites === 'string' ? store.cat_sites : '';
  const prevStatus = typeof store.cat_site_status === 'string' ? store.cat_site_status : '';
  const prevHome = typeof store.cat_site_home === 'string' ? store.cat_site_home : '';
  const prevOrder = typeof store.cat_site_order === 'string' ? store.cat_site_order : '';
  const prevAvailability = typeof store.cat_site_availability === 'string' ? store.cat_site_availability : '';

  const changed =
    prevSites !== nextSites ||
    prevStatus !== nextStatus ||
    prevHome !== nextHome ||
    prevOrder !== nextOrder ||
    prevAvailability !== nextAvailability;

  if (!changed) return false;

  db.prepare(
    'UPDATE users SET cat_sites = ?, cat_site_status = ?, cat_site_home = ?, cat_site_order = ?, cat_site_availability = ? WHERE id = ?'
  ).run(nextSites, nextStatus, nextHome, nextOrder, nextAvailability, userId);
  bumpUserVersion(userId);
  return true;
}

function getGlobalVideoSitesFromSettings(db) {
  const raw = safeParseJsonArray(getSettingValue(db, 'video_source_sites') || '[]');
  return normalizeVideoSourceSitesFromSettings(raw);
}

async function fetchHomeSites(db) {
  const get = (key) => getSettingValue(db, key);

  // Prefer the stored list from TV_Server (saved when admin saves video source).
  // This avoids requiring TV_Server to resolve/reach CatPawOpen at runtime.
  const storedSites = normalizeVideoSourceSitesFromSettings(safeParseJsonArray(get('video_source_sites') || '[]'));
  let sites = storedSites;
  // IMPORTANT: TV_Server must not request CatPawOpen; clients should fetch and then import into DB.
  if (!sites.length) return [];

  const statusMap = safeParseJsonObject(get('video_source_site_status') || '{}');
  const homeMap = safeParseJsonObject(get('video_source_site_home') || '{}');
  const order = safeParseJsonArray(get('video_source_site_order') || '[]');

  const ordered = applySiteOrder(sites, order);
  const merged = ordered.map((s) => {
    const key = s && typeof s.key === 'string' ? s.key : '';
    const enabled =
      key && Object.prototype.hasOwnProperty.call(statusMap, key) ? !!statusMap[key] : true;
    const home =
      key && Object.prototype.hasOwnProperty.call(homeMap, key) ? !!homeMap[key] : getDefaultHomeForSite(s);
    return { ...s, enabled, home };
  });

  return merged.filter((s) => s && s.enabled && s.home).map((s) => ({ key: s.key, name: s.name, api: s.api }));
}

async function fetchUserHomeSites(db, user) {
  const userId = user && typeof user.userId === 'number' ? user.userId : null;
  if (!userId) return [];

  const role = user && typeof user.role === 'string' ? user.role : '';

  const userRow = db.prepare('SELECT cat_api_base FROM users WHERE id = ? LIMIT 1').get(userId);
  const userApiBase = userRow && userRow.cat_api_base ? String(userRow.cat_api_base) : '';
  const hasUserApiBase = !!(userApiBase && userApiBase.trim());

  // Normal users must configure their own CatPawOpen, otherwise treat as "no sites".
  if (role === 'user' && !hasUserApiBase) return [];

  // Shared/admin users without their own CatPawOpen: use TV_Server (global) home sites directly.
  if (!hasUserApiBase && (role === 'shared' || role === 'admin')) {
    try {
      return await fetchHomeSites(db);
    } catch (_e) {
      return [];
    }
  }

  const store = readUserCatSitesRow(db, userId);
  let sites;
  let statusMap = safeParseJsonObject(store.cat_site_status);
  let homeMap = safeParseJsonObject(store.cat_site_home);
  let order = safeParseJsonArray(store.cat_site_order);

  if (hasUserApiBase) {
    sites = normalizeUserCatSites(safeParseJsonArray(store.cat_sites));
  } else {
    // Shared/admin fallback: use global configured list, but keep per-user enable/home/order.
    sites = getGlobalVideoSitesFromSettings(db);
    const reconciled = reconcileUserCatSites(store, sites);
    sites = reconciled.sites;
    statusMap = reconciled.status;
    homeMap = reconciled.home;
    order = reconciled.order;
    try {
      persistUserCatSitesRow(db, userId, store, reconciled);
    } catch (_e) {
      // ignore
    }
  }

  const merged = mergeUserCatSiteState(sites, statusMap, homeMap, order);
  return merged
    .filter((s) => s && s.enabled && s.home)
    .map((s) => ({ key: s.key, name: s.name, api: s.api }));
}

function isAllowedDoubanImageHost(hostname) {
  const host = typeof hostname === 'string' ? hostname.toLowerCase() : '';
  if (!host) return false;
  if (/^img\d+\.doubanio\.com$/.test(host)) return true;
  if (host === 'img3.doubanio.com') return true;
  if (host === 'img.doubanio.cmliussss.net') return true;
  if (host === 'img.doubanio.cmliussss.com') return true;
  return false;
}

function createApiRouter() {
  const router = express.Router();

  const catPawHeadersFromReq = (req) => {
    const username = req && req.user && typeof req.user.username === 'string' ? req.user.username.trim() : '';
    return username ? { 'X-TV-User': username } : {};
  };

  const requireAuth = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.status !== 'active') {
      return res.status(403).json({ error: '该账户已禁用' });
    }
    next();
  };

  // Home bundle: reduce first-screen request fan-out.
  router.get('/home', requireAuth, async (req, res) => {
    const q = (req && req.query) || {};
    const includePlayHistory = parseBoolQuery(q.includePlayHistory, true);
    const includeFavorites = parseBoolQuery(q.includeFavorites, true);
    const includePanLoginSettings = parseBoolQuery(q.includePanLoginSettings, true);
    const playHistoryLimit = parseIntQuery(q.playHistoryLimit, 20, 1, 50);
    const favoritesLimit = parseIntQuery(q.favoritesLimit, 50, 1, 200);

    const userId = req.user.userId;
    const cacheKey = `home|${userId}|${req.user.role}|${includePlayHistory ? 1 : 0}|${playHistoryLimit}|${
      includeFavorites ? 1 : 0
    }|${favoritesLimit}|${includePanLoginSettings ? 1 : 0}|${getSettingsVersion()}|${getUserVersion(userId)}`;

    try {
      const out = await cacheGetOrCreate(cacheKey, 2000, () => {
        const data = { success: true };
        const db = getDb();

        if (includePlayHistory) {
          const normalizeContentKey = (s) =>
            String(s || '')
              .toLowerCase()
              .replace(/\s+/g, '')
              .trim();
          const sourceLimit = Math.min(500, Math.max(50, playHistoryLimit * 10));
          const rows = db
            .prepare(
              `
              SELECT
                content_key AS contentKey,
                site_key AS siteKey,
                site_name AS siteName,
                spider_api AS spiderApi,
                video_id AS videoId,
                video_title AS videoTitle,
                video_poster AS videoPoster,
                video_remark AS videoRemark,
                pan_label AS panLabel,
                play_flag AS playFlag,
                episode_index AS episodeIndex,
                episode_name AS episodeName,
                updated_at AS updatedAt
              FROM play_history
              WHERE user_id = ?
              ORDER BY updated_at DESC
              LIMIT ?
            `
            )
            .all(userId, sourceLimit);

          const list = Array.isArray(rows) ? rows : [];
          const seen = new Set();
          const playHistory = [];
          for (const r of list) {
            if (!r) continue;
            const ck = typeof r.contentKey === 'string' ? r.contentKey.trim() : '';
            const derived = ck ? '' : normalizeContentKey(r.videoTitle);
            const key = ck || derived || `${r.siteKey || ''}::${r.videoId || ''}`;
            if (!key || seen.has(key)) continue;
            seen.add(key);
            playHistory.push(derived ? { ...r, contentKey: derived } : r);
            if (playHistory.length >= playHistoryLimit) break;
          }
          data.playHistory = playHistory;
        }

        if (includeFavorites) {
          const rows = db
            .prepare(
              `
              SELECT
                site_key AS siteKey,
                site_name AS siteName,
                spider_api AS spiderApi,
                video_id AS videoId,
                video_title AS videoTitle,
                video_poster AS videoPoster,
                video_remark AS videoRemark,
                updated_at AS updatedAt
              FROM favorites
              WHERE user_id = ?
              ORDER BY updated_at DESC
              LIMIT ?
            `
            )
            .all(userId, favoritesLimit);
          data.favorites = Array.isArray(rows) ? rows : [];
        }

        if (includePanLoginSettings && req.user.role === 'shared') {
          const store = safeParseJsonObject(getSetting('pan_login_settings') || '{}');
          data.panLoginSettings = store;
        }

        return data;
      });
      return res.json(out);
    } catch (_e) {
      return res.status(500).json({ success: false, message: '请求失败' });
    }
  });

  router.get('/bootstrap', async (req, res) => {
    const db = getDb();
    const siteName = getSetting('site_name') || null;

    if (!req.user || req.user.status !== 'active') {
      return res.json({ authenticated: false, siteName });
    }

    const page = String(req.query.page || '').trim();
    const userId = req.user.userId;
    const cacheKey = `bootstrap|${userId}|${req.user.role}|${page}|${getSettingsVersion()}|${getUserVersion(userId)}`;

    const createResponse = async () => {
      const settings = {};

      if (['index', 'douban', 'play', 'site', 'dashboard'].includes(page)) {
        const get = (key) => getSetting(key);
        if (page !== 'dashboard') {
          settings.doubanDataProxy = get('douban_data_proxy') || 'direct';
          settings.doubanDataCustom = get('douban_data_custom') || '';
          settings.doubanImgProxy = get('douban_img_proxy') || 'direct-browser';
          settings.doubanImgCustom = get('douban_img_custom') || '';
          settings.videoSourceUrl = get('video_source_url') || '';
          settings.videoSourceApiBase = get('video_source_api_base') || '';
          settings.catPawOpenApiBase = get('catpawopen_api_base') || '';
          settings.goProxyEnabled = String(get('goproxy_enabled') || '') === '1';
          settings.goProxyAutoSelect = String(get('goproxy_auto_select') || '') === '1';
          settings.goProxyServers = normalizeGoProxyServers(get('goproxy_servers') || '[]');
          settings.magicEpisodeRules = safeParseJsonArray(get('magic_episode_rules') || '[]').filter(
            (v) => typeof v === 'string' && v.trim()
          );
          const cleanRules = safeParseJsonArray(get('magic_episode_clean_regex_rules') || '[]').filter(
            (v) => typeof v === 'string' && String(v).trim()
          );
          const legacyClean = (get('magic_episode_clean_regex') || '').trim();
          settings.magicEpisodeCleanRegexRules = cleanRules.length ? cleanRules : legacyClean ? [legacyClean] : [];
          settings.magicEpisodeCleanRegex = settings.magicEpisodeCleanRegexRules[0] || legacyClean || '';
          settings.magicAggregateRules = safeParseJsonArray(get('magic_aggregate_rules') || '[]').filter(
            (v) => typeof v === 'string' && v.trim()
          );
          settings.magicAggregateRegexRules = safeParseJsonArray(get('magic_aggregate_regex_rules') || '[]').filter(
            (v) => typeof v === 'string' && v.trim()
          );
          const userRow = db
            .prepare(
              'SELECT cat_api_base, cat_api_key, cat_proxy, search_thread_count, cat_search_order, cat_search_cover_site FROM users WHERE id = ? LIMIT 1'
            )
            .get(userId);
          settings.userCatPawOpenApiBase = (userRow && userRow.cat_api_base) || '';
          settings.userCatPawOpenApiKey = (userRow && userRow.cat_api_key) || '';
          settings.userCatPawOpenProxy = (userRow && userRow.cat_proxy) || '';
          const stRaw = userRow && userRow.search_thread_count != null ? Number(userRow.search_thread_count) : 5;
          settings.searchThreadCount = Number.isFinite(stRaw) && stRaw > 0 ? Math.floor(stRaw) : 5;
          if (req.user.role === 'user') {
            settings.searchSiteOrder = safeParseJsonArray((userRow && userRow.cat_search_order) || '[]').filter(
              (v) => typeof v === 'string' && v.trim()
            );
            settings.searchCoverSite = (userRow && userRow.cat_search_cover_site)
              ? String(userRow.cat_search_cover_site)
              : '';
          } else {
            settings.searchSiteOrder = safeParseJsonArray(get('video_source_search_order') || '[]').filter(
              (v) => typeof v === 'string' && v.trim()
            );
            settings.searchCoverSite = get('video_source_search_cover_site') || '';
          }
        } else if (req.user.role === 'admin') {
          // Dashboard uses lazy-loading for admin panels; don't include per-panel settings here.
        }
      }

      let users = [];
      let userCount;
      if (page === 'dashboard' && req.user.role === 'admin') {
        const row = db.prepare('SELECT COUNT(1) AS cnt FROM users').get();
        userCount = row && typeof row.cnt === 'number' ? row.cnt : 0;
      }

      let homeSites = null;
      if (page === 'index' || page === 'douban' || page === 'play' || page === 'site') {
        try {
          homeSites = await fetchUserHomeSites(db, req.user);
        } catch (_e) {
          homeSites = [];
        }
      }

      const outSettings = Object.assign({}, settings);
      if (Array.isArray(homeSites)) outSettings.homeSites = homeSites;
      return {
        authenticated: true,
        siteName,
        user: { username: req.user.username, role: req.user.role },
        settings: outSettings,
        users,
        userCount,
      };
    };

    try {
      const payload = await cacheGetOrCreate(cacheKey, 1500, createResponse);
      return res.json(payload);
    } catch (_e) {
      try {
        const payload = await createResponse();
        return res.json(payload);
      } catch (_e2) {
        return res.json({
          authenticated: true,
          siteName,
          user: { username: req.user.username, role: req.user.role },
          settings: {},
          users: [],
        });
      }
    }
  });

  router.get('/video/sites', requireAuth, (req, res) => {
    const get = (key) => getSetting(key);

    const sites = normalizeVideoSourceSitesFromSettings(safeParseJsonArray(get('video_source_sites') || '[]'));
    const statusMap = safeParseJsonObject(get('video_source_site_status') || '{}');
    const homeMap = safeParseJsonObject(get('video_source_site_home') || '{}');
    const order = safeParseJsonArray(get('video_source_site_order') || '[]');

    const ordered = applySiteOrder(sites, order);
    const merged = ordered.map((s) => {
      const key = s && typeof s.key === 'string' ? s.key : '';
      const enabled =
        key && Object.prototype.hasOwnProperty.call(statusMap, key) ? !!statusMap[key] : true;
      const home =
        key && Object.prototype.hasOwnProperty.call(homeMap, key) ? !!homeMap[key] : getDefaultHomeForSite(s);
      return { ...s, enabled, home };
    });

    return res.json({ success: true, sites: merged });
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    const u = typeof username === 'string' ? username.trim() : '';
    const p = typeof password === 'string' ? password : '';
    if (!u || !p) {
      return res.status(400).json({ success: false, message: '用户名与密码不能为空' });
    }

    const db = getDb();
    const row = db
      .prepare('SELECT password, role, status FROM users WHERE username = ? LIMIT 1')
      .get(u);
    if (!row) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    if (row.status !== 'active') {
      return res.status(403).json({ success: false, message: '该账户已禁用' });
    }
    const stored = row.password || '';
    const ok = stored.startsWith('$2') && bcrypt.compareSync(p, stored);
    if (!ok) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const token = issueTokenForUsername(u);
    if (token) {
      writeCookie(res, token);
    }
    return res.json({ success: true });
  });

  router.get('/logout', (req, res) => {
    const token = readCookie(req);
    if (token) deleteToken(token);
    clearCookie(res);
    return res.redirect('/');
  });

  router.get('/searchhistory', requireAuth, (req, res) => {
    const db = getDb();
    const rows = db
      .prepare('SELECT keyword FROM search_history WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20')
      .all(req.user.userId);
    const list = Array.isArray(rows) ? rows.map((r) => r.keyword).filter(Boolean) : [];
    return res.json(list);
  });

  router.post('/searchhistory', requireAuth, (req, res) => {
    const keyword =
      typeof (req.body && req.body.keyword) === 'string'
        ? req.body.keyword.trim().replace(/\s+/g, ' ')
        : '';
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }
    const db = getDb();
    db.prepare(
      `
      INSERT INTO search_history(user_id, keyword, updated_at)
      VALUES (?, ?, strftime('%s','now'))
      ON CONFLICT(user_id, keyword) DO UPDATE SET updated_at = excluded.updated_at
    `
    ).run(req.user.userId, keyword);
    const rows = db
      .prepare('SELECT keyword FROM search_history WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20')
      .all(req.user.userId);
    const list = Array.isArray(rows) ? rows.map((r) => r.keyword).filter(Boolean) : [];
    return res.json(list);
  });

	  router.delete('/searchhistory', requireAuth, (req, res) => {
	    const db = getDb();
	    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
	    if (keyword) {
	      db.prepare('DELETE FROM search_history WHERE user_id = ? AND keyword = ?').run(
	        req.user.userId,
	        keyword
	      );
	    } else {
	      db.prepare('DELETE FROM search_history WHERE user_id = ?').run(req.user.userId);
	    }
	    const rows = db
	      .prepare('SELECT keyword FROM search_history WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20')
	      .all(req.user.userId);
	    const list = Array.isArray(rows) ? rows.map((r) => r.keyword).filter(Boolean) : [];
	    return res.json(list);
	  });

	  router.get('/playhistory/one', requireAuth, (req, res) => {
	    const siteKey = typeof req.query.siteKey === 'string' ? req.query.siteKey.trim() : '';
	    const videoId = typeof req.query.videoId === 'string' ? req.query.videoId.trim() : '';
	    if (!siteKey || !videoId) return res.status(400).json({ error: 'Invalid params' });

	    const db = getDb();
	    const row = db
	      .prepare(
	        `
	        SELECT
	          content_key AS contentKey,
	          site_key AS siteKey,
	          site_name AS siteName,
	          spider_api AS spiderApi,
	          video_id AS videoId,
	          video_title AS videoTitle,
	          video_poster AS videoPoster,
	          video_remark AS videoRemark,
	          pan_label AS panLabel,
	          play_flag AS playFlag,
	          episode_index AS episodeIndex,
	          episode_name AS episodeName,
	          updated_at AS updatedAt
	        FROM play_history
	        WHERE user_id = ? AND site_key = ? AND video_id = ?
	        ORDER BY updated_at DESC
	        LIMIT 1
	      `
	      )
	      .get(req.user.userId, siteKey, videoId);

	    if (!row) return res.json(null);

	    const normalizeContentKey = (s) =>
	      String(s || '')
	        .toLowerCase()
	        .replace(/\s+/g, '')
	        .trim();
	    const ck = typeof row.contentKey === 'string' ? row.contentKey.trim() : '';
	    const derived = ck ? '' : normalizeContentKey(row.videoTitle);
	    return res.json(derived ? { ...row, contentKey: derived } : row);
	  });

	  router.get('/playhistory', requireAuth, (req, res) => {
	    const limitRaw = typeof req.query.limit === 'string' ? req.query.limit.trim() : '';
	    const limitNum = limitRaw ? Number.parseInt(limitRaw, 10) : NaN;
	    const limit = Number.isFinite(limitNum) ? Math.min(50, Math.max(1, limitNum)) : 20;
	    const sourceLimit = Math.min(500, Math.max(50, limit * 10));
	    const db = getDb();
	    const normalizeContentKey = (s) =>
	      String(s || '')
	        .toLowerCase()
	        .replace(/\s+/g, '')
	        .trim();
	    const rows = db
	      .prepare(
	        `
	        SELECT
	          content_key AS contentKey,
	          site_key AS siteKey,
	          site_name AS siteName,
	          spider_api AS spiderApi,
	          video_id AS videoId,
	          video_title AS videoTitle,
	          video_poster AS videoPoster,
	          video_remark AS videoRemark,
	          pan_label AS panLabel,
	          play_flag AS playFlag,
	          episode_index AS episodeIndex,
	          episode_name AS episodeName,
	          updated_at AS updatedAt
	        FROM play_history
	        WHERE user_id = ?
	        ORDER BY updated_at DESC
	        LIMIT ?
      `
      )
      .all(req.user.userId, sourceLimit);

	    const list = Array.isArray(rows) ? rows : [];
	    const seen = new Set();
	    const out = [];
	    for (const r of list) {
	      if (!r) continue;
	      const ck = typeof r.contentKey === 'string' ? r.contentKey.trim() : '';
	      const derived = ck ? '' : normalizeContentKey(r.videoTitle);
	      const key = ck || derived || `${r.siteKey || ''}::${r.videoId || ''}`;
	      if (!key || seen.has(key)) continue;
	      seen.add(key);
	      out.push(derived ? { ...r, contentKey: derived } : r);
	      if (out.length >= limit) break;
	    }
	    return res.json(out);
	  });

		  router.post('/playhistory', requireAuth, (req, res) => {
		    const body = req.body && typeof req.body === 'object' ? req.body : {};
		    const siteKey = typeof body.siteKey === 'string' ? body.siteKey.trim() : '';
		    const siteName = typeof body.siteName === 'string' ? body.siteName.trim() : '';
		    const spiderApi = typeof body.spiderApi === 'string' ? body.spiderApi.trim() : '';
		    const videoId = typeof body.videoId === 'string' ? body.videoId.trim() : '';
		    const videoTitle = typeof body.videoTitle === 'string' ? body.videoTitle.trim() : '';
		    const videoPoster = typeof body.videoPoster === 'string' ? body.videoPoster.trim() : '';
		    const videoRemark = typeof body.videoRemark === 'string' ? body.videoRemark.trim() : '';
		    const panLabel = typeof body.panLabel === 'string' ? body.panLabel.trim() : '';
		    const playFlag = typeof body.playFlag === 'string' ? body.playFlag.trim() : '';
		    const episodeName = typeof body.episodeName === 'string' ? body.episodeName.trim() : '';
		    const episodeIndexRaw = body.episodeIndex != null ? Number(body.episodeIndex) : 0;
		    const episodeIndex =
		      Number.isFinite(episodeIndexRaw) && episodeIndexRaw >= 0 ? Math.floor(episodeIndexRaw) : 0;
		    const forcePosterUpdate = !!body.forcePosterUpdate;

    if (!siteKey || !spiderApi || !videoId || !videoTitle) {
      return res.status(400).json({ success: false, message: '参数不完整' });
    }

	    const normalizeContentKey = (s) =>
	      String(s || '')
	        .toLowerCase()
	        .replace(/\s+/g, '')
	        .trim();
		    const contentKey = normalizeContentKey(videoTitle) || `${siteKey}::${videoId}`;

	    const db = getDb();
		    const userId = req.user.userId;
		    let lockedPoster = '';
		    try {
	      const row = db
	        .prepare(
	          `
	          SELECT video_poster AS videoPoster
	          FROM play_history
	          WHERE user_id = ? AND content_key = ? AND video_poster <> ''
	          ORDER BY updated_at DESC
	          LIMIT 1
	        `
	        )
	        .get(userId, contentKey);
	      lockedPoster = row && typeof row.videoPoster === 'string' ? row.videoPoster.trim() : '';
	    } catch (_e) {
	      lockedPoster = '';
	    }
		    const finalPoster =
		      forcePosterUpdate && videoPoster ? videoPoster : lockedPoster ? lockedPoster : videoPoster;
		    // Keep only one record per content (videoTitle) per user: always the latest played site.
		    try {
		      db.prepare(
		        `
		        DELETE FROM play_history
		        WHERE user_id = ? AND (content_key = ? OR video_title = ?)
		      `
		      ).run(userId, contentKey, videoTitle);
		    } catch (_e) {
		      // ignore
		    }
		    db.prepare(
		      `
	      INSERT INTO play_history(
	        user_id,
	        content_key,
	        site_key,
	        site_name,
	        spider_api,
	        video_id,
	        video_title,
	        video_poster,
	        video_remark,
	        pan_label,
	        play_flag,
	        episode_index,
	        episode_name,
	        updated_at
	      )
	      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,strftime('%s','now'))
	      ON CONFLICT(user_id, site_key, video_id) DO UPDATE SET
	        content_key = excluded.content_key,
	        site_name = excluded.site_name,
	        spider_api = excluded.spider_api,
	        video_title = excluded.video_title,
	        video_poster = excluded.video_poster,
	        video_remark = excluded.video_remark,
	        pan_label = excluded.pan_label,
	        play_flag = excluded.play_flag,
	        episode_index = excluded.episode_index,
	        episode_name = excluded.episode_name,
	        updated_at = excluded.updated_at
	    `
	    ).run(
	      userId,
	      contentKey,
	      siteKey,
	      siteName,
	      spiderApi,
	      videoId,
	      videoTitle,
	      finalPoster,
	      videoRemark,
	      panLabel,
	      playFlag,
	      episodeIndex,
	      episodeName
	    );

    bumpUserVersion(userId);
    return res.json({ success: true });
  });

  router.get('/favorites', requireAuth, (req, res) => {
    const limitRaw = typeof req.query.limit === 'string' ? req.query.limit.trim() : '';
    const limitNum = limitRaw ? Number.parseInt(limitRaw, 10) : NaN;
    const limit = Number.isFinite(limitNum) ? Math.min(200, Math.max(1, limitNum)) : 200;
    const db = getDb();
    const rows = db
      .prepare(
        `
        SELECT
          site_key AS siteKey,
          site_name AS siteName,
          spider_api AS spiderApi,
          video_id AS videoId,
          video_title AS videoTitle,
          video_poster AS videoPoster,
          video_remark AS videoRemark,
          updated_at AS updatedAt
        FROM favorites
        WHERE user_id = ?
        ORDER BY updated_at DESC
        LIMIT ?
      `
      )
      .all(req.user.userId, limit);
    return res.json(Array.isArray(rows) ? rows : []);
  });

  router.get('/favorites/status', requireAuth, (req, res) => {
    const siteKey = typeof req.query.siteKey === 'string' ? req.query.siteKey.trim() : '';
    const videoId = typeof req.query.videoId === 'string' ? req.query.videoId.trim() : '';
    if (!siteKey || !videoId) return res.json({ favorited: false });
    const db = getDb();
    const row = db
      .prepare('SELECT 1 AS v FROM favorites WHERE user_id = ? AND site_key = ? AND video_id = ? LIMIT 1')
      .get(req.user.userId, siteKey, videoId);
    return res.json({ favorited: !!row });
  });

  router.post('/favorites/toggle', requireAuth, (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const siteKey = typeof body.siteKey === 'string' ? body.siteKey.trim() : '';
    const siteName = typeof body.siteName === 'string' ? body.siteName.trim() : '';
    const spiderApi = typeof body.spiderApi === 'string' ? body.spiderApi.trim() : '';
    const videoId = typeof body.videoId === 'string' ? body.videoId.trim() : '';
    const videoTitle = typeof body.videoTitle === 'string' ? body.videoTitle.trim() : '';
    const videoPoster = typeof body.videoPoster === 'string' ? body.videoPoster.trim() : '';
    const videoRemark = typeof body.videoRemark === 'string' ? body.videoRemark.trim() : '';
    if (!siteKey || !spiderApi || !videoId || !videoTitle) {
      return res.status(400).json({ success: false, message: '参数不完整' });
    }
    const db = getDb();
    const existed = db
      .prepare('SELECT id FROM favorites WHERE user_id = ? AND site_key = ? AND video_id = ? LIMIT 1')
      .get(req.user.userId, siteKey, videoId);
    if (existed && existed.id) {
      db.prepare('DELETE FROM favorites WHERE id = ? AND user_id = ?').run(existed.id, req.user.userId);
      bumpUserVersion(req.user.userId);
      return res.json({ success: true, favorited: false });
    }

    db.prepare(
      `
      INSERT INTO favorites(
        user_id,
        site_key,
        site_name,
        spider_api,
        video_id,
        video_title,
        video_poster,
        video_remark,
        updated_at
      )
      VALUES(?,?,?,?,?,?,?,?,strftime('%s','now'))
      ON CONFLICT(user_id, site_key, video_id) DO UPDATE SET
        site_name = excluded.site_name,
        spider_api = excluded.spider_api,
        video_title = excluded.video_title,
        video_poster = excluded.video_poster,
        video_remark = excluded.video_remark,
        updated_at = excluded.updated_at
    `
    ).run(
      req.user.userId,
      siteKey,
      siteName,
      spiderApi,
      videoId,
      videoTitle,
      videoPoster,
      videoRemark
    );
    bumpUserVersion(req.user.userId);
    return res.json({ success: true, favorited: true });
  });

  router.get('/user/settings', requireAuth, (req, res) => {
    const db = getDb();
    const row = db
      .prepare(
        'SELECT cat_api_base, cat_api_key, cat_proxy, search_thread_count, cat_search_order, cat_search_cover_site FROM users WHERE id = ? LIMIT 1'
      )
      .get(req.user.userId);
    const searchThreadCountRaw = row && row.search_thread_count != null ? Number(row.search_thread_count) : 5;
    const searchThreadCount = Number.isFinite(searchThreadCountRaw) && searchThreadCountRaw > 0
      ? Math.floor(searchThreadCountRaw)
      : 5;
    const searchOrder = safeParseJsonArray((row && row.cat_search_order) || '[]').filter(
      (v) => typeof v === 'string' && v.trim()
    );
    const searchCoverSite = row && row.cat_search_cover_site != null ? String(row.cat_search_cover_site) : '';
    return res.json({
      success: true,
      settings: {
        catApiBase: (row && row.cat_api_base) || '',
        catApiKey: (row && row.cat_api_key) || '',
        catProxy: (row && row.cat_proxy) || '',
        searchThreadCount,
        searchSiteOrder: searchOrder,
        searchCoverSite,
      },
    });
  });

  router.put('/user/settings', requireAuth, async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const db = getDb();
    const prev = db
      .prepare(
        'SELECT cat_api_base, cat_api_key, cat_proxy, search_thread_count, cat_search_order, cat_search_cover_site FROM users WHERE id = ? LIMIT 1'
      )
      .get(req.user.userId);

    const catApiBase =
      typeof body.catApiBase === 'string'
        ? body.catApiBase.trim()
        : typeof body.cat_api_base === 'string'
          ? body.cat_api_base.trim()
          : (prev && prev.cat_api_base) || '';

    const normalizedApiBase = catApiBase ? normalizeCatPawOpenApiBase(catApiBase) : '';
    if (catApiBase && !normalizedApiBase) {
      return res.status(400).json({ success: false, message: 'CatPawOpen 接口地址不是合法 URL' });
    }
    if (req.user.role === 'user' && !normalizedApiBase) {
      return res.status(400).json({ success: false, message: 'CatPawOpen 接口地址未设置' });
    }

    const catApiKey =
      typeof body.catApiKey === 'string'
        ? body.catApiKey
        : typeof body.cat_api_key === 'string'
          ? body.cat_api_key
          : (prev && prev.cat_api_key) || '';

    const catProxy =
      typeof body.catProxy === 'string'
        ? body.catProxy
        : typeof body.cat_proxy === 'string'
          ? body.cat_proxy
          : (prev && prev.cat_proxy) || '';

    const stRaw =
      body.searchThreadCount != null
        ? body.searchThreadCount
        : body.search_thread_count != null
          ? body.search_thread_count
          : prev && prev.search_thread_count != null
            ? prev.search_thread_count
            : 5;
    const stNum = Number(stRaw);
    const searchThreadCount = Number.isFinite(stNum) ? Math.floor(stNum) : NaN;
    if (!Number.isFinite(searchThreadCount) || searchThreadCount < 1 || searchThreadCount > 50) {
      return res.status(400).json({ success: false, message: '搜索线程数必须是 1-50 的整数' });
    }

    const readOrderInput = (v) => {
      if (Array.isArray(v)) return v;
      if (typeof v === 'string') return safeParseJsonArray(v);
      return null;
    };
    const searchOrderRaw =
      body.searchSiteOrder != null
        ? body.searchSiteOrder
        : body.search_site_order != null
          ? body.search_site_order
          : null;
    const searchCoverRaw =
      body.searchCoverSite != null
        ? body.searchCoverSite
        : body.search_cover_site != null
          ? body.search_cover_site
          : null;
    const providedSearchOrder = readOrderInput(searchOrderRaw);
    const providedSearchCover =
      typeof searchCoverRaw === 'string' ? searchCoverRaw.trim() : searchCoverRaw == null ? null : String(searchCoverRaw);

    const sitesSync = { ok: true, refreshed: false, count: 0 };
    const cookieSync = { ok: true, updated: 0 };
    let reconciledSitesForSearch = null;
    // Client should fetch full-config itself (so local-only domains work), then pass sites to server for reconcile+persist.
    if (normalizedApiBase && Array.isArray(body.sites)) {
      try {
        const provided = normalizeUserCatSites(body.sites);
        const prevStore = readUserCatSitesRow(db, req.user.userId);
        const reconciled = reconcileUserCatSites(prevStore, provided);
        reconciledSitesForSearch = reconciled.sites;
        const changed = persistUserCatSitesRow(db, req.user.userId, prevStore, reconciled);
        sitesSync.refreshed = !!changed;
        sitesSync.count = reconciled.sites.length;
      } catch (e) {
        sitesSync.ok = false;
        sitesSync.message = (e && e.message) || '站点列表更新失败';
      }
    }

    const resolveAvailableSearchKeys = () => {
      if (Array.isArray(reconciledSitesForSearch)) {
        return reconciledSitesForSearch.map((s) => (s && typeof s.key === 'string' ? s.key : '')).filter((k) => k);
      }
      const store = readUserCatSitesRow(db, req.user.userId);
      const userApiBaseRow = db.prepare('SELECT cat_api_base FROM users WHERE id = ? LIMIT 1').get(req.user.userId);
      const userApiBase = userApiBaseRow && userApiBaseRow.cat_api_base ? String(userApiBaseRow.cat_api_base) : '';
      const hasUserApiBase = !!(userApiBase && String(userApiBase).trim());
      const canFallbackToGlobal = req.user.role !== 'user';
      const sites = hasUserApiBase
        ? normalizeUserCatSites(safeParseJsonArray(store.cat_sites))
        : canFallbackToGlobal
          ? getGlobalVideoSitesFromSettings(db)
          : normalizeUserCatSites(safeParseJsonArray(store.cat_sites));
      return sites.map((s) => s.key);
    };

    const normalizeSearchOrder = (keys, currentOrder) => {
      const all = Array.isArray(keys) ? keys : [];
      const keySet = new Set(all);
      const next = [];
      const seen = new Set();
      const orderList = Array.isArray(currentOrder) ? currentOrder : [];
      orderList.forEach((k) => {
        const key = typeof k === 'string' ? k.trim() : '';
        if (!key || !keySet.has(key) || seen.has(key)) return;
        seen.add(key);
        next.push(key);
      });
      all.forEach((key) => {
        if (!key || seen.has(key)) return;
        seen.add(key);
        next.push(key);
      });
      return next;
    };

    const availableKeys = resolveAvailableSearchKeys();
    const prevSearchOrder = safeParseJsonArray((prev && prev.cat_search_order) || '[]');
    const nextSearchOrder = normalizeSearchOrder(
      availableKeys,
      Array.isArray(providedSearchOrder) ? providedSearchOrder : prevSearchOrder
    );
    const prevCover = prev && prev.cat_search_cover_site != null ? String(prev.cat_search_cover_site).trim() : '';
    const coverCandidate = providedSearchCover != null ? String(providedSearchCover).trim() : prevCover;
    const nextCover = coverCandidate && nextSearchOrder.includes(coverCandidate) ? coverCandidate : nextSearchOrder[0] || '';

    const prevApiBase = prev && prev.cat_api_base != null ? String(prev.cat_api_base) : '';
    const prevApiKey = prev && prev.cat_api_key != null ? String(prev.cat_api_key) : '';
    const prevProxy = prev && prev.cat_proxy != null ? String(prev.cat_proxy) : '';
    const prevThread = prev && prev.search_thread_count != null ? Number(prev.search_thread_count) : NaN;
    const prevOrderStr = prev && typeof prev.cat_search_order === 'string' ? prev.cat_search_order : JSON.stringify(prevSearchOrder);
    const prevCoverStr = prev && prev.cat_search_cover_site != null ? String(prev.cat_search_cover_site) : '';
    const nextOrderStr = JSON.stringify(nextSearchOrder);
    const nextCoverStr = String(nextCover || '');

    const settingsChanged =
      prevApiBase !== normalizedApiBase ||
      prevApiKey !== String(catApiKey || '') ||
      prevProxy !== String(catProxy || '') ||
      prevThread !== searchThreadCount ||
      prevOrderStr !== nextOrderStr ||
      prevCoverStr !== nextCoverStr;

    if (settingsChanged) {
      db.prepare(
        'UPDATE users SET cat_api_base = ?, cat_api_key = ?, cat_proxy = ?, search_thread_count = ?, cat_search_order = ?, cat_search_cover_site = ? WHERE id = ?'
      ).run(
        normalizedApiBase,
        String(catApiKey || ''),
        String(catProxy || ''),
        searchThreadCount,
        nextOrderStr,
        nextCoverStr,
        req.user.userId
      );
      if (!sitesSync.refreshed) bumpUserVersion(req.user.userId);
    }

    return res.json({ success: true, sitesSync, cookieSync });
  });

  router.get('/user/pan-login-settings', requireAuth, (req, res) => {
    if (req.user.role !== 'shared') {
      return res.status(403).json({ success: false, message: '无权限' });
    }
    const db = getDb();
    const store = safeParseJsonObject(getSettingValue(db, 'pan_login_settings') || '{}');
    return res.json({ success: true, settings: store });
  });

  router.get('/user/sites', requireAuth, (req, res) => {
    const db = getDb();
    const store = readUserCatSitesRow(db, req.user.userId);
    const userApiBaseRow = db.prepare('SELECT cat_api_base FROM users WHERE id = ? LIMIT 1').get(req.user.userId);
    const userApiBase = userApiBaseRow && userApiBaseRow.cat_api_base ? String(userApiBaseRow.cat_api_base) : '';
    const hasUserApiBase = !!(userApiBase && String(userApiBase).trim());

    // Normal users must provide their own CatPawOpen; do not fall back to server/global sites.
    const canFallbackToGlobal = req.user.role !== 'user';
    const sourceSites = hasUserApiBase
      ? normalizeUserCatSites(safeParseJsonArray(store.cat_sites))
      : canFallbackToGlobal
        ? getGlobalVideoSitesFromSettings(db)
        : [];
    const statusMap = safeParseJsonObject(store.cat_site_status);
    const homeMap = safeParseJsonObject(store.cat_site_home);
    const order = safeParseJsonArray(store.cat_site_order);
    const availabilityMap = safeParseJsonObject(store.cat_site_availability);

    // Reconcile (handle site add/remove) when using global list, so shared/admin users auto-adapt.
    if (!hasUserApiBase && canFallbackToGlobal) {
      const reconciled = reconcileUserCatSites(store, sourceSites);
      try {
        persistUserCatSitesRow(db, req.user.userId, store, reconciled);
        const merged = mergeUserCatSiteStateWithAvailability(
          reconciled.sites,
          reconciled.status,
          reconciled.home,
          reconciled.order,
          reconciled.availability
        );
        return res.json({ success: true, sites: merged });
      } catch (_e) {
        // fallthrough to best-effort response
      }
    }

    const merged = mergeUserCatSiteStateWithAvailability(sourceSites, statusMap, homeMap, order, availabilityMap);
    return res.json({ success: true, sites: merged, requiresCatApiBase: !hasUserApiBase && !canFallbackToGlobal });
  });

  // Douban image proxy (server-side) to avoid client network restrictions/hotlink issues.
  router.get('/douban/image', requireAuth, async (req, res) => {
    const maxBytes = 15 * 1024 * 1024;
    const raw = req.query && Object.prototype.hasOwnProperty.call(req.query, 'url') ? req.query.url : '';
    const input = typeof raw === 'string' ? raw.trim() : '';
    if (!input) return res.status(400).json({ success: false, message: '参数无效' });

    let url;
    try {
      url = new URL(input);
    } catch (_e) {
      return res.status(400).json({ success: false, message: 'URL 无效' });
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return res.status(400).json({ success: false, message: 'URL 无效' });
    }
    if (!isAllowedDoubanImageHost(url.hostname)) {
      return res.status(403).json({ success: false, message: '不允许的图片域名' });
    }

    try {
      const out = await requestBufferWithRedirects(url.toString(), {
        method: 'GET',
        redirectsLeft: 5,
        timeoutMs: 10000,
        maxBytes,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          Referer: 'https://movie.douban.com/',
        },
      });

      if (!out || !out.status) return res.status(502).end();
      if (out.status < 200 || out.status >= 300) return res.status(out.status).end();

      const headers = out.headers && typeof out.headers === 'object' ? out.headers : {};
      const ct = headers['content-type'];
      if (ct) res.setHeader('Content-Type', ct);
      const cc = headers['cache-control'];
      if (cc) res.setHeader('Cache-Control', cc);
      res.setHeader('X-Content-Type-Options', 'nosniff');

      const buf = out.buffer && Buffer.isBuffer(out.buffer) ? out.buffer : Buffer.alloc(0);
      if (buf.length > maxBytes) return res.status(413).end();
      res.setHeader('Content-Length', String(buf.length));
      res.end(buf);
    } catch (e) {
      const msg = e && e.message ? String(e.message) : '';
      if (msg === '响应过大') return res.status(413).end();
      return res.status(502).end();
    }
  });

  router.post('/user/sites/availability', requireAuth, (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const key = typeof body.key === 'string' ? body.key.trim() : '';
    const availability = normalizeAvailability(body.availability);
    if (!key) return res.status(400).json({ success: false, message: '参数无效' });

    const db = getDb();
    const store = readUserCatSitesRow(db, req.user.userId);
    const sites = normalizeUserCatSites(safeParseJsonArray(store.cat_sites));
    const keySet = new Set(sites.map((s) => s.key));
    if (!keySet.has(key)) return res.status(400).json({ success: false, message: '站点不存在' });

    const availabilityMap = safeParseJsonObject(store.cat_site_availability);
    if (availabilityMap[key] === availability) return res.json({ success: true });
    availabilityMap[key] = availability;
    db.prepare('UPDATE users SET cat_site_availability = ? WHERE id = ?').run(
      JSON.stringify(availabilityMap),
      req.user.userId
    );
    bumpUserVersion(req.user.userId);
    return res.json({ success: true });
  });

  router.post('/user/sites/status', requireAuth, (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const key = typeof body.key === 'string' ? body.key.trim() : '';
    const enabled = body.enabled != null ? !!body.enabled : null;
    if (!key || enabled == null) return res.status(400).json({ success: false, message: '参数无效' });

    const db = getDb();
    const store = readUserCatSitesRow(db, req.user.userId);
    const userApiBaseRow = db.prepare('SELECT cat_api_base FROM users WHERE id = ? LIMIT 1').get(req.user.userId);
    const userApiBase = userApiBaseRow && userApiBaseRow.cat_api_base ? String(userApiBaseRow.cat_api_base) : '';
    const hasUserApiBase = !!(userApiBase && String(userApiBase).trim());
    const sites = hasUserApiBase
      ? normalizeUserCatSites(safeParseJsonArray(store.cat_sites))
      : (req.user.role !== 'user' ? getGlobalVideoSitesFromSettings(db) : normalizeUserCatSites(safeParseJsonArray(store.cat_sites)));
    const keySet = new Set(sites.map((s) => s.key));
    if (!keySet.has(key)) return res.status(400).json({ success: false, message: '站点不存在' });

    const statusMap = safeParseJsonObject(store.cat_site_status);
    if (!!statusMap[key] === enabled) return res.json({ success: true });
    statusMap[key] = enabled;
    db.prepare('UPDATE users SET cat_site_status = ? WHERE id = ?').run(JSON.stringify(statusMap), req.user.userId);
    bumpUserVersion(req.user.userId);
    return res.json({ success: true });
  });

  router.post('/user/sites/home', requireAuth, (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const key = typeof body.key === 'string' ? body.key.trim() : '';
    const home = body.home != null ? !!body.home : null;
    if (!key || home == null) return res.status(400).json({ success: false, message: '参数无效' });

    const db = getDb();
    const store = readUserCatSitesRow(db, req.user.userId);
    const userApiBaseRow = db.prepare('SELECT cat_api_base FROM users WHERE id = ? LIMIT 1').get(req.user.userId);
    const userApiBase = userApiBaseRow && userApiBaseRow.cat_api_base ? String(userApiBaseRow.cat_api_base) : '';
    const hasUserApiBase = !!(userApiBase && String(userApiBase).trim());
    const sites = hasUserApiBase
      ? normalizeUserCatSites(safeParseJsonArray(store.cat_sites))
      : (req.user.role !== 'user' ? getGlobalVideoSitesFromSettings(db) : normalizeUserCatSites(safeParseJsonArray(store.cat_sites)));
    const keySet = new Set(sites.map((s) => s.key));
    if (!keySet.has(key)) return res.status(400).json({ success: false, message: '站点不存在' });

    const homeMap = safeParseJsonObject(store.cat_site_home);
    if (!!homeMap[key] === home) return res.json({ success: true });
    homeMap[key] = home;
    db.prepare('UPDATE users SET cat_site_home = ? WHERE id = ?').run(JSON.stringify(homeMap), req.user.userId);
    bumpUserVersion(req.user.userId);
    return res.json({ success: true });
  });

  router.post('/user/sites/order', requireAuth, (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const order = Array.isArray(body.order) ? body.order : [];

    const db = getDb();
    const store = readUserCatSitesRow(db, req.user.userId);
    const userApiBaseRow = db.prepare('SELECT cat_api_base FROM users WHERE id = ? LIMIT 1').get(req.user.userId);
    const userApiBase = userApiBaseRow && userApiBaseRow.cat_api_base ? String(userApiBaseRow.cat_api_base) : '';
    const hasUserApiBase = !!(userApiBase && String(userApiBase).trim());
    const sites = hasUserApiBase
      ? normalizeUserCatSites(safeParseJsonArray(store.cat_sites))
      : (req.user.role !== 'user' ? getGlobalVideoSitesFromSettings(db) : normalizeUserCatSites(safeParseJsonArray(store.cat_sites)));
    const keySet = new Set(sites.map((s) => s.key));

    const next = [];
    const seen = new Set();
    order.forEach((k) => {
      const key = typeof k === 'string' ? k.trim() : '';
      if (!key || !keySet.has(key) || seen.has(key)) return;
      seen.add(key);
      next.push(key);
    });
    // append missing keys based on current sites order
    sites.forEach((s) => {
      const key = s && typeof s.key === 'string' ? s.key : '';
      if (!key || seen.has(key)) return;
      seen.add(key);
      next.push(key);
    });

    const nextStr = JSON.stringify(next);
    const prevStr = typeof store.cat_site_order === 'string' ? store.cat_site_order : '';
    if (prevStr !== nextStr) {
      db.prepare('UPDATE users SET cat_site_order = ? WHERE id = ?').run(nextStr, req.user.userId);
      bumpUserVersion(req.user.userId);
    }
    return res.json({ success: true });
  });

  router.post('/catpawopen/spider/home', requireAuth, async (req, res) => {
    return res.status(410).json({
      success: false,
      message: 'CatPawOpen 接口异常',
    });
  });

  router.post('/catpawopen/spider/category', requireAuth, async (req, res) => {
    return res.status(410).json({
      success: false,
      message: 'CatPawOpen 接口异常',
    });
  });

  router.post('/catpawopen/spider/detail', requireAuth, async (req, res) => {
    return res.status(410).json({
      success: false,
      message: 'CatPawOpen 接口异常',
    });
  });

  router.post('/catpawopen/spider/play', requireAuth, async (req, res) => {
    return res.status(410).json({
      success: false,
      message: 'CatPawOpen 接口异常',
    });
  });

  router.post('/catpawopen/spider/search', requireAuth, async (req, res) => {
    return res.status(410).json({
      success: false,
      message: 'CatPawOpen 接口异常',
    });
  });

  return router;
}

module.exports = { createApiRouter };
