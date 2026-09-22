#!/usr/bin/env bash
# Removes an IP's Cloudflare IP Access Rule. The API has no delete-by-value
# endpoint, so this looks the rule up by IP first, then deletes it by id.
# Invoked by fail2ban's cloudflare-api action (see
# infra/fail2ban/action.d/cloudflare-api.conf) -- not meant to be run by hand,
# though `cloudflare-unban.sh 1.2.3.4` works fine for a manual test.
set -euo pipefail

IP="${1:?usage: cloudflare-unban.sh <ip>}"
ENV_FILE="/etc/fail2ban/cloudflare-api.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "[cloudflare-unban] $ENV_FILE not found -- see cloudflare-api.conf for one-time setup" >&2
  exit 1
fi
# shellcheck disable=SC1090
source "$ENV_FILE"

RULE_ID=$(curl -s \
  "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/firewall/access_rules/rules?configuration.target=ip&configuration.value=${IP}" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  | grep -o '"id":"[a-f0-9]*"' | head -1 | cut -d'"' -f4)

if [ -z "$RULE_ID" ]; then
  echo "[cloudflare-unban] no matching Cloudflare access rule found for ${IP} (already removed?)" >&2
  exit 0
fi

status=$(curl -s -o /dev/null -w '%{http_code}' -X DELETE \
  "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/firewall/access_rules/rules/${RULE_ID}" \
  -H "Authorization: Bearer ${CF_API_TOKEN}")

case "$status" in
  2??) echo "[cloudflare-unban] unbanned ${IP} at Cloudflare's edge" ;;
  *)   echo "[cloudflare-unban] Cloudflare API returned HTTP ${status} for ${IP}" >&2 ;;
esac
