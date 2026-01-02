const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { initDatabase, closeDb } = require('./lib/db');
const { attachAuthUser, pruneExpiredTokens } = require('./lib/auth');
const { createApiRouter } = require('./routes/api');
const { createPageRouter } = require('./routes/pages');
const { createDashboardRouter } = require('./routes/dashboard');

const PORT = Number(process.env.PORT || 8080);

async function main() {
  initDatabase();

  const app = express();
  app.disable('x-powered-by');

  // Optional: behind Nginx or other reverse proxies, this enables correct req.ip/req.protocol.
  // Keep it opt-in to avoid trusting spoofed X-Forwarded-* headers by default.
  if (process.env.TV_SERVER_TRUST_PROXY === '1') app.set('trust proxy', 1);

  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json({ limit: '1mb' }));

  app.use(attachAuthUser());

  // API
  app.use('/api', createApiRouter());
  app.use('/dashboard', createDashboardRouter());

  // Pages
  app.use('/', createPageRouter());

  const publicDir = path.join(__dirname, '..', 'public');
  app.use(
    express.static(publicDir, {
      etag: true,
      maxAge: 0,
      setHeaders(res, filePath) {
        if (
          filePath.endsWith('.html') ||
          filePath.endsWith('.css') ||
          filePath.endsWith('.js')
        ) {
          res.setHeader('Cache-Control', 'no-store');
        }
      },
    })
  );

  const server = app.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(`tv_server listening on :${PORT}`);
  });

  // Periodically prune expired auth tokens to keep DB small.
  try {
    const timer = setInterval(() => {
      try {
        pruneExpiredTokens();
      } catch (_e) {}
    }, 6 * 60 * 60 * 1000);
    if (timer && typeof timer.unref === 'function') timer.unref();
  } catch (_e) {}

  const shutdown = () => {
    try {
      server.close(() => {
        try {
          closeDb();
        } catch (_e) {}
        process.exit(0);
      });
      // Force-exit if close hangs.
      setTimeout(() => process.exit(0), 5000).unref();
    } catch (_e) {
      try {
        closeDb();
      } catch (_e2) {}
      process.exit(0);
    }
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
