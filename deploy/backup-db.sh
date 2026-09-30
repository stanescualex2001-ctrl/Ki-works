#!/usr/bin/env bash
#
# Tägliches Postgres-Backup der ki-works-Datenbank. Läuft als systemd-Timer
# (ki-works-backup.timer) unter dem Benutzer 'kiworks', damit die Backend-API
# (läuft ebenfalls als 'kiworks') das Verzeichnis lesen und den Status im
# Admin-Dashboard anzeigen kann.
#
# Ergänzt, ersetzt NICHT den Contabo-"Auto Backup"-Zusatz (komplette externe
# VPS-Sicherung) — dieses Skript liefert schnelle, granulare DB-Dumps für den
# Alltag (z. B. versehentlich gelöschte Reservierung wiederherstellen), ohne
# gleich die ganze VPS-Sicherung zurückspielen zu müssen.
set -euo pipefail
# DATABASE_URL/BACKUP_DIR/BACKUP_KEEP_DAYS kommen bereits über die
# systemd-Unit (EnvironmentFile=/etc/ki-works/ki-works.env) in den
# Prozess — die Datei ist root-only lesbar, ein zusätzliches `source`
# hier würde als User 'kiworks' mit "Permission denied" fehlschlagen.

BACKUP_DIR="${BACKUP_DIR:-/var/backups/ki-works}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
STAMP=$(date +%Y-%m-%d-%H%M)

mkdir -p "$BACKUP_DIR"
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/kiworks-$STAMP.sql.gz.tmp"
mv "$BACKUP_DIR/kiworks-$STAMP.sql.gz.tmp" "$BACKUP_DIR/kiworks-$STAMP.sql.gz"
chmod 600 "$BACKUP_DIR/kiworks-$STAMP.sql.gz"

find "$BACKUP_DIR" -name 'kiworks-*.sql.gz' -mtime "+$KEEP_DAYS" -delete

echo "Backup erstellt: $BACKUP_DIR/kiworks-$STAMP.sql.gz"
