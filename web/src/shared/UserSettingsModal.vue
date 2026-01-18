<template>
  <div v-if="open" class="tv-us-backdrop" role="dialog" aria-modal="true" @click="onBackdropClick">
    <div class="tv-us-card" @click.stop>
      <div class="tv-us-header">
        <div class="tv-us-title">用户设置</div>
        <button class="tv-us-close" type="button" aria-label="关闭" @click="close">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="tv-us-body">
        <div class="tv-us-form">
          <div class="tv-us-row">
            <div class="tv-us-label">CatPawOpen 接口地址：</div>
            <input
              class="tv-us-input"
              :disabled="loading || saving"
              v-model="catApiBase"
              placeholder="http://YOUR_Catpawopen:Port/"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <div class="tv-us-row">
            <div class="tv-us-label">CatPawOpen 接口密钥：</div>
            <input
              class="tv-us-input"
              :disabled="loading || saving"
              v-model="catApiKey"
              placeholder="可留空"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <div class="tv-us-row">
            <div class="tv-us-label">CatPawOpen 全局代理：</div>
            <input
              class="tv-us-input"
              :disabled="loading || saving"
              v-model="catProxy"
              :placeholder="catProxyPlaceholder"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <div class="tv-us-row">
            <div class="tv-us-label">搜索线程数：</div>
            <input
              class="tv-us-input"
              :disabled="loading || saving"
              v-model="searchThreadCount"
              type="number"
              min="1"
              max="50"
              step="1"
              inputmode="numeric"
              placeholder="默认 5"
            />
          </div>
        </div>

        <div class="tv-us-divider"></div>

        <div class="tv-us-accordion">
          <div v-if="canShowPanSettings" class="tv-us-acc-item">
            <button class="tv-us-acc-head" type="button" @click="togglePanList">
              <span>网盘设置</span>
              <span class="tv-us-acc-icon" :data-open="panListOpen">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div v-show="panListOpen" class="tv-us-acc-body">
              <div class="tv-us-acc-status" v-if="panListLoading">加载中...</div>
              <div class="tv-us-acc-status error" v-else-if="panListError">{{ panListError }}</div>
              <div v-else class="tv-us-pan-list">
                <div v-if="!panList.length" class="tv-us-acc-status">暂无数据</div>
                <div v-else class="tv-us-pan-table">
                  <div class="tv-us-pan-head">
                    <div class="tv-us-pan-col name">网盘名称</div>
                    <div class="tv-us-pan-col enable">是否启用</div>
                    <div class="tv-us-pan-col order">排序</div>
                  </div>
                  <div class="tv-us-pan-row" v-for="(p, idx) in panList" :key="p.key">
                    <div class="tv-us-pan-col name">
                      <span class="tv-us-pan-name">{{ p.name || p.key }}</span>
                    </div>
                    <div class="tv-us-pan-col enable">
                      <button
                        class="tv-us-switch"
                        type="button"
                        :data-on="p.enable ? 'true' : 'false'"
                        :disabled="panListSaving"
                        @click="togglePanEnable(idx)"
                      >
                        <span class="tv-us-switch-dot"></span>
                      </button>
                    </div>
                    <div class="tv-us-pan-col order">
                      <div class="tv-us-order-btns">
                        <button class="tv-us-order-btn" type="button" :disabled="panListSaving || idx === 0" @click="movePan(idx, -1)">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 15l6-6 6 6" />
                          </svg>
                        </button>
                        <button class="tv-us-order-btn" type="button" :disabled="panListSaving || idx === panList.length - 1" @click="movePan(idx, 1)">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="tv-us-acc-status" v-if="panListSaving">同步中...</div>
                <div class="tv-us-acc-status success" v-else-if="panListSavedMsg">{{ panListSavedMsg }}</div>
                <div class="tv-us-acc-status error" v-else-if="panListSavedErr">{{ panListSavedErr }}</div>
              </div>
            </div>
          </div>

          <div v-if="canShowPanSettings" class="tv-us-acc-item">
            <button class="tv-us-acc-head" type="button" @click="togglePanCookie">
              <span>网盘 Cookie 设置</span>
              <span class="tv-us-acc-icon" :data-open="panCookieOpen">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div v-show="panCookieOpen" class="tv-us-acc-body">
              <div class="tv-us-pan-cookie">
                <div class="tv-us-pan-tabs">
                  <button
                    v-for="it in PAN_LOGIN_ITEMS"
                    :key="it.key"
                    class="tv-us-pan-tab"
                    type="button"
                    :data-active="activePanKey === it.key ? 'true' : 'false'"
                    @click="selectPanKey(it.key)"
                  >
                    {{ it.name }}
                  </button>
                </div>

                <div class="tv-us-acc-status" v-if="panCookieLoading">加载中...</div>
                <div class="tv-us-acc-status error" v-else-if="panCookieError">{{ panCookieError }}</div>

                <div v-else class="tv-us-pan-editor">
                  <template v-if="activePanType === 'cookie'">
                    <textarea
                      class="tv-us-textarea"
                      :disabled="panCookieSaving"
                      v-model="cookieValue"
                      :placeholder="`请输入${activePanName} Cookie`"
                      rows="3"
                      spellcheck="false"
                    ></textarea>
                  </template>
                  <template v-else>
                    <div class="tv-us-pan-account">
                      <div class="tv-us-row">
                        <div class="tv-us-label">账号：</div>
                        <input class="tv-us-input" :disabled="panCookieSaving" v-model="accountUsername" autocomplete="off" />
                      </div>
                      <div class="tv-us-row">
                        <div class="tv-us-label">密码：</div>
                        <input class="tv-us-input" :disabled="panCookieSaving" v-model="accountPassword" type="password" autocomplete="new-password" />
                      </div>
                    </div>
                  </template>

                  <div class="tv-us-pan-actions">
                    <div class="tv-us-acc-status success" v-if="panCookieSavedMsg">{{ panCookieSavedMsg }}</div>
                    <div class="tv-us-acc-status error" v-else-if="panCookieSavedErr">{{ panCookieSavedErr }}</div>
                    <button class="tv-us-save mini" type="button" :disabled="panCookieSaving" @click="savePanCredential">
                      {{ panCookieSaving ? '保存中...' : '保存' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

	          <div class="tv-us-acc-item" v-if="canShowUserSitesSettings">
	            <button class="tv-us-acc-head" type="button" @click="toggleUserSites">
	              <span>站点列表</span>
	              <span class="tv-us-acc-icon" :data-open="userSitesOpen">
	                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
	                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
	                </svg>
	              </span>
	            </button>
            <div v-show="userSitesOpen" class="tv-us-acc-body">
              <div class="tv-us-acc-status" v-if="userSitesLoading">加载中...</div>
              <div class="tv-us-acc-status error" v-else-if="userSitesError">{{ userSitesError }}</div>
              <div v-else class="tv-us-pan-list">
                <div v-if="!userSites.length" class="tv-us-acc-status">暂无数据</div>
                <div v-else class="tv-us-pan-table" data-kind="sites">
                  <div class="tv-us-sites-actions" v-if="userSitesSelectedCount > 0">
                    <div class="tv-us-acc-status">已选择 {{ userSitesSelectedCount }} 个</div>
                    <div class="tv-us-sites-actions__btns">
                      <button class="tv-us-batch-btn" type="button" :disabled="userSitesSaving" @click="batchCheckUserSites">
                        批量检测
                      </button>
                      <button class="tv-us-batch-btn ok" type="button" :disabled="userSitesSaving" @click="batchSetUserSitesEnabled(true)">
                        批量启用
                      </button>
                      <button class="tv-us-batch-btn danger" type="button" :disabled="userSitesSaving" @click="batchSetUserSitesEnabled(false)">
                        批量禁用
                      </button>
                    </div>
                  </div>
                  <div class="tv-us-pan-head">
                    <div class="tv-us-pan-col select">
                      <input class="tv-us-checkbox" type="checkbox" :checked="userSitesAllSelected" @change="toggleUserSitesSelectAll" />
                    </div>
                    <div class="tv-us-pan-col name">站点名称</div>
                    <div class="tv-us-pan-col availability">站点可用性</div>
                    <div class="tv-us-pan-col enable">是否启用</div>
                    <div class="tv-us-pan-col enable">首页显示</div>
                    <div class="tv-us-pan-col order">排序</div>
                  </div>
                  <div class="tv-us-pan-row" v-for="(s, idx) in userSites" :key="s.key">
                    <div class="tv-us-pan-col select">
                      <input
                        class="tv-us-checkbox"
                        type="checkbox"
                        :checked="isUserSiteSelected(s.key)"
                        @change="toggleUserSiteSelected(s.key)"
                      />
                    </div>
                    <div class="tv-us-pan-col name">
                      <span class="tv-us-pan-name">{{ s.name || s.key }}</span>
                    </div>
                    <div class="tv-us-pan-col availability">
                      <span class="tv-us-availability" :data-status="s.availability || 'unchecked'">
                        <span class="tv-us-availability-dot"></span>
                        <span class="tv-us-availability-text">{{
                          (s.availability || 'unchecked') === 'valid'
                            ? '有效'
                            : (s.availability || 'unchecked') === 'invalid'
                              ? '无效'
                              : (s.availability || 'unchecked') === 'unknown'
                                ? '未知'
                                : '未检测'
                        }}</span>
                      </span>
                    </div>
                    <div class="tv-us-pan-col enable">
                      <button
                        class="tv-us-switch"
                        type="button"
                        :data-on="s.enabled ? 'true' : 'false'"
                        :disabled="userSitesSaving"
                        @click="toggleUserSiteEnabled(idx)"
                      >
                        <span class="tv-us-switch-dot"></span>
                      </button>
                    </div>
                    <div class="tv-us-pan-col enable">
                      <button
                        class="tv-us-switch"
                        type="button"
                        :data-on="s.home ? 'true' : 'false'"
                        :disabled="userSitesSaving"
                        @click="toggleUserSiteHome(idx)"
                      >
                        <span class="tv-us-switch-dot"></span>
                      </button>
                    </div>
                    <div class="tv-us-pan-col order">
                      <div class="tv-us-order-btns">
                        <button class="tv-us-order-btn" type="button" :disabled="userSitesSaving || idx === 0" @click="moveUserSite(idx, -1)">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 15l6-6 6 6" />
                          </svg>
                        </button>
                        <button class="tv-us-order-btn" type="button" :disabled="userSitesSaving || idx === userSites.length - 1" @click="moveUserSite(idx, 1)">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
	            </div>
	          </div>

          <div class="tv-us-acc-item" v-if="canShowSearchResultSettings">
            <button class="tv-us-acc-head" type="button" @click="toggleSearchResultSettings">
              <span>站点搜索结果设置</span>
              <span class="tv-us-acc-icon" :data-open="searchResultOpen">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div v-show="searchResultOpen" class="tv-us-acc-body">
              <div class="tv-us-acc-status" v-if="searchResultLoading">加载中...</div>
              <div class="tv-us-acc-status error" v-else-if="searchResultError">{{ searchResultError }}</div>
              <div v-else class="tv-us-pan-list">
                <div v-if="!searchResultSites.length" class="tv-us-acc-status">暂无数据</div>
                <div v-else class="tv-us-pan-table" data-kind="search">
                  <div class="tv-us-pan-head">
                    <div class="tv-us-pan-col name">站点名称</div>
                    <div class="tv-us-pan-col enable">聚合图片显示</div>
                    <div class="tv-us-pan-col order">排序</div>
                  </div>
                  <div class="tv-us-pan-row" v-for="(s, idx) in searchResultSites" :key="s.key">
                    <div class="tv-us-pan-col name">
                      <span class="tv-us-pan-name">{{ s.name || s.key }}</span>
                    </div>
                    <div class="tv-us-pan-col enable">
                      <button
                        class="tv-us-switch"
                        type="button"
                        :data-on="searchCoverSite === s.key ? 'true' : 'false'"
                        :disabled="saving"
                        @click="setSearchCoverSite(s.key)"
                      >
                        <span class="tv-us-switch-dot"></span>
                      </button>
                    </div>
                    <div class="tv-us-pan-col order">
                      <div class="tv-us-order-btns">
                        <button class="tv-us-order-btn" type="button" :disabled="saving || idx === 0" @click="moveSearchSite(idx, -1)">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 15l6-6 6 6" />
                          </svg>
                        </button>
                        <button class="tv-us-order-btn" type="button" :disabled="saving || idx === searchResultSites.length - 1" @click="moveSearchSite(idx, 1)">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
	        </div>

	        <div class="tv-us-footer">
	          <div class="tv-us-msg" :data-kind="msgKind" v-if="msg">{{ msg }}</div>
          <button class="tv-us-save" type="button" :disabled="loading || saving" @click="save">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
	import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
	import { normalizeCatPawOpenApiBase, requestCatSpider } from './catpawopen';
	import { apiGetJson, apiPutJson, apiPostJson } from './apiClient';

const props = defineProps({
  bootstrap: { type: Object, required: false, default: null },
});

const open = ref(false);
const loading = ref(false);
const saving = ref(false);

const catApiBase = ref('');
const savedCatApiBase = ref('');
const catApiKey = ref('');
const catProxy = ref('');
const catProxyLoading = ref(false);
const catProxyStatus = ref('idle'); // idle | ok | error
const searchThreadCount = ref('5');
const searchSiteOrder = ref([]);
const searchCoverSite = ref('');

const userRole = computed(() => {
  const r = props && props.bootstrap && props.bootstrap.user && props.bootstrap.user.role;
  return typeof r === 'string' ? r : '';
});
const tvUser = computed(() => {
  const u = props && props.bootstrap && props.bootstrap.user && props.bootstrap.user.username;
  return typeof u === 'string' ? u : '';
});
const canShowPanSettings = computed(() => userRole.value !== 'admin' && userRole.value !== 'shared');
const canShowSearchResultSettings = computed(() => userRole.value !== 'admin' && userRole.value !== 'shared');

const msg = ref('');
const msgKind = ref(''); // success | error

const resetMessage = () => {
  msg.value = '';
  msgKind.value = '';
};

// Note: don't auto-fetch CatPawOpen proxy while user is typing the API base.
// We only fetch the current proxy when the modal opens and the user already saved a CatPawOpen before.

const resetPanModules = () => {
  catProxyLoading.value = false;
  catProxyStatus.value = 'idle';

  panListOpen.value = false;
  panListLoading.value = false;
  panListSaving.value = false;
  panListError.value = '';
  panListSavedMsg.value = '';
  panListSavedErr.value = '';
  panList.value = [];

  panCookieOpen.value = false;
  panCookieLoading.value = false;
  panCookieSaving.value = false;
  panCookieError.value = '';
  panCookieSavedMsg.value = '';
  panCookieSavedErr.value = '';
  activePanKey.value = PAN_LOGIN_ITEMS[0] ? PAN_LOGIN_ITEMS[0].key : '';
  cookieValue.value = '';
  accountUsername.value = '';
  accountPassword.value = '';
  loadedPanKeys.value = new Set();

  userSitesOpen.value = false;
  userSitesLoading.value = false;
  userSitesSaving.value = false;
  userSitesError.value = '';
  userSites.value = [];
  userSitesSelected.value = new Set();

  searchResultOpen.value = false;
  searchResultLoading.value = false;
  searchResultError.value = '';
};

const collapseAccordionsAfterSave = () => {
  // Collapse all expandable panels and clear their cached data,
  // so next expand will re-fetch fresh data without requiring re-open modal.
  panListOpen.value = false;
  panListLoading.value = false;
  panListSaving.value = false;
  panListError.value = '';
  panListSavedMsg.value = '';
  panListSavedErr.value = '';
  panList.value = [];

  panCookieOpen.value = false;
  panCookieLoading.value = false;
  panCookieSaving.value = false;
  panCookieError.value = '';
  panCookieSavedMsg.value = '';
  panCookieSavedErr.value = '';
  cookieValue.value = '';
  accountUsername.value = '';
  accountPassword.value = '';
  loadedPanKeys.value = new Set();

  userSitesOpen.value = false;
  userSitesLoading.value = false;
  userSitesSaving.value = false;
  userSitesError.value = '';
  userSites.value = [];
  userSitesSelected.value = new Set();

  searchResultOpen.value = false;
  searchResultLoading.value = false;
  searchResultError.value = '';
};

const close = () => {
  open.value = false;
  resetMessage();
  resetPanModules();
};

const onBackdropClick = () => close();

	const loadSettings = async () => {
	  loading.value = true;
	  resetMessage();
	  try {
	    const data = await apiGetJson('/api/user/settings', { cacheMs: 0 });
	    if (!data || data.success !== true) throw new Error((data && data.message) || '加载失败');
	    const settings = data.settings && typeof data.settings === 'object' ? data.settings : {};
	    catApiBase.value = typeof settings.catApiBase === 'string' ? settings.catApiBase : '';
	    savedCatApiBase.value = typeof settings.catApiBase === 'string' ? settings.catApiBase : '';
    catApiKey.value = typeof settings.catApiKey === 'string' ? settings.catApiKey : '';
    const st = settings.searchThreadCount != null ? Number(settings.searchThreadCount) : 5;
    searchThreadCount.value = String(Number.isFinite(st) && st > 0 ? Math.floor(st) : 5);
    catProxy.value = typeof settings.catProxy === 'string' ? settings.catProxy : '';
    searchSiteOrder.value = Array.isArray(settings.searchSiteOrder) ? settings.searchSiteOrder : [];
    searchCoverSite.value = typeof settings.searchCoverSite === 'string' ? settings.searchCoverSite : '';
    // Don't auto-fetch CatPawOpen proxy on open; user can click refresh when needed.
    catProxyStatus.value = 'idle';
  } catch (e) {
    msgKind.value = 'error';
    msg.value = (e && e.message) || '加载失败';
  } finally {
    loading.value = false;
  }
};

const loadCatProxyRealtime = async () => {
  const normalized = normalizeCatPawOpenApiBase(catApiBase.value);
  if (!normalized) {
    catProxyStatus.value = 'idle';
    return;
  }
  if (catProxyLoading.value) return;
  catProxyLoading.value = true;
  try {
    const url = new URL('admin/settings', normalized);
    const headers = {};
    const u = (tvUser.value || '').trim();
    if (u) headers['X-TV-User'] = u;
    const resp = await fetch(url.toString(), { method: 'GET', headers, credentials: 'omit' });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const msg = data && (data.message || data.error) ? String(data.message || data.error) : `HTTP ${resp.status}`;
      throw new Error(msg);
    }
    let proxy = '';
    if (data && typeof data === 'object' && data.success === true && data.settings && typeof data.settings.proxy === 'string') {
      proxy = data.settings.proxy;
    }
    catProxy.value = proxy || '';
    catProxyStatus.value = 'ok';
  } catch (e) {
    catProxyStatus.value = 'error';
  } finally {
    catProxyLoading.value = false;
  }
};

const catProxyPlaceholder = computed(() => {
  const normalized = normalizeCatPawOpenApiBase(catApiBase.value);
  if (!normalized) return 'CatPawOpen 接口地址未设置';
  if (catProxyLoading.value) return '读取中...';
  if (catProxyStatus.value === 'error') return 'CatPawOpen 接口异常';
  return '保存后将同步到 CatPawOpen 并立即生效（留空关闭）';
});

const save = async () => {
  if (saving.value) return;
  resetMessage();
  const st = Number(searchThreadCount.value);
  const stInt = Number.isFinite(st) ? Math.floor(st) : NaN;
  if (!Number.isFinite(stInt) || stInt < 1 || stInt > 50) {
    msgKind.value = 'error';
    msg.value = '搜索线程数必须是 1-50 的整数';
    return;
  }

  saving.value = true;
  const prevSavedApiBase = normalizeCatPawOpenApiBase(savedCatApiBase.value);
  const nextApiBase = normalizeCatPawOpenApiBase(catApiBase.value);
  const apiBaseChanged = !!(nextApiBase && nextApiBase !== prevSavedApiBase);
  let sitesPayload = null;
  let sitesFetchError = '';
  const normalizedForFetch = normalizeCatPawOpenApiBase(catApiBase.value);
  if (normalizedForFetch) {
    try {
      const fullConfig = await requestCatWebsiteJson('full-config', { method: 'GET' });
      const list = fullConfig && fullConfig.video && Array.isArray(fullConfig.video.sites) ? fullConfig.video.sites : [];
      sitesPayload = list
        .map((s) => ({
          key: s && typeof s.key === 'string' ? s.key : '',
          name: s && typeof s.name === 'string' ? s.name : '',
          api: s && typeof s.api === 'string' ? s.api : '',
        }))
        .filter((s) => s.key && s.api);
    } catch (e) {
      sitesFetchError = (e && e.message) ? String(e.message) : '站点列表更新失败';
      sitesPayload = null;
    }
  }
  try {
    const data = await apiPutJson('/api/user/settings', {
        catApiBase: String(catApiBase.value || '').trim(),
        catApiKey: String(catApiKey.value || ''),
        // Avoid overriding CatPawOpen proxy when first setting/changing CatPawOpen API base.
        // We'll reload proxy from CatPawOpen after save instead.
        catProxy: apiBaseChanged ? undefined : String(catProxy.value || ''),
        searchThreadCount: stInt,
        searchSiteOrder: Array.isArray(searchSiteOrder.value) ? searchSiteOrder.value : [],
        searchCoverSite: String(searchCoverSite.value || ''),
        sites: Array.isArray(sitesPayload) ? sitesPayload : undefined,
      }, { dedupe: false });
    if (!data || data.success !== true) throw new Error((data && data.message) || '保存失败');
    savedCatApiBase.value = nextApiBase;
    // Don't auto-fetch proxy here; saving already pushes user input to CatPawOpen (best-effort).
    try {
      const cfgEl = document.getElementById('homeDoubanConfig');
      if (cfgEl) {
        cfgEl.setAttribute('data-cat-api-base', savedCatApiBase.value || '');
        cfgEl.setAttribute('data-search-thread-count', String(stInt));
        cfgEl.setAttribute('data-search-site-order', JSON.stringify(searchSiteOrder.value || []));
        cfgEl.setAttribute('data-search-cover-site', String(searchCoverSite.value || ''));
      }
      window.dispatchEvent(
        new CustomEvent('tv:user-settings-updated', {
          detail: {
            catApiBase: savedCatApiBase.value || '',
            searchThreadCount: stInt,
            searchSiteOrder: searchSiteOrder.value || [],
            searchCoverSite: String(searchCoverSite.value || ''),
          },
        })
      );
    } catch (_e) {}
    const sitesSync = data && data.sitesSync && typeof data.sitesSync === 'object' ? data.sitesSync : null;
    if (sitesSync && sitesSync.ok === false) {
      msgKind.value = 'error';
      msg.value = (sitesSync && sitesSync.message) ? `站点列表更新失败：${sitesSync.message}` : '站点列表更新失败';
      collapseAccordionsAfterSave();
      return;
    }

    if (sitesFetchError) {
      msgKind.value = 'success';
      msg.value = `保存成功（站点列表更新失败：${sitesFetchError}）`;
      collapseAccordionsAfterSave();
      return;
    }

    // Sync user's desired global proxy into CatPawOpen (best-effort; don't block saving).
    // When CatPawOpen API base changed, do NOT set proxy; instead reload current proxy from CatPawOpen.
    const proxySyncErrors = [];
    if (savedCatApiBase.value) {
      try {
        if (!apiBaseChanged) {
          await requestCatWebsiteJson('admin/settings', {
            method: 'PUT',
            body: JSON.stringify({ proxy: String(catProxy.value || '') }),
          });
          catProxyStatus.value = 'ok';
		        } else {
		          await loadCatProxyRealtime();
	          // Persist the reloaded proxy to TV_Server so next open shows correct value.
	          try {
	            await apiPutJson(
	              '/api/user/settings',
	              {
	                catApiBase: String(catApiBase.value || '').trim(),
	                catApiKey: String(catApiKey.value || ''),
	                catProxy: String(catProxy.value || ''),
	                searchThreadCount: stInt,
	              },
	              { dedupe: false }
	            );
	          } catch (_e) {}
	        }
	      } catch (e) {
	        catProxyStatus.value = 'error';
        proxySyncErrors.push((e && e.message) ? String(e.message) : '同步失败');
      }
    }

	    // Shared users: sync admin-managed pan credentials to the user's CatPawOpen (client-side).
	    if (userRole.value === 'shared' && savedCatApiBase.value) {
	      const cookieSyncErrors = [];
	      try {
	        const data2 = await apiGetJson('/api/user/pan-login-settings', { cacheMs: 0 });
	        if (!data2 || data2.success !== true) throw new Error((data2 && data2.message) || '读取失败');
	        const store = data2.settings && typeof data2.settings === 'object' ? data2.settings : {};
	        const keys = Object.keys(store || {});
	        for (let i = 0; i < keys.length; i += 1) {
	          const key = typeof keys[i] === 'string' ? keys[i].trim() : '';
          if (!key) continue;
          const v = store[key];
          if (!v || typeof v !== 'object') continue;
          try {
            if (typeof v.cookie === 'string') {
              await requestCatWebsiteJson(`website/${encodeURIComponent(key)}/cookie`, {
                method: 'PUT',
                body: JSON.stringify({ cookie: v.cookie }),
              });
            } else if (typeof v.username === 'string' || typeof v.password === 'string') {
              await requestCatWebsiteJson(`website/${encodeURIComponent(key)}/account`, {
                method: 'PUT',
                body: JSON.stringify({
                  username: typeof v.username === 'string' ? v.username : '',
                  password: typeof v.password === 'string' ? v.password : '',
                }),
              });
            }
          } catch (e) {
            cookieSyncErrors.push(`${key}: ${(e && e.message) || '同步失败'}`);
          }
        }
      } catch (e) {
        cookieSyncErrors.push(`读取后台 Cookie 配置失败：${(e && e.message) || '未知错误'}`);
      }
      if (cookieSyncErrors.length > 0) {
        msgKind.value = 'success';
        msg.value = `保存成功，但 Cookie 同步失败：${cookieSyncErrors.slice(0, 3).join('；')}${cookieSyncErrors.length > 3 ? `…（共 ${cookieSyncErrors.length} 项）` : ''}`;
        collapseAccordionsAfterSave();
        return;
      }
    }

    msgKind.value = 'success';
    if (proxySyncErrors.length > 0) {
      msg.value = `保存成功，但 CatPawOpen 代理同步失败：${proxySyncErrors[0]}`;
    } else {
      msg.value = sitesSync && sitesSync.refreshed ? `保存成功（站点 ${sitesSync.count || 0}）` : '保存成功';
    }
    collapseAccordionsAfterSave();
  } catch (e) {
    msgKind.value = 'error';
    msg.value = (e && e.message) || '保存失败';
  } finally {
    saving.value = false;
  }
};

const requestCatWebsiteJson = async (path, init = {}) => {
  const normalized = normalizeCatPawOpenApiBase(catApiBase.value);
  if (!normalized) throw new Error('CatPawOpen 接口地址未设置');
  const url = new URL(path.replace(/^\//, ''), normalized);
  const headers = Object.assign({}, init.headers && typeof init.headers === 'object' ? init.headers : {});
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  const u = (tvUser.value || '').trim();
  if (u) headers['X-TV-User'] = u;

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

const hasCatApiBase = computed(() => !!normalizeCatPawOpenApiBase(catApiBase.value));
const shouldRequireCatApiBaseForSites = computed(() => userRole.value === 'user');
const canShowUserSitesSettings = computed(() => userRole.value !== 'shared' || !!(savedCatApiBase.value || '').trim());

// -------------------- 用户站点列表（TV_Server 入库） --------------------
const userSitesOpen = ref(false);
const userSitesLoading = ref(false);
const userSitesSaving = ref(false);
const userSitesError = ref('');
const userSites = ref([]);
const userSitesSelected = ref(new Set());

const userSitesSelectedCount = computed(() => (userSitesSelected.value ? userSitesSelected.value.size : 0));
const userSitesAllSelected = computed(() => {
  const list = Array.isArray(userSites.value) ? userSites.value : [];
  const keys = list.map((s) => (s && typeof s.key === 'string' ? s.key : '')).filter((k) => k);
  if (!keys.length) return false;
  const selected = userSitesSelected.value || new Set();
  return keys.every((k) => selected.has(k));
});

const clearUserSitesSelection = () => {
  userSitesSelected.value = new Set();
};

const toggleUserSiteSelected = (key) => {
  const k = typeof key === 'string' ? key : '';
  if (!k) return;
  const next = new Set(userSitesSelected.value || []);
  if (next.has(k)) next.delete(k);
  else next.add(k);
  userSitesSelected.value = next;
};

const isUserSiteSelected = (key) => {
  const k = typeof key === 'string' ? key : '';
  return !!(k && userSitesSelected.value && userSitesSelected.value.has(k));
};

const toggleUserSitesSelectAll = () => {
  const list = Array.isArray(userSites.value) ? userSites.value : [];
  const allKeys = list.map((s) => (s && typeof s.key === 'string' ? s.key : '')).filter((k) => k);
  if (!allKeys.length) return;
  userSitesSelected.value = userSitesAllSelected.value ? new Set() : new Set(allKeys);
};

	const loadUserSites = async () => {
	  if (shouldRequireCatApiBaseForSites.value && !hasCatApiBase.value) {
	    userSitesError.value = 'CatPawOpen 接口地址未设置';
	    userSites.value = [];
	    clearUserSitesSelection();
	    return;
	  }
	  if (userSitesLoading.value) return;
	  userSitesLoading.value = true;
	  userSitesError.value = '';
	  try {
	    const data = await apiGetJson('/api/user/sites', { cacheMs: 0 });
	    if (!data || data.success !== true) throw new Error((data && data.message) || '加载失败');
		    userSites.value = Array.isArray(data.sites) ? data.sites : [];
		    clearUserSitesSelection();
		  } catch (e) {
		    userSitesError.value = (e && e.message) || '加载失败';
	    userSites.value = [];
	    clearUserSitesSelection();
  } finally {
    userSitesLoading.value = false;
  }
};

const toggleUserSites = async () => {
  userSitesOpen.value = !userSitesOpen.value;
  if (userSitesOpen.value) {
    if (shouldRequireCatApiBaseForSites.value && !hasCatApiBase.value) {
      userSitesLoading.value = false;
      userSitesError.value = 'CatPawOpen 接口地址未设置';
      userSites.value = [];
      return;
    }
    await loadUserSites();
  }
};

	const updateUserSiteAvailability = async (key, availability) => {
	  const k = typeof key === 'string' ? key.trim() : '';
	  if (!k) return;
	  const data = await apiPostJson('/api/user/sites/availability', { key: k, availability: String(availability || '') }, { dedupe: false });
	  if (!data || data.success !== true) throw new Error((data && data.message) || '保存失败');
	};

const extractSpiderNameFromApi = (api) => {
  const raw = typeof api === 'string' ? api.trim() : '';
  if (!raw) return '';
  const m = raw.match(/\/spider\/([^/]+)\//);
  return m && m[1] ? String(m[1]) : '';
};

const checkOneUserSite = async (site) => {
  const normalized = normalizeCatPawOpenApiBase(catApiBase.value);
  if (!normalized) throw new Error('CatPawOpen 接口地址未设置');
  const api = site && typeof site.api === 'string' ? site.api : '';
  const spiderName = extractSpiderNameFromApi(api);
  if (spiderName === 'baseset') {
    const url = new URL('website', normalized);
    const headers = {};
    const u = (tvUser.value || '').trim();
    if (u) headers['X-TV-User'] = u;
    const resp = await fetch(url.toString(), { method: 'GET', headers, credentials: 'omit' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return 'valid';
  }

  const data = await requestCatSpider({
    apiBase: normalized,
    username: tvUser.value,
    action: 'search',
    spiderApi: api,
    payload: { wd: '斗破', page: 1 },
  });
  const list =
    (data && Array.isArray(data.list) && data.list) ||
    (data && data.data && Array.isArray(data.data.list) && data.data.list) ||
    [];
  return list.length > 0 ? 'valid' : 'unknown';
};

const batchCheckUserSites = async () => {
  if (!userSitesSelectedCount.value) return;
  if (!hasCatApiBase.value) {
    userSitesError.value = 'CatPawOpen 接口地址未设置';
    return;
  }
  userSitesSaving.value = true;
  userSitesError.value = '';
  try {
    const list = Array.isArray(userSites.value) ? userSites.value : [];
    for (let i = 0; i < list.length; i += 1) {
      const s = list[i];
      const key = s && typeof s.key === 'string' ? s.key : '';
      if (!key || !isUserSiteSelected(key)) continue;
      let availability = 'invalid';
      try {
        availability = await checkOneUserSite(s);
      } catch (_e) {
        availability = 'invalid';
      }
      userSites.value = userSites.value.map((it) => (it && it.key === key ? { ...it, availability } : it));
      await updateUserSiteAvailability(key, availability);
    }
  } catch (e) {
    userSitesError.value = (e && e.message) || '检测失败';
  } finally {
    userSitesSaving.value = false;
  }
};

const batchSetUserSitesEnabled = async (enabled) => {
  const nextEnabled = !!enabled;
  if (!userSitesSelectedCount.value) return;
  userSitesSaving.value = true;
  userSitesError.value = '';
  try {
    const list = Array.isArray(userSites.value) ? userSites.value : [];
    for (let i = 0; i < list.length; i += 1) {
      const s = list[i];
      const key = s && typeof s.key === 'string' ? s.key : '';
      if (!key || !isUserSiteSelected(key)) continue;
      const data = await apiPostJson('/api/user/sites/status', { key, enabled: nextEnabled }, { dedupe: false });
      if (!data || data.success !== true) throw new Error((data && data.message) || '保存失败');
      userSites.value = userSites.value.map((it) => (it && it.key === key ? { ...it, enabled: nextEnabled } : it));
    }
  } catch (e) {
    userSitesError.value = (e && e.message) || '操作失败';
  } finally {
    userSitesSaving.value = false;
  }
};

	const saveUserSitesOrder = async () => {
	  const order = (userSites.value || []).map((s) => s && s.key).filter((k) => typeof k === 'string' && k.trim());
	  userSitesSaving.value = true;
	  try {
	    const data = await apiPostJson('/api/user/sites/order', { order }, { dedupe: false });
	    if (!data || data.success !== true) throw new Error((data && data.message) || '保存失败');
	  } finally {
	    userSitesSaving.value = false;
	  }
	};

const moveUserSite = async (idx, delta) => {
  const next = userSites.value.slice();
  const j = idx + delta;
  if (j < 0 || j >= next.length) return;
  const tmp = next[idx];
  next[idx] = next[j];
  next[j] = tmp;
  userSites.value = next;
  try {
    await saveUserSitesOrder();
  } catch (e) {
    userSitesError.value = (e && e.message) || '排序保存失败';
    await loadUserSites();
  }
};

	const toggleUserSiteEnabled = async (idx) => {
  const s = userSites.value[idx];
  if (!s || !s.key) return;
	  const nextEnabled = !s.enabled;
	  userSitesSaving.value = true;
	  try {
	    const data = await apiPostJson('/api/user/sites/status', { key: s.key, enabled: nextEnabled }, { dedupe: false });
	    if (!data || data.success !== true) throw new Error((data && data.message) || '保存失败');
	    userSites.value[idx] = { ...s, enabled: nextEnabled };
	  } catch (e) {
	    userSitesError.value = (e && e.message) || '保存失败';
  } finally {
    userSitesSaving.value = false;
  }
};

	const toggleUserSiteHome = async (idx) => {
  const s = userSites.value[idx];
  if (!s || !s.key) return;
	  const nextHome = !s.home;
	  userSitesSaving.value = true;
	  try {
	    const data = await apiPostJson('/api/user/sites/home', { key: s.key, home: nextHome }, { dedupe: false });
	    if (!data || data.success !== true) throw new Error((data && data.message) || '保存失败');
	    userSites.value[idx] = { ...s, home: nextHome };
	  } catch (e) {
	    userSitesError.value = (e && e.message) || '保存失败';
  } finally {
    userSitesSaving.value = false;
  }
};

// -------------------- 站点搜索结果设置（仅保存，不直接改搜索逻辑） --------------------
const searchResultOpen = ref(false);
const searchResultLoading = ref(false);
const searchResultError = ref('');

const reconcileSearchSettingsWithSites = (sites) => {
  const list = Array.isArray(sites) ? sites : [];
  const keys = list.map((s) => (s && typeof s.key === 'string' ? s.key : '')).filter((k) => k);
  if (!keys.length) {
    searchSiteOrder.value = [];
    searchCoverSite.value = '';
    return;
  }

  const keySet = new Set(keys);
  const prevOrder = Array.isArray(searchSiteOrder.value) ? searchSiteOrder.value : [];
  const nextOrder = [];
  const seen = new Set();
  prevOrder.forEach((k) => {
    const key = typeof k === 'string' ? k.trim() : '';
    if (!key || !keySet.has(key) || seen.has(key)) return;
    seen.add(key);
    nextOrder.push(key);
  });
  keys.forEach((k) => {
    if (!k || seen.has(k)) return;
    seen.add(k);
    nextOrder.push(k);
  });
  searchSiteOrder.value = nextOrder;

  const cover = typeof searchCoverSite.value === 'string' ? searchCoverSite.value.trim() : '';
  if (cover && keySet.has(cover)) return;
  const enabledFirst = list.find((s) => s && s.enabled) || null;
  searchCoverSite.value = (enabledFirst && enabledFirst.key) || nextOrder[0] || '';
};

const searchResultSites = computed(() => {
  const list = Array.isArray(userSites.value) ? userSites.value : [];
  const byKey = new Map();
  list.forEach((s) => {
    if (s && typeof s.key === 'string') byKey.set(s.key, s);
  });
  const order = Array.isArray(searchSiteOrder.value) ? searchSiteOrder.value : [];
  const out = [];
  const seen = new Set();
  order.forEach((k) => {
    const key = typeof k === 'string' ? k.trim() : '';
    if (!key || seen.has(key)) return;
    const s = byKey.get(key);
    if (!s) return;
    seen.add(key);
    out.push(s);
  });
  list.forEach((s) => {
    const key = s && typeof s.key === 'string' ? s.key : '';
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(s);
  });
  return out;
});

const ensureSearchResultSitesLoaded = async () => {
  searchResultLoading.value = true;
  searchResultError.value = '';
  try {
    if (!Array.isArray(userSites.value) || userSites.value.length === 0) {
      await loadUserSites();
    }
    reconcileSearchSettingsWithSites(userSites.value);
  } catch (e) {
    searchResultError.value = (e && e.message) || '加载失败';
  } finally {
    searchResultLoading.value = false;
  }
};

const toggleSearchResultSettings = async () => {
  searchResultOpen.value = !searchResultOpen.value;
  if (searchResultOpen.value) {
    await ensureSearchResultSitesLoaded();
  }
};

const setSearchCoverSite = (key) => {
  const k = typeof key === 'string' ? key.trim() : '';
  if (!k) return;
  searchCoverSite.value = k;
};

const moveSearchSite = (idx, delta) => {
  const list = searchResultSites.value;
  const curr = list[idx];
  const next = list[idx + delta];
  if (!curr || !next) return;
  const order = Array.isArray(searchSiteOrder.value) ? searchSiteOrder.value.slice() : [];
  const i = order.findIndex((k) => k === curr.key);
  const j = order.findIndex((k) => k === next.key);
  if (i < 0 || j < 0) return;
  const tmp = order[i];
  order[i] = order[j];
  order[j] = tmp;
  searchSiteOrder.value = order;
};

// -------------------- 网盘设置（/website/pans/list） --------------------
const panListOpen = ref(false);
const panListLoading = ref(false);
const panListSaving = ref(false);
const panListError = ref('');
const panListSavedMsg = ref('');
const panListSavedErr = ref('');
const panList = ref([]);

const loadPanList = async () => {
  if (panListLoading.value) return;
  panListLoading.value = true;
  panListError.value = '';
  panListSavedMsg.value = '';
  panListSavedErr.value = '';
  try {
    const data = await requestCatWebsiteJson('website/pans/list');
    const list = Array.isArray(data) ? data : [];
    panList.value = list
      .map((it) => ({
        key: it && typeof it.key === 'string' ? it.key : '',
        name: it && typeof it.name === 'string' ? it.name : '',
        enable: !!(it && it.enable),
      }))
      .filter((it) => it.key);
  } catch (e) {
    panListError.value = (e && e.message) || '加载失败';
    panList.value = [];
  } finally {
    panListLoading.value = false;
  }
};

const savePanList = async () => {
  if (panListSaving.value) return;
  panListSaving.value = true;
  panListSavedMsg.value = '';
  panListSavedErr.value = '';
  try {
    const list = (panList.value || []).map((it) => ({
      key: it.key,
      name: it.name,
      enable: !!it.enable,
    }));
    await requestCatWebsiteJson('website/pans/list', {
      method: 'PUT',
      body: JSON.stringify({ list }),
    });
    panListSavedMsg.value = '同步成功';
  } catch (e) {
    panListSavedErr.value = (e && e.message) || '同步失败';
  } finally {
    panListSaving.value = false;
  }
};

const togglePanList = () => {
  panListOpen.value = !panListOpen.value;
  if (panListOpen.value && !panList.value.length) loadPanList();
};

const togglePanEnable = (idx) => {
  const list = Array.isArray(panList.value) ? panList.value.slice() : [];
  const it = list[idx];
  if (!it) return;
  list[idx] = { ...it, enable: !it.enable };
  panList.value = list;
  savePanList();
};

const movePan = (idx, delta) => {
  const list = Array.isArray(panList.value) ? panList.value.slice() : [];
  const j = idx + delta;
  if (idx < 0 || idx >= list.length) return;
  if (j < 0 || j >= list.length) return;
  const tmp = list[idx];
  list[idx] = list[j];
  list[j] = tmp;
  panList.value = list;
  savePanList();
};

// -------------------- 网盘 Cookie 设置（/website/*/(cookie|account)） --------------------
const PAN_LOGIN_ITEMS = [
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

const panCookieOpen = ref(false);
const panCookieLoading = ref(false);
const panCookieSaving = ref(false);
const panCookieError = ref('');
const panCookieSavedMsg = ref('');
const panCookieSavedErr = ref('');

const activePanKey = ref(PAN_LOGIN_ITEMS[0] ? PAN_LOGIN_ITEMS[0].key : '');
const loadedPanKeys = ref(new Set());
const cookieValue = ref('');
const accountUsername = ref('');
const accountPassword = ref('');

const activePanMeta = computed(() => PAN_LOGIN_ITEMS.find((it) => it.key === activePanKey.value) || PAN_LOGIN_ITEMS[0] || null);
const activePanType = computed(() => (activePanMeta.value && activePanMeta.value.type) || 'cookie');
const activePanName = computed(() => (activePanMeta.value && activePanMeta.value.name) || '');

const resetPanEditorValues = () => {
  cookieValue.value = '';
  accountUsername.value = '';
  accountPassword.value = '';
};

const loadPanCredential = async (key) => {
  const meta = PAN_LOGIN_ITEMS.find((it) => it.key === key);
  if (!meta) return;
  if (loadedPanKeys.value && loadedPanKeys.value.has(key)) return;
  panCookieLoading.value = true;
  panCookieError.value = '';
  panCookieSavedMsg.value = '';
  panCookieSavedErr.value = '';
  resetPanEditorValues();
  try {
    const data = await requestCatWebsiteJson(`website/${encodeURIComponent(key)}/${meta.type === 'account' ? 'account' : 'cookie'}`);
    const obj = data && typeof data === 'object' ? data : {};
    if (meta.type === 'cookie') {
      cookieValue.value = typeof obj.cookie === 'string' ? obj.cookie : '';
    } else {
      accountUsername.value = typeof obj.username === 'string' ? obj.username : '';
      accountPassword.value = typeof obj.password === 'string' ? obj.password : '';
    }
    const next = new Set(Array.from(loadedPanKeys.value || []));
    next.add(key);
    loadedPanKeys.value = next;
  } catch (e) {
    panCookieError.value = (e && e.message) || '加载失败';
  } finally {
    panCookieLoading.value = false;
  }
};

const selectPanKey = (key) => {
  const safe = typeof key === 'string' ? key : '';
  if (!safe || safe === activePanKey.value) return;
  activePanKey.value = safe;
  loadPanCredential(safe);
};

const togglePanCookie = () => {
  panCookieOpen.value = !panCookieOpen.value;
  if (panCookieOpen.value) loadPanCredential(activePanKey.value);
};

const savePanCredential = async () => {
  if (panCookieSaving.value) return;
  const meta = activePanMeta.value;
  if (!meta) return;

  panCookieSaving.value = true;
  panCookieSavedMsg.value = '';
  panCookieSavedErr.value = '';
  panCookieError.value = '';
  try {
    if (meta.type === 'cookie') {
      await requestCatWebsiteJson(`website/${encodeURIComponent(meta.key)}/cookie`, {
        method: 'PUT',
        body: JSON.stringify({ cookie: String(cookieValue.value || '') }),
      });
    } else {
      await requestCatWebsiteJson(`website/${encodeURIComponent(meta.key)}/account`, {
        method: 'PUT',
        body: JSON.stringify({
          username: String(accountUsername.value || ''),
          password: String(accountPassword.value || ''),
        }),
      });
    }
    panCookieSavedMsg.value = '保存成功';
  } catch (e) {
    panCookieSavedErr.value = (e && e.message) || '保存失败';
  } finally {
    panCookieSaving.value = false;
  }
};

const onOpenEvent = () => {
  open.value = true;
  resetPanModules();
  loadSettings();
};

const onKeyDown = (e) => {
  if (!open.value) return;
  if (e.key === 'Escape') close();
};

onMounted(() => {
  window.addEventListener('tv:open-user-settings', onOpenEvent);
  window.addEventListener('keydown', onKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('tv:open-user-settings', onOpenEvent);
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<style scoped>
.tv-us-backdrop {
  position: fixed;
  inset: 0;
  z-index: 25000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(8px);
}

.tv-us-card {
  width: min(720px, 100%);
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

:global(.dark) .tv-us-card {
  background: rgba(15, 23, 42, 0.92);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
}

.tv-us-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

:global(.dark) .tv-us-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.tv-us-title {
  font-size: 20px;
  font-weight: 800;
  color: rgba(17, 24, 39, 1);
}

:global(.dark) .tv-us-title {
  color: rgba(243, 244, 246, 1);
}

.tv-us-close {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.7);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(55, 65, 81, 1);
}

.tv-us-close:hover {
  background: rgba(255, 255, 255, 0.9);
}

:global(.dark) .tv-us-close {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(229, 231, 235, 1);
}

:global(.dark) .tv-us-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tv-us-body {
  padding: 18px 20px 20px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.tv-us-form {
  display: grid;
  gap: 12px;
}

.tv-us-row {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 12px;
  align-items: center;
}

.tv-us-label {
  font-size: 13px;
  font-weight: 700;
  color: rgba(55, 65, 81, 1);
  white-space: nowrap;
}

:global(.dark) .tv-us-label {
  color: rgba(203, 213, 225, 1);
}

.tv-us-input {
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.8);
  padding: 0 12px;
  font-size: 14px;
  color: rgba(17, 24, 39, 1);
  outline: none;
}

.tv-us-input:focus {
  border-color: rgba(34, 197, 94, 0.55);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
}

.tv-us-input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

:global(.dark) .tv-us-input {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(243, 244, 246, 1);
}

:global(.dark) .tv-us-input:focus {
  border-color: rgba(34, 197, 94, 0.6);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.22);
}

.tv-us-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}

.tv-us-msg {
  margin-right: auto;
  font-size: 13px;
  font-weight: 700;
  color: rgba(107, 114, 128, 1);
}

.tv-us-msg[data-kind='success'] {
  color: rgba(22, 163, 74, 1);
}

.tv-us-msg[data-kind='error'] {
  color: rgba(220, 38, 38, 1);
}

.tv-us-save {
  height: 40px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.55);
  background: rgba(34, 197, 94, 0.14);
  color: rgba(17, 24, 39, 1);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.tv-us-save:hover {
  background: rgba(34, 197, 94, 0.2);
}

:global(.dark) .tv-us-save {
  color: rgba(243, 244, 246, 1);
  background: rgba(34, 197, 94, 0.18);
  border-color: rgba(34, 197, 94, 0.6);
}

:global(.dark) .tv-us-save:hover {
  background: rgba(34, 197, 94, 0.24);
}

.tv-us-save:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.tv-us-save.mini {
  height: 38px;
  border-radius: 12px;
  padding: 0 16px;
}

.tv-us-divider {
  height: 1px;
  margin: 16px 0;
  background: rgba(0, 0, 0, 0.06);
}

:global(.dark) .tv-us-divider {
  background: rgba(255, 255, 255, 0.08);
}

.tv-us-accordion {
  display: grid;
  gap: 12px;
}

.tv-us-acc-item {
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.72);
  overflow: hidden;
}

:global(.dark) .tv-us-acc-item {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.tv-us-acc-head {
  width: 100%;
  height: 46px;
  padding: 0 14px 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 14px;
  font-weight: 800;
  color: rgba(17, 24, 39, 1);
  background: transparent;
  border: none;
  cursor: pointer;
}

:global(.dark) .tv-us-acc-head {
  color: rgba(243, 244, 246, 1);
}

.tv-us-acc-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.55);
  color: rgba(55, 65, 81, 1);
  transition: transform 0.18s ease;
}

.tv-us-acc-icon[data-open='true'] {
  transform: rotate(180deg);
}

:global(.dark) .tv-us-acc-icon {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(229, 231, 235, 1);
}

.tv-us-acc-body {
  padding: 12px 14px 14px;
}

.tv-us-pan-list {
  display: grid;
  gap: 10px;
  max-height: min(56vh, 560px);
  overflow-y: auto;
  padding-right: 2px;
}

.tv-us-acc-status {
  font-size: 13px;
  font-weight: 700;
  color: rgba(107, 114, 128, 1);
}

:global(.dark) .tv-us-acc-status {
  color: rgba(148, 163, 184, 1);
}

.tv-us-acc-status.success {
  color: rgba(22, 163, 74, 1);
}

.tv-us-acc-status.error {
  color: rgba(220, 38, 38, 1);
}

.tv-us-pan-table {
  display: grid;
  gap: 10px;
}

.tv-us-pan-head,
.tv-us-pan-row {
  display: grid;
  grid-template-columns: 1fr 120px 92px;
  gap: 10px;
  align-items: center;
}

.tv-us-pan-table[data-kind='sites'] .tv-us-pan-head,
.tv-us-pan-table[data-kind='sites'] .tv-us-pan-row {
  grid-template-columns: 34px 1fr 110px 120px 120px 92px;
}

.tv-us-pan-head {
  padding: 0 8px;
  font-size: 12px;
  font-weight: 800;
  color: rgba(55, 65, 81, 0.9);
}

:global(.dark) .tv-us-pan-head {
  color: rgba(203, 213, 225, 0.95);
}

.tv-us-pan-row {
  padding: 10px 8px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.8);
}

:global(.dark) .tv-us-pan-row {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.tv-us-pan-col.select,
.tv-us-pan-col.enable,
.tv-us-pan-col.order,
.tv-us-pan-col.availability {
  display: flex;
  justify-content: center;
}

.tv-us-pan-col.name {
  display: flex;
  justify-content: flex-start;
}

.tv-us-pan-name {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 700;
  color: rgba(17, 24, 39, 1);
}

:global(.dark) .tv-us-pan-name {
  color: rgba(243, 244, 246, 1);
}

.tv-us-switch {
  position: relative;
  width: 54px;
  height: 28px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: rgba(209, 213, 219, 1);
}

.tv-us-switch[data-on='true'] {
  background: rgba(34, 197, 94, 1);
}

.tv-us-switch:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.tv-us-switch-dot {
  position: absolute;
  top: 50%;
  left: 5px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 1);
  transform: translateY(-50%);
  transition: left 0.18s ease;
}

.tv-us-switch[data-on='true'] .tv-us-switch-dot {
  left: 31px;
}

.tv-us-order-btns {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.tv-us-order-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.8);
  color: rgba(31, 41, 55, 1);
  cursor: pointer;
  padding: 0;
  line-height: 0;
}

.tv-us-order-btn svg {
  display: block;
}

.tv-us-order-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

:global(.dark) .tv-us-order-btn {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(229, 231, 235, 1);
}

.tv-us-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: rgba(34, 197, 94, 1);
}

.tv-us-sites-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 8px 0;
}

.tv-us-sites-actions__btns {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tv-us-batch-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  background: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 800;
  color: rgba(31, 41, 55, 1);
  cursor: pointer;
  white-space: nowrap;
}

.tv-us-batch-btn:hover {
  background: rgba(255, 255, 255, 0.9);
}

.tv-us-batch-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tv-us-batch-btn.ok {
  border-color: rgba(34, 197, 94, 0.6);
  color: rgba(22, 163, 74, 1);
}

.tv-us-batch-btn.danger {
  border-color: rgba(239, 68, 68, 0.6);
  color: rgba(220, 38, 38, 1);
}

:global(.dark) .tv-us-batch-btn {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(226, 232, 240, 1);
}

:global(.dark) .tv-us-batch-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

:global(.dark) .tv-us-batch-btn.ok {
  border-color: rgba(34, 197, 94, 0.7);
  color: rgba(134, 239, 172, 1);
}

:global(.dark) .tv-us-batch-btn.danger {
  border-color: rgba(248, 113, 113, 0.6);
  color: rgba(252, 165, 165, 1);
}

.tv-us-availability {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(243, 244, 246, 1);
  color: rgba(107, 114, 128, 1);
  white-space: nowrap;
}

.tv-us-availability-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(156, 163, 175, 1);
}

.tv-us-availability[data-status='valid'] {
  background: rgba(220, 252, 231, 1);
  color: rgba(22, 163, 74, 1);
}

.tv-us-availability[data-status='valid'] .tv-us-availability-dot {
  background: rgba(34, 197, 94, 1);
}

.tv-us-availability[data-status='invalid'] {
  background: rgba(254, 226, 226, 1);
  color: rgba(220, 38, 38, 1);
}

.tv-us-availability[data-status='invalid'] .tv-us-availability-dot {
  background: rgba(239, 68, 68, 1);
}

.tv-us-availability[data-status='unknown'] {
  background: rgba(254, 249, 195, 1);
  color: rgba(202, 138, 4, 1);
}

.tv-us-availability[data-status='unknown'] .tv-us-availability-dot {
  background: rgba(234, 179, 8, 1);
}

:global(.dark) .tv-us-availability {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(148, 163, 184, 1);
}

:global(.dark) .tv-us-availability-dot {
  background: rgba(148, 163, 184, 1);
}

:global(.dark) .tv-us-availability[data-status='valid'] {
  background: rgba(34, 197, 94, 0.14);
  color: rgba(134, 239, 172, 1);
}

:global(.dark) .tv-us-availability[data-status='valid'] .tv-us-availability-dot {
  background: rgba(34, 197, 94, 1);
}

:global(.dark) .tv-us-availability[data-status='invalid'] {
  background: rgba(239, 68, 68, 0.14);
  color: rgba(252, 165, 165, 1);
}

:global(.dark) .tv-us-availability[data-status='invalid'] .tv-us-availability-dot {
  background: rgba(248, 113, 113, 1);
}

:global(.dark) .tv-us-availability[data-status='unknown'] {
  background: rgba(234, 179, 8, 0.16);
  color: rgba(253, 224, 71, 1);
}

:global(.dark) .tv-us-availability[data-status='unknown'] .tv-us-availability-dot {
  background: rgba(234, 179, 8, 1);
}

.tv-us-pan-cookie {
  display: grid;
  gap: 12px;
}

.tv-us-pan-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tv-us-pan-tab {
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 800;
  color: rgba(55, 65, 81, 1);
  cursor: pointer;
}

.tv-us-pan-tab[data-active='true'] {
  border-color: rgba(34, 197, 94, 0.7);
  background: rgba(34, 197, 94, 0.12);
  color: rgba(17, 24, 39, 1);
}

:global(.dark) .tv-us-pan-tab {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(226, 232, 240, 1);
}

:global(.dark) .tv-us-pan-tab[data-active='true'] {
  border-color: rgba(34, 197, 94, 0.65);
  background: rgba(34, 197, 94, 0.18);
  color: rgba(243, 244, 246, 1);
}

.tv-us-pan-editor {
  display: grid;
  gap: 12px;
}

.tv-us-textarea {
  width: 100%;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 12px;
  font-size: 14px;
  color: rgba(17, 24, 39, 1);
  outline: none;
  resize: none;
}

.tv-us-textarea:focus {
  border-color: rgba(34, 197, 94, 0.55);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18);
}

:global(.dark) .tv-us-textarea {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(243, 244, 246, 1);
}

:global(.dark) .tv-us-textarea:focus {
  border-color: rgba(34, 197, 94, 0.6);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.22);
}

.tv-us-pan-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
</style>
