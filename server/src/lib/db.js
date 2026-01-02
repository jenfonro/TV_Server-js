const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

let db;
let dbLooksFresh = false;
let closeInProgress = false;
let stmtGetSetting;
let stmtSetSetting;
const settingsCache = new Map();
let settingsVersion = 0;

function getDbFile() {
  const explicitFile =
    typeof process.env.TV_SERVER_DB_FILE === 'string' ? process.env.TV_SERVER_DB_FILE.trim() : '';
  if (explicitFile) return path.resolve(explicitFile);

  const dataDir =
    typeof process.env.TV_SERVER_DATA_DIR === 'string' ? process.env.TV_SERVER_DATA_DIR.trim() : '';
  // Default to the TV_Server project root (so Docker/local runs share the same db path),
  // instead of relying on process.cwd() (workspace scripts run under server/).
  const projectRoot = path.resolve(__dirname, '..', '..', '..');
  const baseDir = dataDir || projectRoot;
  return path.resolve(baseDir, 'data.db');
}

function getDb() {
  if (!db) {
    const filePath = getDbFile();
    let existsAndHasData = false;
    try {
      const st = fs.statSync(filePath);
      existsAndHasData = !!(st && st.isFile && st.isFile() && st.size > 0);
    } catch (_e) {
      existsAndHasData = false;
    }
    dbLooksFresh = !existsAndHasData;

    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    } catch (_e) {}

    db = new Database(filePath);
    db.pragma('journal_mode = WAL');
    // Reduce transient "database is locked" errors under concurrent requests.
    db.pragma('busy_timeout = 5000');
  }
  return db;
}

function closeDb() {
  if (!db || closeInProgress) return;
  closeInProgress = true;
  try {
    try {
      stmtGetSetting = null;
      stmtSetSetting = null;
      settingsCache.clear();
      settingsVersion = 0;
    } catch (_e) {}
    db.close();
  } catch (_e) {
    // ignore
  } finally {
    db = null;
    closeInProgress = false;
  }
}

function getSetting(key) {
  const k = String(key);
  if (settingsCache.has(k)) return settingsCache.get(k);
  const database = getDb();
  if (!stmtGetSetting) stmtGetSetting = database.prepare('SELECT value FROM settings WHERE key = ? LIMIT 1');
  const row = stmtGetSetting.get(k);
  const v = !row || row.value == null ? '' : String(row.value);
  settingsCache.set(k, v);
  return v;
}

function setSetting(key, value) {
  const database = getDb();
  if (!stmtSetSetting) {
    stmtSetSetting = database.prepare(`
      INSERT INTO settings(key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
      WHERE settings.value IS NOT excluded.value
    `);
  }
  const k = String(key);
  const v = value != null ? String(value) : '';
  const info = stmtSetSetting.run(k, v);
  if (info && typeof info.changes === 'number' && info.changes > 0) settingsVersion += 1;
  settingsCache.set(k, v);
}

function getSettingsVersion() {
  return settingsVersion;
}

function initDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      cat_api_base TEXT DEFAULT '',
      cat_api_key TEXT DEFAULT '',
      cat_proxy TEXT DEFAULT '',
      search_thread_count INTEGER DEFAULT 5,
      cat_sites TEXT DEFAULT '[]',
      cat_site_status TEXT DEFAULT '{}',
      cat_site_home TEXT DEFAULT '{}',
      cat_site_order TEXT DEFAULT '[]',
      cat_site_availability TEXT DEFAULT '{}',
      cat_search_order TEXT DEFAULT '[]',
      cat_search_cover_site TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      keyword TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(user_id, keyword)
    );
    CREATE INDEX IF NOT EXISTS idx_search_history_user_id_updated_at ON search_history(user_id, updated_at DESC);
    CREATE TABLE IF NOT EXISTS play_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      site_key TEXT NOT NULL,
      site_name TEXT DEFAULT '',
      spider_api TEXT NOT NULL,
      video_id TEXT NOT NULL,
      video_title TEXT NOT NULL,
      video_poster TEXT DEFAULT '',
      video_remark TEXT DEFAULT '',
      pan_label TEXT DEFAULT '',
      play_flag TEXT DEFAULT '',
      content_key TEXT DEFAULT '',
      episode_index INTEGER DEFAULT 0,
      episode_name TEXT DEFAULT '',
      updated_at INTEGER NOT NULL,
      UNIQUE(user_id, site_key, video_id)
    );
    CREATE INDEX IF NOT EXISTS idx_play_history_user_id_updated_at ON play_history(user_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_play_history_user_id_content_key_updated_at ON play_history(user_id, content_key, updated_at DESC);
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      site_key TEXT NOT NULL,
      site_name TEXT DEFAULT '',
      spider_api TEXT NOT NULL,
      video_id TEXT NOT NULL,
      video_title TEXT NOT NULL,
      video_poster TEXT DEFAULT '',
      video_remark TEXT DEFAULT '',
      updated_at INTEGER NOT NULL,
      UNIQUE(user_id, site_key, video_id)
    );
    CREATE INDEX IF NOT EXISTS idx_favorites_user_id_updated_at ON favorites(user_id, updated_at DESC);
    CREATE TABLE IF NOT EXISTS auth_tokens (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
  `);

  // Seed defaults only for a fresh DB file. Existing DBs are not auto-migrated/re-seeded.
  if (dbLooksFresh) {
    const insertSetting = database.prepare(`INSERT INTO settings(key, value) VALUES (?, ?)`);
    const seed = (key, value) => insertSetting.run(String(key), value != null ? String(value) : '');

    seed('site_name', 'TV Server');
    seed('douban_data_proxy', 'direct');
    seed('douban_data_custom', '');
    seed('douban_img_proxy', 'direct-browser');
    seed('douban_img_custom', '');
    seed('video_source_url', '');
    seed('video_source_final_url', '');
    seed('video_source_api_base', '');
    seed('video_source_api_headers', '');
    seed('video_source_sites', '[]');
    seed('video_source_md5', '');
    seed('catpawopen_api_base', 'http://127.0.0.1:3006/');
    seed('catpawopen_proxy', '');
    seed('video_source_site_status', '{}');
    seed('video_source_site_home', '{}');
    seed('video_source_site_order', '[]');
    seed('video_source_site_availability', '{}');
    seed('video_source_search_order', '[]');
    seed('video_source_search_cover_site', '');

    const defaultEpisodeCleanRegexRules = ['\\[\\s*\\d+(?:\\.\\d+)?\\s*(?:B|KB|MB|GB|TB)\\s*\\]|【[^】]*】'];
    const defaultEpisodeRules = [
      JSON.stringify({
        pattern: '.*?([Ss]\\d{1,2})?(?:[第EePpXx\\.\\-\\_\\( ]{1,2}|^)(\\d{1,3})(?!\\d).*?\\.(mp4|mkv)',
        replace: '$1E$2',
      }),
    ];
    seed('magic_episode_rules', JSON.stringify(defaultEpisodeRules));
    seed('magic_episode_clean_regex', '');
    seed('magic_episode_clean_regex_rules', JSON.stringify(defaultEpisodeCleanRegexRules));
    seed('magic_aggregate_rules', '[]');
    seed('magic_aggregate_regex_rules', '[]');
    seed('goproxy_enabled', '0');
    seed('goproxy_auto_select', '0');
    seed('goproxy_servers', '[]');
  }

  // 默认管理员：仅当当前没有 admin 角色用户时补充
  const adminCount = database
    .prepare("SELECT COUNT(1) AS c FROM users WHERE role = 'admin'")
    .get();
  if (!adminCount || !adminCount.c) {
    // eslint-disable-next-line global-require
    const bcrypt = require('bcryptjs');
    const hashed = bcrypt.hashSync('admin', 10);
    database
      .prepare("INSERT INTO users(username, password, role, status) VALUES (?, ?, 'admin', 'active')")
      .run('admin', hashed);
    // eslint-disable-next-line no-console
    console.log('初始化默认管理员账号: admin/admin');
  }
}

module.exports = {
  getDb,
  closeDb,
  getSetting,
  setSetting,
  getSettingsVersion,
  initDatabase,
};
