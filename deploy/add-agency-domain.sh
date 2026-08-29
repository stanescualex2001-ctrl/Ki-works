#!/usr/bin/env bash
#
# White-Label-Agentur-Domain hinzufügen — richtet einen eigenen nginx-
# server-Block + eigenes Let's-Encrypt-Zertifikat für eine Agentur-Domain
# ein, die auf denselben Dashboard-Build/Backend zeigt wie ki-works.eu.
# Bewusst eine EIGENE Datei pro Agentur statt Erweiterung von
# deploy/nginx/ki-works.conf (die ist hand-gepflegt mit fest eingetragenen
# SSL-Pfaden, siehe deren eigener Kommentar zum Vorfall vom 13.08.2026 —
# mehrere Domains dort reinzumischen erhöht genau das Risiko wieder).
# Diese Datei hier bleibt komplett von Certbot verwaltet.
#
# Aufruf auf dem Server (als root), NACHDEM die Agentur ihr DNS
# (A-Record oder CNAME) bereits auf diese Server-IP gesetzt hat:
#
#   bash deploy/add-agency-domain.sh kunden.agentur.at
#
set -euo pipefail

DOMAIN="${1:-}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
APP_DIR=/opt/ki-works
CONF_FILE="/etc/nginx/sites-available/agency-${DOMAIN}.conf"

log()  { echo -e "\n\033[1;34m==> $*\033[0m"; }
fail() { echo -e "\033[1;31mFEHLER: $*\033[0m" >&2; exit 1; }

[[ $EUID -eq 0 ]] || fail "Bitte als root ausführen."
[[ -n "$DOMAIN" ]] || fail "Aufruf: bash deploy/add-agency-domain.sh <domain>"
if [[ -z "$CERTBOT_EMAIL" ]]; then
  read -rp "E-Mail für Let's-Encrypt-Benachrichtigungen: " CERTBOT_EMAIL
fi

log "Prüfe DNS für $DOMAIN"
SERVER_IP="$(curl -s -4 https://ifconfig.me || true)"
DOMAIN_IP="$(dig +short "$DOMAIN" A | tail -1 || true)"
if [[ -z "$DOMAIN_IP" ]]; then
  fail "$DOMAIN löst noch nicht auf. Die Agentur muss zuerst einen A-Record/CNAME auf diese Server-IP ($SERVER_IP) setzen, dann erneut versuchen."
elif [[ -n "$SERVER_IP" && "$DOMAIN_IP" != "$SERVER_IP" ]]; then
  echo "WARNUNG: $DOMAIN zeigt auf $DOMAIN_IP, dieser Server ist $SERVER_IP — Certbot wird vermutlich fehlschlagen."
fi

log "nginx-Bootstrap-Block (ohne SSL) für $DOMAIN schreiben"
cat > "$CONF_FILE" <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    location /dashboard {
        alias $APP_DIR/dashboard/dist;
        try_files \$uri \$uri/ /dashboard/index.html;
    }
    location / {
        return 301 /dashboard;
    }
}
EOF
ln -sf "$CONF_FILE" "/etc/nginx/sites-enabled/agency-${DOMAIN}.conf"
nginx -t && systemctl reload nginx

log "SSL-Zertifikat für $DOMAIN anfordern"
certbot --nginx --non-interactive --agree-tos -m "$CERTBOT_EMAIL" -d "$DOMAIN" --redirect \
  && log "Fertig — $DOMAIN läuft jetzt unter https://$DOMAIN/dashboard/" \
  || fail "Certbot fehlgeschlagen (DNS/Firewall prüfen). Später erneut: certbot --nginx -d $DOMAIN"

echo
echo "Nächster Schritt: Agentur im Business-Dashboard (/intern) anlegen —"
echo "Domain '$DOMAIN' muss exakt mit agencies.domain in der Datenbank übereinstimmen."
