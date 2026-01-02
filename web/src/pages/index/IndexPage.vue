<template>
  <div
    v-if="!bootstrap || !bootstrap.authenticated"
    class="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-b from-[#e6f2fb] via-[#f8f9fa] to-[#f2f4f7]"
  >
    <LoginPage :bootstrap="bootstrap || {}" />
  </div>

  <div v-else class="app-shell w-full min-h-screen">
    <!-- 桌面端右上角操作区 -->
    <div class="hidden md:flex absolute top-4 right-6 z-[1100] items-center gap-4 top-actions">
      <button id="themeToggleBtn" class="top-action-btn" aria-label="切换主题" type="button">
        <svg class="theme-icon sun" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364-1.414 1.414M8.05 17.95l-1.414 1.414m12.728 0-1.414-1.414M8.05 6.05 6.636 4.636"></path></svg>
        <svg class="theme-icon moon hidden" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"></path></svg>
      </button>
      <div class="relative">
        <button id="userMenuBtn" class="top-action-btn" aria-label="用户菜单" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </button>
        <div id="userMenu" class="user-menu hidden">
          <div class="user-menu__header">
            <div>
              <div class="text-xs text-gray-500">当前用户</div>
              <div class="font-semibold text-gray-800">{{ bootstrap.user.username }}</div>
            </div>
            <span class="user-menu__badge">{{
              bootstrap.user.role === 'admin' ? '管理员' : bootstrap.user.role === 'shared' ? '共享' : '用户'
            }}</span>
          </div>
          <button id="userSettingsBtn" class="user-menu__item" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"></path></svg>
            <span>设置</span>
          </button>
          <a
            id="managePanelLink"
            class="user-menu__item"
            href="/dashboard"
            v-if="bootstrap.user.role === 'admin'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 7"></path><path d="M12 11l1.5 1.5"></path><rect width="18" height="11" x="3" y="3" rx="2"></rect><path d="M7 7h.01"></path><path d="M17 7h.01"></path><path d="M3 11h11"></path></svg>
            <span>管理面板</span>
          </a>
          <div class="user-menu__divider"></div>
          <a class="user-menu__item danger" href="/logout">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 17h8"></path><path d="M13 7h8"></path><path d="M13 12h8"></path><path d="M3 7l6 5-6 5V7Z"></path></svg>
            <span>登出</span>
          </a>
          <div class="user-menu__footer">
            <span class="text-xs text-gray-500">{{ appVersion }}</span>
            <span class="status-dot"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端顶部栏 -->
    <header
      ref="mobileHeaderEl"
      class="md:hidden fixed top-0 left-0 right-0 z-[999] w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
      style="padding-top:env(safe-area-inset-top)"
      v-show="!isPlayView"
    >
      <div class="min-h-[48px] flex items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="w-10 h-10 p-2 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200/50 transition-colors"
            aria-label="菜单"
            @click="toggleMobileMenu"
          >
            <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-10 h-10"></div>
          <div class="relative">
            <button
              type="button"
              class="w-10 h-10 p-2 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200/50 transition-colors"
              aria-label="用户菜单"
              @click.stop="toggleMobileUserMenu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user w-full h-full"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </button>
            <div
              v-show="mobileUserMenuOpen"
              class="tv-mobile-user-menu absolute right-0 mt-2 rounded-lg border border-gray-200/80 bg-white/95 shadow-lg backdrop-blur-xl overflow-hidden z-[1201] dark:border-white/10 dark:bg-[#0f172a]/95"
            >
              <button
                type="button"
                class="tv-mobile-user-item w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/60 dark:text-gray-100 dark:hover:bg-white/10"
                @click="openUserSettings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 3.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"></path></svg>
                <span>设置</span>
              </button>
              <a
                class="tv-mobile-user-item w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50/60 dark:text-red-400 dark:hover:bg-white/10"
                href="/logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 17h8"></path><path d="M13 7h8"></path><path d="M13 12h8"></path><path d="M3 7l6 5-6 5V7Z"></path></svg>
                <span>登出</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <button
          type="button"
          class="text-2xl font-bold text-green-600 tracking-tight hover:opacity-80 transition-opacity max-w-[60vw] truncate"
          @click="switchHome"
        >
          {{ mobileHeaderTitle }}
        </button>
      </div>
    </header>

	    <div class="flex md:grid md:grid-cols-[auto_1fr] w-full min-h-screen md:min-h-auto">
	      <!-- 侧边栏：桌面固定 / 移动端抽屉 -->
	      <div
	        id="tvSidebarDrawer"
	        class="tv-sidebar-drawer z-[1200] md:z-auto"
	        :class="{ 'is-open': mobileMenuOpen }"
	      >
	        <div
	          class="tv-sidebar-panel md:w-auto md:max-w-none"
          >
	          <AppSidebar
	            :bootstrap="bootstrap"
            :active-page="isPlayView ? 'play' : 'home'"
            site-nav-variant="index"
            show-site-nav-overlays
          />
        </div>
      </div>

	      <div class="relative min-w-0 flex-1 transition-all duration-300">
          <div v-show="!isPlayView">
		        <main
              id="homePage"
              class="content-main flex-1 md:min-h-0 mb-14 md:mb-0 md:mt-0"
              style="padding-top:var(--tv-topbar-h, calc(3rem + env(safe-area-inset-top)));padding-bottom:calc(3.5rem + env(safe-area-inset-bottom))"
            >
		          <div class="px-2 sm:px-10 py-4 sm:py-8 overflow-visible">
		              <div
			                id="homeDoubanConfig"
		                class="hidden"
		                :data-douban-data-proxy="bootstrap.settings.doubanDataProxy"
		                :data-douban-data-custom="bootstrap.settings.doubanDataCustom"
		                :data-douban-img-proxy="bootstrap.settings.doubanImgProxy"
		                :data-douban-img-custom="bootstrap.settings.doubanImgCustom"
		                :data-cat-api-base="bootstrap.user.role === 'user' ? (bootstrap.settings.userCatPawOpenApiBase || '') : (bootstrap.settings.userCatPawOpenApiBase || bootstrap.settings.catPawOpenApiBase || '')"
		                :data-user-role="bootstrap.user.role"
		                :data-user-cat-api-base="bootstrap.settings.userCatPawOpenApiBase || ''"
		                :data-tv-user="bootstrap.user.username"
		                :data-search-thread-count="bootstrap.settings.searchThreadCount"
		                :data-search-site-order="JSON.stringify(bootstrap.settings.searchSiteOrder || [])"
		                :data-search-cover-site="bootstrap.settings.searchCoverSite || ''"
		                :data-magic-aggregate-rules="JSON.stringify(bootstrap.settings.magicAggregateRules || [])"
		              ></div>
	            <div id="homeSegToggle" class="mb-8 flex justify-center">
	              <div class="seg-toggle relative inline-flex bg-gray-300/80 rounded-full p-1">
	                <button id="segHomeBtn" type="button" class="seg-btn active relative z-10 w-16 px-3 py-1 text-xs sm:w-20 sm:py-2 sm:text-sm rounded-full font-semibold transition-all duration-200 cursor-pointer text-gray-900">首页</button>
	                <button id="segFavBtn" type="button" class="seg-btn relative z-10 w-16 px-3 py-1 text-xs sm:w-20 sm:py-2 sm:text-sm rounded-full font-semibold transition-all duration-200 cursor-pointer text-gray-700 hover:text-gray-900">收藏夹</button>
	              </div>
	            </div>

		            <div class="w-full">
		              <section id="homeContinueSection" class="tv-section hidden">
				                <div class="tv-section-head">
				                  <h2 class="tv-section-title">继续观看</h2>
				                </div>
		                <div class="relative">
		                  <div id="homeContinueRow" class="tv-scroll-row" style="min-height:clamp(210px,35vw,380px)"></div>
		                </div>
		              </section>

	                    <section id="homeFavoritesSection" class="tv-section hidden">
	                      <div class="tv-section-head px-4 sm:px-6">
	                        <h2 class="tv-section-title">收藏夹</h2>
	                      </div>
	                      <div class="px-4 sm:px-6">
	                        <div id="homeFavoritesGrid" class="douban-grid"></div>
	                        <div id="homeFavoritesEmpty" class="hidden text-sm text-gray-500 dark:text-gray-400 py-10 text-center select-none">暂无收藏</div>
	                      </div>
	                    </section>

		              <div id="homeSiteSections" class="hidden"></div>

			              <div id="homeDoubanSections">
			              <section class="tv-section">
		                <div class="tv-section-head">
		                  <h2 class="tv-section-title">热门电影</h2>
		                  <button type="button" class="more-link" @click="switchDouban('movie')">查看更多</button>
		                </div>
		                <div class="relative">
		                  <div id="homeHotMovieRow" class="tv-scroll-row" style="min-height:clamp(210px,35vw,380px)">
	                      <div class="w-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 select-none">
	                        加载中...
	                      </div>
	                    </div>
		                </div>
		              </section>

		              <section class="tv-section">
		                <div class="tv-section-head">
	                  <h2 class="tv-section-title">热门剧集</h2>
	                  <button type="button" class="more-link" @click="switchDouban('tv')">查看更多</button>
		                </div>
		                <div class="relative">
		                  <div id="homeHotTvRow" class="tv-scroll-row" style="min-height:clamp(210px,35vw,380px)">
	                      <div class="w-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 select-none">
	                        加载中...
	                      </div>
	                    </div>
		                </div>
		              </section>

		              <section class="tv-section">
		                <div class="tv-section-head">
	                  <h2 class="tv-section-title">新番放送</h2>
	                  <button type="button" class="more-link" @click="switchDouban('anime')">查看更多</button>
		                </div>
		                <div class="relative">
		                  <div id="homeBangumiRow" class="tv-scroll-row" style="min-height:clamp(210px,35vw,380px)">
	                      <div class="w-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 select-none">
	                        加载中...
	                      </div>
	                    </div>
		                </div>
		              </section>

		              <section class="tv-section">
		                <div class="tv-section-head">
	                  <h2 class="tv-section-title">热门综艺</h2>
	                  <button type="button" class="more-link" @click="switchDouban('show')">查看更多</button>
		                </div>
		                <div class="relative">
		                  <div id="homeHotShowRow" class="tv-scroll-row" style="min-height:clamp(210px,35vw,380px)">
	                      <div class="w-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 select-none">
	                        加载中...
	                      </div>
	                    </div>
		                </div>
			              </section>
		              </div>

                  <!-- 豆瓣分类页（侧边栏：电影/剧集/动漫/综艺） -->
                  <div id="homeDoubanBrowse" class="hidden">
                    <div class="douban-browse-header">
                      <div class="douban-browse-header__row">
	                        <button
	                          id="doubanBrowseBackBtn"
	                          type="button"
	                          class="tv-icon-btn hidden flex-shrink-0"
	                          aria-label="返回"
	                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m15 18-6-6 6-6"></path>
                          </svg>
                        </button>
                        <div class="min-w-0">
                          <div id="doubanBrowseTitle" class="douban-browse-title">电影</div>
                          <div class="douban-browse-subtitle">来自豆瓣的精选内容</div>
                        </div>
                      </div>
                    </div>

                    <div class="douban-filter-panel">
                      <div class="douban-filter-row">
                        <div class="douban-filter-label">分类</div>
                        <div id="doubanFilterCategory" class="douban-chip-group" role="tablist"></div>
                      </div>
                      <div class="douban-filter-row">
                        <div id="doubanFilterSecondaryLabel" class="douban-filter-label">地区</div>
                        <div id="doubanFilterArea" class="douban-chip-group" role="tablist"></div>
                      </div>
                    </div>

                    <div id="doubanBrowseStatus" class="douban-browse-status hidden">加载中...</div>
                    <div id="doubanBrowseGrid" class="douban-grid douban-browse-grid"></div>
                  </div>
	            </div>
	          </div>
	        </main>

	          <main
	            id="searchPage"
	            class="content-main flex-1 md:min-h-0 mb-14 md:mb-0 md:mt-0 hidden"
	            style="padding-top:var(--tv-topbar-h, calc(3rem + env(safe-area-inset-top)));padding-bottom:calc(3.5rem + env(safe-area-inset-bottom))"
	          >
            <div class="px-4 sm:px-10 py-4 sm:py-8 overflow-visible mb-10">
              <div class="mb-8">
                <form id="searchForm" class="max-w-2xl mx-auto">
                  <div class="relative">
                    <svg class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                    <input
                      id="searchInput"
                      type="text"
                      placeholder="搜索电影、电视剧..."
                      autocomplete="off"
                      class="w-full h-12 rounded-lg bg-gray-50/80 py-3 pl-10 pr-12 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white border border-gray-200/50 shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:placeholder-gray-500 dark:focus:bg-gray-700 dark:border-gray-700"
                    />
                    <button
                      id="clearQueryBtn"
                      type="button"
                      class="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-300 hidden"
                      aria-label="清除搜索内容"
                    >
                      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                    </button>
                  </div>
                </form>
              </div>

	              <div class="max-w-[95%] mx-auto mt-6 overflow-visible">
	                <section id="searchResultsSection" class="tv-section hidden">
	                  <div class="tv-section-head">
	                    <h2 class="tv-section-title">搜索结果</h2>
	                    <div id="searchResultsSummary" class="tv-section-status"></div>
	                  </div>
	                  <div id="searchResultsStatus" class="text-center text-gray-500 py-8 dark:text-gray-400 hidden"></div>
	                  <div id="searchResultsList" class="space-y-6"></div>
	                </section>

	                <section id="searchHistorySection" class="tv-section hidden">
	                  <div class="tv-section-head">
	                    <h2 class="tv-section-title">搜索历史</h2>
	                    <div class="tv-section-actions">
	                      <button id="clearHistoryBtn" type="button" class="tv-link-danger">清空</button>
	                    </div>
	                  </div>
	                  <div id="searchHistoryChips" class="flex flex-wrap gap-2"></div>
	                </section>
	              </div>
	            </div>
	          </main>
          </div>

          <PlayPage v-if="isPlayView" :key="playKey" :bootstrap="bootstrap" v-bind="playParams" />
		      </div>
		    </div>

    <!-- 移动端底部导航 -->
    <div class="md:hidden">
      <nav id="homeMobileBottomNav" class="md:hidden fixed left-0 right-0 z-[600] bg-white/90 backdrop-blur-xl border-t border-gray-200/50 overflow-hidden" style="bottom:0;padding-bottom:env(safe-area-inset-bottom);min-height:calc(3.5rem + env(safe-area-inset-bottom))">
        <ul class="flex items-center overflow-x-auto scrollbar-hide">
          <li class="flex-shrink-0" style="width:20vw;min-width:20vw">
            <button type="button" class="flex flex-col items-center justify-center w-full h-14 gap-1 text-xs" @click="switchHome">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house h-6 w-6" :class="mobileActiveTab === 'home' ? 'text-green-600' : 'text-gray-500'"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
              <span :class="mobileActiveTab === 'home' ? 'text-green-600' : 'text-gray-600'">首页</span>
            </button>
          </li>
          <li class="flex-shrink-0" style="width:20vw;min-width:20vw">
            <button type="button" class="flex flex-col items-center justify-center w-full h-14 gap-1 text-xs" @click="switchFavorites">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart h-6 w-6" :class="mobileActiveTab === 'favorites' ? 'text-green-600' : 'text-gray-500'"><path d="M20.84 4.61c-1.54-1.33-3.77-1.32-5.3.02L12 8.09l-3.54-3.46c-1.53-1.34-3.76-1.35-5.3-.02-1.73 1.5-1.84 4.08-.35 5.74L12 21l9.19-10.65c1.49-1.66 1.38-4.24-.35-5.74z"/></svg>
              <span :class="mobileActiveTab === 'favorites' ? 'text-green-600' : 'text-gray-600'">收藏</span>
            </button>
          </li>
          <li class="flex-shrink-0" style="width:20vw;min-width:20vw">
            <button type="button" class="flex flex-col items-center justify-center w-full h-14 gap-1 text-xs" @click="switchSearch">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search h-6 w-6" :class="mobileActiveTab === 'search' ? 'text-green-600' : 'text-gray-500'"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
              <span :class="mobileActiveTab === 'search' ? 'text-green-600' : 'text-gray-600'">搜索</span>
            </button>
          </li>
          <li class="flex-shrink-0" style="width:20vw;min-width:20vw">
            <button type="button" class="flex flex-col items-center justify-center w-full h-14 gap-1 text-xs" @click="switchHistory">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock h-6 w-6" :class="mobileActiveTab === 'history' ? 'text-green-600' : 'text-gray-500'"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
              <span :class="mobileActiveTab === 'history' ? 'text-green-600' : 'text-gray-600'">历史</span>
            </button>
          </li>
          <li class="flex-shrink-0" style="width:20vw;min-width:20vw">
            <button type="button" class="flex flex-col items-center justify-center w-full h-14 gap-1 text-xs" @click="openUserSettings">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings h-6 w-6 text-gray-500"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <span class="text-gray-600">设置</span>
            </button>
          </li>
	        </ul>
	      </nav>
	    </div>

  <!-- 管理后台页面 -->
  <div id="adminPage" class="hidden w-full min-h-screen bg-gray-50 dark:bg-[#0b1220]">
    <div class="flex min-h-screen">
      <aside class="sidebar bg-white/70 dark:bg-[#0d1624] border-r border-gray-200/60 dark:border-white/10 w-64 p-4 pt-6">
        <div class="text-xl font-bold text-green-600 mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>
          管理后台
        </div>
        <nav class="space-y-1">
          <a data-admin="site" class="admin-nav nav-item group flex items-center rounded-lg px-3 py-2 text-gray-700 dark:text-gray-100 hover:bg-gray-100/60 dark:hover:bg-white/10 gap-3" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house h-5 w-5 text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            <span class="nav-label">站点设置</span>
          </a>
          <a data-admin="user" class="admin-nav nav-item group flex items-center rounded-lg px-3 py-2 text-gray-700 dark:text-gray-100 hover:bg-gray-100/60 dark:hover:bg-white/10 gap-3" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users h-5 w-5 text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span class="nav-label">用户管理</span>
          </a>
          <a data-admin="video" class="admin-nav nav-item group flex items-center rounded-lg px-3 py-2 text-gray-700 dark:text-gray-100 hover:bg-gray-100/60 dark:hover:bg-white/10 gap-3" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-film h-5 w-5 text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 3v18"></path><path d="M3 7.5h4"></path><path d="M3 12h18"></path><path d="M3 16.5h4"></path><path d="M17 3v18"></path><path d="M17 7.5h4"></path><path d="M17 16.5h4"></path></svg>
            <span class="nav-label">视频源管理</span>
          </a>
          <a data-admin="live" class="admin-nav nav-item group flex items-center rounded-lg px-3 py-2 text-gray-700 dark:text-gray-100 hover:bg-gray-100/60 dark:hover:bg-white/10 gap-3" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio h-5 w-5 text-gray-500 group-hover:text-green-600 dark:group-hover:text-green-400"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path></svg>
            <span class="nav-label">直播源管理</span>
          </a>
        </nav>
      </aside>
      <div class="flex-1 flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200/70 dark:border-white/10 bg-white/80 dark:bg-[#0d1624]/80 backdrop-blur-md">
          <div class="text-lg font-semibold text-gray-800 dark:text-gray-100">站点配置</div>
          <div class="flex items-center gap-3">
            <button id="adminBackBtn" class="px-3 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-100 dark:hover:bg-white/15">返回首页</button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <section id="adminSite" class="admin-panel">
            <h3 class="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings h-5 w-5"><path d="M12 15v.01"></path><path d="M12 3v2"></path><path d="m14.6 4.5-1 1.73"></path><path d="M18.4 7l-1.73 1"></path><path d="M21 12h-2"></path><path d="m19.4 17-1.73-1"></path><path d="m14.6 19.5-1-1.73"></path><path d="M12 19v2"></path><path d="m9.4 19.5 1-1.73"></path><path d="M4.6 17l1.73-1"></path><path d="M3 12h2"></path><path d="m4.6 7 1.73 1"></path><path d="m9.4 4.5 1 1.73"></path><circle cx="12" cy="12" r="3"></circle></svg>
              站点设置
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">站点名称</label>
                <input
                  class="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0f172a] px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  :placeholder="bootstrap.siteName"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">站点公告</label>
                <textarea rows="3" class="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0f172a] px-3 py-2 text-sm text-gray-900 dark:text-gray-100" placeholder="本网站仅提供影视信息搜索服务，所有内容均来自第三方网站。本站不存储任何视频资源，不对任何内容的准确性、合法性负责。"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">豆瓣数据代理</label>
                <select class="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0f172a] px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                  <option>豆瓣 CDN By CMLiussss（腾讯云）</option>
                  <option>官方直连</option>
                  <option>自定义代理</option>
                </select>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">选择获取豆瓣数据的方式</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">豆瓣图片代理</label>
                <select class="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0f172a] px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                  <option>豆瓣 CDN By CMLiussss（腾讯云）</option>
                  <option>官方直连</option>
                  <option>自定义代理</option>
                </select>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">选择获取豆瓣图片的方式</p>
              </div>
	              <div>
	                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">搜索接口可拉取最大页数</label>
	                <input class="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0f172a] px-3 py-2 text-sm text-gray-900 dark:text-gray-100" placeholder="5" />
	              </div>
            </div>
          </section>
          <section id="adminUser" class="admin-panel hidden">
            <div class="text-sm text-gray-500 dark:text-gray-400">用户管理内容占位</div>
          </section>
          <section id="adminVideo" class="admin-panel hidden">
            <div class="text-sm text-gray-500 dark:text-gray-400">视频源管理内容占位</div>
          </section>
          <section id="adminLive" class="admin-panel hidden">
            <div class="text-sm text-gray-500 dark:text-gray-400">直播源管理内容占位</div>
          </section>
        </div>
      </div>
    </div>
  </div>

    <UserSettingsModal :bootstrap="bootstrap" />
  </div>
</template>

<script setup>
	import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
	import AppSidebar from '../../shared/AppSidebar.vue';
	import { initMainInteractions } from '../../shared/mainInteractions';
	import { initIndexPage } from './indexClient.js';
	import UserSettingsModal from '../../shared/UserSettingsModal.vue';
	import PlayPage from '../play/PlayPage.vue';
import LoginPage from '../login/LoginPage.vue';

const props = defineProps({ bootstrap: { type: Object, required: true } });
const bootstrap = props.bootstrap;

const appVersion =
  (typeof window !== 'undefined' && window.__TV_SERVER_VERSION__) || 'V1.0.0';

const LAST_SITE_KEY = 'tv_server_last_site_key';
const LAST_SITE_NAME_KEY = 'tv_server_last_site_name';
const HOME_VIEW_KEY = 'tv_server_home_view';

	const isPlayView = ref(false);
	let scrollBeforePlayY = 0;
	let hasScrollBeforePlay = false;
	const mobileHeaderEl = ref(null);
	const mobileMenuOpen = ref(false);
	const mobileUserMenuOpen = ref(false);
	const mobileActiveTab = ref('home'); // home | favorites | search | history
	const mobileContext = ref({ kind: 'home', siteName: '' }); // home | search | douban | site | favorites | history

const playKey = ref(0);
const playParams = ref({
  videoTitle: '',
  videoYear: '',
  searchType: '',
  siteKey: '',
  spiderApi: '',
  videoId: '',
  videoIntro: '',
  videoPoster: '',
  videoRemark: '',
});

function dispatchHomeView(view) {
  window.dispatchEvent(new CustomEvent('tv:home-view', { detail: { view } }));
}

function switchHome() {
  try {
    localStorage.setItem(LAST_SITE_KEY, 'home');
    localStorage.setItem(HOME_VIEW_KEY, 'home');
  } catch {}
  isPlayView.value = false;
  mobileActiveTab.value = 'home';
  dispatchHomeView('home');
}

function switchDouban(type) {
  const t = typeof type === 'string' ? type.trim() : '';
  if (!t) return;
  try {
    localStorage.setItem(LAST_SITE_KEY, 'home');
    localStorage.setItem(HOME_VIEW_KEY, `douban:${t}`);
  } catch {}
  isPlayView.value = false;
  mobileActiveTab.value = 'home';
  dispatchHomeView(`douban:${t}`);
}

function switchSearch() {
  isPlayView.value = false;
  mobileActiveTab.value = 'search';
  dispatchHomeView('search');
}

function switchFavorites() {
  isPlayView.value = false;
  mobileActiveTab.value = 'favorites';
  dispatchHomeView('fav');
}

function switchHistory() {
  isPlayView.value = false;
  mobileActiveTab.value = 'history';
  dispatchHomeView('history');
}

function toggleMobileMenu() {
  mobileUserMenuOpen.value = false;
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function toggleMobileUserMenu() {
  mobileMenuOpen.value = false;
  mobileUserMenuOpen.value = !mobileUserMenuOpen.value;
}

function openUserSettings() {
  mobileUserMenuOpen.value = false;
  try {
    window.dispatchEvent(new CustomEvent('tv:open-user-settings'));
  } catch (_e) {}
}

const mobileHeaderTitle = computed(() => {
  const kind = mobileContext.value && mobileContext.value.kind ? String(mobileContext.value.kind) : 'home';
  if (kind === 'site') {
    const n = mobileContext.value && typeof mobileContext.value.siteName === 'string' ? mobileContext.value.siteName : '';
    const t = n.trim();
    if (t) return t;
  }
  return (bootstrap && bootstrap.siteName ? String(bootstrap.siteName) : '').trim();
});

const syncMobileContextFromStorage = () => {
  try {
    if (typeof window === 'undefined') return;
    const view = (localStorage.getItem(HOME_VIEW_KEY) || '').trim();
    // search/play 不持久化：刷新后仅恢复 home / douban:* / site
    if (view.startsWith('douban:')) {
      mobileContext.value = { kind: 'douban', siteName: '' };
      mobileActiveTab.value = 'home';
      return;
    }

    const lastKey = (localStorage.getItem(LAST_SITE_KEY) || '').trim();
    if (lastKey && lastKey !== 'home') {
      let name = (localStorage.getItem(LAST_SITE_NAME_KEY) || '').trim();
      if (!name) {
        // best-effort from DOM (if sidebar list already rendered)
        const safeKey =
          typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function' ? CSS.escape(lastKey) : lastKey.replace(/"/g, '\\"');
        const el = document.querySelector(`#tvSidebarDrawer [data-site-key="${safeKey}"] .nav-label`);
        if (el && el.textContent) name = String(el.textContent).trim();
      }
      mobileContext.value = { kind: 'site', siteName: name || lastKey };
      mobileActiveTab.value = '';
      return;
    }

    mobileContext.value = { kind: 'home', siteName: '' };
    mobileActiveTab.value = 'home';
  } catch (_e) {}
};

	const onExitPlay = () => {
	  isPlayView.value = false;
	  if (!hasScrollBeforePlay) return;
	  const restoreY = scrollBeforePlayY;
	  hasScrollBeforePlay = false;
	  scrollBeforePlayY = 0;
	  nextTick(() => {
	    try {
	      requestAnimationFrame(() => window.scrollTo(0, restoreY));
	    } catch (_e) {
	      try {
	        window.scrollTo(0, restoreY);
	      } catch (_e2) {}
	    }
	  });
	};

	const onOpenPlay = (e) => {
	  const wasInPlay = isPlayView.value;
	  if (!wasInPlay && typeof window !== 'undefined') {
	    scrollBeforePlayY = window.scrollY || window.pageYOffset || 0;
	    hasScrollBeforePlay = true;
	  }
	  const d = e && e.detail && typeof e.detail === 'object' ? e.detail : {};
	  playParams.value = {
	    videoTitle: typeof d.videoTitle === 'string' ? d.videoTitle : '',
	    videoYear: typeof d.videoYear === 'string' ? d.videoYear : '',
    searchType: typeof d.searchType === 'string' ? d.searchType : '',
    siteKey: typeof d.siteKey === 'string' ? d.siteKey : '',
    spiderApi: typeof d.spiderApi === 'string' ? d.spiderApi : '',
    videoId: typeof d.videoId === 'string' ? d.videoId : '',
    videoIntro: typeof d.videoIntro === 'string' ? d.videoIntro : '',
    videoPoster: typeof d.videoPoster === 'string' ? d.videoPoster : '',
    videoRemark: typeof d.videoRemark === 'string' ? d.videoRemark : '',
	  };
	  playKey.value += 1;
	  isPlayView.value = true;
	  if (!wasInPlay) {
	    nextTick(() => {
	      try {
	        requestAnimationFrame(() => window.scrollTo(0, 0));
	      } catch (_e) {
	        try {
	          window.scrollTo(0, 0);
	        } catch (_e2) {}
	      }
	    });
	  }
	};

onMounted(() => {
  if (!bootstrap || !bootstrap.authenticated) return;
  initMainInteractions();
  initIndexPage();
  syncMobileContextFromStorage();
  if (typeof window === 'undefined') return;
  window.addEventListener('tv:open-play', onOpenPlay);
  window.addEventListener('tv:exit-play', onExitPlay);
  window.addEventListener('tv:home-view', onExitPlay);
});

let mobileHeaderObserver = null;
let onWindowClick = null;
let onMobileContext = null;
let onDocPointerDown = null;
let onDocPointerMove = null;
let onDocPointerUp = null;
let onDocTouchStart = null;
let onDocTouchMove = null;
let onDocTouchEnd = null;
let onDocTouchCancel = null;
let onSidebarSitesUpdated = null;

const updateMobileDrawerWidth = () => {
  try {
    if (typeof window === 'undefined') return;
    if (!window.matchMedia || !window.matchMedia('(max-width: 767.98px)').matches) return;
    const drawer = document.getElementById('tvSidebarDrawer');
    if (!drawer) return;

    const panel = drawer.querySelector('.tv-sidebar-panel');
    if (!panel) return;

    const viewportW = window.innerWidth || 0;
    if (!viewportW) return;

    const panelWidth = panel.clientWidth || 0;
    const basePx = Math.ceil(viewportW * 0.33);
    let requiredPanelPx = Math.max(panelWidth || 0, basePx);

    const keepRightSpacePx = 24; // visual breathing room on the right

    // Expand only when text is truncated. Estimate the needed panel width by
    // combining "non-label width" (icon/padding/gaps) with the label's scrollWidth.
    const labels = panel.querySelectorAll('.nav-label');
    labels.forEach((label) => {
      const clientW = label && typeof label.clientWidth === 'number' ? label.clientWidth : 0;
      const scrollW = label && typeof label.scrollWidth === 'number' ? label.scrollWidth : 0;
      if (!clientW || !scrollW) return;
      if (scrollW <= clientW) return;

      const item = label.closest('.nav-item');
      const itemW = item && typeof item.clientWidth === 'number' ? item.clientWidth : 0;
      const nonLabelW = Math.max(0, itemW - clientW);
      const needW = nonLabelW + scrollW + keepRightSpacePx;
      requiredPanelPx = Math.max(requiredPanelPx, needW);
    });

    // Also account for the brand title (top logo text) so it doesn't wrap to 2 lines.
    // We prefer to widen the drawer (within the clamp) rather than forcing a line break.
    const brandText = panel.querySelector('#desktopSidebar .brand-box span');
    if (brandText && typeof brandText.scrollWidth === 'number') {
      const scrollW = brandText.scrollWidth || 0;
      if (scrollW) {
        // Brand area has its own paddings/margins; add some extra breathing room.
        requiredPanelPx = Math.max(requiredPanelPx, scrollW + 48);
      }
    }

    const desiredVw = Math.ceil((requiredPanelPx / viewportW) * 100);
    const clampedVw = Math.min(70, Math.max(33, desiredVw));
    drawer.style.setProperty('--tv-drawer-w', `${clampedVw}vw`);
  } catch (_e) {}
};

const updateTopbarHeightVar = () => {
  try {
    const el = mobileHeaderEl.value;
    if (!el) return;
    const h = el.offsetHeight || 0;
    document.documentElement.style.setProperty('--tv-topbar-h', `${h}px`);
  } catch (_e) {}
};

watch(isPlayView, () => {
  try {
    requestAnimationFrame(() => updateTopbarHeightVar());
  } catch (_e) {
    updateTopbarHeightVar();
  }
});

onMounted(() => {
  if (typeof window === 'undefined') return;

  // Topbar height (safe-area + actual rendered height) -> for page offset.
  updateTopbarHeightVar();
  try {
    if (mobileHeaderEl.value && typeof ResizeObserver !== 'undefined') {
      mobileHeaderObserver = new ResizeObserver(() => updateTopbarHeightVar());
      mobileHeaderObserver.observe(mobileHeaderEl.value);
    }
  } catch (_e) {
    mobileHeaderObserver = null;
  }
  window.addEventListener('resize', updateTopbarHeightVar, { passive: true });
  window.addEventListener('orientationchange', updateTopbarHeightVar, { passive: true });
  window.addEventListener('resize', updateMobileDrawerWidth, { passive: true });
  window.addEventListener('orientationchange', updateMobileDrawerWidth, { passive: true });

  // When AppSidebar refreshes site list asynchronously, re-measure drawer width.
  onSidebarSitesUpdated = () => {
    if (!mobileMenuOpen.value) return;
    try {
      requestAnimationFrame(() => updateMobileDrawerWidth());
    } catch (_e) {
      updateMobileDrawerWidth();
    }
  };
  window.addEventListener('tv:sidebar-sites-updated', onSidebarSitesUpdated);

  // Close mobile user menu when clicking outside.
  onWindowClick = (e) => {
    const target = e && e.target ? e.target : null;
    if (!target || !target.closest) {
      mobileUserMenuOpen.value = false;
      mobileMenuOpen.value = false;
      return;
    }
    if (target.closest('[aria-label="用户菜单"]')) return;
    if (target.closest('.tv-mobile-user-menu')) return;
    mobileUserMenuOpen.value = false;

    if (
      mobileMenuOpen.value &&
      !target.closest('[aria-label="菜单"]') &&
      !target.closest('#tvSidebarDrawer .tv-sidebar-panel')
    ) {
      mobileMenuOpen.value = false;
    }
  };
  window.addEventListener('click', onWindowClick);

  // Mobile drawer: close on an *outside tap*, but do not close on scroll/drag gestures.
  // Also do not preventDefault, so underlying content remains interactive.
  const outsideState = { active: false, moved: false, x: 0, y: 0, isOutside: false };
  const isOutsidePanel = (target) => {
    if (!target || !target.closest) return true;
    if (target.closest('[aria-label="菜单"]')) return false;
    return !target.closest('#tvSidebarDrawer .tv-sidebar-panel');
  };

  onDocPointerDown = (e) => {
    if (!mobileMenuOpen.value) return;
    const target = e && e.target ? e.target : null;
    const outside = isOutsidePanel(target);
    if (!outside) return;
    outsideState.active = true;
    outsideState.moved = false;
    outsideState.isOutside = true;
    outsideState.x = typeof e.clientX === 'number' ? e.clientX : 0;
    outsideState.y = typeof e.clientY === 'number' ? e.clientY : 0;
  };
  onDocPointerMove = (e) => {
    if (!outsideState.active || !outsideState.isOutside) return;
    const dx = (typeof e.clientX === 'number' ? e.clientX : 0) - outsideState.x;
    const dy = (typeof e.clientY === 'number' ? e.clientY : 0) - outsideState.y;
    if (Math.abs(dx) + Math.abs(dy) > 10) outsideState.moved = true;
  };
  onDocPointerUp = () => {
    if (!outsideState.active || !outsideState.isOutside) return;
    const shouldClose = !outsideState.moved;
    outsideState.active = false;
    outsideState.isOutside = false;
    outsideState.moved = false;
    if (!shouldClose) return;
    setTimeout(() => {
      mobileMenuOpen.value = false;
    }, 0);
  };
  document.addEventListener('pointerdown', onDocPointerDown, { capture: true });
  document.addEventListener('pointermove', onDocPointerMove, { capture: true });
  document.addEventListener('pointerup', onDocPointerUp, { capture: true });
  document.addEventListener('pointercancel', onDocPointerUp, { capture: true });

  onDocTouchStart = (e) => {
    if (!mobileMenuOpen.value) return;
    const target = e && e.target ? e.target : null;
    const outside = isOutsidePanel(target);
    if (!outside) return;
    const t = e.touches && e.touches[0] ? e.touches[0] : null;
    outsideState.active = true;
    outsideState.moved = false;
    outsideState.isOutside = true;
    outsideState.x = t && typeof t.clientX === 'number' ? t.clientX : 0;
    outsideState.y = t && typeof t.clientY === 'number' ? t.clientY : 0;
  };
  onDocTouchMove = (e) => {
    if (!outsideState.active || !outsideState.isOutside) return;
    const t = e.touches && e.touches[0] ? e.touches[0] : null;
    const x = t && typeof t.clientX === 'number' ? t.clientX : 0;
    const y = t && typeof t.clientY === 'number' ? t.clientY : 0;
    const dx = x - outsideState.x;
    const dy = y - outsideState.y;
    if (Math.abs(dx) + Math.abs(dy) > 10) outsideState.moved = true;
  };
  onDocTouchEnd = () => {
    if (!outsideState.active || !outsideState.isOutside) return;
    const shouldClose = !outsideState.moved;
    outsideState.active = false;
    outsideState.isOutside = false;
    outsideState.moved = false;
    if (!shouldClose) return;
    setTimeout(() => {
      mobileMenuOpen.value = false;
    }, 0);
  };
  onDocTouchCancel = () => {
    outsideState.active = false;
    outsideState.isOutside = false;
    outsideState.moved = false;
  };
  document.addEventListener('touchstart', onDocTouchStart, { capture: true, passive: true });
  document.addEventListener('touchmove', onDocTouchMove, { capture: true, passive: true });
  document.addEventListener('touchend', onDocTouchEnd, { capture: true, passive: true });
  document.addEventListener('touchcancel', onDocTouchCancel, { capture: true, passive: true });

  // Sync mobile header/nav state from the DOM controller (indexClient).
  onMobileContext = (e) => {
    const d = e && e.detail && typeof e.detail === 'object' ? e.detail : {};
    const kind = typeof d.kind === 'string' ? d.kind.trim() : '';
    const siteName = typeof d.siteName === 'string' ? d.siteName : '';
    if (!kind) return;
    mobileContext.value = { kind, siteName };
    if (kind === 'home' || kind === 'douban') mobileActiveTab.value = 'home';
    else if (kind === 'search') mobileActiveTab.value = 'search';
    else if (kind === 'favorites') mobileActiveTab.value = 'favorites';
    else if (kind === 'history') mobileActiveTab.value = 'history';
    else if (kind === 'site') mobileActiveTab.value = '';
    mobileMenuOpen.value = false;
  };
  window.addEventListener('tv:mobile-context', onMobileContext);
});

watch(
  mobileMenuOpen,
  (open) => {
    if (!open) return;
    try {
      requestAnimationFrame(() => updateMobileDrawerWidth());
    } catch (_e) {
      updateMobileDrawerWidth();
    }
  },
  { immediate: true }
);


onBeforeUnmount(() => {
  if (typeof window === 'undefined') return;
  window.removeEventListener('tv:open-play', onOpenPlay);
  window.removeEventListener('tv:exit-play', onExitPlay);
  window.removeEventListener('tv:home-view', onExitPlay);
});

onBeforeUnmount(() => {
  try {
    if (mobileHeaderObserver) mobileHeaderObserver.disconnect();
  } catch (_e) {}
  mobileHeaderObserver = null;

  if (typeof window === 'undefined') return;
  window.removeEventListener('resize', updateTopbarHeightVar);
  window.removeEventListener('orientationchange', updateTopbarHeightVar);
  window.removeEventListener('resize', updateMobileDrawerWidth);
  window.removeEventListener('orientationchange', updateMobileDrawerWidth);
  if (onWindowClick) window.removeEventListener('click', onWindowClick);
  if (onMobileContext) window.removeEventListener('tv:mobile-context', onMobileContext);
  if (onSidebarSitesUpdated) window.removeEventListener('tv:sidebar-sites-updated', onSidebarSitesUpdated);
  try {
    if (onDocPointerDown) document.removeEventListener('pointerdown', onDocPointerDown, true);
  } catch (_e) {}
  try {
    if (onDocPointerMove) document.removeEventListener('pointermove', onDocPointerMove, true);
  } catch (_e) {}
  try {
    if (onDocPointerUp) document.removeEventListener('pointerup', onDocPointerUp, true);
  } catch (_e) {}
  try {
    if (onDocPointerUp) document.removeEventListener('pointercancel', onDocPointerUp, true);
  } catch (_e) {}
  try {
    if (onDocTouchStart) document.removeEventListener('touchstart', onDocTouchStart, true);
  } catch (_e) {}
  try {
    if (onDocTouchMove) document.removeEventListener('touchmove', onDocTouchMove, true);
  } catch (_e) {}
  try {
    if (onDocTouchEnd) document.removeEventListener('touchend', onDocTouchEnd, true);
  } catch (_e) {}
  try {
    if (onDocTouchCancel) document.removeEventListener('touchcancel', onDocTouchCancel, true);
  } catch (_e) {}
  onWindowClick = null;
  onMobileContext = null;
  onSidebarSitesUpdated = null;
  onDocPointerDown = null;
  onDocTouchStart = null;
  onDocPointerMove = null;
  onDocPointerUp = null;
  onDocTouchMove = null;
  onDocTouchEnd = null;
  onDocTouchCancel = null;
});
</script>
