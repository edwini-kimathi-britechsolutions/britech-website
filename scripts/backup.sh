#!/usr/bin/env bash
# Nightly backup of the database and uploaded images. Keeps 14 days.
# Example cron (as the app user):  30 2 * * * /var/www/britech-website/scripts/backup.sh >> /var/log/britech-backup.log 2>&1
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/britech}"
STAMP="$(date +%Y-%m-%d_%H%M)"

# Read DATABASE_URL and UPLOAD_DIR from .env (if present; otherwise from the environment)
if [ -f "$APP_DIR/.env" ]; then set -a; source "$APP_DIR/.env"; set +a; fi
: "${DATABASE_URL:?DATABASE_URL is not set}" "${UPLOAD_DIR:?UPLOAD_DIR is not set}"
proto_removed="${DATABASE_URL#mysql://}"
DB_USER="${proto_removed%%:*}"; rest="${proto_removed#*:}"
DB_PASS="${rest%%@*}"; rest="${rest#*@}"
DB_HOST="${rest%%:*}"; rest="${rest#*:}"
DB_PORT="${rest%%/*}"; DB_NAME="${rest#*/}"; DB_NAME="${DB_NAME%%\?*}"

mkdir -p "$BACKUP_DIR"
MYSQL_PWD="$DB_PASS" mysqldump --single-transaction --no-tablespaces -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" \
  | gzip > "$BACKUP_DIR/db_$STAMP.sql.gz"
tar -czf "$BACKUP_DIR/uploads_$STAMP.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"

find "$BACKUP_DIR" -type f -mtime +14 -delete
echo "$(date) backup ok: $BACKUP_DIR/*_$STAMP.*"
