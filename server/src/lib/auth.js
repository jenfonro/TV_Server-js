const crypto = require('crypto');
const { getDb } = require('./db');

const COOKIE_NAME = 'tv_server_auth';
const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const COOKIE_SECURE = process.env.TV_SERVER_COOKIE_SECURE === '1';

function readCookie(req) {
  if (!req || !req.cookies) return null;
  const v = req.cookies[COOKIE_NAME];
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function clearCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/', httpOnly: true, sameSite: 'lax', secure: COOKIE_SECURE });
}

function writeCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: COOKIE_SECURE,
    maxAge: DEFAULT_TTL_MS,
  });
}

function generateToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function resolveToken(token) {
  const db = getDb();
  const now = Date.now();
  const row = db
    .prepare(
      `
      SELECT u.id AS user_id, u.username, u.role, u.status, t.expires_at
      FROM auth_tokens t
      JOIN users u ON u.id = t.user_id
      WHERE t.token = ?
      LIMIT 1
    `
    )
    .get(token);
  if (!row) return null;
  if (!row.expires_at || row.expires_at <= now) return null;
  return {
    userId: row.user_id,
    username: row.username,
    role: row.role,
    status: row.status,
  };
}

function deleteToken(token) {
  if (!token) return;
  const db = getDb();
  db.prepare('DELETE FROM auth_tokens WHERE token = ?').run(token);
}

function pruneExpiredTokens() {
  const db = getDb();
  const now = Date.now();
  db.prepare('DELETE FROM auth_tokens WHERE expires_at <= ?').run(now);
}

function issueTokenForUsername(username) {
  const db = getDb();
  const u = db
    .prepare('SELECT id FROM users WHERE username = ? LIMIT 1')
    .get(username);
  if (!u) return null;
  const now = Date.now();
  const token = generateToken();
  db.prepare(
    'INSERT INTO auth_tokens(token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).run(token, u.id, now, now + DEFAULT_TTL_MS);
  return token;
}

function attachAuthUser() {
  return (req, res, next) => {
    const token = readCookie(req);
    if (!token) {
      req.user = null;
      return next();
    }
    const user = resolveToken(token);
    if (!user) {
      deleteToken(token);
      clearCookie(res);
      req.user = null;
      return next();
    }
    if (user.status !== 'active') {
      // 保持一次请求可感知“已禁用”（用于返回 403），随后清理 token/cookie。
      deleteToken(token);
      clearCookie(res);
    }
    req.user = user;
    req.authToken = token;
    next();
  };
}

function requireLoginPage(req, res, next) {
  if (req.user && req.user.status === 'active') return next();
  return res.redirect('/');
}

function requireAdminApi(options) {
  const allowNonAdmin = options && options.allowNonAdmin;
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (allowNonAdmin) return next();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权限操作' });
    }
    next();
  };
}

module.exports = {
  COOKIE_NAME,
  attachAuthUser,
  requireLoginPage,
  requireAdminApi,
  readCookie,
  writeCookie,
  clearCookie,
  issueTokenForUsername,
  deleteToken,
  pruneExpiredTokens,
};
