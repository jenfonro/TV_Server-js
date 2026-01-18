export function initDashboardPage(bootstrap = {}) {
  const adminNavs = document.querySelectorAll('.admin-nav');
  const panels = document.querySelectorAll('.admin-panel');
  const videoSourceList = document.getElementById('videoSourceList');
  const videoSourceListSaveStatus = document.getElementById('videoSourceListSaveStatus');
  const videoSourceBulkActions = document.getElementById('videoSourceBulkActions');
  const videoSourceBulkEnable = document.getElementById('videoSourceBulkEnable');
  const videoSourceBulkDisable = document.getElementById('videoSourceBulkDisable');
  const panList = document.getElementById('panList');
  const panListSaveStatus = document.getElementById('panListSaveStatus');
  const panHeaderName = document.getElementById('panHeaderName');
  const panHeaderEnable = document.getElementById('panHeaderEnable');
  const panHeaderSort = document.getElementById('panHeaderSort');
  const panSettingsTabs = document.getElementById('panSettingsTabs');
  const panSettingsContent = document.getElementById('panSettingsContent');
  const panSettingsStatus = document.getElementById('panSettingsStatus');
  const panSettingsMoreBtn = document.getElementById('panSettingsMoreBtn');
  const panSettingsMoreMenu = document.getElementById('panSettingsMoreMenu');
  const panSettingsScrollLeft = document.getElementById('panSettingsScrollLeft');
  const panSettingsScrollRight = document.getElementById('panSettingsScrollRight');
  const searchSettingsList = document.getElementById('searchSettingsList');
  const searchSettingsSaveStatus = document.getElementById('searchSettingsSaveStatus');
  const searchHeaderName = document.getElementById('searchHeaderName');
  const searchHeaderCover = document.getElementById('searchHeaderCover');
  const searchHeaderSort = document.getElementById('searchHeaderSort');

  const openListSettingsForm = document.getElementById('openListSettingsForm');
  const openListSaveStatus = document.getElementById('openListSaveStatus');
  const openListQuarkTvModeInput = document.getElementById('openListQuarkTvMode');

  const goProxySettingsForm = document.getElementById('goProxySettingsForm');
  const goProxySaveStatus = document.getElementById('goProxySaveStatus');
  const goProxyEnabledInput = document.getElementById('goProxyEnabled');
  const goProxyAutoSelectInput = document.getElementById('goProxyAutoSelect');
  const goProxyServersJsonInput = document.getElementById('goProxyServersJson');
  const goProxyServerInput = document.getElementById('goProxyServerInput');
  const goProxyServerAdd = document.getElementById('goProxyServerAdd');
  const goProxyServerList = document.getElementById('goProxyServerList');
  const videoSourceImportFromCatPawOpenBtn = document.getElementById('videoSourceImportFromCatPawOpen');

  const magicEpisodeRulePatternInput = document.getElementById('magicEpisodeRulePatternInput');
  const magicEpisodeRuleReplaceInput = document.getElementById('magicEpisodeRuleReplaceInput');
  const magicEpisodeRuleAdd = document.getElementById('magicEpisodeRuleAdd');
  const magicEpisodeRuleList = document.getElementById('magicEpisodeRuleList');
  const magicEpisodeRuleStatus = document.getElementById('magicEpisodeRuleStatus');
  const magicEpisodeRuleTestInput = document.getElementById('magicEpisodeRuleTestInput');
  const magicEpisodeRuleTestBtn = document.getElementById('magicEpisodeRuleTestBtn');
  const magicEpisodeRuleTestOutput = document.getElementById('magicEpisodeRuleTestOutput');
  const magicEpisodeCleanRegexRuleInput = document.getElementById('magicEpisodeCleanRegexRuleInput');
  const magicEpisodeCleanRegexRuleAdd = document.getElementById('magicEpisodeCleanRegexRuleAdd');
  const magicEpisodeCleanRegexRuleList = document.getElementById('magicEpisodeCleanRegexRuleList');
  const magicEpisodeCleanRegexRuleStatus = document.getElementById('magicEpisodeCleanRegexRuleStatus');

  const magicAggregateRuleInput = document.getElementById('magicAggregateRuleInput');
  const magicAggregateRuleAdd = document.getElementById('magicAggregateRuleAdd');
  const magicAggregateRuleList = document.getElementById('magicAggregateRuleList');
  const magicAggregateRuleStatus = document.getElementById('magicAggregateRuleStatus');
  const magicAggregateRuleTestInput = document.getElementById('magicAggregateRuleTestInput');
  const magicAggregateRuleTestBtn = document.getElementById('magicAggregateRuleTestBtn');
  const magicAggregateRuleTestOutput = document.getElementById('magicAggregateRuleTestOutput');

  const magicAggregateRegexRuleInput = document.getElementById('magicAggregateRegexRuleInput');
  const magicAggregateRegexRuleAdd = document.getElementById('magicAggregateRegexRuleAdd');
  const magicAggregateRegexRuleList = document.getElementById('magicAggregateRegexRuleList');
  const magicAggregateRegexRuleStatus = document.getElementById('magicAggregateRegexRuleStatus');

  const panelLoaded = {
    site: false,
    user: false,
    video: false,
    pan: false,
    interface: false,
    search: false,
    magic: false,
  };
  const panelLoading = {
    site: false,
    user: false,
    video: false,
    pan: false,
    interface: false,
    search: false,
    magic: false,
  };

  const CLS = {
    muted: 'text-gray-500 dark:text-gray-400',
    mutedXs: 'text-xs text-gray-500 dark:text-gray-400',
    mutedMonoXs: 'text-xs text-gray-500 dark:text-gray-400 font-mono flex-shrink-0',
  };

  const createEl = (tag, options = {}) => {
    const el = document.createElement(tag);
    const className = options.className != null ? String(options.className) : '';
    if (className) el.className = className;
    if (options.text != null) el.textContent = String(options.text);
    if (options.html != null) el.innerHTML = String(options.html);
    return el;
  };

  const setStyles = (el, styles) => {
    if (!el || !styles) return el;
    try {
      Object.assign(el.style, styles);
    } catch (_e) {}
    return el;
  };

  const setEllipsisCell = (el, { width, minWidth, maxWidth, flex = '0 0 auto', display = 'inline-block' } = {}) =>
    setStyles(el, {
      width,
      minWidth,
      maxWidth,
      flex,
      display,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });

  const setCenterCell = (el, { minWidth, width, flex, display = 'inline-flex' } = {}) =>
    setStyles(el, {
      display,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth,
      width,
      flex,
    });

  const SORT_ICON = {
    up: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>',
    down: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  };

  const appendSortButtons = (sortCell, { dirAttr, keyAttr, key, disabledUp, disabledDown } = {}) => {
    if (!sortCell) return;
    const sortGroup = createEl('div', { className: 'sort-btn-group' });
    const upBtn = createEl('button', { className: 'sort-btn', html: SORT_ICON.up });
    upBtn.type = 'button';
    upBtn.setAttribute(String(dirAttr || 'data-sort'), 'up');
    upBtn.setAttribute(String(keyAttr || 'data-site-key'), String(key || ''));
    upBtn.disabled = !!disabledUp;

    const downBtn = createEl('button', { className: 'sort-btn', html: SORT_ICON.down });
    downBtn.type = 'button';
    downBtn.setAttribute(String(dirAttr || 'data-sort'), 'down');
    downBtn.setAttribute(String(keyAttr || 'data-site-key'), String(key || ''));
    downBtn.disabled = !!disabledDown;

    sortGroup.appendChild(upBtn);
    sortGroup.appendChild(downBtn);
    sortCell.appendChild(sortGroup);
  };

  const appendEmptyItem = (listEl, text = '无数据') => {
    if (!listEl) return;
    listEl.appendChild(createEl('li', { className: CLS.muted, text }));
  };

  const setInlineStatus = (el, type, text) => {
    if (!el) return;
    const t = text != null ? String(text) : '';
    if (!t) {
      el.classList.add('hidden');
      try {
        el.hidden = true;
      } catch (_e) {}
      el.textContent = '';
      el.classList.remove('text-green-600', 'text-red-600');
      return;
    }
    el.classList.remove('hidden', 'text-green-600', 'text-red-600');
    try {
      el.hidden = false;
    } catch (_e) {}
    if (type === 'success') el.classList.add('text-green-600');
    if (type === 'error') el.classList.add('text-red-600');
    el.textContent = t;
  };

  const bindInlineStatus = (el) => (type, text) => setInlineStatus(el, type, text);

  const bindOnce = (el, fn) => {
    if (!el) return false;
    if (el.dataset && el.dataset.bound === 'true') return false;
    if (el.dataset) el.dataset.bound = 'true';
    if (typeof fn === 'function') fn(el);
    return true;
  };

  const calcMaxTextLength = (items, getText) => {
    const list = Array.isArray(items) ? items : [];
    const getter = typeof getText === 'function' ? getText : () => '';
    return list.reduce((max, item) => {
      const text = getter(item);
      return Math.max(max, (text != null ? String(text) : '').length);
    }, 0);
  };

  const calcChCell = (items, getText, { min = 1, pad = 2 } = {}) => {
    const maxLen = Math.max(calcMaxTextLength(items, getText), Number(min) || 0);
    const safePad = Number.isFinite(Number(pad)) ? Number(pad) : 2;
    return { maxLen, width: `${maxLen}ch`, maxWidth: `${maxLen + safePad}ch` };
  };

  const fixedCell = (px) => {
    const n = Number(px);
    const v = Number.isFinite(n) ? Math.max(0, n) : 0;
    return { minWidth: `${v}px`, width: `${v}px`, flex: `0 0 ${v}px` };
  };

  const setFixedHeaderCell = (el, px) =>
    setStyles(el, { display: 'inline-block', textAlign: 'center', ...fixedCell(px) });

  const createSwitchLabel = ({ checked, disabled, title, ariaLabel, inputAttrs, onChange }) => {
    const label = createEl('label', { className: 'enable-switch' });
    if (title) label.title = String(title);
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!checked;
    input.disabled = !!disabled;
    if (ariaLabel) input.setAttribute('aria-label', String(ariaLabel));
    if (inputAttrs && typeof inputAttrs === 'object') {
      Object.entries(inputAttrs).forEach(([k, v]) => {
        if (v == null) return;
        input.setAttribute(String(k), String(v));
      });
    }
    if (typeof onChange === 'function') input.addEventListener('change', onChange);
    const slider = createEl('span', { className: 'enable-slider' });
    label.appendChild(input);
    label.appendChild(slider);
    return { label, input };
  };

  const fetchJsonSafe = async (url, options, fallback) => {
    const resp = await fetch(url, options);
    const fb = fallback == null ? {} : fallback;
    const data = await resp.json().catch(() => fb);
    return { resp, data };
  };

  const postJsonSafe = (url, body) =>
    fetchJsonSafe(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body != null ? body : {}),
      },
      {}
    );

  const getSuccessJson = async (url, options = {}) => {
    try {
      const opts = options && typeof options === 'object' ? options : {};
      const { resp, data } = await fetchJsonSafe(url, { method: 'GET', ...opts }, {});
      if (resp.ok && data && data.success) return data;
    } catch (_e) {}
    return null;
  };

  const postForm = (url, fields) => {
    const body = new URLSearchParams();
    if (fields && typeof fields === 'object') {
      Object.entries(fields).forEach(([k, v]) => {
        body.append(String(k), v != null ? String(v) : '');
      });
    }
    return fetchJsonSafe(
      url,
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() },
      {}
    );
  };

  const formToFields = (form) => {
    const fields = {};
    if (!form) return fields;
    try {
      const formData = new FormData(form);
      for (const [k, v] of formData.entries()) fields[k] = v != null ? String(v) : '';
    } catch (_e) {}
    return fields;
  };

  const withDatasetLock = async (el, key, fn) => {
    if (!el || !el.dataset) return (typeof fn === 'function' ? fn() : undefined);
    const k = typeof key === 'string' && key ? key : 'pending';
    if (el.dataset[k] === 'true') return undefined;
    el.dataset[k] = 'true';
    try {
      return await (typeof fn === 'function' ? fn() : undefined);
    } finally {
      try {
        delete el.dataset[k];
      } catch (_e) {}
    }
  };

  const clearStatusLater = (setStatus, delay = 1200) => {
    if (typeof setStatus !== 'function') return;
    const ms = Number(delay);
    const d = Number.isFinite(ms) ? ms : 1200;
    setTimeout(() => setStatus('', ''), d);
  };

  const swapCopy = (arr, i, j) => {
    const list = Array.isArray(arr) ? arr.slice() : [];
    const a = Number(i);
    const b = Number(j);
    if (!Number.isInteger(a) || !Number.isInteger(b)) return list;
    if (a < 0 || b < 0 || a >= list.length || b >= list.length || a === b) return list;
    const tmp = list[a];
    list[a] = list[b];
    list[b] = tmp;
    return list;
  };
  let initialPanelKey = null;
  const allowedPanels = new Set(['site', 'user', 'video', 'pan', 'interface', 'search', 'magic', 'live']);
  const normalizePanelKey = (key) => {
    const k = typeof key === 'string' ? key.trim().toLowerCase() : '';
    return allowedPanels.has(k) ? k : 'site';
  };
  const readPanelFromHash = () => {
    const hash = typeof window.location.hash === 'string' ? window.location.hash : '';
    const key = hash.replace(/^#/, '').trim();
    return normalizePanelKey(key);
  };
  const writePanelToHash = (key) => {
    const next = normalizePanelKey(key);
    const current = (window.location.hash || '').replace(/^#/, '');
    if (current === next) return;
    window.location.hash = `#${next}`;
  };
  const showPanel = (key) => {
    const safeKey = normalizePanelKey(key);
    panels.forEach((p) => p.classList.add('hidden'));
    adminNavs.forEach((n) => {
      const active = n.dataset.admin === safeKey;
      n.setAttribute('data-active', active ? 'true' : 'false');
    });
    const target = document.querySelector(
      `#admin${safeKey.charAt(0).toUpperCase()}${safeKey.slice(1)}`
    );
    if (target) target.classList.remove('hidden');
  };

  let goProxyServers = [];
  let goProxySaving = false;

  const normalizeHttpBase = (value) => {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return '';
    try {
      const u = new URL(raw);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
      u.hash = '';
      u.search = '';
      return u.toString().replace(/\/+$/g, '');
    } catch (_e) {
      return '';
    }
  };

  const safeParseJsonArray = (text) => {
    try {
      const v = JSON.parse(String(text || ''));
      return Array.isArray(v) ? v : [];
    } catch (_e) {
      return [];
    }
  };

  const normalizeCatPawOpenAdminBase = (value) => {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return '';
    try {
      const u = new URL(raw);
      u.hash = '';
      u.search = '';
      let p = u.pathname || '/';
      const spiderIdx = p.indexOf('/spider/');
      if (spiderIdx >= 0) p = p.slice(0, spiderIdx) || '/';
      p = p.replace(/\/spider\/?$/, '/') || '/';
      p = p.replace(/\/(full-config|config|website)\/?$/, '/') || '/';
      if (!p.endsWith('/')) p += '/';
      u.pathname = p;
      return u.toString();
    } catch (_e) {
      return '';
    }
  };

  const getTvUserHeaders = () => {
    const u = bootstrap && bootstrap.user && typeof bootstrap.user.username === 'string' ? bootstrap.user.username.trim() : '';
    return u ? { 'X-TV-User': u } : {};
  };

  const requestCatPawOpenAdminJson = async ({ apiBase, path, method, body }) => {
    const base = normalizeCatPawOpenAdminBase(apiBase);
    if (!base) throw new Error('CatPawOpen 接口地址无效');
    const cleanPath = String(path || '').replace(/^\//, '');
    const target = new URL(cleanPath, base);

    const headers = { 'Content-Type': 'application/json', ...getTvUserHeaders() };

    const { resp, data } = await fetchJsonSafe(
      target.toString(),
      {
        method: method || 'GET',
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
        credentials: 'omit',
      },
      {}
    );
    const status = resp && typeof resp.status === 'number' ? resp.status : 0;
    if (!resp.ok) {
      const msg = data && data.message ? String(data.message) : `HTTP ${status}`;
      const err = new Error(msg);
      err.status = status;
      throw err;
    }
    return data;
  };

  const setCatPawOpenRemoteState = (state, message = '') => {
    const remoteSettingsEl = document.getElementById('catPawOpenRemoteSettings');
    const remoteErrorEl = document.getElementById('catPawOpenRemoteError');
    try {
      if (remoteSettingsEl) remoteSettingsEl.classList.toggle('hidden', state !== 'ready');
      if (remoteErrorEl) {
        const showErr = state === 'error';
        remoteErrorEl.classList.toggle('hidden', !showErr);
        remoteErrorEl.textContent = showErr ? (message || 'CatPawOpen 接口异常') : '';
      }
      if (state === 'hidden') {
        if (remoteErrorEl) {
          remoteErrorEl.classList.add('hidden');
          remoteErrorEl.textContent = '';
        }
      }
    } catch (_e) {}
  };

  const refreshCatPawOpenRemoteSettings = async (apiBaseOverride) => {
    const apiInput = document.querySelector('#catPawOpenSettingsForm input[name="catPawOpenApiBase"]');
    const apiBase = typeof apiBaseOverride === 'string'
      ? apiBaseOverride
      : apiInput && typeof apiInput.value === 'string'
        ? apiInput.value
        : '';
    const normalizedBase = normalizeCatPawOpenAdminBase(apiBase);
    if (!normalizedBase) {
      setCatPawOpenRemoteState('hidden');
      return { ok: false, skipped: true, reason: 'unconfigured' };
    }
    try {
      const settingsResp = await requestCatPawOpenAdminJson({
        apiBase: normalizedBase,
        path: 'admin/settings',
        method: 'GET',
      });
      const proxyInput = document.querySelector('#catPawOpenSettingsForm input[name="catPawOpenProxy"]');
      if (proxyInput && settingsResp && settingsResp.settings && typeof settingsResp.settings.proxy === 'string') {
        proxyInput.value = settingsResp.settings.proxy || '';
      }
      const directLinkInput = document.getElementById('catPawOpenDirectLinkEnabled');
      if (directLinkInput && settingsResp && settingsResp.settings) {
        directLinkInput.checked = !!settingsResp.settings.directLinkEnabled;
      }
      setCatPawOpenRemoteState('ready');
      return { ok: true, data: { settingsResp } };
    } catch (e) {
      setCatPawOpenRemoteState('error');
      return { ok: false, skipped: false, reason: 'error', error: e };
    }
  };

  const syncCatPawOpenRemoteSettings = async (apiBase) => {
    const normalizedBase = normalizeCatPawOpenAdminBase(apiBase);
    if (!normalizedBase) return { ok: false, skipped: true, reason: 'unconfigured' };
    const proxyInput = document.querySelector('#catPawOpenSettingsForm input[name="catPawOpenProxy"]');
    const proxy = proxyInput && typeof proxyInput.value === 'string' ? proxyInput.value : '';
    const directLinkInput = document.getElementById('catPawOpenDirectLinkEnabled');
    const directLinkEnabled = !!(directLinkInput && directLinkInput.checked);
    const parts = [];
    try {
      const resp = await requestCatPawOpenAdminJson({
        apiBase: normalizedBase,
        path: 'admin/settings',
        method: 'PUT',
        body: { proxy: String(proxy || ''), directLinkEnabled },
      });
      if (proxyInput && resp && resp.settings && typeof resp.settings.proxy === 'string') {
        proxyInput.value = resp.settings.proxy || '';
      }
      if (directLinkInput && resp && resp.settings) directLinkInput.checked = !!resp.settings.directLinkEnabled;
      return { ok: true, parts: [], data: resp };
    } catch (err) {
      const msg = err && err.message ? String(err.message) : '同步失败';
      parts.push(msg);
      return { ok: false, parts };
    }
  };

  const unwrapCatPawOpenWebsiteData = (resp) => {
    if (!resp) throw new Error('CatPawOpen 返回为空');
    if (resp && typeof resp === 'object') {
      if (resp.code === 0) return resp.data;
      if (resp.success === true && Object.prototype.hasOwnProperty.call(resp, 'data')) return resp.data;
      if (Object.prototype.hasOwnProperty.call(resp, 'data')) return resp.data;
      const msg = typeof resp.message === 'string' ? resp.message : '';
      if (msg) throw new Error(msg);
    }
    return resp;
  };

  const getCatPawOpenApiBase = () => {
    const input = catPawOpenForm ? catPawOpenForm.querySelector('input[name="catPawOpenApiBase"]') : null;
    if (input) {
      const v = typeof input.value === 'string' ? input.value.trim() : '';
      if (v) return v;
      const attr = typeof input.getAttribute === 'function' ? String(input.getAttribute('value') || '').trim() : '';
      if (attr) return attr;
    }
    return bootstrap && bootstrap.settings && typeof bootstrap.settings.catPawOpenApiBase === 'string'
      ? String(bootstrap.settings.catPawOpenApiBase || '').trim()
      : '';
  };

  const catPawOpenApiBaseCache = { t: 0, v: '', inFlight: null };

  const readCatPawOpenApiBaseFromDom = () => {
    try {
      const form = document.getElementById('catPawOpenSettingsForm');
      const input = form ? form.querySelector('input[name="catPawOpenApiBase"]') : null;
      if (!input) return '';
      const v = typeof input.value === 'string' ? input.value.trim() : '';
      if (v) return v;
      const attr = typeof input.getAttribute === 'function' ? String(input.getAttribute('value') || '').trim() : '';
      return attr || '';
    } catch (_e) {
      return '';
    }
  };

  const resolveCatPawOpenApiBase = async (ttlMs = 10 * 1000) => {
    const direct = readCatPawOpenApiBaseFromDom() || getCatPawOpenApiBase();
    if (direct) {
      catPawOpenApiBaseCache.v = direct;
      catPawOpenApiBaseCache.t = Date.now();
      return direct;
    }

    const now = Date.now();
    if (catPawOpenApiBaseCache.v && now - catPawOpenApiBaseCache.t < ttlMs) return catPawOpenApiBaseCache.v;
    if (catPawOpenApiBaseCache.inFlight) return await catPawOpenApiBaseCache.inFlight;

    catPawOpenApiBaseCache.inFlight = (async () => {
      try {
        const settings = await getSuccessJson('/dashboard/site/settings');
        const base = settings && typeof settings.catPawOpenApiBase === 'string' ? settings.catPawOpenApiBase.trim() : '';
        catPawOpenApiBaseCache.v = base;
        catPawOpenApiBaseCache.t = Date.now();
        if (base) {
          try {
            const form = document.getElementById('catPawOpenSettingsForm');
            const input = form ? form.querySelector('input[name="catPawOpenApiBase"]') : null;
            if (input) input.value = base;
          } catch (_e) {}
        }
        return base;
      } catch (_e) {
        catPawOpenApiBaseCache.v = '';
        catPawOpenApiBaseCache.t = Date.now();
        return '';
      }
    })();

    try {
      return await catPawOpenApiBaseCache.inFlight;
    } finally {
      catPawOpenApiBaseCache.inFlight = null;
    }
  };

  const fetchCatPawOpenStatus = async ({ apiBase, path }) => {
    const base = normalizeCatPawOpenAdminBase(apiBase);
    if (!base) throw new Error('CatPawOpen 接口地址未设置');
    const cleanPath = String(path || '').replace(/^\//, '');
    const target = new URL(cleanPath, base);
    try {
      const targetHost = String(target.hostname || '').toLowerCase();
      const pageHost = String((window && window.location && window.location.hostname) || '').toLowerCase();
      const isTargetLocal = targetHost === 'localhost' || targetHost === '127.0.0.1' || targetHost === '::1';
      const isPageLocal = pageHost === 'localhost' || pageHost === '127.0.0.1' || pageHost === '::1';
      if (isTargetLocal && !isPageLocal) return false;
    } catch (_e) {}
    const headers = getTvUserHeaders();
    const resp = await fetch(target.toString(), { method: 'GET', headers, credentials: 'omit' });
    return resp && resp.ok;
  };

  const setGoProxyStatus = bindInlineStatus(goProxySaveStatus);
  const setOpenListStatus = bindInlineStatus(openListSaveStatus);

  const normalizeHttpBaseWithSlash = (value) => {
    const b = normalizeHttpBase(value);
    return b ? `${b}/` : '';
  };

  const normalizeOpenListMountPath = (value) => {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return '';
    let p = raw;
    if (!p.startsWith('/')) p = `/${p}`;
    if (!p.endsWith('/')) p = `${p}/`;
    // Collapse duplicate slashes, but keep "http(s)://" out of scope since this is a path.
    p = p.replace(/\/{2,}/g, '/');
    return p;
  };

  const validateOpenListMount = async ({ apiBase, token, mountPath }) => {
    const baseWithSlash = normalizeHttpBaseWithSlash(apiBase);
    if (!baseWithSlash) throw new Error('OpenList 服务器地址不是合法 URL');
    const t = typeof token === 'string' ? token.trim() : '';
    if (!t) throw new Error('OpenList 令牌未设置');
    const mount = normalizeOpenListMountPath(mountPath);
    if (!mount) throw new Error('夸克TV挂载目录未设置');
    const url = new URL('api/fs/get', baseWithSlash).toString();
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: t },
      body: JSON.stringify({
        path: mount,
        password: '',
        page: 1,
        per_page: 0,
        refresh: true,
      }),
      credentials: 'omit',
    });

    if (resp.status === 401) {
      const err = new Error('OpenList 令牌错误');
      err.status = 401;
      throw err;
    }
    if (resp.status === 500) {
      const err = new Error('夸克TV挂载目录错误');
      err.status = 500;
      throw err;
    }

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const msg = data && data.message ? String(data.message) : `HTTP ${resp.status}`;
      const err = new Error(msg);
      err.status = resp.status;
      throw err;
    }
    const code = data && typeof data.code === 'number' ? data.code : 0;
    if (code !== 200) {
      const msg = data && data.message ? String(data.message) : '验证失败';
      const err = new Error(msg);
      err.status = resp.status;
      throw err;
    }
    return { ok: true };
  };

  const normalizeGoProxyServers = (servers) => {
    const arr = Array.isArray(servers) ? servers : [];
    const out = [];
    const seen = new Set();
    arr.forEach((s) => {
      const base = typeof s === 'string' ? normalizeHttpBase(s) : normalizeHttpBase(s && s.base);
      if (!base) return;
      const key = base.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      const pans = s && typeof s === 'object' && typeof s.pans === 'object' && s.pans ? s.pans : {};
      const hasBaidu = Object.prototype.hasOwnProperty.call(pans, 'baidu');
      const hasQuark = Object.prototype.hasOwnProperty.call(pans, 'quark');
      out.push({
        base,
        pans: {
          baidu: hasBaidu ? !!pans.baidu : true,
          quark: hasQuark ? !!pans.quark : true,
        },
      });
    });
    return out;
  };

	  const renderGoProxyServerList = () => {
	    if (!goProxyServerList) return;
	    goProxyServerList.innerHTML = '';
	    if (!goProxyServers.length) {
	      appendEmptyItem(goProxyServerList);
	      return;
	    }

	    goProxyServers.forEach((server, idx) => {
	      const li = createEl('li', {
	        className:
	          'flex items-center gap-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2',
	      });

	      const baseSpan = createEl('span', { className: 'min-w-0 flex-1 truncate', text: server.base });

	      const toggles = createEl('div', { className: 'flex items-center gap-3 shrink-0' });

	      const mkToggle = (panKey, labelText) => {
	        const wrap = createEl('div', { className: 'flex items-center gap-2' });
	        const t = createEl('span', { className: CLS.mutedXs, text: labelText });
	        const { label, input } = createSwitchLabel({
	          checked: !!(server.pans && server.pans[panKey]),
	          onChange: () => {
	            const next = goProxyServers.slice();
	            const cur = next[idx];
	            if (!cur) return;
	            cur.pans = Object.assign({}, cur.pans, { [panKey]: !!input.checked });
	            next[idx] = cur;
	            goProxyServers = next;
	            renderGoProxyServerList();
	          },
	        });
	        wrap.appendChild(t);
	        wrap.appendChild(label);
	        return wrap;
	      };

	      toggles.appendChild(mkToggle('baidu', '百度'));
	      toggles.appendChild(mkToggle('quark', '夸克'));

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className =
        'px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-white/10 transition-colors duration-150';
      delBtn.textContent = '删除';
      delBtn.addEventListener('click', () => {
        goProxyServers = goProxyServers.filter((_s, i) => i !== idx);
        renderGoProxyServerList();
      });

      li.appendChild(baseSpan);
      li.appendChild(toggles);
      li.appendChild(delBtn);
      goProxyServerList.appendChild(li);
    });
  };

  adminNavs.forEach((nav) => {
    nav.addEventListener('click', (e) => {
      e.preventDefault();
      const key = normalizePanelKey(nav.dataset.admin || 'site');
      showPanel(key);
      writePanelToHash(key);
      ensurePanelDataLoaded(key);
    });
  });
  if (adminNavs.length && panels.length) {
    initialPanelKey = readPanelFromHash();
    showPanel(initialPanelKey);
  }

  window.addEventListener('hashchange', () => {
    const key = readPanelFromHash();
    showPanel(key);
    ensurePanelDataLoaded(key);
  });

  const dataSelect = document.getElementById('doubanDataSelect');
  const dataCustom = document.getElementById('doubanDataCustom');
  const imgSelect = document.getElementById('doubanImgSelect');
  const imgCustom = document.getElementById('doubanImgCustom');
  const toggleCustom = (selectEl, boxEl) => {
    if (!selectEl || !boxEl) return;
    const val = selectEl.value;
    boxEl.classList.toggle('hidden', val !== 'custom');
  };
  if (dataSelect) dataSelect.addEventListener('change', () => toggleCustom(dataSelect, dataCustom));
  if (imgSelect) imgSelect.addEventListener('change', () => toggleCustom(imgSelect, imgCustom));
  toggleCustom(dataSelect, dataCustom);
  toggleCustom(imgSelect, imgCustom);

  let customDropdownDocBound = false;
  const hideAllCustomDropdowns = () => {
    try {
      document.querySelectorAll('.custom-dropdown-list').forEach((el) => el.classList.add('hidden'));
    } catch (_e) {}
  };
  const ensureCustomDropdownDocBound = () => {
    if (customDropdownDocBound) return;
    customDropdownDocBound = true;
    document.addEventListener('click', () => hideAllCustomDropdowns());
  };

  const setupCustomSelectElement = (sel) => {
    if (!sel || !sel.parentNode) return;
    if (sel.dataset.customDropdownMounted === 'true') return;
    sel.dataset.customDropdownMounted = 'true';

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-dropdown';
    sel.classList.add('hidden-select');
    sel.parentNode.insertBefore(wrapper, sel);
    wrapper.appendChild(sel);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'custom-dropdown-btn';
    const currentText =
      (sel.options[sel.selectedIndex] && sel.options[sel.selectedIndex].text) || '请选择';
    btn.textContent = currentText;

    const list = document.createElement('div');
    list.className = 'custom-dropdown-list hidden';
    Array.from(sel.options).forEach((opt) => {
      const item = document.createElement('div');
      item.className = 'custom-dropdown-item';
      item.textContent = opt.text;
      item.dataset.value = opt.value;
      if (opt.selected) item.classList.add('active');
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        sel.value = opt.value;
        btn.textContent = opt.text;
        list.classList.add('hidden');
        list.querySelectorAll('.custom-dropdown-item').forEach((n) => n.classList.remove('active'));
        item.classList.add('active');
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      });
      list.appendChild(item);
    });

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      ensureCustomDropdownDocBound();
      const willOpen = list.classList.contains('hidden');
      hideAllCustomDropdowns();
      list.classList.toggle('hidden', !willOpen);
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(list);
  };

  const setupCustomSelect = (selectId) => {
    const sel = document.getElementById(selectId);
    setupCustomSelectElement(sel);
  };

  setupCustomSelect('doubanDataSelect');
  setupCustomSelect('doubanImgSelect');

  const panSettingDefs = [
    { key: 'baidu', name: '百度', type: 'cookie' },
    { key: 'quark', name: '夸克', type: 'cookie' },
    { key: 'uc', name: 'UC', type: 'cookie' },
    { key: '115', name: '115', type: 'cookie' },
    { key: 'tianyi', name: '天翼', type: 'account' },
    { key: 'pan123', name: '123', type: 'account' },
    { key: 'bili', name: 'Bilibili', type: 'cookie' },
    { key: 'wuming', name: '观影', type: 'cookie' },
    { key: 'yunchao', name: '云巢', type: 'account' },
    { key: 'pan123ziyuan', name: '123资源网', type: 'cookie' },
  ];

  let panLoginSettings = {};
  const loadedPanSettingKeys = new Set();
  let activePanSettingKey = panSettingDefs[0] ? panSettingDefs[0].key : '';

  const setPanSettingsStatus = bindInlineStatus(panSettingsStatus);

  const fetchPanSettings = async (key) => {
    const qs = key ? `?key=${encodeURIComponent(String(key))}` : '';
    const data = await getSuccessJson(`/dashboard/pan/settings${qs}`);
    if (data && data.settings && typeof data.settings === 'object') return data.settings;
    return {};
  };

  const ensurePanSettingLoaded = async (key) => {
    const k = typeof key === 'string' ? key.trim() : '';
    if (!k) return;
    if (loadedPanSettingKeys.has(k)) return;
    setPanSettingsStatus('', '加载中...');
    const partial = await fetchPanSettings(k);
    panLoginSettings = Object.assign({}, panLoginSettings, partial);
    loadedPanSettingKeys.add(k);
    setPanSettingsStatus('', '');
  };

  const savePanCookie = async (key, cookie) => {
    return savePanSettings(key, 'cookie', { cookie: cookie != null ? String(cookie) : '' });
  };

  const savePanAccount = async (key, username, password) => {
    return savePanSettings(key, 'account', {
      username: username != null ? String(username) : '',
      password: password != null ? String(password) : '',
    });
  };

  const savePanSettings = async (key, type, fields) => {
    const t = type === 'account' ? 'account' : 'cookie';
    const payload = Object.assign({ key, type: t }, fields && typeof fields === 'object' ? fields : {});
    const { resp, data } = await postForm('/dashboard/pan/settings', payload);
    if (resp.ok && data && data.success) return { ok: true, settings: data.settings || {} };
    return { ok: false, message: (data && data.message) || '保存失败', settings: (data && data.settings) || null };
  };

  const syncPanSettingToCatPawOpen = async (path, body) => {
    const apiBase = await resolveCatPawOpenApiBase();
    const normalizedBase = normalizeCatPawOpenAdminBase(apiBase);
    if (!normalizedBase) return { ok: false, skipped: true, reason: 'unconfigured' };
    const resp = await requestCatPawOpenAdminJson({
      apiBase: normalizedBase,
      path,
      method: 'PUT',
      body: body != null ? body : {},
    });
    // Website APIs may return HTTP 200 with { code: -1, message }, so we must validate `code`.
    unwrapCatPawOpenWebsiteData(resp);
    return { ok: true, skipped: false };
  };

  const syncAllPanLoginSettingsToCatPawOpen = async () => {
    const apiBase = await resolveCatPawOpenApiBase();
    const normalizedBase = normalizeCatPawOpenAdminBase(apiBase);
    if (!normalizedBase) return { ok: false, skipped: true, reason: 'unconfigured' };

    const store = await fetchPanSettings('');
    const entries = store && typeof store === 'object' ? Object.entries(store) : [];
    if (!entries.length) return { ok: true, skipped: false, okCount: 0, failCount: 0 };

    const typeByKey = new Map();
    panSettingDefs.forEach((d) => {
      if (!d || !d.key) return;
      const t = d.type === 'account' ? 'account' : 'cookie';
      typeByKey.set(d.key, t);
    });

    let okCount = 0;
    let failCount = 0;
    for (let i = 0; i < entries.length; i += 1) {
      const key = typeof entries[i][0] === 'string' ? entries[i][0].trim() : '';
      const val = entries[i][1] && typeof entries[i][1] === 'object' ? entries[i][1] : {};
      if (!key) continue;

      const t = typeByKey.get(key) || 'cookie';
      if (t === 'account') {
        const username = typeof val.username === 'string' ? val.username : '';
        const password = typeof val.password === 'string' ? val.password : '';
        if (!username && !password) continue;
        try {
          // eslint-disable-next-line no-await-in-loop
          const resp = await requestCatPawOpenAdminJson({
            apiBase: normalizedBase,
            path: `website/${encodeURIComponent(key)}/account`,
            method: 'PUT',
            body: { username, password },
          });
          unwrapCatPawOpenWebsiteData(resp);
          okCount += 1;
        } catch (_e) {
          failCount += 1;
        }
        continue;
      }

      const cookie = typeof val.cookie === 'string' ? val.cookie : '';
      if (!cookie) continue;
      try {
        // eslint-disable-next-line no-await-in-loop
        const resp = await requestCatPawOpenAdminJson({
          apiBase: normalizedBase,
          path: `website/${encodeURIComponent(key)}/cookie`,
          method: 'PUT',
          body: { cookie },
        });
        unwrapCatPawOpenWebsiteData(resp);
        okCount += 1;
      } catch (_e) {
        failCount += 1;
      }
    }

    return { ok: failCount <= 0, skipped: false, okCount, failCount };
  };

  const syncPansListToCatPawOpen = async () => {
    const apiBase = await resolveCatPawOpenApiBase();
    const normalizedBase = normalizeCatPawOpenAdminBase(apiBase);
    if (!normalizedBase) return { ok: false, skipped: true, reason: 'unconfigured' };

    try {
      const { resp: r, data } = await fetchJsonSafe('/dashboard/video/pans/list', { method: 'GET' }, {});
      if (!(r && r.ok && data && data.success && Array.isArray(data.pans))) return { ok: true, skipped: false };
      const list = normalizePans(data.pans);
      const putResp = await requestCatPawOpenAdminJson({
        apiBase: normalizedBase,
        path: 'website/pans/list',
        method: 'PUT',
        body: { list },
      });
      unwrapCatPawOpenWebsiteData(putResp);
      return { ok: true, skipped: false };
    } catch (_e) {
      return { ok: false, skipped: false };
    }
  };

  const syncPanBackupToCatPawOpenOnBaseChange = async () => {
    const [pans, settings] = await Promise.all([syncPansListToCatPawOpen(), syncAllPanLoginSettingsToCatPawOpen()]);
    return { ok: !!((pans && pans.ok !== false) && (settings && settings.ok !== false)), pans, settings };
  };

  const savePanAndSync = async ({ key, save, syncPath, syncBody }) => {
    setPanSettingsStatus('', '保存中...');
    const result = await (typeof save === 'function' ? save() : null);

    if (result && result.settings) panLoginSettings = result.settings;
    if (key) loadedPanSettingKeys.add(key);

    if (result && result.ok) {
      setPanSettingsStatus('success', '保存成功');
      try {
        const resp = await syncPanSettingToCatPawOpen(syncPath, syncBody);
        if (resp && resp.ok === false && resp.reason === 'unconfigured') {
          setPanSettingsStatus('error', 'CatPawOpen 接口地址未设置');
          return;
        }
        setPanSettingsStatus('success', '保存成功');
        setTimeout(() => setPanSettingsStatus('', ''), 1200);
      } catch (_err) {
        setPanSettingsStatus('error', 'CatPawOpen 接口异常');
      }
    } else {
      setPanSettingsStatus('error', (result && result.message) || '保存失败');
    }
  };

  const renderPanSettingsTabs = () => {
    if (!panSettingsTabs) return;
    panSettingsTabs.innerHTML = '';
    const isDark = document && document.documentElement && document.documentElement.classList
      ? document.documentElement.classList.contains('dark')
      : false;
    panSettingDefs.forEach((def) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 whitespace-nowrap text-gray-700 dark:text-gray-100 hover:bg-gray-100/30 dark:hover:bg-white/10';
      const active = def.key === activePanSettingKey;
      if (active) {
        btn.style.backgroundColor = isDark ? 'rgba(34, 197, 94, 0.22)' : 'rgba(34, 197, 94, 0.20)';
        btn.style.border = isDark ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(34, 197, 94, 0.30)';
      } else {
        btn.style.backgroundColor = '';
        btn.style.border = '1px solid transparent';
      }
      btn.dataset.panTab = def.key;
      btn.textContent = def.name;
      panSettingsTabs.appendChild(btn);
    });
  };

  const updatePanMoreMenu = () => {
    if (!panSettingsTabs || !panSettingsMoreBtn || !panSettingsMoreMenu) return;

    const containerRect = panSettingsTabs.getBoundingClientRect();
    if (!containerRect || containerRect.width <= 0) return;
    const epsilon = 2;
    const tabs = Array.from(panSettingsTabs.querySelectorAll('button[data-pan-tab]'));
    const hiddenRightDefs = [];
    tabs.forEach((btn) => {
      const key = btn.dataset ? btn.dataset.panTab : '';
      const btnRect = btn.getBoundingClientRect();
      const hiddenOnRight = btnRect.right > containerRect.right + epsilon;
      if (hiddenOnRight) {
        const def = panSettingDefs.find((d) => d.key === key);
        if (def) hiddenRightDefs.push(def);
      }
    });

    const overflowRight = hiddenRightDefs.length > 0;
    panSettingsMoreBtn.classList.toggle('hidden', !overflowRight);
    if (!overflowRight) {
      hidePanMoreMenu();
      panSettingsMoreMenu.innerHTML = '';
      return;
    }

    panSettingsMoreMenu.innerHTML = '';
    hiddenRightDefs.forEach((def) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className =
        'w-full text-left px-3 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150';
      item.textContent = def.name;
      item.dataset.panTab = def.key;
      if (def.key === activePanSettingKey) {
        item.style.backgroundColor = 'rgba(34, 197, 94, 0.12)';
      } else {
        item.style.backgroundColor = '';
      }
      panSettingsMoreMenu.appendChild(item);
    });
  };

  let panMoreMenuRaf = 0;
  const scheduleUpdatePanMoreMenu = () => {
    if (!panSettingsTabs || !panSettingsMoreBtn || !panSettingsMoreMenu) return;
    if (panMoreMenuRaf) cancelAnimationFrame(panMoreMenuRaf);
    panMoreMenuRaf = requestAnimationFrame(() => {
      panMoreMenuRaf = 0;
      updatePanMoreMenu();
      updatePanTabsHints();
    });
  };

  const updatePanTabsHints = () => {
    if (!panSettingsTabs) return;
    const left = panSettingsTabs.scrollLeft || 0;
    const clientWidth = panSettingsTabs.clientWidth || 0;
    const scrollWidth = panSettingsTabs.scrollWidth || 0;
    const epsilon = 2;
    const hasOverflow = scrollWidth > clientWidth + epsilon;
    const atStart = left <= epsilon;
    const atEnd = left + clientWidth >= scrollWidth - epsilon;

    if (panSettingsScrollLeft) {
      panSettingsScrollLeft.classList.toggle('hidden', !hasOverflow || atStart);
    }
    if (panSettingsScrollRight) {
      panSettingsScrollRight.classList.toggle('hidden', !hasOverflow || atEnd);
    }
    if (panSettingsMoreBtn) {
      // 滚到最右侧时隐藏“>”和“...”。
      if (!hasOverflow || atEnd) panSettingsMoreBtn.classList.add('hidden');
    }
  };

  const scrollPanTabsBy = (delta) => {
    if (!panSettingsTabs) return;
    const next = (panSettingsTabs.scrollLeft || 0) + delta;
    panSettingsTabs.scrollTo({ left: next, behavior: 'smooth' });
  };

  const getPanSettingValue = (key) => {
    const v = panLoginSettings && Object.prototype.hasOwnProperty.call(panLoginSettings, key) ? panLoginSettings[key] : {};
    return v && typeof v === 'object' ? v : {};
  };

	  const renderPanSettingsContent = () => {
	    if (!panSettingsContent) return;
	    const def = panSettingDefs.find((d) => d.key === activePanSettingKey) || panSettingDefs[0];
	    if (!def) return;
	    panSettingsContent.innerHTML = '';

	    if (def.type === 'cookie') {
	      const saveBtn = createEl('button', { className: 'btn-green', text: '保存' });
	      saveBtn.type = 'button';
	      saveBtn.setAttribute('data-pan-action', 'save-cookie');
	      saveBtn.setAttribute('data-pan-key', def.key);

	      const stack = createEl('div', { className: 'flex flex-col items-start gap-3' });
	      setStyles(stack, { width: '100%' });

	      const textarea = createEl('textarea', { className: 'tv-field' });
	      textarea.rows = 3;
	      setStyles(textarea, { width: '100%' });
	      textarea.placeholder = `请输入${def.name} Cookie`;
	      textarea.value = (getPanSettingValue(def.key).cookie || '').toString();
	      textarea.setAttribute('data-pan-cookie-input', def.key);
	      stack.appendChild(textarea);

	      const saveWrap = createEl('div');
	      setStyles(saveWrap, { display: 'flex', justifyContent: 'center', width: '100%' });
	      saveWrap.appendChild(saveBtn);
	      stack.appendChild(saveWrap);

	      panSettingsContent.appendChild(stack);
	      return;
	    }

	    const v = getPanSettingValue(def.key);
	    const form = createEl('div', { className: 'space-y-4 max-w-[640px]' });

	    const userRow = createEl('div');
	    const userLabel = createEl('label', {
	      className: 'block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1',
	      text: '账号',
	    });
	    const userInput = createEl('input', { className: 'tv-field' });
	    userInput.type = 'text';
	    userInput.value = (v.username || '').toString();
	    userInput.setAttribute('data-pan-account-username', def.key);
	    userRow.appendChild(userLabel);
	    userRow.appendChild(userInput);

	    const passRow = createEl('div');
	    const passLabel = createEl('label', {
	      className: 'block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1',
	      text: '密码',
	    });
	    const passInput = createEl('input', { className: 'tv-field' });
	    passInput.type = 'password';
	    passInput.value = (v.password || '').toString();
	    passInput.setAttribute('data-pan-account-password', def.key);
	    passRow.appendChild(passLabel);
	    passRow.appendChild(passInput);

	    const saveBtn = createEl('button', { className: 'btn-green', text: '保存' });
	    saveBtn.type = 'button';
	    saveBtn.setAttribute('data-pan-action', 'save-account');
	    saveBtn.setAttribute('data-pan-key', def.key);

	    form.appendChild(userRow);
	    form.appendChild(passRow);
	    form.appendChild(saveBtn);
	    panSettingsContent.appendChild(form);
	  };

  bindOnce(panSettingsTabs, () => {
    panSettingsTabs.addEventListener('click', async (e) => {
      const target = e.target;
      if (!target || !target.closest) return;
      const btn = target.closest('button[data-pan-tab]');
      if (!btn) return;
      const key = btn.dataset.panTab || '';
      if (!key || key === activePanSettingKey) return;
      activePanSettingKey = key;
      setPanSettingsStatus('', '');
      renderPanSettingsTabs();
      scheduleUpdatePanMoreMenu();
      await ensurePanSettingLoaded(activePanSettingKey);
      renderPanSettingsContent();
    });

    panSettingsTabs.addEventListener(
      'wheel',
      (e) => {
        if (!panSettingsTabs) return;
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        panSettingsTabs.scrollLeft += e.deltaY;
        e.preventDefault();
      },
      { passive: false }
    );

    panSettingsTabs.addEventListener('scroll', () => scheduleUpdatePanMoreMenu());
    window.addEventListener('resize', () => scheduleUpdatePanMoreMenu());
  });

  const hidePanMoreMenu = () => {
    if (!panSettingsMoreMenu) return;
    panSettingsMoreMenu.classList.add('hidden');
  };

  bindOnce(panSettingsScrollLeft, () => {
    panSettingsScrollLeft.addEventListener('click', (e) => {
      e.preventDefault();
      scrollPanTabsBy(-220);
    });
  });
  bindOnce(panSettingsScrollRight, () => {
    panSettingsScrollRight.addEventListener('click', (e) => {
      e.preventDefault();
      scrollPanTabsBy(220);
    });
  });

  bindOnce(panSettingsMoreBtn, () => {
    if (!panSettingsMoreMenu) return;
    panSettingsMoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      scheduleUpdatePanMoreMenu();
      panSettingsMoreMenu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;
      if (panSettingsMoreBtn.contains(target)) return;
      if (panSettingsMoreMenu.contains(target)) return;
      hidePanMoreMenu();
    });
    panSettingsMoreMenu.addEventListener('click', async (e) => {
      const target = e.target;
      if (!target || !target.closest) return;
      const btn = target.closest('button[data-pan-tab]');
      if (!btn) return;
      const key = btn.dataset.panTab || '';
      if (!key) return;
      activePanSettingKey = key;
      hidePanMoreMenu();
      setPanSettingsStatus('', '');
      renderPanSettingsTabs();
      scheduleUpdatePanMoreMenu();
      await ensurePanSettingLoaded(activePanSettingKey);
      renderPanSettingsContent();
    });
  });

  bindOnce(panSettingsContent, () => {
    panSettingsContent.addEventListener('click', async (e) => {
      const target = e.target;
      if (!target || !target.closest) return;
      const actionEl = target.closest('[data-pan-action]');
      if (!actionEl) return;
      const action = actionEl.getAttribute('data-pan-action') || '';
      const key = actionEl.getAttribute('data-pan-key') || '';
      if (!key) return;
      const def = panSettingDefs.find((d) => d.key === key);
      if (!def) return;

      if (action === 'save-cookie') {
        const textarea = panSettingsContent.querySelector(`textarea[data-pan-cookie-input="${key}"]`);
        const value = textarea ? textarea.value : '';
        await savePanAndSync({
          key,
          save: () => savePanCookie(key, value),
          syncPath: `website/${encodeURIComponent(key)}/cookie`,
          syncBody: { cookie: value != null ? String(value) : '' },
        });
        return;
      }

      if (action === 'save-account') {
        const usernameEl = panSettingsContent.querySelector(`input[data-pan-account-username="${key}"]`);
        const passwordEl = panSettingsContent.querySelector(`input[data-pan-account-password="${key}"]`);
        const username = usernameEl ? usernameEl.value : '';
        const password = passwordEl ? passwordEl.value : '';
        await savePanAndSync({
          key,
          save: () => savePanAccount(key, username, password),
          syncPath: `website/${encodeURIComponent(key)}/account`,
          syncBody: { username: username != null ? String(username) : '', password: password != null ? String(password) : '' },
        });
        return;
      }

      return;
    });
  });

  let currentPans = [];

  const setPanListStatus = bindInlineStatus(panListSaveStatus);

  const normalizePans = (pans) => {
    if (!Array.isArray(pans)) return [];
    return pans
      .map((p) => ({
        key: p && typeof p.key === 'string' ? p.key : '',
        name: p && typeof p.name === 'string' ? p.name : '',
        enable: !!(p && p.enable),
      }))
      .filter((p) => p.key);
  };

  async function cachePansListToServer(pans) {
    const { resp, data } = await postForm('/dashboard/video/pans/list', {
      list: JSON.stringify(Array.isArray(pans) ? pans : []),
    });
    if (resp.ok && data && data.success) return { ok: true, pans: Array.isArray(data.pans) ? data.pans : [] };
    return { ok: false, message: (data && data.message) || '保存失败' };
  }

  const fetchPansList = async () => {
    const apiBase = await resolveCatPawOpenApiBase();
    const normalizedBase = normalizeCatPawOpenAdminBase(apiBase);
    if (normalizedBase) {
      try {
        const resp = await requestCatPawOpenAdminJson({
          apiBase: normalizedBase,
          path: 'website/pans/list',
          method: 'GET',
        });
        const data = unwrapCatPawOpenWebsiteData(resp);
        const pans = normalizePans(data);
        try {
          await cachePansListToServer(pans);
        } catch (_e) {}
        return pans;
      } catch (_e) {}
    }
    try {
      const { resp: r, data } = await fetchJsonSafe('/dashboard/video/pans/list', { method: 'GET' }, {});
      if (r.ok && data && data.success && Array.isArray(data.pans)) return data.pans;
    } catch (_e) {}
    return [];
  };

  const savePansList = async (pans) => {
    const apiBase = await resolveCatPawOpenApiBase();
    const normalizedBase = normalizeCatPawOpenAdminBase(apiBase);
    if (!normalizedBase) return { ok: false, message: 'CatPawOpen 接口地址未设置' };
    const list = normalizePans(pans);
    try {
      const putResp = await requestCatPawOpenAdminJson({
        apiBase: normalizedBase,
        path: 'website/pans/list',
        method: 'PUT',
        body: { list },
      });
      const putData = unwrapCatPawOpenWebsiteData(putResp);
      const updated = Array.isArray(putData) ? normalizePans(putData) : null;
      const next = updated || (await fetchPansList());
      await cachePansListToServer(next);
      return { ok: true, pans: next };
    } catch (e) {
      return { ok: false, message: 'CatPawOpen 接口异常' };
    }
  };

	  function renderPanList(pans) {
	    if (!panList) return;
	    currentPans = normalizePans(pans);
	    panList.innerHTML = '';
	    if (!currentPans.length) {
	      appendEmptyItem(panList);
	      return;
	    }
	    const measure = createEl('span', { className: 'text-sm font-medium' });
	    setStyles(measure, {
	      position: 'absolute',
	      visibility: 'hidden',
	      whiteSpace: 'nowrap',
	      left: '-99999px',
	      top: '-99999px',
	    });
	    document.body.appendChild(measure);

    let maxNamePx = 0;
    currentPans.forEach((p) => {
      const text = (p && (p.name || p.key)) || '';
      measure.textContent = text;
      maxNamePx = Math.max(maxNamePx, Math.ceil(measure.getBoundingClientRect().width));
    });
    document.body.removeChild(measure);

    const nameWidthPx = Math.max(maxNamePx, 80);

    if (panHeaderName) {
      setStyles(panHeaderName, { width: `${nameWidthPx}px`, flex: '0 0 auto', display: 'inline-block', whiteSpace: 'nowrap' });
    }
    if (panHeaderEnable) {
      setFixedHeaderCell(panHeaderEnable, 72);
    }
    if (panHeaderSort) {
      setFixedHeaderCell(panHeaderSort, 72);
    }

	    currentPans.forEach((p, idx) => {
	      const li = createEl('li', { className: 'tv-row' });

      const key = p.key || '';
      const enabled = !!p.enable;

      const name = document.createElement('span');
      name.className = 'text-sm font-medium text-gray-800 dark:text-gray-100';
      name.textContent = p.name || p.key || '';
      setStyles(name, { width: `${nameWidthPx}px`, flex: '0 0 auto', display: 'inline-block', whiteSpace: 'nowrap' });

      const { label: switchLabel } = createSwitchLabel({
        checked: enabled,
        title: enabled ? '已启用' : '已禁用',
        ariaLabel: enabled ? '已启用' : '已禁用',
        inputAttrs: { 'data-pan-enable-key': key },
      });

      const enableCell = document.createElement('span');
      setCenterCell(enableCell, fixedCell(72));
      enableCell.appendChild(switchLabel);

      const sortCell = document.createElement('span');
      setCenterCell(sortCell, fixedCell(72));
      appendSortButtons(sortCell, {
        dirAttr: 'data-pan-sort',
        keyAttr: 'data-pan-key',
        key,
        disabledUp: idx === 0,
        disabledDown: idx === currentPans.length - 1,
      });

      li.appendChild(name);
      li.appendChild(enableCell);
      li.appendChild(sortCell);
      panList.appendChild(li);
    });
  }

  let currentVideoSourceSites = [];
  const selectedVideoSourceKeys = new Set();
  const videoSourceHeaderName = document.getElementById('videoSourceHeaderName');
  const videoSourceHeaderApi = document.getElementById('videoSourceHeaderApi');
  const videoSourceHeaderAvailability = document.getElementById('videoSourceHeaderAvailability');
  const videoSourceHeaderStatus = document.getElementById('videoSourceHeaderStatus');
  const videoSourceHeaderHome = document.getElementById('videoSourceHeaderHome');
  const videoSourceHeaderSort = document.getElementById('videoSourceHeaderSort');
  const videoSourceHeaderCheckbox = document.getElementById('videoSourceHeaderCheckbox');
  const videoSourceBulkCheckDisable = document.getElementById('videoSourceBulkCheckDisable');

  const formatVideoSourceApi = (api) => {
    const raw = typeof api === 'string' ? api : '';
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (trimmed.indexOf('/spider/') === 0) {
      const parts = trimmed.split('/').filter(Boolean);
      if (parts.length >= 2 && parts[0] === 'spider') return parts[1];
    }
    return trimmed.replace(/^\/spider\//, '').replace(/\/\d+\/?$/, '');
  };

  const normalizeAvailability = (v) => {
    const raw = typeof v === 'string' ? v.trim() : '';
    if (raw === 'valid' || raw === 'invalid' || raw === 'unknown' || raw === 'unchecked') return raw;
    return 'unchecked';
  };
  const formatAvailabilityText = (status) => {
    const s = normalizeAvailability(status);
    if (s === 'valid') return '有效';
    if (s === 'invalid') return '无效';
    if (s === 'unknown') return '未知';
    return '未检测';
  };
  const availabilityClassFor = (status) => {
    const s = normalizeAvailability(status);
    if (s === 'valid') return 'tag-green';
    if (s === 'invalid') return 'tag-red';
    if (s === 'unknown') return 'tag-yellow';
    return 'tag-gray';
  };
  const buildAvailabilityTag = (status) => {
    const span = document.createElement('span');
    span.className = `availability-tag ${availabilityClassFor(status)}`;
    span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg>${formatAvailabilityText(status)}`;
    return span;
  };

  const syncVideoSourceHeaderCheckbox = () => {
    if (!videoSourceHeaderCheckbox) return;
    const keys = currentVideoSourceSites.map((s) => (s && s.key) || '').filter(Boolean);
    if (!keys.length) {
      videoSourceHeaderCheckbox.checked = false;
      videoSourceHeaderCheckbox.indeterminate = false;
      return;
    }
    let selected = 0;
    keys.forEach((k) => {
      if (selectedVideoSourceKeys.has(k)) selected += 1;
    });
    videoSourceHeaderCheckbox.checked = selected === keys.length;
    videoSourceHeaderCheckbox.indeterminate = selected > 0 && selected < keys.length;
  };

  const syncVideoSourceBulkActions = () => {
    if (!videoSourceBulkActions) return;
    const keys = currentVideoSourceSites.map((s) => (s && s.key) || '').filter(Boolean);
    let selected = 0;
    keys.forEach((k) => {
      if (selectedVideoSourceKeys.has(k)) selected += 1;
    });
    videoSourceBulkActions.classList.toggle('hidden', selected <= 0);
  };

  const normalizeVideoSourceSelection = () => {
    const keys = currentVideoSourceSites.map((s) => (s && s.key) || '').filter(Boolean);
    const existing = new Set(keys);
    Array.from(selectedVideoSourceKeys).forEach((k) => {
      if (!existing.has(k)) selectedVideoSourceKeys.delete(k);
    });
  };

	  function renderVideoSourceList(sites) {
	    if (!videoSourceList) return;
	    currentVideoSourceSites = Array.isArray(sites) ? sites : [];
	    videoSourceList.innerHTML = '';
	    normalizeVideoSourceSelection();
	    syncVideoSourceHeaderCheckbox();
	    syncVideoSourceBulkActions();
	    if (!currentVideoSourceSites.length) {
	      appendEmptyItem(videoSourceList);
	      return;
	    }
    const nameCh = calcChCell(currentVideoSourceSites, (site) => (site && (site.name || site.key)) || '');
    const apiCh = calcChCell(currentVideoSourceSites, (site) => formatVideoSourceApi(site && site.api));
    if (videoSourceHeaderName) {
      setEllipsisCell(videoSourceHeaderName, {
        width: nameCh.width,
        minWidth: '80px',
        maxWidth: nameCh.maxWidth,
      });
    }
    if (videoSourceHeaderApi) {
      setEllipsisCell(videoSourceHeaderApi, {
        width: apiCh.width,
        minWidth: '90px',
        maxWidth: apiCh.maxWidth,
      });
    }
    if (videoSourceHeaderStatus) {
      setFixedHeaderCell(videoSourceHeaderStatus, 72);
    }
    if (videoSourceHeaderHome) {
      setFixedHeaderCell(videoSourceHeaderHome, 72);
    }
    if (videoSourceHeaderSort) {
      setFixedHeaderCell(videoSourceHeaderSort, 72);
    }
    if (videoSourceHeaderAvailability) {
      setFixedHeaderCell(videoSourceHeaderAvailability, 96);
    }

	    currentVideoSourceSites.forEach((site, idx) => {
	      const li = createEl('li', { className: 'tv-row' });

      const key = (site && site.key) || '';
      const enabled = site && site.enabled !== false;
      const homeShown = site && site.home !== false;

      const selectBox = document.createElement('input');
      selectBox.type = 'checkbox';
      selectBox.className =
        'h-4 w-4 rounded border-gray-300 dark:border-white/20 text-green-600 focus:ring-green-500';
      selectBox.setAttribute('data-select-key', key);
      selectBox.checked = key ? selectedVideoSourceKeys.has(key) : false;

      const name = document.createElement('span');
      name.className = 'text-sm font-medium text-gray-800 dark:text-gray-100 truncate';
      name.textContent = (site && (site.name || site.key)) || '';
      setEllipsisCell(name, {
        width: nameCh.width,
        minWidth: '80px',
        maxWidth: nameCh.maxWidth,
      });

      const keyEl = document.createElement('span');
      keyEl.className = `${CLS.mutedXs} truncate`;
      keyEl.textContent = formatVideoSourceApi(site && site.api) || '';
      setEllipsisCell(keyEl, {
        width: apiCh.width,
        minWidth: '90px',
        maxWidth: apiCh.maxWidth,
      });

      const availabilityCell = document.createElement('span');
      setCenterCell(availabilityCell, fixedCell(96));
      availabilityCell.appendChild(buildAvailabilityTag(site && site.availability));

      const { label: switchLabel } = createSwitchLabel({
        checked: !!enabled,
        title: enabled ? '已启用' : '已禁用',
        ariaLabel: enabled ? '已启用' : '已禁用',
        inputAttrs: { 'data-enable-key': key },
      });

      const enableCell = document.createElement('span');
      setCenterCell(enableCell, fixedCell(72));
      enableCell.appendChild(switchLabel);

      const { label: homeSwitchLabel } = createSwitchLabel({
        checked: !!homeShown,
        title: homeShown ? '首页显示' : '首页隐藏',
        ariaLabel: homeShown ? '首页显示' : '首页隐藏',
        inputAttrs: { 'data-home-key': key },
      });

      const homeCell = document.createElement('span');
      setCenterCell(homeCell, fixedCell(72));
      homeCell.appendChild(homeSwitchLabel);

      const sortCell = document.createElement('span');
      setCenterCell(sortCell, fixedCell(72));
      appendSortButtons(sortCell, {
        dirAttr: 'data-sort',
        keyAttr: 'data-site-key',
        key,
        disabledUp: idx === 0,
        disabledDown: idx === currentVideoSourceSites.length - 1,
      });

      li.appendChild(selectBox);
      li.appendChild(name);
      li.appendChild(keyEl);
      li.appendChild(availabilityCell);
      li.appendChild(enableCell);
      li.appendChild(homeCell);
      li.appendChild(sortCell);
      videoSourceList.appendChild(li);
    });
  }

  if (videoSourceList) {
    renderVideoSourceList([]);
  }

  const setVideoSourceListStatus = bindInlineStatus(videoSourceListSaveStatus);

  const updateVideoSourceSiteStatus = async (key, enabled) => {
    const { resp, data } = await postForm('/dashboard/video/source/sites/status', {
      key,
      enabled: enabled ? '1' : '0',
    });
    if (resp.ok && data && data.success) return { ok: true, enabled: !!data.enabled };
    return { ok: false, message: (data && data.message) || '保存失败' };
  };

  const updateVideoSourceSiteHome = async (key, home) => {
    const { resp, data } = await postForm('/dashboard/video/source/sites/home', {
      key,
      home: home ? '1' : '0',
    });
    if (resp.ok && data && data.success) return { ok: true, home: !!data.home };
    return { ok: false, message: (data && data.message) || '保存失败' };
  };

  const saveVideoSourceOrder = async (sites) => {
    const order = (Array.isArray(sites) ? sites : [])
      .map((s) => (s && s.key) || '')
      .filter(Boolean);
    const { resp, data } = await postForm('/dashboard/video/source/sites/order', {
      order: JSON.stringify(order),
    });
    if (resp.ok && data && data.success) return { ok: true };
    return { ok: false, message: (data && data.message) || '保存失败' };
  };

  const checkVideoSourceSites = async (keys) => {
    const apiBase = await resolveCatPawOpenApiBase();
    const normalizedBase = normalizeCatPawOpenAdminBase(apiBase);
    if (!normalizedBase) return { ok: false, message: 'CatPawOpen 接口地址未设置' };

    const uniq = (Array.isArray(keys) ? keys : [])
      .map((k) => (typeof k === 'string' ? k.trim() : ''))
      .filter(Boolean);
    if (!uniq.length) return { ok: true, sites: currentVideoSourceSites || [], results: {} };

    const byKey = new Map();
    (currentVideoSourceSites || []).forEach((s) => {
      if (s && s.key) byKey.set(s.key, s);
    });

    const extractList = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.list)) return data.list;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.data && Array.isArray(data.data.list)) return data.data.list;
      if (data.data && Array.isArray(data.data.vod_list)) return data.data.vod_list;
      if (data.data && Array.isArray(data.data.items)) return data.data.items;
      return [];
    };

    const extractSpiderNameFromApi = (api) => {
      const raw = typeof api === 'string' ? api.trim() : '';
      if (!raw) return '';
      try {
        const u = raw.startsWith('http://') || raw.startsWith('https://') ? new URL(raw) : null;
        const p = u ? u.pathname : raw;
        if (p.indexOf('/spider/') === 0) {
          const parts = p.split('/').filter(Boolean);
          return parts.length >= 2 ? parts[1] : '';
        }
      } catch (_e) {}
      if (raw.indexOf('/spider/') === 0) {
        const parts = raw.split('/').filter(Boolean);
        return parts.length >= 2 ? parts[1] : '';
      }
      return '';
    };

    const results = {};
    for (let i = 0; i < uniq.length; i += 1) {
      const key = uniq[i];
      const site = byKey.get(key);
      if (!site || !site.api) {
        results[key] = 'unknown';
        continue;
      }
      try {
        const spiderName = extractSpiderNameFromApi(site.api);
        if (spiderName === 'baseset') {
          const ok = await fetchCatPawOpenStatus({ apiBase: normalizedBase, path: 'website' });
          results[key] = ok ? 'valid' : 'invalid';
          continue;
        }
        const spiderPath = String(site.api || '').trim().replace(/\/+$/, '').replace(/^\//, '');
        const resp = await requestCatPawOpenAdminJson({
          apiBase: normalizedBase,
          path: `${spiderPath}/search`,
          method: 'POST',
          body: { wd: '斗破', page: 1 },
        });
        if (resp && typeof resp.statusCode === 'number' && resp.statusCode >= 400) {
          results[key] = 'invalid';
          continue;
        }
        const list = extractList(resp);
        results[key] = list.length > 0 ? 'valid' : 'unknown';
      } catch (_e) {
        results[key] = 'invalid';
      }
    }

    const { resp, data } = await postForm('/dashboard/video/source/sites/check', {
      results: JSON.stringify(results),
    });
    if (resp.ok && data && data.success) {
      return { ok: true, sites: Array.isArray(data.sites) ? data.sites : [], results: data.results || {} };
    }
    return { ok: false, message: (data && data.message) || '检测失败' };
  };

  if (videoSourceHeaderCheckbox) {
    videoSourceHeaderCheckbox.addEventListener('change', () => {
      const checked = !!videoSourceHeaderCheckbox.checked;
      currentVideoSourceSites.forEach((s) => {
        const k = (s && s.key) || '';
        if (!k) return;
        if (checked) selectedVideoSourceKeys.add(k);
        else selectedVideoSourceKeys.delete(k);
      });
      renderVideoSourceList(currentVideoSourceSites);
    });
  }

  const applyVideoSourceBulkEnabled = async (enabled) => {
    const keys = currentVideoSourceSites
      .map((s) => (s && s.key) || '')
      .filter((k) => k && selectedVideoSourceKeys.has(k));
    if (!keys.length) return;

    if (videoSourceBulkCheckDisable) videoSourceBulkCheckDisable.disabled = true;
    if (videoSourceBulkEnable) videoSourceBulkEnable.disabled = true;
    if (videoSourceBulkDisable) videoSourceBulkDisable.disabled = true;
    setVideoSourceListStatus('', '保存中...');
    try {
      let okCount = 0;
      let errCount = 0;
      for (let i = 0; i < keys.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const result = await updateVideoSourceSiteStatus(keys[i], enabled);
        if (result && result.ok) okCount += 1;
        else errCount += 1;
      }
      currentVideoSourceSites = currentVideoSourceSites.map((s) => {
        if (!s || !s.key || !selectedVideoSourceKeys.has(s.key)) return s;
        return { ...s, enabled };
      });
      renderVideoSourceList(currentVideoSourceSites);
      if (errCount <= 0) {
        setVideoSourceListStatus('success', '保存成功');
        clearStatusLater(setVideoSourceListStatus, 1200);
      } else if (okCount > 0) {
        setVideoSourceListStatus('error', `部分失败：${errCount}/${keys.length}`);
      } else {
        setVideoSourceListStatus('error', '保存失败');
      }
    } catch (_e) {
      setVideoSourceListStatus('error', '保存失败');
    } finally {
      if (videoSourceBulkCheckDisable) videoSourceBulkCheckDisable.disabled = false;
      if (videoSourceBulkEnable) videoSourceBulkEnable.disabled = false;
      if (videoSourceBulkDisable) videoSourceBulkDisable.disabled = false;
    }
  };

  const applyVideoSourceBulkCheckDisable = async () => {
    const keys = currentVideoSourceSites
      .map((s) => (s && s.key) || '')
      .filter((k) => k && selectedVideoSourceKeys.has(k));
    if (!keys.length) return;

    if (videoSourceBulkCheckDisable) videoSourceBulkCheckDisable.disabled = true;
    if (videoSourceBulkEnable) videoSourceBulkEnable.disabled = true;
    if (videoSourceBulkDisable) videoSourceBulkDisable.disabled = true;
    setVideoSourceListStatus('', `检测中... 0/${keys.length}`);
    try {
      let validCount = 0;
      let invalidCount = 0;
      let unknownCount = 0;
      for (let i = 0; i < keys.length; i += 1) {
        setVideoSourceListStatus('', `检测中... ${i + 1}/${keys.length}`);
        // eslint-disable-next-line no-await-in-loop
        const result = await checkVideoSourceSites([keys[i]]);
        if (result && result.ok) {
          const sites = Array.isArray(result.sites) ? result.sites : [];
          renderVideoSourceList(sites);
          const status =
            result.results && result.results[keys[i]]
              ? normalizeAvailability(result.results[keys[i]])
              : 'unchecked';
          if (status === 'valid') validCount += 1;
          else if (status === 'invalid') invalidCount += 1;
          else if (status === 'unknown') unknownCount += 1;
        } else {
          invalidCount += 1;
        }
      }
      setVideoSourceListStatus(
        invalidCount > 0 ? 'error' : 'success',
        `检测完成：有效${validCount} 无效${invalidCount} 未知${unknownCount}`
      );
    } catch (_e) {
      setVideoSourceListStatus('error', '检测失败');
    } finally {
      if (videoSourceBulkCheckDisable) videoSourceBulkCheckDisable.disabled = false;
      if (videoSourceBulkEnable) videoSourceBulkEnable.disabled = false;
      if (videoSourceBulkDisable) videoSourceBulkDisable.disabled = false;
    }
  };

  if (videoSourceBulkCheckDisable) {
    videoSourceBulkCheckDisable.addEventListener('click', (e) => {
      e.preventDefault();
      applyVideoSourceBulkCheckDisable();
    });
  }
  if (videoSourceBulkEnable) {
    videoSourceBulkEnable.addEventListener('click', (e) => {
      e.preventDefault();
      applyVideoSourceBulkEnabled(true);
    });
  }
  if (videoSourceBulkDisable) {
    videoSourceBulkDisable.addEventListener('click', (e) => {
      e.preventDefault();
      applyVideoSourceBulkEnabled(false);
    });
  }

  if (videoSourceList) {
    const saveVideoSourceCheckbox = async ({ target, keyAttr, save, updateSite }) => {
      if (!target || !target.getAttribute) return;
      const key = target.getAttribute(keyAttr) || '';
      if (!key) return;
      const nextValue = !!target.checked;
      const prevValue = !nextValue;

      target.disabled = true;
      setVideoSourceListStatus('', '保存中...');
      try {
        const result = await (typeof save === 'function' ? save(key, nextValue) : null);
        if (result && result.ok) {
          currentVideoSourceSites = currentVideoSourceSites.map((s) => {
            if (!s || s.key !== key) return s;
            return typeof updateSite === 'function' ? updateSite(s, result) : s;
          });
          setVideoSourceListStatus('success', '保存成功');
          renderVideoSourceList(currentVideoSourceSites);
          clearStatusLater(setVideoSourceListStatus, 1200);
        } else {
          target.checked = prevValue;
          setVideoSourceListStatus('error', (result && result.message) || '保存失败');
        }
      } catch (_err) {
        target.checked = prevValue;
        setVideoSourceListStatus('error', '保存失败');
      } finally {
        target.disabled = false;
      }
    };

    videoSourceList.addEventListener('change', (e) => {
      const target = e.target;
      if (!target || !target.matches) return;
      if (!target.matches('input[type="checkbox"][data-select-key]')) return;
      const key = target.getAttribute('data-select-key') || '';
      if (!key) return;
      if (target.checked) selectedVideoSourceKeys.add(key);
      else selectedVideoSourceKeys.delete(key);
      syncVideoSourceHeaderCheckbox();
      syncVideoSourceBulkActions();
    });

    videoSourceList.addEventListener('click', async (e) => {
      const target = e.target;
      if (!target || !target.closest) return;
      const btn = target.closest('button[data-sort][data-site-key]');
      if (!btn) return;
      const dir = btn.getAttribute('data-sort') || '';
      const key = btn.getAttribute('data-site-key') || '';
      if (!key || (dir !== 'up' && dir !== 'down')) return;

      const idx = currentVideoSourceSites.findIndex((s) => s && s.key === key);
      if (idx < 0) return;
      const nextIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= currentVideoSourceSites.length) return;

      const next = swapCopy(currentVideoSourceSites, idx, nextIdx);
      currentVideoSourceSites = next;
      renderVideoSourceList(currentVideoSourceSites);

      btn.disabled = true;
      setVideoSourceListStatus('', '保存中...');
      try {
        const result = await saveVideoSourceOrder(currentVideoSourceSites);
        if (result && result.ok) {
          setVideoSourceListStatus('success', '保存成功');
          clearStatusLater(setVideoSourceListStatus, 1200);
        } else {
          setVideoSourceListStatus('error', (result && result.message) || '保存失败');
        }
      } catch (_err) {
        setVideoSourceListStatus('error', '保存失败');
      } finally {
        btn.disabled = false;
      }
    });

    videoSourceList.addEventListener('change', async (e) => {
      const target = e.target;
      if (!target || !target.matches) return;
      if (!target.matches('input[type="checkbox"][data-enable-key]')) return;
      await saveVideoSourceCheckbox({
        target,
        keyAttr: 'data-enable-key',
        save: updateVideoSourceSiteStatus,
        updateSite: (site, result) => ({ ...site, enabled: !!result.enabled }),
      });
    });

    videoSourceList.addEventListener('change', async (e) => {
      const target = e.target;
      if (!target || !target.matches) return;
      if (!target.matches('input[type="checkbox"][data-home-key]')) return;
      await saveVideoSourceCheckbox({
        target,
        keyAttr: 'data-home-key',
        save: updateVideoSourceSiteHome,
        updateSite: (site, result) => ({ ...site, home: !!result.home }),
      });
    });
  }

  if (panList) {
    panList.addEventListener('click', async (e) => {
      const target = e.target;
      if (!target || !target.closest) return;
      const btn = target.closest('button[data-pan-sort][data-pan-key]');
      if (!btn) return;
      const dir = btn.getAttribute('data-pan-sort') || '';
      const key = btn.getAttribute('data-pan-key') || '';
      if (!key || (dir !== 'up' && dir !== 'down')) return;

      const idx = currentPans.findIndex((p) => p && p.key === key);
      if (idx < 0) return;
      const nextIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= currentPans.length) return;

      const prev = currentPans.slice();
      const next = swapCopy(currentPans, idx, nextIdx);
      currentPans = next;
      renderPanList(currentPans);

      const rollback = (message) => {
        currentPans = prev;
        renderPanList(currentPans);
        setPanListStatus('error', message || '保存失败');
      };

      btn.disabled = true;
      setPanListStatus('', '保存中...');
      try {
        const result = await savePansList(currentPans);
        if (result && result.ok) {
          renderPanList(result.pans);
          setPanListStatus('success', '保存成功');
          clearStatusLater(setPanListStatus, 1200);
        } else {
          rollback((result && result.message) || '保存失败');
        }
      } catch (_err) {
        rollback('保存失败');
      } finally {
        btn.disabled = false;
      }
    });

    panList.addEventListener('change', async (e) => {
      const target = e.target;
      if (!target || !target.matches) return;
      if (!target.matches('input[type="checkbox"][data-pan-enable-key]')) return;
      const key = target.getAttribute('data-pan-enable-key') || '';
      if (!key) return;
      const nextEnabled = !!target.checked;
      const prevEnabled = !nextEnabled;

      const prev = currentPans.slice();
      currentPans = currentPans.map((p) => {
        if (!p || p.key !== key) return p;
        return { ...p, enable: nextEnabled };
      });

      const rollback = (message) => {
        target.checked = prevEnabled;
        currentPans = prev;
        renderPanList(currentPans);
        setPanListStatus('error', message || '保存失败');
      };

      target.disabled = true;
      setPanListStatus('', '保存中...');
      try {
        const result = await savePansList(currentPans);
        if (result && result.ok) {
          renderPanList(result.pans);
          setPanListStatus('success', '保存成功');
          clearStatusLater(setPanListStatus, 1200);
        } else {
          rollback((result && result.message) || '保存失败');
        }
      } catch (_err) {
        rollback('保存失败');
      } finally {
        target.disabled = false;
      }
    });
  }

  const fetchVideoSourceSites = async () => {
    const data = await getSuccessJson('/dashboard/video/source/sites');
    return data && Array.isArray(data.sites) ? data.sites : [];
  };

  const fetchVideoSourceSettings = async () => {
    const data = await getSuccessJson('/dashboard/video/source/settings');
    return { videoSourceUrl: (data && data.videoSourceUrl) || '' };
  };

  const loadVideoPanel = async () => {
    if (panelLoaded.video || panelLoading.video) return;
    panelLoading.video = true;
    try {
      const input = document.getElementById('videoSourceUrl');
      const settings = await fetchVideoSourceSettings();
      if (input && settings && typeof settings.videoSourceUrl === 'string') {
        input.value = settings.videoSourceUrl;
      }
      renderPanList(await fetchPansList());
      renderVideoSourceList(await fetchVideoSourceSites());
      panelLoaded.video = true;
    } finally {
      panelLoading.video = false;
    }
  };

  const loadPanPanel = async () => {
    if (panelLoaded.pan || panelLoading.pan) return;
    panelLoading.pan = true;
    try {
      const first = panSettingDefs[0] ? panSettingDefs[0].key : '';
      if (first && !activePanSettingKey) activePanSettingKey = first;
      renderPanSettingsTabs();
      scheduleUpdatePanMoreMenu();
      await ensurePanSettingLoaded(activePanSettingKey);
      renderPanSettingsContent();
      panelLoaded.pan = true;
    } finally {
      panelLoading.pan = false;
    }
  };

  const loadInterfacePanel = async () => {
    if (panelLoaded.interface || panelLoading.interface) return;
    panelLoading.interface = true;
    try {
      const settings = await fetchSiteSettings();
      if (settings) {
        const catForm = document.getElementById('catPawOpenSettingsForm');
        const apiInput = catForm ? catForm.querySelector('input[name="catPawOpenApiBase"]') : null;
        if (apiInput) apiInput.value = settings.catPawOpenApiBase || '';

        const openListApiInput = openListSettingsForm
          ? openListSettingsForm.querySelector('input[name="openListApiBase"]')
          : null;
        if (openListApiInput) openListApiInput.value = settings.openListApiBase || '';
        const openListTokenInput = openListSettingsForm
          ? openListSettingsForm.querySelector('input[name="openListToken"]')
          : null;
        if (openListTokenInput) openListTokenInput.value = settings.openListToken || '';
        if (openListQuarkTvModeInput) openListQuarkTvModeInput.checked = !!settings.openListQuarkTvMode;
        const openListMountInput = openListSettingsForm
          ? openListSettingsForm.querySelector('input[name="openListQuarkTvMount"]')
          : null;
        if (openListMountInput) openListMountInput.value = settings.openListQuarkTvMount || '';

        if (goProxyEnabledInput) goProxyEnabledInput.checked = !!settings.goProxyEnabled;
        if (goProxyAutoSelectInput) goProxyAutoSelectInput.checked = !!settings.goProxyAutoSelect;
        const parsedServers = normalizeGoProxyServers(
          safeParseJsonArray(settings.goProxyServersJson || settings.goProxyServers || '[]')
        );
        goProxyServers = parsedServers;
        renderGoProxyServerList();
        await refreshCatPawOpenRemoteSettings(apiInput && typeof apiInput.value === 'string' ? apiInput.value : '');
      }
      panelLoaded.interface = true;
    } finally {
      panelLoading.interface = false;
    }
  };

  const siteForm = document.getElementById('siteSettingsForm');
  const saveStatus = document.getElementById('saveStatus');
  const setSiteSaveStatus = bindInlineStatus(saveStatus);
  bindOnce(siteForm, () => {
    siteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await withDatasetLock(siteForm, 'pending', async () => {
        setSiteSaveStatus('', '保存中...');
        try {
          const { resp, data } = await postForm(siteForm.action, formToFields(siteForm));
          if (resp.ok && data && data.success) setSiteSaveStatus('success', '保存成功');
          else setSiteSaveStatus('error', (data && data.message) || '保存失败');
        } catch (_err) {
          setSiteSaveStatus('error', '保存失败');
        }
      });
    });
  });

  const catPawOpenForm = document.getElementById('catPawOpenSettingsForm');
  const catPawOpenSaveStatus = document.getElementById('catPawOpenSaveStatus');
  const setCatPawOpenSaveStatus = bindInlineStatus(catPawOpenSaveStatus);
  bindOnce(catPawOpenForm, () => {
    catPawOpenForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await withDatasetLock(catPawOpenForm, 'pending', async () => {
        setCatPawOpenSaveStatus('', '保存中...');
        try {
          const apiInput = catPawOpenForm.querySelector('input[name="catPawOpenApiBase"]');
          const apiBase = apiInput && typeof apiInput.value === 'string' ? apiInput.value : '';

          const { resp, data } = await postForm(catPawOpenForm.action, formToFields(catPawOpenForm));
          if (!(resp.ok && data && data.success)) {
            setCatPawOpenSaveStatus('error', (data && data.message) || '保存失败');
            return;
          }

          const normalizedBase = normalizeCatPawOpenAdminBase(apiBase);
          if (!normalizedBase) {
            await refreshCatPawOpenRemoteSettings(apiBase);
            setCatPawOpenSaveStatus('success', '保存成功');
            return;
          }

          if (data && data.apiBaseChanged === true) {
            try {
              const sync = await syncPanBackupToCatPawOpenOnBaseChange();
              if (sync && sync.ok === false) {
                setCatPawOpenSaveStatus('error', 'CatPawOpen 同步失败');
              }
            } catch (_e) {
              setCatPawOpenSaveStatus('error', 'CatPawOpen 同步失败');
            }
          }

          const remoteSettingsEl = document.getElementById('catPawOpenRemoteSettings');
          const canSync = !!(remoteSettingsEl && !remoteSettingsEl.classList.contains('hidden'));
          if (!canSync) {
            await refreshCatPawOpenRemoteSettings(apiBase);
            setCatPawOpenSaveStatus('success', '保存成功');
            return;
          }

          const sync = await syncCatPawOpenRemoteSettings(apiBase);
          if (sync && sync.ok === false) setCatPawOpenSaveStatus('error', 'CatPawOpen 同步失败');
          else setCatPawOpenSaveStatus('success', '保存成功');
        } catch (_err) {
          setCatPawOpenSaveStatus('error', '保存失败');
        }
      });
    });
  });

  bindOnce(openListSettingsForm, () => {
    let openListSaving = false;
    openListSettingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (openListSaving) return;
      openListSaving = true;
      setOpenListStatus('', '保存中...');
      try {
        const apiInput = openListSettingsForm.querySelector('input[name="openListApiBase"]');
        const tokenInput = openListSettingsForm.querySelector('input[name="openListToken"]');
        const mountInput = openListSettingsForm.querySelector('input[name="openListQuarkTvMount"]');
        const tvMode = !!(openListQuarkTvModeInput && openListQuarkTvModeInput.checked);

        const apiBaseRaw = apiInput && typeof apiInput.value === 'string' ? apiInput.value : '';
        const tokenRaw = tokenInput && typeof tokenInput.value === 'string' ? tokenInput.value : '';
        const mountRaw = mountInput && typeof mountInput.value === 'string' ? mountInput.value : '';

        const normalizedBaseWithSlash = normalizeHttpBaseWithSlash(apiBaseRaw);
        if (apiInput) apiInput.value = normalizedBaseWithSlash;
        const normalizedMount = normalizeOpenListMountPath(mountRaw);
        if (mountInput) mountInput.value = normalizedMount;

        const hasAny =
          !!normalizedBaseWithSlash ||
          !!String(tokenRaw || '').trim() ||
          !!normalizedMount ||
          tvMode;

        const { resp, data } = await postForm(openListSettingsForm.action, formToFields(openListSettingsForm));
        const savedOk = !!(resp && resp.ok && data && data.success);
        if (!savedOk) {
          setOpenListStatus('error', (data && data.message) || '保存失败');
          return;
        }

        // Even if validation fails, keep settings saved (per requirement).
        if (hasAny) {
          try {
            await validateOpenListMount({
              apiBase: normalizedBaseWithSlash,
              token: tokenRaw,
              mountPath: normalizedMount,
            });
            setOpenListStatus('success', '保存成功');
          } catch (err) {
            const msg = err && err.message ? String(err.message) : '验证失败';
            setOpenListStatus('error', `${msg}（已保存）`);
          }
        } else {
          setOpenListStatus('success', '保存成功');
        }
      } catch (_e) {
        setOpenListStatus('error', '保存失败');
      } finally {
        openListSaving = false;
      }
    });
  });

  bindOnce(goProxySettingsForm, () => {
    if (goProxyServerAdd && goProxyServerInput) {
      goProxyServerAdd.addEventListener('click', () => {
        const normalized = normalizeHttpBase(goProxyServerInput.value);
        if (!normalized) {
          setGoProxyStatus('error', '服务器地址不是合法 URL');
          return;
        }
        setGoProxyStatus('', '');
        const exists = goProxyServers.some((s) => (s && s.base ? s.base.toLowerCase() : '') === normalized.toLowerCase());
        if (exists) {
          goProxyServerInput.value = '';
          return;
        }
        goProxyServers = normalizeGoProxyServers(
          goProxyServers.concat([{ base: normalized, pans: { baidu: true, quark: true } }])
        );
        renderGoProxyServerList();
        goProxyServerInput.value = '';
      });
    }

	    goProxySettingsForm.addEventListener('submit', async (e) => {
	      e.preventDefault();
	      if (goProxySaving) return;
	      goProxySaving = true;
	      setGoProxyStatus('', '保存中...');
      try {
        const serversJson = JSON.stringify(goProxyServers || []);
        if (goProxyServersJsonInput) goProxyServersJsonInput.value = serversJson;
        const { resp, data } = await postForm(goProxySettingsForm.action, {
          goProxyEnabled: goProxyEnabledInput && goProxyEnabledInput.checked ? '1' : '0',
          goProxyAutoSelect: goProxyAutoSelectInput && goProxyAutoSelectInput.checked ? '1' : '0',
          goProxyServersJson: serversJson,
        });
        if (resp.ok && data && data.success) {
          setGoProxyStatus('success', '保存成功');
        } else {
          setGoProxyStatus('error', (data && data.message) || '保存失败');
        }
	      } catch (_e) {
        setGoProxyStatus('error', '保存失败');
      } finally {
        goProxySaving = false;
      }
    });
  });

  const videoSourceForm = document.getElementById('videoSourceForm');
  const videoSourceSaveStatus = document.getElementById('videoSourceSaveStatus');
  const setVideoSourceSaveStatus = bindInlineStatus(videoSourceSaveStatus);

  const importVideoSourceSitesFromCatPawOpen = async () => {
    const apiBase = await resolveCatPawOpenApiBase();
    const normalizedBase = normalizeCatPawOpenAdminBase(apiBase);
    if (!normalizedBase) {
      setVideoSourceSaveStatus('error', 'CatPawOpen 接口地址未设置');
      return;
    }
    setVideoSourceSaveStatus('', '导入中...');
    try {
      const fullConfig = await requestCatPawOpenAdminJson({
        apiBase: normalizedBase,
        path: 'full-config',
        method: 'GET',
      });
      const list = fullConfig && fullConfig.video && Array.isArray(fullConfig.video.sites) ? fullConfig.video.sites : [];
      const sitesPayload = list
        .map((s) => ({
          key: s && typeof s.key === 'string' ? s.key : '',
          name: s && typeof s.name === 'string' ? s.name : '',
          api: s && typeof s.api === 'string' ? s.api : '',
          type: s && typeof s.type === 'number' ? s.type : undefined,
        }))
        .filter((s) => s.key && s.api);
      if (!sitesPayload.length) {
        setVideoSourceSaveStatus('error', '未获取到站源');
        return;
      }
      const { resp: r2, data: d2 } = await postForm('/dashboard/video/source/sites/import', {
        sites: JSON.stringify(sitesPayload),
      });
      if (r2.ok && d2 && d2.success && Array.isArray(d2.sites)) {
        renderVideoSourceList(d2.sites);
        setVideoSourceSaveStatus('success', '导入成功');
        clearStatusLater(setVideoSourceSaveStatus, 1200);
        return;
      }
      setVideoSourceSaveStatus('error', (d2 && d2.message) || '导入失败');
    } catch (_e) {
      setVideoSourceSaveStatus('error', '导入失败');
    }
  };

  bindOnce(videoSourceImportFromCatPawOpenBtn, () => {
    videoSourceImportFromCatPawOpenBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await withDatasetLock(videoSourceImportFromCatPawOpenBtn, 'pending', async () => {
        videoSourceImportFromCatPawOpenBtn.disabled = true;
        videoSourceImportFromCatPawOpenBtn.classList.add('opacity-60', 'cursor-not-allowed');
        try {
          await importVideoSourceSitesFromCatPawOpen();
        } finally {
          videoSourceImportFromCatPawOpenBtn.disabled = false;
          videoSourceImportFromCatPawOpenBtn.classList.remove('opacity-60', 'cursor-not-allowed');
        }
      });
    });
  });

  bindOnce(videoSourceForm, () => {
    const submitBtn = videoSourceForm.querySelector('button[type="submit"]');
    videoSourceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await withDatasetLock(videoSourceForm, 'pending', async () => {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.add('opacity-60', 'cursor-not-allowed');
        }
        setVideoSourceSaveStatus('', '保存中...');
        try {
          const { resp, data } = await postForm(videoSourceForm.action, formToFields(videoSourceForm));
          if (!(resp.ok && data && data.success)) {
            setVideoSourceSaveStatus('error', (data && data.message) || '保存失败');
            return;
          }

          setVideoSourceSaveStatus('success', '保存成功');

          if (data && Array.isArray(data.sites)) renderVideoSourceList(data.sites);
          else renderVideoSourceList(await fetchVideoSourceSites());

          if (data && Array.isArray(data.pans)) renderPanList(data.pans);
          else renderPanList(await fetchPansList());

          clearStatusLater(setVideoSourceSaveStatus, 1200);
        } catch (_err) {
          setVideoSourceSaveStatus('error', '保存失败');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-60', 'cursor-not-allowed');
          }
        }
      });
    });
  });

  const addUserBtn = document.getElementById('openAddUser');
  const addUserForm = document.getElementById('addUserForm');
  const addUserStatus = document.getElementById('addUserStatus');
  const addUserName = document.getElementById('addUserName');
  const addUserPassword = document.getElementById('addUserPassword');
  const addUserRole = document.getElementById('addUserRole');
  const addUserCatApiBase = document.getElementById('addUserCatApiBase');
  const addUserCatProxy = document.getElementById('addUserCatProxy');
  const confirmAddUser = document.getElementById('confirmAddUser');
  const userCountEl = document.getElementById('userCount');
  const userTableBody = document.getElementById('userTableBody');

  const clearEl = (el) => {
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
  };

  const tagSpan = (className, text) => createEl('span', { className, text });

  const renderTag = (cell, className, text) => {
    if (!cell) return;
    clearEl(cell);
    cell.appendChild(tagSpan(className, text));
  };

  const roleLabel = (role) => {
    if (role === 'admin') return { className: 'tag-yellow', text: '管理员' };
    if (role === 'shared') return { className: 'tag-green', text: '共享' };
    return { className: 'tag-gray', text: '用户' };
  };

  const renderRole = (cell, role) => {
    const { className, text } = roleLabel(role);
    renderTag(cell, className, text);
  };

  const renderConfigured = (cell, value, { whenSet, whenEmpty }) => {
    const has = typeof value === 'string' ? value.trim().length > 0 : !!value;
    const cls = has ? whenSet.className : whenEmpty.className;
    const text = has ? whenSet.text : whenEmpty.text;
    renderTag(cell, cls, text);
  };

  const refreshUserRowCells = (row) => {
    if (!row) return;
    const username = row.getAttribute('data-username') || '';
    const role = row.getAttribute('data-role') || 'user';
    const status = row.getAttribute('data-status') || 'active';
    const catApiBase = row.getAttribute('data-cat-api-base') || '';
    const catProxy = row.getAttribute('data-cat-proxy') || '';

    const nameCell = row.querySelector('td[data-col="username"]') || row.querySelector('td');
    if (nameCell) nameCell.textContent = username;

    renderRole(row.querySelector('td[data-col="role"]'), role);
    renderConfigured(row.querySelector('td[data-col="catApiBase"]'), catApiBase, {
      whenSet: { className: 'tag-green', text: '已设置' },
      whenEmpty: { className: 'tag-red', text: '未设置' },
    });
    renderConfigured(row.querySelector('td[data-col="catProxy"]'), catProxy, {
      whenSet: { className: 'tag-yellow', text: '已设置' },
      whenEmpty: { className: 'tag-green', text: '未设置' },
    });
    renderStatus(row.querySelector('td[data-col="status"]'), status);
  };

  const renderStatus = (cell, status) => {
    if (!cell) return;
    if (status === 'active') {
      renderTag(cell, 'tag-green', '正常');
    } else if (status === 'banned') {
      renderTag(cell, 'tag-red', '封禁');
    } else {
      renderTag(cell, 'tag-gray', status || '');
    }
  };

  const appendUserRow = (user) => {
    if (!userTableBody) return;
    const tr = document.createElement('tr');
    tr.setAttribute('data-username', user.username || '');
    tr.setAttribute('data-role', user.role || 'user');
    tr.setAttribute('data-status', user.status || 'active');
    tr.setAttribute('data-cat-api-base', user.cat_api_base || user.catApiBase || '');
    tr.setAttribute('data-cat-proxy', user.cat_proxy || user.catProxy || '');

    const tdUser = document.createElement('td');
    tdUser.className = 'px-3 py-2 font-semibold whitespace-nowrap';
    tdUser.setAttribute('data-col', 'username');
    tdUser.textContent = user.username || '';

    const tdRole = document.createElement('td');
    tdRole.className = 'px-3 py-2 whitespace-nowrap';
    tdRole.setAttribute('data-col', 'role');
    renderRole(tdRole, user.role || 'user');

    const tdStatus = document.createElement('td');
    tdStatus.className = 'px-3 py-2 whitespace-nowrap';
    tdStatus.setAttribute('data-col', 'status');
    renderStatus(tdStatus, user.status || 'active');

    const tdCatApi = document.createElement('td');
    tdCatApi.className = 'px-3 py-2 whitespace-nowrap';
    tdCatApi.setAttribute('data-col', 'catApiBase');
    renderConfigured(tdCatApi, tr.getAttribute('data-cat-api-base') || '', {
      whenSet: { className: 'tag-green', text: '已设置' },
      whenEmpty: { className: 'tag-red', text: '未设置' },
    });

    const tdCatProxy = document.createElement('td');
    tdCatProxy.className = 'px-3 py-2 whitespace-nowrap';
    tdCatProxy.setAttribute('data-col', 'catProxy');
    renderConfigured(tdCatProxy, tr.getAttribute('data-cat-proxy') || '', {
      whenSet: { className: 'tag-yellow', text: '已设置' },
      whenEmpty: { className: 'tag-green', text: '未设置' },
    });

    const tdActions = document.createElement('td');
    tdActions.className = 'px-3 py-2 whitespace-nowrap';
    const actionGroup = document.createElement('div');
    actionGroup.className = 'action-group';
    const makeBtn = (cls, action, text) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `action-btn ${cls}`;
      b.setAttribute('data-action', action);
      b.textContent = text;
      return b;
    };
    actionGroup.appendChild(makeBtn('blue', 'edit', '修改'));
    if (user.role !== 'admin') {
      const banText = user.status === 'active' ? '封禁' : '解封';
      actionGroup.appendChild(makeBtn('rose', 'ban', banText));
      actionGroup.appendChild(makeBtn('red', 'delete', '删除'));
    }
    tdActions.appendChild(actionGroup);

    tr.appendChild(tdUser);
    tr.appendChild(tdRole);
    tr.appendChild(tdCatApi);
    tr.appendChild(tdCatProxy);
    tr.appendChild(tdStatus);
    tr.appendChild(tdActions);
    userTableBody.appendChild(tr);
  };

  const loadUserPanel = async () => {
    if (panelLoaded.user || panelLoading.user) return;
    if (!userTableBody) return;
    panelLoading.user = true;
    try {
      const data = await getSuccessJson('/dashboard/user/list');
      if (!(data && Array.isArray(data.users))) return;

      userTableBody.innerHTML = '';
      data.users.forEach((u) => appendUserRow(u || {}));
      if (userCountEl) {
        const count =
          typeof data.userCount === 'number'
            ? data.userCount
            : Array.isArray(data.users)
              ? data.users.length
              : 0;
        userCountEl.textContent = String(count);
      }
      panelLoaded.user = true;
    } finally {
      panelLoading.user = false;
    }
  };

  const fetchSiteSettings = async () => getSuccessJson('/dashboard/site/settings');

  const setInputValueByName = (name, value) => {
    const el = document.querySelector(`input[name="${name}"]`);
    if (!el) return;
    el.value = value != null ? String(value) : '';
  };

  const syncCustomSelectValue = (selectId, value) => {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.value = value != null ? String(value) : '';

    const wrapper = sel.parentNode;
    if (wrapper && wrapper.classList && wrapper.classList.contains('custom-dropdown')) {
      const btn = wrapper.querySelector('.custom-dropdown-btn');
      const list = wrapper.querySelector('.custom-dropdown-list');
      const opt = sel.options[sel.selectedIndex];
      if (btn) btn.textContent = (opt && opt.text) || '请选择';
      if (list) {
        list.querySelectorAll('.custom-dropdown-item').forEach((n) => {
          const v = n && n.dataset ? n.dataset.value : '';
          n.classList.toggle('active', v === sel.value);
        });
      }
    }

    sel.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const loadSitePanel = async () => {
    if (panelLoaded.site || panelLoading.site) return;
    panelLoading.site = true;
    try {
      const settings = await fetchSiteSettings();
      if (!settings) return;

      setInputValueByName('siteName', settings.siteName || '');
      setInputValueByName('doubanDataCustom', settings.doubanDataCustom || '');
      setInputValueByName('doubanImgCustom', settings.doubanImgCustom || '');
      syncCustomSelectValue('doubanDataSelect', settings.doubanDataProxy || 'direct');
      syncCustomSelectValue('doubanImgSelect', settings.doubanImgProxy || 'direct-browser');

      panelLoaded.site = true;
    } finally {
      panelLoading.site = false;
    }
  };

  let searchSettingsSites = [];
  let searchSettingsOrder = [];
  let searchSettingsCoverSite = '';
  let searchSettingsSaving = false;

  const setSearchSettingsStatus = bindInlineStatus(searchSettingsSaveStatus);

  const fetchSearchSettings = async () => getSuccessJson('/dashboard/search/settings');

  const saveSearchSettings = async (order, coverSite) => {
    const { resp, data } = await postJsonSafe('/dashboard/search/settings', { order, coverSite });
    if (!resp.ok || !data || data.success !== true) {
      throw new Error((data && data.message) || `HTTP ${resp.status}`);
    }
    return data;
  };

	  const renderSearchSettingsList = () => {
	    if (!searchSettingsList) return;
	    searchSettingsList.innerHTML = '';
	    const sites = Array.isArray(searchSettingsSites) ? searchSettingsSites : [];
	    if (!sites.length) {
	      appendEmptyItem(searchSettingsList);
	      return;
	    }

    const byKey = new Map();
    sites.forEach((s) => {
      if (s && s.key) byKey.set(s.key, s);
    });
    const ordered = (Array.isArray(searchSettingsOrder) ? searchSettingsOrder : [])
      .map((k) => byKey.get(k))
      .filter(Boolean);

    const nameCh = calcChCell(ordered, (site) => (site && (site.name || site.key)) || '');
    if (searchHeaderName) {
      setEllipsisCell(searchHeaderName, {
        width: nameCh.width,
        minWidth: '80px',
        maxWidth: nameCh.maxWidth,
      });
    }
    if (searchHeaderCover) {
      setFixedHeaderCell(searchHeaderCover, 96);
    }
    if (searchHeaderSort) {
      setFixedHeaderCell(searchHeaderSort, 72);
    }

	    ordered.forEach((site, idx) => {
	      const key = (site && site.key) || '';
	      const li = createEl('li', { className: 'tv-row' });

      const name = document.createElement('span');
      name.className = 'text-sm font-medium text-gray-800 dark:text-gray-100 truncate';
      name.textContent = (site && (site.name || site.key)) || '';
      setEllipsisCell(name, {
        width: nameCh.width,
        minWidth: '80px',
        maxWidth: nameCh.maxWidth,
      });

      const coverCell = document.createElement('span');
      setCenterCell(coverCell, fixedCell(96));

      const { label: switchLabel } = createSwitchLabel({
        checked: searchSettingsCoverSite === key,
        disabled: searchSettingsSaving,
        title: searchSettingsCoverSite === key ? '已启用' : '未启用',
        ariaLabel: searchSettingsCoverSite === key ? '已启用' : '未启用',
        inputAttrs: { 'data-cover-key': key },
      });
      coverCell.appendChild(switchLabel);

      const sortCell = document.createElement('span');
      setCenterCell(sortCell, fixedCell(72));
      appendSortButtons(sortCell, {
        dirAttr: 'data-search-sort',
        keyAttr: 'data-site-key',
        key,
        disabledUp: searchSettingsSaving || idx === 0,
        disabledDown: searchSettingsSaving || idx === ordered.length - 1,
      });

      li.appendChild(name);
      li.appendChild(coverCell);
      li.appendChild(sortCell);
      searchSettingsList.appendChild(li);
    });
  };

  const loadSearchPanel = async () => {
    if (panelLoaded.search || panelLoading.search) return;
    if (!searchSettingsList) return;
    panelLoading.search = true;
    setSearchSettingsStatus('', '加载中...');
    try {
      const data = await fetchSearchSettings();
      if (!data) {
        setSearchSettingsStatus('error', '加载失败');
        return;
      }
      searchSettingsSites = Array.isArray(data.sites) ? data.sites : [];
      const search = data.search && typeof data.search === 'object' ? data.search : {};
      searchSettingsOrder = Array.isArray(search.order) ? search.order : [];
      searchSettingsCoverSite = typeof search.coverSite === 'string' ? search.coverSite : '';
      renderSearchSettingsList();
      panelLoaded.search = true;
      setSearchSettingsStatus('', '');
    } finally {
      panelLoading.search = false;
    }
  };

  if (searchSettingsList) {
    const persistSearchSettings = async ({ nextOrder, nextCoverSite }) => {
      if (searchSettingsSaving) return;
      searchSettingsSaving = true;
      setSearchSettingsStatus('', '保存中...');
      try {
        searchSettingsOrder = Array.isArray(nextOrder) ? nextOrder : searchSettingsOrder;
        searchSettingsCoverSite = typeof nextCoverSite === 'string' ? nextCoverSite : searchSettingsCoverSite;
        renderSearchSettingsList();
        const data = await saveSearchSettings(searchSettingsOrder, searchSettingsCoverSite);
        const search = data && data.search && typeof data.search === 'object' ? data.search : {};
        searchSettingsOrder = Array.isArray(search.order) ? search.order : searchSettingsOrder;
        searchSettingsCoverSite = typeof search.coverSite === 'string' ? search.coverSite : searchSettingsCoverSite;
        setSearchSettingsStatus('success', '已保存');
      } catch (err) {
        setSearchSettingsStatus('error', (err && err.message) || '保存失败');
      } finally {
        searchSettingsSaving = false;
        renderSearchSettingsList();
      }
    };

    searchSettingsList.addEventListener('change', async (e) => {
      const target = e && e.target ? e.target : null;
      const input = target && target.closest ? target.closest('input[data-cover-key]') : null;
      if (!input) return;
      const key = (input.getAttribute('data-cover-key') || '').trim();
      if (!key) return;
      if (!input.checked) {
        renderSearchSettingsList();
        return;
      }
      await persistSearchSettings({ nextOrder: searchSettingsOrder, nextCoverSite: key });
    });

    searchSettingsList.addEventListener('click', async (e) => {
      const target = e && e.target ? e.target : null;
      const btn = target && target.closest ? target.closest('button[data-search-sort][data-site-key]') : null;
      if (!btn) return;
      const dir = (btn.getAttribute('data-search-sort') || '').trim();
      const key = (btn.getAttribute('data-site-key') || '').trim();
      if (!dir || !key) return;
      if (searchSettingsSaving) return;

      const idx = searchSettingsOrder.findIndex((k) => k === key);
      if (idx < 0) return;
      const j = dir === 'up' ? idx - 1 : idx + 1;
      if (j < 0 || j >= searchSettingsOrder.length) return;
      const next = swapCopy(searchSettingsOrder, idx, j);

      await persistSearchSettings({ nextOrder: next, nextCoverSite: searchSettingsCoverSite });
    });
  }

  // 魔法匹配：列表清洗正则 + 选集匹配规则
  let magicEpisodeRules = [];
  let magicEpisodeCleanRegexRules = [];
  let magicAggregateRules = [];
  let magicAggregateRegexRules = [];
  let magicSaving = false;

  // Normalize common escapes from pasted regex strings (e.g. `\\d` -> `\d`).
  const normalizeRegexText = (text) => {
    const raw = typeof text === 'string' ? text : '';
    if (!raw) return '';
    return raw.replace(/\\\\(?=[dDsSwWbB.()[\]{}+*?^$|\\\-_/])/g, '\\');
  };

  const decodeEpisodeRule = (rule) => {
    const raw = typeof rule === 'string' ? rule.trim() : '';
    if (!raw) return null;
    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object' && typeof obj.pattern === 'string' && obj.pattern.trim()) {
          return {
            pattern: normalizeRegexText(String(obj.pattern || '').trim()),
            replace: typeof obj.replace === 'string' ? obj.replace : '',
            flags: typeof obj.flags === 'string' ? obj.flags : '',
          };
        }
      } catch (_e) {}
    }
    if (raw.startsWith('/') && raw.lastIndexOf('/') > 0) {
      const last = raw.lastIndexOf('/');
      const pattern = raw.slice(1, last);
      const flags = raw.slice(last + 1);
      if (pattern.trim()) return { pattern: normalizeRegexText(pattern.trim()), replace: '', flags: flags || '' };
    }
    return { pattern: normalizeRegexText(raw), replace: '', flags: '' };
  };

  const encodeEpisodeRule = (rule) => {
    const patternRaw = rule && typeof rule.pattern === 'string' ? rule.pattern.trim() : '';
    const pattern = normalizeRegexText(patternRaw);
    if (!pattern) return '';
    const replace = rule && typeof rule.replace === 'string' ? rule.replace : '';
    const flags = rule && typeof rule.flags === 'string' ? rule.flags.trim() : '';
    const obj = { pattern, replace: replace || '' };
    if (flags) obj.flags = flags;
    try {
      return JSON.stringify(obj);
    } catch (_e) {
      return '';
    }
  };

  const normalizePatternInput = (text) => {
    const raw = typeof text === 'string' ? text.trim() : '';
    if (!raw) return null;
    if (raw.startsWith('/') && raw.lastIndexOf('/') > 0) {
      const last = raw.lastIndexOf('/');
      const pattern = normalizeRegexText(raw.slice(1, last).trim());
      const flags = raw.slice(last + 1).trim();
      if (!pattern) return null;
      return { pattern, flags };
    }
    return { pattern: normalizeRegexText(raw) };
  };

  const buildRegexFromInput = (raw, { defaultFlags = '', forceGlobal = false } = {}) => {
    const parsed = normalizePatternInput(raw);
    if (!parsed || !parsed.pattern) return null;
    const fRaw = typeof parsed.flags === 'string' ? parsed.flags : '';
    let flags = fRaw || (typeof defaultFlags === 'string' ? defaultFlags : '');
    if (forceGlobal && !flags.includes('g')) flags += 'g';
    try {
      return new RegExp(parsed.pattern, flags);
    } catch (_e) {
      return null;
    }
  };

  const normalizeAggregateRegexRuleInput = (text) => {
    const p = normalizePatternInput(text);
    if (!p || !p.pattern) return '';
    const flags = typeof p.flags === 'string' ? p.flags.trim() : '';
    if (flags) return `/${p.pattern}/${flags}`;
    return p.pattern;
  };

  const setMagicStatus = (el, type, text) => setInlineStatus(el, type, text);

  const setMagicTestOutput = bindInlineStatus(magicEpisodeRuleTestOutput);
  const setMagicAggregateTestOutput = bindInlineStatus(magicAggregateRuleTestOutput);

  const normalizeReplaceTemplate = (replaceRaw) => {
    const r = typeof replaceRaw === 'string' ? replaceRaw : '';
    return r ? r.replace(/\\(\d+)/g, '$$$1') : '';
  };

	  const runMagicEpisodeRuleTest = () => {
	    if (!magicEpisodeRuleTestInput) return;
	    const filename = (magicEpisodeRuleTestInput.value || '').trim();
	    if (!filename) {
	      setMagicTestOutput('', '请输入文件名');
      return;
    }
    const list = Array.isArray(magicEpisodeRules) ? magicEpisodeRules : [];
    if (!list.length) {
      setMagicTestOutput('error', '无匹配规则');
      return;
	    }
	
	    let cleaned = filename;
	    const cleanRules = Array.isArray(magicEpisodeCleanRegexRules) ? magicEpisodeCleanRegexRules : [];
	    cleanRules.forEach((r) => {
	      const raw = typeof r === 'string' ? r.trim() : '';
	      if (!raw) return;
	      const re = buildRegexFromInput(raw, { defaultFlags: 'g', forceGlobal: true });
	      if (!re) return;
	      cleaned = cleaned.replace(re, '');
	    });
	    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    const failures = [];
    for (let i = 0; i < list.length; i += 1) {
      const rule = list[i] && typeof list[i] === 'object' ? list[i] : null;
      const pattern = rule && typeof rule.pattern === 'string' ? rule.pattern.trim() : '';
      if (!pattern) continue;
      const flags = rule && typeof rule.flags === 'string' && rule.flags.trim() ? rule.flags.trim() : 'i';
      let re = null;
      try {
        re = new RegExp(pattern, flags);
      } catch (e) {
        failures.push(`#${i + 1} 正则无效`);
        continue;
      }
      if (!re.test(cleaned)) continue;
      const replace = normalizeReplaceTemplate(rule && typeof rule.replace === 'string' ? rule.replace : '');
      if (!replace) {
        setMagicTestOutput('success', `命中第 ${i + 1} 条：未设置 replace（无改写）`);
        return;
      }
      let out = '';
      try {
        out = cleaned.replace(re, replace);
      } catch (_e) {
        out = '';
      }
      if (!out) {
        setMagicTestOutput('error', `命中第 ${i + 1} 条，但改写失败`);
        return;
      }
      setMagicTestOutput('success', `命中第 ${i + 1} 条：${out}`);
      return;
    }

    if (failures.length) {
      setMagicTestOutput('error', `未命中（${failures.join('，')}）`);
      return;
    }
    setMagicTestOutput('error', '未命中');
  };

  const runMagicAggregateRuleTest = () => {
    if (!magicAggregateRuleTestInput) return;
    const raw = (magicAggregateRuleTestInput.value || '').trim();
    if (!raw) {
      setMagicAggregateTestOutput('', '请输入文本');
      return;
    }

    const keywordRules = Array.isArray(magicAggregateRules) ? magicAggregateRules : [];
    const regexRules = Array.isArray(magicAggregateRegexRules) ? magicAggregateRegexRules : [];
    if (!keywordRules.length && !regexRules.length) {
      setMagicAggregateTestOutput('error', '无清洗规则');
      return;
    }

    let out = String(raw);

    const tokens = [];
    keywordRules.forEach((r) => {
      const s = typeof r === 'string' ? r.trim() : '';
      if (!s) return;
      s.split(/[、,，\s]+/g)
        .map((t) => t.trim())
        .filter(Boolean)
        .forEach((t) => tokens.push(t));
    });
    tokens.forEach((t) => {
      if (!t) return;
      out = out.split(t).join('');
    });

    const failures = [];
    regexRules.forEach((rule, idx) => {
      const s = typeof rule === 'string' ? rule.trim() : '';
      if (!s) return;
      try {
        const re = buildRegexFromInput(s, { defaultFlags: 'g', forceGlobal: true });
        if (!re) throw new Error('invalid');
        out = out.replace(re, '');
      } catch (_e) {
        failures.push(`#${idx + 1} 正则无效`);
      }
    });

    if (failures.length) {
      setMagicAggregateTestOutput('error', `清洗失败（${failures.join('，')}）`);
      return;
    }

    setMagicAggregateTestOutput('success', `清洗后：${out}`);
  };

  const fetchMagicSettings = async () => getSuccessJson('/dashboard/magic/settings');

	  const saveMagicSettings = async (episodeCleanRegexRules, episodeRules, aggregateRules, aggregateRegexRules) => {
	    const cleanRules = Array.isArray(episodeCleanRegexRules) ? episodeCleanRegexRules : [];
	    const { resp, data } = await postJsonSafe('/dashboard/magic/settings', {
	      episodeCleanRegex: cleanRules[0] || '',
	      episodeCleanRegexRules: cleanRules,
	      episodeRules,
	      aggregateRules,
	      aggregateRegexRules,
	    });
	    if (!resp.ok || !data || data.success !== true) {
	      throw new Error((data && data.message) || `HTTP ${resp.status}`);
    }
    return data;
  };

	  const renderMagicRuleList = (listEl, rules, kind) => {
	    if (!listEl) return;
	    listEl.innerHTML = '';
	    const list = Array.isArray(rules) ? rules : [];
	    if (!list.length) {
	      appendEmptyItem(listEl);
	      return;
	    }

	    list.forEach((rule, idx) => {
	      const li = createEl('li', { className: 'tv-row' });
	      const seq = createEl('span', { className: CLS.mutedMonoXs, text: `${idx + 1}.` });

	      if (kind === 'episode') {
	        const r = rule && typeof rule === 'object' ? rule : { pattern: '', replace: '', flags: '' };

	        const inputs = createEl('div', { className: 'flex items-center gap-2 min-w-0' });
	        setStyles(inputs, { flex: '0 0 50%', maxWidth: '50%', minWidth: '0' });

	        const patternInput = createEl('input', { className: 'tv-field min-w-0' });
	        setStyles(patternInput, { flex: '5 1 0', minWidth: '0' });
	        patternInput.value = typeof r.pattern === 'string' ? r.pattern : '';
	        patternInput.disabled = magicSaving;
	        patternInput.setAttribute('data-magic-kind', kind);
	        patternInput.setAttribute('data-magic-idx', String(idx));
	        patternInput.setAttribute('data-magic-field', 'pattern');

	        const replaceInput = createEl('input', { className: 'tv-field min-w-0' });
	        setStyles(replaceInput, { flex: '1 1 0', minWidth: '0' });
	        replaceInput.value = typeof r.replace === 'string' ? r.replace : '';
	        replaceInput.placeholder = 'replace（可空）';
	        replaceInput.disabled = magicSaving;
	        replaceInput.setAttribute('data-magic-kind', kind);
	        replaceInput.setAttribute('data-magic-idx', String(idx));
	        replaceInput.setAttribute('data-magic-field', 'replace');

	        inputs.appendChild(patternInput);
	        inputs.appendChild(replaceInput);
	        li.appendChild(seq);
	        li.appendChild(inputs);
	      } else {
	        const inputs = createEl('div', { className: 'min-w-0' });
	        setStyles(inputs, { flex: '0 0 50%', maxWidth: '50%', minWidth: '0' });

	        const input = createEl('input', { className: 'tv-field min-w-0' });
	        input.value = typeof rule === 'string' ? rule : '';
	        input.disabled = magicSaving;
	        input.setAttribute('data-magic-kind', kind);
	        input.setAttribute('data-magic-idx', String(idx));
	        inputs.appendChild(input);

	        li.appendChild(seq);
	        li.appendChild(inputs);
	      }

	      if (kind === 'episode') {
	        const save = createEl('button', { className: 'action-btn green', text: '保存' });
	        save.type = 'button';
	        save.disabled = magicSaving;
	        save.setAttribute('data-magic-save', kind);
	        save.setAttribute('data-magic-idx', String(idx));
	        li.appendChild(save);
	      }

	      const del = createEl('button', { className: 'action-btn red', text: '删除' });
	      del.type = 'button';
	      del.disabled = magicSaving;
	      del.setAttribute('data-magic-del', kind);
	      del.setAttribute('data-magic-idx', String(idx));
	      li.appendChild(del);
	      listEl.appendChild(li);
	    });
	  };

	  const renderMagicPanels = () => {
	    renderMagicRuleList(magicEpisodeCleanRegexRuleList, magicEpisodeCleanRegexRules, 'episodeCleanRegex');
	    renderMagicRuleList(magicEpisodeRuleList, magicEpisodeRules, 'episode');
	    renderMagicRuleList(magicAggregateRuleList, magicAggregateRules, 'aggregate');
	    renderMagicRuleList(magicAggregateRegexRuleList, magicAggregateRegexRules, 'aggregateRegex');
	    setMagicTestOutput('', '');
	    setMagicAggregateTestOutput('', '');
	  };

	  const persistMagic = async () => {
	    if (magicSaving) return;
	    magicSaving = true;
	    setMagicStatus(magicEpisodeCleanRegexRuleStatus, '', '保存中...');
	    setMagicStatus(magicEpisodeRuleStatus, '', '保存中...');
	    setMagicStatus(magicAggregateRuleStatus, '', '保存中...');
	    setMagicStatus(magicAggregateRegexRuleStatus, '', '保存中...');
	    try {
	      const episodeRulesForSave = (Array.isArray(magicEpisodeRules) ? magicEpisodeRules : [])
	        .map(encodeEpisodeRule)
	        .filter(Boolean);
	      const data = await saveMagicSettings(
	        magicEpisodeCleanRegexRules,
	        episodeRulesForSave,
	        magicAggregateRules,
	        Array.isArray(magicAggregateRegexRules) ? magicAggregateRegexRules : []
	      );
	      magicEpisodeCleanRegexRules = Array.isArray(data.episodeCleanRegexRules)
	        ? data.episodeCleanRegexRules
	        : typeof data.episodeCleanRegex === 'string' && data.episodeCleanRegex.trim()
	          ? [data.episodeCleanRegex.trim()]
	          : magicEpisodeCleanRegexRules;
	      magicEpisodeRules = Array.isArray(data.episodeRules)
	        ? data.episodeRules.map(decodeEpisodeRule).filter(Boolean)
	        : magicEpisodeRules;
	      magicAggregateRules = Array.isArray(data.aggregateRules) ? data.aggregateRules : magicAggregateRules;
      magicAggregateRegexRules = Array.isArray(data.aggregateRegexRules)
        ? data.aggregateRegexRules
        : magicAggregateRegexRules;
	      renderMagicPanels();
	      setMagicStatus(magicEpisodeCleanRegexRuleStatus, 'success', '已保存');
	      setMagicStatus(magicEpisodeRuleStatus, 'success', '已保存');
	      setMagicStatus(magicAggregateRuleStatus, 'success', '已保存');
	      setMagicStatus(magicAggregateRegexRuleStatus, 'success', '已保存');
	    } catch (err) {
	      const msg = (err && err.message) || '保存失败';
	      setMagicStatus(magicEpisodeCleanRegexRuleStatus, 'error', msg);
	      setMagicStatus(magicEpisodeRuleStatus, 'error', msg);
	      setMagicStatus(magicAggregateRuleStatus, 'error', msg);
	      setMagicStatus(magicAggregateRegexRuleStatus, 'error', msg);
	    } finally {
	      magicSaving = false;
      renderMagicPanels();
    }
  };

	  const loadMagicPanel = async () => {
	    if (panelLoaded.magic || panelLoading.magic) return;
	    if (!magicEpisodeRuleList && !magicAggregateRuleList) return;
	    panelLoading.magic = true;
	    setMagicStatus(magicEpisodeCleanRegexRuleStatus, '', '加载中...');
	    setMagicStatus(magicEpisodeRuleStatus, '', '加载中...');
	    setMagicStatus(magicAggregateRuleStatus, '', '加载中...');
	    setMagicStatus(magicAggregateRegexRuleStatus, '', '加载中...');
	    try {
	      const data = await fetchMagicSettings();
	      if (!data) {
	        setMagicStatus(magicEpisodeCleanRegexRuleStatus, 'error', '加载失败');
	        setMagicStatus(magicEpisodeRuleStatus, 'error', '加载失败');
	        setMagicStatus(magicAggregateRuleStatus, 'error', '加载失败');
	        setMagicStatus(magicAggregateRegexRuleStatus, 'error', '加载失败');
	        return;
      }
	      magicEpisodeRules = Array.isArray(data.episodeRules)
	        ? data.episodeRules.map(decodeEpisodeRule).filter(Boolean)
	        : [];
	      magicEpisodeCleanRegexRules = Array.isArray(data.episodeCleanRegexRules)
	        ? data.episodeCleanRegexRules
	        : typeof data.episodeCleanRegex === 'string' && data.episodeCleanRegex.trim()
	          ? [data.episodeCleanRegex.trim()]
	          : [];
	      magicAggregateRules = Array.isArray(data.aggregateRules) ? data.aggregateRules : [];
	      magicAggregateRegexRules = Array.isArray(data.aggregateRegexRules) ? data.aggregateRegexRules : [];
	      renderMagicPanels();
	      setMagicStatus(magicEpisodeCleanRegexRuleStatus, '', '');
	      setMagicStatus(magicEpisodeRuleStatus, '', '');
	      setMagicStatus(magicAggregateRuleStatus, '', '');
	      setMagicStatus(magicAggregateRegexRuleStatus, '', '');
	      panelLoaded.magic = true;
	    } finally {
      panelLoading.magic = false;
    }
  };

  if (magicEpisodeRuleAdd && magicEpisodeRulePatternInput && magicEpisodeRuleReplaceInput) {
    magicEpisodeRuleAdd.addEventListener('click', async () => {
      const p = normalizePatternInput(magicEpisodeRulePatternInput.value || '');
      if (!p) return;
      const replace = (magicEpisodeRuleReplaceInput.value || '').trim();
      magicEpisodeRulePatternInput.value = '';
      magicEpisodeRuleReplaceInput.value = '';
      magicEpisodeRules = (Array.isArray(magicEpisodeRules) ? magicEpisodeRules : []).concat([
        { pattern: p.pattern, replace, flags: p.flags || '' },
      ]);
      renderMagicPanels();
      await persistMagic();
    });
  }

  if (magicEpisodeRuleTestBtn) {
    magicEpisodeRuleTestBtn.addEventListener('click', () => runMagicEpisodeRuleTest());
  }
  if (magicEpisodeRuleTestInput) {
    magicEpisodeRuleTestInput.addEventListener('keydown', (e) => {
      if (!e) return;
      const key = e.key || '';
      if (key === 'Enter') {
        e.preventDefault();
        runMagicEpisodeRuleTest();
      }
    });
  }

	  if (magicEpisodeCleanRegexRuleAdd && magicEpisodeCleanRegexRuleInput) {
	    magicEpisodeCleanRegexRuleAdd.addEventListener('click', async () => {
	      const v = normalizeAggregateRegexRuleInput(magicEpisodeCleanRegexRuleInput.value || '');
	      if (!v) return;
	      magicEpisodeCleanRegexRuleInput.value = '';
	      magicEpisodeCleanRegexRules = (Array.isArray(magicEpisodeCleanRegexRules) ? magicEpisodeCleanRegexRules : []).concat([v]);
	      renderMagicPanels();
	      await persistMagic();
	    });
	  }

  if (magicAggregateRuleAdd && magicAggregateRuleInput) {
    magicAggregateRuleAdd.addEventListener('click', async () => {
      const v = (magicAggregateRuleInput.value || '').trim();
      if (!v) return;
      magicAggregateRuleInput.value = '';
      magicAggregateRules = (Array.isArray(magicAggregateRules) ? magicAggregateRules : []).concat([v]);
      renderMagicPanels();
      await persistMagic();
    });
  }

  if (magicAggregateRegexRuleAdd && magicAggregateRegexRuleInput) {
    magicAggregateRegexRuleAdd.addEventListener('click', async () => {
      const v = normalizeAggregateRegexRuleInput(magicAggregateRegexRuleInput.value || '');
      if (!v) return;
      magicAggregateRegexRuleInput.value = '';
      magicAggregateRegexRules = (Array.isArray(magicAggregateRegexRules) ? magicAggregateRegexRules : []).concat([v]);
      renderMagicPanels();
      await persistMagic();
    });
  }

  if (magicAggregateRuleTestBtn) {
    magicAggregateRuleTestBtn.addEventListener('click', () => runMagicAggregateRuleTest());
  }
  if (magicAggregateRuleTestInput) {
    magicAggregateRuleTestInput.addEventListener('keydown', (e) => {
      if (!e) return;
      const key = e.key || '';
      if (key === 'Enter') {
        e.preventDefault();
        runMagicAggregateRuleTest();
      }
    });
  }

	  const onMagicListClick = async (e) => {
	    const target = e && e.target ? e.target : null;
	    const saveBtn = target && target.closest ? target.closest('button[data-magic-save][data-magic-idx]') : null;
	    if (saveBtn) {
	      if (magicSaving) return;
	      await persistMagic();
	      return;
	    }
	    const btn = target && target.closest ? target.closest('button[data-magic-del][data-magic-idx]') : null;
	    if (!btn) return;
	    const kind = (btn.getAttribute('data-magic-del') || '').trim();
	    const idx = Number(btn.getAttribute('data-magic-idx') || -1);
	    if (!Number.isFinite(idx) || idx < 0) return;
	    if (magicSaving) return;
	    if (kind === 'episodeCleanRegex')
	      magicEpisodeCleanRegexRules = magicEpisodeCleanRegexRules.filter((_r, i) => i !== idx);
	    if (kind === 'episode') magicEpisodeRules = magicEpisodeRules.filter((_r, i) => i !== idx);
	    if (kind === 'aggregate') magicAggregateRules = magicAggregateRules.filter((_r, i) => i !== idx);
	    if (kind === 'aggregateRegex') magicAggregateRegexRules = magicAggregateRegexRules.filter((_r, i) => i !== idx);
	    renderMagicPanels();
	    await persistMagic();
	  };

	  const onMagicListChange = async (e) => {
	    const target = e && e.target ? e.target : null;
	    const input = target && target.closest ? target.closest('input[data-magic-kind][data-magic-idx]') : null;
	    if (!input) return;
	    const kind = (input.getAttribute('data-magic-kind') || '').trim();
	    const idx = Number(input.getAttribute('data-magic-idx') || -1);
	    const val = (input.value || '').trim();
	    if (!Number.isFinite(idx) || idx < 0) return;
	    if (kind === 'episode' && idx < magicEpisodeRules.length) {
	      const field = (input.getAttribute('data-magic-field') || '').trim();
	      const r = magicEpisodeRules[idx] && typeof magicEpisodeRules[idx] === 'object' ? magicEpisodeRules[idx] : {};
	      if (field === 'replace') r.replace = val;
	      else r.pattern = normalizeRegexText(val);
	      magicEpisodeRules[idx] = r;
	      renderMagicPanels();
	      return;
	    }
	    if (kind === 'aggregate' && idx < magicAggregateRules.length) magicAggregateRules[idx] = val;
	    if (kind === 'aggregateRegex' && idx < magicAggregateRegexRules.length) {
	      magicAggregateRegexRules[idx] = normalizeAggregateRegexRuleInput(val);
	      renderMagicPanels();
	      await persistMagic();
	      return;
	    }
	    if (kind === 'episodeCleanRegex' && idx < magicEpisodeCleanRegexRules.length) {
	      magicEpisodeCleanRegexRules[idx] = normalizeAggregateRegexRuleInput(val);
	      renderMagicPanels();
	      await persistMagic();
	      return;
	    }
	    await persistMagic();
	  };

	  if (magicEpisodeCleanRegexRuleList) {
	    magicEpisodeCleanRegexRuleList.addEventListener('click', onMagicListClick);
	    magicEpisodeCleanRegexRuleList.addEventListener('change', onMagicListChange);
	  }
	  if (magicEpisodeRuleList) {
	    magicEpisodeRuleList.addEventListener('click', onMagicListClick);
	    magicEpisodeRuleList.addEventListener('change', onMagicListChange);
	  }
  if (magicAggregateRuleList) {
    magicAggregateRuleList.addEventListener('click', onMagicListClick);
    magicAggregateRuleList.addEventListener('change', onMagicListChange);
  }
  if (magicAggregateRegexRuleList) {
    magicAggregateRegexRuleList.addEventListener('click', onMagicListClick);
    magicAggregateRegexRuleList.addEventListener('change', onMagicListChange);
  }

  function ensurePanelDataLoaded(key) {
    if (key === 'site') return loadSitePanel();
    if (key === 'user') return loadUserPanel();
    if (key === 'video') return loadVideoPanel();
    if (key === 'pan') return loadPanPanel();
    if (key === 'interface') return loadInterfacePanel();
    if (key === 'search') return loadSearchPanel();
    if (key === 'magic') return loadMagicPanel();
    return null;
  }

  if (initialPanelKey) {
    ensurePanelDataLoaded(initialPanelKey);
  }

  if (
    addUserBtn &&
    addUserForm &&
    addUserName &&
    addUserPassword &&
    addUserRole &&
    addUserCatApiBase &&
    addUserCatProxy &&
    confirmAddUser
  ) {
    addUserBtn.type = 'button';
    addUserBtn.setAttribute('aria-controls', 'addUserForm');
    addUserBtn.setAttribute('aria-expanded', 'false');

    const setAddUserStatus = bindInlineStatus(addUserStatus);

    const syncSubmitState = () => {
      const enabled =
        (addUserName.value || '').trim().length > 0 &&
        (addUserPassword.value || '').trim().length > 0;
      confirmAddUser.disabled = !enabled;
      confirmAddUser.classList.toggle('active', enabled);
    };

    const setFormVisible = (visible) => {
      addUserForm.hidden = !visible;
      addUserBtn.textContent = visible ? '取消' : '添加用户';
      addUserBtn.setAttribute('aria-expanded', visible ? 'true' : 'false');
      if (visible) {
        addUserName.focus();
      }
      else setAddUserStatus('', '');
      syncSubmitState();
    };

    setFormVisible(false);

    setupCustomSelectElement(addUserRole);

    addUserBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setFormVisible(addUserForm.hidden);
    });

    addUserForm.addEventListener('input', () => {
      setAddUserStatus('', '');
      syncSubmitState();
    });

    addUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      syncSubmitState();
      if (confirmAddUser.disabled) return;
      const fields = formToFields(addUserForm);
      const username = (fields.username || '').trim();
      const password = (fields.password || '').trim();
      const roleRaw = (fields.role || '').trim();
      const role = roleRaw === 'shared' ? 'shared' : 'user';
      const catApiBase = (fields.catApiBase || '').trim();
      const catProxy = (fields.catProxy || '').trim();
      if (!username || !password) return;

      confirmAddUser.disabled = true;
      confirmAddUser.classList.remove('active');
      setAddUserStatus('info', '添加中...');

      try {
        const { resp, data } = await postForm('/dashboard/user/add', {
          username,
          password,
          role,
          catApiBase,
          catProxy,
        });
        if (resp.ok && data.success) {
          setAddUserStatus('success', '添加成功');
          appendUserRow({
            username,
            role,
            status: 'active',
            cat_api_base: catApiBase,
            cat_proxy: catProxy,
          });
          addUserForm.reset();
          syncCustomSelectValue('addUserRole', 'user');
          if (userCountEl) {
            const num = parseInt(userCountEl.textContent || '0', 10);
            userCountEl.textContent = (num + 1).toString();
          }
          syncSubmitState();
          setFormVisible(false);
        } else {
          setAddUserStatus('error', data.message || '添加失败');
          syncSubmitState();
        }
      } catch (err) {
        setAddUserStatus('error', '添加失败');
        syncSubmitState();
      }
    });
  }

  if (userTableBody) {
    userTableBody.addEventListener('click', async (e) => {
      const target = e.target;
      if (!target || !target.closest) return;
      const btn = target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (!action) return;
      const row = btn.closest('tr');
      if (!row) return;
      const username = row.getAttribute('data-username') || '';
      const role = row.getAttribute('data-role') || '';
      if (!username) return;
      if (role === 'admin' && (action === 'ban' || action === 'delete')) return;

      const removeEditor = () => {
        const existing = userTableBody.querySelector('tr.user-edit-row');
        if (existing) existing.remove();
      };

      if (action === 'edit') {
        const existing = userTableBody.querySelector('tr.user-edit-row');
        const existingFor = existing ? existing.getAttribute('data-for') || '' : '';
        if (existing && existingFor === username) {
          existing.remove();
          return;
        }
        removeEditor();

        const editTr = document.createElement('tr');
        editTr.className = 'user-edit-row';
        editTr.setAttribute('data-for', username);

        const editTd = document.createElement('td');
        editTd.colSpan = 6;
        editTd.className = 'px-3 py-3';

        const box = document.createElement('div');
        box.className = 'user-edit-box';

        const grid = document.createElement('div');
        grid.className = 'grid items-center';
        grid.style.gridTemplateColumns = 'max-content 1fr';
        grid.style.gap = '14px 18px';

        const appendLabeledField = (labelText, controlEl) => {
          const labelEl = document.createElement('span');
          labelEl.className =
            'text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap';
          labelEl.textContent = labelText;

          const controlCell = document.createElement('div');
          controlCell.className = 'min-w-0';
          controlCell.appendChild(controlEl);

          grid.appendChild(labelEl);
          grid.appendChild(controlCell);
          return controlCell;
        };

	        const newUserInput = document.createElement('input');
	        newUserInput.type = 'text';
	        newUserInput.placeholder = '新用户名';
	        newUserInput.className = 'tv-field';

	        const newPassInput = document.createElement('input');
	        newPassInput.type = 'password';
	        newPassInput.placeholder = '新密码';
	        newPassInput.className = 'tv-field';

        const originalRole = (row.getAttribute('data-role') || '').trim() || 'user';
        let roleSelect = null;
	        if (role !== 'admin') {
	          roleSelect = document.createElement('select');
	          roleSelect.className = 'tv-field';
	          const optUser = document.createElement('option');
	          optUser.value = 'user';
	          optUser.textContent = '用户';
          const optShared = document.createElement('option');
          optShared.value = 'shared';
          optShared.textContent = '共享';
          roleSelect.appendChild(optUser);
          roleSelect.appendChild(optShared);
          roleSelect.value = originalRole === 'shared' ? 'shared' : 'user';
        }

	        const catApiInput = document.createElement('input');
	        catApiInput.type = 'text';
	        catApiInput.placeholder = 'CatPawOpen 接口地址（可留空）';
	        catApiInput.className = 'tv-field';
        const originalCatApi = (row.getAttribute('data-cat-api-base') || '').trim();
        catApiInput.value = originalCatApi;

	        const catProxyInput = document.createElement('input');
	        catProxyInput.type = 'text';
	        catProxyInput.placeholder = 'CatPawOpen 全局代理地址（可留空）';
	        catProxyInput.className = 'tv-field';
        const originalCatProxy = (row.getAttribute('data-cat-proxy') || '').trim();
        catProxyInput.value = originalCatProxy;

        appendLabeledField('新用户名：', newUserInput);
        appendLabeledField('新密码：', newPassInput);
        if (roleSelect) {
          appendLabeledField('角色：', roleSelect);
          setupCustomSelectElement(roleSelect);
        }
        appendLabeledField('Cat接口：', catApiInput);
        appendLabeledField('Cat代理：', catProxyInput);

        const actions = document.createElement('div');
        actions.className = 'action-group mt-3';

        const okBtn = document.createElement('button');
        okBtn.type = 'button';
        okBtn.className = 'action-btn green';
        okBtn.textContent = '确定';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'action-btn gray';
        cancelBtn.textContent = '取消';

	        const status = document.createElement('div');
	        status.className = 'text-sm mt-2 hidden';
	        const setEditStatus = bindInlineStatus(status);

	        const setButtonEnabled = (button, enabled) => {
	          if (!button) return;
	          const ok = !!enabled;
	          button.disabled = !ok;
	          button.style.opacity = ok ? '1' : '0.6';
	          button.style.cursor = ok ? 'pointer' : 'not-allowed';
	        };

        const syncOk = () => {
          const hasUser = (newUserInput.value || '').trim().length > 0;
          const hasPass = (newPassInput.value || '').trim().length > 0;
          const roleChanged = !!roleSelect && (roleSelect.value || 'user') !== (originalRole === 'shared' ? 'shared' : 'user');
          const apiChanged = ((catApiInput.value || '').trim()) !== originalCatApi;
          const proxyChanged = ((catProxyInput.value || '').trim()) !== originalCatProxy;
	          const enabled = hasUser || hasPass || roleChanged || apiChanged || proxyChanged;
	          setButtonEnabled(okBtn, enabled);
	        };

        newUserInput.addEventListener('input', () => {
          setEditStatus('', '');
          syncOk();
        });
        newPassInput.addEventListener('input', () => {
          setEditStatus('', '');
          syncOk();
        });
        if (roleSelect) {
          roleSelect.addEventListener('change', () => {
            setEditStatus('', '');
            syncOk();
          });
        }
        catApiInput.addEventListener('input', () => {
          setEditStatus('', '');
          syncOk();
        });
        catProxyInput.addEventListener('input', () => {
          setEditStatus('', '');
          syncOk();
        });
        syncOk();

        cancelBtn.addEventListener('click', () => editTr.remove());

	        okBtn.addEventListener('click', async () => {
	          syncOk();
	          if (okBtn.disabled) return;
	          okBtn.disabled = true;
	          setEditStatus('', '保存中...');
	          try {
	            const fields = { username };
	            const newU = (newUserInput.value || '').trim();
	            const newP = (newPassInput.value || '').trim();
	            if (newU) fields.newUsername = newU;
	            if (newP) fields.newPassword = newP;
	            if (roleSelect) {
	              const nextRole = (roleSelect.value || '').trim();
	              const normNext = nextRole === 'shared' ? 'shared' : 'user';
	              const normOrig = originalRole === 'shared' ? 'shared' : 'user';
	              if (normNext !== normOrig) fields.role = normNext;
	            }
	            const nextApi = (catApiInput.value || '').trim();
	            const nextProxy = (catProxyInput.value || '').trim();
	            if (nextApi !== originalCatApi) fields.catApiBase = nextApi;
	            if (nextProxy !== originalCatProxy) fields.catProxy = nextProxy;
	            const { resp, data } = await postForm('/dashboard/user/update', fields);
		            if (resp.ok && data.success) {
		              const finalUsername = data.username || username;
		              row.setAttribute('data-username', finalUsername);
		              if (roleSelect) {
		                const nextRole = (data.role || roleSelect.value || 'user').trim();
		                const roleValue = nextRole === 'shared' ? 'shared' : 'user';
		                row.setAttribute('data-role', roleValue);
		              }
		              if (Object.prototype.hasOwnProperty.call(data, 'catApiBase'))
		                row.setAttribute('data-cat-api-base', data.catApiBase || '');
		              else row.setAttribute('data-cat-api-base', nextApi);
		              if (Object.prototype.hasOwnProperty.call(data, 'catProxy'))
		                row.setAttribute('data-cat-proxy', data.catProxy || '');
		              else row.setAttribute('data-cat-proxy', nextProxy);
		              refreshUserRowCells(row);
		              setEditStatus('success', '保存成功');
		              editTr.remove();
		            } else {
		              setEditStatus('error', data.message || '保存失败');
            }
          } catch (err) {
            setEditStatus('error', '保存失败');
          } finally {
            okBtn.disabled = false;
            syncOk();
          }
        });

        actions.appendChild(okBtn);
        actions.appendChild(cancelBtn);

        box.appendChild(grid);
        box.appendChild(actions);
        box.appendChild(status);
        editTd.appendChild(box);
        editTr.appendChild(editTd);

        row.insertAdjacentElement('afterend', editTr);
        newUserInput.focus();
        return;
      }

      if (action === 'ban') {
        btn.disabled = true;
        try {
          const { resp, data } = await postForm('/dashboard/user/ban', { username });
          if (resp.ok && data.success && data.status) {
            const nextStatus = data.status;
            row.setAttribute('data-status', nextStatus);
            const statusCell = row.querySelector('td[data-col="status"]');
            renderStatus(statusCell, nextStatus);
            btn.textContent = nextStatus === 'active' ? '封禁' : '解封';
          } else {
            // eslint-disable-next-line no-alert
            alert(data.message || '操作失败');
          }
        } catch (err) {
          // eslint-disable-next-line no-alert
          alert('操作失败');
        } finally {
          btn.disabled = false;
        }
      }

      if (action === 'delete') {
        // eslint-disable-next-line no-alert
        if (!confirm(`确定删除用户：${username}？`)) return;
        btn.disabled = true;
        try {
          const { resp, data } = await postForm('/dashboard/user/delete', { username });
          if (resp.ok && data.success) {
            removeEditor();
            row.remove();
            if (userCountEl) {
              const num = parseInt(userCountEl.textContent || '0', 10);
              userCountEl.textContent = Math.max(0, num - 1).toString();
            }
          } else {
            // eslint-disable-next-line no-alert
            alert(data.message || '删除失败');
          }
        } catch (err) {
          // eslint-disable-next-line no-alert
          alert('删除失败');
        } finally {
          btn.disabled = false;
        }
      }
    });
  }
}
