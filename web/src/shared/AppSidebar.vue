<template>
  <div class="flex">
    <aside
      id="desktopSidebar"
      data-sidebar="true"
      class="sidebar fixed top-0 left-0 h-screen bg-white/40 backdrop-blur-xl transition-all duration-300 border-r border-gray-200/50 z-10 shadow-lg w-64"
      style="backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px)"
    >
      <div class="flex h-full flex-col min-h-0">
        <div class="relative h-16">
          <div
            class="brand-box absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-100"
          >
            <div class="w-[calc(100%-4rem)] flex justify-center">
              <span class="text-2xl font-bold text-green-600 tracking-tight">{{
                bootstrap.siteName
              }}</span>
            </div>
          </div>
          <button
            id="sidebarToggleBtn"
            class="absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 transition-colors duration-200 z-10 right-2"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-menu h-4 w-4"
            >
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav class="px-2 mt-4 space-y-1 flex-1 min-h-0 flex flex-col">
          <div class="space-y-1 flex-shrink-0">
            <button
              v-if="activePageResolved === 'home' || activePageResolved === 'play'"
              type="button"
              class="nav-item group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start w-full"
              :data-active="activePageResolved === 'home' && homeViewResolved === 'home' && !activeSiteKeyResolved"
              @click="selectHome"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-house h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700"
                >
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                  <path
                    d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                  ></path>
                </svg>
              </div>
              <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100"
                >首页</span
              >
            </button>

            <a
              v-else
              class="nav-item group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start"
              href="/"
              :data-active="activePageResolved === 'home' && homeViewResolved === 'home' && !activeSiteKeyResolved"
              @click="rememberHome"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-house h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700"
                >
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                  <path
                    d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                  ></path>
                </svg>
              </div>
              <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100">首页</span>
            </a>

            <a
              class="nav-item group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start"
              href="/"
              v-if="activePageResolved !== 'home' && activePageResolved !== 'play'"
              @click="rememberSearch"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-search h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100"
                >搜索</span
              >
            </a>

            <button
              v-else
              type="button"
              class="nav-item group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start w-full"
              :data-active="activePageResolved === 'home' && homeViewResolved === 'search'"
              @click="selectHomeSearch"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-search h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100">搜索</span>
            </button>

            <button
              v-if="activePageResolved === 'home' || activePageResolved === 'play'"
              type="button"
              class="nav-item group flex items-center rounded-lg px-2 mt-4 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start w-full"
              :data-active="activePageResolved === 'home' && !activeSiteKeyResolved && homeViewResolved === 'douban:movie'"
              @click="selectHomeDouban('movie')"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-film h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                  <path d="M7 3v18"></path>
                  <path d="M3 7.5h4"></path>
                  <path d="M3 12h18"></path>
                  <path d="M3 16.5h4"></path>
                  <path d="M17 3v18"></path>
                  <path d="M17 7.5h4"></path>
                  <path d="M17 16.5h4"></path>
                </svg>
              </div>
              <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100"
                >电影</span
              >
            </button>

            <a
              v-else
              class="nav-item group flex items-center rounded-lg px-2 mt-4 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start"
              href="/"
              @click="rememberDouban('movie')"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-film h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                  <path d="M7 3v18"></path>
                  <path d="M3 7.5h4"></path>
                  <path d="M3 12h18"></path>
                  <path d="M3 16.5h4"></path>
                  <path d="M17 3v18"></path>
                  <path d="M17 7.5h4"></path>
                  <path d="M17 16.5h4"></path>
                </svg>
              </div>
              <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100">电影</span>
            </a>

            <button
              v-if="activePageResolved === 'home' || activePageResolved === 'play'"
              type="button"
              class="nav-item group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start w-full"
              :data-active="activePageResolved === 'home' && !activeSiteKeyResolved && homeViewResolved === 'douban:tv'"
              @click="selectHomeDouban('tv')"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-tv h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700"
                >
                  <rect width="20" height="15" x="2" y="7" rx="2" ry="2"></rect>
                  <polyline points="17 2 12 7 7 2"></polyline>
                </svg>
              </div>
              <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100"
                >剧集</span
              >
            </button>

            <a
              v-else
              class="nav-item group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start"
              href="/"
              @click="rememberDouban('tv')"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-tv h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700"
                >
                  <rect width="20" height="15" x="2" y="7" rx="2" ry="2"></rect>
                  <polyline points="17 2 12 7 7 2"></polyline>
                </svg>
              </div>
              <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100">剧集</span>
            </a>

            <button
              v-if="activePageResolved === 'home' || activePageResolved === 'play'"
              type="button"
              class="nav-item group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start w-full"
              :data-active="activePageResolved === 'home' && !activeSiteKeyResolved && homeViewResolved === 'douban:anime'"
              @click="selectHomeDouban('anime')"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-cat h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700"
                >
                  <path
                    d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"
                  ></path>
                  <path d="M8 14v.5"></path>
                  <path d="M16 14v.5"></path>
                  <path d="M11.25 16.25h1.5L12 17l-.75-.75Z"></path>
                </svg>
              </div>
              <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100"
                >动漫</span
              >
            </button>

            <a
              v-else
              class="nav-item group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start"
              href="/"
              @click="rememberDouban('anime')"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-cat h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700"
                >
                  <path
                    d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"
                  ></path>
                  <path d="M8 14v.5"></path>
                  <path d="M16 14v.5"></path>
                  <path d="M11.25 16.25h1.5L12 17l-.75-.75Z"></path>
                </svg>
              </div>
              <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100">动漫</span>
            </a>

            <button
              v-if="activePageResolved === 'home' || activePageResolved === 'play'"
              type="button"
              class="nav-item group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start w-full"
              :data-active="activePageResolved === 'home' && !activeSiteKeyResolved && homeViewResolved === 'douban:show'"
              @click="selectHomeDouban('show')"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-clover h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700"
                >
                  <path d="M16.17 7.83 2 22"></path>
                  <path
                    d="M4.02 12a2.827 2.827 0 1 1 3.81-4.17A2.827 2.827 0 1 1 12 4.02a2.827 2.827 0 1 1 4.17 3.81A2.827 2.827 0 1 1 19.98 12a2.827 2.827 0 1 1-3.81 4.17A2.827 2.827 0 0 1 12 19.98a2.827 2.827 0 0 1-4.17-3.81A1 1 0 1 1 4 12"
                  ></path>
                  <path d="m7.83 7.83 8.34 8.34"></path>
                </svg>
              </div>
              <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100"
                >综艺</span
              >
            </button>

            <a
              v-else
              class="nav-item group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 font-medium transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start"
              href="/"
              @click="rememberDouban('show')"
            >
              <div class="w-4 h-4 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-clover h-4 w-4 text-gray-500 group-hover:text-green-600 data-[active=true]:text-green-700"
                >
                  <path d="M16.17 7.83 2 22"></path>
                  <path
                    d="M4.02 12a2.827 2.827 0 1 1 3.81-4.17A2.827 2.827 0 1 1 12 4.02a2.827 2.827 0 1 1 4.17 3.81A2.827 2.827 0 1 1 19.98 12a2.827 2.827 0 1 1-3.81 4.17A2.827 2.827 0 0 1 12 19.98a2.827 2.827 0 0 1-4.17-3.81A1 1 0 1 1 4 12"
                  ></path>
                  <path d="m7.83 7.83 8.34 8.34"></path>
                </svg>
              </div>
              <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100">综艺</span>
            </a>

          </div>

          <div v-if="showSiteNav" class="mt-6 flex-1 min-h-0 flex flex-col">
            <div
              class="px-4 mb-2 text-xs font-semibold text-gray-400 tracking-wider select-none flex-shrink-0"
            >
              站点导航
            </div>

            <div class="relative flex-1 min-h-0 flex flex-col">
              <div
                :id="siteNavVariant === 'index' ? 'homeSiteNavList' : undefined"
                class="flex-1 min-h-0 space-y-1 overflow-y-auto"
              >
                <template v-if="siteNavVariant === 'index'">
                  <a
                    v-for="s in homeSites || []"
                    :key="s.key"
                    class="nav-item group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 dark:data-[active=true]:text-green-300 transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start"
                    href="#"
                    @click.prevent="rememberSite(s)"
                    :data-site-key="s.key"
                    :data-site-api="s.api"
                    :data-active="activeSiteKeyResolved && activeSiteKeyResolved === s.key"
                  >
                    <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100">{{
                      s.name || s.key
                    }}</span>
                  </a>
                </template>

                <template v-else>
                  <a
                    v-for="s in homeSites || []"
                    :key="s.key"
                    class="nav-item group flex items-center rounded-lg px-2 py-2 pl-4 text-sm text-gray-700 hover:bg-gray-100/30 hover:text-green-600 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-700 dark:data-[active=true]:text-green-300 transition-colors duration-200 min-h-[40px] mx-0 gap-3 justify-start"
                    href="/"
                    @click="rememberSite(s)"
                    :data-site-key="s.key"
                    :data-site-api="s.api"
                    :data-active="activeSiteKeyResolved && activeSiteKeyResolved === s.key"
                  >
                    <span class="nav-label whitespace-nowrap transition-opacity duration-200 opacity-100">{{
                      s.name || s.key
                    }}</span>
                  </a>
                </template>

                <div
                  v-if="!homeSites || homeSites.length === 0"
                  class="px-4 py-2 text-sm text-gray-400 select-none"
                >
                  无数据
                </div>
              </div>

              <template v-if="showSiteNavOverlays">
                <div
                  id="homeSiteNavOverlayTop"
                  class="hidden absolute top-0 left-0 right-0 h-10"
                >
                  <button
                    id="homeSiteNavScrollUp"
                    type="button"
                    class="w-full h-full flex items-start justify-center pt-2 bg-gradient-to-b from-gray-200/95 via-gray-100/70 to-transparent dark:from-[#0d1624]/95 dark:via-[#0d1624]/70 dark:to-transparent text-gray-700 dark:text-gray-200"
                    aria-label="向上滚动"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </button>
                </div>
                <div
                  id="homeSiteNavOverlayBottom"
                  class="hidden absolute bottom-0 left-0 right-0 h-10"
                >
                  <button
                    id="homeSiteNavScrollDown"
                    type="button"
                    class="w-full h-full flex items-end justify-center pb-2 bg-gradient-to-t from-gray-200/95 via-gray-100/70 to-transparent dark:from-[#0d1624]/95 dark:via-[#0d1624]/70 dark:to-transparent text-gray-700 dark:text-gray-200"
                    aria-label="向下滚动"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
              </template>
            </div>
          </div>
        </nav>
      </div>
    </aside>

    <div id="sidebarOffset" class="sidebar-offset transition-all duration-300 w-64"></div>
  </div>
</template>

<script setup>
	import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
	import { apiGetJson } from './apiClient';

const props = defineProps({
  bootstrap: { type: Object, required: true },
  activePage: { type: String, default: '' },
  doubanType: { type: String, default: '' },
  activeSiteKey: { type: String, default: '' },
  showSiteNav: { type: Boolean, default: true },
  siteNavVariant: { type: String, default: 'links' }, // 'links' | 'index'
  showSiteNavOverlays: { type: Boolean, default: false },
});

const LAST_SITE_KEY = 'tv_server_last_site_key';
const HOME_VIEW_KEY = 'tv_server_home_view';
const LAST_SITE_NAME_KEY = 'tv_server_last_site_name';

const homeViewState = ref('home'); // 'home' | 'search' | 'douban:*'
const activeSiteKeyState = ref('');
const homeSites = ref(
  (() => {
    const role = props.bootstrap && props.bootstrap.user && props.bootstrap.user.role ? String(props.bootstrap.user.role) : '';
    const userBase =
      props.bootstrap && props.bootstrap.settings && typeof props.bootstrap.settings.userCatPawOpenApiBase === 'string'
        ? props.bootstrap.settings.userCatPawOpenApiBase.trim()
        : '';
    if (role === 'user' && !userBase) return [];
    return props.bootstrap && props.bootstrap.settings && Array.isArray(props.bootstrap.settings.homeSites)
      ? props.bootstrap.settings.homeSites
      : [];
  })()
);
const homeSitesLoading = ref(false);

const normalizeHomeSites = (sites) => {
  const list = Array.isArray(sites) ? sites : [];
  return list
    .map((s) => ({
      key: s && typeof s.key === 'string' ? s.key : '',
      name: s && typeof s.name === 'string' ? s.name : '',
      api: s && typeof s.api === 'string' ? s.api : '',
      enabled: s && typeof s.enabled === 'boolean' ? s.enabled : true,
      home: s && typeof s.home === 'boolean' ? s.home : true,
    }))
    .filter((s) => s.key && s.api);
};

	const refreshHomeSites = async () => {
	  if (homeSitesLoading.value) return;
	  homeSitesLoading.value = true;
	  try {
	    const data = await apiGetJson('/api/user/sites', { cacheMs: 2000 });
	    if (!data || data.success !== true) throw new Error((data && data.message) || '加载失败');
	    const merged = normalizeHomeSites(data.sites);
	    homeSites.value = merged.filter((s) => s.enabled && s.home).map(({ key, name, api }) => ({ key, name, api }));
	    try {
      // Let the outer shell (mobile drawer) re-measure width after sites render.
      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('tv:sidebar-sites-updated'));
        });
      }
    } catch (_e) {}
  } catch (_e) {
    // keep previous list
  } finally {
    homeSitesLoading.value = false;
  }
};

const syncFromStorage = () => {
  try {
    const v = (localStorage.getItem(HOME_VIEW_KEY) || '').trim();
    // search/play 不持久化；刷新后仅恢复 home 或 douban:*（兼容旧值：search 视为 home）
    homeViewState.value = v && v.startsWith('douban:') ? v : 'home';
  } catch (_e) {
    homeViewState.value = 'home';
  }
  try {
    const k = (localStorage.getItem(LAST_SITE_KEY) || '').trim();
    activeSiteKeyState.value = k && k !== 'home' ? k : '';
  } catch (_e) {
    activeSiteKeyState.value = '';
  }
};

const onStorage = (e) => {
  const key = e && e.key ? String(e.key) : '';
  if (!key || key === LAST_SITE_KEY || key === HOME_VIEW_KEY) syncFromStorage();
};

const onHomeView = (e) => {
  const view = e && e.detail && typeof e.detail.view === 'string' ? e.detail.view.trim() : '';
  if (!view) return;
  homeViewState.value = view === 'search' ? 'search' : view.startsWith('douban:') ? view : 'home';
  if (view === 'home' || view === 'search' || view.startsWith('douban:')) activeSiteKeyState.value = '';
};

if (typeof window !== 'undefined') {
  syncFromStorage();
}

onMounted(() => {
  if (typeof window === 'undefined') return;
  window.addEventListener('storage', onStorage);
  window.addEventListener('tv:home-view', onHomeView);
  window.addEventListener('tv:user-settings-updated', refreshHomeSites);
  refreshHomeSites();
});

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return;
  window.removeEventListener('storage', onStorage);
  window.removeEventListener('tv:home-view', onHomeView);
  window.removeEventListener('tv:user-settings-updated', refreshHomeSites);
});

const rememberSite = (input) => {
  try {
    const k =
      input && typeof input === 'object'
        ? (typeof input.key === 'string' ? input.key.trim() : '')
        : typeof input === 'string'
          ? input.trim()
          : '';
    if (!k) return;
    const n =
      input && typeof input === 'object'
        ? (typeof input.name === 'string' ? input.name.trim() : '')
        : '';
    localStorage.setItem(LAST_SITE_KEY, k);
    localStorage.setItem(HOME_VIEW_KEY, 'home');
    if (n) localStorage.setItem(LAST_SITE_NAME_KEY, n);
    activeSiteKeyState.value = k;
    homeViewState.value = 'home';
  } catch (_e) {}
};

const rememberHome = () => {
  try {
    localStorage.setItem(LAST_SITE_KEY, 'home');
    localStorage.setItem(HOME_VIEW_KEY, 'home');
    activeSiteKeyState.value = '';
    homeViewState.value = 'home';
  } catch (_e) {}
};

const rememberDouban = (type) => {
  try {
    const t = typeof type === 'string' ? type.trim() : '';
    if (!t) return;
    localStorage.setItem(LAST_SITE_KEY, 'home');
    localStorage.setItem(HOME_VIEW_KEY, `douban:${t}`);
    activeSiteKeyState.value = '';
    homeViewState.value = `douban:${t}`;
  } catch (_e) {}
};

const rememberSearch = () => {
  try {
    activeSiteKeyState.value = '';
    homeViewState.value = 'search';
  } catch (_e) {}
};

const selectHomeDouban = (type) => {
  rememberDouban(type);
  try {
    window.dispatchEvent(new CustomEvent('tv:home-view', { detail: { view: `douban:${type}` } }));
  } catch (_e) {}
};

const selectHome = () => {
  rememberHome();
  try {
    window.dispatchEvent(new CustomEvent('tv:home-view', { detail: { view: 'home' } }));
  } catch (_e) {}
};

const selectHomeSearch = () => {
  rememberSearch();
  try {
    window.dispatchEvent(new CustomEvent('tv:home-view', { detail: { view: 'search' } }));
  } catch (_e) {}
};

const homeViewResolved = homeViewState;

const activePageResolved = computed(() => {
  if (props.activePage) return props.activePage;
  if (typeof window === 'undefined') return '';
  const p = window.location.pathname || '/';
  return 'home';
});

const activeSiteKeyResolved = activeSiteKeyState;
</script>
