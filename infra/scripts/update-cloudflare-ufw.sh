#!/usr/bin/env bash
# Reconciles ufw's 80/443 allow rules against Cloudflare's currently
# published IP ranges, so the VPS only ever accepts HTTP/HTTPS traffic that
# actually came through Cloudflare's proxy -- without this, anyone who
# knows the origin IP can hit the server directly, bypassing Cloudflare's
# WAF, rate limiting, and bot protection entirely.
#
# Deliberately does NOT touch the SSH rule or any other existing ufw rule --
# Cloudflare only ever proxies HTTP/HTTPS, never SSH. Safe to re-run any
# time; only adds/removes the ports 80/443 rules for ranges that changed
# since the last run (tracked via STATE_FILE, not by parsing `ufw status`).
#
# --- One-time setup on the VPS ---
#   sudo cp infra/scripts/update-cloudflare-ufw.sh /usr/local/sbin/
#   sudo chmod +x /usr/local/sbin/update-cloudflare-ufw.sh
#   sudo /usr/local/sbin/update-cloudflare-ufw.sh          # run once, review `ufw status numbered`
#
# Only run this AFTER confirming the Cloudflare zone is Active and the site
# loads correctly through the proxy -- running it while DNS still resolves
# directly to this VPS would lock out all real traffic, since nothing would
# be arriving from a Cloudflare IP yet.
#
# --- Weekly cron (Cloudflare's ranges rarely change, but do occasionally) ---
#   sudo crontab -e
#   # add:
#   0 3 * * 0 /usr/local/sbin/update-cloudflare-ufw.sh >> /var/log/cloudflare-ufw-update.log 2>&1
#
# Source lists, authoritative: https://www.cloudflare.com/ips-v4 / ips-v6

set -euo pipefail

STATE_FILE="/var/lib/cloudflare-ufw-ranges.txt"
TMP_NEW="$(mktemp)"
trap 'rm -f "$TMP_NEW"' EXIT

if [ "$(id -u)" -ne 0 ]; then
  echo "Must run as root (ufw requires it)." >&2
  exit 1
fi

curl -fsS --max-time 15 https://www.cloudflare.com/ips-v4 >  "$TMP_NEW"
# A missing trailing newline on the v4 fetch would otherwise glue its last
# range to the v6 list's first range into one invalid CIDR entry (this bit
# a real run once) -- force a separator regardless of what curl returned.
printf '\n' >> "$TMP_NEW"
curl -fsS --max-time 15 https://www.cloudflare.com/ips-v6 >> "$TMP_NEW"
sed -i '/^\s*$/d' "$TMP_NEW"

# Defense in depth against the same class of bug: drop (and warn about) any
# line that isn't a plausible IPv4 or IPv6 CIDR before it ever reaches ufw,
# rather than trusting the fetch was clean.
awk '
  /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\/[0-9]+$/ { print; next }
  /^[0-9a-fA-F:]+\/[0-9]+$/ { print; next }
  { print "Dropping malformed entry: " $0 > "/dev/stderr" }
' "$TMP_NEW" > "${TMP_NEW}.clean"
mv "${TMP_NEW}.clean" "$TMP_NEW"

# Safety net: Cloudflare has published 15+ IPv4 ranges for years. If the
# fetch failed/returned something truncated, a low count is the tell --
# abort rather than risk deleting every existing allow rule based on bad
# data.
NEW_COUNT=$(wc -l < "$TMP_NEW")
if [ "$NEW_COUNT" -lt 15 ]; then
  echo "Only got $NEW_COUNT ranges from Cloudflare -- aborting without changes (expected 20+)." >&2
  exit 1
fi

mkdir -p "$(dirname "$STATE_FILE")"
touch "$STATE_FILE"

# Ranges that were allowed before but are no longer in Cloudflare's list.
comm -23 <(sort "$STATE_FILE") <(sort "$TMP_NEW") | while read -r range; do
  [ -z "$range" ] && continue
  echo "Removing stale range: $range"
  ufw delete allow from "$range" to any port 80  proto tcp comment 'cloudflare-auto' 2>/dev/null || true
  ufw delete allow from "$range" to any port 443 proto tcp comment 'cloudflare-auto' 2>/dev/null || true
done

# Ranges that are new since the last run.
comm -13 <(sort "$STATE_FILE") <(sort "$TMP_NEW") | while read -r range; do
  [ -z "$range" ] && continue
  echo "Adding new range: $range"
  ufw allow from "$range" to any port 80  proto tcp comment 'cloudflare-auto'
  ufw allow from "$range" to any port 443 proto tcp comment 'cloudflare-auto'
done

cp "$TMP_NEW" "$STATE_FILE"
echo "Done. $(wc -l < "$STATE_FILE") Cloudflare ranges currently allowed on 80/443."
echo "Review with: ufw status numbered"
