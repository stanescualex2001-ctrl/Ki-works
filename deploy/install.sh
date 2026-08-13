#!/usr/bin/env bash
#
# ki-works MVP — One-Shot-Installer für Ubuntu/Debian (getestet für Ubuntu 22.04/24.04)
#
# Aufruf auf dem Server (als root), Keys als Umgebungsvariablen übergeben:
#
#   ANTHROPIC_API_KEY='sk-ant-...' \
#   VAPI_API_KEY='...' \
#   VAPI_PHONE_NUMBER='+15022603690' \
#   CERTBOT_EMAIL='du@example.com' \
#   bash deploy/install.sh
#
set -euo pipefail

DOMAIN="${DOMAIN:-ki-works.eu}"
APP_DIR=/opt/ki-works
ENV_DIR=/etc/ki-works
ENV_FILE=$ENV_DIR/ki-works.env
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log()  { echo -e "\n\033[1;34m==> $*\033[0m"; }
fail() { echo -e "\033[1;31mFEHLER: $*\033[0m" >&2; exit 1; }

[[ $EUID -eq 0 ]] || fail "Bitte als root ausführen."

# --- Keys einsammeln (Env-Variablen oder interaktive Abfrage) -----------------
prompt_if_missing() {
  local var=$1 label=$2
  if [[ -z "${!var:-}" ]]; then
    read -rp "$label: " value
    printf -v "$var" '%s' "$value"
  fi
}
prompt_if_missing ANTHROPIC_API_KEY "Anthropic API Key (sk-ant-...)"
prompt_if_missing VAPI_API_KEY "Vapi API Key"
VAPI_PHONE_NUMBER="${VAPI_PHONE_NUMBER:-+15022603690}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@$DOMAIN}"

# --- Pakete -------------------------------------------------------------------
log "Systempakete installieren"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl git jq nginx postgresql postgresql-contrib \
  certbot python3-certbot-nginx apache2-utils ca-certificates

if ! command -v node >/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  log "Node.js 22 installieren"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y -qq nodejs
fi
node -v

timedatectl set-timezone Europe/Vienna || true

# --- Benutzer & Code ------------------------------------------------------------
log "Benutzer 'kiworks' und $APP_DIR einrichten"
id kiworks &>/dev/null || useradd -r -m -d /home/kiworks -s /usr/sbin/nologin kiworks
mkdir -p "$APP_DIR"
rsync -a --delete --exclude .git --exclude node_modules --exclude dist "$REPO_DIR/" "$APP_DIR/"
chown -R kiworks:kiworks "$APP_DIR"

# --- PostgreSQL -----------------------------------------------------------------
log "PostgreSQL einrichten"
systemctl enable --now postgresql
DB_PASS_FILE=$ENV_DIR/.dbpass
mkdir -p "$ENV_DIR" && chmod 750 "$ENV_DIR"
if [[ -f $DB_PASS_FILE ]]; then
  DB_PASS=$(cat "$DB_PASS_FILE")
else
  DB_PASS=$(openssl rand -hex 16)
  echo "$DB_PASS" > "$DB_PASS_FILE" && chmod 600 "$DB_PASS_FILE"
fi
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='kiworks'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE ROLE kiworks LOGIN PASSWORD '$DB_PASS'"
sudo -u postgres psql -c "ALTER ROLE kiworks PASSWORD '$DB_PASS'"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='kiworks'" | grep -q 1 \
  || sudo -u postgres createdb -O kiworks kiworks
export PGPASSWORD=$DB_PASS
psql -h 127.0.0.1 -U kiworks -d kiworks -f "$APP_DIR/backend/sql/schema.sql"
for migration in "$APP_DIR"/backend/sql/migration-*.sql; do
  [[ -e $migration ]] && psql -h 127.0.0.1 -U kiworks -d kiworks -f "$migration"
done
psql -h 127.0.0.1 -U kiworks -d kiworks -f "$APP_DIR/backend/sql/seed.sql"
unset PGPASSWORD

# --- Konfiguration ----------------------------------------------------------------
log "Konfiguration nach $ENV_FILE schreiben"
VAPI_WEBHOOK_SECRET_FILE=$ENV_DIR/.vapisecret
if [[ -f $VAPI_WEBHOOK_SECRET_FILE ]]; then
  VAPI_WEBHOOK_SECRET=$(cat "$VAPI_WEBHOOK_SECRET_FILE")
else
  VAPI_WEBHOOK_SECRET=$(openssl rand -hex 24)
  echo "$VAPI_WEBHOOK_SECRET" > "$VAPI_WEBHOOK_SECRET_FILE" && chmod 600 "$VAPI_WEBHOOK_SECRET_FILE"
fi
AUTH_SECRET_FILE=$ENV_DIR/.authsecret
if [[ -f $AUTH_SECRET_FILE ]]; then
  AUTH_SECRET=$(cat "$AUTH_SECRET_FILE")
else
  AUTH_SECRET=$(openssl rand -hex 32)
  echo "$AUTH_SECRET" > "$AUTH_SECRET_FILE" && chmod 600 "$AUTH_SECRET_FILE"
fi
ADMIN_PASS_FILE=$ENV_DIR/.adminpass
if [[ -f $ADMIN_PASS_FILE ]]; then
  ADMIN_PASSWORD=$(cat "$ADMIN_PASS_FILE")
else
  ADMIN_PASSWORD=$(openssl rand -base64 12 | tr -d '=+/')
  echo "$ADMIN_PASSWORD" > "$ADMIN_PASS_FILE" && chmod 600 "$ADMIN_PASS_FILE"
fi
cat > "$ENV_FILE" <<EOF
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
CLAUDE_MODEL=claude-haiku-4-5-20251001
VAPI_API_KEY=$VAPI_API_KEY
VAPI_PHONE_NUMBER=$VAPI_PHONE_NUMBER
VAPI_WEBHOOK_SECRET=$VAPI_WEBHOOK_SECRET
DATABASE_URL=postgres://kiworks:$DB_PASS@127.0.0.1:5432/kiworks
PORT=3001
KIWORKS_PUBLIC_URL=https://$DOMAIN
N8N_BASE_URL=http://127.0.0.1:5678
KIWORKS_FROM_EMAIL=noreply@$DOMAIN
KIWORKS_FALLBACK_EMAIL=${KIWORKS_FALLBACK_EMAIL:-$CERTBOT_EMAIL}
AUTH_SECRET=$AUTH_SECRET
ADMIN_EMAIL=${ADMIN_EMAIL:-$CERTBOT_EMAIL}
ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF
chmod 640 "$ENV_FILE" && chgrp kiworks "$ENV_FILE"

# --- Backend & Dashboard bauen ------------------------------------------------------
log "Backend-Abhängigkeiten installieren"
sudo -u kiworks bash -c "cd $APP_DIR/backend && npm install --omit=dev --no-audit --no-fund"

log "Dashboard bauen"
sudo -u kiworks bash -c "cd $APP_DIR/dashboard && npm install --no-audit --no-fund && npm run build"

log "Business-Dashboard bauen"
sudo -u kiworks bash -c "cd $APP_DIR/business-dashboard && npm install --no-audit --no-fund && npm run build"

log "Landingpage bauen"
sudo -u kiworks bash -c "cd $APP_DIR/landing && npm install --no-audit --no-fund && npm run build"

# --- n8n ------------------------------------------------------------------------
log "n8n installieren"
command -v n8n >/dev/null || npm install -g n8n --no-audit --no-fund
install -m 644 "$APP_DIR/deploy/systemd/n8n.service" /etc/systemd/system/n8n.service
log "n8n-Workflows importieren"
sudo -u kiworks env HOME=/home/kiworks n8n import:workflow \
  --separate --input="$APP_DIR/n8n/workflows" || echo "WARNUNG: Workflow-Import fehlgeschlagen — im n8n-UI manuell importieren."

# --- systemd ----------------------------------------------------------------------
log "Dienste starten"
install -m 644 "$APP_DIR/deploy/systemd/ki-works-api.service" /etc/systemd/system/ki-works-api.service
install -m 644 "$APP_DIR/deploy/systemd/ki-works-backup.service" /etc/systemd/system/ki-works-backup.service
install -m 644 "$APP_DIR/deploy/systemd/ki-works-backup.timer" /etc/systemd/system/ki-works-backup.timer
mkdir -p /var/backups/ki-works && chown kiworks:kiworks /var/backups/ki-works
systemctl daemon-reload
systemctl enable --now ki-works-api n8n ki-works-backup.timer
sleep 3
systemctl --no-pager --lines=0 status ki-works-api n8n || true

# --- nginx --------------------------------------------------------------------------
# Bootstrap zuerst OHNE SSL (deploy/nginx/ki-works.conf im Repo enthält seit
# 13.08.2026 die SSL-Zeilen fest eingetragen — die Zertifikatsdateien gibt es
# aber bei einem Neu-Aufsetzen hier noch nicht, ein `nginx -t` würde damit
# fehlschlagen). Nach erfolgreichem Certbot-Lauf wird unten die vollständige
# Repo-Datei eingespielt.
log "nginx vorläufig ohne SSL konfigurieren (Bootstrap für Certbot)"
cat > /etc/nginx/sites-available/ki-works.conf <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $APP_DIR/landing/dist;
    index index.html;
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
    location /intern {
        alias $APP_DIR/business-dashboard/dist;
        try_files \$uri \$uri/ /intern/index.html;
    }
    location / {
        try_files \$uri /index.html;
    }
}
server {
    listen 80;
    server_name n8n.$DOMAIN;
    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 300s;
    }
}
EOF
ln -sf /etc/nginx/sites-available/ki-works.conf /etc/nginx/sites-enabled/ki-works.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# --- SSL (Let's Encrypt) ---------------------------------------------------------------
log "SSL-Zertifikate anfordern (setzt DNS auf diese Server-IP voraus)"
certbot --nginx --non-interactive --agree-tos -m "$CERTBOT_EMAIL" \
  -d "$DOMAIN" -d "www.$DOMAIN" -d "n8n.$DOMAIN" --redirect \
  && { log "Zertifikate erhalten — vollständige Repo-Konfiguration (mit fest eingetragenen SSL-Pfaden) einspielen"; \
       install -m 644 "$APP_DIR/deploy/nginx/ki-works.conf" /etc/nginx/sites-available/ki-works.conf; \
       nginx -t && systemctl reload nginx; } \
  || echo "WARNUNG: certbot fehlgeschlagen (DNS prüfen!). Später erneut: certbot --nginx -d $DOMAIN -d www.$DOMAIN -d n8n.$DOMAIN — danach deploy/nginx/ki-works.conf einspielen und nginx neu laden."

# --- Zusammenfassung ----------------------------------------------------------------------
cat > $ENV_DIR/credentials.txt <<EOF
ki-works Zugangsdaten ($(date -Iseconds))
Dashboard-Betreiber-Login: https://$DOMAIN  (${ADMIN_EMAIL:-$CERTBOT_EMAIL} / $ADMIN_PASSWORD)
n8n:        https://n8n.$DOMAIN (Owner-Konto beim ersten Aufruf anlegen)
Postgres:   kiworks / $DB_PASS (nur localhost)
Vapi-Webhook-Secret (X-Vapi-Secret): $VAPI_WEBHOOK_SECRET
EOF
chmod 600 $ENV_DIR/credentials.txt

log "FERTIG!"
echo "-----------------------------------------------------------"
echo " Dashboard : https://$DOMAIN   (Betreiber-Login: ${ADMIN_EMAIL:-$CERTBOT_EMAIL} / $ADMIN_PASSWORD)"
echo " n8n       : https://n8n.$DOMAIN"
echo " API-Health: https://$DOMAIN/api/health"
echo ""
echo " Zugangsdaten gespeichert in: $ENV_DIR/credentials.txt"
echo ""
echo " Nächste Schritte:"
echo "  1. DNS: $DOMAIN, www.$DOMAIN und n8n.$DOMAIN auf diese Server-IP zeigen lassen"
echo "  2. Vapi-Assistent anlegen:  bash $APP_DIR/deploy/setup-vapi.sh"
echo "  3. In n8n (https://n8n.$DOMAIN): Owner-Konto anlegen, SMTP-Credential"
echo "     'KiWorks SMTP' erstellen und die Workflows aktivieren (inkl. 13-system-alarm)"
echo "  4. Im Contabo-Kundenpanel den 'Auto Backup'-Zusatz für den VPS aktivieren"
echo "     (externe, tägliche Komplettsicherung — ergänzt das lokale DB-Backup)"
echo "-----------------------------------------------------------"
