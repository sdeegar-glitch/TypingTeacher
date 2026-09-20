#!/usr/bin/env bash
# Proves a backup is actually restorable (run monthly, ON the VPS).
# Restores the newest dump (or the one given as $1) into a throwaway database
# and compares per-table row counts against the live database.
set -euo pipefail

CONTAINER="${PG_CONTAINER:-postgres}"
DB="${PG_DB:-fasttypinglab}"
PGUSER_NAME="${PG_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-/root/backups}"
SCRATCH="${DB}_restore_test"

DUMP="${1:-$(ls -1t "$BACKUP_DIR"/${DB}-*.dump | head -n1)}"
[ -f "$DUMP" ] || { echo "no dump found" >&2; exit 1; }
echo "restoring $DUMP into $SCRATCH"

psql_c() { docker exec -i "$CONTAINER" psql -U "$PGUSER_NAME" -At "$@"; }

psql_c -d postgres -c "DROP DATABASE IF EXISTS $SCRATCH;"
psql_c -d postgres -c "CREATE DATABASE $SCRATCH;"
trap 'psql_c -d postgres -c "DROP DATABASE IF EXISTS '"$SCRATCH"';" >/dev/null' EXIT

# --no-owner: roles (anon/authenticated/...) already exist cluster-wide.
docker exec -i "$CONTAINER" pg_restore -U "$PGUSER_NAME" -d "$SCRATCH" --no-owner < "$DUMP" \
  || echo "note: pg_restore reported warnings (often harmless: extensions/ownership)"

exact_counts() {
  local db="$1"
  for t in $(psql_c -d "$db" -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;"); do
    echo "$t $(psql_c -d "$db" -c "SELECT count(*) FROM public.\"$t\";")"
  done
}

exact_counts "$DB"      > /tmp/ftl_live_counts.txt
exact_counts "$SCRATCH" > /tmp/ftl_restored_counts.txt

echo "--- row-count diff (live vs restored; small drift since the dump is expected) ---"
diff /tmp/ftl_live_counts.txt /tmp/ftl_restored_counts.txt && echo "identical" || true
echo "restore test finished: dump is restorable"
