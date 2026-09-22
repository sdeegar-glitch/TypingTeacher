#!/usr/bin/env bash
# Adds an IP to this zone's Cloudflare IP Access Rules with mode "block".
# Invoked by fail2ban's cloudflare-api action (see
# infra/fail2ban/action.d/cloudflare-api.conf) -- not meant to be run by hand,
# though `cloudflare-ban.sh 1.2.3.4` works fine for a manual test.
set -euo pipefail

IP="${1:?usage: cloudflare-ban.sh <ip>}"
ENV_FILE="/etc/fail2ban/cloudflare-api.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "[cloudflare-ban] $ENV_FILE not found -- see cloudflare-api.conf for one-time setup" >&2
  exit 1
fi
# shellcheck disable=SC1090
source "$ENV_FILE"

status=$(curl -s -o /tmp/cf-ban-response.json -w '%{http_code}' -X POST \
  "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/firewall/access_rules/rules" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{\"mode\":\"block\",\"configuration\":{\"target\":\"ip\",\"value\":\"${IP}\"},\"notes\":\"fail2ban ftl-api-abuse\"}")

case "$status" in
  2??) echo "[cloudflare-ban] banned ${IP} at Cloudflare's edge" ;;
  *)   echo "[cloudflare-ban] Cloudflare API returned HTTP ${status} for ${IP} -- see /tmp/cf-ban-response.json" >&2 ;;
esac
