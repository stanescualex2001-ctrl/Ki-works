# ki-works – Projektkontext für Claude

KI-Telefonassistent **"Kiwo"** für Restaurants. Vapi nimmt Anrufe entgegen,
Claude versteht die Gäste, Node.js-API + PostgreSQL speichern Reservierungen/
Bestellungen, React-Dashboard zeigt sie an, n8n (Docker) automatisiert
Benachrichtigungen. Details/Architektur: siehe `README.md`.

**Deployment:** Contabo-VPS, `ki-works.eu`. Claude hat **keinen direkten
SSH-Zugriff** — alle serverseitigen Schritte (Deploy, Migrationen, n8n-Import
usw.) müssen dem Nutzer als copy-paste-fertige Befehle gegeben werden.

**Update-Ablauf auf dem Server (wichtig — `/opt/ki-works` ist KEIN Git-Repo!):**
Der Sourcecode liegt zum Ausrollen in `/root/ki-works-src` (Git-Repo), von dort
per `rsync` nach `/opt/ki-works` kopiert (so macht es auch `deploy/install.sh`).
Ein `git pull` direkt in `/opt/ki-works` schlägt fehl. Korrekter Ablauf nach
jedem Push auf den Arbeitsbranch:
```bash
cd /root/ki-works-src
git fetch origin
git checkout claude/ki-works-mvp-deploy-0wtfaz
git pull origin claude/ki-works-mvp-deploy-0wtfaz

rsync -a --delete --exclude .git --exclude node_modules --exclude dist --exclude backend/public/social-assets /root/ki-works-src/ /opt/ki-works/
chown -R kiworks:kiworks /opt/ki-works

sudo -u kiworks bash -c "cd /opt/ki-works/landing && npm install --no-audit --no-fund && npm run build"
sudo -u kiworks bash -c "cd /opt/ki-works/dashboard && npm install --no-audit --no-fund && npm run build"
sudo -u kiworks bash -c "cd /opt/ki-works/business-dashboard && npm install --no-audit --no-fund && npm run build"
```
Nur bei Backend-Änderungen zusätzlich: `sudo -u kiworks bash -c "cd
/opt/ki-works/backend && npm install --omit=dev --no-audit --no-fund"` und
`systemctl restart ki-works-api`. Secrets/Env-Variablen liegen separat unter
`/etc/ki-works/` und werden vom rsync nicht berührt. **Wichtig (18.08.2026
per systemd-Unit verifiziert):** die vom Backend-Service tatsächlich
gelesene Datei ist `/etc/ki-works/ki-works.env` (per `EnvironmentFile=` in
`/etc/systemd/system/ki-works-api.service`) — **nicht**
`/etc/ki-works/.env`. Neue Env-Variablen für das Backend immer in
`ki-works.env` eintragen, danach `systemctl restart ki-works-api`; zur
Kontrolle ggf. `sudo cat /proc/$(systemctl show ki-works-api -p MainPID
--value)/environ | tr '\0' '\n' | grep <NAME>`.

**Test-Restaurant:** Venezia, Marktplatz 10, 4311 Schwertberg.

**Repo/Branch:** `stanescualex2001-ctrl/Ki-works`, Arbeitsbranch
`claude/ki-works-mvp-deploy-0wtfaz`.

## Standing Rules (immer befolgen)

- Antworten **kurz und präzis** halten (Token sparen) — ohne unnötige
  Erklärungen; falls Erklärungen gewünscht sind, fragt der Nutzer gezielt
  danach.
- **Vor** Code-Änderungen erst mit dem Nutzer abstimmen, außer explizit anders
  gewünscht.
- **Nie committen/pushen ohne explizite Aufforderung** des Nutzers — außer
  bei reinen CLAUDE.md-Änderungen: die werden immer sofort automatisch
  committet+gepusht, damit sie in künftigen Sitzungen verfügbar sind. Für
  Code-Änderungen (Dashboard/Backend/etc.) bleibt es bei "erst fragen".
- Nutzer ist nicht technisch — Erklärungen einfach halten, keine unnötigen
  Rückfragen zu bereits Entschiedenem.
- **SEO/AIO-Pattern für neue Seiten:** Jede neue Landingpage/Unterseite auf
  ki-works.eu soll dasselbe Prerendering (`react-dom/server`, kein
  Headless-Browser) + Meta-Tags/JSON-LD/robots.txt/sitemap.xml/llms.txt
  bekommen wie in `landing/` bereits umgesetzt (siehe „Bereits erledigt").
- **Nie echtes Nutzungsguthaben verbrauchen ohne Bestätigung des Nutzers:**
  jede Aktion, die reales Anthropic-/Vapi-/Twilio-Guthaben kostet (z. B.
  Sales-Agent oder Social-Agent auf dem Server auslösen, einen Testanruf
  starten, das Kiwo-Web-Chat-Widget mit echten Nachrichten durchtesten,
  eine eigene Websuche/Claude-API-Anfrage in dieser Sitzung ausführen, die
  nicht rein für Code-Recherche/Doku ist) nur nach expliziter Bestätigung
  des Nutzers auslösen — auch wenn es als nächster logischer Schritt
  naheliegt. Im Zweifel fragen statt einfach loslaufen zu lassen.
- **Bei erreichtem Nutzungslimit dieser Chat-Sitzung selbst (Claude-Code-
  Kontingent, nicht Anthropic-/Vapi-/Twilio-API-Guthaben) sofort stoppen:**
  zeigt diese Sitzung einen Hinweis auf ein erreichtes/nahendes
  Nutzungslimit oder Kontingent, keine weiteren kostenintensiven
  Aktionen mehr fortsetzen — den Nutzer informieren und nachfragen statt
  einfach weiterzuarbeiten.
- **Deploy-Befehle immer proaktiv mitgeben:** Sobald eine gepushte
  Code-Änderung serverseitig ausgerollt werden muss (z. B. `landing/`
  oder `dashboard/` neu bauen), die passenden copy-paste-fertigen Befehle
  direkt in derselben Antwort mitgeben — ohne dass der Nutzer extra danach
  fragen muss.
- **Versionierung (seit 16.09.2026):** `version` in den 4 `package.json`
  (`backend/`, `landing/`, `dashboard/`, `business-dashboard/`) startet bei
  **1.0.0** (Nutzer-Entscheidung: soll den bereits gebauten Umfang
  widerspiegeln, nicht bei 0.1.0 hängen bleiben). Danach bei jeder
  spürbaren neuen Funktion/Verbesserung die **Minor-Version** in allen 4
  Dateien gemeinsam hochzählen (1.1.0, 1.2.0, 1.3.0, ...) — zeigt laufende
  Weiterentwicklung der Plattform. Ein größerer Sprung (2.0.0) ist für
  einen echten Meilenstein wie eine neue Kiwo-Rolle (Sales/Office) oder
  einen größeren Architekturumbau gedacht, kein festes Datum. Kleinere
  Bugfixes/Textkorrekturen ohne neue Funktion brauchen keinen Versions-
  sprung.
- **Selbst wie ein UX-Designer denken, nicht nur wie ein Coder
  (20.09.2026):** Bei UI-Änderungen (Platzierung, Größe/Auffälligkeit,
  Gruppierung zusammengehöriger Elemente) selbst vorab prüfen, ob die
  Umsetzung wirklich gut aussieht/sinnvoll sitzt — nicht nur wortwörtlich
  umsetzen und auf Nutzer-Korrektur warten (Beispiel: der neue
  Chat-Hinweis wurde zunächst zu klein UND an die falsche Stelle
  gesetzt, beides musste der Nutzer nachträglich anstoßen, hätte aber
  von Anfang an mitbedacht werden können). Gilt besonders für
  `landing/` (sichtbare Marketing-Seite).
- **Bei grundlegenden/strukturellen Änderungen (nicht bei kleinen
  Text-/Style-Fixes) zuerst ein Artifact-Prototyp, dann erst echter Code
  (20.09.2026, ROI-Rechner-Umbau):** Nutzer hat nach einem direkt in den
  echten Code geschriebenen (und bereits gepushten) Fix explizit
  zurückgewiesen: "zuerst Prototyp für testen !!!". Gilt vor allem für
  Rechenlogik/Formeln und größere UI-Umbauten auf `landing/` — bei
  offensichtlich risikoarmen, rein kosmetischen Änderungen (z. B. Text
  größer machen) ist ein Prototyp-Umweg nicht nötig.
## Architektur (Kurzfassung)

- **Apps:** `backend/` (Node/Express, PostgreSQL), `landing/` (ki-works.eu, Vite+React, SSR-Prerender, DE/EN/RO),
  `dashboard/` (`/dashboard/`, Kunden/Admin/Agenturen, DE/EN/RO), `business-dashboard/` (`/intern/`, nur Admin:
  Sales-/Social-Agent, Freigaben, Aktivitätsprotokoll pro Business-Karte).
- **Rollen pro Kunde** (`restaurants.enabled_roles`): reception/support/orders/appointments live; sales/office noch nicht.
  Prompt+Tools baut `backend/src/vapiAdmin.js` aus der `ROLE_BLOCKS`-Registry. Sprachen/Stimmen: `voiceOptions.js`.
- **Logins:** admin (ENV `ADMIN_EMAIL`/`ADMIN_PASSWORD`), customer, agency (White-Label, eigene Domain, Einladungs-Flow).
- **Agenten:** `salesAgent.js`/`socialAgent.js` + Registry `businessProfiles.js` (ki-works/ledtek/pixelpress) → schreiben
  `pending_actions` (Freigabe-Gate), Freigabe löst IMAP-Mail-Entwurf bzw. FB/IG-Post aus (nur ki-works).
- **Weiteres:** Web-Chat-Widget (`webchat.js`, Kunde "Ki Works" via `KIWORKS_OWN_RESTAURANT_ID`), `audit_log`,
  Nutzungsanzeige (`/api/usage`, nur Anzeige, kein Billing), Live-Weiterleitung (`transfer_phone_number`),
  Demo-Squad für +43 726 223 417 (DE/EN/RO), Venezia-Demo-Daten-Refresh (Timer, vor Go-Live deaktivieren).
- **Preise:** Solo 99 €/600 Min, Team 249 €/1500, Scale 499 €/3500, 0,20 €/Zusatzminute (Quelle: `landing/src/App.jsx`
  `pricingTiers`, in `backend/src/server.js` `PRICING_TIERS` synchron halten). Kostenbasis 0,085 €/Min intern, nie öffentlich.
- **Details/Historie:** `docs/CHANGELOG.md` (erledigt), `docs/IDEEN.md`, `docs/OFFENE_PUNKTE.md` (ausführlich),
  `MARKETING.md`. Bei Bedarf gezielt per Grep nachschlagen, nicht komplett lesen.

## Lehren aus Fehlern (nicht wiederholen)

- **nginx/SSL:** Repo-Datei `deploy/nginx/ki-works.conf` enthält SSL-Blöcke; Kopie nach `/etc/nginx/sites-available/ki-works.conf`
  + `nginx -t && systemctl reload nginx` manuell (nie per rsync). Pfade `/dashboard*`, `/intern*` sind Präfix-Matches:
  keine statischen Ordner mit diesen Namensanfängen in `landing/public`.
- **rsync-Deploy:** immer mit `--exclude backend/public/social-assets`, sonst werden Bilder gelöscht.
- **Backend-Neustart nicht vergessen** (`systemctl restart ki-works-api`), sobald Backend-Dateien geändert sind.
- **Env-Datei:** `/etc/ki-works/ki-works.env` (nicht `.env`). Backup-Skript nicht selbst `source`n.
- **Vapi:** neue/geänderte Assistenten brauchen manuell "Publish" im Vapi-Dashboard; `GET /assistant/:id` kann alte
  Version liefern; bei Problemen `deploy/setup-vapi.sh <id>`, F5, sofort Publish. Nummern ohne Leerzeichen speichern.
  Platzhalter `{{business_name}}` neu, alte `restaurant_*` werden weiter mitgesendet.
- **Sales-Agent:** langer Tool-Use-Lauf braucht `client.messages.stream()` (sonst Verbindungs-Kappung ~900s);
  `max_tokens` 16000; Caching aktiv; keine "keine Website"-Behauptung ohne gezielte Suche. Läufe kosten ~2 € real.
- **Website-Wahrheit:** nichts behaupten, was nicht gebaut ist (kein WhatsApp, SSO, E2E, CRM, Integrationen, Compliance-Claims
  wie "EU-AI-Act-konform"). Vor Texten gegen `ROLE_DEFINITIONS` prüfen.
- **useFetch/Formulare:** Hintergrund-Refresh darf offene Formulare nicht zurücksetzen.
- **Header-Layout:** Mobile = Grid, Desktop = Flex (`min-w-0`/`shrink-0` verhalten sich verschieden); bei 13 Breiten testen.
  Neue breitenabhängige Elemente: komplementäre Sichtbarkeit sofort mitdenken.
- **Theme-Keys pro App** (`kiworks-theme-landing/-dashboard/-intern`), da gleiche Origin.
- **Print-PDFs:** nur statische (nicht Variable) Fonts, TrimBox/BleedBox per pikepdf ergänzen; im Zweifel Proof-Datei der Druckerei erfragen.
- **Social-Assets (Chat-Sandbox):** `edge-tts` braucht Proxy-CA an `certifi` angehängt; echte Logos verwenden, Orb Buddy in jeder
  KI-Works-Reel-Szene, Caption als eigene Datei, Wegwerf-Skripte danach löschen.
- **DNS:** AAAA-Eintrag von ki-works.eu muss auf Contabo-IPv6 `2a02:c207:2341:9465::1` zeigen (war Ursache von Zertifikat-Problem + "Forbidden" im Mobilfunk, behoben, Mobilfunk bestätigt).
- **Diagnose:** Wenn eine Antwort den Fehler schon verrät, sofort benennen/beheben, nicht über mehrere Nachrichten ziehen.

## Offene Punkte (kurz; Details in `docs/OFFENE_PUNKTE.md`)

- **Marketing/Akquise:** Kaltmails + Social brachten bisher keine Rückmeldungen. Plan: Problem-Lösung-Texte mit Demo-Nummer
  als Handlung, UTM-Parameter, Fokus auf 1 Business/Kanal (ki-works, Restaurants Schwertberg); Instagram-Bio nennt fälschlich
  WhatsApp (selbst korrigieren). Nachfass-Mails erst nach Klärung § 174 TKG (Kaltmail-Einwilligung AT).
- **Rechtliches:** Impressum/Datenschutz rechtlich prüfen; Verantwortlicher-Platzhalter; USt-/Kleinunternehmer-Status
  ("zzgl. USt." in Preisen); Vapi-DPA fehlt + mögliches Modelltraining mit Anrufdaten (bei Vapi klären); DPIA; AVV.
- **Guthaben:** Anthropic/Vapi/Twilio im Auge behalten; Backfill-Skript `translate-call-summaries.js` noch nicht ausgeführt.
- **Social/Mail-Zugänge:** Meta (`FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN`, `IG_BUSINESS_ACCOUNT_ID`) und IMAP
  (`KIWORKS_MAIL_IMAP_*`) in `ki-works.env` noch nicht gesetzt.
- **Kiwo WhatsApp:** nur Konzept; Twilio-WhatsApp-Business/Meta-Freigabe noch nicht angestoßen (Pilot ki-works).
- **Vapi Publish** nicht automatisierbar; Wortlaut der dreisprachigen Sprachauswahl-Begrüßung (deutscher Akzent bei RO).
- **Vor Go-Live:** `dev-seed-cleanup.sql`, Demo-Refresh-Timer deaktivieren + `[AUTO-DEMO]`-Einträge löschen.
- **Billing:** keine automatische Abrechnung (Stripe/GoCardless offen); Agentur-Drilldown, echte Agentur noch nicht eingeladen.
- **Sicherheit:** Audit-Lücken in `docs/OFFENE_PUNKTE.md` (Rate-Limits, SSH nur Key, Backups offsite/verschlüsselt, Security-Header).
- **Sonstiges:** Demo-Gespräche EN/RO nicht gegen DE-Originale abgeglichen; Migrationen/Workflows seit 25.08. laut Nutzer live.

## Pflege dieser Datei

Kurz halten (Ziel < 300 Zeilen). Erledigtes mit Datum nach `docs/CHANGELOG.md`, Ideen nach `docs/IDEEN.md`, ausführliche
Offene-Punkte-Details nach `docs/OFFENE_PUNKTE.md`; hier nur Regeln, Architektur, Lehren und die kurze Offene-Punkte-Liste.
