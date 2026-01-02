import { requestCatSpider } from '../../shared/catpawopen';
import { initSearchPage } from '../../shared/searchClient';
import { appendTvCardHoverOverlays, createPosterCard } from '../../shared/posterCard';
import { apiGetJson, buildQuery } from '../../shared/apiClient';

function attachScrollableRowControls(scrollEl, scrollDistance = 1000) {
  if (!scrollEl) return;
  const wrapper = scrollEl.parentElement;
  if (!wrapper) return;
  if (wrapper.querySelector('.tv-scroll-control')) return;

  let isHovered = false;

  const makeControl = (dir) => {
    const control = document.createElement('div');
    control.className = `tv-scroll-control tv-scroll-control-${dir}`;
    control.style.opacity = '0';

    const inner = document.createElement('div');
    inner.className = 'tv-scroll-control-inner';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tv-scroll-btn';
    btn.setAttribute('aria-label', dir === 'left' ? '向左滚动' : '向右滚动');
    btn.innerHTML =
      dir === 'left'
        ? '<svg xmlns="http://www.w3.org/2000/svg" class="tv-scroll-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" class="tv-scroll-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      scrollEl.scrollBy({
        left: dir === 'left' ? -scrollDistance : scrollDistance,
        behavior: 'smooth',
      });
    });

    inner.appendChild(btn);
    control.appendChild(inner);
    wrapper.appendChild(control);

    return control;
  };

  const leftControl = makeControl('left');
  const rightControl = makeControl('right');

  const checkScroll = () => {
    const { scrollWidth, clientWidth, scrollLeft } = scrollEl;
    const threshold = 1;
    const canScrollRight = scrollWidth - (scrollLeft + clientWidth) > threshold;
    const canScrollLeft = scrollLeft > threshold;

    leftControl.style.display = canScrollLeft ? '' : 'none';
    rightControl.style.display = canScrollRight ? '' : 'none';

    leftControl.style.opacity = isHovered && canScrollLeft ? '1' : '0';
    rightControl.style.opacity = isHovered && canScrollRight ? '1' : '0';
  };

  wrapper.addEventListener('mouseenter', () => {
    isHovered = true;
    checkScroll();
  });
  wrapper.addEventListener('mouseleave', () => {
    isHovered = false;
    checkScroll();
  });

  scrollEl.addEventListener('scroll', checkScroll);
  window.addEventListener('resize', checkScroll);

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => checkScroll());
    ro.observe(scrollEl);
  }

  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      setTimeout(checkScroll, 100);
    });
    mo.observe(scrollEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
  }

  checkScroll();
}

function setupHomeSiteNavScrollControls() {
  const list = document.getElementById('homeSiteNavList');
  const overlayTop = document.getElementById('homeSiteNavOverlayTop');
  const overlayBottom = document.getElementById('homeSiteNavOverlayBottom');
  const upBtn = document.getElementById('homeSiteNavScrollUp');
  const downBtn = document.getElementById('homeSiteNavScrollDown');

  if (!list || !overlayTop || !overlayBottom || !upBtn || !downBtn) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const threshold = 2;
    const scrollTop = list.scrollTop || 0;
    const canUp = scrollTop > threshold;
    const canDown = (list.scrollHeight || 0) - (scrollTop + (list.clientHeight || 0)) > threshold;
    overlayTop.classList.toggle('hidden', !canUp);
    overlayBottom.classList.toggle('hidden', !canDown);
  };

  const scheduleUpdate = () => {
    if (ticking) return;
    ticking = true;
    if (window && window.requestAnimationFrame) window.requestAnimationFrame(update);
    else setTimeout(update, 0);
  };

  upBtn.addEventListener('click', (e) => {
    e.preventDefault();
    list.scrollBy({ top: -240, behavior: 'smooth' });
  });
  downBtn.addEventListener('click', (e) => {
    e.preventDefault();
    list.scrollBy({ top: 240, behavior: 'smooth' });
  });

  list.addEventListener('scroll', scheduleUpdate);
  window.addEventListener('resize', scheduleUpdate);

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => scheduleUpdate());
    ro.observe(list);
  }

  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => scheduleUpdate());
    mo.observe(list, { childList: true, subtree: true });
  }

  scheduleUpdate();
}

function setupHomeSpiderBrowse() {
  const homeMain = document.getElementById('homePage');
  const searchMain = document.getElementById('searchPage');
  const segToggle = document.getElementById('homeSegToggle');
  const segHomeBtn = document.getElementById('segHomeBtn');
  const segFavBtn = document.getElementById('segFavBtn');
  const siteList = document.getElementById('homeSiteNavList');
  const siteSections = document.getElementById('homeSiteSections');
  const doubanSections = document.getElementById('homeDoubanSections');
  const doubanBrowse = document.getElementById('homeDoubanBrowse');
  const continueSection = document.getElementById('homeContinueSection');
  const continueRow = document.getElementById('homeContinueRow');
  const favoritesSection = document.getElementById('homeFavoritesSection');
  const favoritesGrid = document.getElementById('homeFavoritesGrid');
  const favoritesEmpty = document.getElementById('homeFavoritesEmpty');
  const cfgEl = document.getElementById('homeDoubanConfig');

  if (!siteList || !siteSections || !doubanSections || !doubanBrowse || !cfgEl) return;

  const setSegActive = (key) => {
    const k = typeof key === 'string' ? key.trim() : '';
    if (segHomeBtn) segHomeBtn.classList.toggle('active', k === 'home');
    if (segFavBtn) segFavBtn.classList.toggle('active', k === 'fav');
  };

  let favoritesViewActive = false;
  let favoritesPrevView = null;

  let continueAllowed = true;
  let continueLoading = false;
  let continueItems = [];
  let continueDirty = true;

  let favoritesAllowed = false;
  let favoritesLoading = false;
  let favoritesItems = [];
  let favoritesDirty = true;

  let panLoginSettingsLoaded = false;
  let panLoginSettingsStore = {};

  const fetchHomeBundle = async ({
    includePlayHistory = true,
    includeFavorites = true,
    includePanLoginSettings = true,
    playHistoryLimit = 20,
    favoritesLimit = 50,
  } = {}) => {
    const params = {
      includePlayHistory: includePlayHistory ? 1 : 0,
      includeFavorites: includeFavorites ? 1 : 0,
      includePanLoginSettings: includePanLoginSettings ? 1 : 0,
      playHistoryLimit,
      favoritesLimit,
    };
    const data = await apiGetJson(`/api/home${buildQuery(params)}`, { cacheMs: 2000 });
    return data && typeof data === 'object' ? data : {};
  };

  const createLazyImageIo = () => {
    let io = null;
    return () => {
      if (io) return io;
      if (typeof IntersectionObserver === 'undefined') return null;
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
        return io;
      } catch (_e) {
        io = null;
        return null;
      }
    };
  };

  const ensureFavoritesIo = createLazyImageIo();
  const ensureContinueIo = createLazyImageIo();

  const applyContinueVisibility = () => {
    if (!continueSection) return;
    const shouldShow = continueAllowed && Array.isArray(continueItems) && continueItems.length > 0;
    continueSection.classList.toggle('hidden', !shouldShow);
  };

  const applyFavoritesVisibility = () => {
    if (!favoritesSection) return;
    favoritesSection.classList.toggle('hidden', !(favoritesAllowed === true));
  };

  const renderContinue = () => {
    if (!continueRow) return;
    continueRow.innerHTML = '';
    if (!Array.isArray(continueItems) || !continueItems.length) return;

    const io = ensureContinueIo();
    const frag = document.createDocumentFragment();
    continueItems.forEach((it) => {
      const siteKey = it && typeof it.siteKey === 'string' ? it.siteKey : '';
      const spiderApi = it && typeof it.spiderApi === 'string' ? it.spiderApi : '';
      const videoId = it && typeof it.videoId === 'string' ? it.videoId : '';
      const videoTitle = it && typeof it.videoTitle === 'string' ? it.videoTitle : '';
      if (!siteKey || !spiderApi || !videoId || !videoTitle) return;
      const wrapper = createPosterCard({
        wrapperClass: 'min-w-[96px] w-24 sm:min-w-[180px] sm:w-44',
        io,
        detail: {
          siteKey,
          spiderApi,
          videoId,
          videoTitle,
          videoPoster: it && typeof it.videoPoster === 'string' ? it.videoPoster : '',
          videoRemark: it && typeof it.videoRemark === 'string' ? it.videoRemark : '',
        },
        title: videoTitle,
        poster: it && typeof it.videoPoster === 'string' ? it.videoPoster : '',
        remark: it && typeof it.videoRemark === 'string' ? it.videoRemark : '',
        siteName: it && typeof it.siteName === 'string' ? it.siteName : '',
        placeholder: true,
      });
      if (wrapper) frag.appendChild(wrapper);
    });

    continueRow.appendChild(frag);
    try {
      attachScrollableRowControls(continueRow);
    } catch (_e) {}
  };

	  const refreshContinue = async () => {
	    if (continueLoading) return;
      if (!continueDirty) {
        applyContinueVisibility();
        if (continueAllowed) renderContinue();
        return;
      }
	    continueLoading = true;
	    try {
	      const data = await fetchHomeBundle({
          includePlayHistory: true,
          includeFavorites: false,
          includePanLoginSettings: false,
          playHistoryLimit: 20,
        });
	      continueItems = Array.isArray(data && data.playHistory) ? data.playHistory : [];
        continueDirty = false;
	    } catch (_e) {
	      continueItems = [];
        continueDirty = false;
	    } finally {
      continueLoading = false;
      applyContinueVisibility();
      if (continueAllowed) renderContinue();
    }
  };

  const renderFavorites = () => {
    if (!favoritesGrid || !favoritesEmpty) return;
    favoritesGrid.innerHTML = '';
    const list = Array.isArray(favoritesItems) ? favoritesItems : [];
    favoritesEmpty.classList.toggle('hidden', list.length > 0);
    if (!list.length) return;

    const io = ensureFavoritesIo();
    const frag = document.createDocumentFragment();
    list.forEach((it) => {
      const siteKey = it && typeof it.siteKey === 'string' ? it.siteKey : '';
      const spiderApi = it && typeof it.spiderApi === 'string' ? it.spiderApi : '';
      const videoId = it && typeof it.videoId === 'string' ? it.videoId : '';
      const videoTitle = it && typeof it.videoTitle === 'string' ? it.videoTitle : '';
      if (!siteKey || !spiderApi || !videoId || !videoTitle) return;
      const wrapper = createPosterCard({
        wrapperClass: 'w-full',
        io,
        detail: {
          siteKey,
          spiderApi,
          videoId,
          videoTitle,
          videoPoster: it && typeof it.videoPoster === 'string' ? it.videoPoster : '',
          videoRemark: it && typeof it.videoRemark === 'string' ? it.videoRemark : '',
        },
        title: videoTitle,
        poster: it && typeof it.videoPoster === 'string' ? it.videoPoster : '',
        remark: it && typeof it.videoRemark === 'string' ? it.videoRemark : '',
        siteName: it && typeof it.siteName === 'string' ? it.siteName : '',
        placeholder: true,
      });
      if (wrapper) frag.appendChild(wrapper);
    });

    favoritesGrid.appendChild(frag);
  };

	  const refreshFavorites = async () => {
	    if (!favoritesAllowed) return;
	    if (!favoritesDirty) {
        renderFavorites();
        return;
      }
	    if (favoritesLoading) return;
	    favoritesLoading = true;
	    try {
	      const data = await fetchHomeBundle({
          includePlayHistory: false,
          includeFavorites: true,
          includePanLoginSettings: false,
          favoritesLimit: 50,
        });
	      favoritesItems = Array.isArray(data && data.favorites) ? data.favorites : [];
	      favoritesDirty = false;
	    } catch (_e) {
	      favoritesItems = [];
      favoritesDirty = false;
    } finally {
      favoritesLoading = false;
      renderFavorites();
    }
  };

  const showFavoritesView = () => {
    favoritesPrevView = {
      segHidden: !!(segToggle && segToggle.classList.contains('hidden')),
      siteHidden: !!siteSections.classList.contains('hidden'),
      doubanHidden: !!doubanSections.classList.contains('hidden'),
      browseHidden: !!doubanBrowse.classList.contains('hidden'),
      continueAllowed,
    };

    favoritesAllowed = true;
    favoritesViewActive = true;
    setSegActive('fav');

    showHomeMain();
    if (segToggle) segToggle.classList.remove('hidden');
    siteSections.classList.add('hidden');
    doubanSections.classList.add('hidden');
    doubanBrowse.classList.add('hidden');
    continueAllowed = false;
    applyContinueVisibility();

    applyFavoritesVisibility();
    void refreshFavorites();
  };

  const hideFavoritesView = () => {
    favoritesAllowed = false;
    favoritesViewActive = false;
    applyFavoritesVisibility();
    setSegActive('home');

    if (!favoritesPrevView) {
      showHomeDouban();
      return;
    }

    showHomeMain();
    if (segToggle) segToggle.classList.toggle('hidden', favoritesPrevView.segHidden);
    siteSections.classList.toggle('hidden', favoritesPrevView.siteHidden);
    doubanSections.classList.toggle('hidden', favoritesPrevView.doubanHidden);
    doubanBrowse.classList.toggle('hidden', favoritesPrevView.browseHidden);
    continueAllowed = !!favoritesPrevView.continueAllowed;
    applyContinueVisibility();
    if (continueAllowed) renderContinue();
  };

  let searchInitDone = false;
  const ensureSearchInit = () => {
    if (searchInitDone) return;
    searchInitDone = true;
    initSearchPage();
  };

  const showHomeMain = () => {
    if (homeMain) homeMain.classList.remove('hidden');
    if (searchMain) searchMain.classList.add('hidden');
  };
  const showSearchMain = () => {
    if (homeMain) homeMain.classList.add('hidden');
    if (searchMain) searchMain.classList.remove('hidden');
    ensureSearchInit();
  };

  const showHomeDouban = () => {
    showHomeMain();
    if (segToggle) segToggle.classList.remove('hidden');
    if (favoritesViewActive) hideFavoritesView();
    setSegActive('home');
    siteSections.classList.add('hidden');
    doubanSections.classList.remove('hidden');
    Array.from(doubanSections.querySelectorAll('section')).forEach((sec) => sec.classList.remove('hidden'));
    doubanBrowse.classList.add('hidden');
    continueAllowed = true;
    applyContinueVisibility();
    if (continueAllowed) renderContinue();
  };

  const showDoubanType = (type) => {
    showHomeMain();
    if (segToggle) segToggle.classList.add('hidden');
    if (favoritesViewActive) hideFavoritesView();
    setSegActive('home');
    siteSections.classList.add('hidden');
    doubanSections.classList.add('hidden');
    doubanBrowse.classList.remove('hidden');
    continueAllowed = false;
    applyContinueVisibility();
    if (siteBrowseUi && siteBrowseUi.backBtn) siteBrowseUi.backBtn.classList.add('hidden');
    if (siteBrowseUi && siteBrowseUi.areaRow) siteBrowseUi.areaRow.style.display = '';
    if (siteBrowseUi && siteBrowseUi.secondaryLabelEl) siteBrowseUi.secondaryLabelEl.textContent = '地区';
    if (siteBrowseUi && siteBrowseUi.subtitleEl) siteBrowseUi.subtitleEl.textContent = '来自豆瓣的精选内容';
    const t = String(type || '').trim();
    window.dispatchEvent(new CustomEvent('tv:douban-browse', { detail: { type: t } }));
  };

  const siteBrowseUi = (() => {
    const backBtn = document.getElementById('doubanBrowseBackBtn');
    const titleEl = document.getElementById('doubanBrowseTitle');
    const subtitleEl = doubanBrowse ? doubanBrowse.querySelector('.douban-browse-subtitle') : null;
    const statusEl = document.getElementById('doubanBrowseStatus');
    const secondaryLabelEl = document.getElementById('doubanFilterSecondaryLabel');
    const filterCategoryEl = document.getElementById('doubanFilterCategory');
    const filterAreaEl = document.getElementById('doubanFilterArea');
    const gridEl = document.getElementById('doubanBrowseGrid');
    if (!titleEl || !subtitleEl || !statusEl || !secondaryLabelEl || !filterCategoryEl || !filterAreaEl || !gridEl)
      return null;

    const areaRow = filterAreaEl.closest ? filterAreaEl.closest('.douban-filter-row') : null;

    let sentinel = document.getElementById('siteBrowseSentinel');
    if (!sentinel && doubanBrowse && doubanBrowse.insertBefore) {
      sentinel = document.createElement('div');
      sentinel.id = 'siteBrowseSentinel';
      sentinel.className = 'h-10';
      doubanBrowse.insertBefore(sentinel, gridEl.nextSibling);
    }

    return {
      backBtn,
      titleEl,
      subtitleEl,
      statusEl,
      secondaryLabelEl,
      filterCategoryEl,
      filterAreaEl,
      areaRow,
      gridEl,
      sentinel,
    };
  })();

  const showSiteCategoryBrowse = () => {
    if (!siteBrowseUi) return;
    showHomeMain();
    if (segToggle) segToggle.classList.add('hidden');
    if (favoritesViewActive) hideFavoritesView();
    setSegActive('home');
    siteSections.classList.add('hidden');
    doubanSections.classList.add('hidden');
    doubanBrowse.classList.remove('hidden');
    continueAllowed = false;
    applyContinueVisibility();

    if (siteBrowseUi.areaRow) siteBrowseUi.areaRow.style.display = 'none';
    siteBrowseUi.filterAreaEl.innerHTML = '';
    siteBrowseUi.secondaryLabelEl.textContent = '';
    if (siteBrowseUi.backBtn) siteBrowseUi.backBtn.classList.remove('hidden');
  };

  if (siteBrowseUi && siteBrowseUi.backBtn && !siteBrowseUi.backBtn.dataset.bound) {
    siteBrowseUi.backBtn.dataset.bound = '1';
    siteBrowseUi.backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      stopSiteBrowseObserver();
      if (siteBrowseUi && siteBrowseUi.backBtn) siteBrowseUi.backBtn.classList.add('hidden');
      if (activeSiteApi) {
        showHomeMain();
        if (segToggle) segToggle.classList.remove('hidden');
        doubanBrowse.classList.add('hidden');
        doubanSections.classList.add('hidden');
        siteSections.classList.remove('hidden');
        continueAllowed = true;
        applyContinueVisibility();
        if (continueAllowed) renderContinue();
        return;
      }
      showHomeDouban();
    });
  }

  try {
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    const isIphone = /iPhone|iPod/i.test(ua);
    if (isIphone && doubanBrowse && siteBrowseUi && siteBrowseUi.backBtn) {
      let armed = false;
      let startX = 0;
      let startY = 0;
      let shouldGoBack = false;
      const EDGE_PX = 20;
      const TRIGGER_DX = 70;

      const getPoint = (e) => {
        const t = e && e.touches && e.touches[0] ? e.touches[0] : null;
        if (!t) return null;
        return { x: t.clientX || 0, y: t.clientY || 0 };
      };

      const onTouchStart = (e) => {
        const p = getPoint(e);
        if (!p) return;
        startX = p.x;
        startY = p.y;
        armed = startX <= EDGE_PX;
        shouldGoBack = false;
      };

      const onTouchMove = (e) => {
        if (!armed) return;
        const p = getPoint(e);
        if (!p) return;
        const dx = p.x - startX;
        const dy = p.y - startY;
        if (dx <= 0) return;

        if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
          armed = false;
          shouldGoBack = false;
          return;
        }

        if (dx >= TRIGGER_DX && dx > Math.abs(dy) * 1.4) {
          shouldGoBack = true;
          try {
            e.preventDefault();
          } catch (_e) {}
        }
      };

      const reset = () => {
        armed = false;
        shouldGoBack = false;
      };

      const onTouchEnd = () => {
        const backBtn = siteBrowseUi && siteBrowseUi.backBtn ? siteBrowseUi.backBtn : null;
        const canBack = backBtn && !backBtn.classList.contains('hidden');
        if (armed && shouldGoBack && canBack) {
          try {
            backBtn.click();
          } catch (_e) {}
        }
        reset();
      };

      if (!doubanBrowse.dataset.tvIphoneSwipeBound) {
        doubanBrowse.dataset.tvIphoneSwipeBound = '1';
        doubanBrowse.addEventListener('touchstart', onTouchStart, { passive: true });
        doubanBrowse.addEventListener('touchmove', onTouchMove, { passive: false });
        doubanBrowse.addEventListener('touchend', onTouchEnd, { passive: true });
        doubanBrowse.addEventListener('touchcancel', reset, { passive: true });
      }
    }
  } catch (_e) {}

  const getSiteDisplayName = (siteKey) => {
    try {
      const key = typeof siteKey === 'string' ? siteKey.trim() : '';
      if (!key) return '';
      const esc = typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function' ? CSS.escape(key) : key;
      const a = siteList.querySelector(`a[data-site-key="${esc}"]`);
      if (!a) return key;
      const label = a.querySelector('.nav-label');
      const text = (label ? label.textContent : a.textContent) || '';
      return String(text).trim() || key;
    } catch (_e) {
      return typeof siteKey === 'string' ? siteKey.trim() : '';
    }
  };

  const readCachedSiteClasses = (siteKey) => {
    const key = typeof siteKey === 'string' ? siteKey.trim() : '';
    if (!key) return [];
    try {
      const raw = localStorage.getItem(`${SITE_CLASS_CACHE_PREFIX}${key}`) || '';
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      const classes = parsed && Array.isArray(parsed.classes) ? parsed.classes : [];
      return classes
        .map((c) => ({
          id: c && typeof c.id === 'string' ? c.id : c && c.type_id != null ? String(c.type_id) : '',
          name: c && typeof c.name === 'string' ? c.name : c && c.type_name != null ? String(c.type_name) : '',
        }))
        .filter((c) => c.id && c.name);
    } catch (_e) {
      return [];
    }
  };

  const buildCategoryChips = (classes, selectedId, onPick) => {
    if (!siteBrowseUi) return;
    const list = Array.isArray(classes) ? classes : [];
    siteBrowseUi.filterCategoryEl.innerHTML = '';
    list.forEach((c) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'douban-chip';
      btn.textContent = c.name;
      btn.setAttribute('data-value', c.id);
      if (c.id === selectedId) btn.classList.add('is-active');
      btn.addEventListener('click', () => onPick(c.id));
      siteBrowseUi.filterCategoryEl.appendChild(btn);
    });
  };

  const setSiteBrowseStatus = (text, isError = false) => {
    if (!siteBrowseUi) return;
    const t = typeof text === 'string' ? text.trim() : '';
    siteBrowseUi.statusEl.textContent = t;
    siteBrowseUi.statusEl.classList.toggle('hidden', !t);
    siteBrowseUi.statusEl.classList.remove('text-red-500', 'dark:text-red-400', 'text-gray-500', 'dark:text-gray-400');
    if (t) {
      siteBrowseUi.statusEl.classList.add(isError ? 'text-red-500' : 'text-gray-500');
      siteBrowseUi.statusEl.classList.add(isError ? 'dark:text-red-400' : 'dark:text-gray-400');
    }
  };

  const clearSiteBrowseGrid = () => {
    if (!siteBrowseUi) return;
    siteBrowseUi.gridEl.innerHTML = '';
  };

  const appendSiteBrowseItems = (() => {
    let io = null;
    const supportsIO = typeof IntersectionObserver !== 'undefined';
    if (supportsIO) {
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

    return (items) => {
      if (!siteBrowseUi) return;
      const list = Array.isArray(items) ? items : [];
      const frag = document.createDocumentFragment();
      list.forEach((it) => {
        const title = it && it.name ? String(it.name) : '';
        const wrapper = createPosterCard({
          wrapperClass: 'w-full',
          io,
          detail: {
            siteKey: activeSiteKey || '',
            spiderApi: activeSiteApi || '',
            videoId: it && it.id ? String(it.id) : '',
            videoTitle: title,
            videoPoster: it && it.pic ? String(it.pic) : '',
            videoRemark: it && it.remark ? String(it.remark) : '',
          },
          title,
          poster: it && it.pic ? String(it.pic) : '',
          remark: it && it.remark ? String(it.remark) : '',
          placeholder: false,
        });
        if (wrapper) frag.appendChild(wrapper);
      });
      siteBrowseUi.gridEl.appendChild(frag);
    };
  })();

  const normalizePagedList = (data) => {
    const list = data && Array.isArray(data.list) ? data.list : [];
    const MAX_ITEMS_PER_PAGE = 24;
    return list
      .slice(0, MAX_ITEMS_PER_PAGE)
      .map((it) => ({
        id: it && (it.vod_id != null ? String(it.vod_id) : it.id != null ? String(it.id) : ''),
        name: it && (it.vod_name != null ? String(it.vod_name) : it.name != null ? String(it.name) : ''),
        pic: it && (it.vod_pic != null ? String(it.vod_pic) : it.pic != null ? String(it.pic) : ''),
        remark:
          it && (it.vod_remarks != null ? String(it.vod_remarks) : it.remark != null ? String(it.remark) : ''),
      }))
      .filter((it) => it.name);
  };

  let siteBrowseSeq = 0;
  let siteBrowseState = {
    siteKey: '',
    siteApi: '',
    categoryId: '',
    page: 1,
    loading: false,
    ended: false,
  };
  let siteBrowseObserver = null;

  const stopSiteBrowseObserver = () => {
    if (siteBrowseObserver && typeof siteBrowseObserver.disconnect === 'function') siteBrowseObserver.disconnect();
    siteBrowseObserver = null;
  };

  const loadSiteBrowsePage = async (page) => {
    if (!siteBrowseUi) return;
    const seq = siteBrowseSeq;
    const cid = siteBrowseState.categoryId;
    if (!cid) return;
    if (siteBrowseState.loading || siteBrowseState.ended) return;
    siteBrowseState.loading = true;
    setSiteBrowseStatus(page === 1 ? '加载中...' : '加载更多中...');
    try {
      const resp = await requestSpider('category', siteBrowseState.siteApi, {
        id: cid,
        page,
        filter: true,
        filters: {},
      });
      if (seq !== siteBrowseSeq) return;
      const items = normalizePagedList(resp);
      if (!items.length) {
        siteBrowseState.ended = true;
        setSiteBrowseStatus('已经是末页');
        return;
      }
      appendSiteBrowseItems(items);
      siteBrowseState.page = page;
      setSiteBrowseStatus('');
    } catch (e) {
      if (seq !== siteBrowseSeq) return;
      setSiteBrowseStatus(formatHttpError(e), true);
    } finally {
      if (seq === siteBrowseSeq) siteBrowseState.loading = false;
    }
  };

  const startSiteBrowse = async ({ siteKey, siteApi, categoryId }) => {
    if (!siteBrowseUi) return;
    const sk = typeof siteKey === 'string' ? siteKey.trim() : '';
    const sa = typeof siteApi === 'string' ? siteApi.trim() : '';
    const cid = typeof categoryId === 'string' ? categoryId.trim() : '';
    if (!sk || !sa || !cid) return;

    activeSiteKey = sk;
    activeSiteApi = sa;

    const classes = readCachedSiteClasses(sk);
    if (!classes.length) {
      showSiteCategoryBrowse();
      siteBrowseUi.titleEl.textContent = '无分类数据';
      siteBrowseUi.subtitleEl.textContent = getSiteDisplayName(sk) || sk;
      buildCategoryChips([], '', () => {});
      clearSiteBrowseGrid();
      setSiteBrowseStatus('无分类数据');
      return;
    }

    const exists = classes.some((c) => c.id === cid);
    const realCid = exists ? cid : classes[0].id;

    siteBrowseSeq += 1;
    siteBrowseState = {
      siteKey: sk,
      siteApi: sa,
      categoryId: realCid,
      page: 1,
      loading: false,
      ended: false,
    };

    showSiteCategoryBrowse();
    siteBrowseUi.titleEl.textContent = classes.find((c) => c.id === realCid)?.name || '';
    siteBrowseUi.subtitleEl.textContent = getSiteDisplayName(sk) || sk;

    buildCategoryChips(classes, realCid, (nextId) => {
      const next = typeof nextId === 'string' ? nextId.trim() : '';
      if (!next || next === siteBrowseState.categoryId) return;
      stopSiteBrowseObserver();
      siteBrowseSeq += 1;
      siteBrowseState = {
        ...siteBrowseState,
        categoryId: next,
        page: 1,
        loading: false,
        ended: false,
      };
      siteBrowseUi.titleEl.textContent = classes.find((c) => c.id === next)?.name || '';
      clearSiteBrowseGrid();
      setSiteBrowseStatus('加载中...');
      loadSiteBrowsePage(1);
      stopSiteBrowseObserver();
      if (siteBrowseUi.sentinel && typeof IntersectionObserver !== 'undefined') {
        try {
          const localSeq = siteBrowseSeq;
          siteBrowseObserver = new IntersectionObserver(
            (entries) => {
              if (localSeq !== siteBrowseSeq) return;
              if (!entries || !entries.some((en) => en.isIntersecting)) return;
              if (siteBrowseState.loading || siteBrowseState.ended) return;
              loadSiteBrowsePage((siteBrowseState.page || 1) + 1);
            },
            { root: null, rootMargin: '300px 0px', threshold: 0.01 }
          );
          siteBrowseObserver.observe(siteBrowseUi.sentinel);
        } catch (_e) {
          siteBrowseObserver = null;
        }
      }
    });

    clearSiteBrowseGrid();
    setSiteBrowseStatus('加载中...');
    await loadSiteBrowsePage(1);

    stopSiteBrowseObserver();
    if (siteBrowseUi.sentinel && typeof IntersectionObserver !== 'undefined') {
      try {
        const localSeq = siteBrowseSeq;
        siteBrowseObserver = new IntersectionObserver(
          (entries) => {
            if (localSeq !== siteBrowseSeq) return;
            if (!entries || !entries.some((en) => en.isIntersecting)) return;
            if (siteBrowseState.loading || siteBrowseState.ended) return;
            loadSiteBrowsePage((siteBrowseState.page || 1) + 1);
          },
          { root: null, rootMargin: '300px 0px', threshold: 0.01 }
        );
        siteBrowseObserver.observe(siteBrowseUi.sentinel);
      } catch (_e) {
        siteBrowseObserver = null;
      }
    }
  };

  const clearSiteActive = () => {
    Array.from(siteList.querySelectorAll('a[data-site-api]')).forEach((el) => el.setAttribute('data-active', 'false'));
  };

  const emitMobileContext = (kind, siteName) => {
    try {
      const k = typeof kind === 'string' ? kind.trim() : '';
      if (!k) return;
      window.dispatchEvent(new CustomEvent('tv:mobile-context', { detail: { kind: k, siteName: siteName || '' } }));
    } catch (_e) {}
  };

  let historyViewActive = false;
  let historyPrevView = null;

  const showHistoryView = () => {
    historyPrevView = {
      segHidden: !!(segToggle && segToggle.classList.contains('hidden')),
      siteHidden: !!siteSections.classList.contains('hidden'),
      doubanHidden: !!doubanSections.classList.contains('hidden'),
      browseHidden: !!doubanBrowse.classList.contains('hidden'),
      favoritesActive: !!favoritesViewActive,
      continueAllowed,
    };

    historyViewActive = true;
    if (favoritesViewActive) hideFavoritesView();
    showHomeMain();
    if (segToggle) segToggle.classList.add('hidden');
    siteSections.classList.add('hidden');
    doubanSections.classList.add('hidden');
    doubanBrowse.classList.add('hidden');
    continueAllowed = true;
    applyContinueVisibility();
    if (continueAllowed) renderContinue();
    void refreshContinue();
  };

  const hideHistoryView = () => {
    if (!historyViewActive) return;
    historyViewActive = false;
    if (!historyPrevView) return;
    showHomeMain();
    if (segToggle) segToggle.classList.toggle('hidden', historyPrevView.segHidden);
    siteSections.classList.toggle('hidden', historyPrevView.siteHidden);
    doubanSections.classList.toggle('hidden', historyPrevView.doubanHidden);
    doubanBrowse.classList.toggle('hidden', historyPrevView.browseHidden);
    continueAllowed = !!historyPrevView.continueAllowed;
    applyContinueVisibility();
    if (continueAllowed) renderContinue();
    if (historyPrevView.favoritesActive) showFavoritesView();
    historyPrevView = null;
  };

  const onHomeViewEvent = (e) => {
    const view = e && e.detail && typeof e.detail.view === 'string' ? e.detail.view.trim() : '';
    if (!view) return;
    if (view === 'home') {
      hideHistoryView();
      stopSiteBrowseObserver();
      clearSiteActive();
      showHomeDouban();
      emitMobileContext('home', '');
      return;
    }
    if (view === 'search') {
      hideHistoryView();
      stopSiteBrowseObserver();
      clearSiteActive();
      if (favoritesViewActive) hideFavoritesView();
      showSearchMain();
      emitMobileContext('search', '');
      return;
    }
    if (view === 'fav') {
      hideHistoryView();
      stopSiteBrowseObserver();
      clearSiteActive();
      showFavoritesView();
      emitMobileContext('favorites', '');
      return;
    }
    if (view === 'history') {
      stopSiteBrowseObserver();
      clearSiteActive();
      showHistoryView();
      emitMobileContext('history', '');
      return;
    }
    if (view.startsWith('douban:')) {
      hideHistoryView();
      stopSiteBrowseObserver();
      const t = view.slice('douban:'.length);
      clearSiteActive();
      showDoubanType(t);
      emitMobileContext('douban', '');
      return;
    }
  };
  window.addEventListener('tv:home-view', onHomeViewEvent);

  if (segHomeBtn) {
    segHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (favoritesViewActive) hideFavoritesView();
      else showHomeDouban();
    });
  }
  if (segFavBtn) {
    segFavBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showFavoritesView();
    });
  }

  window.addEventListener('tv:favorites-updated', () => {
    favoritesDirty = true;
    if (favoritesViewActive) void refreshFavorites();
  });

  try {
    const HOME_VIEW_KEY = 'tv_server_home_view';
    const view = (localStorage.getItem(HOME_VIEW_KEY) || '').trim();
    if (view && view.startsWith('douban:')) {
      const t = view.slice('douban:'.length);
      showDoubanType(t);
    }
  } catch (_e) {}

  const LAST_SITE_KEY = 'tv_server_last_site_key';
  const HOME_VIEW_KEY = 'tv_server_home_view';
  const SITE_CLASS_CACHE_PREFIX = 'tv_server_site_classes_';

  let activeSiteApi = '';
  let activeSiteKey = '';
  let loadSeq = 0;

  const SITE_HOME_CACHE_MAX = 2;
  const siteHomeCache = new Map();

  const getCachedSiteHome = (siteKey) => {
    const key = typeof siteKey === 'string' ? siteKey.trim() : '';
    if (!key) return null;
    const hit = siteHomeCache.get(key);
    if (!hit) return null;
    siteHomeCache.delete(key);
    siteHomeCache.set(key, hit);
    return hit;
  };

  const putCachedSiteHome = (siteKey, value) => {
    const key = typeof siteKey === 'string' ? siteKey.trim() : '';
    if (!key || !value) return;
    siteHomeCache.delete(key);
    siteHomeCache.set(key, value);
    while (siteHomeCache.size > SITE_HOME_CACHE_MAX) {
      const oldest = siteHomeCache.keys().next().value;
      if (oldest) siteHomeCache.delete(oldest);
      else break;
    }
  };

  const tvUser = (cfgEl.getAttribute('data-tv-user') || '').trim();
  const getCatApiBase = () => (cfgEl.getAttribute('data-cat-api-base') || '').trim();
  const userRole = (cfgEl.getAttribute('data-user-role') || '').trim();
  const userCatApiBase = (cfgEl.getAttribute('data-user-cat-api-base') || '').trim();

  const normalizeCatApiBase = (raw) => {
    const s = String(raw || '').trim();
    if (!s) return '';
    try {
      return new URL(s).toString().replace(/\/?$/, '/');
    } catch (_e) {
      return '';
    }
  };

  const requestCatWebsiteJson = async (apiBase, path, init = {}) => {
    const normalized = normalizeCatApiBase(apiBase);
    if (!normalized) throw new Error('CatPawOpen 接口地址未设置');
    const url = new URL(String(path || '').replace(/^\//, ''), normalized);
    const headers = Object.assign({}, init.headers && typeof init.headers === 'object' ? init.headers : {});
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    if (tvUser) headers['X-TV-User'] = tvUser;
    const resp = await fetch(url.toString(), {
      method: init.method || 'GET',
      headers,
      body: init.body,
      credentials: 'omit',
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const msg = data && (data.message || data.error) ? String(data.message || data.error) : `HTTP ${resp.status}`;
      const err = new Error(msg);
      err.status = resp.status;
      throw err;
    }
    if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'code')) {
      if (data.code === 0) return data.data;
      throw new Error((data && data.message) || 'CatPawOpen 网站接口返回异常');
    }
    return data;
  };

	  const maybeSyncSharedCookiesToUserCatPawOpen = async () => {
	    if (userRole !== 'shared') return;
	    const normalized = normalizeCatApiBase(userCatApiBase);
	    if (!normalized) return;

	    try {
        if (!panLoginSettingsLoaded) {
          try {
            const data = await fetchHomeBundle({
              includePlayHistory: false,
              includeFavorites: false,
              includePanLoginSettings: true,
            });
            const store = data && typeof data.panLoginSettings === 'object' ? data.panLoginSettings : {};
            panLoginSettingsStore = store && typeof store === 'object' ? store : {};
          } catch (_e) {
            panLoginSettingsStore = {};
          } finally {
            panLoginSettingsLoaded = true;
          }
        }
        const store = panLoginSettingsStore && typeof panLoginSettingsStore === 'object' ? panLoginSettingsStore : {};
	      const keys = Object.keys(store || {});
      for (let i = 0; i < keys.length; i += 1) {
        const panKey = typeof keys[i] === 'string' ? keys[i].trim() : '';
        if (!panKey) continue;
        const v = store[panKey];
        if (!v || typeof v !== 'object') continue;
        try {
          if (typeof v.cookie === 'string') {
            await requestCatWebsiteJson(normalized, `website/${encodeURIComponent(panKey)}/cookie`, {
              method: 'PUT',
              body: JSON.stringify({ cookie: v.cookie }),
            });
          } else if (typeof v.username === 'string' || typeof v.password === 'string') {
            await requestCatWebsiteJson(normalized, `website/${encodeURIComponent(panKey)}/account`, {
              method: 'PUT',
              body: JSON.stringify({
                username: typeof v.username === 'string' ? v.username : '',
                password: typeof v.password === 'string' ? v.password : '',
              }),
            });
          }
        } catch (_e) {}
      }
    } catch (_e) {}
  };

  const requestSpider = (action, spiderApi, payload) =>
    requestCatSpider({
      apiBase: getCatApiBase(),
      username: tvUser,
      action,
      spiderApi,
      payload,
    });

  const formatHttpError = (err) => {
    const status = err && typeof err.status === 'number' ? err.status : 0;
    const msg = err && err.message ? String(err.message) : '请求失败';
    if (status) return `HTTP ${status}：${msg}`;
    return msg;
  };

  const normalizeClasses = (data) => {
    const cls = data && Array.isArray(data.class) ? data.class : data && Array.isArray(data.classes) ? data.classes : [];
    return cls
      .map((c) => ({
        id: c && (c.type_id != null ? String(c.type_id) : c.tid != null ? String(c.tid) : ''),
        name: c && (c.type_name != null ? String(c.type_name) : c.name != null ? String(c.name) : ''),
      }))
      .filter((c) => c.id && c.name);
  };

  const normalizeList = (data) => {
    const list = data && Array.isArray(data.list) ? data.list : [];
    const MAX_ITEMS_PER_CATEGORY = 20;
    return list
      .slice(0, MAX_ITEMS_PER_CATEGORY)
      .map((it) => ({
        id: it && (it.vod_id != null ? String(it.vod_id) : it.id != null ? String(it.id) : ''),
        name: it && (it.vod_name != null ? String(it.vod_name) : it.name != null ? String(it.name) : ''),
        pic: it && (it.vod_pic != null ? String(it.vod_pic) : it.pic != null ? String(it.pic) : ''),
        remark: it && (it.vod_remarks != null ? String(it.vod_remarks) : it.remark != null ? String(it.remark) : ''),
      }))
      .filter((it) => it.name);
  };

  const ensureRowIo = createLazyImageIo();

  const renderRowItems = (rowEl, items) => {
    rowEl.innerHTML = '';
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      const div = document.createElement('div');
      div.className = 'px-4 sm:px-6 text-sm text-gray-500 dark:text-gray-400';
      div.textContent = '暂无相关内容';
      rowEl.appendChild(div);
      return;
    }
    const io = ensureRowIo();

    const frag = document.createDocumentFragment();
    list.forEach((it) => {
      const title = it && it.name ? String(it.name) : '';
      const wrapper = createPosterCard({
        wrapperClass: 'min-w-[96px] w-24 sm:min-w-[180px] sm:w-44',
        io,
        detail: {
          siteKey: activeSiteKey || '',
          spiderApi: activeSiteApi || '',
          videoId: it && it.id ? String(it.id) : '',
          videoTitle: title,
          videoPoster: it && it.pic ? String(it.pic) : '',
          videoRemark: it && it.remark ? String(it.remark) : '',
        },
        title,
        poster: it && it.pic ? String(it.pic) : '',
        remark: it && it.remark ? String(it.remark) : '',
        placeholder: true,
      });
      if (wrapper) frag.appendChild(wrapper);
    });
    rowEl.appendChild(frag);
  };

  const buildCategorySection = (category) => {
    const section = document.createElement('section');
    section.className = 'tv-section';

    const head = document.createElement('div');
    head.className = 'tv-section-head';

    const h2 = document.createElement('h2');
    h2.className = 'tv-section-title';
    h2.textContent = (category && category.name) || '';
    head.appendChild(h2);

    const right = document.createElement('div');
    right.className = 'tv-section-actions';

    const status = document.createElement('div');
    status.className = 'tv-section-status';
    status.classList.add('hidden');
    right.appendChild(status);

    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'more-link';
    more.textContent = '查看更多';
    more.addEventListener('click', () => {
      const cid = category && category.id ? String(category.id) : '';
      if (!cid || !activeSiteApi) return;
      window.dispatchEvent(
        new CustomEvent('tv:site-category-more', {
          detail: {
            site: activeSiteKey || '',
            api: activeSiteApi,
            cid,
            cname: category && category.name ? String(category.name) : '',
          },
        })
      );
    });
    right.appendChild(more);

    head.appendChild(right);

    const body = document.createElement('div');
    body.className = 'relative';

    const row = document.createElement('div');
    row.className = 'tv-scroll-row';
    row.style.minHeight = 'clamp(210px,35vw,380px)';
    body.appendChild(row);
    attachScrollableRowControls(row);

    section.appendChild(head);
    section.appendChild(body);

    return { section, status, more, row };
  };

  const renderSiteHomeFromCache = (cached) => {
    const list = cached && Array.isArray(cached.classes) ? cached.classes : [];
    siteSections.innerHTML = '';
    if (!list.length) {
      const div = document.createElement('div');
      div.className = 'text-sm text-gray-500 dark:text-gray-400 px-4';
      div.textContent = '无分类数据';
      siteSections.appendChild(div);
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach((c) => {
      const cat = { id: c.id, name: c.name };
      const ui = buildCategorySection(cat);
      ui.row.innerHTML = '';
      const items = Array.isArray(c.items) ? c.items : [];
      renderRowItems(ui.row, items);
      ui.status.textContent = '';
      ui.status.classList.add('hidden');
      ui.more.classList.toggle('hidden', !items.length);
      frag.appendChild(ui.section);
    });
    siteSections.appendChild(frag);
  };

  const loadHome = async (api, siteKey) => {
    const seq = (loadSeq += 1);
    activeSiteApi = api;
    siteSections.innerHTML = '';
    siteSections.classList.remove('hidden');
    doubanSections.classList.add('hidden');
    doubanBrowse.classList.add('hidden');

    const cacheKey = typeof siteKey === 'string' ? siteKey.trim() : activeSiteKey;
    const cached = getCachedSiteHome(cacheKey);
    if (cached && cached.api === api) {
      try {
        renderSiteHomeFromCache(cached);
      } catch (_e) {}
      return;
    }

    try {
      const pageLoading = document.createElement('div');
      pageLoading.className = 'px-4 text-sm text-gray-500 dark:text-gray-400';
      pageLoading.textContent = '加载中...';
      siteSections.appendChild(pageLoading);

      const data = await requestSpider('home', activeSiteApi, {});
      if (seq !== loadSeq) return;

      siteSections.innerHTML = '';
      const classes = normalizeClasses(data);
      try {
        if (activeSiteKey) {
          localStorage.setItem(
            `${SITE_CLASS_CACHE_PREFIX}${activeSiteKey}`,
            JSON.stringify({ ts: Date.now(), classes })
          );
        }
      } catch (_e) {}
      if (!classes.length) {
        const div = document.createElement('div');
        div.className = 'text-sm text-gray-500 dark:text-gray-400 px-4';
        div.textContent = '无分类数据';
        siteSections.appendChild(div);
        return;
      }

      const cacheRecord = {
        api: activeSiteApi,
        classes: classes.map((c) => ({ id: c.id, name: c.name, items: [] })),
      };

      const frag = document.createDocumentFragment();
      classes.forEach((c) => {
        const s = buildCategorySection(c);
        s.row.innerHTML = '';
        s.status.textContent = '加载中...';
        s.status.classList.remove('text-red-500', 'dark:text-red-400');
        s.status.classList.remove('hidden');
        s.more.classList.add('hidden');
        frag.appendChild(s.section);
        c.__ui = s;
      });
      siteSections.appendChild(frag);

      const yieldToPaint = async () => {
        if (window && typeof window.requestAnimationFrame === 'function') {
          await new Promise((r) => window.requestAnimationFrame(() => r()));
          return;
        }
        await new Promise((r) => setTimeout(r, 0));
      };

      await yieldToPaint();

      for (let i = 0; i < classes.length; i += 1) {
        if (seq !== loadSeq) return;
        const c = classes[i];
        const ui = c && c.__ui ? c.__ui : null;
        if (!ui) continue;
        try {
          const tid = c && c.id ? c.id : '';
          // eslint-disable-next-line no-await-in-loop
          const resp = await requestSpider('category', activeSiteApi, {
            id: tid,
            page: 1,
            filter: true,
            filters: {},
          });
          if (seq !== loadSeq) return;
          const items = normalizeList(resp);
          renderRowItems(ui.row, items);
          const idx = cacheRecord.classes.findIndex((x) => x.id === tid);
          if (idx >= 0) cacheRecord.classes[idx].items = items;
          ui.status.textContent = '';
          ui.status.classList.add('hidden');
          ui.more.classList.remove('hidden');
        } catch (e) {
          if (seq !== loadSeq) return;
          ui.status.textContent = formatHttpError(e);
          ui.status.classList.add('text-red-500', 'dark:text-red-400');
          ui.status.classList.remove('hidden');
          ui.more.classList.add('hidden');
          renderRowItems(ui.row, []);
          const tid = c && c.id ? c.id : '';
          const idx = cacheRecord.classes.findIndex((x) => x.id === tid);
          if (idx >= 0) cacheRecord.classes[idx].items = [];
        }
        // eslint-disable-next-line no-await-in-loop
        await yieldToPaint();
      }

      putCachedSiteHome(cacheKey, cacheRecord);
    } catch (e) {
      if (seq !== loadSeq) return;
      siteSections.innerHTML = '';
      siteSections.classList.remove('hidden');
      doubanSections.classList.add('hidden');
      doubanBrowse.classList.add('hidden');
      const div = document.createElement('div');
      div.className = 'text-sm text-red-500 dark:text-red-400 px-4';
      div.textContent = formatHttpError(e);
      siteSections.appendChild(div);
    }
  };

  siteList.addEventListener('click', (e) => {
    const target = e.target;
    if (!target || !target.closest) return;
    const a = target.closest('a[data-site-api]');
    if (!a) return;
    const api = (a.getAttribute('data-site-api') || '').trim();
    const key = (a.getAttribute('data-site-key') || '').trim();
    if (!api) return;

    try {
      window.dispatchEvent(new CustomEvent('tv:exit-play'));
    } catch (_e) {}
    if (favoritesViewActive) hideFavoritesView();
    hideHistoryView();
    showHomeMain();
    if (segToggle) segToggle.classList.remove('hidden');
    stopSiteBrowseObserver();
    Array.from(siteList.querySelectorAll('a[data-site-api]')).forEach((el) => {
      el.setAttribute('data-active', el === a ? 'true' : 'false');
    });
    activeSiteKey = key;
    setSegActive('home');
    continueAllowed = true;
    applyContinueVisibility();
    if (continueAllowed) renderContinue();
    loadHome(api, key);

    try {
      const labelEl = a.querySelector('.nav-label');
      const name = labelEl ? (labelEl.textContent || '').trim() : (a.textContent || '').trim();
      emitMobileContext('site', name);
    } catch (_e) {}

    try {
      if (key) localStorage.setItem(LAST_SITE_KEY, key);
    } catch (_e) {}
  });

  try {
    window.addEventListener('tv:site-category-more', (e) => {
      const d = e && e.detail && typeof e.detail === 'object' ? e.detail : {};
      const siteKey = typeof d.site === 'string' ? d.site : typeof d.siteKey === 'string' ? d.siteKey : '';
      const api = typeof d.api === 'string' ? d.api : '';
      const cid = typeof d.cid === 'string' ? d.cid : '';
      if (!siteKey || !api || !cid) return;
      void startSiteBrowse({ siteKey, siteApi: api, categoryId: cid });
    });
  } catch (_e) {}

  const autoSelectFromStorage = () => {
    try {
      const key = (localStorage.getItem(LAST_SITE_KEY) || '').trim();
      if (!key || key === 'home') return false;
      const esc = typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function' ? CSS.escape(key) : key;
      const a = siteList.querySelector(`a[data-site-key="${esc}"]`);
      if (a) {
        a.scrollIntoView({ block: 'nearest' });
        a.click();
        return true;
      }
    } catch (_e) {}
    return false;
  };

  const showHomeFromStorage = () => {
    try {
      const view = (localStorage.getItem(HOME_VIEW_KEY) || '').trim();
      if (view && view.startsWith('douban:')) showDoubanType(view.slice('douban:'.length));
      else showHomeDouban();
    } catch (_e) {
      showHomeDouban();
    }
  };

  let wantsSite = false;
  try {
    const key = (localStorage.getItem(LAST_SITE_KEY) || '').trim();
    wantsSite = !!(key && key !== 'home');
  } catch (_e) {
    wantsSite = false;
  }

  let selectedSite = autoSelectFromStorage();
  if (!selectedSite && wantsSite) {
    let fallbackTimer = null;
    const onSitesUpdated = () => {
      selectedSite = autoSelectFromStorage();
      if (selectedSite) {
        try {
          if (fallbackTimer) clearTimeout(fallbackTimer);
        } catch (_e) {}
        fallbackTimer = null;
        try {
          window.removeEventListener('tv:sidebar-sites-updated', onSitesUpdated);
        } catch (_e) {}
      }
    };
    try {
      window.addEventListener('tv:sidebar-sites-updated', onSitesUpdated);
    } catch (_e) {}
    try {
      fallbackTimer = setTimeout(() => {
        try {
          window.removeEventListener('tv:sidebar-sites-updated', onSitesUpdated);
        } catch (_e) {}
        if (!selectedSite) showHomeFromStorage();
      }, 1200);
    } catch (_e) {
      showHomeFromStorage();
    }
  } else if (!selectedSite) {
    showHomeFromStorage();
  }

  try {
    window.addEventListener('tv:play-history-updated', () => {
      continueDirty = true;
      void refreshContinue();
    });
  } catch (_e) {}
  void (async () => {
    try {
      const data = await fetchHomeBundle({
        includePlayHistory: true,
        includeFavorites: true,
        includePanLoginSettings: userRole === 'shared',
        playHistoryLimit: 20,
        favoritesLimit: 50,
      });
      continueItems = Array.isArray(data && data.playHistory) ? data.playHistory : [];
      continueDirty = false;
      favoritesItems = Array.isArray(data && data.favorites) ? data.favorites : [];
      favoritesDirty = false;
      if (data && typeof data.panLoginSettings === 'object') {
        panLoginSettingsStore = data.panLoginSettings;
        panLoginSettingsLoaded = true;
      }
      void maybeSyncSharedCookiesToUserCatPawOpen();
    } catch (_e) {
      continueDirty = true;
    } finally {
      applyContinueVisibility();
      if (continueAllowed) renderContinue();
    }
    if (continueDirty) void refreshContinue();
  })();
}

export function initIndexPage() {
  try {
    setupHomeSiteNavScrollControls();
  } catch (_e) {}
  try {
    setupHomeSpiderBrowse();
  } catch (_e) {}
  const cfgEl = document.getElementById('homeDoubanConfig');
        if (!cfgEl) return;

        const runtimeConfig = {
          doubanDataProxy: (cfgEl.getAttribute('data-douban-data-proxy') || 'direct').trim(),
          doubanDataCustom: (cfgEl.getAttribute('data-douban-data-custom') || '').trim(),
          doubanImgProxy: (cfgEl.getAttribute('data-douban-img-proxy') || 'direct-browser').trim(),
          doubanImgCustom: (cfgEl.getAttribute('data-douban-img-custom') || '').trim(),
        };

        const movieRow = document.getElementById('homeHotMovieRow');
        const tvRow = document.getElementById('homeHotTvRow');
        const bangumiRow = document.getElementById('homeBangumiRow');
        const showRow = document.getElementById('homeHotShowRow');
        const doubanBrowse = document.getElementById('homeDoubanBrowse');
        const browseTitleEl = document.getElementById('doubanBrowseTitle');
        const browseStatusEl = document.getElementById('doubanBrowseStatus');
        const browseGridEl = document.getElementById('doubanBrowseGrid');
        const filterCategoryEl = document.getElementById('doubanFilterCategory');
        const filterAreaEl = document.getElementById('doubanFilterArea');

        if (
          !movieRow ||
          !tvRow ||
          !bangumiRow ||
          !showRow ||
          !doubanBrowse ||
          !browseTitleEl ||
          !browseStatusEl ||
          !browseGridEl ||
          !filterCategoryEl ||
          !filterAreaEl
        )
          return;

        document.querySelectorAll('.tv-scroll-row').forEach((el) => attachScrollableRowControls(el));

        const normalizeProxyBase = (base) => {
          const raw = typeof base === 'string' ? base.trim() : '';
          if (!raw) return '';
          if (/[?&=]$/.test(raw)) return raw;
          return raw.endsWith('/') ? raw : `${raw}/`;
        };

        const toProxiedUrl = (targetUrl, proxyBase) => {
          if (!proxyBase) return targetUrl;
          const normalized = normalizeProxyBase(proxyBase);
          if (normalized.includes('cors-anywhere.com/')) return `${normalized}${targetUrl}`;
          return `${normalized}${encodeURIComponent(targetUrl)}`;
        };

        const getDataApiBase = () => {
          const p = runtimeConfig.doubanDataProxy;
          if (p === 'cdn-tx' || p === 'cmliussss-cdn-tencent') {
            return { m: 'https://m.douban.cmliussss.net', proxyBase: '' };
          }
          if (p === 'cdn-ali' || p === 'cmliussss-cdn-ali') {
            return { m: 'https://m.douban.cmliussss.com', proxyBase: '' };
          }
          if (p === 'cors' || p === 'cors-proxy-zwei') {
            return { m: 'https://m.douban.com', proxyBase: 'https://ciao-cors.is-an.org/' };
          }
          if (p === 'cors-anywhere') {
            return { m: 'https://m.douban.com', proxyBase: 'https://cors-anywhere.com/' };
          }
          if (p === 'custom') {
            return { m: 'https://m.douban.com', proxyBase: runtimeConfig.doubanDataCustom };
          }
          return { m: 'https://m.douban.com', proxyBase: '' };
        };

        const normalizeImageUrl = (u) => {
          const raw = typeof u === 'string' ? u.trim() : '';
          if (!raw) return '';
          if (raw.startsWith('//')) return `https:${raw}`;
          if (raw.startsWith('http://')) return `https://${raw.slice('http://'.length)}`;
          return raw;
        };

        const buildImageCandidates = (originalUrl) => {
          const original = normalizeImageUrl(originalUrl);
          const processed = processImageUrl(original);
          const candidates = [];
          if (processed) candidates.push(processed);
          if (original && original.includes('doubanio.com')) {
            candidates.push(original.replace(/img\\d+\\.doubanio\\.com/g, 'img3.doubanio.com'));
            candidates.push(original);
            const p = runtimeConfig.doubanImgProxy;
            const allowServerFallback = p !== 'server-proxy' && p !== 'custom';
            if (allowServerFallback) candidates.push(`/api/douban/image?url=${encodeURIComponent(original)}`);
          }
          const uniq = [];
          const seen = new Set();
          candidates.forEach((c) => {
            const v = typeof c === 'string' ? c.trim() : '';
            if (!v || seen.has(v)) return;
            seen.add(v);
            uniq.push(v);
          });
          return uniq;
        };

        const processImageUrl = (originalUrl) => {
          const original = normalizeImageUrl(originalUrl);
          if (!original) return original;

          const p = runtimeConfig.doubanImgProxy;
          if (p === 'server-proxy') {
            return `/api/douban/image?url=${encodeURIComponent(original)}`;
          }
          if (p === 'custom') {
            return runtimeConfig.doubanImgCustom
              ? `${normalizeProxyBase(runtimeConfig.doubanImgCustom)}${encodeURIComponent(original)}`
              : original;
          }

          if (!original.includes('doubanio.com')) return original;

          switch (p) {
            case 'douban-cdn-ali':
            case 'img3':
              return original.replace(/img\\d+\\.doubanio\\.com/g, 'img3.doubanio.com');
            case 'cdn-tx':
            case 'cmliussss-cdn-tencent':
              return original.replace(/img\\d+\\.doubanio\\.com/g, 'img.doubanio.cmliussss.net');
            case 'cdn-ali':
            case 'cmliussss-cdn-ali':
              return original.replace(/img\\d+\\.doubanio\\.com/g, 'img.doubanio.cmliussss.com');
            case 'direct-browser':
            case 'direct':
            default:
              return original;
          }
        };

        const fetchJsonWithTimeout = async (url, timeoutMs = 10000) => {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeoutMs);
          try {
            const resp = await fetch(url, {
              signal: controller.signal,
              headers: { Accept: 'application/json, text/plain, */*' },
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return await resp.json();
          } finally {
            clearTimeout(id);
          }
        };

        const fetchDoubanRecentHot = async ({ kind, category, hotType, start, limit }) => {
          const { m, proxyBase } = getDataApiBase();
          const u = new URL(`${m}/rexxar/api/v2/subject/recent_hot/${kind}`);
          u.searchParams.set('start', String(start));
          u.searchParams.set('limit', String(limit));
          u.searchParams.set('category', category);
          u.searchParams.set('type', hotType);
          const target = u.toString();
          const url = proxyBase ? toProxiedUrl(target, proxyBase) : target;
          const data = await fetchJsonWithTimeout(url);
          const items = Array.isArray(data?.items) ? data.items : [];
          return items.map((item) => ({
            id: String(item?.id || ''),
            title: item?.title || '',
            poster: item?.pic?.normal || item?.pic?.large || '',
            rate: item?.rating?.value ? Number(item.rating.value).toFixed(1) : '',
            year: (item?.card_subtitle || '').match(/(\\d{4})/)?.[1] || '',
            isBangumi: false,
          }));
        };

        const fetchBangumiCalendar = async (timeoutMs = 12000) => {
          const data = await fetchJsonWithTimeout('https://api.bgm.tv/calendar', timeoutMs);
          return Array.isArray(data) ? data : [];
        };

        const fetchBangumiToday = async () => {
          const data = await fetchJsonWithTimeout('https://api.bgm.tv/calendar', 12000);
          const list = Array.isArray(data) ? data : [];
          const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const currentWeekday = weekdays[new Date().getDay()];
          const matched = list.find((item) => item?.weekday?.en === currentWeekday);
          const items = Array.isArray(matched?.items) ? matched.items : [];
          return items
            .filter((it) => it?.images)
            .map((it) => ({
              id: String(it?.id || ''),
              title: it?.name_cn || it?.name || '',
              poster: it?.images?.large || it?.images?.common || it?.images?.medium || it?.images?.small || it?.images?.grid || '',
              rate: it?.rating?.score ? Number(it.rating.score).toFixed(1) : '',
              year: (it?.air_date || '').split('-')?.[0] || '',
              isBangumi: true,
            }));
        };

        const setRowMessage = (row, msg) => {
          row.innerHTML = '';
          const div = document.createElement('div');
          div.className = 'px-4 sm:px-6 text-sm text-gray-500';
          div.textContent = msg;
          row.appendChild(div);
        };

        const buildDetailUrl = (item) => {
          if (!item?.id) return '';
          return item?.isBangumi === true ? `https://bgm.tv/subject/${item.id}` : `https://movie.douban.com/subject/${item.id}`;
        };

        const renderRow = (rowEl, items, stypeForPlay) => {
          rowEl.innerHTML = '';
          const frag = document.createDocumentFragment();
          const imagesToLoad = [];

          items.forEach((item) => {
            const wrapper = document.createElement('div');
	            wrapper.className = 'min-w-[96px] w-24 sm:min-w-[180px] sm:w-44';

	            const card = document.createElement('div');
	            card.className = 'douban-card group w-full hover:z-[500]';
	            card.setAttribute('role', 'link');
	            card.setAttribute('tabindex', '0');

            const activate = () => openSearchByTitle(String(item?.title || ''));
            card.addEventListener('click', activate);
            card.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activate();
              }
	            });

	            const posterWrap = document.createElement('div');
	            posterWrap.className = 'douban-poster';

            if (item.poster) {
              const img = document.createElement('img');
              const candidates = buildImageCandidates(item.poster);
              const src = candidates[0] || '';
              img.alt = item.title || '';
              img.loading = 'lazy';
              img.decoding = 'async';
              img.className = 'w-full h-full object-cover opacity-0 transition-opacity transition-transform duration-300 ease-out group-hover:scale-105';
              img.dataset.src = src;
              img.dataset.started = '0';
              img.dataset.fallbackStep = '0';
              img.addEventListener('load', () => {
                img.classList.remove('opacity-0');
              });
              img.addEventListener('error', () => {
                const step = Number(img.dataset.fallbackStep || '0');
                const next = candidates[step + 1];
                if (!next) return;
                img.dataset.fallbackStep = String(step + 1);
                img.setAttribute('src', next);
              });
              posterWrap.appendChild(img);
              imagesToLoad.push(img);
	            }

	            appendTvCardHoverOverlays(posterWrap);

            const detailUrl = buildDetailUrl(item);
            if (detailUrl) {
              const link = document.createElement('a');
              link.href = detailUrl;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              link.className =
                'absolute top-2 left-2 opacity-0 -translate-x-2 pointer-events-none transition-all duration-300 ease-in-out delay-100 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 sm:group-hover:pointer-events-auto';
              link.addEventListener('click', (e) => e.stopPropagation());
              link.innerHTML =
                '<div class="bg-green-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 hover:scale-[1.1] transition-all duration-300 ease-out">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>' +
                '</div>';
              posterWrap.appendChild(link);
            }

            if (item.rate) {
              const badge = document.createElement('div');
              badge.className =
                'absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ease-out group-hover:scale-110';
              badge.textContent = item.rate;
              posterWrap.appendChild(badge);
            }

	            const title = document.createElement('div');
	            title.className = 'douban-card-title';
	            title.textContent = item.title || '';

            card.appendChild(posterWrap);
            card.appendChild(title);
            wrapper.appendChild(card);
            frag.appendChild(wrapper);
          });

          rowEl.appendChild(frag);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              imagesToLoad.forEach((img) => {
                if (img.dataset.started === '1') return;
                const src = img.dataset.src || '';
                if (!src) return;
                img.dataset.started = '1';
                img.setAttribute('src', src);
              });
            });
          });
        };

        const HOME_LIMIT = 20;

	        const DOUBAN_LABEL = {
	          movie: '电影',
	          tv: '剧集',
	          anime: '动漫',
	          show: '综艺',
	        };

	        const DOUBAN_FILTERS = {
	          movie: {
	            kind: 'movie',
	            showArea: true,
              secondaryLabel: '地区',
	            defaultCategory: '热门',
	            defaultArea: '全部',
	            categories: [
	              { label: '热门电影', value: '热门' },
	              { label: '最新电影', value: '最新' },
	              { label: '豆瓣高分', value: '豆瓣高分' },
	              { label: '冷门佳片', value: '冷门佳片' },
	            ],
	            areas: [
	              { label: '全部', value: '全部' },
	              { label: '华语', value: '华语' },
	              { label: '欧美', value: '欧美' },
	              { label: '韩国', value: '韩国' },
	              { label: '日本', value: '日本' },
	            ],
	          },
	          tv: {
	            kind: 'tv',
	            showArea: true,
              secondaryLabel: '类型',
	            categoryConst: 'tv',
		            defaultCategory: 'all',
		            defaultArea: 'tv',
	            categories: [
	              { label: '全部', value: 'all' },
	              { label: '动漫', value: 'tv_animation' },
	              { label: '纪录片', value: 'tv_documentary' },
	            ],
	            areas: [
	              { label: '全部', value: 'tv' },
	              { label: '国产', value: 'tv_domestic' },
	              { label: '欧美', value: 'tv_american' },
	              { label: '日本', value: 'tv_japanese' },
	              { label: '韩国', value: 'tv_korean' },
	            ],
	          },
	          anime: {
	            kind: 'bangumi',
	            showArea: true,
              secondaryLabel: '星期',
              defaultCategory: 'week',
              defaultArea: 'Mon',
	            categories: [
	              { label: '本周', value: 'week' },
	              { label: '今日', value: 'today' },
	            ],
	            areas: [
	              { label: '周一', value: 'Mon' },
	              { label: '周二', value: 'Tue' },
	              { label: '周三', value: 'Wed' },
	              { label: '周四', value: 'Thu' },
	              { label: '周五', value: 'Fri' },
	              { label: '周六', value: 'Sat' },
	              { label: '周日', value: 'Sun' },
	            ],
	          },
	          show: {
	            kind: 'tv',
	            showArea: true,
              secondaryLabel: '类型',
	            categoryConst: 'show',
	            defaultCategory: 'all',
              defaultArea: 'show',
	            categories: [
	              { label: '全部', value: 'all' },
	            ],
	            areas: [
	              { label: '全部', value: 'show' },
	              { label: '国内', value: 'show_domestic' },
	              { label: '国外', value: 'show_foreign' },
	            ],
	          },
	        };

	        let browseSeq = 0;
	        let browseState = {
	          type: 'movie',
	          category: DOUBAN_FILTERS.movie.defaultCategory,
	          area: DOUBAN_FILTERS.movie.defaultArea,
	        };

        const clearBrowse = () => {
          browseGridEl.innerHTML = '';
        };

        const setBrowseStatus = (text) => {
          if (!text) {
            browseStatusEl.classList.add('hidden');
            browseStatusEl.textContent = '';
            return;
          }
          browseStatusEl.textContent = text;
          browseStatusEl.classList.remove('hidden');
        };

        const setChipActive = (container, value) => {
          Array.from(container.querySelectorAll('button.douban-chip')).forEach((btn) => {
            btn.classList.toggle('is-active', (btn.getAttribute('data-value') || '') === value);
          });
        };

        const buildChips = (container, items, selectedValue, onPick) => {
          container.innerHTML = '';
          items.forEach((it) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'douban-chip';
            btn.textContent = it.label;
            btn.setAttribute('data-value', it.value);
            if (it.value === selectedValue) btn.classList.add('is-active');
            btn.addEventListener('click', () => onPick(it.value));
            container.appendChild(btn);
          });
        };

        const openSearchByTitle = (title) => {
          const q = typeof title === 'string' ? title.trim() : '';
          if (!q) return;
          try {
            window.dispatchEvent(new CustomEvent('tv:home-view', { detail: { view: 'search' } }));
          } catch (_e) {}
          try {
            window.dispatchEvent(new CustomEvent('tv:search', { detail: { q } }));
          } catch (_e) {}
        };

        const renderBrowseGrid = (items, stypeForPlay) => {
          browseGridEl.innerHTML = '';
          if (!Array.isArray(items) || !items.length) {
            setBrowseStatus('暂无相关内容');
            return;
          }

          setBrowseStatus('');

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

          const frag = document.createDocumentFragment();
          items.forEach((item) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'w-full';

            const activate = () => openSearchByTitle(String(item?.title || ''));

	            const card = document.createElement('div');
	            card.className = 'douban-card group w-full';
	            card.setAttribute('role', 'link');
	            card.setAttribute('tabindex', '0');
            card.addEventListener('click', activate);
            card.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activate();
              }
            });

	            const posterWrap = document.createElement('div');
	            posterWrap.className = 'douban-poster';

            if (item.poster) {
              const img = document.createElement('img');
              const candidates = buildImageCandidates(item.poster);
              const src = candidates[0] || '';
              img.alt = item.title || '';
              img.loading = 'lazy';
              img.decoding = 'async';
              img.className =
                'w-full h-full object-cover opacity-0 transition-opacity transition-transform duration-300 ease-out group-hover:scale-105';
              img.dataset.src = src;
              img.dataset.fallbackStep = '0';
              img.addEventListener('load', () => {
                img.classList.remove('opacity-0');
              });
              img.addEventListener('error', () => {
                const step = Number(img.dataset.fallbackStep || '0');
                const next = candidates[step + 1];
                if (!next) return;
                img.dataset.fallbackStep = String(step + 1);
                img.setAttribute('src', next);
              });
              posterWrap.appendChild(img);
              if (io) io.observe(img);
              else img.setAttribute('src', img.dataset.src || '');
            }

            if (item.rate) {
              const badge = document.createElement('div');
              badge.className =
                'absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ease-out group-hover:scale-110';
              badge.textContent = item.rate;
              posterWrap.appendChild(badge);
            }

	            appendTvCardHoverOverlays(posterWrap);

            const detailUrl = buildDetailUrl(item);
            if (detailUrl) {
              const link = document.createElement('a');
              link.href = detailUrl;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              link.className =
                'absolute top-2 left-2 opacity-0 -translate-x-2 pointer-events-none transition-all duration-300 ease-in-out delay-100 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 sm:group-hover:pointer-events-auto';
              link.addEventListener('click', (e) => e.stopPropagation());
              link.innerHTML =
                '<div class="bg-green-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 hover:scale-[1.1] transition-all duration-300 ease-out">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>' +
                '</div>';
              posterWrap.appendChild(link);
            }

	            const title = document.createElement('div');
	            title.className = 'douban-card-title';
	            title.textContent = item.title || '';

            card.appendChild(posterWrap);
            card.appendChild(title);
            wrapper.appendChild(card);
            frag.appendChild(wrapper);
          });
          browseGridEl.appendChild(frag);
        };

	        const loadBrowse = async ({ type, category, area }) => {
	          const seq = (browseSeq += 1);
	          const t = DOUBAN_FILTERS[type] ? type : 'movie';
	          const cfg = DOUBAN_FILTERS[t];

	          browseTitleEl.textContent = DOUBAN_LABEL[t] || '豆瓣';
            const secondaryLabelEl = document.getElementById('doubanFilterSecondaryLabel');
            if (secondaryLabelEl) {
              secondaryLabelEl.textContent =
                t === 'movie'
                  ? '地区'
                  : cfg.secondaryLabel
                    ? String(cfg.secondaryLabel)
                    : '筛选';
            }
	          const areaRow = filterAreaEl && filterAreaEl.closest ? filterAreaEl.closest('.douban-filter-row') : null;
	          if (cfg.showArea) {
	            if (areaRow) areaRow.classList.remove('hidden');
	          } else {
	            if (areaRow) areaRow.classList.add('hidden');
	            filterAreaEl.innerHTML = '';
	          }

	          const selectedCategory =
	            category || cfg.defaultCategory || (cfg.categories && cfg.categories[0] ? cfg.categories[0].value : '');
	          let selectedArea =
	            area || cfg.defaultArea || (cfg.areas && cfg.areas[0] ? cfg.areas[0].value : '');
            if (t === 'anime' && selectedCategory === 'today') {
              const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              selectedArea = weekdays[new Date().getDay()];
            }

	          buildChips(filterCategoryEl, cfg.categories, selectedCategory, (v) => {
	            browseState = { ...browseState, type: t, category: v };
              if (t === 'anime' && v === 'today') {
                const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                browseState.area = weekdays[new Date().getDay()];
              }
	            setChipActive(filterCategoryEl, v);
	            loadBrowse({ type: t, category: v, area: browseState.area });
	          });
	          if (cfg.showArea) {
	            buildChips(filterAreaEl, cfg.areas, selectedArea, (v) => {
	              browseState = { ...browseState, type: t, area: v };
	              setChipActive(filterAreaEl, v);
	              loadBrowse({ type: t, category: browseState.category, area: v });
	            });
	          }

	          setBrowseStatus('加载中...');
	          clearBrowse();

	          try {
              if (t === 'anime') {
                const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const todayEn = weekdays[new Date().getDay()];
                const mode = selectedCategory === 'today' ? 'today' : 'week';
                const selectedDay = mode === 'today' ? todayEn : selectedArea;

                const calendar = await fetchBangumiCalendar(12000);
                if (seq !== browseSeq) return;

                const dayMap = new Map();
                (Array.isArray(calendar) ? calendar : []).forEach((d) => {
                  const key = String(d?.weekday?.en || '').trim();
                  if (key) dayMap.set(key, Array.isArray(d?.items) ? d.items : []);
                });
                const items = dayMap.get(selectedDay) || [];
                const mapped = items
                  .filter((it) => it && it.images)
                  .map((it) => ({
                    id: String(it?.id || ''),
                    title: it?.name_cn || it?.name || '',
                    poster:
                      it?.images?.large ||
                      it?.images?.common ||
                      it?.images?.medium ||
                      it?.images?.small ||
                      it?.images?.grid ||
                      '',
                    rate: it?.rating?.score ? Number(it.rating.score).toFixed(1) : '',
                    year: (it?.air_date || '').split('-')?.[0] || '',
                    isBangumi: true,
                  }));
                renderBrowseGrid(mapped, 'tv');
                return;
              }

	            const requestCategory = t === 'movie' ? selectedCategory : cfg.categoryConst || 'tv';

		            const requestType =
                t === 'movie'
                  ? selectedArea
                  : t === 'tv'
                    ? selectedCategory && selectedCategory !== 'all'
                      ? selectedCategory
                      : selectedArea
                    : t === 'show'
                      ? selectedArea
                      : selectedCategory;

	            const items = await fetchDoubanRecentHot({
	              kind: cfg.kind,
	              category: requestCategory,
	              hotType: requestType,
	              start: 0,
	              limit: 60,
	            });
	            if (seq !== browseSeq) return;
	            renderBrowseGrid(items, t === 'movie' ? 'movie' : 'tv');
	          } catch (e) {
	            if (seq !== browseSeq) return;
	            setBrowseStatus(`加载失败：${e && e.message ? e.message : '未知错误'}`);
	            clearBrowse();
          }
        };

	        window.addEventListener('tv:douban-browse', (e) => {
	          const type = e && e.detail && typeof e.detail.type === 'string' ? e.detail.type.trim() : '';
	          const t = DOUBAN_FILTERS[type] ? type : 'movie';
	          const cfg = DOUBAN_FILTERS[t];
	          browseState = {
	            type: t,
	            category: cfg.defaultCategory || (cfg.categories && cfg.categories[0] ? cfg.categories[0].value : ''),
	            area: cfg.defaultArea || (cfg.areas && cfg.areas[0] ? cfg.areas[0].value : ''),
	          };
	            if (t === 'anime' && browseState.category === 'today') {
              const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              browseState.area = weekdays[new Date().getDay()];
            }
	          loadBrowse({ type: browseState.type, category: browseState.category, area: browseState.area });
	        });

	        try {
          const HOME_VIEW_KEY = 'tv_server_home_view';
          const view = (localStorage.getItem(HOME_VIEW_KEY) || '').trim();
	          if (view && view.startsWith('douban:')) {
	            const t = view.slice('douban:'.length);
	            const real = DOUBAN_FILTERS[t] ? t : 'movie';
	            const cfg = DOUBAN_FILTERS[real];
	            browseState = {
	              type: real,
	              category: cfg.defaultCategory || (cfg.categories && cfg.categories[0] ? cfg.categories[0].value : ''),
	              area: cfg.defaultArea || (cfg.areas && cfg.areas[0] ? cfg.areas[0].value : ''),
	            };
              if (real === 'anime' && browseState.category === 'today') {
                const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                browseState.area = weekdays[new Date().getDay()];
              }
	            loadBrowse({ type: browseState.type, category: browseState.category, area: browseState.area });
	          }
	        } catch (_e) {}

        let homeRowsSeq = 0;
        const loadHomeRows = async () => {
          const seq = (homeRowsSeq += 1);

          try {
            const movies = await fetchDoubanRecentHot({
              kind: 'movie',
              category: '热门',
              hotType: '全部',
              start: 0,
              limit: HOME_LIMIT,
            });
            if (seq !== homeRowsSeq) return;
            if (Array.isArray(movies) && movies.length) renderRow(movieRow, movies, 'movie');
            else setRowMessage(movieRow, '暂无相关内容');
          } catch (_e) {
            if (seq !== homeRowsSeq) return;
            setRowMessage(movieRow, '暂无相关内容');
          }

          try {
            const tv = await fetchDoubanRecentHot({
              kind: 'tv',
              category: 'tv',
              hotType: 'tv',
              start: 0,
              limit: HOME_LIMIT,
            });
            if (seq !== homeRowsSeq) return;
            if (Array.isArray(tv) && tv.length) renderRow(tvRow, tv, '');
            else setRowMessage(tvRow, '暂无相关内容');
          } catch (_e) {
            if (seq !== homeRowsSeq) return;
            setRowMessage(tvRow, '暂无相关内容');
          }

          try {
            const bangumi = await fetchBangumiToday();
            if (seq !== homeRowsSeq) return;
            if (Array.isArray(bangumi) && bangumi.length) renderRow(bangumiRow, bangumi.slice(0, HOME_LIMIT), '');
            else setRowMessage(bangumiRow, '暂无相关内容');
          } catch (_e) {
            if (seq !== homeRowsSeq) return;
            setRowMessage(bangumiRow, '暂无相关内容');
          }

          try {
            const show = await fetchDoubanRecentHot({
              kind: 'tv',
              category: 'show',
              hotType: 'show',
              start: 0,
              limit: HOME_LIMIT,
            });
            if (seq !== homeRowsSeq) return;
            if (Array.isArray(show) && show.length) renderRow(showRow, show, '');
            else setRowMessage(showRow, '暂无相关内容');
          } catch (_e) {
            if (seq !== homeRowsSeq) return;
            setRowMessage(showRow, '暂无相关内容');
          }
        };

        let homeRowsRequested = false;
        const ensureHomeRowsLoaded = () => {
          if (homeRowsRequested) return;
          homeRowsRequested = true;
          loadHomeRows();
        };

	        try {
          window.addEventListener('tv:home-view', (e) => {
            const view = e && e.detail && typeof e.detail.view === 'string' ? e.detail.view.trim() : '';
            if (view === 'home') ensureHomeRowsLoaded();
          });
        } catch (_e) {}

        const shouldSkipDoubanRows = () => {
          try {
            const LAST_SITE_KEY = 'tv_server_last_site_key';
            const keyFromStorage = (localStorage.getItem(LAST_SITE_KEY) || '').trim();
            if (!keyFromStorage || keyFromStorage === 'home') return false;

            const siteList = document.getElementById('homeSiteNavList');
            if (!siteList) return false;
            const key = keyFromStorage;
            const esc = typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function' ? CSS.escape(key) : key;
            const exists = siteList.querySelector(`a[data-site-key="${esc}"]`);
            return !!exists;
          } catch (_e) {
            return false;
          }
        };

        const shouldSkip = shouldSkipDoubanRows();
        if (shouldSkip) {
          const siteSections = document.getElementById('homeSiteSections');
          const doubanSections = document.getElementById('homeDoubanSections');
          const doubanBrowse = document.getElementById('homeDoubanBrowse');
          if (siteSections) siteSections.classList.remove('hidden');
          if (doubanSections) doubanSections.classList.add('hidden');
          if (doubanBrowse) doubanBrowse.classList.add('hidden');
        } else {
          try {
            const HOME_VIEW_KEY = 'tv_server_home_view';
            const view = (localStorage.getItem(HOME_VIEW_KEY) || '').trim();
            if (!view || view === 'home') ensureHomeRowsLoaded();
          } catch (_e) {
            ensureHomeRowsLoaded();
          }
        }
}
