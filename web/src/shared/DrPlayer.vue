<template>
  <div
    class="tv-drplayer"
    :class="{ 'tv-drplayer--fullscreen': isFullscreen, 'tv-drplayer--mobile': isMobile }"
    ref="shell"
  >
    <div ref="container" class="drplayer-root" />

    <teleport :to="teleportTarget || 'body'" :disabled="!teleportTarget">
      <!-- Buffering ring -->
      <div v-if="buffering" class="m-buffer-ring" aria-hidden="true"></div>

      <div class="yt-ui" :class="{ 'yt-ui--show': overlayVisible }">
      <div v-if="!isMobile" class="yt-bar" @click.stop @mousedown.stop @touchstart.stop>
        <div class="yt-progress">
          <div class="yt-progress__track" aria-hidden="true">
            <div class="yt-progress__fill" :style="{ '--yt-progress-p': progressFrac }" />
          </div>
          <input
            class="yt-progress__range"
            type="range"
            min="0"
            :max="Math.max(duration, 0)"
            step="0.1"
            :value="Math.min(currentTime, duration)"
            :disabled="!duration"
            @mousedown.stop
            @click.stop
            @input="onSeek"
          />
        </div>
        <div class="yt-row">
          <div class="yt-pill yt-left">
            <button class="yt-btn" type="button" :aria-label="playing ? '暂停' : '播放'" @click.stop="togglePlay">
              <svg viewBox="0 0 24 24" class="yt-ico">
                <template v-if="playing">
                  <path fill="currentColor" d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
                </template>
                <template v-else>
                  <path fill="currentColor" d="M8 5v14l11-7L8 5z" />
                </template>
              </svg>
            </button>

            <button class="yt-btn" type="button" aria-label="上一集" @click.stop="emitEpisodeDelta(-1)">
              <svg viewBox="0 0 24 24" class="yt-ico">
                <path fill="currentColor" d="M6 6h2v12H6V6zm3.5 6L18 6v12l-8.5-6z" />
              </svg>
            </button>
            <button class="yt-btn" type="button" aria-label="下一集" @click.stop="emitEpisodeDelta(1)">
              <svg viewBox="0 0 24 24" class="yt-ico">
                <path fill="currentColor" d="M16 6h2v12h-2V6zM6 18V6l8.5 6L6 18z" />
              </svg>
            </button>

            <div class="yt-volume" @mouseenter="volumeHover = true" @mouseleave="volumeHover = false">
              <button class="yt-btn" type="button" :aria-label="muted ? '取消静音' : '静音'" @click.stop="toggleMute">
                <svg viewBox="0 0 24 24" class="yt-ico">
                  <template v-if="muted || volume <= 0.01">
                    <path
                      fill="currentColor"
                      d="M16.5 12a4.5 4.5 0 0 0-1.17-3.02l-1.42 1.42A2.5 2.5 0 0 1 14.5 12c0 .68-.27 1.3-.7 1.76l1.42 1.42A4.5 4.5 0 0 0 16.5 12z"
                      opacity="0.0"
                    />
                    <path
                      fill="currentColor"
                      d="M3 10v4h4l5 5V5L7 10H3zm13.59 2 2.7 2.7-1.41 1.41L15.18 13l-2.7 2.7-1.41-1.41 2.7-2.7-2.7-2.7 1.41-1.41 2.7 2.7 2.7-2.7 1.41 1.41-2.7 2.7z"
                    />
                  </template>
                  <template v-else>
                    <path
                      fill="currentColor"
                      d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12z"
                    />
                  </template>
                </svg>
              </button>
              <div class="yt-volume__slider" :data-show="volumeHover ? 'true' : 'false'">
                <input
                  class="yt-volume__range"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  :value="muted ? 0 : volume"
                  @mousedown.stop
                  @click.stop
                  @input.stop="onVolume"
                />
              </div>
            </div>

            <div class="yt-time">{{ timeLabel }}</div>
          </div>

          <div class="yt-pill yt-right">
            <button
              class="yt-btn"
              type="button"
              :aria-label="isPip ? '退出画中画' : '画中画'"
              :data-active="isPip ? 'true' : 'false'"
              @click.stop="togglePip"
            >
              <svg viewBox="0 0 24 24" class="yt-ico">
                <template v-if="!isPip">
                  <path
                    fill="currentColor"
                    d="M19 7H5v10h14V7zm0-2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14z"
                    opacity="0.55"
                  />
                  <path fill="currentColor" d="M13 11h6v4h-6v-4z" />
                </template>
                <template v-else>
                  <path
                    fill="currentColor"
                    d="M19 7H5v10h14V7zm0-2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14z"
                    opacity="0.55"
                  />
                  <path fill="currentColor" d="M14 10h-4v4h4v-4z" />
                </template>
              </svg>
            </button>

            <div class="yt-setting" ref="settingEl">
              <button class="yt-btn" type="button" aria-label="设置" @click.stop="settingsOpen = !settingsOpen">
                <svg viewBox="0 0 24 24" class="yt-ico">
                  <path
                    fill="currentColor"
                    d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.027 7.027 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.22-1.12.52-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 7.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.52a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.41 1.05.72 1.63.94l.36 2.54a.5.5 0 0 0 .49.42h3.8a.5.5 0 0 0 .49-.42l.36-2.54c.58-.22 1.12-.52 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z"
                  />
                </svg>
              </button>
              <div class="yt-setting__menu" :class="{ 'yt-setting__menu--open': settingsOpen }">
                <div class="yt-setting__section">
                  <div class="yt-setting__title">播放速度</div>
                  <div class="yt-setting__grid">
                    <button
                      v-for="r in rates"
                      :key="r"
                      type="button"
                      class="yt-setting__item"
                      :data-active="Math.abs(playbackRate - r) < 0.001 ? 'true' : 'false'"
                      @click="setRate(r)"
                    >
                      {{ r }}x
                    </button>
                  </div>
                </div>
                <div class="yt-setting__section">
                  <div class="yt-setting__title">画面比例</div>
                  <div class="yt-setting__grid">
                    <button
                      v-for="a in ratios"
                      :key="a"
                      type="button"
                      class="yt-setting__item"
                      :data-active="aspectRatio === a ? 'true' : 'false'"
                      @click="setRatio(a)"
                    >
                      {{ a === 'default' ? '默认' : a }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              class="yt-btn"
              type="button"
              :aria-label="isFullscreen ? '退出全屏' : '全屏'"
              @click.stop="toggleFullscreen"
            >
              <svg viewBox="0 0 24 24" class="yt-ico">
                <template v-if="!isFullscreen">
                  <path
                    fill="currentColor"
                    d="M7 7h3V5H5v5h2V7zm10 0v3h2V5h-5v2h3zm-7 12H7v-3H5v5h5v-2zm9-3h-2v3h-3v2h5v-5z"
                  />
                </template>
                <template v-else>
                  <path
                    fill="currentColor"
                    d="M5 16h3v3h2v-5H5v2zm0-6h5V5H8v3H5v2zm14 6v-2h-5v5h2v-3h3zm-5-11v5h5V8h-3V5h-2z"
                  />
                </template>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div v-else class="m-bar" @click.stop @mousedown.stop @touchstart.stop>
        <div class="yt-setting m-setting" ref="settingEl">
          <button class="yt-btn" type="button" aria-label="设置" @click.stop="settingsOpen = !settingsOpen">
            <svg viewBox="0 0 24 24" class="yt-ico">
              <path
                fill="currentColor"
                d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.027 7.027 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.22-1.12.52-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 7.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.83 14.52a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.41 1.05.72 1.63.94l.36 2.54a.5.5 0 0 0 .49.42h3.8a.5.5 0 0 0 .49-.42l.36-2.54c.58-.22 1.12-.52 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z"
              />
            </svg>
          </button>
          <div class="yt-setting__menu" :class="{ 'yt-setting__menu--open': settingsOpen }">
            <div class="yt-setting__section">
              <div class="yt-setting__title">播放速度</div>
              <div class="yt-setting__grid">
                <button
                  v-for="r in rates"
                  :key="r"
                  type="button"
                  class="yt-setting__item"
                  :data-active="Math.abs(playbackRate - r) < 0.001 ? 'true' : 'false'"
                  @click="setRate(r)"
                >
                  {{ r }}x
                </button>
              </div>
            </div>
            <div class="yt-setting__section">
              <div class="yt-setting__title">画面比例</div>
              <div class="yt-setting__grid">
                <button
                  v-for="a in ratios"
                  :key="a"
                  type="button"
                  class="yt-setting__item"
                  :data-active="aspectRatio === a ? 'true' : 'false'"
                  @click="setRatio(a)"
                >
                  {{ a === 'default' ? '默认' : a }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="yt-progress m-progress">
          <div class="yt-progress__track" aria-hidden="true">
            <div class="yt-progress__fill" :style="{ '--yt-progress-p': progressFrac }" />
          </div>
          <input
            class="yt-progress__range"
            type="range"
            min="0"
            :max="Math.max(duration, 0)"
            step="0.1"
            :value="Math.min(currentTime, duration)"
            :disabled="!duration"
            @mousedown.stop
            @click.stop
            @input="onSeek"
          />
        </div>

        <button class="yt-btn m-fullscreen" type="button" :aria-label="isFullscreen ? '退出全屏' : '全屏'" @click.stop="toggleFullscreen">
          <svg viewBox="0 0 24 24" class="yt-ico">
            <template v-if="!isFullscreen">
              <path fill="currentColor" d="M7 7h3V5H5v5h2V7zm10 0v3h2V5h-5v2h3zm-7 12H7v-3H5v5h5v-2zm9-3h-2v3h-3v2h5v-5z" />
            </template>
            <template v-else>
              <path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm0-6h5V5H8v3H5v2zm14 6v-2h-5v5h2v-3h3zm-5-11v5h5V8h-3V5h-2z" />
            </template>
          </svg>
        </button>

        <div class="m-center" :class="{ 'm-center--show': uiVisible || !playing }">
          <div class="m-center__controls" @click.stop @mousedown.stop @touchstart.stop>
            <button class="m-btn m-btn--skip" type="button" aria-label="上一集" @click.stop="emitEpisodeDelta(-1)">
              <svg viewBox="0 0 24 24" class="m-ico">
                <path fill="currentColor" d="M6 6h2v12H6V6zm3.5 6L18 6v12l-8.5-6z" />
              </svg>
            </button>
            <button
              class="m-btn m-btn--play"
              type="button"
              :data-loading="buffering ? 'true' : 'false'"
              :aria-label="playing ? '暂停' : '播放'"
              @click.stop="togglePlay"
            >
              <svg viewBox="0 0 24 24" class="m-ico m-ico--play">
                <template v-if="playing">
                  <path fill="currentColor" d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
                </template>
                <template v-else>
                  <path fill="currentColor" d="M8 5v14l11-7L8 5z" />
                </template>
              </svg>
            </button>
            <button class="m-btn m-btn--skip" type="button" aria-label="下一集" @click.stop="emitEpisodeDelta(1)">
              <svg viewBox="0 0 24 24" class="m-ico">
                <path fill="currentColor" d="M16 6h2v12h-2V6zM6 18V6l8.5 6L6 18z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
	import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
	import Artplayer from 'artplayer';

	const emit = defineEmits(['loadedmetadata', 'error']);

const props = defineProps({
  url: { type: String, default: '' },
  poster: { type: String, default: '' },
  headers: { type: Object, default: () => ({}) },
  title: { type: String, default: '' },
  autoplay: { type: Boolean, default: true },
});

const container = ref(null);
const shell = ref(null);
const settingEl = ref(null);
const teleportTarget = ref(null);

let art = null;
let cleanupPipListeners = null;
let cleanupFsListeners = null;
let cleanupNativeVideoListeners = null;
let cleanupPlayerElListeners = null;
let cleanupNoCorsEnforcer = null;

let timeUpdateRaf = 0;
let timeUpdatePending = 0;

const playing = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.7);
const muted = ref(false);
const buffering = ref(false);
const playbackRate = ref(1);
const aspectRatio = ref('default');
const settingsOpen = ref(false);
const volumeHover = ref(false);
const uiVisible = ref(true);
const desktopControlsVisible = ref(true);
const isFullscreen = ref(false);
const isPip = ref(false);
const isMobile = ref(false);
const isIos = ref(false);
const overlayVisible = computed(() => {
  if (isMobile.value) return uiVisible.value || !playing.value || settingsOpen.value;
  return desktopControlsVisible.value || settingsOpen.value || !playing.value;
});

let mediaQuery = null;
const updateIsMobile = () => {
  try {
    if (typeof window === 'undefined') return;
    const ua = typeof navigator !== 'undefined' && navigator.userAgent ? String(navigator.userAgent) : '';
    const touch =
      (typeof navigator !== 'undefined' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0) ||
      ('ontouchstart' in window);
    const ios = /iPad|iPhone|iPod/i.test(ua) || (!!touch && /Macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1);
    const android = /Android/i.test(ua);
    const uaMobile = /\bMobile\b/i.test(ua);
    const coarse =
      typeof window.matchMedia === 'function' ? window.matchMedia('(hover: none) and (pointer: coarse)').matches : false;
    // Avoid mis-detecting desktop browsers (including touchscreen laptops). Prefer UA-based mobile,
    // then fall back to the "coarse pointer + touch" heuristic.
    isIos.value = !!ios;
    isMobile.value = !!(ios || android || uaMobile || (coarse && touch));
  } catch (_e) {
    isMobile.value = false;
    isIos.value = false;
  }
};

const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
const ratios = ['default', '16:9', '4:3'];

const formatTime = (sec) => {
  const s = Number.isFinite(sec) ? Math.max(0, Math.floor(sec)) : 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  return `${m}:${String(ss).padStart(2, '0')}`;
};

const timeLabel = computed(() => `${formatTime(currentTime.value)} / ${formatTime(duration.value)}`);
const progressFrac = computed(() => {
  const d = Number(duration.value);
  const t = Number(currentTime.value);
  if (!Number.isFinite(d) || d <= 0) return 0;
  if (!Number.isFinite(t) || t <= 0) return 0;
  return Math.max(0, Math.min(1, t / d));
});

const isUiControlTarget = (target) => {
  if (!target || typeof target.closest !== 'function') return false;
  return !!target.closest(
    [
      '.yt-bar',
      '.yt-setting',
      '.yt-setting__menu',
      '.yt-setting__item',
      '.yt-progress',
      '.yt-progress__range',
      '.yt-btn',
      '.m-center__controls',
      '.m-btn',
    ].join(',')
  );
};

const detectVideoFormat = (url) => {
  const u = typeof url === 'string' ? url.toLowerCase() : '';
  if (!u) return 'native';
  if (u.includes('.m3u8') || u.includes('m3u8')) return 'hls';
  if (u.includes('.flv') || u.includes('flv')) return 'flv';
  if (u.includes('.mpd') || u.includes('mpd')) return 'dash';
  return 'native';
};

	const destroyCustomPlayer = (player) => {
	  if (!player) return;
	  try {
	    if (player.hls && typeof player.hls.destroy === 'function') player.hls.destroy();
	  } catch (_) {}
	  try {
	    if (player.flv && typeof player.flv.destroy === 'function') player.flv.destroy();
	  } catch (_) {}
	  try {
	    if (player.dash && typeof player.dash.destroy === 'function') player.dash.destroy();
	  } catch (_) {}
	};

	let hlsModulePromise = null;
	let flvModulePromise = null;
	let shakaModulePromise = null;

	const loadHls = async () => {
	  if (!hlsModulePromise) {
	    hlsModulePromise = import('hls.js').then((m) => (m && (m.default || m)));
	  }
	  return await hlsModulePromise;
	};

	const loadFlv = async () => {
	  if (!flvModulePromise) {
	    flvModulePromise = import('flv.js').then((m) => (m && (m.default || m)));
	  }
	  return await flvModulePromise;
	};

	const loadShaka = async () => {
	  if (!shakaModulePromise) {
	    shakaModulePromise = import('shaka-player/dist/shaka-player.compiled').then((m) => (m && (m.default || m)));
	  }
	  return await shakaModulePromise;
	};

	const destroyNow = () => {
  try {
    settingsOpen.value = false;
  } catch (_e) {}
  try {
    buffering.value = false;
  } catch (_e) {}
  try {
    if (timeUpdateRaf) window.cancelAnimationFrame(timeUpdateRaf);
  } catch (_e) {}
  timeUpdateRaf = 0;
  timeUpdatePending = 0;
  try {
    if (hideTimer) window.clearTimeout(hideTimer);
    hideTimer = 0;
    if (desktopHideTimer) window.clearTimeout(desktopHideTimer);
    desktopHideTimer = 0;
  } catch (_e) {}

  try {
    // Exit PiP if the current video is in PiP.
    const videoEl = art && art.video ? art.video : null;
    if (videoEl && typeof document !== 'undefined' && document.pictureInPictureElement === videoEl) {
      document.exitPictureInPicture().catch(() => {});
    }
  } catch (_e) {}

  try {
    // Exit fullscreen if we own it.
    const el = shell.value;
    const fsEl = typeof document !== 'undefined' ? document.fullscreenElement : null;
    if (el && fsEl && (fsEl === el || el.contains(fsEl) || fsEl.contains(el))) {
      document.exitFullscreen().catch(() => {});
    }
  } catch (_e) {}

	  try {
	    if (typeof cleanupPipListeners === 'function') cleanupPipListeners();
	  } catch (_e) {}
	  cleanupPipListeners = null;
	  try {
	    if (typeof cleanupFsListeners === 'function') cleanupFsListeners();
	  } catch (_e) {}
	  cleanupFsListeners = null;
	  try {
	    if (typeof cleanupNoCorsEnforcer === 'function') cleanupNoCorsEnforcer();
	  } catch (_e) {}
	  cleanupNoCorsEnforcer = null;
	  try {
	    if (typeof cleanupNativeVideoListeners === 'function') cleanupNativeVideoListeners();
	  } catch (_e) {}
	  cleanupNativeVideoListeners = null;
	  try {
	    if (typeof cleanupPlayerElListeners === 'function') cleanupPlayerElListeners();
	  } catch (_e) {}
	  cleanupPlayerElListeners = null;

  try {
    const v = art && art.video ? art.video : null;
    if (v) {
      try {
        v.pause();
      } catch (_e) {}
      try {
        v.removeAttribute('src');
      } catch (_e) {}
      try {
        while (v.firstChild) v.removeChild(v.firstChild);
      } catch (_e) {}
      try {
        v.load();
      } catch (_e) {}
    }
  } catch (_e) {}

  try {
    destroyCustomPlayer(art && art.customPlayer ? art.customPlayer : null);
  } catch (_e) {}

  try {
    if (art && typeof art.destroy === 'function') {
      // Use "remove" mode to detach DOM and stop playback aggressively.
      art.destroy(true);
    }
  } catch (_e) {
    try {
      if (art && typeof art.destroy === 'function') art.destroy(false);
    } catch (__e) {}
  }
  art = null;
  teleportTarget.value = null;
  isPip.value = false;
  playing.value = false;
};

	const createCustomPlayer = {
	  async hls(videoEl, url, headers) {
	    const Hls = await loadHls();
	    if (!Hls || !Hls.isSupported || !Hls.isSupported()) return null;
	    const withCredentials = false;
	    const hls = new Hls({
      // Reduce reconnect/retry attempts to avoid long "reconnecting" loops on unstable networks.
      manifestLoadingMaxRetry: 2,
      levelLoadingMaxRetry: 2,
      fragLoadingMaxRetry: 2,
      keyLoadingMaxRetry: 2,
      xhrSetup(xhr) {
        xhr.withCredentials = withCredentials;
        if (!headers || typeof headers !== 'object') return;
        Object.keys(headers).forEach((k) => {
          const v = headers[k];
          if (v == null) return;
          try {
            xhr.setRequestHeader(k, String(v));
          } catch (_) {}
        });
      },
    });
	    hls.loadSource(url);
	    hls.attachMedia(videoEl);
	    return { hls };
	  },
	  async flv(videoEl, url, headers) {
	    const flvjs = await loadFlv();
	    if (!flvjs || !flvjs.isSupported || !flvjs.isSupported()) return null;
	    const withCredentials = false;
	    const flv = flvjs.createPlayer(
      { type: 'flv', isLive: false, url, withCredentials },
      {
        enableWorker: false,
        enableStashBuffer: false,
        autoCleanupSourceBuffer: true,
        reuseRedirectedURL: true,
        headers: headers || {},
      }
    );
	    flv.attachMediaElement(videoEl);
	    flv.load();
	    return { flv };
	  },
	  async dash(videoEl, url, headers) {
	    const shaka = await loadShaka();
	    if (!shaka || !shaka.Player || !shaka.Player.isBrowserSupported || !shaka.Player.isBrowserSupported()) return null;
	    const withCredentials = false;
	    const dash = new shaka.Player(videoEl);
    dash.getNetworkingEngine().registerRequestFilter((type, request) => {
      request.allowCrossSiteCredentials = withCredentials;
      if (!headers || typeof headers !== 'object') return;
      Object.keys(headers).forEach((k) => {
        const v = headers[k];
        if (v == null) return;
        request.headers[k] = String(v);
      });
    });
	    dash.load(url);
	    return { dash };
	  },
	};

	const init = () => {
	  const url = (props.url || '').trim();
	  if (!container.value || !url) return;

  if (art) destroyNow();
  isPip.value = false;

	  const format = detectVideoFormat(url);
	  const playUrlForArt = url;
	  const isCrossOriginUrl = (u) => {
	    const raw = typeof u === 'string' ? u.trim() : '';
	    if (!raw) return false;
	    try {
	      const parsed = new URL(raw, window.location.href);
	      return parsed.origin !== window.location.origin;
	    } catch (_e) {
	      return false;
	    }
	  };
	  const isCrossOriginNative = format === 'native' && isCrossOriginUrl(playUrlForArt);
	  const artType =
	    format === 'hls'
	      ? 'm3u8'
      : format === 'flv'
        ? 'flv'
        : format === 'dash'
          ? 'mpd'
          : '';

  let metaEmitted = false;
  const emitMetaOnce = () => {
    if (metaEmitted) return;
    metaEmitted = true;
    try {
      const v = art && art.video ? art.video : null;
      const d = (art && typeof art.duration === 'number' ? art.duration : null) ?? (v ? v.duration : 0);
      duration.value = Number.isFinite(d) ? d : 0;
      emit('loadedmetadata', { duration: duration.value });
    } catch (_e) {}
  };

	  art = new Artplayer({
	    container: container.value,
	    url: playUrlForArt,
    poster: props.poster || '',
    autoplay: !!props.autoplay,
    muted: false,
    volume: 0.7,
    pip: true,
    // iOS Safari has various rendering quirks with "backdrop" effects while decoding video.
    // Disable it on mobile to reduce black-screen-with-audio issues.
    backdrop: !isMobile.value,
    autoSize: false,
    autoMini: false,
    setting: false,
	    playbackRate: false,
	    aspectRatio: false,
	    // For cross-site MP4, enabling screenshot may force `<video crossorigin>` and trigger CORS-mode requests.
	    screenshot: !isCrossOriginNative,
	    playsInline: true,
    // Disable built-in touch gestures on mobile so taps don't also toggle play/pause
    // (we handle mobile UI + play controls ourselves).
    gesture: !isMobile.value,
    theme: '#22c55e',
    lang: 'zh-cn',
    type: artType,
    // Disable ArtPlayer fullscreen/hotkeys; we control fullscreen ourselves to keep custom UI visible.
    fullscreen: false,
    fullscreenWeb: false,
    hotkey: false,
			  customType:
			    format !== 'native'
			      ? {
			          [artType]: function (videoEl, playUrl, artInstance) {
			            const headers = props.headers || {};
			            const token = `${Date.now()}-${Math.random()}`;
			            artInstance.__tvCustomToken = token;
			            (async () => {
			              let custom = null;
			              try {
			                if (format === 'hls') custom = await createCustomPlayer.hls(videoEl, playUrl, headers);
			                if (format === 'flv') custom = await createCustomPlayer.flv(videoEl, playUrl, headers);
			                if (format === 'dash') custom = await createCustomPlayer.dash(videoEl, playUrl, headers);
			              } catch (_e) {
			                custom = null;
			              }
			              // If URL changed before module loaded, drop the created player.
			              if (!artInstance || artInstance.__tvCustomToken !== token || (artInstance.url || '') !== playUrl) {
			                destroyCustomPlayer(custom);
			                return;
			              }
			              if (custom) artInstance.customPlayer = custom;
			              try {
			                if (props.autoplay && videoEl && typeof videoEl.play === 'function') videoEl.play().catch(() => {});
			              } catch (_e) {}
			            })();
			          },
			        }
			      : {},
  });

  try {
    teleportTarget.value = art && art.template && art.template.$player ? art.template.$player : null;
  } catch (_e) {
    teleportTarget.value = null;
  }
  try {
    if (typeof cleanupPlayerElListeners === 'function') cleanupPlayerElListeners();
  } catch (_e) {}
  cleanupPlayerElListeners = null;
  desktopControlsVisible.value = true;
  try {
    const playerEl = teleportTarget.value;
    if (playerEl) {
      const onDesktopMouseMove = () => {
        if (isMobile.value) return;
        desktopControlsVisible.value = true;
        scheduleDesktopAutoHide();
      };
      const onDesktopMouseLeave = () => {
        if (isMobile.value) return;
        if (!art) return;
        if (art.playing && !settingsOpen.value && !buffering.value) desktopControlsVisible.value = false;
      };
      // Desktop double-click fullscreen: prevent the browser's default <video> double-click fullscreen
      // from fighting with Artplayer (which can cause enter+exit immediately).
      if (typeof playerEl.addEventListener === 'function') {
        const onDblClickCapture = (evt) => {
          if (isMobile.value) return;
          if (isUiControlTarget(evt && evt.target ? evt.target : null)) return;
          try {
            evt.preventDefault();
          } catch (_e) {}
          try {
            if (typeof evt.stopImmediatePropagation === 'function') evt.stopImmediatePropagation();
          } catch (_e) {}
          try {
            evt.stopPropagation();
          } catch (_e) {}
          toggleFullscreen();
        };
        playerEl.addEventListener('dblclick', onDblClickCapture, { capture: true });
        playerEl.addEventListener('mousemove', onDesktopMouseMove, { passive: true });
        playerEl.addEventListener('mouseenter', onDesktopMouseMove, { passive: true });
        playerEl.addEventListener('mouseleave', onDesktopMouseLeave, { passive: true });
        cleanupPlayerElListeners = () => {
          try {
            playerEl.removeEventListener('dblclick', onDblClickCapture, true);
            playerEl.removeEventListener('mousemove', onDesktopMouseMove);
            playerEl.removeEventListener('mouseenter', onDesktopMouseMove);
            playerEl.removeEventListener('mouseleave', onDesktopMouseLeave);
          } catch (_e) {}
        };
      }
    }
  } catch (_e) {
    desktopControlsVisible.value = true;
  }

		  // iOS Safari quirks: ensure inline playback attributes are present on the real video element.
		  try {
		    const v = art.video;
		    if (v) {
		      if (isCrossOriginNative) {
		        const enforceNoCors = () => {
		          try {
		            v.removeAttribute('crossorigin');
		          } catch (_e) {}
		        };
		        enforceNoCors();
		        try {
		          if (typeof MutationObserver === 'function') {
		            const obs = new MutationObserver(() => enforceNoCors());
		            obs.observe(v, { attributes: true, attributeFilter: ['crossorigin'] });
		            cleanupNoCorsEnforcer = () => {
		              try {
		                obs.disconnect();
		              } catch (_e) {}
		            };
		          }
		        } catch (_e) {}
		      }
		      v.setAttribute('playsinline', '');
		      v.setAttribute('webkit-playsinline', '');
		      v.setAttribute('x-webkit-airplay', 'allow');
	      v.setAttribute('preload', 'metadata');
      try {
        v.preload = 'metadata';
      } catch (_e) {}
      try {
        v.load();
      } catch (_e) {}

      const onLoadedMetadata = () => emitMetaOnce();
      const onDurationChange = () => {
        try {
          const d = (art && typeof art.duration === 'number' ? art.duration : null) ?? v.duration;
          duration.value = Number.isFinite(d) ? d : 0;
        } catch (_e) {}
        if (typeof v.readyState === 'number' && v.readyState >= 1) emitMetaOnce();
      };
      const onError = () => {
        try {
          const err = v && v.error ? v.error : null;
          const code = err && typeof err.code === 'number' ? err.code : 0;
          let msg = '播放失败';
          if (code === 2) msg = '播放失败：网络错误';
          else if (code === 3) msg = '播放失败：解码错误（可能不支持该编码/清晰度）';
          else if (code === 4) msg = '播放失败：媒体不可播放（可能不支持该编码/清晰度）';
          emit('error', { code, message: msg });
        } catch (_e) {
          try {
            emit('error', { code: 0, message: '播放失败' });
          } catch (_ignored) {}
        }
      };
      v.addEventListener('loadedmetadata', onLoadedMetadata);
      v.addEventListener('durationchange', onDurationChange);
      v.addEventListener('error', onError);
      cleanupNativeVideoListeners = () => {
        try {
          v.removeEventListener('loadedmetadata', onLoadedMetadata);
          v.removeEventListener('durationchange', onDurationChange);
          v.removeEventListener('error', onError);
        } catch (_e) {}
      };
    }
  } catch (_e) {}

  // Ensure UI auto-hide behaves like a player overlay.
  uiVisible.value = true;
  showUiTemporarily();

  // Sync state
  playing.value = art.playing;
  currentTime.value = art.currentTime || 0;
  duration.value = art.duration || 0;
  volume.value = art.volume || 0;
  muted.value = art.muted || false;
  playbackRate.value = art.playbackRate || 1;
  aspectRatio.value = art.aspectRatio || 'default';

  art.on('video:timeupdate', () => {
    timeUpdatePending = art.currentTime || 0;
    if (timeUpdateRaf) return;
    timeUpdateRaf = window.requestAnimationFrame(() => {
      timeUpdateRaf = 0;
      const nextTime = timeUpdatePending || 0;
      if (buffering.value && nextTime > (currentTime.value || 0) + 0.05) {
        buffering.value = false;
      }
      currentTime.value = nextTime;
    });
  });
  art.on('video:loadedmetadata', () => {
    try {
      const d = art.duration || 0;
      duration.value = Number.isFinite(d) ? d : 0;
    } catch (_e) {}
    emitMetaOnce();
  });
  art.on('video:durationchange', () => {
    duration.value = art.duration || 0;
  });
  art.on('video:volumechange', () => {
    volume.value = art.volume || 0;
    muted.value = art.muted || false;
  });
  art.on('video:ratechange', () => {
    playbackRate.value = art.playbackRate || 1;
  });
  art.on('video:play', () => {
    playing.value = true;
    buffering.value = false;
    showUiTemporarily();
  });
  art.on('video:pause', () => {
    playing.value = false;
    buffering.value = false;
    uiVisible.value = true;
  });
  art.on('video:waiting', () => {
    buffering.value = true;
    showUiTemporarily();
  });
  art.on('video:stalled', () => {
    buffering.value = true;
    showUiTemporarily();
  });
  art.on('video:playing', () => {
    buffering.value = false;
    showUiTemporarily();
    emitMetaOnce();
  });
  art.on('video:canplay', () => {
    buffering.value = false;
    emitMetaOnce();
  });
  art.on('video:error', () => {
    buffering.value = false;
    uiVisible.value = true;
    try {
      const v = art && art.video ? art.video : null;
      const err = v && v.error ? v.error : null;
      const code = err && typeof err.code === 'number' ? err.code : 0;
      // 1: aborted, 2: network, 3: decode, 4: src not supported
      let msg = '播放失败';
      if (code === 2) msg = '播放失败：网络错误';
      else if (code === 3) msg = '播放失败：解码错误（可能不支持该编码/清晰度）';
      else if (code === 4) msg = '播放失败：媒体不可播放（可能不支持该编码/清晰度）';
      emit('error', { code, message: msg });
    } catch (_) {
      try {
        emit('error', { code: 0, message: '播放失败' });
      } catch (_e) {}
    }
  });

  // iOS native fullscreen (video element) does not trigger document fullscreenchange.
  try {
    const videoEl = art.video;
    if (videoEl && typeof videoEl.addEventListener === 'function') {
      const onBegin = () => {
        isFullscreen.value = true;
        showUiTemporarily();
      };
      const onEnd = () => {
        isFullscreen.value = false;
        showUiTemporarily();
      };
      videoEl.addEventListener('webkitbeginfullscreen', onBegin);
      videoEl.addEventListener('webkitendfullscreen', onEnd);
      cleanupFsListeners = () => {
        try {
          videoEl.removeEventListener('webkitbeginfullscreen', onBegin);
          videoEl.removeEventListener('webkitendfullscreen', onEnd);
        } catch (_e) {}
      };
    }
  } catch (_e) {}

  // Browser Picture-in-Picture state (desktop floating window).
  try {
    const videoEl = art.video;
    if (videoEl && typeof videoEl.addEventListener === 'function') {
      const sync = () => {
        try {
          isPip.value = document.pictureInPictureElement === videoEl;
        } catch (_) {
          isPip.value = false;
        }
      };
      const onEnter = () => sync();
      const onLeave = () => sync();
      videoEl.addEventListener('enterpictureinpicture', onEnter);
      videoEl.addEventListener('leavepictureinpicture', onLeave);
      sync();
      cleanupPipListeners = () => {
        try {
          videoEl.removeEventListener('enterpictureinpicture', onEnter);
          videoEl.removeEventListener('leavepictureinpicture', onLeave);
        } catch (_) {}
      };
    }
  } catch (_) {}
};

const togglePlay = () => {
  if (!art) return;
  art.toggle();
};

const emitEpisodeDelta = (delta) => {
  try {
    window.dispatchEvent(new CustomEvent('tvplayer:episode', { detail: { delta } }));
  } catch (_) {}
};

const toggleMute = () => {
  if (!art) return;
  art.muted = !art.muted;
};

const onVolume = (e) => {
  const v = e && e.target ? Number(e.target.value) : NaN;
  if (!art || !Number.isFinite(v)) return;
  art.muted = false;
  art.volume = Math.max(0, Math.min(1, v));
};

const onSeek = (e) => {
  const v = e && e.target ? Number(e.target.value) : NaN;
  if (!art || !Number.isFinite(v)) return;
  art.currentTime = Math.max(0, Math.min(duration.value || 0, v));
};

const setRate = (r) => {
  if (!art) return;
  art.playbackRate = r;
  playbackRate.value = r;
};

const setRatio = (r) => {
  if (!art) return;
  art.aspectRatio = r;
  aspectRatio.value = r;
};

const togglePip = () => {
  try {
    const videoEl = art && art.video ? art.video : null;
    if (!videoEl) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else if (typeof videoEl.requestPictureInPicture === 'function') {
      videoEl.requestPictureInPicture();
    }
    showUiTemporarily();
  } catch (_) {}
};

const toggleFullscreen = async () => {
  try {
    const el = shell.value;
    if (!el || !art) return;
    const videoEl = art.video;

    // iOS Safari: use native fullscreen on the <video> element when possible.
    if (videoEl && typeof videoEl.webkitEnterFullscreen === 'function') {
      if (isFullscreen.value && typeof videoEl.webkitExitFullscreen === 'function') {
        videoEl.webkitExitFullscreen();
      } else {
        videoEl.webkitEnterFullscreen();
      }
      showUiTemporarily();
      return;
    }
    const fsEl = typeof document !== 'undefined' ? document.fullscreenElement : null;
    if (fsEl) {
      document.exitFullscreen().catch(() => {});
      showUiTemporarily();
      return;
    }
    // IMPORTANT: fullscreen the container that also contains the custom UI (teleportTarget),
    // otherwise some browsers may fullscreen only the <video> element and our UI will disappear.
    const target = teleportTarget.value || el;
    if (target && typeof target.requestFullscreen === 'function') {
      target.requestFullscreen().catch(() => {});
    }
    showUiTemporarily();
  } catch (_) {}
};

let hideTimer = 0;
let desktopHideTimer = 0;

const scheduleDesktopAutoHide = () => {
  if (desktopHideTimer) window.clearTimeout(desktopHideTimer);
  desktopHideTimer = 0;
  if (!art) return;
  if (!art.playing) return;
  if (settingsOpen.value || buffering.value) return;
  desktopHideTimer = window.setTimeout(() => {
    if (!art) return;
    if (art.playing && !settingsOpen.value && !buffering.value) desktopControlsVisible.value = false;
  }, 2200);
};

const showUiTemporarily = () => {
  if (isMobile.value) {
    uiVisible.value = true;
    if (hideTimer) window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      if (!art) return;
      if (art.playing && !settingsOpen.value && !buffering.value) uiVisible.value = false;
    }, 2200);
    return;
  }

  desktopControlsVisible.value = true;
  scheduleDesktopAutoHide();
};

const onDocDown = (e) => {
  if (!settingsOpen.value) return;
  const el = settingEl.value;
  if (el && e && e.target && el.contains(e.target)) return;
  settingsOpen.value = false;
};

onMounted(() => {
  // Ensure device flags are computed before initializing ArtPlayer,
  // otherwise desktop/mobile behaviors can be swapped after mount.
  updateIsMobile();
  init();

  try {
    if (typeof window !== 'undefined') window.addEventListener('resize', updateIsMobile, { passive: true });
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      mediaQuery = window.matchMedia('(max-width: 820px)');
      if (typeof mediaQuery.addEventListener === 'function') mediaQuery.addEventListener('change', updateIsMobile);
      else if (typeof mediaQuery.addListener === 'function') mediaQuery.addListener(updateIsMobile);
    }
  } catch (_e) {
    mediaQuery = null;
  }

  document.addEventListener('mousedown', onDocDown, true);
  try {
    const el = shell.value;
    if (el) {
      const onTouchMove = () => showUiTemporarily();
      el.addEventListener('touchmove', onTouchMove, { passive: true });

      // iOS Safari (and some WebViews) may not reliably deliver pointerdown/touchstart here due to the video element.
      // Use click capture as the reliable "tap" signal for mobile UI toggle.
      const onBlankClickCapture = (evt) => {
        if (!evt || !evt.target || !el.contains(evt.target)) return;
        if (!isMobile.value) return;
        if (isUiControlTarget(evt.target)) return;
        if (!uiVisible.value) {
          settingsOpen.value = false;
          uiVisible.value = true;
          showUiTemporarily();
        } else {
          settingsOpen.value = false;
          uiVisible.value = false;
        }
        try {
          evt.preventDefault();
        } catch (_e) {}
        try {
          if (typeof evt.stopImmediatePropagation === 'function') evt.stopImmediatePropagation();
        } catch (_e) {}
        try {
          evt.stopPropagation();
        } catch (_e) {}
      };
      el.addEventListener('click', onBlankClickCapture, { capture: true });

      const onFsChange = () => {
        // Some browsers (and some fullscreen implementations) may re-parent elements,
        // making containment checks unreliable. For our UI, "any fullscreen" is enough.
        isFullscreen.value = !!document.fullscreenElement;
        if (!isMobile.value) {
          desktopControlsVisible.value = true;
          scheduleDesktopAutoHide();
        }
      };
      document.addEventListener('fullscreenchange', onFsChange, true);
      onFsChange();

      el.__tvCleanupPlayerUi = () => {
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('click', onBlankClickCapture, true);
        document.removeEventListener('fullscreenchange', onFsChange, true);
        delete el.__tvCleanupPlayerUi;
      };
    }
  } catch (_) {}
});
watch(
  () => props.url,
  (next, prev) => {
    const a = (next || '').trim();
    const b = (prev || '').trim();
    if (a && a !== b) init();
    if (!a && art) destroyNow();
  }
);

onBeforeUnmount(() => {
  if (hideTimer) {
    window.clearTimeout(hideTimer);
    hideTimer = 0;
  }
  if (desktopHideTimer) {
    window.clearTimeout(desktopHideTimer);
    desktopHideTimer = 0;
  }
  try {
    if (typeof window !== 'undefined') window.removeEventListener('resize', updateIsMobile);
    if (mediaQuery) {
      if (typeof mediaQuery.removeEventListener === 'function') mediaQuery.removeEventListener('change', updateIsMobile);
      else if (typeof mediaQuery.removeListener === 'function') mediaQuery.removeListener(updateIsMobile);
    }
  } catch (_e) {}
  mediaQuery = null;
  document.removeEventListener('mousedown', onDocDown, true);
  try {
    const el = shell.value;
    if (el && el.__tvCleanupPlayerUi) el.__tvCleanupPlayerUi();
  } catch (_) {}
  if (!art) return;
  destroyNow();
});


defineExpose({ destroy: destroyNow });
</script>

<style scoped>
.tv-drplayer {
  --yt-btn-size: 34px;
  --yt-ico-size: 18px;
  --yt-pill-pad-y: 8px;
  --yt-pill-pad-x: 10px;
  --yt-pill-gap: 8px;
  --yt-time-size: 12px;

  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
}

.tv-drplayer.tv-drplayer--fullscreen {
  /* Fullscreen: keep capsule height ~50px on 2K, scale smoothly on other screens. */
  --yt-pill-h: clamp(42px, 1.95vw, 50px);
  --yt-btn-size: calc(var(--yt-pill-h) - 10px);
  --yt-ico-size: calc(var(--yt-btn-size) * 0.52);
  --yt-pill-pad-x: clamp(10px, 0.65vw, 14px);
  --yt-pill-gap: clamp(8px, 0.55vw, 12px);
  --yt-time-size: clamp(12px, 0.55vw, 14px);
}

.drplayer-root {
  width: 100%;
  height: 100%;
}

:deep(.art-video-player) {
  position: relative;
  width: 100% !important;
  height: 100% !important;
}

.tv-drplayer.tv-drplayer--fullscreen :deep(.art-video-player),
.tv-drplayer.tv-drplayer--fullscreen :deep(.art-video),
.tv-drplayer.tv-drplayer--fullscreen :deep(video) {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}

.tv-drplayer.tv-drplayer--fullscreen :deep(.art-video),
.tv-drplayer.tv-drplayer--fullscreen :deep(video) {
  filter: opacity(0.999);
}

:deep(.art-video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
}

:deep(.art-bottom) {
  display: none !important;
}

:deep(.art-progress),
:deep(.art-controls),
:deep(.art-controls-left),
:deep(.art-controls-center),
:deep(.art-controls-right) {
  display: none !important;
}

.tv-drplayer.tv-drplayer--mobile :deep(.art-layer-play) {
  display: none !important;
}

.tv-drplayer.tv-drplayer--mobile :deep(.art-state) {
  display: none !important;
}

.tv-drplayer :deep(.art-loading),
.tv-drplayer :deep(.art-layer-loading) {
  display: none !important;
}

.yt-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.18s ease;
}

.yt-ui.yt-ui--show {
  opacity: 1;
  visibility: visible;
}

.yt-progress__range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  margin: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.yt-progress__range::-webkit-slider-runnable-track {
  height: var(--yt-progress-track-h);
  border-radius: 999px;
  background: transparent;
}

.yt-progress__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  margin-top: calc((var(--yt-progress-track-h) - var(--yt-progress-thumb-h)) / 2);
  width: var(--yt-progress-thumb-h);
  height: var(--yt-progress-thumb-h);
  border-radius: 999px;
  background: #ff0033;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
}

.yt-progress__range::-moz-range-track {
  height: var(--yt-progress-track-h);
  border-radius: 999px;
  background: transparent;
}

.yt-progress__range::-moz-range-thumb {
  width: var(--yt-progress-thumb-h);
  height: var(--yt-progress-thumb-h);
  border-radius: 999px;
  border: 0;
  background: #ff0033;
}

.yt-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 12px 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.0));
  pointer-events: none;
}

.yt-ui.yt-ui--show .yt-bar {
  pointer-events: auto;
}

.yt-progress {
  position: relative;
  margin: 0 2px 14px;
  --yt-progress-track-h: 8px;
  --yt-progress-thumb-h: 14px;
  --yt-progress-p: 0;
  height: var(--yt-progress-thumb-h);
  pointer-events: auto;
  cursor: pointer;
}

.yt-progress__track {
  position: absolute;
  left: 0;
  right: 0;
  top: calc((var(--yt-progress-thumb-h) - var(--yt-progress-track-h)) / 2);
  height: var(--yt-progress-track-h);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  overflow: hidden;
  pointer-events: none;
}

.yt-progress__fill {
  height: 100%;
  width: calc(
    (var(--yt-progress-p) * (100% - var(--yt-progress-thumb-h))) + (var(--yt-progress-thumb-h) / 2)
  );
  max-width: 100%;
  background: #ff0033;
  border-radius: 999px;
}

.yt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.yt-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--yt-pill-gap);
  padding: var(--yt-pill-pad-y) var(--yt-pill-pad-x);
  border-radius: 999px;
  background: rgba(20, 20, 20, 0.45);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.92);
}

.tv-drplayer.tv-drplayer--fullscreen .yt-pill {
  height: var(--yt-pill-h);
  padding-top: 0;
  padding-bottom: 0;
}

.yt-btn {
  width: var(--yt-btn-size);
  height: var(--yt-btn-size);
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.92);
  outline: none;
}

.yt-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.yt-btn:focus,
.yt-btn:focus-visible {
  outline: none;
  box-shadow: none;
}

.yt-btn[data-active='true'] {
  border-color: rgba(34, 197, 94, 0.55);
  background: rgba(34, 197, 94, 0.18);
  color: rgba(74, 222, 128, 1);
}

.yt-ico {
  width: var(--yt-ico-size);
  height: var(--yt-ico-size);
}

.yt-time {
  font-size: var(--yt-time-size);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.82);
  padding: 0 6px 0 2px;
  white-space: nowrap;
}

.yt-volume {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.yt-volume__slider {
  width: 0;
  overflow: hidden;
  opacity: 0;
  transition: width 0.18s ease, opacity 0.18s ease;
}

.yt-volume__slider[data-show='true'] {
  width: 86px;
  opacity: 1;
}

.yt-volume__range {
  width: 86px;
  height: 6px;
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
}

.yt-volume__range::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
}

.yt-volume__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  margin-top: -3px;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
}

.yt-setting {
  position: relative;
}

.yt-setting__menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  width: 240px;
  border-radius: 14px;
  padding: 10px;
  background: rgba(18, 18, 18, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55);
  display: none;
}

.yt-setting__menu--open {
  display: block;
}

.yt-setting__section + .yt-setting__section {
  margin-top: 12px;
}

.yt-setting__title {
  font-size: 12px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 8px;
}

.yt-setting__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.yt-setting__item {
  height: 32px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.88);
  font-size: 12px;
  font-weight: 800;
}

.yt-setting__item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.yt-setting__item[data-active='true'] {
  border-color: rgba(34, 197, 94, 0.55);
  background: rgba(34, 197, 94, 0.18);
  color: rgba(74, 222, 128, 1);
}

/* -------------------- Mobile controls -------------------- */
.tv-drplayer.tv-drplayer--mobile .yt-ui {
  /* Mobile: keep controls visible a bit more naturally on tap */
  transition: opacity 0.16s ease;
}

.tv-drplayer.tv-drplayer--mobile {
  --m-control-bottom: 10px;
}

.m-bar {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tv-drplayer.tv-drplayer--mobile .m-progress {
  position: absolute;
  left: 12px;
  right: 60px; /* leave room for fullscreen */
  /* Align the progress thumb center with the fullscreen button center */
  bottom: calc(var(--m-control-bottom) + (var(--yt-btn-size) - var(--yt-progress-thumb-h)) / 2);
  margin: 0;
  --yt-progress-track-h: 6px;
  --yt-progress-thumb-h: 12px;
}

.tv-drplayer.tv-drplayer--mobile .m-setting {
  position: absolute;
  top: 10px;
  right: 10px;
}

.tv-drplayer.tv-drplayer--mobile .m-setting .yt-setting__menu {
  top: calc(100% + 10px);
  bottom: auto;
  right: 0;
  transform-origin: top right;
}

.tv-drplayer.tv-drplayer--mobile .m-fullscreen {
  position: absolute;
  right: 10px;
  bottom: var(--m-control-bottom);
}

.tv-drplayer.tv-drplayer--mobile .m-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease;
  display: block;
}

.tv-drplayer.tv-drplayer--mobile .m-center.m-center--show {
  opacity: 1;
  pointer-events: auto;
}

.tv-drplayer.tv-drplayer--mobile .m-center__controls {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.tv-drplayer.tv-drplayer--mobile .m-btn {
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 20, 20, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.92);
}

.tv-drplayer.tv-drplayer--mobile .m-btn--play {
  width: 62px;
  height: 62px;
  background: rgba(20, 20, 20, 0.48);
  border-color: rgba(255, 255, 255, 0.18);
  position: relative;
}

.tv-drplayer.tv-drplayer--mobile .m-btn--play[data-loading='true']::after {
  content: '';
  position: absolute;
  /* Sit the ring on the button border (no extra gap) */
  inset: -1px;
  border-radius: 999px;
  pointer-events: none;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.95) 0 3px, transparent 4px),
    conic-gradient(
      from 0deg,
      rgba(255, 255, 255, 0) 0deg,
      rgba(255, 255, 255, 0.12) 70deg,
      rgba(255, 255, 255, 0.28) 140deg,
      rgba(255, 255, 255, 0.62) 250deg,
      rgba(255, 255, 255, 0.0) 360deg
    );
  /* Ring thickness */
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 4px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 4px));
  animation: tv-ring-spin 0.9s linear infinite;
  opacity: 0.95;
}

.tv-drplayer.tv-drplayer--mobile .m-btn--play[data-loading='true']::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 999px;
  pointer-events: none;
  box-shadow: 0 0 22px rgba(255, 255, 255, 0.08);
  opacity: 1;
}

.tv-drplayer.tv-drplayer--mobile .m-btn--skip {
  width: 46px;
  height: 46px;
}

.tv-drplayer.tv-drplayer--mobile .m-ico {
  width: 20px;
  height: 20px;
}

.tv-drplayer.tv-drplayer--mobile .m-ico--play {
  width: 26px;
  height: 26px;
}

.tv-drplayer .m-buffer-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 62px;
  height: 62px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  pointer-events: none;
  z-index: 10001;
}

.tv-drplayer .m-buffer-ring::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.95) 0 3px, transparent 4px),
    conic-gradient(
      from 0deg,
      rgba(255, 255, 255, 0) 0deg,
      rgba(255, 255, 255, 0.12) 70deg,
      rgba(255, 255, 255, 0.28) 140deg,
      rgba(255, 255, 255, 0.62) 250deg,
      rgba(255, 255, 255, 0.0) 360deg
    );
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 4px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 4px));
  animation: tv-ring-spin 0.9s linear infinite;
  opacity: 0.95;
}

@media (prefers-reduced-motion: reduce) {
  .tv-drplayer .m-buffer-ring::after {
    animation: none;
  }
}

@keyframes tv-ring-spin {
  to {
    transform: rotate(360deg);
  }
}

/* iOS Safari: backdrop-filter overlays can trigger "audio-only / black video" rendering bugs.
   Disable blur glass effects for mobile controls on iOS to keep video rendering stable. */
@supports (-webkit-touch-callout: none) {
  .tv-drplayer.tv-drplayer--mobile .m-btn,
  .tv-drplayer.tv-drplayer--mobile .yt-btn,
  .tv-drplayer.tv-drplayer--mobile .yt-setting__menu {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}
</style>
