import { requestCatSpider } from './catpawopen';
import { createPosterCard } from './posterCard';

export function initSearchPage() {
  const historyEndpoint = '/api/searchhistory';
  const sitesEndpoint = '/api/user/sites';
  const AGG_STORAGE_KEY = 'tv:search:aggregate:sources:v1';

  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const clearQueryBtn = document.getElementById('clearQueryBtn');

  const resultsSection = document.getElementById('searchResultsSection');
  const resultsSummary = document.getElementById('searchResultsSummary');
  const resultsStatus = document.getElementById('searchResultsStatus');
  const resultsList = document.getElementById('searchResultsList');

  const historySection = document.getElementById('searchHistorySection');
  const chipsBox = document.getElementById('searchHistoryChips');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  if (
    !form ||
    !input ||
    !clearQueryBtn ||
    !resultsSection ||
    !resultsSummary ||
    !resultsStatus ||
    !resultsList ||
    !historySection ||
    !chipsBox ||
    !clearHistoryBtn
  ) {
    return;
  }

  const configEl = document.getElementById('homeDoubanConfig');
  let catApiBase = (configEl && configEl.getAttribute('data-cat-api-base')) || '';
  const tvUser = (configEl && configEl.getAttribute('data-tv-user')) || '';
  let searchConcurrency = 5;
  let searchCoverSiteKey = '';
  let siteOrderList = [];
  let siteOrderMap = new Map();
  let magicAggregateRules = [];

  const safeParseJsonArray = (text) => {
    try {
      const arr = JSON.parse(typeof text === 'string' ? text : '');
      return Array.isArray(arr) ? arr : [];
    } catch (_e) {
      return [];
    }
  };

  const refreshSearchConfigFromDom = () => {
    catApiBase = (configEl && configEl.getAttribute('data-cat-api-base')) || '';
    const threadRaw = (configEl && configEl.getAttribute('data-search-thread-count')) || '5';
    const threadNum = Number(threadRaw);
    searchConcurrency =
      Number.isFinite(threadNum) && threadNum > 0 ? Math.min(50, Math.floor(threadNum)) : 5;

    const orderRaw = (configEl && configEl.getAttribute('data-search-site-order')) || '[]';
    siteOrderList = safeParseJsonArray(orderRaw)
      .map((k) => (typeof k === 'string' ? k.trim() : ''))
      .filter(Boolean);
    siteOrderMap = new Map();
    siteOrderList.forEach((k, idx) => {
      if (!siteOrderMap.has(k)) siteOrderMap.set(k, idx);
    });

    searchCoverSiteKey = ((configEl && configEl.getAttribute('data-search-cover-site')) || '').trim();

    const magicRaw = (configEl && configEl.getAttribute('data-magic-aggregate-rules')) || '[]';
    magicAggregateRules = safeParseJsonArray(magicRaw)
      .map((x) => (typeof x === 'string' ? x.trim() : ''))
      .filter(Boolean);
  };

  refreshSearchConfigFromDom();

  const requestJson = async (url, options = {}) => {
    const resp = await fetch(url, options);
    const data = await resp.json().catch(() => null);
    if (!resp.ok) {
      const msg = data && (data.error || data.message) ? (data.error || data.message) : '请求失败';
      throw new Error(msg);
    }
    return data;
  };

  const setStatus = (text, isError = false) => {
    const value = text || '';
    resultsStatus.textContent = value;
    resultsStatus.classList.toggle('hidden', !value);
    resultsStatus.classList.remove(
      'text-red-500',
      'dark:text-red-400',
      'text-gray-500',
      'dark:text-gray-400'
    );
    if (value) {
      resultsStatus.classList.add(isError ? 'text-red-500' : 'text-gray-500');
      resultsStatus.classList.add(isError ? 'dark:text-red-400' : 'dark:text-gray-400');
    }
  };

  const setSummary = (text) => {
    const value = text || '';
    resultsSummary.textContent = value;
    resultsSummary.classList.toggle('hidden', !value);
  };

  let showingResults = false;
  const setShowResults = (show) => {
    showingResults = show;
    resultsSection.classList.toggle('hidden', !show);
    historySection.classList.toggle('hidden', show);
  };

  const normalizeSearchList = (data) => {
    const list = data && Array.isArray(data.list) ? data.list : [];
    return list
      .map((it) => ({
        id: it && (it.vod_id != null ? String(it.vod_id) : it.id != null ? String(it.id) : ''),
        name: it && (it.vod_name != null ? String(it.vod_name) : it.name != null ? String(it.name) : ''),
        pic: it && (it.vod_pic != null ? String(it.vod_pic) : it.pic != null ? String(it.pic) : ''),
        remark:
          it && (it.vod_remarks != null ? String(it.vod_remarks) : it.remark != null ? String(it.remark) : ''),
      }))
      .filter((it) => it.name);
  };

  const appendItemsToGrid = ({
    gridEl,
    items,
    siteKey,
    siteApi,
    siteName,
    seenKeys,
    insertCardSorted,
    computeMatchScore,
    siteOrderOverride,
    scoreOverride,
    isAggregate,
  }) => {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) return 0;
    let appended = 0;

    let io = null;
    if (typeof IntersectionObserver !== 'undefined') {
      try {
        io = new IntersectionObserver(
          (entries) => {
            entries.forEach((en) => {
              if (!en.isIntersecting) return;
              const img = en.target;
              const src = img && img.dataset ? img.dataset.src : '';
              if (src && !img.getAttribute('src')) img.setAttribute('src', src);
              if (io) io.unobserve(img);
            });
          },
          { root: null, rootMargin: '0px', threshold: 0.01 }
        );
      } catch (_e) {
        io = null;
      }
    }

    list.forEach((it) => {
      const id = it && it.id ? String(it.id) : '';
      const uniq = `${siteKey || ''}::${id}`;
      if (id && seenKeys && seenKeys.has(uniq)) return;
      if (id && seenKeys) seenKeys.add(uniq);

      const wrapper = document.createElement('div');
      wrapper.className = 'w-full';
      wrapper.dataset.siteKey = siteKey || '';
      wrapper.dataset.videoId = id || '';
      if (it && typeof it.__aggKey === 'string' && it.__aggKey) wrapper.dataset.titleAggKey = it.__aggKey;
      if (isAggregate) wrapper.dataset.aggregate = '1';
      wrapper.dataset.siteOrder = String(
        Number.isFinite(Number(siteOrderOverride))
          ? Number(siteOrderOverride)
          : siteOrderMap.has(siteKey)
            ? siteOrderMap.get(siteKey)
            : 999999
      );
      if (typeof computeMatchScore === 'function' && computeMatchScore(it && it.name ? it.name : '') === 1000) {
        wrapper.dataset.exactMatch = '1';
      }
      const name = it && it.name ? String(it.name) : '';
      const cardWrapper = createPosterCard({
        wrapperEl: wrapper,
        wrapperClass: 'w-full',
        io,
        detail: {
          siteKey: siteKey || '',
          spiderApi: siteApi || '',
          videoId: it && it.id ? String(it.id) : '',
          videoTitle: name,
          videoPoster: it && it.pic ? String(it.pic) : '',
          videoRemark: it && it.remark ? String(it.remark) : '',
        },
        title: name,
        poster: it && it.pic ? String(it.pic) : '',
        remark: it && it.remark ? String(it.remark) : '',
        siteName: typeof siteName === 'string' ? siteName : '',
        placeholder: true,
      });
      if (!cardWrapper) return;

      if (typeof insertCardSorted === 'function') {
        const score = Number.isFinite(Number(scoreOverride))
          ? Number(scoreOverride)
          : typeof computeMatchScore === 'function'
            ? computeMatchScore(it && it.name ? it.name : '')
            : 0;
        insertCardSorted(wrapper, score);
      } else {
        gridEl.appendChild(wrapper);
      }
      appended += 1;
    });
    return appended;
  };

  let cachedSitesPromise = null;
  const loadSites = async () => {
    if (cachedSitesPromise) return cachedSitesPromise;
    cachedSitesPromise = requestJson(sitesEndpoint, { method: 'GET', credentials: 'same-origin' })
      .then((data) => (data && Array.isArray(data.sites) ? data.sites : []))
      .catch(() => []);
    return cachedSitesPromise;
  };
  try {
    window.addEventListener('tv:user-settings-updated', () => {
      cachedSitesPromise = null;
      refreshSearchConfigFromDom();
    });
  } catch (_e) {}

  const formatHttpError = (err) => {
    const status = err && typeof err.status === 'number' ? err.status : 0;
    const msg = err && err.message ? String(err.message) : '请求失败';
    if (status) return `HTTP ${status}：${msg}`;
    return msg;
  };

  let currentRunId = 0;
  const runSearch = async (keyword) => {
    const runId = (currentRunId += 1);
    const q = (keyword || '').trim();
    if (!q) return;

    try {
      sessionStorage.removeItem(AGG_STORAGE_KEY);
    } catch (_e) {}

    setShowResults(true);
    resultsList.innerHTML = '';
    setSummary('');
    setStatus('搜索中...');

    const grid = document.createElement('div');
    grid.className = 'douban-grid';
    resultsList.appendChild(grid);

    const normalizeForMatch = (s) =>
      String(s || '')
        .toLowerCase()
        .replace(/[\s\u200b\u200c\u200d\ufeff]+/g, '')
        .trim();
    // 聚合“百分百匹配”不走后台净化/魔法规则；仅做基础空白字符/零宽字符清理，避免肉眼一致却不相等。
    const normalizeForAggregateKey = (s) =>
      String(s || '')
        .replace(/[\s\u200b\u200c\u200d\ufeff]+/g, '')
        .trim();
    const qNorm = normalizeForMatch(q);
    const qAggKey = normalizeForAggregateKey(q);

    const computeMatchScore = (title) => {
      const name = normalizeForMatch(title);
      if (!qNorm || !name) return 0;
      if (name === qNorm) return 1000;
      if (name.startsWith(qNorm)) return 900;
      const idx = name.indexOf(qNorm);
      if (idx >= 0) {
        const posBoost = 60 - Math.min(60, idx);
        const lenBoost = 40 - Math.min(40, Math.max(0, name.length - qNorm.length));
        return 800 + posBoost + lenBoost;
      }
      const tokens = q
        .toLowerCase()
        .split(/\s+/g)
        .map((t) => t.trim())
        .filter(Boolean);
      if (tokens.length >= 2) {
        let hit = 0;
        tokens.forEach((t) => {
          if (t && name.includes(t)) hit += 1;
        });
        if (hit) return 600 + hit * 20;
      }
      return 0;
    };

    let insertSeq = 0;
    const insertCardSorted = (wrapperEl, score) => {
      wrapperEl.dataset.score = String(score);
      wrapperEl.dataset.seq = String((insertSeq += 1));
      const wrapperScore = Number(wrapperEl.dataset.score || 0);
      const wrapperOrder = Number(wrapperEl.dataset.siteOrder || 999999);
      const wrapperSeq = Number(wrapperEl.dataset.seq || 0);
      const children = Array.from(grid.children || []);
      for (let i = 0; i < children.length; i += 1) {
        const el = children[i];
        const elScore = Number(el && el.dataset ? el.dataset.score : 0);
        const elOrder = Number(el && el.dataset ? el.dataset.siteOrder : 999999);
        const elSeq = Number(el && el.dataset ? el.dataset.seq : 0);

        if (Number.isFinite(elScore) && elScore < wrapperScore) {
          grid.insertBefore(wrapperEl, el);
          return;
        }
        if (Number.isFinite(elScore) && elScore === wrapperScore) {
          if (Number.isFinite(elOrder) && elOrder > wrapperOrder) {
            grid.insertBefore(wrapperEl, el);
            return;
          }
          if (Number.isFinite(elOrder) && elOrder === wrapperOrder && Number.isFinite(elSeq) && elSeq > wrapperSeq) {
            grid.insertBefore(wrapperEl, el);
            return;
          }
        }
      }
      grid.appendChild(wrapperEl);
    };

    const isConfigCenter = (s) => {
      const api = s && typeof s.api === 'string' ? s.api : '';
      const key = s && typeof s.key === 'string' ? s.key : '';
      return api.includes('/spider/baseset/') || key.toLowerCase().includes('baseset');
    };
    const sites = (await loadSites()).filter((s) => s && s.enabled !== false && s.api && !isConfigCenter(s));
    if (runId !== currentRunId) return;
    if (!sites.length) {
      setStatus('暂无可用站点');
      resultsList.innerHTML = '';
      return;
    }

    let done = 0;
    let failed = 0;
    let totalFound = 0;

    const aggregateBySite = new Map(); // siteKey -> { meta..., matches: Map(videoId -> source) }

    const seenKeys = new Set();
    let aggregateEl = null;
    let aggregateUniq = '';
    let aggregateActive = false;

    const removeExistingExactCards = (aggKey) => {
      if (!aggKey) return 0;
      let removed = 0;
      const children = Array.from(grid.children || []);
      children.forEach((el) => {
        if (!el || !el.dataset) return;
        if (el.dataset.aggregate === '1') return;
        const tag = (el.dataset.titleAggKey || '').trim();
        if (tag && tag === aggKey) {
          try {
            el.remove();
            removed += 1;
          } catch (_e) {}
          return;
        }
        if ((el.dataset.exactMatch || '') === '1') {
          try {
            el.remove();
            removed += 1;
          } catch (_e) {}
          return;
        }
        // Fallback: if a card was inserted without titleAggKey, infer from title text.
        const titleEl = el.querySelector && el.querySelector('.douban-card-title');
        const titleText = titleEl && titleEl.textContent ? String(titleEl.textContent) : '';
        if (!titleText) return;
        const inferred = normalizeForAggregateKey(titleText);
        if (inferred !== aggKey && normalizeForMatch(titleText) !== qNorm) return;
        try {
          el.remove();
          removed += 1;
        } catch (_e) {}
      });
      return removed;
    };

    const pickAggregateCover = (bySite) => {
      const pickFirstByKey = (k) => {
        const entry = bySite.get(k);
        if (!entry || !entry.matches) return null;
        const first = Array.from(entry.matches.values())[0];
        return first || null;
      };
      if (searchCoverSiteKey) {
        const preferred = pickFirstByKey(searchCoverSiteKey);
        if (preferred) return preferred;
      }
      for (const k of siteOrderList) {
        const candidate = pickFirstByKey(k);
        if (candidate) return candidate;
      }
      for (const entry of bySite.values()) {
        if (!entry || !entry.matches) continue;
        const any = Array.from(entry.matches.values())[0];
        if (any) return any;
      }
      return null;
    };

    const syncAggregateStorage = (cover, sources) => {
      if (!cover || !cover.siteKey || !cover.videoId) return;
      try {
        sessionStorage.setItem(
          AGG_STORAGE_KEY,
          JSON.stringify({
            q,
            key: qAggKey,
            forSiteKey: cover.siteKey,
            forVideoId: cover.videoId,
            createdAt: Date.now(),
            sources,
          })
        );
      } catch (_e) {}
    };

    const ensureStreamingAggregateCard = () => {
      if (!qAggKey) return;
      const sources = Array.from(aggregateBySite.values()).flatMap((entry) => {
        if (!entry || !entry.matches) return [];
        return Array.from(entry.matches.values());
      });
      const cover = pickAggregateCover(aggregateBySite);
      if (!cover || !cover.siteKey || !cover.videoId) return;
      if (sources.length < 1) return;
      aggregateActive = true;

      // Replace per-site exact matches with one aggregate card as soon as we have any exact match.
      const removed = removeExistingExactCards(qAggKey);
      if (removed) totalFound = Math.max(0, totalFound - removed);
      const uniq = `${cover.siteKey}::${String(cover.videoId)}`;

      // If the desired cover changed, remove the old aggregate card and allow re-insert.
      if (aggregateEl && aggregateUniq && aggregateUniq !== uniq) {
        try {
          aggregateEl.remove();
          totalFound = Math.max(0, totalFound - 1);
        } catch (_e) {}
        aggregateEl = null;
        aggregateUniq = '';
      }

      // Ensure insertion isn't blocked by previous cards with the same uniq.
      seenKeys.delete(uniq);

      // Also remove any existing non-aggregate card with the same uniq (defensive).
      const children = Array.from(grid.children || []);
      children.forEach((el) => {
        if (!el || !el.dataset) return;
        if (el.dataset.aggregate === '1') return;
        if ((el.dataset.siteKey || '') === cover.siteKey && (el.dataset.videoId || '') === String(cover.videoId)) {
          try {
            el.remove();
            totalFound = Math.max(0, totalFound - 1);
          } catch (_e) {}
        }
      });

      if (!aggregateEl) {
        syncAggregateStorage(cover, sources);
        appendItemsToGrid({
          gridEl: grid,
          items: [
            {
              id: cover.videoId,
              name: cover.videoTitle || q,
              pic: cover.videoPoster || '',
              remark: cover.videoRemark || '',
            },
          ],
          siteKey: cover.siteKey,
          siteApi: cover.spiderApi,
          siteName: '聚合',
          seenKeys,
          insertCardSorted,
          computeMatchScore,
          siteOrderOverride: -1,
          scoreOverride: 1e9,
          isAggregate: true,
        });

        const after = Array.from(grid.children || []).find(
          (el) =>
            el &&
            el.dataset &&
            el.dataset.aggregate === '1' &&
            el.dataset.siteKey === cover.siteKey &&
            el.dataset.videoId === String(cover.videoId)
        );
        if (after) {
          aggregateEl = after;
          aggregateUniq = uniq;
          totalFound += 1;
        }
      } else {
        syncAggregateStorage(cover, sources);
      }
    };

    const updateSummary = () => {
      const base = `已完成 ${done}/${sites.length}，共 ${totalFound} 条结果（并发 ${searchConcurrency}）`;
      setSummary(failed ? `${base}，失败 ${failed}` : base);
    };
    updateSummary();

    const queue = sites.slice();
    const runners = new Array(Math.max(1, searchConcurrency)).fill(null).map(async () => {
      while (queue.length) {
        const site = queue.shift();
        if (!site) continue;

        try {
          const data = await requestCatSpider({
            apiBase: catApiBase,
            username: tvUser,
            action: 'search',
            spiderApi: site.api,
            payload: { wd: q, page: 1 },
          });
          if (runId !== currentRunId) return;
          const items = normalizeSearchList(data);
          const exactMatches = [];
          // Exact-match detection must scan the full list (not just the first 12 shown),
          // otherwise an exact match can be pushed beyond the slice and both:
          // - the aggregate card never appears
          // - the per-site exact match is never visible
          items.forEach((it) => {
            const name = it && it.name ? String(it.name) : '';
            const key = name ? normalizeForAggregateKey(name) : '';
            const vid = it && it.id != null ? String(it.id) : '';
            // 聚合采用“百分百匹配”：按 normalizeForMatch 做严格匹配（更稳健），避免部分站点返回不可见字符导致不等。
            if (!qAggKey || !key) return;
            if (normalizeForMatch(name) !== qNorm) return;
            if (!vid) return;
            exactMatches.push(it);
          });

          if (exactMatches.length && site && site.key) {
            const sk = String(site.key);
            const entry = aggregateBySite.get(sk) || {
              siteKey: sk,
              spiderApi: site.api,
              siteName: site.name || site.key || '',
              matches: new Map(),
            };
            exactMatches.forEach((m) => {
              const vid = m && m.id ? String(m.id) : '';
              if (!vid) return;
              if (entry.matches.has(vid)) return;
              entry.matches.set(vid, {
                siteKey: sk,
                spiderApi: site.api,
                siteName: site.name || site.key || '',
                videoId: vid,
                videoTitle: m && m.name ? String(m.name) : '',
                videoPoster: m && m.pic ? String(m.pic) : '',
                videoRemark: m && m.remark ? String(m.remark) : '',
              });
            });
            aggregateBySite.set(sk, entry);
          }

          // As soon as we have any exact match, show the aggregate card immediately (during search),
          // before rendering this site's cards (so exact-match cards won't flash/stick).
          ensureStreamingAggregateCard();

          const sliced = items.slice(0, 12);
          let normalItems = sliced.map((it) => ({
            ...it,
            __aggKey: it && it.name ? normalizeForAggregateKey(it.name) : '',
            __exact: it && it.name ? normalizeForMatch(it.name) === qNorm : false,
          }));

          // 聚合触发后，所有“完全匹配”条目只进入聚合来源，不再作为普通卡片显示。
          // 注意：不依赖 videoId；标题百分百匹配就不再单独显示。
          // 仅在聚合卡片已激活时过滤：否则会导致“完全匹配”条目既不显示、聚合也未出现。
          if (aggregateActive && qAggKey) {
            normalItems = normalItems.filter((it) => {
              if (!it) return false;
              if (it.__exact) return false;
              return true;
            });
          }

          totalFound += appendItemsToGrid({
            gridEl: grid,
            items: normalItems,
            siteKey: site.key,
            siteApi: site.api,
            siteName: site.name || site.key || '',
            seenKeys,
            insertCardSorted,
            computeMatchScore,
          });

          // Defensive: in concurrent runners, some exact-match cards can slip in
          // between aggregate activation and this site's render. Re-run the
          // aggregate reconciliation after appending so exact-match cards are
          // promptly collapsed into the aggregate card during streaming search.
          ensureStreamingAggregateCard();
        } catch (e) {
          if (runId !== currentRunId) return;
          failed += 1;
        } finally {
          done += 1;
          updateSummary();
          if (done >= sites.length) {
            if (!totalFound) {
              setStatus('暂无搜索结果');
            } else {
              setStatus(failed ? `部分站点搜索失败（${failed}）` : '');
            }
          }
        }
      }
    });

    await Promise.allSettled(runners);
    if (runId !== currentRunId) return;

    // Ensure aggregate card is present after the search ends too (in case the last runner discovered the first match).
    ensureStreamingAggregateCard();

    updateSummary();
    if (!totalFound) {
      setStatus('暂无搜索结果');
    } else {
      setStatus(failed ? `部分站点搜索失败（${failed}）` : '');
    }
  };

  const startSearch = (keyword, { saveHistory } = { saveHistory: true }) => {
    const q = (keyword || '').trim().replace(/\s+/g, ' ');
    input.value = q;
    setClearQueryVisible();
    if (!q) return;
    if (saveHistory) {
      requestJson(historyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: q }),
      })
        .then((list) => renderHistory(list))
        .catch(() => {});
    }
    runSearch(q);
  };

  const setClearQueryVisible = () => {
    const v = (input.value || '').trim();
    clearQueryBtn.classList.toggle('hidden', !v);
  };

  const renderHistory = (items) => {
    chipsBox.innerHTML = '';
    if (!Array.isArray(items) || items.length === 0) {
      historySection.classList.add('hidden');
      return;
    }
    historySection.classList.toggle('hidden', showingResults);

    const frag = document.createDocumentFragment();
    items.forEach((kw) => {
      const item = (kw || '').trim();
      if (!item) return;
      const wrap = document.createElement('div');
      wrap.className = 'relative group';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'px-4 py-2 bg-gray-500/10 hover:bg-gray-300 rounded-full text-sm text-gray-700 transition-colors duration-200 dark:bg-gray-700/50 dark:hover:bg-gray-600 dark:text-gray-300';
      btn.textContent = item;
      btn.addEventListener('click', () => {
        input.value = item;
        setClearQueryVisible();
        runSearch(item);
      });

      const del = document.createElement('button');
      del.type = 'button';
      del.setAttribute('aria-label', '删除搜索历史');
      del.className =
        'absolute -top-1 -right-1 w-4 h-4 opacity-0 group-hover:opacity-100 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] transition-colors';
      del.innerHTML = '&times;';
      del.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        try {
          await requestJson(`${historyEndpoint}?keyword=${encodeURIComponent(item)}`, { method: 'DELETE' });
          await loadHistory();
        } catch (_) {}
      });

      wrap.appendChild(btn);
      wrap.appendChild(del);
      frag.appendChild(wrap);
    });
    chipsBox.appendChild(frag);
  };

  const loadHistory = async () => {
    try {
      const list = await requestJson(historyEndpoint, { method: 'GET' });
      renderHistory(list);
    } catch (_) {
      renderHistory([]);
    }
  };

  clearHistoryBtn.addEventListener('click', async () => {
    try {
      await requestJson(historyEndpoint, { method: 'DELETE' });
      await loadHistory();
    } catch (_) {}
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    startSearch(input.value, { saveHistory: true });
  });

  clearQueryBtn.addEventListener('click', () => {
    input.value = '';
    setClearQueryVisible();
    setShowResults(false);
    setSummary('');
    setStatus('');
    resultsList.innerHTML = '';
    input.focus();
  });

  input.addEventListener('input', () => setClearQueryVisible());

  window.addEventListener('tv:search', (e) => {
    const q = e && e.detail && typeof e.detail.q === 'string' ? e.detail.q : '';
    startSearch(q, { saveHistory: true });
  });

  input.value = '';
  setClearQueryVisible();
  setShowResults(false);
  loadHistory();
}
