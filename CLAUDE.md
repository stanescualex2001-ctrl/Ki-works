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
- Österreichische Vapi-Nummer +43 726 223 417 aktiv und getestet (Kiwo meldet
  sich). War zuvor blockiert durch Twilio-Trial-Ansage — behoben durch
  Twilio-Account-Upgrade (Zahlungsmethode hinterlegt). US-Testnummer
  +1 502 260 3690 bleibt als Zweitnummer bestehen.
- Landingpage komplett neu im Cyan/Violet-Design (KI-Works=Plattform,
  Kiwo=Agent, 5 Rollen Reception/Sales/Support/Office/Orders), live auf
  ki-works.eu. Technisch: statischer Vite+React-Build (kein SSR-Server),
  `landing/` folgt jetzt dem gleichen Muster wie `dashboard/`
  (npm install/build → dist/, nginx root zeigt auf landing/dist)
- Dashboard im gleichen Design (Farben/Fonts) an Landingpage angeglichen,
  Struktur/Funktionen unverändert
- "Kunden-Login"-Button auf der Landingpage (Nav + Footer) zu /dashboard/
- Dashboard "Einstellungen": Betreiber (nur eigener Betrieb) und Admin (jeder
  Betrieb) können Speisekarte, Öffnungszeiten, FAQ und Login-Zugangsdaten
  selbst ändern (Kunde muss aktuelles Passwort bestätigen). Öffnungszeiten
  werden jetzt auch live an Kiwo weitergegeben ({{opening_hours}} im Prompt,
  vorher nur hartcodierter Mittwoch-Ruhetag-Text). Nebenbei: "Aufnahme
  anhören"-Link repariert (Vapi-Links liefen ab, werden jetzt bei Klick
  frisch nachgeladen).
- "Login"-Button auf der Landingpage jetzt auch auf Mobile sichtbar (war
  versehentlich nur ab Tablet-Breite eingeblendet).
- Telefonagent-Verbesserungen aus echten Testanruf-Auswertungen: Kiwo
  bestätigt Namen vor dem Anlegen (Vorlesen statt blind übernehmen), mehr
  Geduld beim Buchstabieren (bestätigt in kleinen Häppchen); Stille-Grenze
  60s + aktive Nachfrage "Sind Sie noch da?" bei 15s/30s statt Vapis
  Standard-30s-Stille-Abbruch; Mengen werden als Wort gesprochen
  ("dreimal" statt "3 X"); Kiwo verabschiedet sich aktiv statt
  kommentarlos aufzulegen; Bestellung/Reservierung wird nur noch EINMAL
  komplett zusammengefasst (vorher mehrfach wiederholt); Reservierung +
  Bestellung im selben Anruf kombinierbar (getrennt ODER verknüpft als
  "Essen am reservierten Tisch", `orders.reservation_id`); Termine in der
  Vergangenheit werden jetzt hart im Backend abgelehnt (nicht mehr nur per
  Prompt-Bitte); maximale Anruflänge von Vapi-Standard 10 Min. auf 30 Min.
  erhöht (verursachte einen echten Abbruch mitten im Satz, per Vapi-Log
  "Max Duration Exceeded" bestätigt) + Warnhinweis bei 27 Min. ("in ca. 3
  Minuten muss ich beenden") über Vapis `call.timeElapsed`-Hook.
- Tages-/Wochenbericht-E-Mails zeigen jetzt Datum bzw. Zeitraum in Betreff
  und Kopfzeile, plus einheitlicher Footer (ki-works.eu, Kiwo-Claim).

## Ideen & Zukunftsplanung (noch NICHT entschieden/gebaut, nur vormerken)

- **Marken-Idee:** KI-Works = die Plattform, Kiwo = der digitale KI-Mitarbeiter
  (Beispiel-Claim: „KI-Works – Die Plattform für digitale KI-Mitarbeiter" /
  „Kiwo – Dein digitaler Mitarbeiter"). Später denkbar: spezialisierte Kiwo-Rollen
  je Kanal/Aufgabe, z. B. Kiwo Reception (Telefon/Empfang), Kiwo Sales (Vertrieb),
  Kiwo Support (Kundenservice), Kiwo Office (E-Mail/Kalender), Kiwo Orders
  (Bestellungen/Reservierungen). Passt zur bestehenden Landing-Positionierung
  "Plattform wächst modular um weitere KI-Mitarbeiter" (bereits umgesetzt) —
  diese Rollen-Aufteilung ist der nächste gedankliche Schritt davon, aber noch
  nicht implementiert oder final entschieden. Nutzer hat als Referenz
  fonio.ai gezeigt: die trennen ihr Angebot nach Anwendungsfällen (KI
  Supportmitarbeiter, KI Sekretär, KI Anrufbeantworter, KI
  Außendienstassistent, WhatsApp-Assistent als Add-on) UND nach Branchen
  (Arztpraxis, Anwälte, Hotels, Handwerker, Zahnärzte, Immobilienmakler
  usw., jeweils eigene Unterseite). Idee: Kiwo-Rollen langfristig ähnlich
  strukturieren (Rolle × Branche), noch nicht gebaut.

## Offene Punkte (Stand zuletzt bekannt)

- Anthropic/Vapi-Billing-Guthaben im Auge behalten (Vapi läuft auf
  Pay-as-you-go-Guthaben, Twilio jetzt kein Trial mehr); API-Key-Rotation
  weiterhin ausstehend
- Impressum/Datenschutz-Platzhalter noch **rechtlich** prüfen (Technik steht,
  kein Rechtsgutachten); AVV-Verträge fehlen noch
- Größere Credential-Rotation nötig (Contabo-Root-Passwort, im Setup im
  Klartext geteilte API-Keys)
- `backend/sql/dev-seed-cleanup.sql` muss vor echtem Go-Live einmal auf dem
  Server laufen (entfernt `[DEMO]`-Testdaten)
- Gäste-360°-/Umsatz-Ansicht wartet auf genauere Vorgaben des Kunden
- Offene Rückfrage an Kunde (unbeantwortet): soll ich zusätzlich zur
  27-Minuten-Warnung (a) Kiwo per Prompt anweisen, danach aufs Wesentliche
  zu fokussieren, und (b) das harte Zeitlimit von 30 auf 35 Minuten
  anheben? Dynamisches "5 Minuten verlängern" auf Zuruf ist mit Vapis API
  nicht sauber möglich (kein Live-Update von maxDurationSeconds während
  des Anrufs) — recherchiert und dem Kunden so erklärt.

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
