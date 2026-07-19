# ki-works MVP

KI-Telefonassistent **"Kiwo"** für Restaurants: Vapi nimmt Anrufe entgegen,
Claude versteht die Gäste, Reservierungen und Bestellungen landen in
PostgreSQL und im React-Dashboard. n8n automatisiert Benachrichtigungen,
Berichte und den Kunden-Einladungs-Flow.

**Test-Restaurant:** Venezia, Marktplatz 10, 4311 Schwertberg · Vapi-Nummer:
+1 502 260 3690 (US-Testnummer; österreichische Nummer aktuell in Verifizierung)

## Was Kiwo kann

- Reservierungen annehmen, **stornieren und verschieben** (telefonisch, per
  Namen/Telefonnummer erkannt)
- Bestellungen anhand der hinterlegten **echten Speisekarte** aufnehmen
  (Gerichte, Preise, Aktionen, Öffnungszeiten inkl. Ruhetag) — die Karte liegt
  pro Restaurant in der Datenbank (`restaurants.menu`) und wird dem Assistenten
  bei jedem Anruf live mitgegeben, kein Neu-Deploy nötig bei Änderungen
- Stammgäste erkennen (Anrufer-Historie)
- Verpasste Anrufe und Systemfehler per E-Mail melden

## Architektur

```
Anruf → Vapi (+ Claude) ──webhook──▶ Node.js API (Port 3001) ──▶ PostgreSQL
                                          │
                                          ├──▶ n8n (Docker, Port 5678, 13 Workflows)
                                          │
        Browser ◀── nginx (SSL) ◀── React-Dashboard (statisch) + /api-Proxy
```

| Komponente | Technik | Ort |
|---|---|---|
| Backend-API | Node.js 22 + Express | `backend/` → systemd `ki-works-api` |
| Dashboard | React + Vite | `dashboard/` → nginx `ki-works.eu` |
| Datenbank | PostgreSQL | DB `kiworks` (nur localhost) |
| Automatisierung | n8n (Docker-Container) | `n8n/workflows/` → `n8n.ki-works.eu` |
| Reverse Proxy | nginx + Let's Encrypt | `deploy/nginx/` |

## Installation auf dem Server

Als root auf dem Server (Ubuntu 22.04/24.04):

```bash
git clone https://github.com/stanescualex2001-ctrl/Ki-works.git /root/ki-works-src
cd /root/ki-works-src

ANTHROPIC_API_KEY='sk-ant-...' \
VAPI_API_KEY='...' \
VAPI_PHONE_NUMBER='+15022603690' \
CERTBOT_EMAIL='deine@mail.tld' \
bash deploy/install.sh
```

Der Installer richtet alles ein: Pakete, Node.js 22, PostgreSQL (Schema + Seed
mit Venezia), Backend- und Dashboard-Build, n8n (Docker) inkl. Workflow-Import,
systemd-Dienste, nginx mit Basic Auth und Let's-Encrypt-SSL. Zugangsdaten
landen in `/etc/ki-works/credentials.txt`.

Danach den Vapi-Assistenten anlegen und die Nummer verknüpfen:

```bash
bash /opt/ki-works/deploy/setup-vapi.sh
```

### Voraussetzungen

- DNS: `ki-works.eu`, `www.ki-works.eu` und `n8n.ki-works.eu` müssen als
  A-Records auf die Server-IP zeigen, sonst schlägt der SSL-Schritt fehl
  (kann später mit `certbot --nginx ...` nachgeholt werden).
- Ports 80/443 offen.

### Nach der Installation

1. **n8n einrichten:** `https://n8n.ki-works.eu` öffnen, Owner-Konto anlegen,
   SMTP-Credential mit dem Namen **„KiWorks SMTP"** erstellen und die
   13 importierten Workflows aktivieren. n8n läuft in Docker — `$env`-Zugriff
   auf Umgebungsvariablen ist dort standardmäßig blockiert, deshalb sind
   Absender-/Fallback-Adressen in den Workflow-Dateien fest auf
   `info@ki-works.eu` gesetzt statt über Umgebungsvariablen gelöst.
2. **Testanruf:** +1 502 260 3690 anrufen und einen Tisch reservieren —
   die Reservierung erscheint im Dashboard unter „Reservierungen".

## Die 13 n8n-Workflows

| # | Workflow | Auslöser | Aktion |
|---|---|---|---|
| 1 | Anruf abgeschlossen | Webhook vom Backend | E-Mail mit KI-Zusammenfassung |
| 2 | Reservierung erstellt | Webhook vom Backend | Bestätigungs-E-Mail |
| 3 | Reservierungs-Erinnerung | stündlich | Erinnerung 2 h vor Reservierung |
| 4 | Tagesbericht pro Kunde | täglich 21:00 | Statistik-E-Mail |
| 5 | Wochenbericht pro Kunde | montags 08:00 | Von Claude formulierter Bericht |
| 6 | Verpasster Anruf | Webhook vom Backend | Alarm-E-Mail mit Rückrufbitte |
| 7 | Neues Restaurant | Webhook vom Backend | Vapi-Assistent automatisch anlegen |
| 8 | Neuer Interessent | Webhook vom Backend | Benachrichtigung an ki-works |
| 9 | Neue Bestellung | Webhook vom Backend | Bestell-Benachrichtigung ans Restaurant |
| 10 | Kunde eingeladen | Webhook vom Backend | Setup-Mail mit Link zum eigenen Passwort |
| 11 | Reservierung storniert | Webhook vom Backend | Benachrichtigung ans Restaurant |
| 12 | Reservierung verschoben | Webhook vom Backend | Benachrichtigung ans Restaurant |
| 13 | System-Alarm | Webhook vom Backend | Alarm-E-Mail bei erkanntem Problem |

## Kunden-Einladung & Zugang

Neue Restaurants erhalten ihren Dashboard-Zugang über einen Einladungs-Link
(Workflow 10): Admin legt das Restaurant an bzw. wandelt einen Interessenten
(„Lead") um, das System verschickt einen Setup-Link, der Kunde vergibt dabei
sein eigenes Passwort. Alternativ kann ein Passwort auch direkt im
Admin-Dashboard gesetzt werden.

## Monitoring & Backups

- `backend/src/monitoring.js` — Health-Checks im Backend, meldet Probleme über
  Workflow 13 (System-Alarm) per E-Mail
- `deploy/backup-db.sh` — Datenbank-Backup-Skript
- Im Dashboard gibt es für Admins einen „System"-Bereich mit Status-Überblick

## Datenschutz

Grundausstattung für die DSGVO ist in `backend/sql/migration-008-privacy.sql`
angelegt (Basis, kein vollständiges Rechtsgutachten — Impressum/Datenschutz-
erklärung und AVV-Verträge sind separat zu prüfen).

## API-Überblick

- `GET /api/health` – Healthcheck
- `GET/POST/PATCH /api/restaurants` – Restaurants verwalten
- `GET/POST/PATCH /api/reservations` – Reservierungen (`/upcoming` für Erinnerungen)
- `GET/POST/PATCH /api/orders` – Bestellungen
- `GET /api/calls` – Anrufprotokolle mit Transkript & Zusammenfassung
- `GET /api/stats` (`/daily`, `/weekly`) – Kennzahlen
- `POST /api/leads/:id/convert` – Interessent in Kunden umwandeln + einladen
- `POST /api/restaurants/:id/invite` – Einladung erneut versenden
- `POST /api/public/setup-password` – Passwort per Einladungs-Token setzen
- `POST /api/webhooks/vapi` – Vapi-Webhook (Tool-Calls + End-of-Call-Report,
  abgesichert per `X-Vapi-Secret`)

Dashboard und API sind per nginx Basic Auth geschützt (Benutzer `admin`,
Passwort siehe `/etc/ki-works/credentials.txt`); Vapi-Webhook und die
`/api/public/...`-Routen (u. a. Passwort-Setup) sind ohne Basic Auth erreichbar.

## Sicherheit

- **Keine Secrets im Repo** — alle Keys liegen in `/etc/ki-works/ki-works.env` (chmod 640).
- API-Keys, die versehentlich geteilt wurden (z. B. im Chat), **umgehend rotieren**
  (Anthropic Console bzw. Vapi Dashboard).
- Root-Passwort-Login per SSH deaktivieren, sobald ein SSH-Key eingerichtet ist.
- Vor echtem Go-Live: `backend/sql/dev-seed-cleanup.sql` ausführen, um
  Demo-/Testdaten (Marker `[DEMO]`) aus der Produktionsdatenbank zu entfernen.

## Lokale Entwicklung

```bash
cd backend && npm install && npm run dev      # API auf :3001
cd dashboard && npm install && npm run dev    # Vite-Dev-Server mit /api-Proxy
```
