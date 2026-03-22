#!/usr/bin/env bash
# init-firewall.sh — Activate default-deny firewall allowing only whitelisted domains.
# Run manually: sudo /usr/local/share/init-firewall.sh
# Requires: NET_ADMIN, NET_RAW capabilities; iptables, ipset, curl, dig installed.

set -euo pipefail

STEP=""
fail() {
  echo "ERROR: Step '${STEP}' failed — ${1}" >&2
  exit 1
}

# ---------------------------------------------------------------------------
# Step 1: Save and restore Docker DNS chain rules around iptables flush
# ---------------------------------------------------------------------------
STEP="save-docker-chains"
echo "Saving Docker iptables rules..."
DOCKER_USER_RULES=""
DOCKER_RULES=""
if iptables -L DOCKER-USER &>/dev/null; then
  DOCKER_USER_RULES=$(iptables-save | grep -E '^-A DOCKER-USER ' || true)
fi
if iptables -L DOCKER &>/dev/null; then
  DOCKER_RULES=$(iptables-save | grep -E '^-A DOCKER ' || true)
fi

# Flush all chains and reset policies to ACCEPT before rebuilding
STEP="flush-iptables"
iptables -F
iptables -X 2>/dev/null || true
iptables -t nat -F 2>/dev/null || true
iptables -t mangle -F 2>/dev/null || true
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT

# Restore Docker chain rules
STEP="restore-docker-chains"
if [ -n "$DOCKER_USER_RULES" ] || [ -n "$DOCKER_RULES" ]; then
  echo "Restoring Docker chain rules..."
  # Re-create chains if needed
  iptables -N DOCKER-USER 2>/dev/null || true
  iptables -N DOCKER 2>/dev/null || true
  while IFS= read -r rule; do
    [ -z "$rule" ] && continue
    iptables -A ${rule#-A } 2>/dev/null || true
  done <<< "${DOCKER_USER_RULES}"$'\n'"${DOCKER_RULES}"
fi

# ---------------------------------------------------------------------------
# Step 2: Create or flush ipset
# ---------------------------------------------------------------------------
STEP="ipset-create"
echo "Setting up ipset..."
ipset create allowed-domains hash:net 2>/dev/null || ipset flush allowed-domains

# ---------------------------------------------------------------------------
# Step 3: Fetch GitHub IP ranges
# ---------------------------------------------------------------------------
STEP="github-ip-ranges"
echo "Fetching GitHub IP ranges from api.github.com/meta..."
GITHUB_META=$(curl --max-time 15 -sf https://api.github.com/meta) \
  || fail "Could not fetch https://api.github.com/meta — check network connectivity"

for cidr in $(echo "$GITHUB_META" | jq -r '(.web[], .api[], .git[])' 2>/dev/null); do
  ipset add allowed-domains "$cidr" 2>/dev/null || true
done

# ---------------------------------------------------------------------------
# Step 4: Static domain resolution for all whitelisted domains
# ---------------------------------------------------------------------------
STEP="static-domain-resolution"
WHITELISTED_DOMAINS=(
  "registry.npmjs.org"
  "api.github.com"
  "api.anthropic.com"
  "sentry.io"
  "statsig.anthropic.com"
  "statsig.com"
  "marketplace.visualstudio.com"
  "vscode.blob.core.windows.net"
  "update.code.visualstudio.com"
  "pypi.org"
  "files.pythonhosted.org"
)

echo "Resolving whitelisted domains..."
RESOLVED_COUNT=0
for domain in "${WHITELISTED_DOMAINS[@]}"; do
  ips=$(dig +short "$domain" 2>/dev/null | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' || true)
  if [ -z "$ips" ]; then
    echo "  WARNING: Could not resolve $domain (skipping)" >&2
    continue
  fi
  for ip in $ips; do
    ipset add allowed-domains "$ip/32" 2>/dev/null || true
  done
  RESOLVED_COUNT=$((RESOLVED_COUNT + 1))
done

# ---------------------------------------------------------------------------
# Step 5: Allow rules, then default-deny
# ---------------------------------------------------------------------------
STEP="allow-rules"
echo "Setting allow rules..."

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow established/related connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow DNS (outbound UDP/TCP port 53) for resolution by the container itself
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT

# Allow outbound HTTPS/HTTP to whitelisted IPs
iptables -A OUTPUT -m set --match-set allowed-domains dst -p tcp --dport 443 -j ACCEPT
iptables -A OUTPUT -m set --match-set allowed-domains dst -p tcp --dport 80 -j ACCEPT

# Set default-deny (IPv4 and IPv6)
STEP="default-deny"
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT DROP
# Block all IPv6 traffic — firewall only manages IPv4 allowlist
ip6tables -P INPUT DROP 2>/dev/null || true
ip6tables -P FORWARD DROP 2>/dev/null || true
ip6tables -P OUTPUT DROP 2>/dev/null || true

# ---------------------------------------------------------------------------
# Step 6: Verification tests
# ---------------------------------------------------------------------------
STEP="verify-blocked"
echo "Verifying: example.com should be blocked..."
if curl --max-time 5 -sf https://example.com &>/dev/null; then
  fail "example.com connection succeeded — firewall is NOT blocking unauthorized domains"
fi
echo "  OK: example.com blocked"

STEP="verify-allowed"
echo "Verifying: api.github.com should be reachable..."
if ! curl --max-time 10 -sf https://api.github.com &>/dev/null; then
  fail "api.github.com connection failed — whitelisted domain is not reachable"
fi
echo "  OK: api.github.com reachable"

# ---------------------------------------------------------------------------
# Success
# ---------------------------------------------------------------------------
echo ""
echo "Firewall active — ${#WHITELISTED_DOMAINS[@]} whitelisted domains (${RESOLVED_COUNT} resolved successfully)"
