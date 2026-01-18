export function normalizeCatPawOpenApiBase(inputUrl) {
  const raw = typeof inputUrl === 'string' ? inputUrl.trim() : '';
  if (!raw) return '';
  try {
    const url = new URL(raw);
    url.hash = '';
    url.search = '';
    let path = url.pathname || '/';
    const spiderIdx = path.indexOf('/spider/');
    if (spiderIdx >= 0) path = path.slice(0, spiderIdx) || '/';
    path = path.replace(/\/spider\/?$/, '/');
    path = path.replace(/\/(full-config|config|website)\/?$/, '/');
    // Keep pathname but ensure it ends with "/" so URL(resolve) works as expected.
    if (!path.endsWith('/')) path += '/';
    url.pathname = path;
    return url.toString();
  } catch (_e) {
    return '';
  }
}

export async function requestCatSpider({
  apiBase,
  username,
  action,
  spiderApi,
  payload,
  query,
  headers: extraHeaders,
}) {
  const safeAction = typeof action === 'string' ? action.trim() : '';
  const safeSpider = typeof spiderApi === 'string' ? spiderApi.trim() : '';
  const body = payload && typeof payload === 'object' ? payload : {};
  const q = query && typeof query === 'object' ? query : null;
  const extra = extraHeaders && typeof extraHeaders === 'object' ? extraHeaders : null;

  if (!safeAction) throw new Error('action 不能为空');
  if (!safeSpider || !safeSpider.startsWith('/spider/')) throw new Error('站点 API 无效');

  const normalizedBase = normalizeCatPawOpenApiBase(apiBase);
  if (!normalizedBase) throw new Error('CatPawOpen 接口地址未设置');

  const spiderPath = safeSpider.endsWith('/') ? safeSpider.slice(0, -1) : safeSpider;
  const target = new URL(`${spiderPath}/${encodeURIComponent(safeAction)}`, normalizedBase);
  if (q) {
    Object.entries(q).forEach(([k, v]) => {
      const key = typeof k === 'string' ? k.trim() : '';
      if (!key) return;
      if (v == null) return;
      target.searchParams.set(key, String(v));
    });
  }
  const headers = { 'Content-Type': 'application/json', ...(extra ? extra : {}) };
  const u = typeof username === 'string' ? username.trim() : '';
  if (u) headers['X-TV-User'] = u;

  const resp = await fetch(target.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'omit',
  });
  const status = resp && typeof resp.status === 'number' ? resp.status : 0;
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data && data.message ? String(data.message) : '请求失败';
    const err = new Error(msg);
    err.status = status;
    throw err;
  }
  return data;
}
