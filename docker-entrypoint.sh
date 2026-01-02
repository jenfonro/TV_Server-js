#!/bin/sh
set -eu

APP_DIR="/app"

# Seed node_modules from the image into the mounted volume (avoids running npm install on container start).
if [ ! -d "$APP_DIR/node_modules" ]; then
  mkdir -p "$APP_DIR/node_modules"
fi
if [ ! -f "$APP_DIR/node_modules/vite/package.json" ]; then
  if [ -d "/opt/node_modules" ]; then
    cp -a /opt/node_modules/. "$APP_DIR/node_modules/"
  fi
fi

# Ensure SQLite DB path exists (the file can be created by SQLite, but the parent dir must exist).
DB_FILE="${TV_SERVER_DB_FILE:-$APP_DIR/data.db}"
DB_DIR="$(dirname "$DB_FILE")"
mkdir -p "$DB_DIR"
if [ -d "$DB_FILE" ]; then
  echo "ERROR: $DB_FILE is a directory (EISDIR). Delete it (should be a file) and restart." >&2
  exit 1
fi

exec "$@"
