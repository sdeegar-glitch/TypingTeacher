#!/usr/bin/env bash
# Captures the REAL live schema so the repo's migrations stop drifting from it.
#
# docs/VPS-MIGRATION.md found that columns and tables (activity_log,
# app_settings, ...) exist live with no matching .sql file. Run this ON the
# VPS, copy the output into the repo, and treat it as the baseline; every new
# change after that goes in a new numbered migration.
#
#   ./snapshot-schema.sh > live_schema_baseline.sql
#   scp root@vps:live_schema_baseline.sql supabase/migrations/20260921_live_baseline.sql
set -euo pipefail

CONTAINER="${PG_CONTAINER:-postgres}"
DB="${PG_DB:-fasttypinglab}"
PGUSER_NAME="${PG_USER:-postgres}"

echo "-- Live schema baseline from $DB, generated $(date -Is)"
echo "-- public schema only; the auth schema is owned/managed by GoTrue."
docker exec "$CONTAINER" pg_dump -U "$PGUSER_NAME" --schema-only --no-owner --no-privileges \
  --schema=public "$DB"
