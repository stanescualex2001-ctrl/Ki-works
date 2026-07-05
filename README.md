# ki-works MVP

KI-Telefonassistent für Restaurant-Reservierungen: Vapi nimmt Anrufe entgegen,
Claude versteht die Gäste, Reservierungen landen in PostgreSQL und im
React-Dashboard. n8n automatisiert Benachrichtigungen und Berichte.

**Test-Restaurant:** Venezia, Marktplatz 10, 4311 Schwertberg · Vapi-Nummer: +1 502 260 3690

## Architektur

```
Anruf → Vapi (+ Claude) ──webhook──▶ Node.js API (Port 3001) ──▶ PostgreSQL
                                          │
                                          ├──▶ n8n (Port 5678, 7 Workflows)
                                          │
        Browser ◀── nginx (SSL) ◀── React-Dashboard (statisch) + /api-Proxy
```

| Komponente | Technik | Ort |
|---|---|---|
| Backend-API | Node.js 22 + Express | `backend/` → systemd `ki-works-api` |
| Dashboard | React + Vite | `dashboard/` → nginx `ki-works.eu` |
| Datenbank | PostgreSQL | DB `kiworks` (nur localhost) |
| Automatisierung | n8n | `n8n/workflows/` → `n8n.ki-works.eu` |
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
mit Venezia), Backend- und Dashboard-Build, n8n inkl. Workflow-Import,
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
   7 importierten Workflows aktivieren.
2. **Testanruf:** +1 502 260 3690 anrufen und einen Tisch reservieren —
   die Reservierung erscheint im Dashboard unter „Reservierungen".

## Die 7 n8n-Workflows

| # | Workflow | Auslöser | Aktion |
|---|---|---|---|
| 1 | Anruf abgeschlossen | Webhook vom Backend | E-Mail mit KI-Zusammenfassung |
| 2 | Reservierung erstellt | Webhook vom Backend | Bestätigungs-E-Mail |
| 3 | Reservierungs-Erinnerung | stündlich | Erinnerung 2 h vor Reservierung |
| 4 | Tagesbericht | täglich 21:00 | Statistik-E-Mail |
| 5 | Wochenbericht | montags 08:00 | Von Claude formulierter Bericht |
| 6 | Verpasster Anruf | Webhook vom Backend | Alarm-E-Mail mit Rückrufbitte |
| 7 | Restaurant-Onboarding | Webhook vom Backend | Vapi-Assistent automatisch anlegen |

## API-Überblick

- `GET /api/health` – Healthcheck
- `GET/POST/PATCH /api/restaurants` – Restaurants verwalten
- `GET/POST/PATCH /api/reservations` – Reservierungen (`/upcoming` für Erinnerungen)
- `GET /api/calls` – Anrufprotokolle mit Transkript & Zusammenfassung
- `GET /api/stats` (`/daily`, `/weekly`) – Kennzahlen
- `POST /api/webhooks/vapi` – Vapi-Webhook (Tool-Calls + End-of-Call-Report,
  abgesichert per `X-Vapi-Secret`)

Dashboard und API sind per nginx Basic Auth geschützt (Benutzer `admin`,
Passwort siehe `/etc/ki-works/credentials.txt`); nur der Vapi-Webhook ist
ohne Basic Auth erreichbar.

## Sicherheit

- **Keine Secrets im Repo** — alle Keys liegen in `/etc/ki-works/ki-works.env` (chmod 640).
- API-Keys, die versehentlich geteilt wurden (z. B. im Chat), **umgehend rotieren**
  (Anthropic Console bzw. Vapi Dashboard).
- Root-Passwort-Login per SSH deaktivieren, sobald ein SSH-Key eingerichtet ist.

## Lokale Entwicklung

```bash
cd backend && npm install && npm run dev      # API auf :3001
cd dashboard && npm install && npm run dev    # Vite-Dev-Server mit /api-Proxy
```
