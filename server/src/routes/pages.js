const fs = require('fs');
const path = require('path');
const express = require('express');
const { requireLoginPage } = require('../lib/auth');

const ASSET_VERSION =
  process.env.ASSET_VERSION || process.env.npm_package_version || 'V1.0.0';

const HTML_CACHE = new Map();

function sendHtml(res, filename) {
  // __dirname = server/src/routes
  // publicDir = server/public
  const filePath = path.join(__dirname, '..', '..', 'public', filename);
  let html = HTML_CACHE.get(filename);
  try {
    if (!html) {
      html = fs.readFileSync(filePath, 'utf8').replace(/__ASSET_VERSION__/g, ASSET_VERSION);
      HTML_CACHE.set(filename, html);
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.type('html').send(html);
  } catch (_e) {
    return res.status(500).type('text').send('Server error');
  }
}

function createPageRouter() {
  const router = express.Router();

  router.get('/logout', (req, res) => res.redirect('/api/logout'));

  router.get('/', (req, res) => sendHtml(res, 'index.html'));
  router.get('/dashboard', requireLoginPage, (req, res) => sendHtml(res, 'dashboard.html'));

  return router;
}

module.exports = { createPageRouter };
