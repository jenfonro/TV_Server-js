<template>
  <main
    id="playPage"
    class="content-main flex-1 md:min-h-0 md:mt-0"
    style="padding-top:var(--tv-topbar-h, calc(3rem + env(safe-area-inset-top)));padding-bottom:calc(3.5rem + env(safe-area-inset-bottom))"
  >
          <div class="flex flex-col gap-3 py-4 px-5 lg:px-[3rem] 2xl:px-20">
            <div class="py-1">
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="tv-icon-btn"
                  aria-label="返回"
                  @click="exitPlay"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m15 18-6-6 6-6"></path>
                  </svg>
                </button>
                <div class="flex flex-1 items-center gap-2 min-w-0">
                  <h1 class="min-w-0 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    <span id="playTitle" class="block truncate">{{ videoTitle }}</span>
                  </h1>
                  <button
                    type="button"
                    class="tv-icon-btn flex-shrink-0"
                    :class="isFavorited ? 'text-pink-600 dark:text-pink-400 border-pink-200/60 dark:border-pink-500/30' : ''"
                    :disabled="favoriteLoading || !canFavorite"
                    aria-label="收藏/取消收藏"
                    @click="toggleFavorite"
                  >
                    <svg
                      v-if="isFavorited"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="w-4 h-4"
                      fill="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="tvFavGradTop" x1="2" y1="4" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                          <stop offset="0" stop-color="#fb7185" />
                          <stop offset="0.55" stop-color="#ec4899" />
                          <stop offset="1" stop-color="#a855f7" />
                        </linearGradient>
                      </defs>
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        fill="url(#tvFavGradTop)"
                        d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-1.344-.728 25.18 25.18 0 0 1-3.67-3.295 24.257 24.257 0 0 1-3.168-4.269c-.63-1.001-.839-2.145-.73-3.253.108-1.108.532-2.166 1.235-3.048a4.793 4.793 0 0 1 3.462-1.795c1.567-.08 3.113.582 4.084 1.816.97-1.234 2.517-1.896 4.084-1.816a4.793 4.793 0 0 1 3.462 1.795c.703.882 1.127 1.94 1.235 3.048.109 1.108-.1 2.252-.73 3.253a24.257 24.257 0 0 1-3.168 4.269 25.18 25.18 0 0 1-3.67 3.295 15.247 15.247 0 0 1-1.344.728l-.022.012-.007.003a.752.752 0 0 1-.704 0Z"
                      />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="w-4 h-4 text-slate-400 dark:text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="hidden lg:flex justify-end">
                <button id="episodePanelToggle" class="group relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-200" type="button" title="隐藏选集面板">
                  <svg id="episodePanelToggleIcon" class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-200 rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                  <span id="episodePanelToggleLabel" class="text-xs font-medium text-gray-600 dark:text-gray-300">隐藏</span>
                  <div id="episodePanelToggleDot" class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full transition-all duration-200 bg-green-400"></div>
                </button>
              </div>

	              <div id="playGrid" class="grid gap-4 transition-all duration-300 ease-in-out grid-cols-1 md:grid-cols-4">
	                <div id="playerArea" class="transition-all duration-300 ease-in-out rounded-xl border border-white/0 dark:border-white/30 md:col-span-3">
	                  <div class="play-video-ratio rounded-xl overflow-hidden shadow-lg">
	                    <div class="play-video-ratio__inner">
		                      <DrPlayer
                          ref="drPlayerRef"
		                        v-if="playerUrl"
		                        :url="playerUrl"
		                        :poster="displayPoster"
		                        :headers="playerHeaders"
		                        :title="displayTitle"
		                        :autoplay="true"
		                        @loadedmetadata="onPlayerLoadedMetadata"
                          @error="onPlayerError"
		                      />
	                      <div v-else class="w-full h-full bg-black/10 dark:bg-white/5" aria-hidden="true"></div>
	                      <div
	                        v-if="playerPhase !== 'ready'"
	                        class="play-player-overlay"
	                        :class="{ 'play-player-overlay--error': playerPhase === 'error' }"
	                      >
	                        <div class="play-player-overlay__badge">
	                          <svg class="play-player-overlay__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
	                            <path stroke-linecap="round" stroke-linejoin="round" d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
	                            <path stroke-linecap="round" stroke-linejoin="round" d="M14 3v6h6" />
	                          </svg>
	                          <div class="play-player-overlay__text">{{ playerPhaseText }}</div>
	                          <div v-if="playerPhaseLoading" class="tv-spinner" aria-hidden="true"></div>
	                        </div>
	                      </div>
	                    </div>
	                  </div>
	                </div>

                <div id="episodePanel" class="relative w-full h-[320px] sm:h-[360px] md:h-auto md:overflow-hidden transition-all duration-300 ease-in-out md:col-span-1 lg:opacity-100 lg:scale-100">
                  <div id="episodePanelResizer" class="episode-resizer" aria-hidden="true"></div>
                  <div id="episodeSelector" class="md:ml-2 px-4 py-0 h-full min-h-0 rounded-xl bg-black/10 dark:bg-white/5 flex flex-col border border-white/0 dark:border-white/30 overflow-hidden">
                    <!-- Tab header -->
                    <div class="episode-tab-header flex mb-1 -mx-6 flex-shrink-0">
                      <button
                        id="tabEpisodes"
                        type="button"
                        class="flex-1 py-3 px-6 text-center cursor-pointer transition-all duration-200 font-medium"
                        :class="activeTab === 'episodes' ? 'text-green-600 dark:text-green-400' : 'text-gray-700 hover:text-green-600 bg-black/5 dark:bg-white/5 dark:text-gray-300 dark:hover:text-green-400 hover:bg-black/3 dark:hover:bg-white/3'"
                        @click="activeTab = 'episodes'"
                      >
                        选集
                      </button>
                      <button
                        id="tabSources"
                        type="button"
                        class="flex-1 py-3 px-6 text-center cursor-pointer transition-all duration-200 font-medium"
                        :class="activeTab === 'sources' ? 'text-green-600 dark:text-green-400' : 'text-gray-700 hover:text-green-600 bg-black/5 dark:bg-white/5 dark:text-gray-300 dark:hover:text-green-400 hover:bg-black/3 dark:hover:bg-white/3'"
                        @click="activeTab = 'sources'"
                      >
                        换源
                      </button>
                    </div>

                    <!-- Episodes tab -->
                    <div id="episodesTab" class="flex flex-col flex-1 min-h-0" v-show="activeTab === 'episodes'">
                      <div class="episode-controls-row flex items-center gap-2.5 mb-3 -mx-6 px-6 flex-shrink-0">
                        <div class="flex-1 min-w-0">
                          <div ref="panDropdownEl" class="custom-dropdown play-pan-dropdown">
                            <button
                              type="button"
                              class="custom-dropdown-btn play-pan-btn"
                              :disabled="panOptions.length === 0"
                              @click="panDropdownOpen = !panDropdownOpen"
                            >
                              {{ selectedPanLabel }}
                            </button>
                            <div class="custom-dropdown-list" :class="{ hidden: !panDropdownOpen }">
                              <div
                                v-for="o in panOptions"
                                :key="o.key"
                                class="custom-dropdown-item"
                                :class="{ active: o.key === selectedPanKey }"
                                role="option"
                                @click="selectPan(o.key)"
                              >
                                {{ o.label }}
                              </div>
                              <div v-if="panOptions.length === 0" class="custom-dropdown-item">
                                {{ introLoading ? '加载中...' : '暂无数据' }}
                              </div>
                            </div>
                          </div>
	                        </div>
                        <button
                          id="rawListBtn"
                          type="button"
                          class="episode-control episode-control--btn flex-shrink-0"
                          :data-active="rawListMode ? 'true' : 'false'"
                          @click="toggleRawList"
                        >
                          {{ rawListMode ? '返回选集' : '原始列表' }}
                        </button>
	                      </div>
	                      <div class="flex items-center gap-4 mb-4 border-b border-gray-300 dark:border-gray-700 -mx-6 px-6 flex-shrink-0" v-show="!rawListMode">
	                        <div class="flex-1 min-w-0">
	                          <div v-if="seasonTabs.length" class="episode-season-bar">
	                            <div class="episode-season-tabs">
	                              <button
	                                v-for="s in seasonTabs"
	                                :key="s.key"
	                                type="button"
	                                class="episode-season-btn"
	                                :data-active="Number(s.season) === Number(selectedSeason) ? 'true' : 'false'"
	                                @click="selectSeason(s.season)"
	                              >
	                                {{ s.label }}
	                              </button>
	                            </div>
	                          </div>
	                          <div class="episode-group-bar">
	                            <div ref="episodeGroupTabsEl" class="episode-group-tabs" @scroll.passive="updateHiddenEpisodeGroups">
	                              <button
	                                v-for="g in episodeGroups"
	                                :key="g.key"
                                type="button"
                                class="episode-group-btn"
                                :data-active="g.key === selectedEpisodeGroupKey ? 'true' : 'false'"
                                @click="selectEpisodeGroup(g.key)"
                              >
                                {{ g.label }}
                              </button>
                            </div>

                            <div
                              class="episode-group-more"
                              v-show="hiddenEpisodeGroups.length"
                              ref="episodeGroupMoreEl"
                              @mouseleave="episodeGroupMoreOpen = false"
                            >
                              <div
                                class="episode-group-more__btn"
                                role="button"
                                tabindex="0"
                                @mouseenter="onEpisodeGroupMoreEnter"
                                @click="episodeGroupMoreOpen = !episodeGroupMoreOpen"
                              >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                              </div>
                              <div
                                class="episode-group-more__menu"
                                :class="{ 'episode-group-more__menu--open': episodeGroupMoreOpen }"
                              >
                                <button
                                  v-for="g in episodeGroups"
                                  :key="g.key"
                                  type="button"
                                  class="episode-group-more__item"
                                  :data-active="g.key === selectedEpisodeGroupKey ? 'true' : 'false'"
                                  @click="selectEpisodeGroup(g.key); episodeGroupMoreOpen = false"
                                >
                                  {{ g.label }}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button id="episodeSortBtn" type="button" class="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-gray-700 hover:text-green-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-white/20 transition-colors transform translate-y-[-4px]" aria-label="切换集数排序" @click="episodeDescending = !episodeDescending">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                          </svg>
                        </button>
                      </div>

	                      <div id="rawListView" class="raw-list flex-1 overflow-y-auto content-start pb-4" v-show="rawListMode">
	                        <div v-if="introLoading" class="tv-center-loading">
	                          <div class="tv-spinner" aria-hidden="true"></div>
	                          <div class="tv-center-loading__text">加载中...</div>
	                        </div>
	                        <div v-else-if="introError" class="raw-list__hint raw-list__hint--error">{{ introError }}</div>
	                        <div v-else-if="rawListItems.length === 0" class="raw-list__hint">暂无原始列表</div>
	                        <div v-else class="raw-list__items">
                          <button
                            v-for="it in rawListItems"
                            :key="it.key"
                            type="button"
                            class="raw-list__row"
                            :class="{ 'raw-list__row--active': it.index === selectedEpisodeIndex }"
                            :title="it.text"
                            @click="selectEpisode(it.index)"
                          >
                            <span class="raw-list__text">{{ it.text }}</span>
                          </button>
                        </div>
                      </div>

	                      <div
	                        id="episodeButtons"
	                        class="relative flex flex-wrap gap-3 overflow-y-auto flex-1 content-start pb-4"
	                        v-show="!rawListMode"
	                      >
	                        <div v-if="introLoading" class="tv-episode-overlay" aria-hidden="true">
	                          <div class="tv-episode-overlay__inner">
	                            <div class="tv-spinner" aria-hidden="true"></div>
	                            <div class="tv-center-loading__text">加载中...</div>
	                          </div>
	                        </div>
	                        <div v-else-if="introError" class="tv-episode-overlay">
	                          <div class="tv-episode-overlay__inner">
	                            <div class="tv-center-loading__text text-red-600 dark:text-red-400">{{ introError }}</div>
	                          </div>
	                        </div>
	                        <template v-else>
	                          <template v-if="groupedDisplayedEpisodes.length">
	                            <button
	                              v-for="ep in groupedDisplayedEpisodes"
	                              :key="ep.key"
	                              type="button"
	                              class="episode-num-btn flex items-center justify-center text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap font-mono"
	                              :class="ep.index === selectedEpisodeIndex ? 'bg-green-500 text-white shadow-lg shadow-green-500/25 dark:bg-green-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20'"
	                              :title="ep.name"
	                              @click="selectEpisode(ep.index)"
	                            >
	                              {{ ep.no }}
	                            </button>
	                          </template>
	                          <div v-else class="tv-episode-overlay">
	                            <div class="tv-episode-overlay__inner">
	                              <div class="tv-center-loading__text">暂无选集</div>
	                            </div>
	                          </div>
	                        </template>
	                      </div>
                    </div>

                    <!-- Sources tab -->
                    <div id="sourcesTab" class="flex flex-col flex-1 min-h-0 pt-4" v-show="activeTab === 'sources'">
                      <div class="flex-1 min-h-0 overflow-y-auto space-y-2 pb-6">
                        <div
                          v-for="src in sourcesTabItems"
                          :key="`${src.siteKey}::${src.videoId}`"
                          class="source-card flex items-start gap-3 px-2 py-3 rounded-lg transition-all select-none duration-200 relative"
                          :class="src.active ? 'source-card--active' : 'source-card--idle'"
                          @click="src.active ? null : switchAggregatedSource(src)"
                        >
                          <div class="source-card__cover flex-shrink-0 w-12 h-20 rounded overflow-hidden">
                            <img
                              v-if="src.poster"
                              :src="src.poster"
                              :alt="src.title"
                              loading="lazy"
                              decoding="async"
                              referrerpolicy="no-referrer"
                              class="w-full h-full object-cover"
                            />
                            <div v-else class="w-full h-full bg-gray-300 dark:bg-gray-600"></div>
                          </div>

                          <div class="flex-1 min-w-0 flex flex-col gap-1 h-20">
                            <div class="flex items-start justify-between gap-3 h-6">
                              <div class="flex-1 min-w-0">
                                <h3 class="font-medium text-base truncate text-gray-900 dark:text-gray-100 leading-none">
                                  {{ src.title || '未命名' }}
                                </h3>
                              </div>
                              <div
                                v-if="src.active && siteQuality"
                                class="source-card__quality bg-gray-500/10 dark:bg-gray-400/20 text-green-600 dark:text-green-400 px-1.5 py-0 rounded text-xs flex-shrink-0 min-w-[50px] text-center"
                              >
                                {{ siteQuality }}
                              </div>
                            </div>

                            <div v-if="src.remark" class="h-5 flex items-center">
                              <span
                                class="inline-flex max-w-full items-center truncate bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm"
                                :title="src.remark"
                              >
                                {{ src.remark }}
                              </span>
                            </div>
                            <div v-else class="h-5"></div>

                            <div class="mt-auto flex items-center justify-between">
                              <span class="source-card__site text-xs px-2 py-1 border border-gray-500/60 rounded text-gray-700 dark:text-gray-200 truncate max-w-[70%]">
                                {{ src.siteName || '站点' }}
                              </span>
                              <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {{ src.active ? `${siteEpisodes} 集` : '—' }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          v-if="sourcesLoading || sourcesError || sourcesSearchedOnce || sourcesTabItems.length <= 1"
                          class="source-more-btn flex items-center justify-center gap-2 cursor-default"
                        >
                          <template v-if="sourcesLoading">
                            <div class="tv-spinner" aria-hidden="true"></div>
                            <span>正在加载...</span>
                          </template>
                          <template v-else-if="sourcesError">
                            <span class="text-red-600 dark:text-red-400">{{ sourcesError }}</span>
                          </template>
                          <template v-else>
                            <span>暂无更多</span>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white/80 dark:bg-gray-800/40 rounded-2xl p-4 sm:p-6 border border-gray-200/30 dark:border-gray-700/30 backdrop-blur-sm play-detail">
                <div class="play-detail__inner">
                  <div class="play-detail__poster">
                    <div class="play-detail__posterWrap">
                      <div class="play-detail__posterSkeleton" aria-hidden="true"></div>
                      <img
                        v-if="displayPoster"
                        :src="displayPoster"
                        :alt="displayTitle"
                        loading="lazy"
                        decoding="async"
                        referrerpolicy="no-referrer"
                        class="play-detail__posterImg"
                      />
                      <div v-else class="play-detail__posterFallback">
                        暂无封面
                      </div>
                    </div>
                  </div>

                    <div class="play-detail__info">
                      <div class="play-detail__titleRow">
                      <h1 class="play-detail__title">
                        <span class="block truncate">{{ displayTitle || '未命名' }}</span>
                      </h1>
                      <button
                        type="button"
                        class="play-detail__favBtn"
                        :class="isFavorited ? 'is-active' : ''"
                        :disabled="favoriteLoading || !canFavorite"
                        aria-label="收藏/取消收藏"
                        @click="toggleFavorite"
                      >
                        <svg
                          v-if="isFavorited"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          class="w-4 h-4 text-pink-500 dark:text-pink-400"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-1.344-.728 25.18 25.18 0 0 1-3.67-3.295 24.257 24.257 0 0 1-3.168-4.269c-.63-1.001-.839-2.145-.73-3.253.108-1.108.532-2.166 1.235-3.048a4.793 4.793 0 0 1 3.462-1.795c1.567-.08 3.113.582 4.084 1.816.97-1.234 2.517-1.896 4.084-1.816a4.793 4.793 0 0 1 3.462 1.795c.703.882 1.127 1.94 1.235 3.048.109 1.108-.1 2.252-.73 3.253a24.257 24.257 0 0 1-3.168 4.269 25.18 25.18 0 0 1-3.67 3.295 15.247 15.247 0 0 1-1.344.728l-.022.012-.007.003a.752.752 0 0 1-.704 0Z"
                          />
                        </svg>
                        <svg
                          v-else
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          class="w-4 h-4 text-slate-400 dark:text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.6"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true"
                        >
                          <path
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                          />
                        </svg>
                      </button>
                    </div>

                    <div v-if="metaPills.length" class="play-detail__meta">
                      <span v-for="p in metaPills" :key="p" class="play-pill">{{ p }}</span>
                    </div>

                    <div class="play-detail__desc" style="white-space: pre-line;">
	                      <template v-if="introLoading">简介加载中...</template>
	                      <template v-else-if="!introText && introError">{{ introError }}</template>
	                      <template v-else>{{ introText || '暂无简介' }}</template>
	                    </div>
	                  </div>
	                </div>
              </div>
            </div>
          </div>
        </main>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { initPlayPage } from './playClient.js';
import DrPlayer from '../../shared/DrPlayer.vue';
import { normalizeCatPawOpenApiBase, requestCatSpider } from '../../shared/catpawopen';
import { apiGetJson, apiPostJson, buildQuery } from '../../shared/apiClient';

const props = defineProps({
  bootstrap: { type: Object, required: true },
  videoTitle: { type: String, default: '' },
  videoYear: { type: String, default: '' },
  searchType: { type: String, default: '' },
  siteKey: { type: String, default: '' },
  spiderApi: { type: String, default: '' },
  videoId: { type: String, default: '' },
  videoIntro: { type: String, default: '' },
  videoPoster: { type: String, default: '' },
  videoRemark: { type: String, default: '' },
});

const drPlayerRef = ref(null);

const AGG_STORAGE_KEY = 'tv:search:aggregate:sources:v1';
const aggregatedSources = ref([]);
const aggregatedFromStorage = ref(false);

const normalizeForAggKey = (s) =>
  String(s || '')
    .toLowerCase()
    // Keep only letters/numbers/CJK to avoid source-specific punctuation/emoji breaking identity checks.
    .replace(/[^0-9a-z\u4e00-\u9fa5]+/gi, '')
    .trim();

const loadAggregatedSourcesFromStorage = () => {
  const titleKey = normalizeForAggKey(displayTitle.value || props.videoTitle || '');
  if (!titleKey) {
    aggregatedSources.value = [];
    aggregatedFromStorage.value = false;
    return;
  }
  try {
    const raw = sessionStorage.getItem(AGG_STORAGE_KEY);
    const parsed = raw && raw.trim() ? JSON.parse(raw) : null;
    const parsedKey = parsed && typeof parsed.key === 'string' ? parsed.key.trim() : '';
    if (!parsedKey || parsedKey !== titleKey) {
      aggregatedSources.value = [];
      aggregatedFromStorage.value = false;
      return;
    }
    const sources = parsed && Array.isArray(parsed.sources) ? parsed.sources : [];
    const uniq = new Set();
    aggregatedSources.value = sources
      .map((s) => ({
        siteKey: s && s.siteKey ? String(s.siteKey) : '',
        spiderApi: s && s.spiderApi ? String(s.spiderApi) : '',
        siteName: s && s.siteName ? String(s.siteName) : '',
        videoId: s && s.videoId ? String(s.videoId) : '',
        videoTitle: s && s.videoTitle ? String(s.videoTitle) : '',
        videoPoster: s && s.videoPoster ? String(s.videoPoster) : '',
        videoRemark: s && s.videoRemark ? String(s.videoRemark) : '',
      }))
      .filter((s) => {
        if (!s.siteKey || !s.spiderApi || !s.videoId) return false;
        const k = `${s.siteKey}::${s.videoId}`;
        if (uniq.has(k)) return false;
        uniq.add(k);
        return true;
      });
    aggregatedFromStorage.value = aggregatedSources.value.length > 0;
  } catch (_e) {
    aggregatedSources.value = [];
    aggregatedFromStorage.value = false;
  }
};

const sourcesLoading = ref(false);
const sourcesError = ref('');
const sourcesSearchedOnce = ref(false);
const sourcesSearchState = { seq: 0 };

const invalidateSourcesSearch = () => {
  sourcesSearchState.seq += 1;
  sourcesLoading.value = false;
};

const fetchUserSitesCached = async (ttlMs = 15 * 1000) => {
  const data = await apiGetJson('/api/user/sites', { cacheMs: ttlMs });
  return data && typeof data === 'object' ? data : {};
};

const resolveCatApiBaseForPlay = () => {
  const role = props.bootstrap && props.bootstrap.user && props.bootstrap.user.role ? String(props.bootstrap.user.role) : '';
  const userBase = props.bootstrap?.settings?.userCatPawOpenApiBase || '';
  const serverBase = props.bootstrap?.settings?.catPawOpenApiBase || '';
  return (role === 'user' ? userBase : (userBase || serverBase)).trim();
};

const isConfigCenterSite = (s) => {
  const api = s && typeof s.api === 'string' ? s.api : '';
  const key = s && typeof s.key === 'string' ? s.key : '';
  return api.includes('/spider/baseset/') || key.toLowerCase().includes('baseset');
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
    .filter((it) => it && it.name);
};

const fetchAggregatedSourcesExactMatches = async () => {
  if (sourcesLoading.value) return;
  const qRaw = (displayTitle.value || props.videoTitle || '').trim();
  const qKey = normalizeForAggKey(qRaw);
  if (!qRaw || !qKey) return;

  sourcesSearchState.seq += 1;
  const seqAtCall = sourcesSearchState.seq;

  sourcesLoading.value = true;
  sourcesError.value = '';
  sourcesSearchedOnce.value = false;
  aggregatedSources.value = [];
  const yieldToUi = () =>
    new Promise((resolve) => {
      try {
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(() => resolve());
          return;
        }
      } catch (_e) {}
      setTimeout(resolve, 0);
    });
  try {
    const data = await fetchUserSitesCached();
    if (seqAtCall !== sourcesSearchState.seq) return;
    const sites = Array.isArray(data && data.sites) ? data.sites : [];
    const enabledSites = sites.filter((s) => s && s.enabled !== false && s.api && !isConfigCenterSite(s));

    const apiBase = resolveCatApiBaseForPlay();
    const tvUser = props.bootstrap?.user?.username || '';
    if (!apiBase) throw new Error('CatPawOpen 接口地址未设置');

    const concurrencyRaw = props.bootstrap?.settings?.searchThreadCount;
    const concurrencyNum = Number(concurrencyRaw);
    const concurrency =
      Number.isFinite(concurrencyNum) && concurrencyNum > 0 ? Math.min(50, Math.floor(concurrencyNum)) : 5;

    const queue = enabledSites.slice();
    const out = [];
    const outUniq = new Set();
    const runOne = async () => {
      while (queue.length) {
        if (seqAtCall !== sourcesSearchState.seq) return;
        const site = queue.shift();
        if (!site) continue;
        try {
          const raw = await requestCatSpider({
            apiBase,
            username: tvUser,
            action: 'search',
            spiderApi: site.api,
            payload: { wd: qRaw, page: 1 },
          });
          if (seqAtCall !== sourcesSearchState.seq) return;
          const items = normalizeSearchList(raw);
          let pushed = false;
          items.forEach((it) => {
            if (seqAtCall !== sourcesSearchState.seq) return;
            const key = normalizeForAggKey(it.name);
            if (!key || key !== qKey) return;
            const siteKey = site && site.key ? String(site.key) : '';
            const spiderApi = site && site.api ? String(site.api) : '';
            const videoId = it && it.id ? String(it.id) : '';
            if (!siteKey || !spiderApi || !videoId) return;
            const uniq = `${siteKey}::${videoId}`;
            if (outUniq.has(uniq)) return;
            outUniq.add(uniq);
            const entry = {
              siteKey,
              spiderApi,
              siteName: site && site.name ? String(site.name) : siteKey,
              videoId,
              videoTitle: it && it.name ? String(it.name) : '',
              videoPoster: it && it.pic ? String(it.pic) : '',
              videoRemark: it && it.remark ? String(it.remark) : '',
            };
            out.push(entry);
            aggregatedSources.value.push(entry);
            pushed = true;
          });
          if (pushed && seqAtCall === sourcesSearchState.seq) await yieldToUi();
        } catch (_e) {
          // ignore per-site failures; continue
        }
      }
    };

    await Promise.allSettled(new Array(Math.max(1, concurrency)).fill(null).map(runOne));
    if (seqAtCall !== sourcesSearchState.seq) return;
    sourcesSearchedOnce.value = true;

    try {
      sessionStorage.setItem(
        AGG_STORAGE_KEY,
        JSON.stringify({
          q: qRaw,
          key: qKey,
          createdAt: Date.now(),
          sources: out,
        })
      );
    } catch (_e) {}
  } catch (e) {
    if (seqAtCall === sourcesSearchState.seq) {
      sourcesError.value = e && e.message ? String(e.message) : '换源搜索失败';
    }
  } finally {
    if (seqAtCall === sourcesSearchState.seq) sourcesLoading.value = false;
  }
};

const exitPlay = () => {
  try {
    // Stop playback immediately (avoid continuing audio in background).
    if (drPlayerRef.value && typeof drPlayerRef.value.destroy === 'function') {
      drPlayerRef.value.destroy();
    }
    playerUrl.value = '';
    playerHeaders.value = {};
    playerMetaReady.value = false;
    window.dispatchEvent(new CustomEvent('tv:exit-play'));
  } catch (_e) {}
};

const resetForNewVideo = () => {
  try {
    if (drPlayerRef.value && typeof drPlayerRef.value.destroy === 'function') {
      drPlayerRef.value.destroy();
    }
  } catch (_e) {}
  playerUrl.value = '';
  playerHeaders.value = {};
  playerMetaReady.value = false;
  playLoading.value = false;
  playError.value = '';
  playerRuntimeError.value = '';
  playingPanKey.value = '';
  playingEpisodeIndex.value = -1;
  selectedPan.value = '';
  panDropdownOpen.value = false;
  selectedEpisodeIndex.value = 0;
  selectedEpisodeGroup.value = '';
  selectedSeason.value = 0;
  episodeGroupMoreOpen.value = false;
  historyCoverPoster.value = '';
  historyCoverLocked.value = false;
  lastHistoryPayload.value = null;
  introError.value = '';
  introLoading.value = false;
  introText.value = (props.videoIntro || '').trim();
  detail.value = {
    title: '',
    poster: '',
    year: '',
    type: '',
    remark: '',
    content: '',
    playFrom: '',
    playUrl: '',
  };
};

const resetForNewSource = () => {
  try {
    if (drPlayerRef.value && typeof drPlayerRef.value.destroy === 'function') {
      drPlayerRef.value.destroy();
    }
  } catch (_e) {}
  playerUrl.value = '';
  playerHeaders.value = {};
  playerMetaReady.value = false;
  playLoading.value = false;
  playError.value = '';
  playerRuntimeError.value = '';
  playingPanKey.value = '';
  playingEpisodeIndex.value = -1;
  selectedPan.value = '';
  panDropdownOpen.value = false;
  selectedEpisodeGroup.value = '';
  selectedSeason.value = 0;
  episodeGroupMoreOpen.value = false;
  introLoading.value = false;
  introError.value = '';
  // Keep intro/meta, but refresh episode list from the new source.
  detail.value = {
    ...detail.value,
    playFrom: '',
    playUrl: '',
  };
};

const cleanupFns = [];

const isIos = ref(false);
onMounted(() => {
  try {
    const ua = typeof navigator !== 'undefined' && navigator.userAgent ? String(navigator.userAgent) : '';
    const touch =
      (typeof navigator !== 'undefined' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0) ||
      (typeof window !== 'undefined' && 'ontouchstart' in window);
    const ios = /iPad|iPhone|iPod/i.test(ua) || (!!touch && /Macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1);
    isIos.value = !!ios;
  } catch (_e) {
    isIos.value = false;
  }
});

const introLoading = ref(false);
const introError = ref('');
const introText = ref((props.videoIntro || '').trim());
const rawListMode = ref(false);
const autoRawListMode = ref(false);
const activeTab = ref('episodes');
const episodeDescending = ref(false);
const selectedEpisodeIndex = ref(0);
const playLoading = ref(false);
const playError = ref('');
const playerRuntimeError = ref('');
const favoriteLoading = ref(false);
const isFavorited = ref(false);
const playerUrl = ref('');
const playerHeaders = ref({});
const playerMetaReady = ref(false);
const playingPanKey = ref('');
const playingEpisodeIndex = ref(-1);
const initialAutoPlayTriggered = ref(false);
const selectedPan = ref('');
const panDropdownOpen = ref(false);
const panDropdownEl = ref(null);
const resumeHistory = ref(null);
const resumeHistoryLoaded = ref(false);
const resumeHistoryApplied = ref(false);
const resumeHistoryState = { seq: 0, key: '', inFlight: null };
const detail = ref({
  title: '',
  poster: '',
  year: '',
  type: '',
  remark: '',
  content: '',
  playFrom: '',
  playUrl: '',
});

const resolvedSpiderApi = computed(() => {
  const direct = (props.spiderApi || '').trim();
  if (direct) return direct;
  const key = (props.siteKey || '').trim();
  if (!key) return '';
  const sites = props.bootstrap && props.bootstrap.settings && Array.isArray(props.bootstrap.settings.homeSites)
    ? props.bootstrap.settings.homeSites
    : [];
  const found = sites.find((s) => s && s.key === key);
  return found && found.api ? String(found.api) : '';
});

const resolvedSiteName = computed(() => {
  const key = (props.siteKey || '').trim();
  if (!key) return '';
  const sites =
    props.bootstrap && props.bootstrap.settings && Array.isArray(props.bootstrap.settings.homeSites)
      ? props.bootstrap.settings.homeSites
      : [];
  const found = sites.find((s) => s && s.key === key);
  const name = found && found.name ? String(found.name) : '';
  return name.trim();
});

const sourcesTabItems = computed(() => {
  const currentSiteKey = (props.siteKey || '').trim();
  const currentVideoId = (props.videoId || '').trim();
  const homeSites =
    props.bootstrap && props.bootstrap.settings && Array.isArray(props.bootstrap.settings.homeSites)
      ? props.bootstrap.settings.homeSites
      : [];
  const homeOrder = homeSites
    .map((s) => (s && typeof s.key === 'string' ? s.key.trim() : ''))
    .filter((k) => k);
  const fallbackOrder =
    props.bootstrap && props.bootstrap.settings && Array.isArray(props.bootstrap.settings.searchSiteOrder)
      ? props.bootstrap.settings.searchSiteOrder
      : [];
  const order = homeOrder.length ? homeOrder : fallbackOrder;
  const orderMap = new Map();
  order.forEach((k, idx) => {
    const kk = typeof k === 'string' ? k.trim() : '';
    if (kk && !orderMap.has(kk)) orderMap.set(kk, idx);
  });

  const others = (aggregatedSources.value || [])
    .filter((s) => !(s.siteKey === currentSiteKey && s.videoId === currentVideoId))
    .slice()
    .sort((a, b) => {
      const ao = orderMap.has(a.siteKey) ? orderMap.get(a.siteKey) : 999999;
      const bo = orderMap.has(b.siteKey) ? orderMap.get(b.siteKey) : 999999;
      if (ao !== bo) return ao - bo;
      return (a.siteName || a.siteKey).localeCompare(b.siteName || b.siteKey, 'zh');
    });

  const list = [
    {
      active: true,
      siteKey: currentSiteKey,
      spiderApi: resolvedSpiderApi.value,
      siteName: resolvedSiteName.value || '站点',
      videoId: currentVideoId,
      title: displayTitle.value || '未命名',
      poster: displayPoster.value,
      remark: (detail.value.remark || props.videoRemark || '').trim(),
    },
    ...others.map((s) => ({
      active: false,
      siteKey: s.siteKey,
      spiderApi: s.spiderApi,
      siteName: s.siteName || s.siteKey,
      videoId: s.videoId,
      title: s.videoTitle || '未命名',
      poster: s.videoPoster || '',
      remark: (s.videoRemark || '').trim(),
    })),
  ];
  return list.filter((x) => x && x.siteKey && x.spiderApi && x.videoId);
});

const switchAggregatedSource = (src) => {
  if (!src || src.active) return;
  try {
    window.dispatchEvent(
      new CustomEvent('tv:open-play', {
        detail: {
          siteKey: src.siteKey || '',
          spiderApi: src.spiderApi || '',
          videoId: src.videoId || '',
          videoTitle: src.title || '',
          videoPoster: src.poster || '',
          videoRemark: src.remark || '',
        },
      })
    );
  } catch (_e) {}
};

const displayTitle = computed(() => {
  return (detail.value.title || props.videoTitle || '').trim();
});

const displayPoster = computed(() => {
  return (detail.value.poster || props.videoPoster || '').trim();
});

const historyCoverPoster = ref('');
const historyCoverLocked = ref(false);
const lastHistoryPayload = ref(null);

watch(
  () => displayPoster.value,
  (p) => {
    if (historyCoverPoster.value) return;
    const next = typeof p === 'string' ? p.trim() : '';
    if (next) historyCoverPoster.value = next;
  },
  { immediate: true }
);

const pickHistoryPoster = () => {
  const currentSiteKey = (props.siteKey || '').trim();
  const preferred = props.bootstrap?.settings?.searchCoverSite ? String(props.bootstrap.settings.searchCoverSite).trim() : '';
  const order =
    props.bootstrap && props.bootstrap.settings && Array.isArray(props.bootstrap.settings.searchSiteOrder)
      ? props.bootstrap.settings.searchSiteOrder
      : [];
  const orderMap = new Map();
  order.forEach((k, idx) => {
    const kk = typeof k === 'string' ? k.trim() : '';
    if (kk && !orderMap.has(kk)) orderMap.set(kk, idx);
  });

  const list = [];
  if (currentSiteKey && displayPoster.value) {
    list.push({ siteKey: currentSiteKey, poster: displayPoster.value });
  }
  (aggregatedSources.value || []).forEach((s) => {
    if (!s || !s.siteKey || !s.videoPoster) return;
    list.push({ siteKey: s.siteKey, poster: s.videoPoster });
  });

  const pickFrom = (siteKey) => {
    const found = list.find((x) => x && x.siteKey === siteKey && x.poster);
    return found ? found.poster : '';
  };

  if (preferred) {
    const p = pickFrom(preferred);
    if (p) return p;
  }
  const ordered = list
    .slice()
    .sort((a, b) => {
      const ao = orderMap.has(a.siteKey) ? orderMap.get(a.siteKey) : 999999;
      const bo = orderMap.has(b.siteKey) ? orderMap.get(b.siteKey) : 999999;
      return ao - bo;
    });
  const first = ordered.find((x) => x && x.poster);
  return first ? first.poster : displayPoster.value || '';
};

const persistHistoryPosterIfPossible = async () => {
  const base = lastHistoryPayload.value && typeof lastHistoryPayload.value === 'object' ? lastHistoryPayload.value : null;
  if (!base) return;
  try {
    await apiPostJson(
      '/api/playhistory',
      {
        ...base,
        videoPoster: historyCoverPoster.value || base.videoPoster || '',
        forcePosterUpdate: true,
      },
      { dedupe: false }
    );
    window.dispatchEvent(new CustomEvent('tv:play-history-updated'));
  } catch (_e) {
    // ignore
  }
};

const tryLockHistoryPoster = async (opts = {}) => {
  const { force = false, allowFallback = false } = opts || {};
  if (historyCoverLocked.value) return;

  const preferred = props.bootstrap?.settings?.searchCoverSite ? String(props.bootstrap.settings.searchCoverSite).trim() : '';
  if (!force && preferred) {
    const hit = (aggregatedSources.value || []).find((s) => s && s.siteKey === preferred && s.videoPoster);
    if (!hit) return;
  }

  const picked = pickHistoryPoster();
  const next = typeof picked === 'string' ? picked.trim() : '';
  if (!next) {
    if (!allowFallback) return;
    const fallback = displayPoster.value || '';
    if (!fallback) return;
    historyCoverPoster.value = fallback;
    historyCoverLocked.value = true;
    return;
  }

  historyCoverPoster.value = next;
  historyCoverLocked.value = true;
  await persistHistoryPosterIfPossible();
};

const canFavorite = computed(() => {
  const siteKey = (props.siteKey || '').trim();
  const spiderApi = (resolvedSpiderApi.value || '').trim();
  const videoId = (props.videoId || '').trim();
  const title = displayTitle.value || '';
  return !!(siteKey && spiderApi && videoId && title);
});

const favoriteStatusState = { key: '', inFlight: null, seq: 0 };

const loadFavoriteStatus = async () => {
  const siteKey = (props.siteKey || '').trim();
  const videoId = (props.videoId || '').trim();
  if (!siteKey || !videoId) {
    isFavorited.value = false;
    return;
  }
  const k = `${siteKey}::${videoId}`;
  if (favoriteStatusState.inFlight && favoriteStatusState.key === k) {
    await favoriteStatusState.inFlight;
    return;
  }
  let seqAtCall = 0;
  try {
    favoriteStatusState.seq += 1;
    seqAtCall = favoriteStatusState.seq;
    favoriteStatusState.key = k;
    favoriteStatusState.inFlight = (async () => {
      const data = await apiGetJson(`/api/favorites/status${buildQuery({ siteKey, videoId })}`, { cacheMs: 2000 });
      if (seqAtCall === favoriteStatusState.seq) {
        isFavorited.value = !!(data && data.favorited);
      }
    })();
    await favoriteStatusState.inFlight;
  } catch (_e) {
    isFavorited.value = false;
  } finally {
    if (seqAtCall && favoriteStatusState.key === k && favoriteStatusState.seq === seqAtCall) {
      favoriteStatusState.inFlight = null;
    }
  }
};

const toggleFavorite = async () => {
  if (favoriteLoading.value) return;
  if (!canFavorite.value) return;
  favoriteLoading.value = true;
  try {
    const siteKey = (props.siteKey || '').trim();
    const spiderApi = (resolvedSpiderApi.value || '').trim();
    const videoId = (props.videoId || '').trim();
    const videoTitle = displayTitle.value || '';
    const data = await apiPostJson(
      '/api/favorites/toggle',
      {
        siteKey,
        siteName: resolvedSiteName.value || '',
        spiderApi,
        videoId,
        videoTitle,
        videoPoster: displayPoster.value || '',
        videoRemark: (props.videoRemark || '').trim(),
      },
      { dedupe: false }
    );
    if (!data || data.success !== true) throw new Error((data && data.message) || '保存失败');
    isFavorited.value = !!data.favorited;
    window.dispatchEvent(new CustomEvent('tv:favorites-updated'));
  } catch (_e) {
    // ignore
  } finally {
    favoriteLoading.value = false;
  }
};

const displayYear = computed(() => {
  return (detail.value.year || props.videoYear || '').trim();
});

const splitTags = (v) => {
  const raw = typeof v === 'string' ? v.trim() : '';
  if (!raw) return [];
  return raw
    .split(/[,\s/|]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
};

const metaPills = computed(() => {
  const pills = [];
  const typeLabel = (detail.value.type || '').trim();
  if (typeLabel) pills.push(...splitTags(typeLabel));
  if (searchTypeLabel.value) pills.push(searchTypeLabel.value);
  const y = displayYear.value;
  if (y) pills.push(y);
  const siteName = resolvedSiteName.value;
  if (siteName) pills.push(siteName);
  const remark = (detail.value.remark || props.videoRemark || '').trim();
  if (remark) pills.push(remark);
  const uniq = [];
  const seen = new Set();
  pills.forEach((p) => {
    const key = p.toLowerCase();
    if (!p || seen.has(key)) return;
    seen.add(key);
    uniq.push(p);
  });
  return uniq;
});

const parsePlaySources = (fromRaw, urlRaw) => {
  const fromStr = typeof fromRaw === 'string' ? fromRaw.trim() : '';
  const urlStr = typeof urlRaw === 'string' ? urlRaw.trim() : '';
  if (!fromStr && !urlStr) return [];

  const splitTop = (s) => (s ? s.split('$$$') : []);
  const fromParts = splitTop(fromStr);
  const urlParts = splitTop(urlStr);
  const len = Math.max(fromParts.length, urlParts.length);
  const rawItems = [];
  for (let i = 0; i < len; i += 1) {
    const baseLabel = (fromParts[i] || '').trim() || `源${i + 1}`;
    const baseUrl = (urlParts[i] || '').trim();
    if (!baseUrl && !baseLabel) continue;

    // Only split by `|||` when the label side explicitly includes it.
    // Some scripts emit `|||` only on the URL side, which would otherwise create fake sub-sources like `xxx-2`.
    const fromSubs = baseLabel.includes('|||') ? baseLabel.split('|||').map((x) => x.trim()) : [baseLabel];
    const urlSubs = baseLabel.includes('|||') && baseUrl.includes('|||') ? baseUrl.split('|||').map((x) => x.trim()) : [baseUrl];
    const subLen = Math.max(fromSubs.length, urlSubs.length);

    for (let j = 0; j < subLen; j += 1) {
      const label = (fromSubs[j] || '').trim() || (subLen > 1 ? `${baseLabel}-${j + 1}` : baseLabel);
      const u = (urlSubs[j] || '').trim();
      if (!u) continue;

      const parseEpisodeSeg = (seg, flag) => {
        const s = String(seg || '').trim();
        if (!s) return null;
        const idx = s.indexOf('$');
        if (idx <= 0) {
          // Some sources return bare ids (no `$`), which are still valid play ids.
          return { name: s, url: s, flag };
        }
        const name = s.slice(0, idx).trim();
        const url = s.slice(idx + 1).trim();
        return { name: name || s, url: url || s, flag };
      };

      const segs = u
        .split('#')
        .map((seg) => String(seg || '').trim())
        .filter(Boolean);

      // Some scripts encode per-episode "flag" in vod_play_from like:
      //   百度原画-xxxx#01$$$百度原画-xxxx#02 ...
      // In that case, each `$$$` entry holds exactly one episode, and the flag must come from that entry.
      const flagForThisItem = String(label || '').trim();
      const episodes = segs.map((seg) => parseEpisodeSeg(seg, flagForThisItem)).filter(Boolean);
      rawItems.push({ label: flagForThisItem, episodes });
    }
  }

  const normalizeLabelForGrouping = (label) => {
    const s = typeof label === 'string' ? label.trim() : '';
    if (!s) return '';
    return s.replace(/#\d{1,3}\s*$/i, '').trim();
  };

  // Group by normalized label to avoid exploding pan options (e.g. `xxx#01`, `xxx#02`).
  const groups = new Map();
  rawItems.forEach((it) => {
    const rawLabel = (it && it.label ? String(it.label) : '').trim();
    const label = normalizeLabelForGrouping(rawLabel) || rawLabel || '未知源';
    const key = label.toLowerCase();
    const existing = groups.get(key);
    const nextEps = it && Array.isArray(it.episodes) ? it.episodes : [];
    if (!existing) {
      groups.set(key, { label, episodes: nextEps.slice() });
      return;
    }
    // Keep episode order; de-dupe by (flag,url) to avoid exact duplicates.
    const seen = new Set(existing.episodes.map((e) => `${(e && e.flag) || ''}::${(e && e.url) || ''}`));
    nextEps.forEach((e) => {
      const k = `${(e && e.flag) || ''}::${(e && e.url) || ''}`;
      if (!e || !e.url || seen.has(k)) return;
      seen.add(k);
      existing.episodes.push(e);
    });
  });

  const out = [];
  Array.from(groups.values()).forEach((g, idx) => {
    const episodes = Array.isArray(g.episodes) ? g.episodes.filter((e) => e && e.url) : [];
    if (!episodes.length) return;
    out.push({ key: `p${idx}`, label: g.label, episodes });
  });
  return out;
};

const panOptions = computed(() => parsePlaySources(detail.value.playFrom, detail.value.playUrl));
const selectedPanKey = computed(() => {
  return selectedPan.value || panOptions.value[0]?.key || '';
});

const selectedPanLabel = computed(() => {
  if (introLoading.value) return '加载中...';
  const list = panOptions.value;
  if (!list.length) return '暂无数据';
  const found = list.find((o) => o && o.key === selectedPanKey.value);
  return (found && found.label ? String(found.label) : list[0].label) || '暂无数据';
});

const preferBaiduPanKey = computed(() => {
  const list = panOptions.value;
  if (!list.length) return '';
  const idx = list.findIndex((o) => o && typeof o.label === 'string' && o.label.includes('百度'));
  return idx >= 0 ? list[idx].key : '';
});

watch(
  () => `${isIos.value ? '1' : '0'}|${panOptions.value.length}|${selectedPan.value}`,
  () => {
    if (!isIos.value) return;
    if (selectedPan.value) return;
    const k = preferBaiduPanKey.value;
    if (k) selectedPan.value = k;
  },
  { immediate: true }
);

const toggleRawList = (e) => {
  rawListMode.value = !rawListMode.value;
  autoRawListMode.value = false;
  try {
    if (e && e.currentTarget && typeof e.currentTarget.blur === 'function') e.currentTarget.blur();
  } catch (_e) {}
};

const selectPan = (key) => {
  const k = typeof key === 'string' ? key : '';
  if (!k) return;
  selectedPan.value = k;
  panDropdownOpen.value = false;
  selectedEpisodeGroup.value = '';
  rawListMode.value = false;
  autoRawListMode.value = false;

  if (playingPanKey.value && playingPanKey.value === k && playingEpisodeIndex.value >= 0) {
    const src = panOptions.value.find((o) => o && o.key === k) || null;
    const total = src && Array.isArray(src.episodes) ? src.episodes.length : 0;
    if (total && playingEpisodeIndex.value < total) {
      selectedEpisodeIndex.value = playingEpisodeIndex.value;
      return;
    }
  }
  selectedEpisodeIndex.value = -1;
};

const selectedPanSource = computed(() => {
  const list = panOptions.value;
  if (!list.length) return null;
  const k = selectedPanKey.value;
  return list.find((o) => o && o.key === k) || list[0] || null;
});

const selectedEpisodes = computed(() => {
  const src = selectedPanSource.value;
  return src && Array.isArray(src.episodes) ? src.episodes : [];
});

const extractRawNamesFromEpisodeUrl = (episodeUrl) => {
  const raw = typeof episodeUrl === 'string' ? episodeUrl : '';
  if (!raw) return [];
  if (!raw.includes('***')) return [];
  const last = raw.split('***').pop();
  return String(last || '')
    .split('#')
    .map((s) => String(s || '').trim())
    .filter(Boolean);
};

const magicEpisodeRules = computed(() => {
  const list = props.bootstrap && props.bootstrap.settings && Array.isArray(props.bootstrap.settings.magicEpisodeRules)
    ? props.bootstrap.settings.magicEpisodeRules
    : [];
  return list
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean);
});

const magicEpisodeCleanRegexRules = computed(() => {
  const listRaw = props.bootstrap?.settings?.magicEpisodeCleanRegexRules;
  if (Array.isArray(listRaw)) {
    return listRaw.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean);
  }
  const legacy = props.bootstrap?.settings?.magicEpisodeCleanRegex != null ? String(props.bootstrap.settings.magicEpisodeCleanRegex).trim() : '';
  return legacy ? [legacy] : [];
});

// Users often paste patterns that contain doubled backslashes like `\\d` (from JSON/JS literals).
// Normalize common escapes: treat `\\d` as `\d`, `\\[` as `\[`, etc.
const normalizeRegexText = (text) => {
  const raw = typeof text === 'string' ? text : '';
  if (!raw) return '';
  return raw.replace(/\\\\(?=[dDsSwWbB.()[\]{}+*?^$|\\\-_/])/g, '\\');
};

const compiledMagicEpisodeCleanRegexRules = computed(() => {
  const list = Array.isArray(magicEpisodeCleanRegexRules.value) ? magicEpisodeCleanRegexRules.value : [];
  if (!list.length) return [];

  const compile = (pattern, flags) => {
    const p = typeof pattern === 'string' ? pattern : '';
    if (!p) return null;
    const f = typeof flags === 'string' ? flags : '';
    const withGlobal = f.includes('g') ? f : `${f}g`;
    try {
      return new RegExp(normalizeRegexText(p), withGlobal || 'g');
    } catch (_e) {
      return null;
    }
  };

  return list
    .map((raw) => {
      const s = typeof raw === 'string' ? raw.trim() : '';
      if (!s) return null;
      const asLiteral = s.startsWith('/') && s.lastIndexOf('/') > 0;
      if (asLiteral) {
        const last = s.lastIndexOf('/');
        const pattern = s.slice(1, last);
        const flags = s.slice(last + 1) || 'i';
        return compile(pattern, flags);
      }
      return compile(s, 'i');
    })
    .filter(Boolean);
});

const compileMagicRule = (ruleText) => {
  const raw = typeof ruleText === 'string' ? ruleText.trim() : '';
  if (!raw) return null;

  const compileRegex = (pattern, flags) => {
    const p = typeof pattern === 'string' ? pattern : '';
    if (!p) return null;
    const f = typeof flags === 'string' && flags ? flags : 'i';
    try {
      return new RegExp(p, f);
    } catch (_e) {
      return null;
    }
  };

  // Allow JSON rule strings like:
  //   {"pattern":"...","replace":"...","flags":"i"}
  // `replace` can use `\\1` (python-style) and will be normalized to `$1` for JS.
  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object' && typeof obj.pattern === 'string') {
        const re = compileRegex(obj.pattern, obj.flags);
        if (!re) return null;
        const replaceRaw = typeof obj.replace === 'string' ? obj.replace : '';
        const replace = replaceRaw ? replaceRaw.replace(/\\(\d+)/g, '$$$1') : '';
        return { re, replace };
      }
    } catch (_e) {
      // fall through
    }
  }

  const asLiteral = raw.startsWith('/') && raw.lastIndexOf('/') > 0;
  if (asLiteral) {
    const last = raw.lastIndexOf('/');
    const pattern = raw.slice(1, last);
    const flags = raw.slice(last + 1);
    const re = compileRegex(pattern, flags);
    return re ? { re, replace: '' } : null;
  }

  const re = compileRegex(raw, 'i');
  return re ? { re, replace: '' } : null;
};

const compiledMagicEpisodeRules = computed(() => {
  return magicEpisodeRules.value.map(compileMagicRule).filter(Boolean);
});

const hasMagicEpisodeRules = computed(() => compiledMagicEpisodeRules.value.length > 0);

// For magic matching:
// - raw list ALWAYS shows all episodes (no filtering)
// - episode buttons ONLY show episodes that match a rule (extracting season/episode)
const episodeMatchByIndex = computed(() => {
  const eps = selectedEpisodes.value;
  if (!eps.length) return [];
  const rules = compiledMagicEpisodeRules.value;
  if (!rules.length) return eps.map((_ep, idx) => ({ season: 0, episode: idx + 1 }));
  const cleanRules = compiledMagicEpisodeCleanRegexRules.value;

  const cleanText = (text) => {
    const s = typeof text === 'string' ? text.trim() : '';
    if (!s || !Array.isArray(cleanRules) || !cleanRules.length) return s;
    try {
      let out = s;
      cleanRules.forEach((re) => {
        if (!re) return;
        out = out.replace(re, '');
      });
      return out.replace(/\s+/g, ' ').trim();
    } catch (_e) {
      return s;
    }
  };

  const extractSeasonEpisodeFrom = (text) => {
    const s = cleanText(text);
    if (!s) return { season: 0, episode: 0 };
    for (let i = 0; i < rules.length; i += 1) {
      const rule = rules[i];
      const re = rule && rule.re ? rule.re : null;
      if (!re) continue;
      const m = s.match(re);
      if (!m) continue;
      // If the rule provides a replace template, normalize first (e.g. `S01E02.mp4`),
      // then extract the `Sxx` + `Eyy` parts.
      if (rule && rule.replace) {
        let normalized = '';
        try {
          normalized = s.replace(re, rule.replace);
        } catch (_e) {
          normalized = '';
        }
        const mm = normalized.match(/(?:S(\d{1,2}))?\s*E(\d{1,3})/i);
        if (mm && mm[2]) {
          const seasonRaw = mm[1] ? Number.parseInt(String(mm[1]), 10) : 0;
          const episodeRaw = Number.parseInt(String(mm[2]), 10);
          const season = Number.isFinite(seasonRaw) && seasonRaw >= 0 && seasonRaw <= 99 ? seasonRaw : 0;
          const episode = Number.isFinite(episodeRaw) && episodeRaw >= 1 && episodeRaw <= 99999 ? episodeRaw : 0;
          if (episode) return { season, episode };
        }
      }

      // Fallback: try to extract season (Sxx) and episode digits from captures.
      const seasonFrom = (val) => {
        const ss = typeof val === 'string' ? val : String(val || '');
        const sm = ss.match(/S(\d{1,2})/i);
        if (!sm || !sm[1]) return 0;
        const n = Number.parseInt(String(sm[1]), 10);
        return Number.isFinite(n) && n >= 0 && n <= 99 ? n : 0;
      };
      const picked =
        (m.length > 2 && m[2] != null ? String(m[2]) : '') ||
        (m.length > 1 && m[1] != null ? String(m[1]) : '') ||
        String(m[0] || '');
      const season =
        seasonFrom(m.length > 1 ? m[1] : '') || seasonFrom(picked) || seasonFrom(m[0] || '') || 0;
      const digits = String(picked || '').trim().replace(/\D+/g, '');
      if (!digits) continue;
      const episode = Number.parseInt(digits, 10);
      if (Number.isFinite(episode) && episode >= 1 && episode <= 99999) return { season, episode };
    }
    return { season: 0, episode: 0 };
  };

  return eps.map((ep, idx) => {
    const candidates = [];
    if (ep && ep.name != null) candidates.push(String(ep.name));
    if (ep && ep.url != null) {
      const rawNames = extractRawNamesFromEpisodeUrl(String(ep.url));
      if (rawNames[0]) candidates.push(rawNames[0]);
    }
    for (let i = 0; i < candidates.length; i += 1) {
      const r = extractSeasonEpisodeFrom(candidates[i]);
      if (r && r.episode) return r;
    }
    return { season: 0, episode: 0 };
  });
});

const allDisplayedEpisodes = computed(() => {
  const eps = selectedEpisodes.value;
  const total = eps.length;
  if (!total) return [];
  const matches = episodeMatchByIndex.value;
  const hasMagic = hasMagicEpisodeRules.value;

  const items = [];
  for (let idx = 0; idx < eps.length; idx += 1) {
    const ep = eps[idx];
    const url = (ep && ep.url ? String(ep.url) : '').trim();
    const name = (ep && ep.name ? String(ep.name) : '').trim() || `第${idx + 1}集`;
    const m = matches && matches[idx] && typeof matches[idx] === 'object' ? matches[idx] : { season: 0, episode: 0 };
    const season = Number.isFinite(Number(m.season)) ? Number(m.season) : 0;
    const no = Number.isFinite(Number(m.episode)) ? Number(m.episode) : 0;

    if (hasMagic) {
      if (!Number.isFinite(no) || no <= 0) continue;
      items.push({ key: `${idx}-${url}`, index: idx, no, season, name, url });
    } else {
      items.push({ key: `${idx}-${url}`, index: idx, no: idx + 1, season: 0, name, url });
    }
  }

  if (!items.length) return [];

  if (hasMagic) {
    items.sort((a, b) => {
      const sa = Number.isFinite(a.season) ? a.season : 0;
      const sb = Number.isFinite(b.season) ? b.season : 0;
      if (sa !== sb) return sa - sb;
      return a.no === b.no ? a.index - b.index : a.no - b.no;
    });
    if (episodeDescending.value) items.reverse();
    return items;
  }

  if (!episodeDescending.value) return items;
  return items.slice().reverse();
});

const seasonTabs = computed(() => {
  const list = allDisplayedEpisodes.value;
  if (!list.length) return [];
  const set = new Set();
  let hasZeroSeason = false;
  list.forEach((it) => {
    const s = it && Number.isFinite(Number(it.season)) ? Number(it.season) : 0;
    if (s > 0) set.add(s);
    else hasZeroSeason = true;
  });
  const seasons = Array.from(set).sort((a, b) => a - b);
  if (seasons.length < 2) return [];

  const cn = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  const labelOf = (s) => {
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return '未分季';
    if (n <= 10) return `第${cn[n]}季`;
    return `第${n}季`;
  };

  const tabs = seasons.map((s) => ({ key: `S${s}`, season: s, label: labelOf(s) }));
  if (hasZeroSeason) tabs.push({ key: 'S0', season: 0, label: '未分季' });
  return tabs;
});

const selectedSeason = ref(0);
watch(
  () => seasonTabs.value.map((t) => t.key).join(','),
  () => {
    const tabs = seasonTabs.value;
    if (!tabs.length) {
      selectedSeason.value = 0;
      return;
    }
    const exists = tabs.some((t) => Number(t.season) === Number(selectedSeason.value));
    if (!exists) selectedSeason.value = Number(tabs[0].season) || 0;
  },
  { immediate: true }
);

const selectSeason = (season) => {
  const n = Number(season);
  if (!Number.isFinite(n)) return;
  selectedSeason.value = n;
  selectedEpisodeGroup.value = '';
};

const displayedEpisodes = computed(() => {
  const list = allDisplayedEpisodes.value;
  const tabs = seasonTabs.value;
  if (!tabs.length) return list;
  return list.filter((it) => Number(it.season) === Number(selectedSeason.value));
});

const EPISODE_GROUP_SIZE = 50;

const episodeGroups = computed(() => {
  const hasMagic = hasMagicEpisodeRules.value;
  const list = displayedEpisodes.value;
  if (!list.length) return [];

  const makeLabel = (startNo, endNo) => {
    return episodeDescending.value ? `${endNo}-${startNo}` : `${startNo}-${endNo}`;
  };

  if (hasMagic) {
    const maxNo = list.reduce((m, it) => (it && Number.isFinite(it.no) ? Math.max(m, it.no) : m), 0);
    if (!maxNo) return [];
    const byIdx = new Map();
    list.forEach((it) => {
      const no = it && Number.isFinite(it.no) ? Number(it.no) : 0;
      if (!no) return;
      const idx = Math.floor((no - 1) / EPISODE_GROUP_SIZE);
      byIdx.set(idx, true);
    });
    const indices = Array.from(byIdx.keys()).sort((a, b) => a - b);
    const groups = indices.map((i) => {
      const startNo = i * EPISODE_GROUP_SIZE + 1;
      const endNo = Math.min(maxNo, (i + 1) * EPISODE_GROUP_SIZE);
      const key = `g${startNo}-${endNo}`;
      return { key, startNo, endNo, label: makeLabel(startNo, endNo) };
    });
    if (episodeDescending.value) groups.reverse();
    return groups;
  }

  const total = selectedEpisodes.value.length;
  if (!total) return [];
  const groups = [];
  const count = Math.ceil(total / EPISODE_GROUP_SIZE);
  for (let i = 0; i < count; i += 1) {
    const startNo = i * EPISODE_GROUP_SIZE + 1;
    const endNo = Math.min(total, (i + 1) * EPISODE_GROUP_SIZE);
    const key = `g${startNo}-${endNo}`;
    groups.push({ key, startNo, endNo, label: makeLabel(startNo, endNo) });
  }
  if (episodeDescending.value) groups.reverse();
  return groups;
});

const selectedEpisodeGroup = ref('');
const selectedEpisodeGroupKey = computed(() => selectedEpisodeGroup.value || episodeGroups.value[0]?.key || '');

watch(
  () => String(selectedSeason.value),
  () => {
    if (!seasonTabs.value.length) return;
    selectedEpisodeGroup.value = '';
    scheduleUpdateHiddenEpisodeGroups();
  }
);

watch(
  () => episodeGroups.value.map((g) => g.key).join(','),
  () => {
    const groups = episodeGroups.value;
    if (!groups.length) {
      selectedEpisodeGroup.value = '';
      return;
    }
    const k = selectedEpisodeGroup.value;
    if (!k) return;
    const exists = groups.some((g) => g && g.key === k);
    if (!exists) selectedEpisodeGroup.value = '';
  },
  { immediate: true }
);

const groupedDisplayedEpisodes = computed(() => {
  const list = displayedEpisodes.value;
  const groups = episodeGroups.value;
  if (!list.length || !groups.length) return list;
  const g = groups.find((x) => x.key === selectedEpisodeGroupKey.value) || groups[0];
  if (!g) return list;
  return list.filter((ep) => ep && ep.no >= g.startNo && ep.no <= g.endNo);
});

const episodeGroupTabsEl = ref(null);
const episodeGroupMoreEl = ref(null);
const episodeGroupMoreOpen = ref(false);
const episodeGroupHoverArmed = ref(false);
const hiddenEpisodeGroups = ref([]);

const updateHiddenEpisodeGroups = () => {
  try {
    const el = episodeGroupTabsEl.value;
    const groups = episodeGroups.value;
    if (!el || !groups.length) {
      hiddenEpisodeGroups.value = [];
      return;
    }
    const left = el.scrollLeft;
    const right = left + el.clientWidth;
    const nodes = Array.from(el.querySelectorAll('.episode-group-btn'));
    const hidden = [];
    nodes.forEach((btn, idx) => {
      const g = groups[idx];
      if (!g) return;
      const bLeft = btn.offsetLeft;
      const bRight = bLeft + btn.offsetWidth;
      const fullyVisible = bLeft >= left && bRight <= right;
      if (!fullyVisible) hidden.push(g);
    });
    hiddenEpisodeGroups.value = hidden;
  } catch (_e) {
    hiddenEpisodeGroups.value = [];
  }
};

let hiddenEpisodeGroupsRaf = 0;
const scheduleUpdateHiddenEpisodeGroups = () => {
  try {
    if (hiddenEpisodeGroupsRaf) cancelAnimationFrame(hiddenEpisodeGroupsRaf);
    hiddenEpisodeGroupsRaf = window.requestAnimationFrame(() => {
      hiddenEpisodeGroupsRaf = 0;
      updateHiddenEpisodeGroups();
    });
  } catch (_e) {}
};

const selectEpisodeGroup = (key) => {
  selectedEpisodeGroup.value = key;
  try {
    const el = episodeGroupTabsEl.value;
    if (!el) return;
    const idx = episodeGroups.value.findIndex((g) => g.key === key);
    if (idx < 0) return;
    const btn = el.querySelectorAll('.episode-group-btn')[idx];
    if (btn && typeof btn.scrollIntoView === 'function') {
      btn.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
    scheduleUpdateHiddenEpisodeGroups();
  } catch (_e) {}
};

const normalizePlayPayload = (data) => {
  if (!data) return null;
  if (typeof data === 'string') {
    const t = data.trim();
    if (!t) return null;
    try {
      return JSON.parse(t);
    } catch (_e) {
      return null;
    }
  }
  if (typeof data === 'object') return data;
  return null;
};

const pickFirstPlayableUrl = (payload) => {
  const arr = payload && Array.isArray(payload.url) ? payload.url : [];
  if (arr.length < 2) return '';
  return typeof arr[1] === 'string' ? arr[1].trim() : String(arr[1] ?? '').trim();
};

const rewriteProxyUrlToBase = (urlString, apiBase, tvUser) => {
  const raw = typeof urlString === 'string' ? urlString.trim() : '';
  if (!raw) return '';
  const normalized = normalizeCatPawOpenApiBase(apiBase);
  if (!normalized) return raw;
  try {
    const u = new URL(raw);
    const host = (u.hostname || '').toLowerCase();
    const loopback = ['127.0.0.1', '0.0.0.0', 'localhost'];
    const base = new URL(normalized);
    const baseHost = (base.hostname || '').toLowerCase();
    const isLoopback = loopback.includes(host);
    const isSameHost = host && baseHost && host === baseHost;
    const needsDeport = u.port === '3006' && base.port !== '3006';
    if (!isLoopback && !(isSameHost && needsDeport)) return raw;

    // Drop origin/port from CatPawOpen raw URL, then resolve against configured base
    // (this keeps any base-path prefix and avoids leaking :3006 when not configured).
    const next = new URL(String(u.pathname || '/').replace(/^\//, ''), normalized);
    next.search = u.search || '';
    next.hash = u.hash || '';

    const safeUser = typeof tvUser === 'string' ? tvUser.trim() : '';
    if (safeUser && !next.searchParams.has('__tvuser')) next.searchParams.set('__tvuser', safeUser);
    return next.toString();
  } catch (_e) {
    return raw;
  }
};

const rewritePlayPayloadUrls = (payload, apiBase, tvUser) => {
  if (!payload || typeof payload !== 'object') return payload;
  if (!Array.isArray(payload.url)) return payload;
  const next = { ...payload, url: payload.url.slice() };
  for (let i = 0; i < next.url.length; i += 2) {
    const u = next.url[i + 1];
    if (typeof u !== 'string') continue;
    next.url[i + 1] = rewriteProxyUrlToBase(u, apiBase, tvUser) || u;
  }
  return next;
};

const normalizeHttpBase = (value) => {
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
};

const normalizeGoProxyServers = (value) => {
  const list = Array.isArray(value) ? value : [];
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
};

const detectGoProxyPan = (playUrl, playHeaders, preferredPan = '') => {
  const preferred = typeof preferredPan === 'string' ? preferredPan.trim().toLowerCase() : '';
  if (preferred === 'baidu' || preferred === 'quark') return preferred;
  const raw = typeof playUrl === 'string' ? playUrl.trim() : '';
  if (!raw) return '';
  try {
    const u = new URL(raw);
    const hn = (u.hostname || '').toLowerCase();
    if (hn === 'baidupcs.com' || hn.endsWith('.baidupcs.com')) return 'baidu';
    if (hn.endsWith('.quark.cn') || hn === 'quark.cn') return 'quark';
  } catch (_e) {}
  const headers = playHeaders && typeof playHeaders === 'object' ? playHeaders : {};
  const ref = String(headers.Referer || headers.referer || '');
  if (ref.includes('pan.quark.cn') || ref.includes('quark.cn')) return 'quark';
  return '';
};

const guessPreferredPanFromLabel = (label) => {
  const raw = typeof label === 'string' ? label.trim() : '';
  if (!raw) return '';
  if (raw.includes('百度')) return 'baidu';
  if (raw.includes('夸克') || raw.toLowerCase().includes('quark')) return 'quark';
  return '';
};

const joinBaseUrl = (base, relativePath) => {
  const b = normalizeHttpBase(base);
  const rel = typeof relativePath === 'string' ? relativePath.trim() : '';
  if (!b || !rel) return '';
  const baseWithSlash = b.endsWith('/') ? b : `${b}/`;
  try {
    return new URL(rel.startsWith('./') ? rel : `./${rel.replace(/^\//, '')}`, baseWithSlash).toString();
  } catch (_e) {
    return '';
  }
};

const normalizeHttpBaseWithSlash = (value) => {
  const b = normalizeHttpBase(value);
  return b ? `${b}/` : '';
};

const sanitizeTvUsername = (input) => {
  const raw = String(input || '').trim();
  if (!raw) return 'admin';
  const safe = raw.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '');
  return safe || 'admin';
};

const normalizeOpenListMountPath = (value) => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';
  let p = raw;
  if (!p.startsWith('/')) p = `/${p}`;
  if (!p.endsWith('/')) p = `${p}/`;
  p = p.replace(/\/{2,}/g, '/');
  return p;
};

const encodePathPreserveSlashes = (path) => {
  const raw = typeof path === 'string' ? path : '';
  if (!raw) return '';
  return raw
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
};

const isQuarkPanLabel = (label) => {
  const s = typeof label === 'string' ? label : '';
  if (!s) return false;
  if (s.includes('夸克')) return true;
  return s.toLowerCase().includes('quark');
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const withRetries = async (attempts, fn) => {
  const n = Number(attempts);
  const max = Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1;
  let lastErr = null;
  for (let i = 0; i < max; i += 1) {
    try {
      // 0ms / 300ms / 800ms
      if (i === 1) await sleep(300);
      if (i === 2) await sleep(800);
      return await fn(i + 1);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('retry failed');
};

const openListRefreshPath = async ({ apiBase, token, path }) => {
  const base = normalizeHttpBaseWithSlash(apiBase);
  if (!base) throw new Error('openlist base invalid');
  const t = typeof token === 'string' ? token.trim() : '';
  if (!t) throw new Error('openlist token missing');
  const p = typeof path === 'string' ? path : '';
  if (!p) throw new Error('openlist path missing');

  const url = new URL('api/fs/get', base).toString();
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: t },
    credentials: 'omit',
    body: JSON.stringify({
      path: p,
      password: '',
      page: 1,
      per_page: 0,
      refresh: true,
    }),
  });
  const data = await resp.json().catch(() => ({}));
  const code = data && typeof data.code === 'number' ? data.code : 0;
  if (resp.ok && code === 200) return true;
  const msg = (data && data.message) ? String(data.message) : `HTTP ${resp.status}`;
  const err = new Error(msg);
  err.status = resp.status;
  throw err;
};

const openListResolveRedirectedUrl = async ({ apiBase, mountPath, username, fileName }) => {
  const base = normalizeHttpBaseWithSlash(apiBase);
  if (!base) throw new Error('openlist base invalid');
  const mount = normalizeOpenListMountPath(mountPath);
  if (!mount) throw new Error('openlist mount missing');
  const userDir = `TV_Server_${sanitizeTvUsername(username)}`;
  const nameRaw = typeof fileName === 'string' ? fileName.trim() : '';
  const name = nameRaw.replace(/^\/+|\/+$/g, '');
  if (!name) throw new Error('file name missing');

  const rawPath = `${mount}${userDir}/${name}`.replace(/\/{2,}/g, '/').replace(/\/+$/g, '');
  const encoded = encodePathPreserveSlashes(rawPath);
  const downloadUrl = new URL(`d${encoded.startsWith('/') ? '' : '/'}${encoded}`, base).toString();

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const t = setTimeout(() => {
    try {
      if (controller) controller.abort();
    } catch (_e) {}
  }, 8000);
  try {
    const resp = await fetch(downloadUrl, {
      method: 'GET',
      redirect: 'follow',
      credentials: 'omit',
      cache: 'no-store',
      signal: controller ? controller.signal : undefined,
    });
    const finalUrl = resp && typeof resp.url === 'string' ? resp.url.trim() : '';
    try {
      if (resp && resp.body && typeof resp.body.cancel === 'function') resp.body.cancel();
    } catch (_e) {}
    if (!finalUrl) throw new Error('openlist redirect url empty');
    if (!/^https?:\/\//i.test(finalUrl)) throw new Error('openlist redirect url invalid');
    return finalUrl;
  } finally {
    clearTimeout(t);
  }
};

const goProxyPickState = {
  selectedBase: '',
  selectedPan: '',
  inFlight: null,
  inFlightPan: '',
};

const speedTestGoProxyBase = async (base, bytes = 2 * 1024 * 1024, timeoutMs = 8000) => {
  const url = joinBaseUrl(base, `speed?bytes=${encodeURIComponent(String(bytes))}&_=${Date.now()}`);
  if (!url) throw new Error('invalid speed url');
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const t = setTimeout(() => {
    try {
      if (controller) controller.abort();
    } catch (_e) {}
  }, timeoutMs);
  const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  try {
    const resp = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      signal: controller ? controller.signal : undefined,
    });
    if (!resp.ok) throw new Error(`speed http ${resp.status}`);
    const body = resp.body;
    let total = 0;
    if (body && typeof body.getReader === 'function') {
      const reader = body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value && value.byteLength) total += value.byteLength;
      }
    } else {
      const buf = await resp.arrayBuffer();
      total = buf ? buf.byteLength : 0;
    }
    const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const seconds = Math.max(0.001, (ended - started) / 1000);
    return total / seconds; // bytes/sec
  } finally {
    clearTimeout(t);
  }
};

const pickGoProxyBaseForPlayback = async (pan = '') => {
  const servers = normalizeGoProxyServers(props.bootstrap?.settings?.goProxyServers);
  if (!servers.length) return '';
  const p = typeof pan === 'string' ? pan.trim().toLowerCase() : '';
  const eligible = (p === 'baidu' || p === 'quark')
    ? servers.filter((s) => !!(s && s.pans && s.pans[p]))
    : servers;
  if (!eligible.length) return '';
  const autoSelect = !!props.bootstrap?.settings?.goProxyAutoSelect;
  if (!autoSelect) return eligible[0].base;

  if (goProxyPickState.selectedBase && goProxyPickState.selectedPan === p) return goProxyPickState.selectedBase;
  if (goProxyPickState.inFlight && goProxyPickState.inFlightPan === p) return await goProxyPickState.inFlight;

  goProxyPickState.inFlight = (async () => {
    const tests = eligible.map(async (s) => {
      const base = s && s.base ? s.base : '';
      if (!base) return { base: '', bps: 0, ok: false };
      try {
        const bps = await speedTestGoProxyBase(base);
        return { base, bps, ok: true };
      } catch (_e) {
        return { base, bps: 0, ok: false };
      }
    });
    const results = await Promise.all(tests);
    const best = results
      .filter((r) => r && r.ok && r.base)
      .sort((a, b) => (b.bps || 0) - (a.bps || 0))[0];
    const chosen = best && best.base ? best.base : eligible[0].base;
    goProxyPickState.selectedBase = chosen || '';
    goProxyPickState.selectedPan = p;
    return goProxyPickState.selectedBase;
  })();
  goProxyPickState.inFlightPan = p;
  try {
    return await goProxyPickState.inFlight;
  } finally {
    if (goProxyPickState.inFlightPan === p) {
      goProxyPickState.inFlight = null;
      goProxyPickState.inFlightPan = '';
    }
  }
};

const registerGoProxyToken = async ({ base, url, headers }) => {
  const b = normalizeHttpBase(base);
  if (!b) throw new Error('missing goProxy base');
  const targetUrl = typeof url === 'string' ? url.trim() : '';
  if (!targetUrl) throw new Error('missing play url');
  const safeHeaders = {};
  const h = headers && typeof headers === 'object' ? headers : {};
  ['User-Agent', 'Referer', 'Cookie', 'Authorization'].forEach((k) => {
    const v = h[k] || h[k.toLowerCase()];
    if (typeof v === 'string' && v.trim()) safeHeaders[k] = v.trim();
  });
  const registerUrl = joinBaseUrl(b, 'register');
  if (!registerUrl) throw new Error('invalid register url');
  const resp = await fetch(registerUrl, {
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: targetUrl, headers: safeHeaders }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = (data && (data.message || data.error)) ? String(data.message || data.error) : 'request failed';
    const err = new Error(msg);
    err.status = resp.status;
    throw err;
  }
  const token = data && data.token ? String(data.token).trim() : '';
  if (!token) throw new Error('missing token');
  const proxyUrl = joinBaseUrl(b, encodeURIComponent(token));
  if (!proxyUrl) throw new Error('invalid proxy url');
  return { token, proxyUrl };
};

const maybeUseGoProxyForPlayback = async (playUrl, playHeaders, preferredPan = '', proxyHint = false) => {
  if (!proxyHint) return { url: playUrl, headers: playHeaders };
  const pan = detectGoProxyPan(playUrl, playHeaders, preferredPan);
  if (!pan) return { url: playUrl, headers: playHeaders };
  const base = await pickGoProxyBaseForPlayback(pan);
  if (!base) return { url: playUrl, headers: playHeaders };
  const { proxyUrl } = await registerGoProxyToken({ base, url: playUrl, headers: playHeaders });
  return { url: proxyUrl, headers: {} };
};

const playRequestState = {
  seq: 0,
  inFlightKey: '',
  inFlight: null,
};

const requestPlay = async () => {
  const api = resolvedSpiderApi.value;
  const src = selectedPanSource.value;
  const eps = selectedEpisodes.value;
  const idx = selectedEpisodeIndex.value;
  const ep = eps[idx];
  const flag =
    ep && ep.flag
      ? String(ep.flag)
      : src && src.label
        ? String(src.label)
        : '';
  const id = ep && ep.url ? String(ep.url) : '';
  if (!api || !flag || !id) return;
  const playKey = `${api}::${selectedPanKey.value}::${idx}::${flag}::${id}`;
  if (playRequestState.inFlight && playRequestState.inFlightKey === playKey) {
    await playRequestState.inFlight;
    return;
  }
  const panKeyAtCall = selectedPanKey.value;
  const idxAtCall = idx;
  const epNameAtCall = ep && ep.name ? String(ep.name) : '';
  const openListFileNameAtCall = (() => {
    const url = ep && typeof ep.url === 'string' ? ep.url : '';
    if (url) {
      const rawNames = extractRawNamesFromEpisodeUrl(url);
      if (rawNames && rawNames[0]) return String(rawNames[0] || '').trim();
    }
    return epNameAtCall ? String(epNameAtCall).trim() : '';
  })();

  playRequestState.seq += 1;
  const seqAtCall = playRequestState.seq;
  playRequestState.inFlightKey = playKey;

  const run = (async () => {
    playLoading.value = true;
    playError.value = '';
    playerRuntimeError.value = '';
    playerUrl.value = '';
    playerHeaders.value = {};
    playerMetaReady.value = false;
    try {
		    const role = props.bootstrap && props.bootstrap.user && props.bootstrap.user.role ? String(props.bootstrap.user.role) : '';
		    const userBase = props.bootstrap?.settings?.userCatPawOpenApiBase || '';
		    const serverBase = props.bootstrap?.settings?.catPawOpenApiBase || '';
		    const apiBase = (role === 'user' ? userBase : (userBase || serverBase)).trim();
		    const tvUser = props.bootstrap?.user?.username || '';

        const shouldQuarkTv =
          !!props.bootstrap?.settings?.openListQuarkTvMode &&
          isQuarkPanLabel(src && src.label ? String(src.label) : '') &&
          !!props.bootstrap?.settings?.openListApiBase &&
          !!props.bootstrap?.settings?.openListToken &&
          !!props.bootstrap?.settings?.openListQuarkTvMount &&
          !!openListFileNameAtCall;

        const fetchPlay = async (query) => {
          const raw = await requestCatSpider({
            apiBase,
            username: tvUser,
            action: 'play',
            spiderApi: api,
            payload: { flag, id },
            query: query && typeof query === 'object' ? query : undefined,
          });
          const rewritten = rewritePlayPayloadUrls(raw, apiBase, tvUser);
          const payload = normalizePlayPayload(rewritten);
          const url = pickFirstPlayableUrl(payload);
          const rawHeaders = payload && payload.header && typeof payload.header === 'object' ? payload.header : {};
          const proxyHintFromPayload = !!(payload && typeof payload === 'object' && payload.proxyHint === true);
          return { raw, payload, url, rawHeaders, proxyHintFromPayload };
        };

        let playResult = await fetchPlay(shouldQuarkTv ? { quark_tv: '1' } : undefined);
		    if (!playResult.url) {
          if (seqAtCall === playRequestState.seq) playError.value = '无可用播放地址';
		      return;
		    }

	      const goProxyEnabled = !!props.bootstrap?.settings?.goProxyEnabled;
	      const proxyHint = goProxyEnabled || playResult.proxyHintFromPayload;
	      let finalUrl = playResult.url;
      let finalHeaders = playResult.rawHeaders;

	        if (shouldQuarkTv) {
	          const openListApiBase = String(props.bootstrap?.settings?.openListApiBase || '');
	          const openListToken = String(props.bootstrap?.settings?.openListToken || '');
	          const openListMount = String(props.bootstrap?.settings?.openListQuarkTvMount || '');
	          const userDir = `TV_Server_${sanitizeTvUsername(tvUser)}`;
	          const mount = normalizeOpenListMountPath(openListMount);
	          const name = typeof openListFileNameAtCall === 'string' ? openListFileNameAtCall.trim() : '';
	          const refreshPath = `${mount}${userDir}/${name}/`.replace(/\/{2,}/g, '/');
	          let quarkTvFallbackPlay = null;

	          let refreshOk = false;
	          try {
	            refreshOk = await withRetries(3, async () => {
	              await openListRefreshPath({ apiBase: openListApiBase, token: openListToken, path: refreshPath });
	              return true;
	            });
	          } catch (_e) {
	            refreshOk = false;
	          }

	          if (!refreshOk) {
	            try {
	              quarkTvFallbackPlay = await fetchPlay({ quark_tv: '0' });
	            } catch (_e) {}
	          }

	          try {
	            const directUrl = await withRetries(3, async () => {
	              return await openListResolveRedirectedUrl({
	                apiBase: openListApiBase,
	                mountPath: openListMount,
	                username: tvUser,
	                fileName: name,
	              });
	            });
	            if (typeof directUrl === 'string' && directUrl.trim()) {
	              finalUrl = directUrl.trim();
	              finalHeaders = {};
	            }
	          } catch (_e) {
	            if (!quarkTvFallbackPlay) {
	              try {
	                quarkTvFallbackPlay = await fetchPlay({ quark_tv: '0' });
	              } catch (_e2) {}
	            }
	            if (quarkTvFallbackPlay && quarkTvFallbackPlay.url) {
	              finalUrl = quarkTvFallbackPlay.url;
	              finalHeaders = quarkTvFallbackPlay.rawHeaders || {};
	            } else {
	              // Fallback: request without quark_tv so CatPawOpen uses its normal logic.
	              try {
	                playResult = await fetchPlay(undefined);
	                if (playResult && playResult.url) {
	                  finalUrl = playResult.url;
	                  finalHeaders = playResult.rawHeaders || {};
	                }
	              } catch (__e) {}
	            }
	          }
	        }

      try {
        const preferredPan = guessPreferredPanFromLabel(src && src.label ? String(src.label) : '');
        const out = await maybeUseGoProxyForPlayback(finalUrl, finalHeaders, preferredPan, proxyHint);
        if (out && typeof out === 'object') {
          if (typeof out.url === 'string' && out.url.trim()) finalUrl = out.url.trim();
          if (out.headers && typeof out.headers === 'object') finalHeaders = out.headers;
        }
      } catch (e) {
        // Keep direct URL as fallback (GoProxy is best-effort on the client).
        try {
          console.warn('[GoProxy] register failed:', e && e.message ? e.message : e);
	        } catch (_e) {}
	      }
        if (seqAtCall !== playRequestState.seq) return;
		    playerMetaReady.value = false;
		    playerUrl.value = finalUrl;
		    playerHeaders.value = finalHeaders;
		    playingPanKey.value = panKeyAtCall;
		    playingEpisodeIndex.value = idxAtCall;

			    try {
			      const siteKey = (props.siteKey || '').trim();
			      const spiderApi = (api || '').trim();
			      const videoId = (props.videoId || '').trim();
		      const videoTitle = displayTitle.value || '';
		      if (siteKey && spiderApi && videoId && videoTitle) {
		        const payloadForHistory = {
		          siteKey,
		          siteName: resolvedSiteName.value || '',
		          spiderApi,
		          videoId,
		          videoTitle,
		          videoPoster: historyCoverPoster.value || pickHistoryPoster() || '',
		          videoRemark: (props.videoRemark || '').trim(),
		          panLabel: (src && src.label ? String(src.label) : '').trim(),
		          playFlag: flag,
		          episodeIndex: idxAtCall >= 0 ? idxAtCall : 0,
		          episodeName: epNameAtCall,
		        };
		        lastHistoryPayload.value = payloadForHistory;
		        await apiPostJson('/api/playhistory', { ...payloadForHistory }, { dedupe: false });
			        window.dispatchEvent(new CustomEvent('tv:play-history-updated'));
			      }
			    } catch (_e) {
		      // ignore (history not critical)
		    }
	  } catch (e) {
	    const status = e && typeof e.status === 'number' ? e.status : 0;
	    const msg = (e && e.message) || '请求失败';
        if (seqAtCall === playRequestState.seq) playError.value = status ? `HTTP ${status}：${msg}` : msg;
	  } finally {
        if (seqAtCall === playRequestState.seq) playLoading.value = false;
	  }
  })();

  playRequestState.inFlight = run;
  try {
    await run;
  } finally {
    if (playRequestState.inFlight === run) playRequestState.inFlight = null;
  }
};

const onPlayerLoadedMetadata = () => {
  playerMetaReady.value = true;
};

const onPlayerError = (e) => {
  try {
    const msg = e && e.message ? String(e.message) : '';
    playerRuntimeError.value = msg || '播放失败';
  } catch (_e) {
    playerRuntimeError.value = '播放失败';
  }
};

const playerPhase = computed(() => {
  if (playLoading.value) return 'play_url';
  if (playError.value) return 'error';
  if (playerRuntimeError.value) return 'error';
  if (introLoading.value) return 'detail';
  if (introError.value && !playerUrl.value) return 'error';
  if (playerUrl.value && !playerMetaReady.value) return 'play_info';
  if (playerUrl.value && playerMetaReady.value) return 'ready';
  return 'idle';
});

const playerPhaseLoading = computed(() => {
  return playerPhase.value === 'detail' || playerPhase.value === 'play_url' || playerPhase.value === 'play_info';
});

const playerPhaseText = computed(() => {
  switch (playerPhase.value) {
    case 'detail':
      return '视频加载中...';
    case 'play_url':
      return '获取播放地址...';
    case 'play_info':
      return '获取播放信息...';
    case 'error':
      return playerRuntimeError.value || playError.value || introError.value || '请求失败';
    case 'idle':
      return '待播放';
    default:
      return '加载中...';
  }
});

const loadResumeFromHistory = async () => {
  resumeHistoryLoaded.value = false;
  resumeHistoryApplied.value = false;
  resumeHistory.value = null;
  const siteKey = (props.siteKey || '').trim();
  const videoId = (props.videoId || '').trim();
  if (!siteKey || !videoId) {
    resumeHistoryLoaded.value = true;
    return;
  }
  const key = `${siteKey}::${videoId}`;
  if (resumeHistoryState.inFlight && resumeHistoryState.key === key) {
    await resumeHistoryState.inFlight;
    return;
  }
  resumeHistoryState.seq += 1;
  const seqAtCall = resumeHistoryState.seq;
  resumeHistoryState.key = key;
  try {
    resumeHistoryState.inFlight = (async () => {
      try {
        try {
          const item = await apiGetJson(`/api/playhistory/one${buildQuery({ siteKey, videoId })}`, { cacheMs: 2000 });
          if (seqAtCall !== resumeHistoryState.seq) return;
          if (item && item.siteKey === siteKey && item.videoId === videoId) {
            resumeHistory.value = item;
            return;
          }
          if (item == null) {
            resumeHistory.value = null;
            return;
          }
        } catch (_e) {
          // fallback
        }
        const list = await apiGetJson(`/api/playhistory${buildQuery({ limit: 50 })}`, { cacheMs: 2000 });
        if (seqAtCall !== resumeHistoryState.seq) return;
        const items = Array.isArray(list) ? list : [];
        const found = items.find((r) => r && r.siteKey === siteKey && r.videoId === videoId) || null;
        resumeHistory.value = found;
      } catch (_e) {
        if (seqAtCall === resumeHistoryState.seq) resumeHistory.value = null;
      }
    })();
    await resumeHistoryState.inFlight;
  } catch (_e) {
    if (seqAtCall === resumeHistoryState.seq) resumeHistory.value = null;
  } finally {
    if (seqAtCall === resumeHistoryState.seq) resumeHistoryLoaded.value = true;
    if (resumeHistoryState.key === key && resumeHistoryState.seq === seqAtCall) resumeHistoryState.inFlight = null;
  }
};

watch(
  () => aggregatedSources.value.length,
  async (len) => {
    if (!len) return;
    if (aggregatedFromStorage.value) {
      // If we came from search, sessionStorage already has exact matches. Lock immediately.
      await tryLockHistoryPoster({ force: true, allowFallback: true });
      return;
    }
    // If we are doing a swap-source search, lock only when preferred is found,
    // or after the search completes (handled by the watcher below).
    await tryLockHistoryPoster({ force: false, allowFallback: false });
  }
);

watch(
  () => sourcesSearchedOnce.value,
  async (done) => {
    if (!done) return;
    if (historyCoverLocked.value) return;
    if (!aggregatedSources.value || !aggregatedSources.value.length) return;
    await tryLockHistoryPoster({ force: true, allowFallback: true });
  }
);

watch(
  () =>
    [
      introLoading.value,
      resumeHistoryLoaded.value ? '1' : '0',
      selectedPanKey.value,
      selectedEpisodes.value.length,
      selectedEpisodeIndex.value,
    ].join('|'),
  () => {
    if (initialAutoPlayTriggered.value) return;
    if (introLoading.value) return;
    if (!resumeHistoryLoaded.value) return;
    if (!selectedEpisodes.value.length) return;

    // Restore from history once (pan + episode), if available and already loaded.
    if (!resumeHistoryApplied.value && resumeHistoryLoaded.value && resumeHistory.value) {
      const prevPan = selectedPan.value;
      const prevIdx = selectedEpisodeIndex.value;
      const wantedPanLabel = typeof resumeHistory.value.panLabel === 'string' ? resumeHistory.value.panLabel.trim() : '';
      const wantedIdxRaw = resumeHistory.value.episodeIndex != null ? Number(resumeHistory.value.episodeIndex) : 0;
      const wantedIdx = Number.isFinite(wantedIdxRaw) && wantedIdxRaw >= 0 ? Math.floor(wantedIdxRaw) : 0;
      const normalize = (label) => String(label || '').trim().replace(/#\d{1,3}\s*$/i, '').trim().toLowerCase();

      let target = null;
      if (wantedPanLabel) {
        const want = normalize(wantedPanLabel);
        target = panOptions.value.find((o) => o && normalize(o.label) === want) || null;
        if (target && target.key) selectedPan.value = target.key;
      }

      const src = target || selectedPanSource.value || null;
      const total = src && Array.isArray(src.episodes) ? src.episodes.length : 0;
      const clamped = total > 0 ? Math.max(0, Math.min(wantedIdx, total - 1)) : 0;
      selectedEpisodeIndex.value = clamped;

      resumeHistoryApplied.value = true;
      if (prevPan !== selectedPan.value || prevIdx !== selectedEpisodeIndex.value) return;
    }

    if (selectedEpisodeIndex.value < 0) selectedEpisodeIndex.value = 0;
    initialAutoPlayTriggered.value = true;
    requestPlay();
  }
);

watch(
  () =>
    [
      hasMagicEpisodeRules.value ? '1' : '0',
      introLoading.value ? '1' : '0',
      introError.value ? '1' : '0',
      selectedPanKey.value,
      selectedEpisodes.value.length,
      allDisplayedEpisodes.value.length,
    ].join('|'),
  () => {
    if (introLoading.value) return;
    if (introError.value) return;
    if (!hasMagicEpisodeRules.value) {
      if (autoRawListMode.value) {
        autoRawListMode.value = false;
        rawListMode.value = false;
      }
      return;
    }
    if (selectedEpisodes.value.length && allDisplayedEpisodes.value.length === 0) {
      rawListMode.value = true;
      autoRawListMode.value = true;
      selectedEpisodeIndex.value = -1;
      return;
    }
    if (autoRawListMode.value && allDisplayedEpisodes.value.length) {
      rawListMode.value = false;
      autoRawListMode.value = false;
    }
  },
  { immediate: true }
);

watch(
  () => [props.siteKey, props.videoId].join('|'),
  () => {
    void loadFavoriteStatus();
  },
  { immediate: true }
);

watch(
  () => [selectedPanKey.value, selectedEpisodes.value.length, selectedEpisodeIndex.value].join('|'),
  () => {
    const total = selectedEpisodes.value.length;
    if (!total) {
      selectedEpisodeGroup.value = '';
      return;
    }
    const idx = selectedEpisodeIndex.value;
    const matches = episodeMatchByIndex.value;
    const hasMagic = hasMagicEpisodeRules.value;
    const m =
      Number.isFinite(idx) && idx >= 0 && matches && matches[idx] && typeof matches[idx] === 'object'
        ? matches[idx]
        : { season: 0, episode: 0 };
    const matchedNo = Number.isFinite(Number(m.episode)) ? Number(m.episode) : 0;
    const no = hasMagic && matchedNo > 0 ? matchedNo : (Number.isFinite(idx) && idx >= 0 ? idx : 0) + 1;
    const groups = episodeGroups.value;
    const found = groups.find((g) => no >= g.startNo && no <= g.endNo);
    const next = (found && found.key) || groups[0]?.key || '';
    if (next && next !== selectedEpisodeGroup.value) selectedEpisodeGroup.value = next;
    scheduleUpdateHiddenEpisodeGroups();
  }
);

const siteEpisodes = computed(() => {
  const list = panOptions.value;
  if (!list.length) return 0;
  let max = 0;
  list.forEach((s) => {
    const n = s && Array.isArray(s.episodes) ? s.episodes.length : 0;
    if (n > max) max = n;
  });
  return max;
});

const siteQuality = computed(() => {
  const fromStr = detail.value.playFrom != null ? String(detail.value.playFrom) : '';
  const urlStr = detail.value.playUrl != null ? String(detail.value.playUrl) : '';
  const hay = `${fromStr} ${urlStr}`.toUpperCase();
  if (/(2160P|2160|4K)/.test(hay)) return '4K';
  if (/(1080P|1080)/.test(hay)) return '1080P';
  if (/(720P|720)/.test(hay)) return '720P';
  return '';
});

const rawListItems = computed(() => {
  if (!rawListMode.value) return [];
  const eps = selectedEpisodes.value;
  if (!eps.length) return [];
  return eps.map((ep, idx) => {
    const url = ep && ep.url != null ? String(ep.url) : '';
    const rawNames = extractRawNamesFromEpisodeUrl(url);
    const text = (rawNames[0] || (ep && ep.name != null ? String(ep.name) : '') || '').trim() || `第${idx + 1}集`;
    return { key: `${idx}-${url}`, index: idx, text };
  });
});

const selectEpisode = (idx) => {
  const n = Number(idx);
  if (!Number.isFinite(n) || n < 0) return;
  // If the user clicks the currently playing episode within the same pan, do nothing.
  // But if they switch pan (even same episode number), we must request a new play url.
  if (
    playingPanKey.value &&
    playingPanKey.value === selectedPanKey.value &&
    playingEpisodeIndex.value === n &&
    playerUrl.value
  ) {
    selectedEpisodeIndex.value = n;
    return;
  }
  selectedEpisodeIndex.value = n;
  requestPlay();
};

const extractIntroFromDetail = (data) => {
  const pick = (vod) => {
    if (!vod) return '';
    return (
      (vod.vod_content != null ? String(vod.vod_content) : '') ||
      (vod.content != null ? String(vod.content) : '') ||
      (vod.desc != null ? String(vod.desc) : '') ||
      ''
    ).trim();
  };

  if (!data) return '';
  if (Array.isArray(data.list) && data.list[0]) return pick(data.list[0]);
  if (data.data && Array.isArray(data.data.list) && data.data.list[0]) return pick(data.data.list[0]);
  if (data.vod) return pick(data.vod);
  return '';
};

const extractDetailFromResponse = (data) => {
  const first =
    (data && Array.isArray(data.list) && data.list[0]) ||
    (data && data.data && Array.isArray(data.data.list) && data.data.list[0]) ||
    (data && data.vod) ||
    null;

  const vod = first || {};
  const get = (k) => (vod && vod[k] != null ? String(vod[k]) : '').trim();
  const title = get('vod_name') || get('name') || get('title');
  const poster = get('vod_pic') || get('pic') || get('poster');
  const year = get('vod_year') || get('year');
  const type = get('vod_class') || get('vod_type') || get('type_name') || get('type');
  const remark = get('vod_remarks') || get('remark');
  const content =
    get('vod_content') || get('content') || get('desc');
  const playFrom = get('vod_play_from') || get('play_from') || get('vod_playfrom') || get('vod_play_froms');
  const playUrl = get('vod_play_url') || get('play_url') || get('vod_playurl') || get('vod_play_urls');

  return { title, poster, year, type, remark, content, playFrom, playUrl };
};

const detailFetchState = { key: '', seq: 0, inFlight: null };

const contentKeyFromProps = () => {
  const t = normalizeForAggKey(props.videoTitle || '');
  const y = String(props.videoYear || '').trim();
  const ty = String(props.searchType || '').trim();
  return [t, y, ty].join('|');
};

let lastContentKey = contentKeyFromProps();

const fetchDetailForCurrentVideo = async (opts = {}) => {
  const { updateIntro = false, updateMeta = false } = opts && typeof opts === 'object' ? opts : {};
  const id = (props.videoId || '').trim();
  if (!id) return;
  const api = (resolvedSpiderApi.value || '').trim();
  if (!api) return;

  const apiBase = resolveCatApiBaseForPlay();
  const tvUser = props.bootstrap?.user?.username || '';
  const key = `${apiBase}::${tvUser}::${api}::${id}`;
  if (detailFetchState.inFlight && detailFetchState.key === key) {
    await detailFetchState.inFlight;
    return;
  }

  detailFetchState.seq += 1;
  const seqAtCall = detailFetchState.seq;
  detailFetchState.key = key;
  if (updateIntro) {
    introLoading.value = true;
    introError.value = '';
  }

  detailFetchState.inFlight = (async () => {
    try {
      const raw = await requestCatSpider({
        apiBase,
        username: tvUser,
        action: 'detail',
        spiderApi: api,
        payload: { id },
      });
      if (seqAtCall !== detailFetchState.seq) return;
      const d = extractDetailFromResponse(raw);
      const prev = detail.value && typeof detail.value === 'object' ? detail.value : {};
      const shouldUpdateMeta = !!updateMeta;
      const shouldFillMeta = !prev.title || !prev.poster || !prev.year;
      const next = {
        ...prev,
        playFrom: d.playFrom,
        playUrl: d.playUrl,
      };
      if (shouldUpdateMeta || shouldFillMeta) {
        if (d.title) next.title = d.title;
        if (d.poster) next.poster = d.poster;
        if (d.year) next.year = d.year;
        if (d.type) next.type = d.type;
        if (d.remark) next.remark = d.remark;
        if (d.content) next.content = d.content;
      }
      detail.value = next;
      if (updateIntro || !introText.value) {
        const nextIntro = (d.content || extractIntroFromDetail(raw) || introText.value || '').trim();
        if (nextIntro) introText.value = nextIntro;
      }
    } catch (e) {
      const status = e && typeof e.status === 'number' ? e.status : 0;
      const msg = (e && e.message) || '请求失败';
      if (updateIntro && seqAtCall === detailFetchState.seq) {
        introError.value = status ? `HTTP ${status}：${msg}` : msg;
      }
    } finally {
      if (updateIntro && seqAtCall === detailFetchState.seq) introLoading.value = false;
      if (detailFetchState.key === key && detailFetchState.seq === seqAtCall) detailFetchState.inFlight = null;
    }
  })();
  await detailFetchState.inFlight;
};

const searchTypeLabel = computed(() => {
  switch ((props.searchType || '').trim()) {
    case 'movie':
      return '电影';
    case 'tv':
      return '电视剧';
    case 'anime':
      return '动漫';
    case 'show':
      return '综艺';
    default:
      return '';
  }
});

const onPanDocDown = (e) => {
  if (!panDropdownOpen.value) return;
  const el = panDropdownEl.value;
  if (el && e && e.target && el.contains(e.target)) return;
  panDropdownOpen.value = false;
};

const onPanKeyDown = (e) => {
  if (!panDropdownOpen.value) return;
  if (e && e.key === 'Escape') panDropdownOpen.value = false;
};

const onEpisodeGroupDocDown = (e) => {
  if (!episodeGroupMoreOpen.value) return;
  const el = episodeGroupMoreEl.value;
  if (el && e && e.target && el.contains(e.target)) return;
  episodeGroupMoreOpen.value = false;
};

const onEpisodeGroupMoreEnter = () => {
  // Avoid opening immediately on mount when the element appears under a stationary cursor.
  if (!episodeGroupHoverArmed.value) return;
  episodeGroupMoreOpen.value = true;
};

onMounted(() => {
  initPlayPage();
  void loadResumeFromHistory();
  loadAggregatedSourcesFromStorage();

  // iPhone edge-swipe back (PWA-like behavior): swipe from left edge to go back.
  // Keep this conservative to avoid interfering with scroll/player gestures.
  try {
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    const isIphone = /iPhone|iPod/i.test(ua);
    const root = document.getElementById('playPage');
    if (isIphone && root) {
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

        // If vertical movement dominates early, cancel to preserve scrolling.
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
        if (armed && shouldGoBack) exitPlay();
        reset();
      };

      root.addEventListener('touchstart', onTouchStart, { passive: true });
      root.addEventListener('touchmove', onTouchMove, { passive: false });
      root.addEventListener('touchend', onTouchEnd, { passive: true });
      root.addEventListener('touchcancel', reset, { passive: true });
      cleanupFns.push(() => root.removeEventListener('touchstart', onTouchStart));
      cleanupFns.push(() => root.removeEventListener('touchmove', onTouchMove));
      cleanupFns.push(() => root.removeEventListener('touchend', onTouchEnd));
      cleanupFns.push(() => root.removeEventListener('touchcancel', reset));
    }
  } catch (_e) {}

  void fetchDetailForCurrentVideo({ updateIntro: !introText.value, updateMeta: true });

  // Episode panel resizer (desktop)
  try {
    const grid = document.getElementById('playGrid');
    const resizer = document.getElementById('episodePanelResizer');
    const panel = document.getElementById('episodePanel');
    if (grid && resizer && panel) {
      const STORAGE_KEY = 'tv_server_episode_panel_width';
      let dragging = false;
      let startX = 0;
      let startW = 0;
      let pendingW = 0;
      let rafId = 0;
      let currentW = 0;

      const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
      const setWidth = (w) => {
        const next = clamp(w, 220, 520);
        currentW = next;
        grid.style.setProperty('--episode-panel-width', `${next}px`);
      };

      // Restore saved width (per-browser)
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const n = raw != null ? Number(raw) : NaN;
        if (Number.isFinite(n) && n > 0) setWidth(n);
      } catch (_e) {}

      const onMove = (e) => {
        if (!dragging) return;
        const x = e && typeof e.clientX === 'number' ? e.clientX : 0;
        const dx = x - startX;
        pendingW = clamp(startW - dx, 220, 520);
        if (rafId) return;
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          setWidth(pendingW);
        });
      };

      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        try {
          if (currentW) localStorage.setItem(STORAGE_KEY, String(currentW));
        } catch (_e) {}
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        grid.classList.remove('is-resizing');
        panel.classList.remove('is-resizing');
        window.removeEventListener('mousemove', onMove, true);
        window.removeEventListener('mouseup', onUp, true);
      };

      const onDown = (e) => {
        if (grid.classList.contains('episode-panel-collapsed')) return;
        dragging = true;
        startX = e.clientX;
        startW = panel.getBoundingClientRect().width || 280;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
        grid.classList.add('is-resizing');
        panel.classList.add('is-resizing');
        window.addEventListener('mousemove', onMove, true);
        window.addEventListener('mouseup', onUp, true);
      };

      resizer.addEventListener('mousedown', onDown);
      cleanupFns.push(() => {
        try {
          onUp();
        } catch (_e) {}
        resizer.removeEventListener('mousedown', onDown);
      });
    }
  } catch (_e) {}

  // Episode grid columns adapt to available width
  try {
    const episodeButtons = document.getElementById('episodeButtons');
    if (episodeButtons) {
      const minButtonWidth = 44; // matches --episode-btn-size
      const clampCols = (v) => Math.max(3, Math.min(10, v));
      const calcCols = () => {
        const w = episodeButtons.clientWidth || 0;
        if (!w) return;
        const cs = window.getComputedStyle ? window.getComputedStyle(episodeButtons) : null;
        const gap = cs ? parseFloat(cs.columnGap || cs.gap || '12') : 12;
        const cols = clampCols(Math.floor((w + gap) / (minButtonWidth + gap)));
        episodeButtons.style.setProperty('--episode-cols', String(cols));
      };

      calcCols();
      window.addEventListener('resize', calcCols);
      cleanupFns.push(() => window.removeEventListener('resize', calcCols));
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => calcCols());
        ro.observe(episodeButtons);
        cleanupFns.push(() => ro.disconnect());
      }
    }
  } catch (_e) {}

  document.addEventListener('mousedown', onPanDocDown, true);
  document.addEventListener('keydown', onPanKeyDown, true);
  document.addEventListener('mousedown', onEpisodeGroupDocDown, true);
  cleanupFns.push(() => document.removeEventListener('mousedown', onEpisodeGroupDocDown, true));

  // Keep episode panel height aligned to the 16:9 player height on desktop,
  // and prevent tall episode lists from expanding the whole page.
  try {
    const playerBox = document.querySelector('.play-video-ratio');
    const panel = document.getElementById('episodePanel');
    if (playerBox && panel && typeof ResizeObserver !== 'undefined') {
      const apply = () => {
        try {
          if (window.innerWidth < 768) {
            panel.style.removeProperty('height');
            return;
          }
          const h = playerBox.getBoundingClientRect().height;
          if (!h) return;
          panel.style.height = `${Math.round(h)}px`;
        } catch (_e) {}
      };
      // Apply a few times to cover first render/layout & async font/layout shifts.
      apply();
      window.requestAnimationFrame(() => apply());
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => apply()));
      const ro = new ResizeObserver(() => apply());
      ro.observe(playerBox);
      window.addEventListener('resize', apply);
      cleanupFns.push(() => ro.disconnect());
      cleanupFns.push(() => window.removeEventListener('resize', apply));
    }
  } catch (_e) {}

  // Episode group overflow (hover dropdown for hidden group tabs)
	  try {
	    const el = episodeGroupTabsEl.value;
	    if (el) {
	      const onResize = () => scheduleUpdateHiddenEpisodeGroups();
	      const onScroll = () => scheduleUpdateHiddenEpisodeGroups();
	      window.addEventListener('resize', onResize);
	      el.addEventListener('scroll', onScroll, { passive: true });
	      cleanupFns.push(() => window.removeEventListener('resize', onResize));
	      cleanupFns.push(() => el.removeEventListener('scroll', onScroll));

      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => onResize());
        ro.observe(el);
        cleanupFns.push(() => ro.disconnect());
      }

	      scheduleUpdateHiddenEpisodeGroups();
	    }
	  } catch (_e) {}

  // Arm hover-open behavior after the first real mouse move (prevents default-open on mount).
  try {
    const arm = () => {
      episodeGroupHoverArmed.value = true;
      document.removeEventListener('mousemove', arm, true);
    };
    document.addEventListener('mousemove', arm, true);
    cleanupFns.push(() => document.removeEventListener('mousemove', arm, true));
  } catch (_e) {}

  // Player prev/next episode buttons
  try {
    const onEpisodeDelta = (e) => {
      const delta = e && e.detail ? Number(e.detail.delta) : 0;
      if (!Number.isFinite(delta) || delta === 0) return;
      const total = selectedEpisodes.value.length;
      if (!total) return;
      const next = Math.max(0, Math.min(total - 1, selectedEpisodeIndex.value + (delta > 0 ? 1 : -1)));
      if (next === selectedEpisodeIndex.value) return;
      selectEpisode(next);
    };
    window.addEventListener('tvplayer:episode', onEpisodeDelta);
    cleanupFns.push(() => window.removeEventListener('tvplayer:episode', onEpisodeDelta));
  } catch (_e) {}
});

watch(
  () => displayTitle.value,
  () => {
    if (sourcesLoading.value) return;
    loadAggregatedSourcesFromStorage();
  }
);

watch(
  () => activeTab.value,
  (v) => {
    if (v !== 'sources') return;
    if (sourcesLoading.value) return;
    // If we already have sources from search storage, do not auto-fetch.
    if (aggregatedSources.value && aggregatedSources.value.length) return;
    // Avoid repeatedly spamming search when users just toggle tabs.
    if (sourcesSearchedOnce.value) return;
    void fetchAggregatedSourcesExactMatches();
  }
);

watch(
  () => [props.siteKey, props.videoId].join('|'),
  () => {
    initialAutoPlayTriggered.value = false;
    resumeHistoryState.seq += 1;
    detailFetchState.seq += 1;
    const nextContentKey = contentKeyFromProps();
    const isNewContent = !!nextContentKey && nextContentKey !== lastContentKey;
    lastContentKey = nextContentKey;

    invalidateSourcesSearch();
    sourcesSearchedOnce.value = false;
    sourcesError.value = '';

    const prevIdx = Number.isFinite(selectedEpisodeIndex.value) ? Math.floor(selectedEpisodeIndex.value) : 0;
    if (isNewContent) {
      resetForNewVideo();
      loadAggregatedSourcesFromStorage();
      void fetchDetailForCurrentVideo({ updateIntro: true, updateMeta: true });
    } else {
      resetForNewSource();
      selectedEpisodeIndex.value = prevIdx >= 0 ? prevIdx : 0;
      void fetchDetailForCurrentVideo({ updateIntro: false, updateMeta: false });
    }
    void loadResumeFromHistory();
  }
);

onBeforeUnmount(() => {
  invalidateSourcesSearch();
  resumeHistoryState.seq += 1;
  try {
    if (hiddenEpisodeGroupsRaf) cancelAnimationFrame(hiddenEpisodeGroupsRaf);
    hiddenEpisodeGroupsRaf = 0;
  } catch (_e) {}
  cleanupFns.splice(0).forEach((fn) => {
    try {
      fn();
    } catch (_e) {}
  });
  document.removeEventListener('mousedown', onPanDocDown, true);
  document.removeEventListener('keydown', onPanKeyDown, true);
  document.removeEventListener('mousedown', onEpisodeGroupDocDown, true);
});

watch(
  () => panOptions.value.map((o) => o.key).join(','),
  () => {
    const first = panOptions.value[0]?.key || '';
    if (!first) {
      selectedPan.value = '';
      return;
    }
    if (!selectedPan.value) {
      selectedPan.value = first;
      return;
    }
    const exists = panOptions.value.some((o) => o && o.key === selectedPan.value);
    if (!exists) selectedPan.value = first;
  }
);
</script>

<style>
@media (min-width: 768px) {
  #playGrid {
    grid-template-columns: minmax(0, 1fr) var(--episode-panel-width, 280px);
  }

  #playGrid.episode-panel-collapsed {
    grid-template-columns: minmax(0, 1fr);
  }

  #playerArea {
    grid-column: 1 / 2 !important;
  }

  #episodePanel {
    grid-column: 2 / 3 !important;
    min-height: 0;
  }

  #playGrid.episode-panel-collapsed #playerArea {
    grid-column: 1 / -1 !important;
  }

  #episodeButtons {
    display: grid;
    grid-template-columns: repeat(var(--episode-cols, 5), var(--episode-btn-size, 44px));
    justify-content: start;
  }
}

.episode-num-btn {
  width: var(--episode-btn-size, 44px);
  height: var(--episode-btn-size, 44px);
  padding: 0;
}

.play-video-ratio {
  position: relative;
  width: 100%;
  background: #000;
  min-height: 240px;
}

.play-video-ratio::before {
  content: "";
  display: block;
  padding-top: 56.25%;
}

.play-video-ratio__inner {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* iOS Safari: videos can go "audio-only black screen" when their parent clips (border-radius + overflow hidden).
   On iOS, avoid clipping the video element; keep layout responsive without relying on fixed pixels. */
@supports (-webkit-touch-callout: none) {
  .play-video-ratio {
    border-radius: 0 !important;
    overflow: visible !important;
    box-shadow: none !important;
  }
}

.episode-season-bar {
  margin-bottom: 10px;
}

.episode-season-tabs,
.episode-group-tabs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 0;
  scrollbar-width: none;
}

.episode-season-tabs::-webkit-scrollbar,
.episode-group-tabs::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.episode-season-btn,
.episode-group-btn {
  flex: 0 0 auto;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.04);
  color: rgba(107, 114, 128, 1);
  font-size: 12px;
  font-weight: 700;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}

.episode-season-btn:hover,
.episode-group-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.episode-season-btn[data-active='true'],
.episode-group-btn[data-active='true'] {
  background: rgba(34, 197, 94, 0.16);
  border-color: rgba(34, 197, 94, 0.4);
  color: rgba(22, 163, 74, 1);
}

.dark .episode-season-btn,
.dark .episode-group-btn {
  background: rgba(255, 255, 255, 0.06);
}

.dark .episode-season-btn {
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(209, 213, 219, 1);
}

.dark .episode-season-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.episode-group-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.episode-group-tabs {
  flex: 1 1 auto;
  min-width: 0;
}

.episode-group-more {
  position: static;
  flex: 0 0 auto;
}

.episode-group-more__btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.6);
  color: rgba(55, 65, 81, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.episode-group-more__btn:hover {
  background: rgba(255, 255, 255, 0.8);
}

.episode-group-more__menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow: auto;
  padding: 8px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
  z-index: 60;
  display: none;
}

.episode-group-more__menu.episode-group-more__menu--open {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.episode-group-more__item {
  width: 100%;
  height: 34px;
  border-radius: 12px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: rgba(31, 41, 55, 1);
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  white-space: nowrap;
}

.episode-group-more__item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.episode-group-more__item[data-active='true'] {
  background: rgba(34, 197, 94, 0.16);
  border-color: rgba(34, 197, 94, 0.4);
  color: rgba(21, 128, 61, 1);
}

.dark .episode-group-btn {
  border-color: rgba(255, 255, 255, 0.14);
  color: rgba(156, 163, 175, 1);
}

.dark .episode-group-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dark .episode-season-btn[data-active='true'],
.dark .episode-group-btn[data-active='true'] {
  background: rgba(34, 197, 94, 0.18);
  color: rgba(74, 222, 128, 1);
}

.dark .episode-season-btn[data-active='true'] {
  border-color: rgba(34, 197, 94, 0.42);
}

.dark .episode-group-btn[data-active='true'] {
  border-color: rgba(34, 197, 94, 0.55);
}

.dark .episode-group-more__btn {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(229, 231, 235, 1);
  box-shadow: none;
}

.dark .episode-group-more__menu {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55);
}

.dark .episode-group-more__item {
  color: rgba(229, 231, 235, 1);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .episode-group-more__item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dark .episode-group-more__item[data-active='true'] {
  background: rgba(34, 197, 94, 0.18);
  border-color: rgba(34, 197, 94, 0.55);
  color: rgba(74, 222, 128, 1);
}

.episode-resizer {
  position: absolute;
  left: -14px;
  top: 10px;
  bottom: 10px;
  width: 28px;
  cursor: col-resize;
  z-index: 20;
}

.episode-resizer::before {
  content: "";
  position: absolute;
  left: 13px;
  top: 0;
  bottom: 0;
  width: 2px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.14);
  opacity: 0;
  transition: opacity 0.15s ease, background-color 0.15s ease;
}

.episode-resizer:hover::before {
  opacity: 0.9;
}

.dark .episode-resizer::before {
  background: rgba(255, 255, 255, 0.22);
}

#playGrid.is-resizing,
#episodePanel.is-resizing {
  transition: none !important;
}

#playGrid.episode-panel-collapsed .episode-resizer {
  display: none;
}

.episode-control {
  height: 34px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.65);
  color: rgba(55, 65, 81, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  font-size: 13px;
  font-weight: 500;
}

.episode-control:hover {
  background: rgba(255, 255, 255, 0.78);
}

.episode-control:focus {
  outline: none;
  border-color: rgba(34, 197, 94, 0.55);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.16), 0 1px 2px rgba(0, 0, 0, 0.06);
}

.episode-control--btn {
  padding: 0 12px;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.episode-control--btn[data-active='true'] {
  border-color: rgba(34, 197, 94, 0.45);
  background: rgba(34, 197, 94, 0.12);
  color: rgba(17, 24, 39, 1);
}

.episode-control--btn:hover {
  background: rgba(255, 255, 255, 0.78);
}

.episode-control--btn:active {
  transform: translateY(1px);
}

.dark .episode-control {
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.07);
  color: rgba(229, 231, 235, 1);
  box-shadow: none;
}

.dark .episode-control:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dark .episode-control--btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dark .episode-control--btn[data-active='true'] {
  border-color: rgba(34, 197, 94, 0.55);
  background: rgba(34, 197, 94, 0.18);
  color: rgba(243, 244, 246, 1);
}

.dark .episode-control:focus {
  border-color: rgba(34, 197, 94, 0.6);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.22);
}

#episodeSelector {
  overflow-x: hidden;
  overflow-y: visible;
}

.episode-tab-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.06);
}

.dark .episode-tab-header {
  background: rgba(255, 255, 255, 0.06);
}

.play-pan-dropdown .custom-dropdown-btn {
  padding: 8px 12px;
  border-radius: 12px;
  height: 34px;
  line-height: 18px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .play-pan-dropdown .custom-dropdown-btn {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.16);
  color: rgba(229, 231, 235, 1);
  box-shadow: none;
}

.dark .play-pan-dropdown .custom-dropdown-list {
  background: #0f172a;
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
}

.dark .play-pan-dropdown .custom-dropdown-item {
  color: rgba(229, 231, 235, 1);
}

.dark .play-pan-dropdown .custom-dropdown-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.dark .play-pan-dropdown .custom-dropdown-item.active {
  background: rgba(34, 197, 94, 0.16);
  color: rgba(74, 222, 128, 1);
}

.play-pan-dropdown .custom-dropdown-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.play-detail__inner {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.play-detail__poster {
  flex: 0 0 200px;
}

.play-detail__posterWrap {
  position: relative;
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);
  aspect-ratio: 2 / 3;
}

.play-detail__posterSkeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.08) 50%, rgba(0, 0, 0, 0.04) 100%);
  background-size: 200% 100%;
  animation: play-skeleton 1.2s ease-in-out infinite;
}

.play-detail__posterImg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-detail__posterFallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(107, 114, 128, 1);
  font-size: 13px;
}

.play-detail__info {
  flex: 1 1 auto;
  min-width: 0;
}

.play-detail__titleRow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.play-detail__favBtn {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: rgba(255, 255, 255, 0.72);
  color: rgba(71, 85, 105, 1);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
}
.play-detail__favBtn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
}
.play-detail__favBtn.is-active {
  border-color: rgba(236, 72, 153, 0.35);
  color: rgba(236, 72, 153, 1);
}
.dark .play-detail__favBtn {
  background: rgba(15, 23, 42, 0.55);
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(226, 232, 240, 1);
  box-shadow: none;
}
.dark .play-detail__favBtn:hover {
  background: rgba(15, 23, 42, 0.75);
}
.dark .play-detail__favBtn.is-active {
  border-color: rgba(244, 114, 182, 0.35);
  color: rgba(244, 114, 182, 1);
}

.play-detail__title {
  flex: 0 1 auto;
  min-width: 0;
  max-width: calc(100% - 54px);
  font-size: 26px;
  line-height: 1.2;
  font-weight: 800;
  color: rgba(17, 24, 39, 1);
  letter-spacing: -0.02em;
  margin: 0;
}

.play-detail__meta {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.play-pill {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(55, 65, 81, 1);
  background: rgba(0, 0, 0, 0.06);
}

.play-detail__desc {
  margin-top: 14px;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(31, 41, 55, 0.92);
}

@media (max-width: 768px) {
  .play-detail__inner {
    flex-direction: column;
  }
  .play-detail__poster {
    flex-basis: auto;
    width: 220px;
  }
  .play-detail__title {
    font-size: 22px;
  }
}

.dark .play-detail__posterWrap {
  background: rgba(255, 255, 255, 0.06);
}

.dark .play-detail__posterSkeleton {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.06) 100%);
  background-size: 200% 100%;
}

.dark .play-detail__posterFallback {
  color: rgba(156, 163, 175, 1);
}

.dark .play-detail__title {
  color: rgba(243, 244, 246, 1);
}

.dark .play-pill {
  color: rgba(229, 231, 235, 1);
  background: rgba(255, 255, 255, 0.08);
}

.dark .play-detail__desc {
  color: rgba(229, 231, 235, 0.9);
}

@keyframes play-skeleton {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

.raw-list__hint {
  padding: 10px 8px;
  font-size: 13px;
  color: rgba(107, 114, 128, 1);
  text-align: center;
}

.raw-list__hint--error {
  color: rgba(239, 68, 68, 1);
}

.raw-list__items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.raw-list__row {
  cursor: pointer;
  appearance: none;
  outline: none;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.55);
  color: rgba(31, 41, 55, 1);
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.raw-list__row:hover {
  background: rgba(255, 255, 255, 0.72);
}

.raw-list__text {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
}

.raw-list__row--active {
  border-color: rgba(34, 197, 94, 0.45);
  background: rgba(34, 197, 94, 0.12);
}

.source-card--active {
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.source-card--idle {
  cursor: pointer;
}

.source-card--idle:hover {
  background: rgba(0, 0, 0, 0.04);
}

.dark .source-card--active {
  background: rgba(34, 197, 94, 0.18);
  border-color: rgba(34, 197, 94, 0.28);
}

.dark .source-card--idle:hover {
  background: rgba(255, 255, 255, 0.08);
}

.source-card__cover {
  background: rgba(0, 0, 0, 0.06);
}

.dark .source-card__cover {
  background: rgba(255, 255, 255, 0.08);
}

.source-more-btn {
  width: 100%;
  height: 40px;
  border-radius: 12px;
  border: 1px dashed rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.45);
  color: rgba(107, 114, 128, 1);
  font-size: 13px;
  font-weight: 700;
}

.dark .source-more-btn {
  border-color: rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(156, 163, 175, 1);
}

.dark .raw-list__hint {
  color: rgba(156, 163, 175, 1);
}

.dark .raw-list__row {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(229, 231, 235, 1);
  box-shadow: none;
}

.dark .raw-list__row:hover {
  background: rgba(255, 255, 255, 0.09);
}

.dark .raw-list__row--active {
  border-color: rgba(34, 197, 94, 0.55);
  background: rgba(34, 197, 94, 0.18);
}

.tv-spinner {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: rgba(255, 255, 255, 0.95);
  animation: tvspin 0.9s linear infinite;
}

@keyframes tvspin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.tv-center-loading {
  flex: 1;
  min-height: 120px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 0;
  color: rgba(107, 114, 128, 1);
}

.dark .tv-center-loading {
  color: rgba(156, 163, 175, 1);
}

.tv-center-loading__text {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.tv-episode-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  color: rgba(107, 114, 128, 1);
}

.dark .tv-episode-overlay {
  color: rgba(156, 163, 175, 1);
}

.tv-episode-overlay__inner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}

.play-player-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.play-player-overlay__badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 9999px;
  background: rgba(0, 0, 0, 0.58);
  color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
}

.play-player-overlay--error .play-player-overlay__badge {
  background: rgba(0, 0, 0, 0.62);
  color: rgba(255, 200, 200, 0.95);
}

.play-player-overlay__icon {
  width: 18px;
  height: 18px;
  opacity: 0.9;
}

.play-player-overlay__text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

</style>
