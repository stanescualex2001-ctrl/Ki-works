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
  "Max Duration Exceeded" bestätigt) + Warnhinweis jetzt bei 25 Min. ("in
  ca. 5 Minuten muss ich beenden, bitte fehlende Angaben jetzt schnell
  nennen, damit ich sie noch speichern kann") über Vapis
  `call.timeElapsed`-Hook, hartes Limit bleibt bei 30 Min.
- Tagesbericht-E-Mail zeigt jetzt Datum bzw. Zeitraum in Betreff und
  Kopfzeile, plus einheitlicher Footer (ki-works.eu, Kiwo-Claim).
  Wochenbericht (Workflow 05) wieder entfernt, siehe „Offene Punkte".
- Landingpage: neues Mega-Menü "Lösungen" in der Navigation (Desktop-Dropdown
  + komplett neues Mobile-Menü, vorher gab es auf Mobile außer Login/CTA gar
  keine Navigation). Zeigt die 5 Kiwo-Rollen als "Anwendungsfälle" und
  Branchen (Restaurants live markiert, weitere Branchen als "bald") — erster
  sichtbarer Schritt der Rollen×Branchen-Idee (siehe unten). ROI-Rechner
  zeigt jetzt die Berechnungsgrundlage transparent an ("Ø 42 €/Stunde
  Vollkosten: Gehalt, Lohnnebenkosten & Overhead"), nachdem der Nutzer den
  Wert sonst missverständlich fand.
- Neues Logo "Orbit K" (animierter Ring mit K-Monogramm) ersetzt das alte
  Platzhalter-Icon überall (Landingpage-Nav, Dashboard-Login/Sidebar). Neuer
  Kiwo-Charakter "Orb Buddy" erscheint zusätzlich in der Dashboard-Sidebar
  ("Kiwo · bereit").
- Kiwo erfindet keine Antworten mehr bei Unwissen: neue Prompt-Regel plus
  Tool `request_callback` (neue Tabelle `callback_requests`) — markiert den
  Anruf in der bestehenden Anrufe-Liste als "Rückruf gewünscht", statt zu
  raten.
- Dashboard-Einstellungen: offene Kundenfragen (aus `request_callback`)
  werden direkt dort angezeigt, der Kunde trägt die Antwort ein und
  speichert sie per eigenem Button — landet automatisch in der FAQ. FAQ
  wird jetzt auch live an Kiwo weitergegeben ({{faq}} im Prompt), Kiwo prüft
  sie vor "weiß ich nicht"/Rückruf-Meldung.
- Anruf-Zusammenfassungen werden jetzt auf Deutsch erzeugt
  (`analysisPlan.summaryPrompt` bei Vapi). Für bestehende (teils englische)
  Alt-Zusammenfassungen gibt es ein einmaliges Backfill-Skript
  (`backend/scripts/translate-call-summaries.js`) — lief testweise durch
  (7 Anrufe gefunden), aber noch nicht wirksam ausgeführt, weil Anthropic-
  Guthaben bei 0 war; muss nach Guthaben-Aufladung erneut gestartet werden.
- Ersparnis-Kachel ("Von Kiwo übernommen") steht jetzt ganz oben in der
  Dashboard-Übersicht (Kunden-Wunsch: soll das Erste sein, was der Betrieb
  sieht) und zeigt die Gesamtlaufzeit seit Live-Gang, nicht nur 7 Tage.

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
  strukturieren (Rolle × Branche); erster sichtbarer Schritt (Mega-Menü auf
  der Landingpage) bereits umgesetzt, siehe „Bereits erledigt" — eigene
  Unterseiten pro Rolle/Branche gibt es aber weiterhin nicht.
- **Multi-Tenant-SaaS-Architektur:** Nutzer-Brainstorming — ein einziger
  Kiwo-Server soll mehrere Unternehmen/Branchen bedienen können, jeder Kunde
  mit eigener Wissensbasis/Prompts und getrennten Daten (Restaurants, Hotels,
  Handwerksbetriebe usw.), als Basis für ein skalierbares SaaS-Angebot.
  Einschätzung dazu: die Grundarchitektur (ein Server, eine DB,
  `restaurant_id`-Scoping über alle Tabellen, `customerScope`) trägt das
  schon weitgehend. Größte Lücken: (1) Vapi-Assistent-Erstellung ist noch
  manuell/hardcoded auf Venezia (`deploy/setup-vapi.sh`) statt automatisiert;
  (2) Prompt/Tools sind Restaurant-spezifisch (Reservierung/Bestellung) —
  andere Branchen bräuchten eigene Prompt-/Tool-Vorlagen; (3) Isolationsmodell
  bewusst als shared DB + Zeilen-Trennung vorgeschlagen (kein DB-pro-Kunde).
  Billing/Nutzungsmessung fehlt komplett. Noch nichts entschieden oder
  gebaut, nur vorgemerkt.
- **Admin-Dashboard überarbeiten:** Nutzer-Brainstorming — soll künftig zeigen:
  Anzahl aktiver Kunden, Umsatz/Kosten/Gewinn, unternehmensweite KI-Empfehlungen
  (nicht nur pro Betrieb), sowie die Ersparnis-Kachel aggregiert über alle
  Kunden (mit der jetzigen Pro-Kunde-Ansicht als aufklappbarem Unterpunkt).
  Größte Lücke: es gibt noch kein Preismodell pro Kunde und keine
  Kosten-Zuordnung (Vapi/Anthropic/Twilio laufen als ein gemeinsamer Topf) —
  Umsatz/Gewinn sind deshalb aktuell nicht berechenbar. Weitere Ideen dazu:
  Warnsystem bei auffällig inaktiven Kunden (Kündigungsrisiko), Wachstumstrend
  über Zeit, offene Kundenfragen über alle Kunden hinweg an einer Stelle. Noch
  nichts entschieden oder gebaut.

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
- Anthropic-Guthaben war (Stand zuletzt bekannt) bei 0 → Wochenbericht
  (Claude-generierter Mailtext) deswegen wieder aus dem Repo entfernt
  (`n8n/workflows/05-wochenbericht.json` gelöscht, Nutzer muss den
  Workflow auch in der n8n-Oberfläche selbst löschen/deaktivieren).
  Wichtig zur Klarstellung: Anruf-**Zusammenfassungen** im Dashboard
  kommen von Vapi selbst (eigenes Vapi-Guthaben), sind NICHT betroffen.
  Die Anruf-**Ergebnis-Klassifizierung** (reservation/info/missed/other,
  `classifyOutcome` in `backend/src/claude.js`) läuft dagegen über unser
  eigenes Anthropic-Guthaben und schlägt bei 0 Guthaben still fehl (fällt
  auf "other" zurück) — die "Verpasste Anrufe"-Mail (Workflow 06) hat
  dadurch vermutlich nie ausgelöst. Sobald wieder Guthaben vorhanden ist,
  sollte sich das von selbst korrigieren; ein Anthropic-unabhängiger
  Fallback wurde noch nicht gebaut (nicht angefragt).

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
