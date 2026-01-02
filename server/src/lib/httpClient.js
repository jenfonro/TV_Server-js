const http = require('http');
const https = require('https');
const { URL } = require('url');

function requestTextWithRedirects(urlString, options = {}) {
  const opts = options && typeof options === 'object' ? options : {};
  const method = typeof opts.method === 'string' ? opts.method.toUpperCase() : 'GET';
  const headers = opts.headers && typeof opts.headers === 'object' ? opts.headers : {};
  const body = opts.body != null ? String(opts.body) : '';
  const redirectsLeft = Number.isFinite(Number(opts.redirectsLeft)) ? Number(opts.redirectsLeft) : 5;
  const timeoutMs = Number.isFinite(Number(opts.timeoutMs)) ? Number(opts.timeoutMs) : 10000;
  const maxBytes = Number.isFinite(Number(opts.maxBytes)) ? Number(opts.maxBytes) : 4 * 1024 * 1024;

  return new Promise((resolve, reject) => {
    let url;
    try {
      url = new URL(urlString);
    } catch (_e) {
      reject(new Error('目标地址不是合法 URL'));
      return;
    }

    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers,
        timeout: timeoutMs,
      },
      (resp) => {
        const status = resp.statusCode || 0;
        if (status >= 300 && status < 400 && resp.headers.location) {
          if (redirectsLeft <= 0) {
            reject(new Error('重定向次数过多'));
            resp.resume();
            return;
          }
          const next = new URL(resp.headers.location, url);
          resp.resume();
          const keepMethod = status === 307 || status === 308;
          requestTextWithRedirects(next.toString(), {
            ...opts,
            method: keepMethod ? method : 'GET',
            headers,
            body: keepMethod ? body : '',
            redirectsLeft: redirectsLeft - 1,
          })
            .then(resolve)
            .catch(reject);
          return;
        }

        const chunks = [];
        let size = 0;
        let ended = false;
        const bail = (err) => {
          if (ended) return;
          ended = true;
          try {
            resp.destroy();
          } catch (_e) {}
          reject(err);
        };

        resp.on('data', (c) => {
          const buf = Buffer.isBuffer(c) ? c : Buffer.from(c);
          size += buf.length;
          if (maxBytes >= 0 && size > maxBytes) {
            bail(new Error('响应过大'));
            return;
          }
          chunks.push(buf);
        });
        resp.on('error', (e) => bail(e));
        resp.on('end', () => {
          if (ended) return;
          ended = true;
          const text = Buffer.concat(chunks).toString('utf8');
          resolve({ status, headers: resp.headers || {}, text });
        });
      }
    );

    req.on('timeout', () => req.destroy(new Error('请求超时')));
    req.on('error', (e) => reject(e));
    if (method !== 'GET' && method !== 'HEAD' && body) req.write(body);
    req.end();
  });
}

function requestBufferWithRedirects(urlString, options = {}) {
  const opts = options && typeof options === 'object' ? options : {};
  const method = typeof opts.method === 'string' ? opts.method.toUpperCase() : 'GET';
  const headers = opts.headers && typeof opts.headers === 'object' ? opts.headers : {};
  const body = opts.body != null ? String(opts.body) : '';
  const redirectsLeft = Number.isFinite(Number(opts.redirectsLeft)) ? Number(opts.redirectsLeft) : 5;
  const timeoutMs = Number.isFinite(Number(opts.timeoutMs)) ? Number(opts.timeoutMs) : 10000;
  const maxBytes = Number.isFinite(Number(opts.maxBytes)) ? Number(opts.maxBytes) : 15 * 1024 * 1024;

  return new Promise((resolve, reject) => {
    let url;
    try {
      url = new URL(urlString);
    } catch (_e) {
      reject(new Error('目标地址不是合法 URL'));
      return;
    }

    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers,
        timeout: timeoutMs,
      },
      (resp) => {
        const status = resp.statusCode || 0;
        if (status >= 300 && status < 400 && resp.headers.location) {
          if (redirectsLeft <= 0) {
            reject(new Error('重定向次数过多'));
            resp.resume();
            return;
          }
          const next = new URL(resp.headers.location, url);
          resp.resume();
          const keepMethod = status === 307 || status === 308;
          requestBufferWithRedirects(next.toString(), {
            ...opts,
            method: keepMethod ? method : 'GET',
            headers,
            body: keepMethod ? body : '',
            redirectsLeft: redirectsLeft - 1,
          })
            .then(resolve)
            .catch(reject);
          return;
        }

        const chunks = [];
        let size = 0;
        let ended = false;
        const bail = (err) => {
          if (ended) return;
          ended = true;
          try {
            resp.destroy();
          } catch (_e) {}
          reject(err);
        };

        resp.on('data', (c) => {
          const buf = Buffer.isBuffer(c) ? c : Buffer.from(c);
          size += buf.length;
          if (maxBytes >= 0 && size > maxBytes) {
            bail(new Error('响应过大'));
            return;
          }
          chunks.push(buf);
        });
        resp.on('error', (e) => bail(e));
        resp.on('end', () => {
          if (ended) return;
          ended = true;
          resolve({ status, headers: resp.headers || {}, buffer: Buffer.concat(chunks) });
        });
      }
    );

    req.on('timeout', () => req.destroy(new Error('请求超时')));
    req.on('error', (e) => reject(e));
    if (method !== 'GET' && method !== 'HEAD' && body) req.write(body);
    req.end();
  });
}

function httpRequestJsonWithRedirects(urlString, options = {}) {
  const opts = options && typeof options === 'object' ? options : {};
  const headers = opts.headers && typeof opts.headers === 'object' ? opts.headers : {};

  return requestTextWithRedirects(urlString, {
    ...opts,
    headers: { Accept: 'application/json,text/plain,*/*', ...headers },
  }).then(({ status, text }) => {
    if (status < 200 || status >= 300) throw new Error(`请求失败: HTTP ${status}`);
    try {
      return JSON.parse(text);
    } catch (_e) {
      throw new Error('响应不是合法 JSON');
    }
  });
}

function httpGetJsonWithRedirects(urlString, headers = {}, options = {}) {
  return httpRequestJsonWithRedirects(urlString, {
    ...(options && typeof options === 'object' ? options : {}),
    method: 'GET',
    headers: { ...(headers && typeof headers === 'object' ? headers : {}) },
  });
}

function httpGetStatusWithRedirects(urlString, headers = {}, options = {}) {
  const opts = options && typeof options === 'object' ? options : {};
  const redirectsLeft = Number.isFinite(Number(opts.redirectsLeft)) ? Number(opts.redirectsLeft) : 5;
  const timeoutMs = Number.isFinite(Number(opts.timeoutMs)) ? Number(opts.timeoutMs) : 8000;

  return new Promise((resolve, reject) => {
    let url;
    try {
      url = new URL(urlString);
    } catch (_e) {
      reject(new Error('目标地址不是合法 URL'));
      return;
    }

    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'GET',
        headers: headers && typeof headers === 'object' ? headers : {},
        timeout: timeoutMs,
      },
      (resp) => {
        const status = resp.statusCode || 0;
        if (status >= 300 && status < 400 && resp.headers.location) {
          if (redirectsLeft <= 0) {
            reject(new Error('重定向次数过多'));
            resp.resume();
            return;
          }
          const next = new URL(resp.headers.location, url);
          resp.resume();
          httpGetStatusWithRedirects(next.toString(), headers, { redirectsLeft: redirectsLeft - 1, timeoutMs })
            .then(resolve)
            .catch(reject);
          return;
        }
        resp.resume();
        resolve(status);
      }
    );

    req.on('timeout', () => req.destroy(new Error('请求超时')));
    req.on('error', (e) => reject(e));
    req.end();
  });
}

module.exports = {
  requestTextWithRedirects,
  requestBufferWithRedirects,
  httpRequestJsonWithRedirects,
  httpGetJsonWithRedirects,
  httpGetStatusWithRedirects,
};
