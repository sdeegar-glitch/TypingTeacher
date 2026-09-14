# Migrating FastTypingLab from Render + Supabase to a self-hosted VPS

A beginner-friendly record of how this project moved its backend and database off Render (free tier) and Supabase Cloud onto a self-managed Ubuntu VPS, while keeping the frontend on GitHub Pages unchanged. Written after the fact from the real commands run, including the mistakes and fixes — the bugs found along the way are as useful as the setup steps.

**Stack after migration:**
- **Frontend**: unchanged — GitHub Pages, same as before
- **Backend**: Node/Express, running on the VPS via PM2
- **Database**: Postgres 17 + pgvector, in Docker on the VPS
- **Auth**: self-hosted GoTrue (the same engine Supabase Auth uses) + PostgREST, in Docker
- **Reverse proxy / TLS**: Nginx + Let's Encrypt (certbot)

---

## 0. Before you start

You will need:
- A VPS with root SSH access (this one: Ubuntu 26.04, 4 vCPU... actually 2 vCPU, 3.8GB RAM, 40GB disk)
- Your domain's DNS panel access (to add an `A` record)
- Your Supabase project's dashboard access (for the database connection details)
- Your Google Cloud Console access, if you use "Sign in with Google" (OAuth)

**Key decision made here**: existing Supabase Auth accounts (users, passwords) were **not** ported over — the new auth system started fresh/empty, and existing users just sign up again. This was a deliberate tradeoff to skip the riskiest and most complex part of a full migration (porting password hashes safely). Only the *application data* (typing tests, sessions, certificates, etc.) was carried over.

---

## 1. Generate an SSH key and connect

Don't use your only/primary SSH key for a bot/assistant — generate a dedicated one:

```bash
ssh-keygen -t ed25519 -f ./ftl_vps_key -N "" -C "migration-key"
cat ./ftl_vps_key.pub
```

On the VPS (as root, or via your provider's web console), add the public key:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo "ssh-ed25519 AAAA...your-key-here... migration-key" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Then connect:

```bash
ssh -i ./ftl_vps_key root@<your-vps-ip>
```

---

## 2. Basic server hardening

```bash
# A real swapfile — cheap insurance against a memory spike, especially
# during the data migration itself.
swapoff /swapfile 2>/dev/null; rm -f /swapfile
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
sysctl -w vm.swappiness=10
echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf

# Install what we'll need
apt-get update -qq
apt-get install -y nginx certbot python3-certbot-nginx curl ufw fail2ban unattended-upgrades git

# Firewall: only SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

> ⚠️ **Always verify your SSH session survives a firewall change before closing your terminal** — open a second connection and confirm it works before trusting the first one.

Install Node.js 22 (via NodeSource) and PM2 (the process manager that keeps the backend running and restarts it if it crashes):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
npm install -g pm2
```

---

## 3. Database: Postgres + pgvector in Docker

This project already had Postgres running in Docker with the application's data copied in (via `pg_dump`/`pg_restore` of the `public` schema from Supabase Cloud) before this phase started. The image used was `pgvector/pgvector:pg17` — Postgres 17 with the `pgvector` extension for AI-embedding search already built in, which regular `postgres:17` does **not** include.

Confirm what's there and that nothing's missing:

```bash
# Which extensions are installed?
docker exec postgres psql -U postgres -d fasttypinglab -c \
  "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"

# Row counts on every table the app actually uses — compare these against
# Supabase's dashboard to confirm the copy was complete.
docker exec postgres psql -U postgres -d fasttypinglab -c "
SELECT 'typing_test' t, count(*) FROM typing_test
UNION ALL SELECT 'test_sessions', count(*) FROM test_sessions
UNION ALL SELECT 'users', count(*) FROM users
UNION ALL SELECT 'referrals', count(*) FROM referrals
UNION ALL SELECT 'certificates', count(*) FROM certificates
UNION ALL SELECT 'site_visits', count(*) FROM site_visits
UNION ALL SELECT 'activity_log', count(*) FROM activity_log
UNION ALL SELECT 'app_settings', count(*) FROM app_settings
UNION ALL SELECT 'generation_log', count(*) FROM generation_log;
"
```

> **Lesson learned**: the migration files checked into the repo (`backend/migrations/`, `supabase/migrations/`) turned out **not** to match what was actually live in Supabase — several columns and two whole tables existed only because someone added them by hand in Supabase's dashboard, with no matching `.sql` file anywhere. Don't trust migration files as the source of truth for a live database; always verify against the real, running database.

### Postgres roles PostgREST needs

PostgREST (see next section) expects four specific roles to exist, matching Supabase's own convention:

```bash
cat > /tmp/setup_roles.sql <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'CHOOSE-A-STRONG-PASSWORD-HERE';
  END IF;
END
$$;

GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
SQL

docker exec -i postgres psql -U postgres -d fasttypinglab < /tmp/setup_roles.sql
```

> **Tip**: writing SQL directly into an SSH one-liner with nested quotes is a common source of silent failures (the command looks like it ran, but nothing happened). Write the SQL to a file first, then feed it in with `< file.sql` — much more reliable.

Create an empty schema for auth to use (needed before starting the auth service, see below):

```bash
docker exec postgres psql -U postgres -d fasttypinglab -c \
  "CREATE SCHEMA IF NOT EXISTS auth; GRANT ALL ON SCHEMA auth TO postgres;"
```

---

## 4. Auth (GoTrue) + REST API (PostgREST) in Docker

Supabase's hosted "Auth" product is just a packaged version of an open-source project called **GoTrue**, and its "auto-generated REST API" is **PostgREST**. Both can be self-hosted as plain Docker containers — you don't need Supabase's full platform (which also bundles Kong, Studio, Realtime, Storage — none of which this project uses).

### Generate a signing secret and API keys

GoTrue signs login tokens with a secret key. Supabase's original key can't be extracted (it's private to their platform), so a new one is generated:

```bash
openssl rand -base64 48
# save this value — it's GOTRUE_JWT_SECRET / PGRST_JWT_SECRET below
```

The "anon key" and "service role key" that the app's code expects are just JWTs (tokens) signed with that same secret, carrying a `role` claim. A short Node script mints them:

```js
// mint-keys.mjs
const crypto = require('crypto');
const secret = 'PASTE-YOUR-SECRET-HERE';

function b64url(buf) { return buf.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
function sign(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const data = b64url(Buffer.from(JSON.stringify(header))) + '.' + b64url(Buffer.from(JSON.stringify(payload)));
  const sig = crypto.createHmac('sha256', secret).update(data).digest();
  return data + '.' + b64url(sig);
}

const iat = Math.floor(Date.now()/1000);
const exp = iat + 60*60*24*365*10; // 10 years

console.log('anon:', sign({ role: 'anon', iss: 'supabase', iat, exp }, secret));
console.log('service_role:', sign({ role: 'service_role', iss: 'supabase', iat, exp }, secret));
```

The **anon key** is safe to put in frontend code (it's meant to be public — real security comes from database permissions). The **service_role key** must never be shipped to the browser; it belongs only in the backend's server-side environment.

### Docker Compose file for GoTrue + PostgREST

```yaml
# /opt/fasttypinglab-auth/docker-compose.yml
name: fasttypinglab-auth

networks:
  default:
    name: webnet          # <- must match whatever network your Postgres container is actually on
    external: true

services:
  gotrue:
    image: supabase/gotrue:v2.174.0
    container_name: gotrue
    restart: unless-stopped
    ports:
      - "127.0.0.1:9999:9999"   # bound to localhost only — Nginx will front this
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      API_EXTERNAL_URL: https://api.yourdomain.com/auth/v1

      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://postgres:YOUR_PG_PASSWORD@postgres:5432/fasttypinglab?search_path=auth

      GOTRUE_SITE_URL: https://yourdomain.com
      GOTRUE_URI_ALLOW_LIST: "https://yourdomain.com,https://yourdomain.com/*"

      GOTRUE_JWT_SECRET: YOUR_SECRET_FROM_ABOVE
      GOTRUE_JWT_EXP: 3600
      GOTRUE_JWT_AUD: authenticated

      GOTRUE_DISABLE_SIGNUP: "false"
      GOTRUE_MAILER_AUTOCONFIRM: "true"   # skip email-confirmation links entirely
      GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"

      # Google Sign-In (fill in once you have a Google OAuth client — see step 7)
      GOTRUE_EXTERNAL_GOOGLE_ENABLED: "false"
      GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID: ""
      GOTRUE_EXTERNAL_GOOGLE_SECRET: ""
      GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI: https://api.yourdomain.com/auth/v1/callback

  postgrest:
    image: postgrest/postgrest:v12.2.8
    container_name: postgrest
    restart: unless-stopped
    ports:
      - "127.0.0.1:3010:3000"
    environment:
      PGRST_DB_URI: postgres://authenticator:YOUR_AUTHENTICATOR_PASSWORD@postgres:5432/fasttypinglab
      PGRST_DB_SCHEMA: public
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: YOUR_SECRET_FROM_ABOVE
      PGRST_JWT_AUD: authenticated
      PGRST_SERVER_PORT: 3000
```

> ⚠️ **Check which Docker network your Postgres container is actually on** before writing this file:
> ```bash
> docker inspect postgres --format '{{json .NetworkSettings.Networks}}'
> ```
> A container name like `postgres_default` might exist but be *empty* — the real network could be something else entirely (in this project it turned out to be `webnet`). Get this wrong and the new containers simply can't find the database (`hostname resolving error`).

Start it:

```bash
cd /opt/fasttypinglab-auth
docker compose up -d
docker logs gotrue --tail 20     # look for "GoTrue API started"
docker logs postgrest --tail 20  # look for "Schema cache loaded"
```

> **Ordering matters**: GoTrue needs the empty `auth` schema (created in step 3) to already exist *before* its first boot — that's when it runs its own internal setup and creates its own tables inside that schema. If you start it against a schema that doesn't exist yet, it fails with `"no schema has been selected to create in"`.

---

## 5. Nginx: routing one domain to three services

`supabase-js` (the client library the frontend/backend code uses) expects **one** base URL that serves both `/auth/v1/*` (GoTrue) and `/rest/v1/*` (PostgREST). Nginx plays traffic-cop:

```nginx
# /etc/nginx/sites-available/api.yourdomain.com
server {
    server_name api.yourdomain.com;
    client_max_body_size 5m;

    location /auth/v1/ {
        proxy_pass http://127.0.0.1:9999/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # See "CORS troubleshooting" below for why these three lines matter.
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Credentials;
        proxy_hide_header Access-Control-Expose-Headers;

        add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "authorization, apikey, content-type, x-client-info, x-supabase-api-version" always;
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "authorization, apikey, content-type, x-client-info, x-supabase-api-version" always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    location /rest/v1/ {
        proxy_pass http://127.0.0.1:3010/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Credentials;
        proxy_hide_header Access-Control-Expose-Headers;

        add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "authorization, apikey, content-type, x-client-info, x-supabase-api-version, prefer" always;
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "authorization, apikey, content-type, x-client-info, x-supabase-api-version, prefer" always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }

    # No CORS handling here at all — the backend app (Express, via its own
    # cors() middleware) is the single source of truth for its own routes.
    location / {
        proxy_pass http://127.0.0.1:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it and issue a free TLS certificate:

```bash
ln -sf /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Point an A record for api.yourdomain.com at your VPS's IP in your DNS
# provider first, then:
certbot --nginx -d api.yourdomain.com --agree-tos -m you@example.com --redirect

# Always verify the renewal actually works, don't just assume it's set up:
systemctl list-timers | grep certbot
certbot renew --dry-run
```

### CORS troubleshooting (the part that took the longest to get right)

This is worth its own section because it caused a real, confusing bug: **"Google sign-in works, but the site silently fails afterward with no error."**

The underlying issue had **three separate layers**, each looking identical from the browser's error message (`blocked by CORS policy`) but each needing a different fix:

1. **The Express backend was adding CORS headers, and Nginx was too — duplicated.** A response can only have *one* `Access-Control-Allow-Origin` value; browsers reject it outright if they see two, even if both look individually correct. **Fix**: pick exactly one layer to own CORS per route. Here, Nginx owns it for `/auth/v1/*` and `/rest/v1/*` (GoTrue/PostgREST); Express owns it for everything else — Nginx adds nothing on that path.

2. **GoTrue and PostgREST *also* add their own permissive CORS header** (`Access-Control-Allow-Origin: *`) on real responses, not just on the `OPTIONS` preflight check. `add_header` in Nginx does not replace a header the upstream service already sent — it just adds another one alongside it, recreating the exact same duplicate-header problem. **Fix**: `proxy_hide_header` strips the upstream's own header before Nginx adds its own.

3. **That fix, applied carelessly, broke something else.** Nginx directives placed at the top `server` level are inherited by every `location` block below — including the plain catch-all one that proxies to Express. So a `proxy_hide_header` meant only for the GoTrue/PostgREST locations ended up *also* stripping Express's own correctly-set header. **Fix**: put `proxy_hide_header` inside each specific `location` block that needs it, never at the `server` level.

4. **`supabase-js` sends a header Nginx didn't know about** (`x-supabase-api-version`) on the token-exchange request. Any header a real browser request sends that isn't explicitly listed in `Access-Control-Allow-Headers` gets the whole preflight rejected. **Fix**: add it to the allow-list (already included in the config above).

**How this was actually diagnosed**: none of it was obvious from error messages alone. The fastest path was asking for the browser's DevTools **Network tab**, saved as a **HAR file** (right-click the request list → "Save all as HAR with content"), and reading the exact request/response headers directly — far more reliable than a screenshot or a copy-pasted error line, since a HAR captures the complete real traffic.

---

## 6. Deploy the backend app

```bash
apt-get install -y git
mkdir -p /opt/fasttypinglab
cd /opt/fasttypinglab
git clone --depth 1 https://github.com/your-org/your-repo.git .
cd backend
npm ci --omit=dev
```

Write the production `.env` (do **not** commit this file):

```bash
cat > /opt/fasttypinglab/backend/.env <<'EOF'
SUPABASE_URL=https://api.yourdomain.com
SUPABASE_SERVICE_KEY=<the service_role JWT you minted in step 4>
PORT=5000
GEMINI_API_KEY=...
GROQ_API_KEY=...
XAI_API_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
TELEGRAM_ADMIN_CHAT_ID=...
EOF
chmod 600 /opt/fasttypinglab/backend/.env
```

Run it under PM2 — **fork mode, a single instance**, not cluster mode:

```bash
cd /opt/fasttypinglab/backend
pm2 start index.js --name fasttypinglab-api
pm2 save
pm2 startup systemd -u root --hp /root   # run the command it prints, to survive reboots

# Keep logs from growing forever:
pm2 install pm2-logrotate
```

> ⚠️ **Why single-instance matters**: if this app has any scheduled/cron jobs running inside the same process (this one posts daily content to Telegram on a schedule), running multiple instances means the schedule fires **multiple times** — e.g. the same daily post going out 2-4 times. `pm2 start app.js -i 4` (cluster mode) is the wrong tool for an app with in-process cron jobs; use plain `pm2 start app.js` (fork mode, one instance) instead.

### Cleanup: remove logic that only made sense on the old host

The old setup ran on a free tier that went to sleep after inactivity, so the code had a workaround: check on every incoming request whether a scheduled task was "overdue" and run it late. On an always-on VPS this is unnecessary — worse, it was found live to actively cause harm (an "overdue" check ran immediately on first boot and burned through a third-party API's entire daily free quota before the real scheduled time ever arrived). If your old host slept and your new one doesn't, search for and remove that kind of "catch-up" logic.

---

## 7. Frontend: point it at the new backend

The frontend's `.env` file is **not** committed to git and is **not** available in the CI build — meaning the *hardcoded fallback values* in the source code are what actually ship to production, not the `.env` file. Both need updating:

```bash
# .env — for local development only
VITE_API_URL=https://api.yourdomain.com
VITE_SUPABASE_URL=https://api.yourdomain.com
VITE_SUPABASE_ANON_KEY=<the anon JWT you minted in step 4>
```

Then find and update every hardcoded fallback in the source (search for the old URL across the codebase):

```bash
grep -rln "old-backend-url.onrender.com" frontend/src
# then update each one — e.g. via sed, or by hand
```

Rebuild, run the test suite, and deploy exactly as before (this project's GitHub Actions workflow handles the GitHub Pages deploy on push — no changes needed there since only the *destination* the built files point to changed, not *where* they're hosted).

### Google Sign-In (OAuth), if you use it

1. **Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID**
2. **Authorized JavaScript origins** (bare origin, no path): `https://yourdomain.com`
3. **Authorized redirect URIs** (full path): `https://api.yourdomain.com/auth/v1/callback`
4. Copy the **Client ID** and **Client secret**, fill them into the `docker-compose.yml` from step 4 (`GOTRUE_EXTERNAL_GOOGLE_*`), set `GOTRUE_EXTERNAL_GOOGLE_ENABLED: "true"`, and restart: `docker compose up -d gotrue`
5. **OAuth consent screen → Audience**: while in "Testing" mode, only accounts you explicitly add as test users can sign in. Add your own account to test with, or switch the app to "In production" once you're ready for the public (for an app that only requests `email` + `profile` scopes, this does **not** require Google's full security review).

---

## 8. Create an admin account

The fresh auth system starts with zero users — including no admin. Run whatever seed script your project has directly on the server:

```bash
cd /opt/fasttypinglab/backend
SEED_ADMIN_EMAIL="admin@yourdomain.com" SEED_ADMIN_PASSWORD="<a-strong-password>" node seed_user.js
```

---

## 9. A real bug found during this migration, worth knowing about

**Symptom**: an admin account could log in, but the very next request — checking "is this user an admin?" — always failed, as if the account didn't exist, even though it demonstrably did.

**Cause**: the backend created *one* database client object when it started up, and reused that same object for every request for the life of the process. After enough reuse, that single long-lived client began silently returning wrong results — not a crash, not a visible error, just wrong data, some of the time. A brand-new client object, created fresh for the exact same query, always worked correctly.

**Fix**: stop reusing one client. The backend's database-client file now builds a new client on every single use instead of keeping one around indefinitely — cheap to do (no network cost until a real request is made), and it makes this entire class of bug impossible.

**Why this is worth documenting**: this had been misdiagnosed once before, on the *old* Render-based setup, as a network/connection problem (because Render's free tier has its own quirks that made a network explanation plausible at the time). It's now clear that was very likely the same underlying bug all along, just harder to isolate because the network was a more visible suspect. The lesson: if a long-running server process shows *intermittent, unexplainable* wrong results — especially "worked a moment ago, now it doesn't, nothing changed" — suspect a long-lived client/connection object before chasing a network explanation. A simple test to confirm it: run the *exact same query* two ways in the same moment — once through the app's normal shared client, once through a client built fresh right there — and compare.

---

## 10. What's different now (operational responsibilities you didn't have before)

Supabase and Render handled several things for free that now need attention:

- **Backups.** Nothing backs up the new database automatically yet. Set up a nightly `pg_dump`, and copy it **off the VPS** (a backup living only on the same machine as the database doesn't protect against losing that machine).
  ```bash
  docker exec postgres pg_dump -U postgres -Fc fasttypinglab > /root/backups/fasttypinglab-$(date +%F).dump
  ```
- **Uptime monitoring.** Consider a free service (e.g. UptimeRobot) pinging `/health` every few minutes, alerting you if it goes down.
- **OS security patches.** `unattended-upgrades` (installed in step 2) handles this automatically for the base system.
- **SSL renewal.** Automatic via certbot's timer (verify it's actually enabled — see step 5).
- **A database GUI.** Supabase's dashboard is gone. For occasional inspection, tunnel in rather than exposing anything publicly:
  ```bash
  ssh -L 5433:localhost:5432 root@your-vps-ip
  # then connect a local tool (DBeaver, TablePlus, psql) to localhost:5433
  ```

---

## 11. Keep the old services around for a while

Don't delete the Render service or the Supabase Cloud project immediately. Both cost nothing to leave dormant, and they're your rollback path if something surfaces in the days after cutover. A reasonable soak period is **2-3 weeks** — enough to see every weekly/monthly scheduled task run at least once and catch anything that only shows up under real use. Only decommission the old infrastructure once you've had a stretch of genuinely uneventful days on the new one.
