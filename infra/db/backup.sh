#!/usr/bin/env bash
# Nightly Postgres backup for FastTypingLab (runs ON the VPS).
#
# Dumps the whole `fasttypinglab` database (public + auth schemas, so user
# accounts are covered too), verifies the dump is readable, prunes old dumps,
# and optionally copies it off the VPS with rclone.
#
# Install:  cp infra/db/backup.sh /usr/local/bin/ftl-backup && chmod +x /usr/local/bin/ftl-backup
# Cron:     0 2 * * * /usr/local/bin/ftl-backup >> /var/log/ftl-backup.log 2>&1
# Offsite:  export RCLONE_REMOTE="b2:fasttypinglab-backups" (in crontab or /etc/default/ftl-backup)
set -euo pipefail

CONTAINER="${PG_CONTAINER:-postgres}"
DB="${PG_DB:-fasttypinglab}"
PGUSER_NAME="${PG_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-/root/backups}"
RETAIN_DAYS="${RETAIN_DAYS:-14}"

[ -f /etc/default/ftl-backup ] && . /etc/default/ftl-backup

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

STAMP="$(date +%F_%H%M)"
OUT="$BACKUP_DIR/${DB}-${STAMP}.dump"
TMP="${OUT}.partial"

echo "[$(date -Is)] backing up $DB -> $OUT"
docker exec "$CONTAINER" pg_dump -U "$PGUSER_NAME" -Fc "$DB" > "$TMP"

# Refuse to keep a truncated/corrupt dump: the archive must list cleanly.
if ! docker exec -i "$CONTAINER" pg_restore --list < "$TMP" > /dev/null; then
  echo "[$(date -Is)] ERROR: dump failed verification, removing" >&2
  rm -f "$TMP"
  exit 1
fi
mv "$TMP" "$OUT"
echo "[$(date -Is)] ok: $(du -h "$OUT" | cut -f1)"

# Retention
find "$BACKUP_DIR" -name "${DB}-*.dump" -mtime +"$RETAIN_DAYS" -print -delete

# Off-VPS copy: a backup that lives only on the DB's own machine is not a backup.
if [ -n "${RCLONE_REMOTE:-}" ]; then
  rclone copy "$OUT" "$RCLONE_REMOTE" --quiet
  echo "[$(date -Is)] offsite copy -> $RCLONE_REMOTE"
else
  echo "[$(date -Is)] WARNING: RCLONE_REMOTE not set, no offsite copy" >&2
fi
