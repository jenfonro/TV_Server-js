const { URL } = require('url');

function resolveCatPawOpenFullConfigUrl(inputUrl) {
  const raw = typeof inputUrl === 'string' ? inputUrl.trim() : '';
  if (!raw) return '';
  let url;
  try {
    url = new URL(raw);
  } catch (_e) {
    return '';
  }

  const path = url.pathname || '/';

  if (/\/full-config\/?$/.test(path)) return url.toString();
  if (/\/config\/?$/.test(path)) {
    url.pathname = path.replace(/\/config\/?$/, '/full-config');
    return url.toString();
  }
  if (/\/website\/?$/.test(path)) {
    url.pathname = path.replace(/\/website\/?$/, '/full-config');
    return url.toString();
  }

  if (path === '/' || path === '') {
    url.pathname = '/full-config';
    return url.toString();
  }

  url.pathname = path.replace(/\/$/, '') + '/full-config';
  return url.toString();
}

function normalizeCatPawOpenApiBase(inputUrl) {
  const raw = typeof inputUrl === 'string' ? inputUrl.trim() : '';
  if (!raw) return '';
  let url;
  try {
    url = new URL(raw);
  } catch (_e) {
    return '';
  }

  let path = url.pathname || '/';
  // If user pasted a spider API (/spider/...), trim back to the service base.
  const spiderIdx = path.indexOf('/spider/');
  if (spiderIdx >= 0) path = path.slice(0, spiderIdx) || '/';
  path = path.replace(/\/spider\/?$/, '/');
  path = path.replace(/\/(full-config|config|website)\/?$/, '/');
  if (!path.endsWith('/')) path += '/';

  url.pathname = path;
  url.search = '';
  url.hash = '';
  return url.toString();
}

function normalizeCatPawOpenApiBaseOrThrow(inputUrl) {
  const normalized = normalizeCatPawOpenApiBase(inputUrl);
  if (!normalized) throw new Error('CatPawOpen 接口地址不是合法 URL');
  return normalized;
}

function resolveCatPawOpenWebsiteUrl(apiBase, websitePath) {
  const normalized = normalizeCatPawOpenApiBase(apiBase);
  if (!normalized) throw new Error('CatPawOpen 接口地址未设置');
  const clean = String(websitePath || '').replace(/^\//, '');
  return new URL(clean, normalized).toString();
}

function resolveCatPawOpenAdminUrl(apiBase, adminPath) {
  const normalized = normalizeCatPawOpenApiBase(apiBase);
  if (!normalized) throw new Error('CatPawOpen 接口地址未设置');
  const clean = String(adminPath || '').replace(/^\//, '');
  return new URL(clean, normalized).toString();
}

function resolveCatPawOpenSpiderUrl(apiBase, spiderBasePath, action) {
  const normalized = normalizeCatPawOpenApiBase(apiBase);
  if (!normalized) throw new Error('CatPawOpen 接口地址未设置');
  const spider = typeof spiderBasePath === 'string' ? spiderBasePath.trim() : '';
  const act = typeof action === 'string' ? action.trim().replace(/^\//, '') : '';
  if (!spider || spider.indexOf('/spider/') !== 0) throw new Error('站点 API 无效');
  const cleanSpider = spider.replace(/\/$/, '').replace(/^\//, '');
  return new URL(`${cleanSpider}/${act}`, normalized).toString();
}

module.exports = {
  resolveCatPawOpenFullConfigUrl,
  normalizeCatPawOpenApiBase,
  normalizeCatPawOpenApiBaseOrThrow,
  resolveCatPawOpenWebsiteUrl,
  resolveCatPawOpenAdminUrl,
  resolveCatPawOpenSpiderUrl,
};

