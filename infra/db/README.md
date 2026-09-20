# infra/db — database operations (VPS)

Postgres 17 + pgvector (container `postgres`, db `fasttypinglab`), GoTrue and
PostgREST already run on the VPS — see `docs/VPS-MIGRATION.md`. These scripts
cover what that doc lists as still open.

| Script | Purpose | When |
|---|---|---|
| `backup.sh` | Verified `pg_dump -Fc`, 14-day retention, optional rclone offsite | nightly cron |
| `restore-test.sh` | Restores newest dump into a scratch DB, diffs row counts | monthly |
| `snapshot-schema.sh` | Dumps the live `public` schema to fix migration drift | once, then per change |

## One-time setup (on the VPS, as root)
```bash
cp infra/db/backup.sh /usr/local/bin/ftl-backup && chmod +x /usr/local/bin/ftl-backup
apt-get install -y rclone          # then: rclone config  (Backblaze B2 / S3 / Drive)
echo 'RCLONE_REMOTE="b2:fasttypinglab-backups"' > /etc/default/ftl-backup
( crontab -l 2>/dev/null; echo '0 2 * * * /usr/local/bin/ftl-backup >> /var/log/ftl-backup.log 2>&1' ) | crontab -
/usr/local/bin/ftl-backup          # run once now to confirm
```

## Monthly
`bash infra/db/restore-test.sh` — a backup you have never restored is a guess.

## Rules
- Never publish port 5432; use `ssh -L 5433:localhost:5432` for GUI access.
- New schema changes go in a new file in `supabase/migrations/`, and are applied to
  the live DB with `docker exec -i postgres psql -U postgres -d fasttypinglab < file.sql`.
- Existing Supabase Cloud accounts were NOT migrated (users re-register) — by design.
