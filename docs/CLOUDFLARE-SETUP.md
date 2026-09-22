# Putting FastTypingLab behind Cloudflare's free proxy

A record of moving `fasttypinglab.com` behind Cloudflare's free (orange-cloud) proxy, on top of the existing VPS setup in `docs/VPS-MIGRATION.md`. Written so the whole migration is reproducible if the VPS or Cloudflare zone is ever rebuilt.

**Why**: the site already had solid application-layer defense (Turnstile, per-route rate limits, `requireBrowserOrigin`, nginx `limit_req`, a fail2ban jail) but nothing at the network layer — a big enough flood could saturate the VPS before any of that ever got a chance to reject a request, and the origin's IP was fully public with no reputation/bot-fight-mode ahead of it. Cloudflare's free tier closes that gap at no cost.

---

## 0. What this changes vs. what stays the same

- **Frontend** (GitHub Pages) and **backend** (this VPS) are unchanged — Cloudflare sits in front of both as a proxy, not a replacement for either.
- DNS is now managed at Cloudflare, not the registrar (Namecheap) — nameservers point at Cloudflare, and all records live in Cloudflare's dashboard from here on.
- `api.fasttypinglab.com` and the root/`www` records are all proxied (orange cloud); `MX`/`TXT` (email, verification) stay DNS-only, since Cloudflare can't proxy those record types anyway.

## 1. DNS / nameserver cutover

Done via Cloudflare's own "Add a site" onboarding flow (dash.cloudflare.com -> Add a Site -> Free plan), which scans the existing DNS records and imports them. At Namecheap: Domain List -> Manage -> Nameservers -> Custom DNS -> the two Cloudflare-assigned nameservers, removing the old `dns1/dns2.registrar-servers.com` ones. Cloudflare emails once the zone shows **Active** (can take minutes to ~24h).

## 2. Real visitor IP restoration (nginx)

**Deployed ahead of the DNS switch**, so there's no window where it's missing once traffic starts flowing through Cloudflare. Without this, every request would appear to come from a Cloudflare edge IP instead of the real client, silently breaking `express-rate-limit`, nginx's own `limit_req`, and the fail2ban jail below.

`infra/nginx/api.fasttypinglab.com.conf` sets `real_ip_header CF-Connecting-IP;` plus `set_real_ip_from` for every published Cloudflare IPv4/IPv6 range. Combined with `backend/index.js`'s existing `app.set('trust proxy', 1)`, Express resolves `req.ip` correctly with no backend change needed — nginx absorbs the Cloudflare hop before Express ever sees the request.

Deploy: `git pull && sudo nginx -t && sudo systemctl reload nginx`.

## 3. Cloudflare dashboard settings

Set once the zone is Active:
- **SSL/TLS -> Overview**: **Full (strict)**. Works immediately — the VPS already serves a valid Let's Encrypt cert via certbot, which Full (strict) trusts; no need for a separate Cloudflare Origin CA certificate.
- **SSL/TLS -> Edge Certificates**: **Always Use HTTPS** on, **Automatic HTTPS Rewrites** on, **Minimum TLS Version** 1.2, **HTTP Strict Transport Security (HSTS)** enabled (Max-Age 6 months; leave **preload** off initially — it's effectively irreversible once submitted to browsers' preload lists, so only turn it on after HSTS itself has been stable for a while). Covers both `fasttypinglab.com` and `www.fasttypinglab.com` in one setting (a Semrush audit flagged both subdomains for missing HSTS, Sep 2026).
- **Caching -> Cache Rules**: one rule bypassing cache for `api.fasttypinglab.com/*` — Cloudflare doesn't cache dynamic JSON by default, but an API should never risk serving a stale cached response, so it's made explicit.
- **Security -> Bots**: left off/default for now (see out-of-scope note below).

## 4. Origin firewall lockdown

Without this, anyone who already knows the origin IP can hit the VPS directly, completely bypassing Cloudflare's proxy, WAF, and rate limiting.

`infra/scripts/update-cloudflare-ufw.sh` reconciles `ufw`'s port 80/443 allow rules against Cloudflare's currently published IP ranges — idempotent, safe to re-run, never touches the SSH rule or anything else. Full setup and cron instructions are in the script's header comment.

**Only run this after confirming the Cloudflare zone is Active and the site works end-to-end through the proxy** — running it first, while DNS still resolves directly to the VPS, would lock out all real traffic (including your own).

```bash
sudo cp infra/scripts/update-cloudflare-ufw.sh /usr/local/sbin/
sudo chmod +x /usr/local/sbin/update-cloudflare-ufw.sh
sudo /usr/local/sbin/update-cloudflare-ufw.sh
ufw status numbered   # confirm only Cloudflare ranges + the existing SSH rule show up on 80/443
```

Then install the weekly cron job (Cloudflare's ranges rarely change, but do occasionally):
```bash
sudo crontab -e
# add:
0 3 * * 0 /usr/local/sbin/update-cloudflare-ufw.sh >> /var/log/cloudflare-ufw-update.log 2>&1
```

## 5. fail2ban -> Cloudflare API ban action

**The one real gotcha found during this migration**: once step 4's firewall lockdown is live, every request to the VPS arrives from one of Cloudflare's *shared* edge IPs at the network layer — the existing fail2ban jail's `ufw` ban action (blocking by source IP at the OS firewall) silently stops doing anything useful, since banning "the real visitor's IP" has no effect when that IP never directly connects to the server. The app-layer defenses (rate limits, origin-check, the session-plausibility gate) are unaffected, since they read the real IP from Cloudflare's header, not the raw TCP connection — only the fail2ban-to-firewall ban layer breaks.

**Fix**: `infra/fail2ban/action.d/cloudflare-api.conf` bans the real offending IP at Cloudflare's edge instead (Security -> WAF -> IP Access Rules), via Cloudflare's API. `infra/fail2ban/jail.d/ftl-api-abuse.conf` now runs both actions (`ufw` kept as harmless defense-in-depth for the rare case Cloudflare is bypassed; `cloudflare-api` is what actually matters post-lockdown).

One-time setup on the VPS:
1. **Create a scoped API token** (not the Global API Key): Cloudflare dashboard -> profile icon (top right) -> **My Profile** -> **API Tokens** -> **Create Token** -> use the **"Edit zone WAF"** template, or a custom token scoped to **Zone / Firewall Services / Edit**, restricted to just the `fasttypinglab.com` zone.
2. **Find the zone ID**: Cloudflare dashboard -> select `fasttypinglab.com` -> Overview page -> right-hand sidebar, "Zone ID".
3. On the VPS, create `/etc/fail2ban/cloudflare-api.env` (chmod 600, deliberately **not** tracked in this repo):
   ```
   CF_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   CF_ZONE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Deploy the scripts and action:
   ```bash
   sudo mkdir -p /etc/fail2ban/scripts
   sudo cp infra/fail2ban/scripts/cloudflare-ban.sh   /etc/fail2ban/scripts/
   sudo cp infra/fail2ban/scripts/cloudflare-unban.sh /etc/fail2ban/scripts/
   sudo chmod 700 /etc/fail2ban/scripts/cloudflare-*.sh
   sudo cp infra/fail2ban/action.d/cloudflare-api.conf /etc/fail2ban/action.d/
   sudo cp infra/fail2ban/jail.d/ftl-api-abuse.conf /etc/fail2ban/jail.d/
   sudo systemctl restart fail2ban
   fail2ban-client status ftl-api-abuse
   ```
5. **Rotating the token later**: revoke the old one in Cloudflare's API Tokens page, generate a new one, update `/etc/fail2ban/cloudflare-api.env`, restart fail2ban. No repo change needed.

Test: manually trip the rate limit a few times from a throwaway connection, confirm the IP shows up under Cloudflare dashboard -> Security -> WAF -> Tools -> IP Access Rules with a "block" action, and that `fail2ban-client status ftl-api-abuse` lists it under both actions' bans.

**Bug hit and fixed during real deployment**: `cloudflare-unban.sh`'s regex for extracting the rule ID assumed compact JSON (`"id":"..."` with no space), but Cloudflare's API actually returns `"id": "..."` with a space after the colon -- the regex silently never matched, so `RULE_ID` always came out empty and unban was a no-op (ban worked fine; only unban was affected). Fixed to tolerate the space. Verified with a manual ban/unban round-trip against a real (safe, reserved-for-documentation) test IP, `198.51.100.1`.

## Out of scope, deliberately

- **Authenticated Origin Pulls (mTLS)** — cryptographically stronger than IP-allowlisting (Cloudflare presents a client cert nginx verifies), but adds real operational overhead: the origin-pull cert rotates periodically and nginx's `ssl_client_certificate`/`ssl_verify_client` config has to track it. Worth considering later as an upgrade over step 4's IP allowlist; not needed given the layers already in place (IP allowlist + fail2ban + Turnstile + app-layer checks).
- **Cloudflare Bot Fight Mode** — left at its default (off) during initial rollout; revisit once the migration has settled and there's real traffic data to judge it against.
