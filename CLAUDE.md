# ki-works – Projektkontext für Claude

KI-Telefonassistent **"Kiwo"** für Restaurants. Vapi nimmt Anrufe entgegen,
Claude versteht die Gäste, Node.js-API + PostgreSQL speichern Reservierungen/
Bestellungen, React-Dashboard zeigt sie an, n8n (Docker) automatisiert
Benachrichtigungen. Details/Architektur: siehe `README.md`.

**Deployment:** Contabo-VPS, `ki-works.eu`. Claude hat **keinen direkten
SSH-Zugriff** — alle serverseitigen Schritte (Deploy, Migrationen, n8n-Import
usw.) müssen dem Nutzer als copy-paste-fertige Befehle gegeben werden.

**Test-Restaurant:** Venezia, Marktplatz 10, 4311 Schwertberg.

**Repo/Branch:** `stanescualex2001-ctrl/Ki-works`, Arbeitsbranch
`claude/ki-works-mvp-deploy-0wtfaz`.

## Standing Rules (immer befolgen)

- Antworten **kurz und präzis** halten (Token sparen).
- **Vor** Code-Änderungen erst mit dem Nutzer abstimmen, außer explizit anders
  gewünscht.
- **Nie committen/pushen ohne explizite Aufforderung** des Nutzers.
- Nutzer ist nicht technisch — Erklärungen einfach halten, keine unnötigen
  Rückfragen zu bereits Entschiedenem.

## Bereits erledigt (nicht mehr offen)

- Kiwo-Name im Telefonagenten + auf der Landingpage
- Reservierung stornieren/verschieben (telefonisch)
- Echte Speisekarte im Telefonagenten (DB-basiert, `restaurants.menu`)
- DSGVO-Grundausstattung (Impressum/Datenschutz-Platzhalter, Pflicht-Zustimmung,
  Löschfrist, Aufzeichnungshinweis)
- Monitoring/Backups/Error-Logging (`monitoring.js`, `backup-db.sh`, System-Tab)
- Dashboard: Wochenkalender, Detail-Modal, klickbare Übersicht/Kunden,
  Betrieb-Suche neu, Anrufe komplett klickbar mit Transkript
- Einladungs-Flow (Kunde setzt eigenes Passwort per Link)
- Landing-Positionierung "Plattform für KI-Mitarbeiter" (Restaurants als
  erster Anwendungsfall)

## Ideen & Zukunftsplanung (noch NICHT entschieden/gebaut, nur vormerken)

- **Marken-Idee:** KI-Works = die Plattform, Kiwo = der digitale KI-Mitarbeiter
  (Beispiel-Claim: „KI-Works – Die Plattform für digitale KI-Mitarbeiter" /
  „Kiwo – Dein digitaler Mitarbeiter"). Später denkbar: spezialisierte Kiwo-Rollen
  je Kanal/Aufgabe, z. B. Kiwo Reception (Telefon/Empfang), Kiwo Sales (Vertrieb),
  Kiwo Support (Kundenservice), Kiwo Office (E-Mail/Kalender), Kiwo Orders
  (Bestellungen/Reservierungen). Passt zur bestehenden Landing-Positionierung
  "Plattform wächst modular um weitere KI-Mitarbeiter" (bereits umgesetzt) —
  diese Rollen-Aufteilung ist der nächste gedankliche Schritt davon, aber noch
  nicht implementiert oder final entschieden.

## Offene Punkte (Stand zuletzt bekannt)

- Österreichische Vapi/Twilio-Telefonnummer noch in Verifizierung (aktuell
  US-Testnummer +1 502 260 3690 aktiv)
- Anthropic/Claude-Billing-Aufladung + API-Key-Rotation ausstehend
- Impressum/Datenschutz-Platzhalter noch **rechtlich** prüfen (Technik steht,
  kein Rechtsgutachten); AVV-Verträge fehlen noch
- Größere Credential-Rotation nötig (Contabo-Root-Passwort, im Setup im
  Klartext geteilte API-Keys)
- `backend/sql/dev-seed-cleanup.sql` muss vor echtem Go-Live einmal auf dem
  Server laufen (entfernt `[DEMO]`-Testdaten)
- Speisekarten-Verwaltung im Dashboard (Upload/Bearbeiten) noch nicht gebaut
- Gäste-360°-/Umsatz-Ansicht wartet auf genauere Vorgaben des Kunden
- Landing-/Dashboard-Redesign existiert bisher nur als Mockup (Artifact), noch
  nicht in `landing/index.html`/`dashboard/` übernommen

## Pflege dieser Datei

Automatisch alle 5 Stunden per Routine aktualisiert. Zusätzlich soll ich
(auch innerhalb einer Sitzung, nicht nur die Routine) hier nachtragen, wenn:

- eine größere Änderung fertig committet+gepusht ist → in „Bereits erledigt"
  verschieben, aus „Offene Punkte" entfernen
- der Nutzer eine neue Anforderung/Entscheidung bestätigt, die über die
  Sitzung hinaus relevant bleibt → als offenen Punkt/Kontext ergänzen
- sich ein externer Status ändert, den der Nutzer mitteilt (z. B. Nummer
  verifiziert, Billing erledigt) → entsprechenden Punkt aktualisieren
- der Nutzer eine Idee/Zukunftsplanung teilt, die noch nicht umgesetzt wird
  (z. B. Branding-Konzepte, mögliche neue Features) → unter „Ideen &
  Zukunftsplanung" vormerken, auch wenn noch nichts entschieden ist

Nicht bei jeder kleinen Nachfrage — nur bei Änderungen, die für eine künftige
neue Sitzung wichtig wären.
