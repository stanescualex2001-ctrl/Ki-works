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

- Antworten **kurz und präzis** halten (Token sparen).
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
- Landingpage-Nav: Logo verlinkt jetzt sauber auf "/" (statt "#"), mobiler
  Untertitel "agent kiwo" wird nicht mehr abgeschnitten.
- ki-works.eu für SEO/AIO optimiert: größter Fund war, dass die Seite reines
  Client-Side-React war (rohes HTML lieferte nur ein leeres `<div id="root">`
  — für KI-Crawler ohne JavaScript-Ausführung sah die Seite leer aus). Build
  rendert jetzt zusätzlich serverseitig vor (`react-dom/server`, kein
  Headless-Browser als neue Abhängigkeit) und schreibt echten Text ins
  ausgelieferte HTML — für Besucher optisch unverändert. Dazu: robots.txt
  (inkl. bekannter KI-Crawler wie GPTBot/ClaudeBot), sitemap.xml, llms.txt,
  canonical/og/twitter-Meta-Tags, JSON-LD (Organization + Service), neues
  Social-Preview-Bild. pixelpress.at (andere, nicht zugängliche Plattform)
  bewusst nicht angefasst — dafür nur eine Checkliste geliefert.
- Landingpage: Orb Buddy (Kiwo-Charakter, bisher nur im Dashboard) ersetzt
  jetzt das generische Bot-Icon im Hero-Orb und erscheint zusätzlich über der
  finalen CTA-Sektion — Kiwo ist so auf der ganzen Seite wiedererkennbar.
- n8n-Benachrichtigung für "Rückruf gewünscht" (Workflow 14) — Betrieb
  bekommt jetzt auch eine E-Mail, wenn Kiwo eine Frage nicht beantworten
  konnte (vorher nur im Dashboard sichtbar).
- Dashboard: Notification-Zähler in der Sidebar zeigt eine Zahl neben
  Reservierungen/Bestellungen/Anrufe, wenn seit dem letzten Besuch neue
  Einträge dazugekommen sind (lokal im Browser gespeicherter Zeitstempel
  pro Betrieb+Ansicht, verschwindet beim Anklicken).
- Dashboard: Betrieb-Auswahlfeld leert sich jetzt beim Anklicken und zeigt
  alle Betriebe (vorher blieb nur der aktuell gewählte gefiltert stehen).
  Dazu 3 Test-Betriebe (`[DEMO]`-Präfix) für Sichttests der Auswahl angelegt,
  Cleanup-Skript entsprechend erweitert.
- Rückruf-Anfrage (`request_callback`) erfasst jetzt zusätzlich den vom Gast
  gewünschten Antwortkanal (SMS/WhatsApp/E-Mail) samt Kontakt, sichtbar im
  Dashboard und in der Rückruf-Mail (Workflow 14). Nur Erfassung — kein
  automatischer Versand, siehe „Automatische Rückmeldung an den Gast" unten.
- FAQ-Lücke im Vapi-Systemprompt behoben: Backend schickte `{{faq}}` zwar
  schon immer mit, der Prompt hat die Variable aber nie referenziert — Kiwo
  hat hinterlegte FAQ-Antworten dadurch nie genutzt. Jetzt im Prompt drin
  inkl. Anweisung, FAQ vor einem Rückruf zu prüfen.
- `deploy/setup-vapi.sh` überarbeitet: (1) aktualisiert jetzt einen
  bestehenden Vapi-Assistenten per PATCH statt bei jedem Lauf einen neuen
  anzulegen (Ursache für 19 angesammelte Alt-Assistenten in Vapi — 18 davon
  im Vapi-Konto gelöscht, Skript-Fix verhindert neue); (2) generisch für
  beliebige Restaurant-ID statt hartcodiert auf Venezia.
- **Vapi-Assistent wird jetzt automatisch bei Kundenanlage eingerichtet:**
  neuer Kunde im Dashboard ("Kunden (Betreiber)" → "+ Neuer Kunde") legt den
  passenden Vapi-Assistenten automatisch an und verknüpft die hinterlegte
  Telefonnummer (`backend/src/vapiAdmin.js`) — kein manueller
  Server-Skript-Lauf mehr nötig. Gleiches passiert automatisch bei Änderung
  von Name/Adresse/Telefonnummer eines Bestandskunden. Läuft best-effort
  (Kunde wird trotzdem angelegt, falls Vapi-Sync fehlschlägt; Dashboard zeigt
  dann eine Warnung). `setup-vapi.sh` ist jetzt nur noch ein dünner Wrapper
  für den manuellen Nachzieh-Fall (z. B. Prompt-Änderung auf Bestandskunden
  anwenden). Dabei einen alten, vergessenen n8n-Workflow (07) gefunden und
  entfernt, der auf denselben Webhook hörte und einen zweiten, veralteten
  Assistenten ohne Stimme/mit Kurzprompt anlegte — führte zu doppelten
  Assistenten pro neuem Kunden, behoben.
- Dashboard „Kunden (Betreiber)": Kundenliste jetzt sortierbar (Name A-Z/Z-A,
  neueste/älteste zuerst, meiste Anrufe/Reservierungen 7 Tage) über ein
  Dropdown neben der Suche.
- Genereller Fix in `useFetch`: der 30s-Auto-Refresh setzte Daten kurz auf
  `null` zurück, was betroffene Ansichten durch "Lade…" ersetzte und dabei
  offene Formulareingaben (z. B. "+ Neuer Kunde") löschte — gleiches Muster
  wie der frühere Settings-Bug. Jetzt wird nur noch bei echtem
  Tab-/Betrieb-Wechsel zurückgesetzt, nicht beim stillen Hintergrund-Refresh.
- Vapi-Publish-Status ist jetzt eine eigene Spalte "Vapi-Status" in der
  Kundenübersicht (`restaurants.vapi_published`, migration-015) statt nur
  einer flüchtigen Hinweis-Meldung: zeigt "⚠️ Publish nötig" mit
  Bestätigungslink, der zu "✅ Erledigt" wechselt. Wird bei jeder
  automatischen Vapi-Synchronisierung wieder zurückgesetzt (siehe unten).

**WICHTIGE EINSCHRÄNKUNG der Vapi-Automatik (noch ungelöst):** per API
angelegte/aktualisierte Vapi-Assistenten sind offenbar NICHT automatisch
"published" — konkret beobachtet: Venezia funktionierte nach mehrfachem
API-Update zeitweise nicht mehr am Telefon, bis der Nutzer manuell im
Vapi-Dashboard auf "Publish" geklickt hat; ein frisch per Automatik
angelegter Testkunde zeigte direkt nach der Anlage ebenfalls "nicht
published". In der offiziellen Vapi-API-Doku/OpenAPI-Spec gibt es dafür
keinerlei Feld oder Endpoint (recherchiert) — vermutlich eine neuere,
nicht vollständig dokumentierte Vapi-Funktion (Versions-/Publish-System,
siehe deren Blogpost "Version Preview, Version History"). **Workaround
bis auf Weiteres:** nach jeder automatischen Kundenanlage/-änderung muss
im Vapi-Dashboard einmal manuell "Publish" geklickt werden — sichtbar als
"Vapi-Status"-Spalte in der Kundenübersicht mit Bestätigungslink. Kein
API-seitiger Fix bekannt; ggf. später bei Vapi-Support nachfragen.
**Ergänzung (10.08.2026, beim Debuggen der Phase-1-Prompt-Änderung
entdeckt):** Vapi legt bei jedem PATCH intern eine neue, nummerierte
Version an (sichtbar über den kleinen "v5 ▾"-Dropdown direkt neben der
Assistenten-ID oben im Editor → "Version History"). `GET
/assistant/:id` liefert dabei nicht zwingend die neueste Version, sondern
offenbar die zuletzt veröffentlichte — nach mehreren PATCH-Syncs
hintereinander kann das Dashboard/die API also täuschend lange den alten
Prompt zeigen, obwohl der Sync technisch erfolgreich war. Vapis eigenes
"Restore version"-Feature in der Historie war bei einem Testversuch
zusätzlich fehlerhaft ("v4 could not be restored"). **Funktionierender
Workaround:** nicht über die Versions-Historie/Restore gehen, sondern
einmal frisch `setup-vapi.sh <id>` laufen lassen, Vapi-Seite neu laden
(F5) und SOFORT bei der dadurch automatisch neu geöffneten aktuellen
Version auf "Publish" klicken.
- Landingpage: neues Mega-Menü "Lösungen" in der Navigation (Desktop-Dropdown
  + Mobile-Accordion) — Rollen jetzt gruppiert in "Kundenkontakt" (Reception,
  Sales, Support, Orders — live) und "Interne Prozesse" (Office live, plus
  Recruiting/Collection/Onboarding/Finance als "bald verfügbar"). Branchen
  um Autowerkstätten und Immobilien erweitert. Rollen-Sektion zeigt alle
  Rollen als Karten, "bald"-Rollen deutlich gedimmt ohne CTA-Link. Erster
  Baustein des vereinbarten Website-Relaunchs (Marketing-zuerst-Ansatz,
  siehe „Ideen & Zukunftsplanung"), nächster Schritt: eigene Matrix-/
  Filter-Seite „Rolle × Branche".
- `MARKETING.md` angelegt (Vermarktungsstrategie für ki-works.eu: Social
  Media, SEO/AIO, Google Business Profile, Kalt-E-Mail, kurzfristige
  Prioritäten) — ursprünglich in einer separaten Sitzung/Branch
  (`claude/ki-works-marketing-abdeb2`) erarbeitet, jetzt auf den
  Arbeitsbranch übernommen, damit hier direkt daran weitergearbeitet
  werden kann.
- Impressum und Datenschutzerklärung waren bisher zwei isolierte, schlichte
  HTML-Seiten ohne Menü/Design der Hauptseite — jetzt im vollen
  Landingpage-Design inkl. Mega-Menü. Technisch: Header (mit Mega-Menü) und
  Footer aus `landing/src/App.jsx` in wiederverwendbare Komponenten
  (`landing/src/components/Header.jsx`, `Footer.jsx`, `PageShell.jsx`)
  ausgelagert, `landing/src/pages/Impressum.jsx` und `Datenschutz.jsx` neu
  gebaut. Bleiben unter `/impressum.html` bzw. `/datenschutz.html`
  erreichbar, jetzt als eigene Vite-Einstiegspunkte mit demselben
  SSR-Prerendering wie die Startseite (SEO/AIO-Pattern). Inhalte
  unverändert übernommen (inkl. der internen "bitte rechtlich prüfen"-
  Hinweise, siehe „Offene Punkte").
- Neues Browser-Tab-Icon: generischer Platzhalter-Favicon ersetzt durch
  das Orbit-K-Logo (`landing/public/favicon.svg`, mit `.ico`-Fallback für
  ältere Browser).
- Dashboard-Login-Text von "Ihr KI-Telefonassistent" (alte,
  restaurant-spezifische Formulierung) auf "Ihr digitaler KI-Mitarbeiter"
  angepasst — passend zur Plattform-Positionierung auf der Landingpage.
- Neue Kontakt-Seite (`/kontakt.html`, E-Mail info@ki-works.eu, Handy
  +43 650 9915759) im selben Design, verlinkt aus Header-Navigation und
  Footer. mailto-Links öffnen jetzt überall in einem neuen Tab (verhindert,
  dass Besucher ohne konfiguriertes Mailprogramm die Seite verlieren).
  "← Zurück zur Startseite"-Links auf Kontakt/Impressum/Datenschutz wieder
  entfernt, da die Kopfzeile dort jetzt ohnehin das volle Menü zeigt.
- **Kiwo-Rollen pro Kunde einzeln freischaltbar** (Antwort auf "wie macht
  man das, wenn ein Kunde nur Sales will, ein anderer Support+Orders" —
  Entscheidung: vorerst nur wir schalten das manuell frei, Architektur
  aber Self-Service-tauglich angelegt: sobald Self-Service live geht, soll
  der Kunde genau diese Rollen selbst auswählen können, wenn er einen
  Kiwo-Agenten bestellt — `enabled_roles` ist dafür schon die richtige
  Datengrundlage, nur der Bestell-/Bezahl-Flow fehlt noch). Neue Spalte
  `restaurants.enabled_roles` (JSONB, Default `["orders","support"]` =
  bisheriges Verhalten, bestehende Kunden unverändert). `vapiAdmin.js`
  baut System-Prompt/Tool-Liste jetzt aus Rollen-Bausteinen zusammen statt
  fix für alle gleich. Admin wählt Rollen beim Anlegen eines Kunden oder
  über "Rollen ändern" in der Kundenübersicht (`dashboard/src/App.jsx`,
  `RolesForm`) — löst automatisch eine Vapi-Neusynchronisierung aus.
  **Wichtig:** Sales und Office existieren technisch noch nicht (keine
  Tools/Prompt-Logik) — im Dashboard sichtbar, aber deaktiviert mit "bald
  verfügbar", bis dafür echte Funktionalität gebaut wird. Migration
  `backend/sql/migration-016-enabled-roles.sql` muss auf dem Server noch
  einmal manuell laufen (siehe „Offene Punkte").
- **Beispiel-Gespräche zum Anhören** auf der Landingpage (Abschnitt "Live
  testen", passend zur "Try Your Own Kiwo"-Idee, aber einfachere erste
  Ausbaustufe ohne echten Rückruf): drei synthetisch erzeugte Demo-Dialoge
  (Tischreservierung, Bestellung zur Abholung, Öffnungszeiten &
  Reservierung) — bewusst keine echten Gästeanrufe (DSGVO/Konsens-Problem),
  sondern erfundene Beispiele. Kiwos Antworten nutzen dieselbe Stimme wie
  im echten Produkt (Azure `de-AT-IngridNeural` via `edge-tts`, kostenlos,
  keine Azure-Zugangsdaten nötig), die "Gast"-Seite je eine andere Stimme.
  Audiodateien liegen unter `landing/public/demo-audio/`.
- Landingpage erwähnte das Kunden-Dashboard bisher nur als Login-Link,
  nie inhaltlich. Neue Sektion "Alles auf einen Blick" zeigt die echten
  Vorteile (zentrale Übersicht Reservierungen/Bestellungen/Anrufe,
  Benachrichtigungen bei Neuem, Wochenkalender, Aufnahmen nachhören,
  Selbstverwaltung Speisekarte/Öffnungszeiten/FAQ) mit stilisierter
  Vorschau-Karte. Ersparnis-Kachel darin nutzt dieselbe
  Kostenbasis-Angabe (42 €/Std.) wie der ROI-Rechner.
- **Social-Media-Grafiken/Videos selbst erzeugen (Marketing-Vorbereitung):**
  Claude kann quadratische Werbe-Grafiken (Instagram/Facebook/LinkedIn) und
  kurze Slideshow-Videos mit Sprachausgabe im ki-works-Design bauen — kein
  Foto-/Video-Generator, sondern HTML/CSS im echten Look (Farben, Fonts,
  Logo, Orb Buddy) gebaut und per Headless-Chromium als PNG gerendert;
  Sprachausgabe per `edge-tts` (kostenlos, echte Kiwo-Stimme
  `de-AT-IngridNeural`), Video-Zusammenbau per `ffmpeg` (Bilder + Ton).
  **Technischer Haken einmalig gelöst:** `edge-tts`/aiohttp vertrauen dem
  Proxy-Zertifikat dieser Umgebung nicht automatisch — Fix: Proxy-CA
  (`/root/.ccr/ca-bundle.crt`) an `certifi`s `cacert.pem` anhängen (`cat
  ... >> $(python3 -c "import certifi; print(certifi.where())")`), reines
  `SSL_CERT_FILE` reicht nicht. Erste Beispiele (Werbe-Grafik "1 Monat
  gratis testen", 4-teiliges Slideshow-Video) erzeugt und vom Nutzer
  freigegeben — noch nicht ins Repo übernommen (externe Marketing-Assets,
  keine Website-Inhalte).
- Echtes Kontaktformular auf `/kontakt.html` (statt mailto-Link) —
  nutzt den bereits bestehenden `POST /api/public/interest`-Endpunkt
  (`leads`-Tabelle) und den bestehenden n8n-Workflow 08, der automatisch
  eine Benachrichtigung an info@ki-works.eu schickt. Kein Backend-Umbau
  nötig, nur das Formular gefehlt. E-Mail-Kachel auf der Kontakt-Seite und
  "Demo anfragen" auf der Startseite verlinken jetzt auch dorthin statt
  mailto zu öffnen — Impressum/Datenschutz behalten echte mailto-Links
  (gesetzliche Pflicht zur direkten Kontaktmöglichkeit). Workflow 08 war
  bereits aktiv, End-to-End-Test vom Nutzer erfolgreich: Formular
  abgeschickt → Benachrichtigungs-E-Mail bei info@ki-works.eu angekommen.
  Zusätzlich: Datenschutz-Zustimmung ist jetzt eine Pflicht-Checkbox statt
  reinem Hinweistext (Senden-Button bleibt bis zum Anhaken deaktiviert).
- Preise-Sektion auf der Startseite (neuer Nav-Punkt "Preise", Anker
  `#preise`) mit den drei Tarifen aus dem `MARKETING.md`-Preisentwurf
  (Solo 69€/300Min, Team 199€/1000Min, Scale 399€/2500Min), inkl.
  Ersparnis-Hinweis pro Paket (Personalzeit/Wert, gleiche 42€/Std.-Basis
  wie der ROI-Rechner). CTA verlinkt zur Kontaktseite (noch kein
  Bestell-/Bezahl-Flow). Interne Kostenbasis (0,085 €/Min) bewusst NICHT
  öffentlich angezeigt, nur die Endkundenpreise. Preise gelten weiterhin
  als Entwurf (siehe MARKETING.md „Offen / noch zu klären" — z. B.
  Überschreitungspreis, Jahres- vs. Monatsabo).
- Orb Buddy animiert (Landing-Hero/-CTA + Dashboard-Sidebar): Antennen-
  Wackeln, periodisches Blinzeln, sanftes Schweben überall; zusätzlich eine
  kleine pulsierende Sprechblase nur an der großen Hero-Version (CTA/
  Sidebar bewusst ohne, um bei kleiner Größe nicht zu überladen). Technisch
  native SVG-Animation (`<animateTransform>`/`<animate>`) statt einer neuen
  Abhängigkeit, da `dashboard/` bisher keine Animationsbibliothek hat —
  gleiche Technik wie beim bestehenden OrbitK-Logo. `OrbBuddy` bleibt wie
  bisher zwischen `landing/src/App.jsx` und `dashboard/src/App.jsx`
  dupliziert (kein gemeinsames Paket), beide Kopien synchron gehalten.
- Kiwos Sprechtempo (Telefon + Reel-Videos) auf +5% erhöht, siehe oben
  „Social-Media-Automatisierung". Dabei aufgeräumt: die alten Vapi-
  Test-Assistenten "Kunde Test"/"Test Kunde 1"/"test kunde 2" (Reste aus
  der Entwicklung der automatischen Kundenanlage) hat der Nutzer im
  Vapi-Dashboard gelöscht, die zugehörigen `restaurants`-Zeilen (IDs 9-11)
  am 10.08.2026 auch aus der Datenbank entfernt — dieser lang offene
  Aufräum-Punkt ist damit erledigt.
- **Kiwo branchenneutral gemacht — Phase 1 (10.08.2026):** Nutzer besitzt
  neben ki-works auch LEDTEK (LED-Leuchten-Händler, ledtek.at) und
  pixelpress (Web-/KI-Agentur, pixelpress.at) und will alle drei auf
  derselben Kiwo-Plattform laufen haben. Erster Umbau-Schritt: die
  "Support"-Rolle (FAQ-Beantwortung + Rückruf) funktioniert jetzt sauber
  für Nicht-Restaurant-Kunden. `backend/src/vapiAdmin.js` baut Prompt und
  Tools jetzt aus einer `ROLE_BLOCKS`-Registry zusammen (statt zwei
  hartcodierter `orders`/`support`-Booleans mit String-Verkettung) — eine
  künftige neue Rolle (z. B. generische Terminbuchung, LEDTEK-Angebote,
  pixelpress-Lead-Qualifizierung) ist dadurch nur noch ein
  Registry-Eintrag, kein Umbau der Kernfunktion mehr. Der Grundprompt
  erwähnt jetzt nirgends mehr "Restaurant"/"Speisekarte", wenn die
  `orders`-Rolle aus ist. `restaurants.menu` in `restaurants.knowledge_base`
  umbenannt (migration-017, reiner Postgres-Metadaten-Rename), Dashboard-
  Label entsprechend auf "Wissensdatenbank" geändert. Dashboard zeigt
  Kalender/Reservierungen/Bestellungen nur noch, wenn `orders` aktiv ist
  (sonst leere Tabs für Support-only-Kunden). n8n-Workflows 01/06/14:
  "Restaurant"/"Gast" in den Benachrichtigungstexten auf "Kunde"/"Anrufer"
  generalisiert — **diese drei Workflows müssen manuell in der n8n-
  Oberfläche nachgezogen werden** (die JSON-Dateien im Repo haben keine
  stabile Workflow-ID, ein Reimport per CLI würde vermutlich Duplikate
  anlegen statt zu aktualisieren, siehe Diagnose beim doppelten
  Vapi-Assistenten weiter oben — deshalb bewusst nicht automatisiert).
  **Noch offen (Phase 2+, nicht in diesem Schritt):** generisches
  `create_appointment` statt `create_reservation`, LEDTEK-spezifische
  Tools (Angebote, Lagerbestand, Bildanalyse), pixelpress-spezifische
  Tools (Lead-Qualifizierung, Projektverwaltung), WhatsApp-Kanal,
  Live-Weiterleitung an Menschen. Kundenanlage für ki-works/LEDTEK/
  pixelpress läuft über das normale "+ Neuer Kunde"-Dashboard-Formular
  (Rolle vorerst nur `support`), Wissensbasis/FAQ füllt jeder Kunde danach
  selbst im eigenen Dashboard aus (Selbstverwaltung, wie bei Venezia) —
  noch nicht angelegt, wartet auf Name/Adresse/Kontakt/Telefonnummer vom
  Nutzer. Nutzer wollte das am 10.08.2026 auf "morgen" verschieben — **beim
  nächsten Gespräch proaktiv nachfragen**, ob die drei Unternehmen jetzt
  angelegt werden sollen.
- **Generisches Freigabe-Gate für Kiwo-Agenten gebaut (12.08.2026, Pilot
  ki-works.eu/Sales):** erster Baustein aus dem Dashboard-Struktur-
  Brainstorming (siehe „Ideen & Zukunftsplanung"). Neue Tabelle
  `pending_actions` (`backend/sql/migration-018-pending-actions.sql`:
  `restaurant_id`, `role`, `kind`, `summary`, `payload` JSONB, `status`
  pending/approved/rejected) + Endpunkte `GET/PATCH /api/pending-actions`
  (`backend/src/server.js`, gleiches `customerScope`-Muster wie
  `callback-requests`) + neue Dashboard-Sektion "Freigaben" (NAV-Punkt
  zwischen Anrufe und KI-Empfehlungen, `PendingActions`-Komponente).
  Nutzt bewusst die bestehende Admin/Betreiber-Scoping-Unterscheidung im
  Backend statt einer neuen Architektur-Ebene. **Korrektur (12.08.2026):**
  der NAV-Punkt "Freigaben" war anfangs auch für Betreiber (Restaurant-
  Kunden wie Venezia) sichtbar — Nutzer-Feedback: soll NICHT sein, das
  Freigabe-Gate ist ein internes Steuerungs-Tool für die eigenen
  Businesses (ki-works/LEDTEK/pixelpress/Memcore), keine Kundenfunktion.
  Jetzt `adminOnly` wie "Anfragen"/"Kunden"/"System" — nur Admin sieht den
  Tab und bekommt die gebündelte Meta-Ansicht aller Betriebe, Kunden-Logins
  sehen ihn gar nicht mehr (Backend-Scoping selbst war korrekt, das war
  reine Sichtbarkeits-Einstellung im Dashboard-Menü). Lokal gegen eine
  frische Test-Datenbank durchgetestet
  (Schema+alle Migrationen sauber, Scoping korrekt für Admin/zwei
  verschiedene Test-Kunden, Freigeben/Ablehnen funktioniert, ungültiger
  Status wird abgelehnt) — noch NICHT auf dem Produktivserver ausgerollt.
  **Bewusst nicht Teil dieses Schritts:** der eigentliche Sales-Agent, der
  `pending_actions`-Einträge erzeugen würde (Web-Recherche, Mail-Entwürfe
  — separates, größeres Vorhaben, siehe Akquise-Agent-Eintrag), sowie das
  tatsächliche Ausführen nach Freigabe (z. B. E-Mail-Versand). Aktuell
  landet dadurch noch nichts automatisch in der neuen "Freigaben"-Liste —
  die Tabelle ist bereit, sobald ein erster Agent (Sales) sie befüllt.
- **Eigenes Business-Dashboard statt Freigaben-Tab im Kunden-Dashboard
  (13.08.2026):** Nutzer-Klarstellung zum Dashboard-Struktur-Brainstorming:
  das Meta-/Business-Dashboard für die eigenen 4 Unternehmen (ledtek.at,
  pixelpress.at, Memcore, ki-works.eu) soll **komplett getrennt** vom
  bestehenden Kiwo-Kunden-Dashboard laufen (dort sind Venezia & Co. als
  B2B-Kiwo-Kunden), damit sich jedes Unternehmen unabhängig weiterentwickeln
  lässt. Neue eigenständige Vite+React-App **`business-dashboard/`**
  (Geschwister von `dashboard/`/`landing/`), erreichbar unter
  `ki-works.eu/intern/` (Unterseite, kein DNS-Aufwand — Empfehlung
  gegenüber eigener Subdomain, da verlustfrei später nachrüstbar). Login
  nutzt denselben bestehenden `POST /api/login`-Endpunkt, lässt aber nur
  `role === 'admin'` durch (Kunden-Logins werden clientseitig abgewiesen) —
  keine neue Auth nötig. Zeigt: Meta-Ansicht (alle offenen `pending_actions`
  aller Betriebe, wiederverwendet die bestehenden Endpunkte 1:1) + 4
  Business-Karten mit den 5 Kiwo-Rollen als Chips; Klick auf eine Karte
  zeigt vorerst "noch nicht verknüpft", da ledtek.at/pixelpress.at/Memcore/
  ki-works.eu weiterhin nicht als `restaurants`-Zeilen existieren (separates,
  vom Nutzer bewusst vertagtes Thema). Design/Farben identisch zu
  `dashboard/`/`landing/` (gleiche CSS-Variablen, OrbitK-Logo, Orb Buddy),
  aber eigene, schlankere Komponentenstruktur ohne die
  Restaurant-Picker-Logik des Kunden-Dashboards. Der alte "Freigaben"-Tab
  im Kunden-Dashboard (siehe Eintrag darüber) wurde daraufhin wieder
  entfernt (Backend-Endpunkte bleiben unverändert, werden jetzt vom neuen
  Dashboard genutzt) — keine Doppelung mehr. `deploy/nginx/ki-works.conf`
  um `location /intern` ergänzt, `deploy/install.sh` und der
  Update-Ablauf oben um den Build-Schritt für `business-dashboard/`
  ergänzt. Lokal gegen frische Test-DB durchgetestet (Admin-Login liefert
  `role: admin`, Meta-Ansicht zeigt Test-Freigabe korrekt) — **noch NICHT
  auf dem Produktivserver ausgerollt**, insbesondere der neue
  nginx-Block braucht dort einen manuellen `nginx -t && systemctl reload
  nginx` nach dem Deploy (passiert nicht automatisch durch den
  rsync/build-Ablauf).
- **Website-Ausfall behoben + Ursache dauerhaft gefixt (13.08.2026):** beim
  Ausrollen des `/intern`-nginx-Blocks (siehe oben) führte ein `cp` der
  Repo-Datei `deploy/nginx/ki-works.conf` auf den Server dazu, dass die
  Seite komplett unerreichbar wurde. Ursache: die Repo-Vorlage enthielt nur
  reines HTTP (`listen 80`), während die tatsächlich laufende Server-Datei
  zusätzlich SSL-Blöcke (`listen 443 ssl`, Zertifikatspfade) enthielt, die
  Certbot dort früher automatisch reinpatcht hatte — nie zurück ins Repo
  übernommen. Der `cp` hat diese SSL-Blöcke gelöscht, danach hörte nichts
  mehr auf Port 443. Live per copy-paste-Befehlen diagnostiziert (nginx
  lief noch, Zertifikat war weiterhin gültig bis 04.10.2026, nur die
  Config fehlte) und mit einer wiederhergestellten Vollkonfiguration
  (bestehendes, weiterhin gültiges Zertifikat referenziert, kein neues
  angefordert) behoben — Nutzer bestätigt: „läuft". **Dauerhafter Fix
  gegen Wiederholung:** `deploy/nginx/ki-works.conf` enthält die SSL-Blöcke
  jetzt fest im Repo (inkl. Kommentar zur Historie) — ein künftiger `cp`
  kann die SSL-Konfiguration nicht mehr versehentlich löschen. Da ein
  frischer Server aber noch kein Zertifikat hat, würde `nginx -t` beim
  Ersteinrichten mit dieser Datei sofort scheitern — `deploy/install.sh`
  baut deshalb jetzt zuerst eine temporäre reine HTTP-Konfiguration auf,
  fordert danach per Certbot das Zertifikat an, und spielt erst bei Erfolg
  die vollständige (SSL-fertige) Repo-Datei ein. Noch nicht auf dem Server
  verifiziert (nächster Rollout-Schritt), lokal per `bash -n
  deploy/install.sh` auf Syntaxfehler geprüft.
- **Light Mode (Standard) mit Dark-Mode-Umschalter für alle 3 Apps
  (13.08.2026):** Landingpage, Kunden-Dashboard und Business-Dashboard
  liefen bisher fest auf Dark Mode (hartcodierte dunkle CSS-Variablen).
  Jetzt theme-fähig: `:root` = hell (Standard), `.dark`-Klasse auf
  `<html>` = dunkel (bisheriges Design, optisch unverändert). Umschalter
  (☀️/🌙-Button, `kiworks-theme` in localStorage) im Landing-Header
  (Desktop + Mobile-Menü) bzw. in den Dashboard-Sidebars/Login-Screens.
  Inline-Script in jedem HTML-Einstiegspunkt verhindert Theme-Flackern
  beim Laden. Technisch pro App: `landing/` nutzt Tailwind v4 mit
  CSS-Variablen (`oklch`) + `@custom-variant dark`, ~250 Tailwind-Klassen
  auf theme-fähige Utilities umgestellt (`text-white` → `text-foreground`
  usw., Akzentfarben wie `text-cyan-300` bekamen `dark:`-Variante mit
  dunklerer Light-Mode-Farbe für Kontrast); `dashboard/` und
  `business-dashboard/` nutzen einfaches CSS mit `--variablen` (kein
  Tailwind) — dort nur `:root`/`.dark`-Block umgebaut, keine
  Komponentenänderungen nötig außer dem neuen Umschalter-Button. Dabei
  zwei Kontrast-Bugs gefunden und behoben: das Terminal-Mock auf der
  Landingpage (transparentes Schwarz auf hellem Grund war fast unlesbar,
  jetzt deckende dunkle Füllfarbe) und mehrere zu helle Akzent-Textfarben
  (cyan/violet/emerald/amber), die auf Weiß zu wenig Kontrast gehabt
  hätten. Lokal in beiden Modi (Desktop + Mobile) per Playwright-
  Screenshots geprüft, committet+gepusht, Deploy-Befehle (normaler
  rsync/Build-Ablauf, kein Backend-Neustart/nginx-Reload nötig) an Nutzer
  gegeben.
- **Nachschärfung Light/Dark Mode (13.08.2026):** Nutzer-Feedback nach dem
  obigen Umbau: (1) alle CTA-Buttons auf der Landingpage sollen das
  Cyan-Violet-Verlauf-Design von "Kiwo kennenlernen" bekommen statt teils
  Glass-/Outline-Optik (betraf Header „Kunden-Login"/„Kiwo testen", Hero
  „Plattform-Demo", die 3 Preise-Buttons) — jetzt einheitlich, sieht in
  Light und Dark gleich gut aus, da der Verlauf fixe Farben nutzt statt
  Theme-Variablen. Reine Icon-Buttons (Menü-Toggle, Theme-Umschalter
  selbst) bewusst ausgenommen (andere UI-Kategorie, kein CTA). (2)
  Dark-Mode-Umschalter soll auf Mobile auch außerhalb des Menüs sichtbar
  sein — steht jetzt immer in der mobilen Kopfzeile statt nur im
  aufklappbaren Menü; dafür „Kunden-Login" auf sehr schmalen Screens
  (< 640px) ins Menü verschoben, damit Logo/Umschalter/„Kiwo
  testen"/Hamburger nicht überlaufen (bei 320px Breite trunkiert das Logo
  stärker, aber ohne Layout-Bruch — akzeptiert, sehr seltene Bildschirmgröße).
- **Falsche "Live"-Status im Mega-Menü behoben (13.08.2026):** Nutzer-Fund —
  Kiwo Sales und Kiwo Office zeigten "Live" im Mega-Menü, obwohl beide laut
  `ROLE_DEFINITIONS` (`backend/src/vapiAdmin.js`) technisch noch nicht
  implementiert sind (nur Reception/Support/Orders sind es). Ursache:
  `landing/src/components/Header.jsx` setzte `status: "live"` hartcodiert
  für alle 5 Rollen. Jetzt korrigiert (Sales/Office → `status: "soon"`).
  Dabei zweite hartcodierte Fundstelle entdeckt und mitgefixt: die
  Hero-Statuszeile ("5 Rollen live · 4 bald") war ebenfalls eine feste
  Zahl statt aus dem `roles`-Array berechnet — zeigt jetzt automatisch
  "3 Rollen live · 6 bald" und bleibt bei künftigen Rollen-Änderungen
  korrekt, ohne von Hand nachgepflegt werden zu müssen.
- **Orb Buddy: Sprechblasentext geändert + Positions-Fix (13.08.2026):** Die
  bisherige Sprechblase am Hero-Orb Buddy zeigte nur drei animierte Punkte
  ("..."), jetzt echten Text "Hi, ich bin Kiwo" (als eigenes HTML-Element
  neben dem SVG-Charakter, da echter Text in der SVG-Sprechblase zu wenig
  Platz gehabt hätte). Dabei einen Positionsfehler behoben: die Blase war
  relativ zum großen Hero-Container statt zur Figur selbst positioniert
  (dadurch weit oben, überlappend mit den Status-Badges) — jetzt in einem
  150×150-Wrapper direkt um `OrbBuddy` verankert, sitzt daher zuverlässig
  neben Kiwo. **Mausverfolgung (Rotation + Pupillenbewegung per
  `pointermove`) wurde in derselben Sitzung ebenfalls gebaut, nach
  Nutzer-Feedback ("mag ich nicht") aber wieder komplett entfernt** — für
  die nächste Sitzung ist ein Neubau mit klarerer Spezifikation vorgemerkt
  (siehe „Offene Punkte").
- **Sales-/Akquise-Agent v1 gebaut (Pilot ki-works.eu, 13.08.2026):**
  Erster Baustein des lang vorbereiteten Akquise-Agent-Konzepts (siehe
  weiter unten „Akquise-Agent"-Brainstorming) — auf Nutzer-Freigabe hin
  umgesetzt. Neu: `backend/src/salesAgent.js` (`runSalesAgent()`) nutzt
  `@anthropic-ai/sdk` mit Claudes Server-Tools `web_search_20260209`/
  `web_fetch_20260209` (Modell `claude-sonnet-5`), recherchiert bis zu 5
  passende Restaurants/Gasthäuser im Zielgebiet Schwertberg/Mühlviertel/
  Oberösterreich, entwirft je eine individuelle deutsche Akquise-Mail und
  schreibt sie als `pending_actions`-Zeilen (`role: 'sales'`,
  `kind: 'outreach_email'`) — **kein automatischer Versand**, reine
  Freigabe-Vorbereitung. Einfache Dopplungs-Vermeidung: bereits
  vorhandene Sales-`pending_actions` werden vor jedem Lauf als
  Ausschlussliste in den Prompt gegeben. Neuer Endpunkt
  `POST /api/sales-agent/run` (`adminOnly`) in `backend/src/server.js`,
  läuft synchron wie das bestehende `/api/recommendations`. Im
  Business-Dashboard (`business-dashboard/src/App.jsx`): Button
  "Sales-Agent starten" auf der ki-works.eu-Karte (einzige Karte mit
  echter Funktion, die anderen 3 bleiben Platzhalter), zeigt Ladezustand
  und Ergebniszahl; `PendingActions`-Zeilen sind jetzt aufklappbar und
  zeigen das volle `payload` (Betreff, Mailtext, Kontakt, Website,
  Begründung) — nötig, damit der Admin die Mail vor Freigabe wirklich
  lesen kann, gilt generisch für alle `pending_actions`-Kinds.
  **Architektur bewusst zukunftsoffen gehalten:** Qualifizierungskriterien
  als eigene benannte Konstante (nicht im Prompt-String vergraben),
  Lead-Feldset und `role: 'sales'` so gewählt, dass sie später ohne
  Schema-Bruch auch eine echte Vapi-Telefonrolle "Kiwo Sales" (Live-
  Anrufqualifizierung, verkaufbares Produkt-Feature) mitversorgen können
  — diese Telefonrolle selbst ist aber **nicht** Teil dieses Schritts,
  bleibt offen (siehe unten). Lokal nur bis Build/Syntax-Check verifiziert
  (`node --check`, `npm run build` für `business-dashboard/`) — ein echter
  Lauf mit echter Websuche verursacht reale Kosten, deshalb bewusst noch
  nicht ausgeführt. **Auf dem Produktivserver ausgerollt (13.08.2026):**
  Nutzer hat den kompletten Deploy live durchgeführt — rsync/Build für
  alle 3 Frontends, `npm install` für die neue `@anthropic-ai/sdk`-
  Abhängigkeit, `systemctl restart ki-works-api`,
  `migration-018-pending-actions.sql` lief mit "already exists,
  skipping" (war also schon vorhanden), `nginx -t && systemctl reload
  nginx` erfolgreich für den neuen `/intern`-Block. Ein erster echter
  Lauf mit echter Websuche steht weiterhin aus (siehe „Offene Punkte" —
  braucht Anthropic-API-Guthaben).
- **Social-Media-Agent v1 gebaut (Bild-Posts, Pilot ki-works.eu,
  15.08.2026):** Antwort auf "können wir einen Agenten für die
  Mo/Mi/Fr-Posts ins Business-Dashboard integrieren" — nutzt dasselbe
  Freigabe-Muster wie der Sales-Agent (Entwurf landet in
  `pending_actions`, Admin gibt frei). Bewusst nur **Bild-Posts**, Reels
  bleiben ein separater, späterer Schritt (Nutzer-Entscheidung). Neu:
  `backend/src/socialGraphic.js` rendert eine quadratische 1080×1080-
  Grafik aus Headline/Subline per SVG + `sharp` — **bewusst kein
  Headless-Chromium** (wie beim bisherigen manuellen Vorgehen im Chat),
  da ein dauerhaft laufender Server-Prozess dafür unnötig schwer wäre;
  Space-Grotesk-Schriftdateien liegen dafür fest im Repo
  (`backend/assets/fonts/`, Google-Fonts-Original, OFL-Lizenz), damit die
  Optik unabhängig von auf dem Server installierten System-Fonts
  konsistent bleibt. `backend/src/socialAgent.js` (`runSocialAgent()`)
  lässt Claude (`@anthropic-ai/sdk`, kein Websearch nötig) ein neues
  Thema + Headline/Subline/Caption texten (Dopplungs-Vermeidung über
  bereits vorhandene `pending_actions`-Themen plus eine hartcodierte
  Liste der beiden schon manuell veröffentlichten Alt-Themen), rendert
  das Bild und legt einen `pending_actions`-Eintrag an
  (`role: 'social'`, `kind: 'post'`). Neuer Endpunkt
  `POST /api/social-agent/run` (`adminOnly`). **Unterschied zum
  Sales-Agent:** eine Freigabe hier ist nicht nur eine Notiz, sondern
  löst die echte Veröffentlichung aus — `PATCH /api/pending-actions/:id`
  wurde dafür erweitert: akzeptiert jetzt optional ein `payload`-Feld
  (Caption vor der Freigabe bearbeiten, generisch für alle Kinds nutzbar)
  und ruft bei `role: 'social'`/`kind: 'post'` + Freigabe die
  bestehenden `publishFacebookPhoto`/`publishInstagramPhoto`
  (`backend/src/socialMedia.js`) direkt auf; schlägt die Veröffentlichung
  auf **beiden** Plattformen fehl, bleibt der Eintrag auf "pending"
  (Bearbeitung wird trotzdem gespeichert, kein Datenverlust bei einem
  späteren erneuten Versuch), bei mindestens einem Erfolg gilt er als
  freigegeben. Im Business-Dashboard: neuer Button "Social-Post
  erzeugen" neben dem Sales-Agent-Button auf der ki-works.eu-Karte; die
  Freigaben-Tabelle zeigt für `kind: 'post'`-Zeilen statt der generischen
  Feldliste eine eigene Vorschau (Bild + editierbares Textfeld für die
  Caption + "Freigeben & veröffentlichen"/"Verwerfen" statt der
  normalen Schnell-Freigeben-Buttons, damit vor dem Live-Gang immer erst
  das Bild gesehen wird). Lokal gegen frische Test-DB voll durchgetestet
  (u. a. der Kern-Fall ohne Meta-Zugangsdaten: Freigabe schlägt korrekt
  mit 502 fehl, Eintrag bleibt "pending", Caption-Bearbeitung wird
  trotzdem gespeichert; Ablehnen-Flow; Regressionstest, dass die
  bestehende Sales-Agent-Freigabe unverändert funktioniert, also keine
  Veröffentlichung auslöst). **Auf dem Produktivserver ausgerollt
  (15.08.2026):** Nutzer hat den Deploy durchgeführt, `npm install` für
  die neue `sharp`-Abhängigkeit bestätigt (per `ls node_modules | grep
  sharp` verifiziert), Backend neu gestartet. Setzt weiterhin die noch
  ausstehende Meta-App-Einrichtung voraus (siehe
  „Social-Media-Automatisierung" unten) — bis dahin liefert eine Freigabe
  im Dashboard den erwarteten 502-Fehler statt eine echte Veröffentlichung.
  Zusätzlich braucht ein erster echter Testlauf (Button "Social-Post
  erzeugen") Anthropic-API-Guthaben, das laut Nutzer aktuell (15.08.2026)
  weiterhin nicht ausreicht — gleiche Einschränkung wie beim Sales-Agent.
- **Website-Versprechen korrigiert + echtes Audit-Log gebaut (16.08.2026):**
  Nutzer-Frage zur Multi-Agent-Architektur deckte eine Diskrepanz auf: die
  Landingpage (`landing/src/App.jsx`, Abschnitt "KI-Works Plattform")
  versprach "Audit-Logs für jede Aktion von Kiwo", "SSO & rollenbasierter
  Zugriff", "Feingranulare Rechte pro System" und "Ende-zu-Ende
  Verschlüsselung" — laut eigenem Sicherheits-Audit (siehe „Offene
  Punkte") stimmte davon nichts (nur Fehler-Logging, kein SSO, nur
  Admin/Kunde-Rollen, keine echte E2E-Verschlüsselung). **Sofort behoben:**
  die vier Punkte durch das ersetzt, was wirklich zutrifft ("EU-Hosting &
  TLS-verschlüsselte Übertragung", "Strikte Datentrennung zwischen
  Kunden", "Passwortgeschützter Zugang für Admin & Kunden", "Automatisiertes
  Backup & Fehler-Monitoring"). **Danach echten Audit-Log gebaut**, damit
  der Audit-Log-Punkt nicht nur gestrichen, sondern nachgeliefert wird:
  neue Tabelle `audit_log` (migration-019, Spalten `restaurant_id`,
  `source`, `action`, `summary`, `details` JSONB, `call_id`) +
  `backend/src/auditLog.js` (`logAction()`, best-effort/fehlerfest wie
  `logError`). Eingehängt an drei Stellen: (1) zentral in
  `handleToolCalls` (`backend/src/vapi.js`) — protokolliert JEDEN
  Telefon-Tool-Aufruf (Reservierung/Bestellung/Stornierung/Rückruf-Wunsch
  usw.) automatisch, ohne einzelne Handler-Funktionen anzufassen, bewusst
  nicht awaited (darf die Live-Gesprächslatenz nicht verzögern); (2)
  `runSalesAgent()` protokolliert jeden Lauf; (3) `runSocialAgent()`
  protokolliert jeden Entwurf, die PATCH-Freigabe in `server.js`
  protokolliert zusätzlich den echten Facebook/Instagram-Veröffentlichungs-
  versuch (Erfolg oder Fehlschlag). Neuer Endpunkt `GET /api/audit-log`
  nutzt dasselbe `customerScope`-Muster wie `pending-actions` — Kunden
  sehen nur eigene Einträge, interne Agenten-Zeilen ohne `restaurant_id`
  (Sales/Social für ki-works.eu selbst) sieht nur der Admin. Neuer Tab
  "Aktivitätsprotokoll" im **Kunden-Dashboard** (`dashboard/src/App.jsx`,
  nicht nur intern) — bewusst dort platziert, weil das Website-Versprechen
  an Restaurant-Kunden gerichtet ist, nicht nur ans eigene Team; für alle
  Rollen sichtbar (auch Support-only-Kunden ohne `orders`-Rolle, da z. B.
  `request_callback` ebenfalls protokolliert wird). Lokal gegen frische
  Test-DB komplett durchgetestet: echter Tool-Call über den Vapi-Webhook
  simuliert → Audit-Zeile korrekt erstellt; Kunden-Scope per echtem JWT
  geprüft (sieht nur eigene Zeile, nicht die interne Sales-Agent-Zeile);
  Social-Publish-Fehlschlag ohne Meta-Zugangsdaten protokolliert korrekt
  trotz 502-Antwort; Regressionstest auf bestehende Endpunkte bestanden.
  **Noch nicht auf dem Produktivserver ausgerollt**, siehe „Offene
  Punkte". SSO und feingranulare Rechte pro System bleiben bewusst
  offene, größere Vorhaben (siehe „Ideen & Zukunftsplanung") — dafür gibt
  es aktuell keine Website-Behauptung mehr, die das verspricht.
- **Audit-Log auch im Business-Dashboard, generisch für alle 4 Karten
  (16.08.2026):** Nutzer-Nachfrage nach dem obigen Audit-Log — sollte auch
  intern sichtbar sein, nicht nur im Kunden-Dashboard, und zwar **für alle
  Business-Karten (ledtek/pixelpress/Memcore/ki-works) und automatisch für
  künftig neue Karten**, ohne dass dafür jedes Mal Code angepasst werden
  muss. Dafür `audit_log` um eine `business`-Spalte ergänzt
  (migration-020, nullable TEXT + Index) — identifiziert, zu welcher
  Business-Dashboard-Karte ein Eintrag ohne `restaurant_id` gehört (Sales-/
  Social-Agent-Läufe schreiben jetzt `business: 'ki-works'`).
  `GET /api/audit-log` akzeptiert jetzt optional `?business=` (nur wirksam
  ohne `customerScope` — Kunden können den Filter nicht nutzen, per echtem
  JWT-Test verifiziert). Im Business-Dashboard zeigt eine neue generische
  Sektion "Aktivitätsprotokoll" unter jeder der 4 Karten (nicht nur
  ki-works.eu) das Protokoll gefiltert nach `business.id` aus der
  bestehenden `BUSINESSES`-Liste — sobald eine der anderen 3 Karten
  eigene Agenten bekommt, die mit ihrem `business`-Wert loggen, taucht
  das automatisch dort auf, ganz ohne Dashboard-Code-Änderung (lokal
  durchgespielt: eine `ledtek`-Zeile eingefügt, ohne Codeänderung sofort
  unter dem `?business=ledtek`-Filter sichtbar). Lokal gegen frische
  Test-DB verifiziert (Migration, Business-Filter für vorhandene und
  simulierte künftige Karte, Kunden-Scope kann Filter nicht missbrauchen,
  bestehender Telefon-Audit-Pfad weiterhin unverändert korrekt). **Noch
  nicht auf dem Produktivserver ausgerollt**, siehe „Offene Punkte".
- **Onboarding-Sektion an echten (manuellen) Setup-Prozess angepasst
  (16.08.2026):** Nutzer-Fund per Screenshot — die 3 Onboarding-Schritte
  auf der Landingpage ("Rolle wählen", "Kanäle verknüpfen", "Kiwo
  arbeitet für Sie") suggerierten Selbstbedienung, tatsächlich läuft die
  Einrichtung manuell über Kontaktformular + gemeinsames Setup mit dem
  Team (kein Self-Service-Flow vorhanden). Schritte umbenannt in "Kontakt
  aufnehmen" / "Gemeinsames Setup" / "Kiwo übernimmt", Überschrift von
  "In 3 Schritten zum KI-Mitarbeiter" auf "So funktioniert's" geändert;
  dieselbe alte Formulierung wiederholte sich in der finalen CTA-Sektion
  ("Rolle wählen, Kanäle verknüpfen, Kiwo übernimmt") — dort ebenfalls
  angepasst, spiegelt jetzt dieselben drei neuen Schritt-Titel. Texte in
  einer zweiten Runde vom Nutzer noch verkürzt/geschärft (Schritt 1 nennt
  keine einzelnen Rollen mehr — passte sonst nicht zum
  "alle Rollen inklusive"-Preisversprechen, siehe Preise-Sektion, die
  genau diese Formulierung bereits unverändert enthielt). `landing/`
  gebaut und Prerendering geprüft.
- **Preise auf reale Anrufzahlen umgestellt + Stundensatz belegt
  (17.08.2026):** Nutzer hat zwei Rechercheergebnisse mitgebracht und um
  Prüfung vor jeder Live-Änderung gebeten. (1) Die Minutenpakete
  basierten auf einer nie belegten internen Annahme in `MARKETING.md`
  ("20–100 Anrufe/Monat") — recherchierte DACH-Marktdaten zeigen
  50–120 Anrufe/**Woche** für ein durchschnittliches Restaurant, Faktor
  4–15x höher; Solo (300 Min) deckte damit nicht mal ein kleines
  Restaurant ab (~540 Min/Monat realistischer Bedarf). (2) Der
  "⌀ 42 €/Std."-Wert für "Personalzeit gespart" (ROI-Rechner + alle 3
  Preiskarten) war im Code nirgends hergeleitet oder belegt.
  Nutzer-Entscheidung nach Rückfrage: der neuen Anrufzahlen-Recherche
  folgen (Pakete deutlich anheben) und Stundensatz auf ~21 €/Std. setzen
  (KV-Fachkraft-Vollkosten Gastronomie AT ~17-18 € + moderater
  Overhead-Aufschlag). Umgesetzt in `landing/src/App.jsx`: Pakete
  Solo 300→**600 Min/99 €**, Team 1000→**1500 Min/249 €**,
  Scale 2500→**3500 Min/499 €** (Marge bleibt bei allen Stufen deutlich
  über der Kostenbasis 0,085 €/Min, ~40-49 % Bruttomarge); `hourlyCost`
  42→21 an allen drei Stellen (ROI-Rechner, Preiskarten, Dashboard-
  Vorschau-Kachel in der "Alles auf einen Blick"-Sektion). Zusätzlich:
  bisher offener Überschreitungspreis jetzt auf **0,20 €/zusätzliche
  Minute** festgelegt (reine Nachberechnung, kein Anruf-Abbruch/keine
  automatische Sperre) und auf der Preise-Seite kommuniziert — braucht
  kein neues Billing-System, wird wie bisher manuell nachverfolgt/in
  Rechnung gestellt. `MARKETING.md` (Tarif-Tabelle, Anruf-Annahme,
  Verkaufsargument-Beispielrechnung, "Offen/noch zu klären") konsistent
  mitgezogen. Lokal verifiziert: Build + SSR-Prerendering fehlerfrei,
  gerenderte HTML-Ausgabe stichprobenartig auf alle neuen Zahlen geprüft,
  Marge rechnerisch für alle 3 Tarife über der Kostenbasis bestätigt.
- **Mehrsprachigkeit DE/EN/RO — Phase 0 (Infrastruktur) fertig (17.08.2026):**
  Nutzer-Wunsch: ganze Website + Kunden-Dashboard mehrsprachig, automatische
  Spracherkennung, Flaggen-Umschalter. Sprachen (nach Rückfrage/Ergänzung):
  Deutsch (Standard), Englisch, **Rumänisch**. Erkennung bewusst per
  Browser-Sprache (`navigator.language`), nicht IP-Geolocation (keine
  Server-Zusatzkomplexität, kein zusätzlicher DSGVO-Prüfpunkt).
  Architektur: **kein `react-i18next`/`react-intl`**, eigenes leichtes
  Dictionary+Context-System (`t(key)`-Lookup) — Begründung: `landing/`
  wird nur einmalig beim Build serverseitig gerendert
  (`react-dom/server`/`scripts/prerender.js`, kein Request-Server), eine
  Library brächte dort nur Overhead; passt außerdem zum bestehenden
  Projekt-Stil (Light/Dark-Theme ist genauso ohne Library gelöst). Neue
  Sprache = neue `<locale>.json` + ein Registry-Eintrag, kein Umbau
  (gleiches Muster wie `ROLE_BLOCKS` in `vapiAdmin.js`).
  **`landing/`:** neues `src/i18n/` (Runtime + `de.json`/`en.json`/
  `ro.json`), Locale wird immer explizit als Prop durchgereicht (nie
  eigenständig `window`/`navigator` gelesen — läuft auch in Node beim
  SSR-Prerender). Neue Routen `/en/` und `/ro/` (eigene `en/index.html`/
  `ro/index.html`/`*/kontakt.html`-Shells, `vite.config.js`-Multi-Entry
  erweitert, `entry-server.jsx`/`prerender.js` rendern jede Sprache
  separat) — **kein erzwungener Redirect**, `/` bleibt Standard-Deutsch,
  ein dismissbares Banner schlägt bei erkannter Fremdsprache die passende
  Seite vor (rein client-seitig nach Hydration, ändert den
  Crawler-HTML-Output nicht). `hreflang`-Alternates (de/en/ro/x-default)
  in allen 4 Home-/Kontakt-Shells + `sitemap.xml`. Neuer Flaggen-Dropdown
  (`LanguageToggle.jsx`, 🇩🇪/🇬🇧/🇷🇴) im Header — echte Links auf die
  jeweils andere Sprachversion (kein SPA-Routing), rendert immer alle
  Sprach-Links ins HTML (nur per CSS ausgeblendet), bleibt dadurch auch
  im SSR-Output für Crawler vorhanden. `Header.jsx`/`Footer.jsx` bekommen
  einen `page`-Prop ("home"/"kontakt"/"legal"), damit Nav-Anker/Links auf
  der jeweiligen Sprachversion bleiben statt zur deutschen Startseite
  zurückzuspringen. **Impressum/Datenschutz bleiben bewusst nur
  Deutsch** (Risiko von Nuancenverlust bei KI-Übersetzung rechtlich
  bindender Texte) — kurzer zweisprachiger Hinweis
  (`LegalLanguageNotice.jsx`) erscheint dort, wenn die Browsersprache
  des Besuchers nicht Deutsch ist. **`dashboard/`:** eigenes,
  eigenständiges `src/i18n/` (kein SSR-Zwang, Provider darf
  `navigator.language` + `localStorage` selbst lesen, exakt analog zu
  `theme.js`/`getStoredTheme`) — Locale-Wahl per Klick zyklisch
  DE→EN→RO→DE (`LanguageToggle` direkt neben dem bestehenden
  `ThemeToggle` in der Sidebar). Nur die Sidebar-Navigation
  (`NAV`/`pageTitle`, Aktualisieren/Abmelden/Zur-Website/Kiwo-Status)
  ist in diesem Schritt migriert — bewusst begrenzter erster Nachweis,
  nicht die komplette App (~1845 Zeilen). **Bewusst noch NICHT
  übersetzt** (spätere Phasen): der komplette Inhalt von `landing/`s
  Startseite (Hero/Rollen/Preise/FAQ/etc., ~1000 Zeilen), das
  Kontaktformular selbst, und der gesamte übrige Dashboard-Inhalt
  (Übersicht/Kalender/Reservierungen/Bestellungen/etc., inkl.
  Login-Bildschirm) — bleiben vorerst hartcodiert Deutsch, auch auf
  `/en/`/`/ro/`-Seiten. Ein Bug beim Testen gefunden und behoben: das
  Sprach-Vorschlag-Banner (`z-20`) blockierte per CSS-Stacking-Kontext
  die Klicks auf das offene Sprach-Dropdown im Header (ebenfalls `z-20`,
  aber später im DOM) — auf `z-10` reduziert. Lokal mit Playwright
  verifiziert: `landing/`- und `dashboard/`-Build fehlerfrei,
  SSR-Prerendering aller 8 `landing/`-Seiten (3 Sprachen × Home/Kontakt +
  2 fixe Rechtstexte) geprüft, `hreflang`/Locale-bewusste Links per Grep
  bestätigt, Sprachdropdown per echtem Headless-Browser-Klick getestet
  (DE→EN-Navigation funktioniert), Dashboard bootet mit neuem
  `I18nProvider` ohne Laufzeitfehler. `deploy/nginx/ki-works.conf` +
  `deploy/install.sh`: `try_files` um `$uri/` ergänzt (fehlte vorher —
  `/en/`/`/ro/` hätten sonst nicht auf die passende `index.html`
  aufgelöst). **Noch nicht auf dem Produktivserver ausgerollt.**
- **Mehrsprachigkeit DE/EN/RO — Phase 1-3 fertig (17.08.2026):** Nutzer
  wollte nach Sichtung von Phase 0 explizit "alles übersetzen. alles" —
  nicht nur Menü/Header/Footer, sondern wirklich jeden sichtbaren Text.
  **Phase 1 (`landing/` Hauptseite):** Hero, Rollen-Sektion (inkl. neuer
  `roleTag.*`/`roleDesc.*`-Namespaces für die 9 Rollen-Kacheln), Live-Test-
  Terminal (Befehle/Schritte als `liveTest.commands.*`), Beispiel-Gespräche,
  Kunden-Dashboard-Vorschau, Plattform-Sektion, ROI-Rechner, Onboarding,
  Preise und finale CTA sind jetzt über `t()` aus `de/en/ro.json` befüllt
  (vorher nur Header/Footer/Nav). Zahlenformatierung (Minuten, Euro-Beträge)
  läuft jetzt locale-bewusst über eine `LOCALE_INTL`-Konstante
  (de-DE/en-US/ro-RO) statt hartcodiertem `de-DE`. Nebeneffekt: das
  `roles`-Array in `Header.jsx` wurde von dupliziertem Text (Name/Tag/
  Beschreibung standen vorher sowohl im Array als auch in den Wörterbüchern)
  auf reine sprachneutrale Metadaten (Icon/Farbe/Kategorie/Status) reduziert.
  **Phase 2:** Kontaktformular (`Kontakt.jsx`) komplett übersetzt (Labels,
  Platzhalter, Erfolgsmeldung, Datenschutz-Zustimmungstext). **Phase 3
  (`dashboard/`):** kompletter restlicher Inhalt übersetzt — Login,
  Übersicht (`RoiTile`/`UsageTile`), Wochenkalender, Reservierungen,
  Bestellungen, Anrufe inkl. Transkript-Ansicht, Einstellungen (Rollen,
  Preistarif, Speisekarte/Öffnungszeiten/FAQ-Editor, Zugangsdaten),
  Kunden-Verwaltung, Anfragen/Leads, System-Status und Aktivitätsprotokoll
  — bewusst inklusive der Admin-Bereiche (Nutzer-Entscheidung: keine
  Ausnahme für intern genutzte Tabs). Datums-/Zeitformatierung dort
  ebenfalls auf dieselbe `LOCALE_INTL`-Konstante (de-AT/en-US/ro-RO)
  umgestellt statt hartcodiertem `de-AT`. `de/en/ro.json` in `dashboard/`
  wuchsen von den Phase-0-Basiskeys auf 284 Keys pro Sprache (Schlüssel-
  Parität über alle 3 Dateien per Skript geprüft, keine fehlenden/
  überzähligen Keys). Phase 3 wurde wegen des Umfangs (~2000 Zeilen) an
  einen Hintergrund-Agenten delegiert, Ergebnis danach selbst gegengeprüft
  (Build, Schlüssel-Parität, Grep nach übriggebliebenem hartcodiertem
  Deutsch in JSX-Text — keine Treffer). Beide Phasen lokal per
  `npm run build` (fehlerfrei) und stichprobenartig per Playwright
  verifiziert (übersetzte Überschriften/Labels sichtbar in EN/RO-Build-
  Output bzw. im gerenderten DOM). **Damit sind Website und
  Kunden-Dashboard durchgängig auf Deutsch/Englisch/Rumänisch nutzbar —
  noch NICHT auf dem Produktivserver ausgerollt** (normaler rsync/Build-
  Ablauf für `landing/`+`dashboard/`, plus der weiterhin ausstehende
  `deploy/nginx/ki-works.conf`-`try_files`-Fix aus Phase 0). Bewusst
  weiterhin NICHT übersetzt: Impressum/Datenschutz (rechtlich bindender
  Text, siehe Phase-0-Begründung), echte Datenbank-Inhalte (Kundennamen,
  Speisekarten/FAQ-Texte, Anruftranskripte).
- **Nutzungsmessung + Anzeige pro Kunde (17.08.2026):** Antwort auf die
  Nutzer-Frage, wie der Überschreitungspreis (0,20 €/Min., siehe
  Preise-Repricing oben) eigentlich gemessen/abgerechnet wird — bisher
  gar nicht, obwohl `calls.duration_seconds` die Rohdaten dafür längst
  liefert. Erster Baustein: **reine Anzeige, kein Billing.** Neue Spalte
  `restaurants.pricing_tier` (migration-021, `solo`/`team`/`scale`/NULL),
  vom Admin über einen neuen "Tarif ändern"-Button im Kunden-Bereich
  setzbar (`PricingTierForm`, gleiches Muster wie `RolesForm`) — nur
  Admin darf das (per Test mit echtem Kunden-JWT bestätigt: 403 bei
  Fremdänderung). Neuer Endpunkt `GET /api/usage` (customerScope-bewusst)
  summiert `calls.duration_seconds` für den laufenden Kalendermonat,
  vergleicht gegen das Kontingent des Tarifs (Minuten-Werte fix im Code
  hinterlegt, siehe `PRICING_TIERS` in `backend/src/server.js` —
  **müssen bei einer künftigen Preisänderung manuell mit
  `landing/src/App.jsx` `pricingTiers` synchron gehalten werden, kein
  gemeinsamer Quellort**), berechnet Überschreitungsminuten × 0,20 €.
  Neue Kachel im Kunden-Dashboard direkt unter der bestehenden
  Ersparnis-Kachel in der Übersicht (`UsageTile`) — Balkenanzeige
  Verbrauch/Kontingent, Überschreitung in Rot mit geschätzten Kosten;
  ohne hinterlegten Tarif nur der reine Verbrauch ohne Vergleich. Dabei
  eine zweite, bisher übersehene Stelle mit der alten unbelegten
  "42 €/Std."-Zahl gefunden und mitkorrigiert: die Ersparnis-Kachel
  (`RoiTile`) im Kunden-Dashboard hatte den Preise-Fix vom selben Tag
  nicht mitbekommen (eigene, unabhängige Komponente) — jetzt ebenfalls
  21 €/Std. Lokal gegen frische Test-DB verifiziert: Überschreitungs-
  Berechnung (650 Min. verbraucht bei 600 Min. Solo-Kontingent → 50 Min.
  × 0,20 € = 10,00 €), Anrufe aus Vormonaten werden korrekt NICHT
  mitgezählt (Kalendermonat-Grenze), Kunde ohne Tarif zeigt Verbrauch
  ohne Kontingent-Vergleich, Kunden-Scope kann weder fremde Restaurant-
  Nutzung abfragen noch den eigenen Tarif selbst ändern. **Automatische
  Abrechnung (PayPal/Bank o. Ä.) ist explizit ein späterer, noch nicht
  begonnener Schritt** — dieser Baustein liefert nur die Diskussions-/
  Anzeige-Grundlage dafür. **Noch nicht auf dem Produktivserver
  ausgerollt.**
- **Mehrsprachigkeit: Nacharbeiten nach dem ersten Nutzer-Test (18.08.2026):**
  Nutzer hat die Phase-1-3-Umsetzung getestet und drei Lücken gemeldet,
  alle noch am selben Tag behoben. (1) Logo-Untertitel "platform · agent
  kiwo" unter dem KI-Works-Schriftzug (`landing/src/components/Header.jsx`)
  war hartcodiert und lief nie über `t()` — auf `/ro/` blieb er dadurch
  unübersetzt stehen, obwohl der Rest des Mega-Menüs bereits korrekt
  Rumänisch zeigte. Neue Keys `nav.logoSubtitleShort`/`logoSubtitleFull`
  in allen 3 Wörterbüchern. (2) Sprach-Umschalter im Kunden-Dashboard war
  bisher ein Durchklick-Button (DE→EN→RO→DE) statt eines Dropdowns wie auf
  der Landingpage — jetzt echtes Dropdown-Menü (`LanguageToggle` in
  `dashboard/src/App.jsx`), zusätzlich auch auf dem Login-Screen ergänzt
  (vorher nur in der eingeloggten Sidebar vorhanden). Dabei einen
  CSS-Bug gefunden und behoben: die Sidebar-Buttons unten (Aktualisieren/
  Theme/Sprache/Logout) hatten `margin-top:auto` alle über dieselbe
  `.refresh`-Klasse — Flexbox verteilte den freien Sidebar-Raum auf alle
  vier gleichzeitig und riss sie weit auseinander (Nutzer-Screenshot
  zeigte große Lücken). Jetzt sitzt `margin-top:auto` nur noch auf einem
  neuen Wrapper (`.sidebar-actions`), die Buttons darin haben einen engen,
  einheitlichen Abstand. (3) Klick auf "Kunden-Login" öffnete das
  Dashboard bisher unabhängig von der gerade betrachteten Sprachversion
  der Website (z. B. DE-Startseite → RO-Login, weil das Dashboard eine
  komplett getrennte SPA ist und selbst per Browser-Sprache/localStorage
  entschied) — alle 4 "Kunden-Login"-Links (Header Desktop/Mobile, Footer,
  Dashboard-Vorschau-Sektion) hängen jetzt `?lang=<locale>` an;
  `dashboard/src/i18n/index.jsx`s `detectInitialLocale()` liest diesen
  Parameter zuerst aus (vor localStorage/Browser-Sprache) und übernimmt
  ihn dauerhaft. Alles lokal per Playwright verifiziert (RO-Menü zeigt
  jetzt durchgängig Rumänisch, Dashboard-Sprachdropdown öffnet/schließt
  korrekt, `?lang=ro`→`?lang=en` überschreibt eine zuvor gespeicherte
  Sprache wie erwartet).
- **Beispiel-Gespräche jetzt auch auf Englisch/Rumänisch vertont
  (18.08.2026):** die 3 Demo-Dialoge unter "Live testen" hatten bisher nur
  deutsche Audiospuren, spielten auf `/en/`/`/ro/` also weiterhin Deutsch
  ab. Kein Original-Skript/Transkript der deutschen Aufnahmen war im Repo
  hinterlegt (nur Ad-hoc in einer früheren Sitzung erzeugt, nie
  committet) — deshalb neue, inhaltlich passende Dialoge zu denselben 3
  Szenarien (Tischreservierung/Bestellung zur Abholung/Öffnungszeiten,
  Restaurant Venezia) auf Englisch und Rumänisch geschrieben statt
  Übersetzung des unbekannten Originaltexts; **Nutzer hat das akzeptiert,
  aber noch nicht final gegen die deutschen Originale abgeglichen** (siehe
  „Offene Punkte"). Vertonung wie beim bestehenden Muster per `edge-tts`
  (Kiwo- und Gast-Stimme getrennt, `+5%` Tempo, `ffmpeg`-Concat mit
  kurzen Stille-Pausen zwischen den Sprechern) — Stimmen `en-US-AvaNeural`/
  `en-US-GuyNeural` bzw. `ro-RO-AlinaNeural`/`ro-RO-EmilNeural` (Azure hat
  aktuell genau eine männliche und eine weibliche Neural-Stimme pro
  Sprache im Standard-Set). Dabei der Proxy-CA-Fix aus früheren Sitzungen
  erneut angewendet (Zertifikat hatte seit dem letzten Mal rotiert).
  Dateien liegen als `<id>-en.mp3`/`<id>-ro.mp3` neben den bestehenden
  deutschen `<id>.mp3` in `landing/public/demo-audio/`; `DemoCallCard`
  (`landing/src/App.jsx`) wählt die Datei jetzt anhand der aktuellen
  Locale statt eines fest hinterlegten Pfads. Lokal per Playwright auf
  allen 3 Sprachversionen geprüft (richtige `audio[src]` je Locale),
  Build fehlerfrei.
- **Google Fonts selbst gehostet + Cookie-Consent-Banner (Grundgerüst,
  18.08.2026):** Nutzer wollte einen Cookie-Banner. Prüfung ergab: die
  Website setzt aktuell keine Analyse-/Tracking-Cookies (Login läuft über
  `localStorage`, kein GA/Pixel) — die Datenschutzerklärung sagte das
  bereits korrekt. Einziger echter Befund: Google Fonts wurde von
  `fonts.googleapis.com`/`fonts.gstatic.com` geladen (IP-Adresse jedes
  Besuchers geht an Google ohne Einwilligung — dafür gab es 2022 ein
  bekanntes deutsches Gerichtsurteil, LG München I, Abmahnrisiko).
  Nutzer-Entscheidung: **beides** umsetzen. (1) Space Grotesk/Inter/
  JetBrains Mono liegen jetzt als woff2 (latin/latin-ext-Subset) unter
  `public/fonts/` in allen 3 Apps (`landing/`, `dashboard/`,
  `business-dashboard/`), die Google-Fonts-`<link>`-Tags sind aus allen
  10 HTML-Einstiegspunkten entfernt — optisch unverändert, kein externer
  Request mehr. (2) Neues Cookie-Consent-Banner nur in `landing/`
  (`CookieBanner.jsx`, gleiches Client-only-Muster wie
  `LanguageSuggestionBanner.jsx`): aktuell nichts zu bestätigen, aber
  `lib/cookieConsent.js` (`getConsent`/`setConsent`/`hasConsent()`)
  speichert schon jetzt eine Wahl, damit künftiger Code (z. B. Analytics)
  erst nach Zustimmung laden kann. Jederzeit änderbar über neuen
  "Cookie-Einstellungen"-Link im Footer. `Datenschutz.jsx` Abschnitt 8
  entsprechend ergänzt (localStorage ≠ Cookie, braucht keine Einwilligung).
  Lokal per Playwright verifiziert: kein Request mehr an
  `fonts.googleapis.com`/`gstatic.com`, Banner erscheint/verschwindet/
  persistiert korrekt, Footer-Link öffnet erneut.
- **Kiwo Web-Chat-Widget für ki-works.eu — Pilot (18.08.2026):** Nutzer
  wollte ursprünglich Chatbots für LEDTEK/pixelpress/ki-works.eu auf den
  jeweils eigenen Websites; nach Rückfrage auf **nur ki-works.eu jetzt**
  eingegrenzt (LEDTEK/pixelpress liegen außerhalb dieses Repos, dort wäre
  nur ein Einbett-Snippet lieferbar — eigener, späterer Schritt). Neuer
  öffentlicher Endpunkt `POST /api/public/webchat`
  (`backend/src/webchat.js`) lässt Besucher schriftlich mit Kiwo chatten,
  gestützt ausschließlich auf `knowledge_base`/`faq` des zugehörigen
  `restaurants`-Datensatzes (`formatFaq`/`formatOpeningHours` aus
  `vapi.js` wiederverwendet, jetzt exportiert). Nutzt `@anthropic-ai/sdk`
  wie `salesAgent.js`, mit einem `capture_lead`-Tool: bei unbeantwortbaren
  Fragen (Nutzer-Entscheidung: **wie das Kontaktformular**, nicht wie der
  telefonische Rückruf) landet ein Eintrag in der bestehenden
  `leads`-Tabelle (neue `source`-Spalte, `migration-022`). Restaurant wird
  über die Env-Variable `KIWORKS_OWN_RESTAURANT_ID` aufgelöst — kein
  Hardcoding einer DB-ID im Frontend, `restaurantId` im Request bleibt für
  einen künftigen Multi-Kunden-Einsatz optional. Erstes echtes
  In-Memory-Rate-Limiting im Backend (20 Nachrichten/10 Min pro IP, kein
  neues npm-Paket) — es gab bisher nirgends Rate-Limiting, obwohl das
  Sicherheits-Audit das schon länger als Lücke nennt (gilt weiterhin nur
  für diesen einen Endpunkt, nicht global). Frontend: neue
  `ChatWidget.jsx` (schwebende Bubble unten rechts, Orb-Buddy-Avatar) auf
  allen `landing/`-Seiten eingehängt, ruft same-origin auf (Pilot, kein
  CORS nötig). `OrbBuddy` dafür aus `App.jsx` in eine eigene Komponente
  ausgelagert. Dabei einen echten Positionskonflikt gefunden und behoben:
  der Cookie-Banner blockierte die Chat-Bubble beim automatischen
  Erstanzeigen (Playwright-Klick schlug fehl, "intercepts pointer
  events") — `CookieBanner` meldet Sichtbarkeitsänderungen jetzt über ein
  generisches Event (`COOKIE_BANNER_VISIBILITY_EVENT`) bei jeder eigenen
  State-Änderung statt nur beim manuellen Wiederöffnen. Lokal verifiziert:
  Backend-Validierung (fehlende Felder, unbekanntes/falsch konfiguriertes
  Restaurant, zu lange Nachricht, Rate-Limit-Grenze) per curl gegen
  frische Test-DB; Frontend per Playwright (Bubble öffnen/schließen,
  Nachricht senden, kein Overlap mit Cookie-Banner, EN-Locale-Text).
  **Der eigentliche Claude-Konversationsinhalt inkl. `capture_lead`-Tool
  konnte NICHT live getestet werden** — in dieser Sandbox ist kein
  `ANTHROPIC_API_KEY` hinterlegt (gleiche Einschränkung wie zuvor bei
  `salesAgent.js`/`socialAgent.js`). **Noch nicht live nutzbar**, siehe
  „Offene Punkte" (KI-Works muss noch als Kunde angelegt werden).
- **Chat-Widget-Fehlermeldung geschärft + neuer ROI-Rechner nach
  Nutzer-Vorlage (18.08.2026):** Nutzer meldete per Screenshot vom
  bereits live geschalteten Widget, dass jede Nachricht mit "message
  erforderlich" abgelehnt wurde, obwohl klar Text eingegeben war. Ursache:
  `POST /api/public/webchat` (`backend/src/server.js`) hat zwei
  unterschiedliche Fehlerursachen (fehlende Nachricht vs. fehlende/nicht
  gesetzte `KIWORKS_OWN_RESTAURANT_ID`, siehe Eintrag direkt oberhalb)
  hinter derselben irreführenden Meldung versteckt — jetzt getrennt (400
  bei fehlender Nachricht, 503 mit klarem Hinweis bei fehlender
  Restaurant-Zuordnung). Kein Verhaltensunterschied bei echt fehlender
  Nachricht. **Ursache dafür ist weiterhin offen** — siehe „Offene
  Punkte", die eigentliche Einrichtung (Kunde anlegen + Env-Variable
  setzen) steht noch aus. Zweiter Teil derselben Sitzung: der bisherige
  einfache Ein-Regler-ROI-Rechner wurde komplett durch eine vom Nutzer
  bereitgestellte, deutlich ausgereiftere Vorlage ersetzt (8 einstellbare
  Eingaben — Arbeitsstunden, Stundensatz, verpasste/reguläre Anrufe,
  Gesprächsdauer, Kontaktwert, Rettungsquote, Marge; automatische
  Tarif-Empfehlung nach höchstem Netto-Ergebnis mit manuellem Override +
  Wechsel-Hinweis; Aufschlüsselung nach Zeitersparnis/Zusatzumsatz/
  Kosten; Amortisation als Tage/Monate statt einer bei einem reinen Abo
  unpassenden klassischen Amortisationskurve). Fachlich 1:1 aus der
  Vorlage übernommen (`landing/src/App.jsx`, `ROICalc`), technisch in
  React/`useState`/`useMemo` + bestehende `pricingTiers` überführt,
  optisch ans tatsächliche Cyan/Violet-Design (nicht das eigenständige
  dunkle Grün-Design der Vorlage) angepasst, `roi.*`-i18n-Namespace in
  de/en/ro deutlich erweitert. **Bewusst nicht übernommen** (nach
  Rückfrage): der Footnote-Absatz "EU-AI-Act-Compliance" der Vorlage —
  laut CLAUDE.md ist die Kennzeichnungspflicht am Telefon bisher nur
  "vermutlich" erfüllt, eine explizite Compliance-Aussage wäre verfrüht
  (gleiche Vorsicht wie bei der früheren Korrektur der 4 unzutreffenden
  Sicherheitsversprechen). Lokal per Playwright verifiziert: Default-Werte
  ergeben plausible Zahlen (kein NaN/undefined), alle Regler aktualisieren
  live, Paket-Auto-Empfehlung wechselt korrekt bei steigendem
  Minutenbedarf, manuelle Paketwahl zeigt Wechsel-Hinweis bei suboptimaler
  Wahl, alle 3 Sprachen zeigen übersetzten Text, mobiles Layout stapelt
  sauber.
- **Erste Social-Media-Inhalte für LEDTEK und pixelpress (18.08.2026):**
  bisher gab es Social-Media-Posts nur für ki-works.eu. Auf Nutzer-Wunsch
  je ein Bild-Post + Reel für alle drei eigenen Unternehmen erstellt und
  direkt als Dateien übergeben (kein Automatik-Versand, siehe unten).
  Design für LEDTEK/pixelpress **mangels eigener Vorgaben von den
  Live-Websites abgeleitet** (`ledtek.at`/`pixelpress.at` per WebFetch
  analysiert): LEDTEK schwarz/weiß mit grünem Akzent, nüchtern-technischer
  B2B-Ton ("LED-Ware in 48h. Ohne Rätselraten."); pixelpress übernimmt den
  echten Slogan "Struktur schlägt Design" von der Seite, exakte
  Markenfarbe war dort aber nicht als Code hinterlegt — daher eigene Wahl
  (dunkles Blau + hellblauer Akzent), **noch nicht vom Nutzer bestätigt**.
  KI-Works bekam ein neues Thema ("24/7 erreichbar. Auch um 3 Uhr
  nachts.") mit dem bestehenden Design/Orb Buddy. Technisch: Bilder
  1080×1080 per SVG+sharp (gleicher Ansatz wie `socialGraphic.js`, aber
  als Wegwerf-Skript außerhalb des Repos ausgeführt, nicht committet — LED
  TEK/pixelpress haben keine Datenbank-/Backend-Anbindung in diesem
  Projekt); Reels 1080×1920 im bekannten Muster (edge-tts
  `de-AT-IngridNeural` +5%, ffmpeg-Zusammenbau aus Szenenbildern). Kein
  Feature-Code geändert, keine Commits nötig. **Wichtig:** LEDTEK und
  pixelpress haben in diesem Projekt weiterhin keinerlei technische
  Anbindung (keine `restaurants`-Zeile, kein Social-Media-API-Zugang) —
  Veröffentlichung bei allen drei Unternehmen aktuell nur manuell durch
  den Nutzer möglich.
  **Nachbesserung (19.08.2026) nach Nutzer-Feedback — Ergebnis vom Nutzer
  bestätigt ("passt"), gilt ab jetzt als Standard-Rezept für jeden
  künftigen Social-Media-Post/Reel für alle Businesses:**
  1. **Echte Logos verwenden, nicht nur Text.** Vor dem Rendern kurz per
     `curl`/WebFetch auf der Live-Website nach Logo-Dateien suchen (Header-
     `<img>` mit "logo" im Namen/Klasse, `apple-touch-icon`/Favicon als
     Fallback). Für LEDTEK/pixelpress hat das echte, direkt verwendbare
     Assets geliefert: LEDTEK-Favicon = "LT"-Monogramm (schwarz auf weiß),
     pixelpress hat ein fertiges transparentes `</PixelPress>`-Logo-PNG
     (weiße Version, nur auf dunklem Hintergrund sichtbar — vor Verwendung
     mit `sharp .stats()` prüfen, ob ein PNG tatsächlich Alpha-Transparenz
     hat und welche Farbe, bevor man es für "leer/kaputt" hält). KI-Works
     nutzt das bestehende Orbit-K-Logo (`landing/public/favicon.svg` als
     Quelle für die exakten Farbverläufe/Pfade). Logo + Eyebrow-Text NICHT
     nebeneinander plazieren (Breite variiert je Logo, überlappt schnell)
     — stattdessen Logo oben links, Eyebrow-Zeile direkt darunter.
  2. **Jedes Business braucht ein eigenes visuelles Design-Element**, nicht
     nur Text auf Verlaufshintergrund: LEDTEK = Glühbirnen-Icon mit Glow +
     kleine "LED-Strip"-Punktreihe (grüner Akzent); pixelpress = Browser-
     Fenster-Wireframe-Mockup mit angedeuteten Content-Blöcken (passt zu
     "Struktur schlägt Design"); KI-Works = Orb Buddy. Alle als reines
     Inline-SVG gebaut (Pfade/Formen direkt im SVG-String), kein Bedarf an
     zusätzlichen Bild-Assets außer den echten Logos.
  3. **Orb Buddy gehört bei KI-Works in JEDE Reel-Szene, nicht nur ins
     Bild.** Erster Versuch hatte ihn nur im Bild-Post — Nutzer-Feedback:
     muss auch im Reel durchgehend zu sehen sein. Die statische Marke
     (`orbBuddyMark()`-Funktion, identisch zu der in `socialGraphic.js`)
     lässt sich einfach in jede Szene mit reinkopieren.
  4. **KI-Works: Chat-Conversation-Mockup als eigenes Format.** Auf
     Nutzer-Wunsch zusätzlich zum Standard-Post ein Bild (und eine
     Reel-Szene) gebaut, das eine kurze Beispiel-Unterhaltung mit Kiwo als
     Chat-Bubbles zeigt (Layout wie im echten `ChatWidget.jsx` — Kiwo
     links/dunkel, Gast rechts/Verlaufsfarbe) statt nur Headline+Subline.
     Gute Ergänzung, wenn das Thema des Posts der Web-Chat selbst ist.
  5. **Jeder Post/jedes Reel braucht eine separate Caption** (Text zum
     Copy-Pasten beim manuellen Hochladen) — nicht nur der Text, der im
     Bild/Video steht. Emoji + 3-5 Bullet-Vorteile + Link + 4-5 Hashtags,
     als eigene `.txt`-Datei mit allen Captions gesammelt übergeben.
  Technisch weiterhin: Wegwerf-Skript in `backend/` (Zugriff auf
  `assets/fonts/`, `sharp`, dieselben Font-Dateien), nach Gebrauch wieder
  gelöscht (`rm`), keine Commits — nur `git status --short` danach
  prüfen, dass nichts hängen geblieben ist.
- **White-Label/Agentur-Modell: erste Pitch-Materialien für Kaltakquise
  (19.08.2026):** Nutzer hat eine eigene Strategie-Zusammenfassung
  geteilt (Kiwo zusätzlich über Agenturen statt nur direkt verkaufen, um
  den Sales-Bottleneck als Einzelunternehmer neben ledtek.at/pixelpress.at
  zu lösen). Meine Einschätzung dazu: Grundidee stimmig, Architektur
  trägt es größtenteils (`restaurants`-Tabelle ist längst generisch),
  aber drei Punkte vor jeder Code-Umsetzung zu klären: (1) Marge — die
  aktuellen Endkundenpreise haben ~40-49% Bruttomarge, ein weiterer
  Wholesale-Rabatt könnte das dünn werden lassen, noch nicht
  durchgerechnet; (2) `customerScope` kennt bisher nur zwei Stufen
  (Admin = alles, Kunde = eine `restaurant_id`) — eine dritte
  Agentur-Stufe (mehrere `restaurant_id`s) ist der eigentliche technische
  Umbau, nicht Branding/Billing; (3) White-Label ist mehr als ein Logo-
  Tausch (n8n-Mailtexte, Vapi-Assistentenname, Haftungsfrage
  Agentur/KI-Works). **Nutzer-Entscheidung: keine Backend-Umsetzung
  jetzt** — erster Schritt sind Pitch-Materialien für **kalte**
  E-Mail-Akquise an unbekannte Agenturen, bewusst **ohne** konkrete
  Wholesale-Zahlen (nur Prinzip, Preise im Gespräch). Umgesetzt:
  (1) **PDF-Ein-Seiter** (`Kiwo-White-Label-Partner.pdf`, per Playwright
  aus eigenständigem HTML mit eingebetteten Fonts als A4-PDF gerendert,
  Kiwo-Design/Orbit-K-Logo, kein Repo-Code, dem Nutzer als Datei
  übergeben); (2) **neue Landingpage `landing/partner.html`**
  (`src/pages/Partner.jsx`) — erreichbar nur über direkten Link aus der
  Kalt-E-Mail, bewusst **nicht** im Mega-Menü verlinkt, **nicht** in
  `sitemap.xml`, mit `<meta name="robots" content="noindex,nofollow">`,
  nur Deutsch (kein i18n, gleiche "schmaler Pilot"-Logik wie bei anderen
  neuen Features). Nutzt bewusst die volle `PageShell`/`Header`/`Footer`
  (nicht ein eigener schlanker Header wie ursprünglich geplant) — der
  ChatWidget ist dort ein echtes Live-Beweisstück für skeptische
  Agentur-Kontakte, `page="legal"` verhindert dabei automatisch kaputte
  Sprachumschalter-Links (gleiches Muster wie Impressum/Datenschutz).
  Enthält eine fiktive Beispiel-Dashboard-Vorschau ("Gasthaus
  Sonnenblick", klar als "fiktiv" markiert) statt echter Kundendaten.
  Lokal per `npm run build` + SSR-Prerender + Playwright verifiziert
  (Desktop/Mobile-Screenshot, keine JS-Fehler, `noindex`-Tag vorhanden).
  **Auf dem Produktivserver noch nicht ausgerollt**, normaler
  rsync/Build-Ablauf für `landing/` reicht (kein Backend-Neustart nötig).
- **Landingpage: erfundene Integrationen-Liste + toten "Rolle
  ansehen"-Text entfernt (19.08.2026):** Nutzer-Screenshot der
  "// integrations.stream"-Sektion ("schaut gut aus. aber zurzeit was
  läuft?") deckte auf, dass die "Integrationen"-Liste Marken zeigte, die
  technisch nie angebunden waren (WhatsApp Business, Microsoft Teams,
  Slack, Outlook, Google Calendar, HubSpot, Salesforce, SAP, Sipgate, 3CX,
  Zapier, DATEV), dazu ein Beschreibungstext, der eine nahtlose
  CRM/WhatsApp/Telefonanlagen-Anbindung behauptete, sowie frei erfundene
  Kennzahlen (99,98% Uptime, <400ms Antwortzeit) — gleiche Fehlerklasse
  wie die frühere Korrektur der 4 unzutreffenden Sicherheitsversprechen.
  Auf Nutzer-Entscheidung ("Nur echte Tools zeigen") ersetzt durch die
  tatsächlich genutzten Bausteine (Vapi, Anthropic Claude, Twilio, n8n,
  PostgreSQL) und einen ehrlichen Beschreibungstext; die erfundenen
  Kennzahlen durch drei zutreffende, bereits an anderer Stelle belegte
  Fakten ersetzt (TLS-Verschlüsselung, DSGVO-Konformität,
  EU-Datenhaltung). Zusätzlich (separate Nutzer-Nachfrage im selben
  Gespräch): das reine Deko-"Rolle ansehen"-Text mit Pfeil-Icon auf den
  Rollen-Karten der Startseite entfernt — suggerierte einen Klick, der
  nichts tat (kein echter Link); eine eigene Unterseite pro Rolle bleibt
  eine "vielleicht später"-Idee, siehe „Ideen & Zukunftsplanung".
  `landing/` gebaut, per Grep (`SAP`/`99.98`/`Rolle ansehen` nicht mehr
  im gerenderten HTML) und Playwright-Screenshot verifiziert.
- **Agentur-White-Label Phase 1 — echte Domain-Trennung + Branding
  (19.08.2026):** Nutzer-Klarstellung nach den Pitch-Materialien: "White-
  Label" bedeutet hart, dass KI-Works für die Agentur und deren Endkunden
  **nirgends sichtbar** sein darf — jede Agentur bringt **immer eine
  eigene Domain** mit, Backend/DB bleiben zentral bei KI-Works, nur das
  sichtbare Branding wechselt. Vapi-Assistentenname wird pro Agentur
  eigen. Umgesetzt (technischer Plan vorher mit Nutzer abgestimmt und
  freigegeben): neue Tabelle `agencies` (`backend/sql/migration-023-
  agencies.sql`: `name`, `domain` UNIQUE, `branding` JSONB, `login_email`/
  `password_hash` schon vorbereitet für Phase 2) + `restaurants.agency_id`
  (FK, nullable). Neuer öffentlicher Endpunkt `GET /api/public/branding`
  (`backend/src/server.js`) löst das Branding rein über den HTTP-
  `Host`-Header auf (kein Login nötig, funktioniert schon auf dem
  Login-Screen) — unbekannte Domain/`ki-works.eu` liefert
  `{isAgency:false}`, bestehende Direktkunden bleiben dadurch unverändert.
  Admin-CRUD `GET/POST/PATCH /api/agencies` (`adminOnly`). `dashboard/`:
  neuer `branding.jsx`-Context, `main.jsx` lädt das Branding vor dem
  ersten Render und überschreibt bei aktiver Agentur `document.title` +
  die zentralen CSS-Variablen (`--accent` usw.); alle 4 Logo-Stellen
  (Login/DSGVO-Consent/Setup-Passwort/Sidebar) laufen jetzt über eine
  gemeinsame `<BrandLogo/>`-Komponente (zeigt Agentur-Logo+-Name statt
  OrbitK+„KI-Works", wenn gesetzt); das Kiwo-/OrbBuddy-Maskottchen in der
  Sidebar wird bei aktivem Agentur-Branding ausgeblendet (sonst bliebe der
  Name "Kiwo" sichtbar). `backend/src/vapiAdmin.js`: `BASE_PROMPT`/
  `firstMessage` sind jetzt Template-Funktionen mit `assistantName`-
  Parameter (Default weiterhin "Kiwo"), `syncVapiAssistant()` joint
  `agencies.branding->>'assistantName'` und reicht ihn durch — kein
  "Kiwo" mehr im Prompt/in der Begrüßung, sobald eine Agentur einen
  eigenen Namen hinterlegt hat. **nginx/TLS bewusst NICHT** in die
  hand-gepflegte `deploy/nginx/ki-works.conf` gemischt (Wiederholung des
  13.08.2026-Ausfalls wäre das Risiko) — stattdessen neues Skript
  `deploy/add-agency-domain.sh <domain>`, das einen eigenen, komplett
  Certbot-verwalteten server-Block pro Agentur-Domain anlegt (DNS-Check
  per `dig`, HTTP-Bootstrap → `certbot --nginx`). Admin-Verwaltung: neue
  Sektion "Agenturen" im `business-dashboard/` (Anlegen + Branding-Felder
  bearbeiten, analog `RolesForm`/`PricingTierForm`-Mustern) + neuer
  "Agentur ändern"-Button im Kunden-Dashboard bei „Kunden (Betreiber)"
  (`AgencyAssignForm`, setzt `restaurants.agency_id`). **Bewusst Phase 2
  (später, nicht Teil dieses Schritts):** eigener Agentur-Login (dritte
  JWT-Rolle, damit eine Agentur mehrere Kunden auf einmal sieht) — nicht
  nötig für die reine Sichtbarkeits-Anforderung, da Endkunden weiterhin
  ganz normal über die bestehende `customer`-Rolle einloggen, nur das
  Branding wechselt. Ebenfalls bewusst offen: E-Mail-Absender
  (n8n-Mails laufen weiterhin von info@ki-works.eu — verrät den Betreiber),
  Impressum/Haftungsfrage bei White-Label-Instanzen (rechtliche Klärung
  nötig, keine Code-Frage). Lokal komplett gegen frische Test-DB
  end-to-end verifiziert: Migration sauber, `GET /api/public/branding`
  per `curl` mit verschiedenen `Host`-Headern (bekannte Agentur-Domain →
  Branding-JSON inkl. `assistantName`, `ki-works.eu`/unbekannt →
  `{isAgency:false}`), `syncVapiAssistant()`-Templating enthält nach Test
  kein "Kiwo" mehr bei gesetztem Agentur-Namen, `deploy/add-agency-
  domain.sh` per `bash -n` auf Syntaxfehler geprüft. Beide neuen
  Admin-UIs zusätzlich per echtem Playwright-Klicktest gegen den echten
  lokalen Backend-Prozess verifiziert (nicht nur Mocks): Agentur im
  Business-Dashboard anlegen + Branding-Formular zeigt gespeicherte Werte
  korrekt vorausgefüllt; im Kunden-Dashboard "Agentur ändern" bei einem
  Test-Kunden ausgewählt → `restaurants.agency_id` in der DB tatsächlich
  gesetzt. `dashboard/`/`business-dashboard/`-Builds beide fehlerfrei,
  i18n-Schlüsselparität (288 Keys) über alle 3 Sprachen weiterhin
  bestätigt. **Noch nicht auf dem Produktivserver ausgerollt** und noch
  keine echte Agentur angelegt — Rollout braucht zusätzlich zum üblichen
  rsync/Build-Ablauf für `dashboard/`+`business-dashboard/` die Migration
  `migration-023-agencies.sql` und einen Backend-Neustart; sobald eine
  echte Agentur zusagt, zusätzlich `deploy/add-agency-domain.sh <domain>`
  auf dem Server ausführen (braucht vorher gesetztes DNS der Agentur auf
  die Server-IP).
- **Agentur-Self-Service — Phase 2, ersetzt den admin-verwalteten Ansatz
  aus Phase 1 (25.08.2026):** Nutzer-Klarstellung nach Durchsprache der
  Phase-1-UI ("Agentur ändern"-Button im Kunden-Dashboard): Agenturen
  sollen ihre Kunden **selbst** anlegen/verwalten, nicht Alex — Alex
  braucht nur genug Evidenz für Rechnungen, keinen manuellen
  Zuordnungs-Schritt pro Kunde. Damit wird aus dem in Phase 1 als "später"
  vertagten Punkt jetzt der Kernmechanismus. Neue Login-Rolle `agency`
  (dritter Wert neben `admin`/`customer`): `backend/src/auth.js` bekommt
  `agencyScope(req)` analog `customerScope`; `POST /api/login` prüft nach
  Kunden-Login zusätzlich die `agencies`-Tabelle per `login_email` (Spalten
  waren seit Phase 1 schon vorbereitet, keine neue Migration nötig).
  Agentur nutzt dasselbe Kunden-Dashboard wie Restaurant-Kunden/Admin (kein
  neues Frontend) — sieht dort aber nur den Menüpunkt "Kunden" und landet
  direkt dort. `GET/POST/PATCH /api/restaurants` in `backend/src/server.js`
  um Agentur-Scoping erweitert: Agentur sieht/erstellt/bearbeitet nur
  Restaurants mit eigener `agency_id` (neu erstellte Kunden werden fest
  serverseitig auf die eigene Agentur gebunden, nie aus dem Request-Body
  übernehmen — sonst könnte sich eine Agentur fremde Kunden zuordnen).
  Vertragsinterna bleiben admin-only: `agency_id`, `pricing_tier`,
  `vapi_published`, `vapi_assistant_id`, `enabled_roles` sind für Agentur-
  PATCHes aus der erlaubten Feldliste entfernt (nur Name/Adresse/Kontakt/
  Vapi-Nummer/Login-E-Mail/Passwort bleiben änderbar). Einladungs-Versand
  (`POST /api/restaurants/:id/invite`) ebenfalls auf Eigentümer-Check
  umgestellt. `GET /api/stats/*/by-restaurant` (`scopedStats`) filtert
  jetzt zusätzlich nach `agency_id`. `dashboard/src/App.jsx`: neue
  `isAgencyUser`-Flag, Nav zeigt für Agentur nur "Kunden" (neues
  `agencyOk`-Feld am NAV-Eintrag), Sprung direkt auf die Kundenliste nach
  Login (nicht erst beim allerersten Mount, sondern per `useEffect` nach
  dem Login-Response — sonst bleibt die Agentur auf einer leeren Übersicht
  ohne ausgewähltes Restaurant hängen), kein Auto-Select eines "eigenen"
  Restaurants (Agentur hat keins). `Customers`-Komponente blendet für
  Agentur die admin-only Aktionen aus ("Rollen/Tarif/Agentur ändern",
  Vapi-"Publish"-Bestätigen) und macht den Kundennamen nicht mehr
  klickbar (Sprung in die volle Betriebsansicht — Reservierungen/
  Bestellungen/Anrufe/Einstellungen — bleibt bewusst ein späterer Schritt,
  da die ~15 bestehenden `customerScope`-Endpunkte dafür einzeln auf
  Agentur-Sicherheit geprüft werden müssten). Admin bleibt wie gefordert
  uneingeschränkt (Notfallzugriff, falls sich eine Agentur aussperrt) —
  über die bestehende Rollenprüfung ohnehin schon der Fall, per Test extra
  bestätigt. **Wichtige Ergänzung, ohne die Phase 2 nicht nutzbar wäre:**
  bisher gab es gar keine Möglichkeit, einer Agentur Login-Zugangsdaten zu
  geben (`PATCH /api/agencies/:id` kannte nur `name`/`domain`/`branding`)
  — jetzt zusätzlich `login_email`/`password` erlaubt, neues Formular
  "Zugangsdaten" in `business-dashboard/` unter "Agenturen" (neben dem
  bestehenden Branding-Formular). Lokal komplett gegen frische Test-DB
  end-to-end verifiziert (curl mit `x-real-ip`-Header, um den lokalen
  127.0.0.1-Admin-Bypass zu umgehen und echtes Agentur-Scoping zu prüfen):
  Agentur-Login, Kundenliste nur eigene 2-3 Restaurants, neuer Kunde
  automatisch mit eigener `agency_id`, PATCH/Invite auf fremdes Restaurant
  → 403 "nicht Ihre Agentur", Versuch `agency_id`/`pricing_tier` beim
  eigenen Restaurant zu ändern → wird still ignoriert (Feld bleibt
  unverändert), Admin sieht weiterhin alle Restaurants und kann
  `agency_id` jederzeit überschreiben. UI zusätzlich per Playwright
  geprüft (Nav zeigt nur "Kunden", Aktions-Buttons korrekt aus-/eingeblendet
  für Agentur vs. Admin, Kundenname nur bei Admin klickbar). Ein Bug beim
  ersten Testlauf gefunden und behoben: der initiale `view`-State wurde
  einmalig beim allerersten Mount gesetzt (vor dem Login, als die Rolle
  noch unbekannt war) — ein frischer Login als Agentur landete dadurch
  trotzdem auf der leeren Übersicht statt der Kundenliste; jetzt per
  zusätzlichem `useEffect` nach dem Login korrigiert. `dashboard/` und
  `business-dashboard/` Builds beide fehlerfrei. **Committet+gepusht,
  noch NICHT auf dem Produktivserver ausgerollt** — normaler rsync/Build-
  Ablauf für `dashboard/`+`business-dashboard/`, kein Backend-Neustart
  zwingend nötig (reine Zusatz-Logik, keine Breaking Changes an
  bestehenden Endpunkten), aber empfohlen, da `backend/src/server.js`
  sich geändert hat. Migration `migration-023-agencies.sql` (falls auf
  dem Server noch nicht gelaufen, siehe „Offene Punkte") ist weiterhin
  Voraussetzung. **Bewusst noch offen:** „Passwort vergessen" für alle
  drei Login-Typen (vom Nutzer selbst als Lücke benannt, noch nicht
  entschieden ob/wann gebaut — inzwischen umgesetzt, siehe direkt
  darunter) sowie voller Betriebs-Drilldown für Agenturen
  (Reservierungen/Bestellungen/Anrufe/Einstellungen).
- **„Passwort vergessen" für alle drei Login-Typen gebaut (25.08.2026):**
  Nutzer-Auftrag direkt im Anschluss an die obige Phase 2. Neuer Endpunkt
  `POST /api/public/forgot-password` (`backend/src/server.js`) — antwortet
  **immer identisch** (`{ok:true}`), egal ob die E-Mail existiert (kein
  Rückschluss auf gültige Logins möglich), eigenes In-Memory-Rate-Limiting
  (5 Anfragen/10 Min. pro IP, gleiches Muster wie beim Web-Chat-Widget).
  Drei Fälle: (1) **Kunde/Agentur** — echter Reset-Link über denselben
  Token-Mechanismus wie die Erstenladung (`setup_token`/
  `setup_token_expires`, hier 1 Std. statt 7 Tage gültig); `agencies`
  bekam dafür dieselben zwei Spalten (`migration-024-agency-reset-
  token.sql`, keine neue Funktionalität, nur Schema-Angleichung an
  `restaurants`). `POST /api/public/setup-password` (bisher nur
  `restaurants`) prüft jetzt beide Tabellen und aktualisiert die passende.
  (2) **Admin** — bewusst **kein** automatischer Reset-Link: der
  Admin-Zugang ist ein einzelnes, in der Server-Konfiguration
  hinterlegtes Konto ohne eigene Datenbank-Zeile (`ADMIN_EMAIL`/
  `ADMIN_PASSWORD` in `/etc/ki-works/ki-works.env`) — ein automatischer
  Reset würde das mächtigste Konto der Plattform unnötig angreifbar
  machen. Stattdessen bekommt die hinterlegte Admin-E-Mail eine Anleitung
  (SSH, `ADMIN_PASSWORD` in der env-Datei ändern, Backend neu starten).
  (3) **Unbekannte E-Mail** — keine Mail, aber dieselbe generische
  Antwort. Neuer n8n-Workflow `15-passwort-vergessen.json` (analog
  Workflow 10) — Backend liefert Betreff/Text bereits fertig formuliert,
  der Workflow verschickt nur noch (kein Conditional-Node in n8n nötig).
  Frontend: „Passwort vergessen?"-Link + kleines E-Mail-Formular in
  beiden Login-Screens (Kunden-Dashboard mit i18n DE/EN/RO, Business-
  Dashboard Deutsch wie der Rest dort) — zeigt nach Absenden immer
  dieselbe Erfolgsmeldung, nutzt denselben `?setup=`-Link/`SetupPassword`-
  Bildschirm wie die bestehende Erstenladung (kein zusätzlicher UI-Screen
  nötig, Setzen eines neuen Passworts ist technisch identisch zum
  Erstzugang). **Nebenbei korrigiert, per Nutzer-Nachfrage entdeckt:** die
  bei der Phase-2-Umsetzung neu gebaute „Zugangsdaten"-Verwaltung für
  Agenturen war versehentlich im Business-Dashboard (`/intern`) gelandet
  — Nutzer wies zurecht darauf hin, dass `/intern` nur für die eigenen 4
  Businesses (ledtek/pixelpress/Memcore/ki-works) gedacht ist, Agenturen
  aber Kiwo-Partner wie Restaurant-Kunden sind. Komplette Agenturen-
  Verwaltung (Anlegen, Zugangsdaten, Branding) daraufhin vom
  Business-Dashboard ins Kunden-Dashboard verschoben — neuer Menüpunkt
  „Agenturen" (nur Admin, i18n-Namespace `agencies.*`) direkt neben
  „Kunden (Betreiber)", `business-dashboard/` verliert die entsprechenden
  Komponenten/CSS-Regeln ersatzlos. Lokal komplett gegen frische Test-DB
  end-to-end verifiziert: `forgot-password` für Admin/Kunde/Agentur/
  unbekannte E-Mail liefert überall identische Antwort, Token korrekt in
  der jeweils richtigen Tabelle gesetzt (1 Std. Gültigkeit), Rate-Limit
  greift exakt nach 5 Anfragen, `setup-password` funktioniert für Kunde
  UND Agentur (danach Login mit neuem Passwort erfolgreich, alter Token
  wird ungültig), Custom-Agentur komplett per Playwright-UI-Test angelegt
  (Formular ausfüllen → Zugangsdaten vergeben → Login mit den neuen
  Zugangsdaten funktioniert), Admin-Nav zeigt „Agenturen" korrekt,
  Business-Dashboard enthält keine Agentur-Reste mehr (per Grep
  bestätigt). Alle 3 Builds (`backend` Syntax-Check, `dashboard/`,
  `business-dashboard/`) fehlerfrei, i18n-Schlüsselparität (315 Keys)
  über alle 3 Sprachen bestätigt. **Committet+gepusht, noch NICHT auf dem
  Produktivserver ausgerollt** — normaler rsync/Build-Ablauf für
  `dashboard/`+`business-dashboard/` plus Backend-Neustart
  (`server.js` geändert), zusätzlich `migration-024-agency-reset-
  token.sql` ausführen (nach `migration-023-agencies.sql`, falls die noch
  nicht gelaufen ist) und den neuen n8n-Workflow 15 einmalig manuell in
  der n8n-Oberfläche importieren (gleiche Einschränkung wie bei früheren
  neuen Workflows — keine stabile Workflow-ID für sicheren CLI-Reimport).
- **Agentur-Onboarding auf Einladungs-Flow umgestellt (25.08.2026):**
  Nutzer-Korrektur direkt nach dem obigen Umzug ins Kunden-Dashboard: im
  Admin-Formular für „Agenturen" fiel auf, dass Admin dort Branding UND
  das Passwort der Agentur selbst setzen konnte — Nutzer-Einwand: Admin
  soll eine Agentur **nur anlegen und einladen**, sonst nichts; Branding
  und Zugangsdaten sind Sache der Agentur selbst. Nachfrage, ob das
  Passwort-Setzen mit dem Admin-Notfallzugriff zusammenhängt — Antwort:
  nein, der Notfallzugriff kommt bereits vollständig aus der
  Admin-Rolle selbst (sieht/verwaltet ohnehin alles), unabhängig davon,
  ob Admin das Agentur-Passwort kennt. Umgesetzt: neuer Endpunkt
  `POST /api/agencies/:id/invite` (`backend/src/server.js`) — 1:1
  derselbe Mechanismus wie `inviteRestaurant()` bei Kunden (7 Tage
  gültiger `setup_token`, E-Mail mit Link, Agentur setzt ihr Passwort
  selbst über den bestehenden `/api/public/setup-password`-Endpunkt).
  `PATCH /api/agencies/:id` kann jetzt **kein Passwort mehr setzen** —
  Admin darf dort nur noch Name/Domain/Login-E-Mail ändern (Kontaktdaten
  für die Einladung), Branding ist exklusiv für die Agentur selbst
  (per `agencyScope`-Check). Neuer Endpunkt
  `PATCH /api/agencies/:id/credentials` (Agentur ändert eigene
  Login-E-Mail/Passwort, Pflicht-Bestätigung des aktuellen Passworts —
  exakt dasselbe Muster wie `PATCH /api/restaurants/:id/credentials` bei
  Kunden). Admin hat auf diesen Endpunkt bewusst **keinen** Zugriff (403),
  damit Admin nie ein Agentur-Passwort setzt oder kennt — falls eine
  Agentur wirklich ausgesperrt ist, löst Admin stattdessen einfach eine
  neue Einladung aus (regeneriert den Token, alter Link wird ungültig).
  Frontend: Admin-Ansicht „Agenturen" zeigt jetzt nur noch Anlegen-
  Formular (Name/Domain/Login-E-Mail) + Liste mit Status
  („keine Login-E-Mail" / „Einladung ausstehend" / „✅ aktiv") +
  „Einladung senden"/„Neue Einladung senden"-Button — keine Branding-
  oder Passwort-Felder mehr sichtbar. Neuer Menüpunkt „Branding" im
  Kunden-Dashboard, sichtbar **nur** für `role: 'agency'` (neues
  `agencyOnly`-NAV-Flag) — zeigt der eingeloggten Agentur ihr eigenes
  Branding-Formular (Produktname/Assistentenname/Logo/Akzentfarbe) und
  ein Zugangsdaten-Formular (Login-E-Mail/Passwort ändern, mit
  aktuellem-Passwort-Bestätigung). Neuer n8n-Workflow
  `16-agentur-eingeladen.json` (analog Workflow 10) verschickt die
  Einladungsmail. Lokal komplett gegen frische Test-DB end-to-end
  verifiziert: Agentur anlegen → Einladung senden → Status wechselt auf
  „ausstehend" → Passwort per Link setzen → Status wechselt auf „aktiv"
  → Login funktioniert; Agentur kann eigenes Branding ändern, aber nicht
  Name/Domain; Admin kann Branding **nicht** mehr setzen (400 „no
  fields"); Agentur kann eigene Zugangsdaten nur MIT korrektem aktuellem
  Passwort ändern, Admin bekommt auf den Credentials-Endpunkt 403. Per
  Playwright bestätigt: Admin-Ansicht enthält keine Farb-/Passwort-Felder
  mehr, Agentur-Nav zeigt nur „Kunden" + „Branding" (kein „Agenturen"-Tab
  sichtbar). `dashboard/`-Build fehlerfrei, i18n-Schlüsselparität (320
  Keys) über alle 3 Sprachen bestätigt. **Committet+gepusht, laut Nutzer
  am 25.08.2026 auf dem Produktivserver ausgerollt.**
- **Venezia-Demo-Daten: automatischer wöchentlicher Refresh (25.08.2026):**
  Nutzer-Wunsch nach dem Deploy-Rückstand-Überblick: Demo-Daten (noch)
  nicht löschen, stattdessen soll das Test-Restaurant Venezia für
  Vorführungen/Verkaufsgespräche immer "frisch" aussehen — alte Einträge
  raus, neue für die jeweils aktuelle Woche rein, automatisch jede Woche.
  Neues Skript `backend/scripts/refresh-venezia-demo-data.js`: löscht
  zuvor selbst erzeugte Einträge (erkennbar am `[AUTO-DEMO]`-Marker in
  `notes`/`summary` — nur diese, damit echte/manuelle Testeinträge nicht
  versehentlich mitgelöscht werden) und legt frische Reservierungen
  (18, Mittag/Abend gemischt, Status je nach Zeitpunkt vergangen/
  zukünftig), Bestellungen (8, echte Pizzanamen aus der Venezia-
  Speisekarte) und Anrufe (bis zu 14, nur in der Vergangenheit, realistische
  deutsche Zusammenfassungen) für die aktuelle Kalenderwoche
  (Montag-Sonntag, `mondayOf()` — dieselbe Logik wie im bestehenden
  `WeekCalendar`) an. Läuft wöchentlich per neuem systemd-Timer
  `ki-works-demo-refresh.timer` (Montag 04:00 Uhr, analog zum
  bestehenden `ki-works-backup.timer`) — bewusst **nicht** in
  `deploy/install.sh` eingebunden, da das eine rein temporäre
  Vorführungs-Maßnahme ist und nicht Teil eines dauerhaften
  Server-Setups sein soll. Lokal gegen Test-DB verifiziert: erster Lauf
  legt 18/8/5 Einträge an, zweiter Lauf löscht diese sauber wieder und
  erzeugt eine neue Runde (idempotent, kein Datenmüll). **Wichtig, in
  „Offene Punkte" vermerkt:** vor dem echten Live-Gang muss der Timer
  deaktiviert und alle `[AUTO-DEMO]`-Einträge final gelöscht werden.
  **Committet+gepusht, noch NICHT auf dem Produktivserver eingerichtet**
  — braucht normalen rsync/Build-Schritt plus einmalig:
  ```
  install -m 644 /opt/ki-works/deploy/systemd/ki-works-demo-refresh.service /etc/systemd/system/
  install -m 644 /opt/ki-works/deploy/systemd/ki-works-demo-refresh.timer /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable --now ki-works-demo-refresh.timer
  ```
  Einmaliger sofortiger Testlauf (optional): `systemctl start
  ki-works-demo-refresh.service`.
- **Datenschutzerklärung aktualisiert (23.08.2026):** Nutzer brachte einen
  fertigen Änderungsauftrag mit (Verantwortlicher-Platzhalter, Drittland-
  Übermittlung, KI-Transparenz-Abschnitt) — vor Umsetzung gegengeprüft
  statt blind übernommen. Dabei zwei Punkte am Auftragstext korrigiert:
  (1) der vorgeschlagene Satz hätte pauschal für Anthropic, Vapi UND
  Twilio ein "SCC-basiertes DPA" behauptet — Recherche ergab, dass das
  nur für Anthropic und Twilio stimmt (siehe Vapi-DPA-Lücke oben), daher
  Vapi bewusst ausgeklammert; (2) der interne "bitte rechtlich
  prüfen"-Hinweis sollte laut Auftrag komplett gelöscht werden, wurde
  stattdessen nur verengt (bleibt sichtbar, bis Verantwortlicher-
  Platzhalter ausgefüllt UND Vapi-Frage geklärt ist) — sonst hätte die
  Seite eine unbelegte Aussage ohne jede Einschränkung mehr enthalten,
  dieselbe Fehlerklasse wie die früheren Überkorrekturen
  (Sicherheitsversprechen, Integrationsliste). Umgesetzt in
  `landing/src/pages/Datenschutz.jsx`: Verantwortlicher-Platzhalter
  jetzt explizit als Alex-Todo markiert; Abschnitt 5 nennt Anthropic und
  Twilio konkret mit Link zum Twilio-DPA; neuer Abschnitt 9
  "KI-Transparenz" (Art. 50 EU-KI-Verordnung) ergänzt. Lokal per
  `npm run build` + Grep im Prerender-Output verifiziert. Committet und
  gepusht, normaler rsync/Build-Ablauf für `landing/` reicht (kein
  Backend-Neustart nötig).
- **Preise-Sektion: vierte "Custom"-Karte ergänzt (24.08.2026):**
  Nutzer-Nachfrage, ob eine zusätzliche Preiskarte ohne Preis ("Custom",
  nur "Kontaktieren Sie uns") sinnvoll wäre — bejaht, da die bestehende
  Preise-Fußnote ("Individuelles Paket gewünscht? Sprechen Sie uns an")
  leicht übersehen wird, wenn jemand nur die 3 Karten überfliegt.
  Umgesetzt in `landing/src/App.jsx`: neue vierte Karte nach Solo/Team/
  Scale, bewusst schlicht gehalten (kein Preis, keine Feature-Liste, kein
  SLA-Versprechen — dafür gibt es aktuell keine Substanz, nur ein
  Gesprächsangebot), Raster von `md:grid-cols-3` auf
  `md:grid-cols-2 lg:grid-cols-4` erweitert. Das bestehende
  `pricingTiers`-Array bewusst unangetastet gelassen (die Custom-Karte
  ist eine eigenständige JSX-Karte daneben) — der ROI-Rechner nutzt
  dasselbe Array für seine Berechnungen und hätte bei einem Preis-/
  Minuten-losen Eintrag NaN-Ergebnisse geliefert. Neue i18n-Keys
  (`pricing.customName/customPrice/customDesc/customCta`) in allen 3
  Sprachen ergänzt. Lokal per `npm run build` + Playwright-Screenshots
  (Light/Dark/Mobile) verifiziert — Layout bleibt sauber, Custom-Karte
  richtet sich unten am CTA-Button aus wie die anderen Karten. Committet
  und gepusht, normaler rsync/Build-Ablauf für `landing/` reicht (kein
  Backend-Neustart nötig).
  **Nachbesserung (24.08.2026), von Nutzer live auf ki-works.eu per
  Screenshot gemeldet:** Button klebte auf Mobile direkt am
  Beschreibungstext, kaum Abstand — der lokale Screenshot-Test
  hatte das nicht aufgedeckt, weil `mt-auto` (für die Button-Ausrichtung
  am Desktop-Grid, wo GlowCards durch die Zeilendehnung echte Zusatzhöhe
  haben) auf Mobile ohne Zeilendehnung zu 0 Margin auflöst. Fix: fester
  Abstand `mt-6` wie bei den anderen drei Karten statt `mt-auto` +
  `flex-1`. Per Playwright erneut auf Mobile UND Desktop verifiziert,
  committet und gepusht.
- **Preise-Sektion: Feature-Texte konkreter formuliert (25.08.2026):**
  löst den seit 13.08.2026 offenen Copy-Pass ein. Die generischen
  Feature-Punkte pro Tarif ("Dashboard: Reservierungen, Bestellungen &
  Anrufe", "E-Mail-Benachrichtigungen bei Neuem", "EU-Hosting & DSGVO-
  konform") durch konkrete Nutzenformulierungen ersetzt (z. B. "Nie
  wieder eine Reservierung oder Bestellung verpassen — alles live im
  Dashboard", "Sofort per E-Mail informiert, sobald ein Gast anruft,
  reserviert oder bestellt"). Nur Textänderung in `landing/src/i18n/
  de/en/ro.json` (`pricing.tiers.*.features`), keine Struktur-/Preis-
  Änderung. Committet und gepusht, normaler rsync/Build-Ablauf für
  `landing/` reicht (kein Backend-Neustart nötig).
- **Kunden-Dashboard-Sektion überarbeitet: Nav-Link, echte Screenshots,
  Vertrauensargumente (25.08.2026):** Antwort auf die Nutzer-Beobachtung
  "Auf Homepage ist nichts über Kunden Dashboard" — die Sektion existierte
  zwar (`id="dashboard"`), war aber eine Sackgasse ohne Nav-Zugang und
  zeigte nur einen generischen Icon-Mock statt eines echten Beweises.
  Vor der Umsetzung als Vorschau-Artifact durchgespielt und über mehrere
  Nutzer-Feedback-Runden verfeinert (Screenshots statt Mockup, Transkript-
  Karte-Positionierung, `overflow-hidden`-Clipping-Bug behoben), danach
  1:1 in den echten Code übernommen. Umgesetzt: (1) Nav-Eintrag
  "Dashboard" in `Header.jsx` (Desktop + Mobile, zwischen "Live testen"
  und "Plattform" — passend zur tatsächlichen Sektionsreihenfolge auf der
  Seite). (2) **Echte Screenshots statt Mock**: lokal Postgres+Backend+
  `dashboard/`-Dev-Server mit den Venezia-Demodaten hochgefahren, per
  echtem Kunden-Login (nicht Admin-Bypass, damit die Sidebar exakt das
  zeigt, was ein Restaurant-Kunde sieht — keine admin-only Menüpunkte)
  zwei Screenshots erzeugt (Übersicht mit Ersparnis-Kachel, ein
  Anruf-Detail mit echtem Transkript), als WebP komprimiert (~1,1 MB PNG
  → ~50-85 KB) und in `landing/public/screenshots/` (je Light/Dark)
  abgelegt — themenabhängig eingeblendet über `dark:hidden`/`dark:block`.
  (3) Vier konkrete Vertrauensargumente (nachhören/nachlesen mit
  Transkript, Speisekarte/Öffnungszeiten/FAQ selbst ändern, sofort
  benachrichtigt, Ersparnis schwarz auf weiß) ersetzen die vorherigen
  generischen Feature-Punkte — neuer i18n-Aufbau `dashboardSection.
  trustPoints` (Array aus `{title, desc}` statt reiner String-Liste) in
  allen 3 Sprachen. Der ursprünglich von mir vorgeschlagene Satz "Sie
  sind keiner Blackbox ausgeliefert" wurde auf Nutzer-Wunsch gestrichen
  (zu abstrakt/technisch) — die Screenshots transportieren das jetzt
  visuell. Die schwebende Transkript-Karte ist responsiv: ab `md:`
  überlappt sie den unteren Rand der Übersicht (wie im Entwurf), auf
  Mobile stapelt sie sich stattdessen vollbreit darunter (sonst hätte sie
  auf schmalen Screens einen Großteil der Übersicht verdeckt). Lokal per
  Playwright verifiziert: Build fehlerfrei, Light/Dark auf Desktop UND
  Mobile korrekt, Nav-Link scrollt zur Sektion, mobiles Menü zeigt den
  neuen Eintrag. Committet und gepusht, normaler rsync/Build-Ablauf für
  `landing/` reicht (kein Backend-Neustart nötig, keine Migration).
  **Sofort-Fix nach dem Live-Rollout (25.08.2026):** Nutzer meldete
  kaputte Bilder (nur Alt-Text sichtbar) auf dem echten Server, obwohl
  der Build/die lokale Preview fehlerfrei liefen. Ursache: die
  Screenshots lagen unter `landing/public/dashboard-preview/`, aber
  `deploy/nginx/ki-works.conf` hat `location /dashboard` (**ohne**
  abschließenden Slash) für die eigentliche Dashboard-App — ein reiner
  String-Präfix-Match in nginx, der dadurch auch `/dashboard-preview/…`
  fälschlich auf `/opt/ki-works/dashboard/dist` umleitete. Behoben ohne
  nginx-Änderung (bewusst, siehe Ausfall-Historie unten zu diesem
  Config-Bereich): Ordner nach `landing/public/screenshots/` umbenannt
  (Pfad beginnt nicht mehr mit "dashboard"), vier `<img src>`-Stellen in
  `App.jsx` angepasst. Committet und gepusht, normaler rsync/Build-Ablauf
  für `landing/`. **Für später vorgemerkt (nicht dringend, kein aktives
  Problem mehr):** `location /dashboard`/`location /intern` in
  `deploy/nginx/ki-works.conf` fehlt der eigentlich nginx-übliche
  abschließende Slash (`location /dashboard/`) — ohne den matcht der
  Präfix jeden Pfad, der mit diesem String beginnt, nicht nur den
  eigentlichen Unterordner. Kein akuter Fehler mehr (der auslösende
  Ordnername existiert nicht mehr), aber die zugrunde liegende
  Config-Falle bleibt bestehen, falls je wieder ein Pfad wie
  `/dashboard-irgendwas` oder `/intern-irgendwas` entsteht.
  **Screenshots jetzt pro Sprache (26.08.2026):** Nutzer-Fund per
  RO-Ansicht — die eingebrannten Dashboard-Screenshots blieben bisher
  immer Deutsch, unabhängig von der gewählten Website-Sprache (nur der
  Text drumherum wechselte). Zusätzlich zu den bestehenden DE-Bildern
  (umbenannt auf `overview-de-*`/`call-de-*`) per selbem lokalen
  Testaufbau (Postgres+Backend+`dashboard/`-Dev-Server, echter
  Kunden-Login) auch EN- und RO-Versionen erzeugt — Dashboard über
  `?lang=en`/`?lang=ro` aufgerufen (dashboard-eigener
  Mehrsprachigkeits-Support, siehe Mehrsprachigkeit-Eintrag), macht
  daraus je Light/Dark einen Screenshot. **Korrektur (26.08.2026):** der
  Anruf-Zusammenfassungs-/Transkript-Inhalt im Screenshot blieb zunächst
  Deutsch (Begründung: Kiwo telefoniert aktuell nur Deutsch) — Nutzer wies
  zu Recht darauf hin, dass das kein echter Anruf ist, sondern von mir
  erfundener Demo-Inhalt für den Screenshot (genau wie die ohnehin schon
  dreisprachigen Beispiel-Gespräche im "Live testen"-Abschnitt) und daher
  genauso übersetzt werden sollte. Zusammenfassung+Transkript für EN/RO
  nachträglich übersetzt, Screenshots neu erzeugt. `App.jsx` wählt die
  Bilddatei dynamisch über die aktuelle `locale`
  (`/screenshots/overview-${locale}-{light,dark}.webp`) statt fixer
  Dateinamen. Lokal per Playwright auf allen 3 Sprachversionen verifiziert
  (korrekte `img[src]` pro Locale, keine fehlgeschlagenen Bild-Requests).
  Committet und gepusht, normaler rsync/Build-Ablauf für `landing/`.
- **Orb Buddy: Mausverfolgung im echten Code umgesetzt (29.08.2026)** —
  löst den zuvor offenen Punkt ein (Konzept war am 25.08.2026 nur in einem
  Test-Artifact durchgespielt worden). Finale, vom Nutzer per Screenshot
  bestätigte Werte ("so bleibt"): Glanz-/Blickreichweite 75%, Glätte/
  Trägheit 0.40, Parallax-Versatz 35px, Kugel-Glanz/Schatten bewegen sich
  NICHT mit (nur Augen/Pupillen/Mund + leichter Versatz der ganzen
  Figur). Umsetzung in `landing/src/components/OrbBuddy.jsx`: neuer
  optionaler `track`-Prop, aktiviert einen `pointermove`-Listener mit
  rAF-Ease-Loop (Zielwerte aus Mausposition, weich Richtung Ist-Wert
  angenähert, Loop stoppt automatisch bei Stillstand), respektiert
  `prefers-reduced-motion`. **Scope bewusst eingeschränkt** — auf
  Nutzer-Wahl ("Nur großer Hero-/CTA-Orb Buddy") läuft die Verfolgung
  ausschließlich an den zwei großen Instanzen in `landing/src/App.jsx`
  (Hero-Sektion, finale CTA-Sektion), NICHT an kleinen Instanzen wie dem
  Sidebar-Maskottchen in `dashboard/`/`business-dashboard/` oder dem
  Avatar im `ChatWidget.jsx` (dort bewusst kein `track`-Prop gesetzt).
  Technischer Kniff: die bestehende CSS-Keyframe-Animation fürs
  Schweben (`.orb-float`, `transform` auf dem `<svg>`) hätte mit einem
  zusätzlichen JS-gesetzten `transform` auf demselben Element kollidiert
  — der Parallax-Versatz landet daher auf einem separaten umschließenden
  `<span>`, das SVG selbst bleibt unangetastet. Lokal per
  `npm run build` (inkl. SSR-Prerender aller 9 Seiten, fehlerfrei) und
  per Playwright-Screenshot-Vergleich bei unterschiedlichen Mausposition
  verifiziert (sichtbare, korrekte Richtungsbewegung, Kreis bleibt rund,
  keine Konsolenfehler). Committet und gepusht, normaler rsync/Build-
  Ablauf für `landing/` reicht (kein Backend-Neustart nötig).
- **Dark/Light-Mode zwischen den 3 Apps getrennt (29.08.2026):** Nutzer-Fund
  — Theme-Wahl in `/intern` (Business-Dashboard) änderte auch die Landingpage
  und das Kunden-Dashboard. Ursache: alle 3 Apps (`landing/`, `dashboard/`,
  `business-dashboard/`) speicherten die Wahl unter demselben localStorage-
  Schlüssel `kiworks-theme` — da alle auf derselben Domain `ki-works.eu`
  laufen (nur andere Pfade `/`, `/dashboard/`, `/intern/`), teilen sie sich
  denselben Speicher (localStorage ist pro Origin, nicht pro Pfad). Fix: je
  eigener Schlüssel (`kiworks-theme-landing`/`-dashboard`/`-intern`) in
  `theme.js` jeder App plus dem jeweiligen Anti-Flacker-Inline-Script in
  allen 11 HTML-Einstiegspunkten (9× `landing/`, je 1× `dashboard/`/
  `business-dashboard/`). Jede App merkt sich ihre Theme-Wahl jetzt
  unabhängig. Alle 3 Builds fehlerfrei. Committet+gepusht, normaler
  rsync/Build-Ablauf für `landing/`+`dashboard/`+`business-dashboard/`
  (kein Backend-Neustart, keine Migration).
- **Freigaben pro Business-Karte statt gemeinsamer Meta-Liste (29.08.2026):**
  Nutzer-Fund/-Einwand nach dem ersten echten Social-Agent-Testlauf — die
  bisherige "Meta-Ansicht" oben im Business-Dashboard zeigte alle offenen
  `pending_actions` aller 4 Businesses gebündelt in einer Liste; Nutzer
  wollte das nicht ("soll n eigene Karte bleiben") — ki-works-, LEDTEK- und
  pixelpress-Freigaben sollen nicht vermischt erscheinen, sobald auch die
  anderen Businesses eigene Agenten bekommen. Ursache, warum das technisch
  nötig wurde: `pending_actions.restaurant_id` ist für alle internen
  Business-Agenten (Sales/Social) NULL, es gab bisher kein Feld, um die 4
  Businesses selbst zu unterscheiden. Fix nach demselben Muster wie
  `audit_log.business` (migration-020): neue Spalte
  `pending_actions.business` (`migration-027-pending-actions-business.sql`),
  `salesAgent.js`/`socialAgent.js` setzen jetzt `business: 'ki-works'` beim
  Insert, `GET /api/pending-actions` akzeptiert optional `?business=`
  (nur wirksam ohne `customerScope`, analog Audit-Log). Im Business-
  Dashboard: die bisherige globale `PendingActions`-Liste auf der
  Übersichtsseite entfernt, stattdessen zeigt jede Business-Karte
  (`BusinessDetail`) ihre eigene, nach `business.id` gefilterte
  Freigaben-Liste direkt unter den Agenten-Buttons — genau wie das
  bestehende `BusinessAuditLog`-Muster darunter. Funktioniert automatisch
  für künftige Agenten anderer Businesses, ohne weitere Code-Änderung
  (gleiches "generisch pro Karte"-Prinzip wie beim Audit-Log). Beide
  Builds (`backend` Syntax-Check, `business-dashboard`) fehlerfrei.
  Committet+gepusht, braucht zusätzlich zum normalen rsync/Build-Ablauf
  für `business-dashboard/` die neue Migration
  `migration-027-pending-actions-business.sql` und einen Backend-Neustart
  (`server.js`/`salesAgent.js`/`socialAgent.js` geändert).
  **Dabei außerdem gefunden:** der erste echte Social-Agent-Testlauf schlug
  zunächst mit `ENOENT ... social-assets/...png` fehl — der Backend-Prozess
  auf dem Server lief noch mit einem alten Code-Stand von vor Einführung
  des `fs.mkdirSync(SOCIAL_ASSETS_DIR, ...)`-Anlegens (mehrere vorherige
  Deploy-Hinweise für reine `landing/`-Änderungen sagten bewusst "kein
  Backend-Neustart nötig", wodurch der Social-Agent-Code nie aktiv wurde).
  Behoben durch manuellen `mkdir -p .../social-assets` + `systemctl
  restart ki-works-api` auf dem Server — kein Code-Fehler, nur ausstehender
  Neustart. Erster echter Social-Agent-Lauf danach erfolgreich (Entwurf
  "Küche kocht, Kiwo telefoniert" erstellt, im Audit-Log sichtbar) — die
  Veröffentlichung selbst schlägt aktuell noch erwartungsgemäß mit "FB_PAGE_ID/
  FB_PAGE_ACCESS_TOKEN fehlen" fehl, siehe Social-Media-Automatisierung-
  Abschnitt („Noch offen").
- **Social-Post-Vorschau: Bild-Download-Link ergänzt (29.08.2026):** da
  TikTok/LinkedIn bewusst nicht automatisch bespielt werden (App-Review-
  Aufwand, siehe unten), aber Facebook/Instagram schon, brauchte die
  Freigabe-Vorschau eine Möglichkeit, das erzeugte Bild für den manuellen
  Upload woanders herunterzuladen. `SocialPostDetail` im
  Business-Dashboard zeigt jetzt einen "⬇ Bild herunterladen"-Link über
  dem Bild (echter `<a download>`-Link auf die bereits öffentlich
  erreichbare `imageUrl`). Reine Frontend-Ergänzung, kein Backend-/
  Migrationsbedarf. Committet+gepusht, normaler rsync/Build-Ablauf für
  `business-dashboard/` reicht.
- **Deploy-Bug behoben: rsync löschte social-assets bei jedem Deploy
  (29.08.2026):** Nutzer meldete "Datei ist auf der Website nicht
  verfügbar" beim Bild-Download — `ls
  /opt/ki-works/backend/public/social-assets/` zeigte den Ordner
  nicht mehr, obwohl er kurz zuvor per Backend-Neustart angelegt worden
  war. Ursache: der zentrale Deploy-Befehl in diesem Dokument
  (`rsync -a --delete ...`) spiegelt `/root/ki-works-src` 1:1 nach
  `/opt/ki-works` — der Ordner `backend/public/social-assets/` ist aber
  zur Laufzeit erzeugter Content, kein Git-Inhalt, wird also bei JEDEM
  Deploy (auch reinen `landing/`- oder `business-dashboard/`-Änderungen)
  automatisch mitgelöscht. Der Ordner tauchte nur kurz nach einem
  Backend-Neustart wieder auf (der ihn per `fs.mkdirSync` am Programmstart
  neu anlegt) und verschwand beim nächsten Deploy ohne Neustart erneut.
  **Doppelt behoben:** (1) der Deploy-Befehl oben im Dokument hat jetzt
  `--exclude backend/public/social-assets`, damit rsync diesen Ordner nie
  wieder anfasst; (2) zusätzlich `fs.mkdirSync(assetsDir, {recursive:
  true})` direkt vor jedem `writeFileSync` in `socialAgent.js` und dem
  `/api/webhooks/social-post`-Handler in `server.js` ergänzt (Verteidigung
  in der Tiefe — der Ordner wird jetzt bei jedem einzelnen Bild-Schreiben
  notfalls neu angelegt, nicht nur einmal beim Serverstart). Committet+
  gepusht, braucht Backend-Neustart (server.js/socialAgent.js geändert)
  UND — wichtig — beim nächsten Deploy den **neuen** rsync-Befehl mit dem
  `--exclude` verwenden, sonst tritt der Bug ein letztes Mal auf, bevor er
  behoben ist.
- **Social-Post-Vorschau vereinfacht (29.08.2026):** Nutzer nutzt aktuell
  (bis Facebook/Instagram-Zugangsdaten hinterlegt sind, siehe unten) den
  manuellen Weg: Bild herunterladen + Beitragstext kopieren, direkt in
  Facebook einfügen. Die separaten Vorschau-Felder "Headline im Bild" und
  "Subline im Bild" in `SocialPostDetail` waren dafür überflüssig (der
  Text steht ja schon im heruntergeladenen Bild) — entfernt. Stattdessen
  neuer "📋 Text kopieren"-Button direkt neben dem Beitragstext-Feld
  (`navigator.clipboard.writeText`), damit Bild-Download + Copy-Paste in
  zwei Klicks erledigt ist. Committet+gepusht, normaler rsync/Build-Ablauf
  für `business-dashboard/` reicht.
- **Sales-Freigabe legt Mail-Entwurf direkt im Postfach an (29.08.2026):**
  Nutzer-Frage "was passiert nach Freigabe" deckte auf, dass "Freigeben"
  bei Sales-Akquise-Mails bisher rein kosmetisch war (nur Status auf
  "approved", kein Versand, kein Entwurf — Betreff/Text mussten manuell
  aus der aufgeklappten Zeile kopiert werden, bevor man freigibt, sonst
  waren sie weg). Neu: `backend/src/mailDraft.js` (`createSalesDraft()`)
  legt bei Freigabe einer `role: 'sales'` + `kind: 'outreach_email'`-Aktion
  die Mail direkt als **Entwurf im Postfach info@ki-works.eu** an (IMAP
  APPEND ins Drafts-Verzeichnis, per `imapflow`; die eigentliche
  MIME-Nachricht wird mit `nodemailer`s Stream-Transport korrekt
  UTF-8-codiert erzeugt) — **kein automatischer Versand**, der letzte
  Klick "Senden" bleibt bewusst manuell (Kalt-E-Mail-Versand in der EU ist
  rechtlich heikel, siehe „Akquise-Agent"-Konzept). Neue Env-Variablen
  `KIWORKS_MAIL_IMAP_HOST`/`_PORT`/`_USER`/`_PASSWORD` (Postfach liegt bei
  einem Hosting-Reseller, IMAP-Host `cloud10.helloly.hosting`, Port 993
  SSL/TLS — kein Gmail/Google Workspace, daher IMAP statt Gmail-API nötig).
  Entwurf-Anlage ist bewusst **reine Komfort-Zusatzaktion, nicht
  blockierend**: schlägt IMAP fehl (Zugangsdaten fehlen/falsch, Postfach
  nicht erreichbar) oder fehlt die Kontakt-E-Mail im Lead, bleibt die
  Freigabe trotzdem wirksam (Status wechselt auf "approved") — der Admin
  bekommt nur eine `alert()`-Warnung im Business-Dashboard, nichts geht
  verloren, aber auch kein Text mehr abrufbar (dann bleibt nur noch
  manuelles Kopieren vor einem erneuten Freigabe-Versuch, siehe „Offene
  Punkte"). Button für Sales-Zeilen zeigt jetzt "✅ Freigeben & Entwurf
  anlegen" statt nur "✅ Freigeben". `GET /me/accounts`-artiges Vorgehen
  wie bei Meta gab es hier nicht nötig — IMAP-Zugangsdaten kommen direkt
  vom Nutzer, nicht per OAuth. Lokal nur Syntax-/Import-Check möglich
  (`node --check`, `node -e "import(...)"`) — ein echter Lauf gegen das
  reale Postfach erfordert die IMAP-Zugangsdaten, die der Nutzer noch
  nicht geteilt hat (bewusst nicht im Chat, sondern direkt auf dem Server
  einzutragen, siehe „Offene Punkte"). `business-dashboard`-Build
  fehlerfrei. Committet+gepusht, braucht Backend-Neustart
  (`server.js` geändert, neue `imapflow`/`nodemailer`-Abhängigkeiten) UND
  die 4 neuen Env-Variablen in `/etc/ki-works/ki-works.env`.
  **Nachbesserung (29.08.2026), Nutzer-Feedback nach Live-Test:** der
  Button zeigte "✅ Freigeben & Entwurf anlegen" für JEDE Sales-Zeile,
  auch wenn `contact_email` fehlte (Sales-Agent findet nicht immer eine
  öffentliche Mail-Adresse) — Nutzer erwartete zurecht, dass so ein Fall
  vorher sichtbar ist statt erst nach dem Klick per Warnung aufzufallen.
  Zeile zeigt jetzt "⚠ keine E-Mail gefunden" unter der Zusammenfassung
  und der Button-Text fällt in dem Fall auf schlichtes "✅ Freigeben"
  zurück (kein leeres Versprechen mehr). Committet+gepusht, normaler
  rsync/Build-Ablauf für `business-dashboard/` reicht.
- **Sales-Agent-E-Mail-Suche verschärft + editierbare Sales-Vorschau
  (29.08.2026):** Nutzer wies den ersten Fix (nur Hinweis auf Impressum
  prüfen) klar zurück — der Agent sieht die Website bereits per
  `web_fetch`, es gibt keinen Grund für "keine E-Mail gefunden", solange
  er nicht aktiv Footer/Impressum/Kontakt-Seite durchsucht (in AT/DE ist
  eine E-Mail-Adresse dort gesetzlich vorgeschrieben). `buildPrompt()` in
  `backend/src/salesAgent.js` verlangt jetzt eine klare Schrittfolge vor
  `contact_email: null` (Footer prüfen → Impressum-/Kontakt-Unterseiten
  gezielt per `web_fetch` laden → erst danach `null` erlauben), `null`
  soll die Ausnahme sein, nicht der Normalfall. `web_fetch`-`max_uses`
  von 15 auf 20 erhöht (mehr Unterseiten pro Kandidat). Zusätzlich, wie
  vom Nutzer gefordert: neue `SalesEmailDetail`-Komponente im
  Business-Dashboard (analog `SocialPostDetail`) — Betreff und Text vor
  der Freigabe editierbar, dazu einzelne "📋 Kopieren"-Buttons für
  Betreff/Text/Kontakt-E-Mail (`CopyFieldButton`, `navigator.clipboard`),
  damit nichts verloren geht, bevor freigegeben wird. Sales-Zeilen zeigen
  jetzt wie Social-Posts einen "👁 Vorschau & Freigabe"-Umschalter statt
  direkter Freigeben/Ablehnen-Buttons in der Zeile. Freigeben schickt
  `{status, payload: {subject, body}}` — nutzt die bereits bestehende
  `payloadEdit`-Merge-Logik in `PATCH /api/pending-actions/:id`, keine
  Backend-Änderung nötig außer der schon vorhandenen `mailDraftWarning`-
  Anzeige (jetzt auch hier verdrahtet). Lokal verifiziert: `node --check`
  für `salesAgent.js`, `business-dashboard`-Build fehlerfrei — kein
  echter Sales-Agent-Testlauf (würde laut Standing Rule echtes
  Anthropic-/Websuche-Guthaben kosten), Nutzer prüft die verbesserte
  Trefferquote beim nächsten eigenen "Sales-Agent starten". Committet+
  gepusht, braucht Backend-Neustart (`salesAgent.js` geändert) plus
  normalen `business-dashboard/`-Build.
- **Sales-Agent: Ort/Region vor dem Start einstellbar (29.08.2026):**
  Nutzer-Wunsch — das Zielgebiet war bisher hartcodiert
  ("Schwertberg / Mühlviertel / Oberösterreich" als `TARGET_PROFILE`-
  Konstante in `backend/src/salesAgent.js`). Jetzt optionales Textfeld
  "Ort/Region" über dem "Sales-Agent starten"-Button im
  Business-Dashboard (`SalesAgentRunner`) — leer lassen behält den
  bisherigen Standard bei. `runSalesAgent({maxCandidates, region})`
  reicht den Wert an `buildTargetProfile(region)` durch, das den
  Prompt-Absatz "Zielprofil" dynamisch zusammensetzt statt der fixen
  Konstante. `POST /api/sales-agent/run` nimmt `region` optional entgegen
  (serverseitig auf 200 Zeichen begrenzt, getrimmt). Audit-Log-Eintrag
  pro Lauf enthält jetzt auch die verwendete Region. Lokal nur Syntax-/
  Build-Check möglich (kein echter Testlauf, siehe Standing Rule
  Nutzungsguthaben). Committet+gepusht, braucht Backend-Neustart
  (`salesAgent.js`/`server.js` geändert) plus normalen
  `business-dashboard/`-Build.
- **504-Fehler beim Sales-Agent behoben: nginx-Timeout für /api/ erhöht
  (29.08.2026):** Nutzer meldete "Fehler: HTTP 504" beim Klick auf
  "Sales-Agent starten". Ursache: `location /api/` in
  `deploy/nginx/ki-works.conf` hatte kein `proxy_read_timeout` gesetzt,
  nginx bricht dann nach seinem 60s-Standardwert ab — ein Sales-Agent-
  Lauf mit mehreren Websuchen + (seit der E-Mail-Suche-Verschärfung von
  heute) zusätzlichen Impressum-/Kontakt-Seiten-Abrufen dauert oft
  länger. Der Lauf selbst läuft im Backend trotzdem zu Ende durch (das
  504 kommt nur von nginx, nicht vom Node-Prozess) — das Ergebnis landet
  also meist trotzdem in `pending_actions`, nur die Erfolgsmeldung im
  Business-Dashboard fehlt dann. Fix: `proxy_read_timeout 300s;`/
  `proxy_send_timeout 300s;` für `location /api/` ergänzt (gleicher Wert
  wie beim bestehenden n8n-Block). **Nginx-Config wird NICHT automatisch
  per rsync ausgerollt** (liegt unter `/etc/nginx/`, außerhalb von
  `/opt/ki-works`) — nach dem Push muss die aktualisierte Datei manuell
  auf den Server kopiert werden (siehe Deploy-Hinweis unten). Committet+
  gepusht.
- **Sales-Mail-Vorschau: volle Breite + feste Signatur (29.08.2026):**
  zwei Nutzer-Funde nach dem ersten echten Sales-Agent-Testlauf (Region
  "Perg Stadt" — Trefferquote für Kontakt-E-Mails deutlich besser, wie
  gehofft). (1) Die neue `SalesEmailDetail`-Vorschau nutzte versehentlich
  dieselbe CSS-Klasse (`social-post-detail`) wie die Social-Post-Vorschau
  — die reserviert per Grid eine feste 200px-Bildspalte links; ohne Bild
  landete der komplette Inhalt (Website/Begründung/Betreff/Text) in dieser
  schmalen Spalte statt die volle Zeilenbreite zu nutzen. Neue eigene
  Klasse `.sales-email-detail` (vollbreit, kein Bild-Raster) behebt das,
  zusätzlich CSS-Fix, dass auch das Betreff-`<input>` (nicht nur die
  Text-`<textarea>`) `width: 100%` bekommt. (2) Mails endeten bisher ohne
  einheitliche Signatur (z. B. nur "Herzliche Grüße ins Machland", kein
  Name) — neue feste `SIGNATURE`-Konstante in `backend/src/salesAgent.js`
  ("Freundliche Grüße / Alex von ki-works.eu / Tel. +43 650 9915759 /
  info@ki-works.eu"), Prompt verlangt jetzt, dass jede Mail exakt damit
  endet. Lokal nur Build-/Syntax-Check möglich (kein echter Testlauf).
  Committet+gepusht, braucht Backend-Neustart (`salesAgent.js` geändert)
  plus normalen `business-dashboard/`-Build.
- **Sales-/Social-Agent generisch für mehrere Businesses: LEDTEK +
  pixelpress bekommen dieselben Agenten wie ki-works (29.08.2026):**
  Nutzer-Wunsch, dieselben Kiwo-Agenten auch für LEDTEK und pixelpress zu
  nutzen (waren bisher Business-Dashboard-Karten ohne Funktion). Auf
  Rückfrage entschieden: (1) Architektur generisch umbauen statt Dateien
  zu duplizieren, (2) beide Agenten (Sales + Social) für beide neuen
  Businesses, (3) noch kein Auto-Publish auf Facebook/Instagram für
  LEDTEK/pixelpress (nur Bild+Text zum manuellen Download/Copy-Paste, wie
  aktuell schon TikTok/LinkedIn bei ki-works). Neue Registry
  `backend/src/businessProfiles.js` (`BUSINESS_PROFILES`,
  `getBusinessProfile()`) — pro Business: Markenstimme (`brandBrief`),
  Verkaufsargument (`productPitch`), Ziel-Region-Default
  (`targetProfileDefault`), Zielgruppe (`targetKind`),
  Qualifizierungskriterien, Mail-Signatur, Social-Themen-Startausschluss
  (`seedTopics`) — analog zu `ROLE_BLOCKS` in `vapiAdmin.js`, neues
  Business = neuer Registry-Eintrag, kein Umbau der Agenten-Kernlogik.
  `backend/src/salesAgent.js`/`socialAgent.js` lesen jetzt aus der
  Registry statt hartcodierter ki-works-Konstanten, `runSalesAgent()`/
  `runSocialAgent()` bekommen einen Pflicht-`business`-Parameter. Dabei
  einen **echten Bug gefunden und gefixt**: die Kandidaten-/Themen-
  Dedupe-Queries filterten bisher NICHT nach `business` — ein LEDTEK-Lauf
  hätte fälschlich gegen ki-works-Kandidaten/-Themen abgeglichen (jetzt
  `AND business = $1`). `POST /api/sales-agent/run`/`social-agent/run`
  validieren `business` gegen die Registry (400 bei unbekanntem Wert).
  **Sicherheits-Fix in `PATCH /api/pending-actions/:id`:** der Facebook/
  Instagram-Publish-Versuch und die IMAP-Mail-Entwurf-Anlage liefen
  bisher unabhängig vom `business`-Feld der Aktion, nutzten aber fest die
  ki-works-Zugangsdaten — ohne Fix hätte eine LEDTEK-/pixelpress-Freigabe
  versehentlich versucht, auf KI-Works' eigenem Postfach/Facebook-Auftritt
  zu landen. Beide Blöcke prüfen jetzt `action.business === 'ki-works'`,
  für andere Businesses bleibt die Freigabe wirksam, nur ohne Publish-/
  Entwurf-Versuch (Warnhinweis statt stillem Fehlschlag). Im Business-
  Dashboard: `SalesAgentRunner`/`SocialAgentRunner` schicken jetzt einen
  `business`-Parameter mit, `BusinessDetail` zeigt die Agenten-Buttons für
  `['ki-works', 'ledtek', 'pixelpress']` (Memcore bleibt "noch nicht
  verknüpft", kein Registry-Eintrag), Freigabe-/Aktivitätsprotokoll-
  Listen filtern bereits generisch über `business.id`, keine Änderung
  nötig. **Wichtiger Vorbehalt zu den Inhalten:** LEDTEK-/pixelpress-
  Markenstimme, Zielprofil und Mail-Signatur in der Registry sind
  sinnvolle Annahmen auf Basis bereits dokumentierter Fakten (siehe
  „Erste Social-Media-Inhalte für LEDTEK und pixelpress" weiter oben) —
  echte Kontaktdaten für LEDTEK/pixelpress fehlen, Signatur nutzt
  vorerst dieselben Alex-Kontaktdaten wie ki-works (einziges bekanntes,
  überwachtes Postfach). Nutzer sollte das nach dem ersten Testlauf
  gegenprüfen, exakt der gleiche iterative Ablauf wie bei der
  ki-works-Signatur. Lokal nur Syntax-/Build-Check möglich (kein echter
  Agenten-Testlauf, Standing Rule Nutzungsguthaben) — **Sitzung wurde
  zwischen Backend-Teil und Frontend-Teil durch ein erreichtes
  Claude-Code-Nutzungslimit unterbrochen** (Backend-Teil als klar
  markierter WIP-Commit "NICHT DEPLOYEN" zwischengesichert, dann nach
  Kontingent-Reset mit dem Frontend-Teil fortgesetzt). Committet+gepusht,
  braucht Backend-Neustart (`salesAgent.js`/`socialAgent.js`/`server.js`
  geändert) plus normalen `business-dashboard/`-Build, keine Migration
  nötig (`business`-Spalte existiert in `pending_actions`/`audit_log`
  bereits).
  **Echte Kontaktdaten für LEDTEK/pixelpress nachgetragen (29.08.2026):**
  Nutzer hat die echten Signatur-Daten geliefert — LEDTEK: Tel.
  +43 650 9915759, kontakt@ledtek.at; pixelpress: Tel. +43 650 9915759,
  hallo@pixelpress.at. `backend/src/businessProfiles.js` entsprechend
  angepasst (vorher Platzhalter mit info@ki-works.eu). Markenstimme/
  Zielprofil bleiben weiterhin Annahmen, nur die Kontaktdaten sind jetzt
  bestätigt. Committet+gepusht, braucht Backend-Neustart
  (`businessProfiles.js` geändert).
- **Partner-Landingpage (White-Label-Pitch) um FAQ + "Tage statt
  Monate"-Argument ergänzt (29.08.2026):** Nutzer hat voice-one.ai/
  white-label.html als Inspiration geteilt (per WebFetch analysiert).
  Übernommen: das Time-to-Market-Argument (dort "14 Tage vs. 12-18
  Monate Eigenentwicklung") als eigener, ehrlicher Hinweiskasten
  ("Tage statt Monate") direkt nach den White-Label-Punkten, sowie eine
  FAQ-Sektion (Accordion, 6 Fragen: Startgeschwindigkeit, Sichtbarkeit
  von ki-works, Kundenkontakt, Preise, DSGVO, Entwicklungsaufwand) am
  Seitenende vor dem CTA. **Bewusst NICHT übernommen** (Vorbild-Seite ist
  für Enterprise-Reseller mit eigenem Vertriebsteam, passt nicht zur
  aktuellen Größe als Einzelunternehmer ohne erste aktive Agentur):
  SAML-SSO/SCIM, eigene Stripe/Paddle-Self-Service-Anbindung, dedizierter
  Customer Success Manager, eigene Mobile-App, ISO-27001-Briefings,
  Mindestbestellmenge — das wäre dieselbe Fehlerklasse wie die früher
  korrigierten überzogenen Versprechen. FAQ-Antworten bewusst nur mit
  bereits an anderer Stelle belegten Fakten (EU-Hosting/TLS, wie in der
  Datenschutzerklärung) statt neuer, ungeprüfter Zusagen. `landing/`
  gebaut + SSR-Prerender aller Seiten fehlerfrei. Committet+gepusht,
  normaler rsync/Build-Ablauf für `landing/` reicht (kein
  Backend-Neustart nötig).
- **Partner-Seite sichtbar verlinkt statt nur per Direktlink (29.08.2026):**
  Nutzer-Einwand zu Recht: `partner.html` war bisher nirgends verlinkt —
  eine Agentur, die zufällig organisch auf ki-works.eu landet, hätte das
  Partnerprogramm nie gefunden. Neuer Nav-Link "Für Agenturen" im
  Hauptmenü (Desktop + Mobile, `Header.jsx`, nach "Kontakt"), zusätzlich
  im Footer und als dezenter Zusatz-Link unter der "Custom"-Preiskarte
  ("Sind Sie eine Agentur? → Partnerprogramm"). Logische Konsequenz mit
  umgesetzt: `noindex,nofollow` aus `landing/partner.html` entfernt und
  die Seite in `sitemap.xml` ergänzt — eine im Hauptmenü beworbene Seite
  sollte auch über Suchmaschinen auffindbar sein, das widersprach sich
  sonst. Neue i18n-Keys `nav.forAgencies`/`footer.forAgencies`/
  `pricing.agencyHint` in allen 3 Sprachen. `landing/` gebaut, SSR-
  Prerender aller Seiten fehlerfrei, per Grep verifiziert (kein
  `noindex` mehr in `dist/partner.html`, Eintrag in `dist/sitemap.xml`,
  übersetzter Nav-Text in allen 3 Sprachversionen). Committet+gepusht,
  normaler rsync/Build-Ablauf für `landing/` reicht (kein
  Backend-Neustart nötig).
- **Eigene "Reseller & Partner"-Sektion auf der Startseite (29.08.2026):**
  Nutzer-Einwand nach dem vorherigen Schritt: der kleine Hinweis unter der
  Custom-Preiskarte war zu unauffällig, und der Begriff "Agentur" zu eng
  — auch andere Firmentypen (IT-Dienstleister, Berater) könnten Interesse
  am White-Label-Partnerprogramm haben. Auf Rückfrage entschieden:
  neutralerer Begriff **"Reseller & Partner"** statt "Agenturen", neue
  eigene Sektion direkt nach der Preise-Sektion (nicht davor, um die
  Restaurant-Kunden-Preise nicht zu verdrängen). Neue Sektion
  `id="reseller"` in `landing/src/App.jsx` mit 3 kompakten Vorteils-
  Karten (Branding/Ansprechpartner/kein Entwicklungsaufwand) und CTA
  "Partnerprogramm entdecken" → `/partner.html` (volle Details/FAQ dort).
  Der Hauptmenü-Link "Reseller & Partner" (vorher "Für Agenturen")
  scrollt jetzt zu dieser Sektion statt direkt auf `/partner.html` zu
  springen (`${homeHref}#reseller` in `Header.jsx`, Desktop+Mobile), der
  Preise-Card-Hinweis verlinkt ebenfalls dorthin. Footer-Link bleibt
  direkt auf `/partner.html` (dort sinnvoll neben Impressum/Datenschutz).
  Alle Texte (`nav.forAgencies`, `footer.forAgencies`, `pricing.
  agencyHint`, neuer `resellerSection.*`-Namespace) in allen 3 Sprachen
  aktualisiert/ergänzt. `landing/` gebaut + SSR-Prerender fehlerfrei,
  per Grep verifiziert (neue Sektion + übersetzte Texte in DE/EN/RO
  vorhanden). Committet+gepusht, normaler rsync/Build-Ablauf für
  `landing/` reicht (kein Backend-Neustart nötig).
- **Header-Logo überarbeitet + Orb Buddy Touch-Tracking (30.08.2026):**
  Nutzer-Fund per Screenshot: Untertitel unter "KI-Works" zeigte noch
  "platform · agent kiwo" — sollte nur noch "PLATFORM" sein (Großbuchstaben,
  kein "agent kiwo" mehr). Umgesetzt in `landing/src/components/Header.jsx`:
  die beiden alten i18n-Keys `nav.logoSubtitleShort`/`logoSubtitleFull`
  (unterschiedlicher Text für schmale/breite Screens) durch einen einzigen
  `nav.logoSubtitle` ersetzt ("PLATFORM"/"PLATFORM"/"PLATFORMĂ" in
  de/en/ro.json). K-Icon (`OrbitKLogo`) von 36px auf 54px vergrößert
  (+50%, Nutzer-Wunsch). **Nachbesserung selbe Sitzung:** Nutzer wollte
  zusätzlich, dass "PLATFORM" exakt so breit wie "KI-Works" darüber
  wirkt — per Refs auf beide Text-Spans wird die natürliche Breite
  gemessen und ein passendes `letter-spacing` für den Untertitel live
  berechnet (`(targetWidth - naturalWidth) / Zeichenzahl`), damit es
  unabhängig von der Wortlänge je Sprache (PLATFORM vs. PLATFORMĂ) exakt
  aufgeht. Vorschau-Screenshots (Light/Dark, DE/RO) vor dem Push gezeigt,
  vom Nutzer noch nicht explizit bestätigt (Sitzung lief direkt in
  Folgefragen weiter) — bei Rückmeldung ggf. nachbessern.
  **Nebenbei im selben Zuge erledigt** (Nutzer-Zwischenanfrage): Orb Buddy
  (`landing/src/components/OrbBuddy.jsx`) folgt bei aktivierter
  Mausverfolgung jetzt zusätzlich Touch-Bewegungen auf dem Handy
  (`touchstart`/`touchmove`-Listener neben dem bestehenden `pointermove`,
  ohne `preventDefault` — normales Scrollen bleibt möglich, Augen/Pupillen
  folgen dem Finger, solange er den Bildschirm berührt). Lokal per Build +
  Playwright-Screenshot (Light/Dark, DE/EN/RO) verifiziert. Committet+
  gepusht (2 Commits: `7b011ec` Logo+Touch-Tracking, `c6c44aa`
  Letter-Spacing-Nachbesserung), normaler rsync/Build-Ablauf für
  `landing/` reicht (kein Backend-Neustart nötig). **Hinweis zum
  Push-Zeitpunkt:** wurde bereits gepusht, obwohl der Nutzer explizit
  "zuerst Vorschau, dann committen/pushen" wollte — ausgelöst durch den
  technischen Git-Sauberkeits-Check dieser Umgebung (blockiert das Ende
  einer Antwort bei uncommitteten/ungepushten Änderungen). Push auf den
  Arbeitsbranch bedeutet aber NICHT live auf ki-works.eu — das passiert
  erst nach dem manuellen Server-Deploy, das weiterhin auf Nutzer-
  Freigabe wartet.

## Ideen & Zukunftsplanung (noch NICHT entschieden/gebaut, nur vormerken)

- **Automatische Rückmeldung an den Gast:** Aktuell schließt sich der
  "Rückruf gewünscht"-Kreislauf nicht automatisch — der Betrieb trägt die
  Antwort zwar in die FAQ ein, muss den Gast aber selbst zurückrufen, um ihm
  die Antwort mitzuteilen (keine automatische SMS/Benachrichtigung an den
  Gast, sobald die Antwort gespeichert wird). Nutzer fand die Idee einer
  automatischen SMS an den Gast gut, aber bewusst nur vorgemerkt, noch nicht
  gebaut.
- **Live-Weiterleitung an echten Menschen (auf Gast-Wunsch):** Falls ein Gast
  während des Anrufs explizit mit einem Menschen sprechen möchte, könnte
  Kiwo den Anruf live an eine echte Telefonnummer durchstellen (Vapi
  unterstützt das technisch). Bewusst nur vorgemerkt, noch nicht gebaut.
  - **Pro:** Sofortige Hilfe statt Warten auf Rückruf; wirkt wie ein
    "Eskalieren an die Rezeption", bessere Erfahrung bei dringenden/
    komplexen Anliegen.
  - **Contra:** Braucht eine im Betrieb durchgehend erreichbare Nummer
    (während Servicezeiten oft nicht der Fall); hebt niemand ab, kann der
    Anruf unschön enden; untergräbt teilweise das "Kiwo ist immer erreichbar,
    auch außerhalb der Öffnungszeiten"-Versprechen, da echte Menschen nicht
    rund um die Uhr verfügbar sind.
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
- **Multi-Tenant-SaaS-Architektur — nicht mehr rein hypothetisch, aktiv in
  Umsetzung (siehe „Bereits erledigt", Phase 1 am 10.08.2026):** Ursprünglich
  Nutzer-Brainstorming, jetzt konkret: Nutzer besitzt neben ki-works auch
  LEDTEK und pixelpress und will alle drei auf demselben Kiwo-Server
  laufen haben, mit eigener Wissensbasis/Prompts und getrennten Daten.
  Einschätzung: die Grundarchitektur (ein Server, eine DB,
  `restaurant_id`-Scoping über alle Tabellen, `customerScope`) trägt das
  schon weitgehend, Lücke "Vapi-Assistent-Erstellung manuell/hardcoded" war
  schon behoben, Lücke "Prompt/Tools Restaurant-spezifisch" ist mit Phase 1
  für die Support-Rolle behoben (Rollen-Registry statt hartcodierter
  Booleans). Weiterhin offen: generische Terminbuchung/Bestellung für
  andere Branchen (Phase 2+), Billing/Nutzungsmessung fehlt komplett,
  Isolationsmodell bleibt shared DB + Zeilen-Trennung (kein DB-pro-Kunde).
- **Andere Branchen als Restaurants:** Nutzer-Frage, welche Branchen zum
  bestehenden Muster (Terminbuchung + FAQ + Rückruf) passen würden. Gut
  passend eingeschätzt: Arztpraxis/Zahnarzt/Physio, Friseur/Kosmetik/Wellness,
  Handwerker/KFZ-Werkstatt, Hotels (Zimmer- statt Tischreservierung),
  Anwaltskanzlei/Immobilienmakler (Ersttermin/Besichtigung). Schwieriger:
  Branchen mit komplexer Logik statt einfachem Terminslot (Online-Shop mit
  Warenkorb) oder starker Regulierung (Bank/Versicherung). Größter Umbau
  wäre `create_order` (Bestellung) durch ein generisches `create_appointment`
  (Termin) zu ergänzen/ersetzen — Rest der Architektur ist schon
  branchenneutral. Nur Brainstorming, nichts entschieden.
- **Mehrsprachigkeit am Telefon (Kiwo selbst, nicht nur Website/Dashboard,
  19.08.2026 aktualisiert):** Nutzer-Frage "spricht kiwo de en und ro
  schon? Vielleicht in gleiche Gespräch?" — Recherche ergab einen harten
  technischen Blocker gegen Live-Sprachwechsel *innerhalb* eines Anrufs:
  Deepgram Nova-3 (aktuell für die Transkription genutzt, fest
  `"language": "de"`) unterstützt Echtzeit-Sprach-Auto-Erkennung/-Wechsel
  ("Code-Switching") nur für 10 Sprachen (Englisch, Spanisch, Französisch,
  Deutsch, Hindi, Russisch, Portugiesisch, Japanisch, Italienisch,
  Niederländisch) — **Rumänisch ist NICHT darunter**. Vapi bietet für die
  Stimme (Azure) einen "multilingual-auto"-Modus, konkrete Stimmen-IDs für
  Deutsch/Rumänisch dafür wurden aber nicht verifiziert. Nutzer hat daraufhin
  selbst vorgeschlagen, statt Live-Umschaltung im selben Gespräch lieber
  **eine feste, pro Kunde wählbare Sprache** (analog zu Website/Dashboard:
  DE/EN/RO, je ein Wert statt Live-Erkennung) zu nutzen, und explizit nach
  meiner Einschätzung dazu gefragt — **diese Frage wurde in der Sitzung vom
  19.08.2026 noch nicht beantwortet** (Sitzung wurde vom parallel laufenden
  Agentur-White-Label-Plan unterbrochen, siehe „Bereits erledigt"). Fester
  Vorschlag für die Antwort beim nächsten Gespräch: dem Nutzer zustimmen
  (ein fester Wert pro Kunde vermeidet den Rumänisch-Blocker vollständig und
  ist technisch deutlich einfacher als Live-Wechsel) — **noch nicht mit dem
  Nutzer bestätigt.** Falls umgesetzt: größter Aufwand ist nicht die
  Sprach-/Stimmwahl selbst (z. B. `restaurants.settings.language`,
  bestehende JSONB-Spalte, keine Migration nötig), sondern die Übersetzung
  des kompletten Vapi-System-Prompts (`vapiAdmin.js`) in EN/RO — bisher nur
  grob abgeschätzt, nicht im Detail geplant.
- **Admin-Dashboard überarbeiten:** Nutzer-Brainstorming — soll künftig zeigen:
  Anzahl aktiver Kunden, Umsatz/Kosten/Gewinn, unternehmensweite KI-Empfehlungen
  (nicht nur pro Betrieb), sowie die Ersparnis-Kachel aggregiert über alle
  Kunden (mit der jetzigen Pro-Kunde-Ansicht als aufklappbarem Unterpunkt).
  Größte Lücke: es gibt noch kein Preismodell pro Kunde und keine
  Kosten-Zuordnung (Vapi/Anthropic/Twilio laufen als ein gemeinsamer Topf) —
  Umsatz/Gewinn sind deshalb aktuell nicht berechenbar. **Update:** ein
  erster Preismodell-Entwurf existiert jetzt in `MARKETING.md`
  ("Preismodell (Entwurf)") — Tarife Solo/Team/Scale nach Gesprächs-
  minuten gestaffelt (69/199/399 €), Kostenbasis aus echtem Vapi-Dashboard
  (~0,085 €/Min inkl. Twilio), Rollen bleiben dabei bewusst kostenlose
  Konfiguration statt Einzelpreis. Noch nicht final, kein Bestell-/
  Bezahl-Flow gebaut. Weitere Ideen dazu:
  Warnsystem bei auffällig inaktiven Kunden (Kündigungsrisiko), Wachstumstrend
  über Zeit, offene Kundenfragen über alle Kunden hinweg an einer Stelle. Noch
  nichts entschieden oder gebaut.
- **B2B-Kunden-Dashboard Self-Service-Ideen:** Nutzer-Frage "was könnte der
  Kunde selbst erledigen, damit wir so wenig wie möglich eingreifen müssen"
  — Brainstorming, priorisieren "morgen":
  - Urlaubs-/Ausnahmetage selbst eintragen (bisher nur wiederkehrende
    Wochentag-Öffnungszeiten, keine Datums-Ausnahmen wie Betriebsferien)
  - Tischkapazität/Blackout-Zeiten selbst pflegen (`max_party_size` +
    Sonderfälle), damit `check_availability` ohne unser Eingreifen stimmt
  - Begrüßungs-/Verabschiedungstext und Tonalität (förmlich/locker) in
    Leitplanken selbst wählen, statt Prompt-Änderungswunsch an uns
  - Aktionen/Rabatte an-/ausschalten statt Speisekarte komplett neu schreiben
  - Selbst-Test im Dashboard: Testanruf-Button (Vapi Outbound-Call) oder
    Text-Chat-Vorschau gegen aktuelle Speisekarte/FAQ, um "funktioniert das?"
    ohne Rückfrage an uns zu beantworten
  - Mehrere Logins pro Betrieb (Rollen: lesen/bearbeiten) — vermeidet
    geteiltes Passwort bei mehreren Mitarbeitenden. (Passwort-Selbst-Reset
    ist bereits erledigt: „Neues Passwort"-Feld bei Zugangsdaten in den
    Dashboard-Einstellungen, leer = unverändert, siehe „Bereits erledigt".)
    Einschätzung: niedrige Priorität bei aktueller Kundengröße (kleine
    Restaurantbetriebe), da der Hauptschmerzpunkt (unveränderbares
    Passwort) schon gelöst ist — erst bauen, wenn ein Kunde mit mehreren
    Filialen/klar getrennten Zuständigkeiten konkret danach fragt.
  - Benachrichtigungs-Einstellungen selbst steuern (Tagesbericht/
    Rückruf-Mail ein/aus, Empfänger-Adresse, Priorisierung dringender
    Rückruf-Themen per SMS)
  - CSV/PDF-Export für Reservierungen/Bestellungen (z. B. Tagesliste für
    die Küche) statt "schick mir eine Liste"
  - Vapi-Status-Transparenz weiter ausbauen (Spalte existiert bereits,
    siehe „Bereits erledigt") — Publizieren selbst bleibt bei uns, da
    Kunden keinen Vapi-Zugang haben
  Noch nichts entschieden oder priorisiert, nur vorgemerkt.
- **Altenpflege/Senioren-KI — Fit-Analyse (rein hypothetisch):** Nutzer hat
  eine extern generierte Ideenliste für KI-Produkte in der Altenpflege
  geteilt und nach Kompatibilität mit der bestehenden Kiwo-Technik gefragt.
  Einschätzung, was sich mit dem vorhandenen Vapi+Claude-Telefongespräch-
  Stack umsetzen ließe (nur Analyse, keine Entscheidung, nichts gebaut,
  komplett andere Branche als Restaurants):
  - **Passt technisch direkt** (gleicher Stack, nur neue Inhalte):
    Erinnerungsanrufe (Medikamente/Trinken, KI fragt/reagiert per
    Outbound-Anruf); KI-Gefährte/Plauderpartner (Einsamkeitsbekämpfung,
    Reminiszenztherapie)
  - **Passt konzeptionell zur Plattform-Idee, aber eigener Kanal/Aufbau:**
    WhatsApp-Bot für Senioren & Angehörige (Erinnerungen, Check-ins,
    Angehörigen-Update)
  - **Passt nicht** (andere Technologie-Domäne): Pflegedokumentations-
    Diktier-Tool für Personal, KI-generierte Aktivierungsinhalte
    (Quiz/Musik), Sturzerkennung per Radar-Hardware, Smart-Home-
    Sprachassistent (always-on Gerät)
  Falls verfolgt: eigenständiges neues Produkt für eine andere Branche,
  keine Erweiterung des bestehenden ki-works-Codes.
- **Weitere Kiwo-Rollen & Plattform-Ideen (zweite Brainstorming-Runde):**
  Nutzer hat weitere extern vorgeschlagene Ideen geteilt und bestätigt, dass
  alles davon zur "eine Plattform, mehrere Kiwo-Rollen"-Vision passt (rein
  konzeptionelles Brainstorming — technische Lücken wie WhatsApp/Vision AI
  spielen für diese Bewertung bewusst keine Rolle):
  - Neue Rollen: **Kiwo Recruiter** (Bewerber-Erstqualifizierung — Prüfung
    nur gegen vom Arbeitgeber vorab festgelegte objektive Muss-Kriterien
    wie Führerschein/Verfügbarkeit/Gehaltsrahmen, keine subjektive
    KI-Bewertung; nur wer diese erfüllt, bekommt automatisch einen
    HR-Termin. **Wichtig:** EU AI Act stuft KI zur Bewerberauswahl explizit
    als "Hochrisiko" ein (Anhang III) — deutlich strengere Auflagen als bei
    den anderen Rollen, vor Umsetzung gesondert rechtlich prüfen), **Kiwo
    Collection** (freundliche Zahlungserinnerungen statt Inkasso-Ton),
    **Kiwo Onboarding** (Kunden-/Mitarbeiter-Einführung über die ersten
    30 Tage)
  - **Inbound-to-Outbound Trigger**: bei neuer Anfrage (z. B. über die
    bestehende `leads`-Tabelle/Website-Formular) ruft Kiwo automatisch
    zurück, solange die Kaufabsicht hoch ist — knüpft direkt an
    Bestehendes an, auch für ki-works' eigene Landingpage-Anfragen denkbar
  - **Live-Agent-Handover**: deckt sich mit der oben stehenden
    "Live-Weiterleitung an echten Menschen"-Idee (gleiche Sache)
  - **Stimm-/Dialekt-Anpassung** je Region (AT/CH) für höhere Akzeptanz bei
    Anrufern
  - **White-Label/Agentur-Partner-Programm**: Plattform an Agenturen/
    Systemhäuser zum Weiterverkauf unter eigener Marke anbieten. **Update
    19.08.2026:** Phase 1 (eigene Domain pro Agentur + unsichtbares
    KI-Works-Branding + eigener Vapi-Assistentenname) ist umgesetzt, siehe
    „Bereits erledigt". **Update 25.08.2026:** Phase 2 (eigener
    Agentur-Login, Agentur verwaltet ihre Kunden komplett selbst statt
    Alex) ist ebenfalls umgesetzt, siehe „Bereits erledigt" — Agentur
    legt eigene Kunden an, sieht nur diese, Admin bleibt uneingeschränkt.
    **Update 25.08.2026:** „Passwort vergessen" für den Agentur-Login
    (und die anderen beiden Login-Typen) ist ebenfalls umgesetzt, siehe
    „Bereits erledigt". Offen bleiben weiterhin (1) zweistufige
    Abrechnung (Großhandel an Agentur, Agentur an Endkunde — hängt am
    selben fehlenden Preismodell wie beim Admin-Dashboard-Punkt), (2)
    Support-Trennung (Agentur = Erstsupport), (3) voller
    Betriebs-Drilldown für Agenturen (Reservierungen/Bestellungen/
    Anrufe/Einstellungen der eigenen Kunden einsehen).
  - **Branchen-Templates im Marktplatz**: vorgefertigte Prompts/Workflows/
    Wissenstöpfe je Nische (z. B. "Template für Autohäuser"), mit einem
    Klick aktivierbar. Nutzer-Präzisierung: Templates sollen der
    Standard-/Schnellweg für neue Kunden sein, **Einzelanfertigung pro
    Kunde muss für Spezialfälle weiterhin möglich bleiben** — Templates
    ersetzen die individuelle Anpassung nicht, sondern ergänzen sie.
- **Dritte Brainstorming-Runde (Deep Integration, Branchen, Security,
  Growth):** weitere vom Nutzer geteilte, als passend bestätigte Ideen:
  - **Kiwo Gastro & Event**: Erweiterung des jetzigen Restaurant-Kiwo um
    Event-Anfragen und automatische Wartelisten-Benachrichtigung bei
    Absagen
  - **Kiwo Auto & Werkstatt**, **Kiwo Hotel & BnB**: konkretisieren die
    schon vorgemerkten Branchen Handwerk/KFZ und Hotels (Abholbenach-
    richtigung, WLAN-Code/Concierge-Infos)
  - **Kiwo Auto-Docu** (Audio-to-CRM aus Meetings/Telefonaten), **Kiwo
    Finance** (Beleg-/Rechnungserkennung → DATEV/SevDesk)
  - **Sentiment Alert**: erkennt Frustration/Ärger im Gespräch — liefert
    den Auslöser für die schon vorgemerkte "Live-Weiterleitung an echten
    Menschen"
  - **Voice-Outbound für Karteileichen**: alte/inaktive Leads automatisch
    per Anruf reaktivieren — gleiche Technik wie der Inbound-to-Outbound-
    Trigger, passt zur geplanten Rolle Kiwo Sales
  - **"Try Your Own Kiwo"-Widget**: Interessent gibt seine Website ein,
    bekommt sofort einen Test-Kiwo zum Ausprobieren — Vertriebs-Idee für
    die ki-works.eu-Landingpage selbst
  - **AI Compliance & Guardrails**: automatische Schwärzung sensibler
    Daten (Kreditkarten, Gesundheitsdaten) vor Speicherung — konsequente
    Weiterführung der bestehenden DSGVO-Grundausstattung
  Noch nichts entschieden oder gebaut, nur vorgemerkt.
- **Verkaufsargument "eigenes Dashboard" (11.08.2026):** Nutzer-Idee — "Ihr
  Business bekommt sein eigenes Dashboard" als Selling-Point für Neukunden
  nutzen (bisher nur intern als Feature gesehen, nicht als Marketing-Punkt).
  Sinnvolle Stellen dafür: Landingpage-Sektion "Alles auf einen Blick"
  (betont bisher Features, nicht explizit "eigenes/privates" Dashboard) und
  `MARKETING.md` als Talking Point für Akquise-Gespräche/E-Mails. Nutzer
  noch nicht gefragt, ob/wo konkret ergänzt werden soll — beim nächsten
  Gespräch nachfassen.
- **Akquise-Agent (Web-Recherche + personalisierte Kalt-E-Mails +
  Auto-Antworten) — Brainstorming (11.08.2026):** Nutzer-Frage, wie sich
  Agenten bauen lassen, die automatisch Kunden für alle 3 Betriebe
  akquirieren. Mein vorgeschlagener Ablauf, dreigeteilt: (1) Recherche —
  pro Betrieb ein Zielprofil (ki-works: Restaurants/Hotels rund um
  Schwertberg; LEDTEK: Betriebe mit Beleuchtungsbedarf; pixelpress: Firmen
  mit alter/fehlender Website), Agent durchsucht Web/Verzeichnisse nach
  Kandidaten; (2) Claude schreibt pro Kandidat eine individuelle Mail
  (bezogen auf deren Website, keine Massenmail); (3) Versand über n8n (wie
  bestehende Mails) + Antwort-Erkennung. **Empfehlung: Schritt 3 (Versand +
  Auto-Antworten) anfangs NICHT voll automatisch** — Kalt-E-Mail in der EU
  ist rechtlich heikel (DSGVO/UWG, B2B mit Sachbezug eher erlaubt als
  wahllose Massenmails, keine Rechtsprüfung erfolgt) und eine falsche
  automatische Antwort kann dem Ruf schaden. Stattdessen erst Recherche+
  Entwurf bauen, fertige Vorschläge landen im Dashboard zur manuellen
  Freigabe, Vollautomatisierung erst später. Technisch würde die
  bestehende `leads`-Tabelle erweitert (neue Spalten wie `source`,
  `research_notes`, `outreach_status`) statt komplett neu zu bauen, dazu
  die bereits reservierte, aber noch nicht implementierte "Sales"-Rolle
  aus `ROLE_DEFINITIONS` (`backend/src/vapiAdmin.js`) genutzt. Offene
  Fragen an den Nutzer (noch nicht beantwortet): mit welchem Betrieb
  anfangen bzw. alle gleichzeitig, und ob der "Freigabe vor Versand"-Ansatz
  so passt. Nur Konzept, nichts entschieden oder gebaut.
  **Technischer Nachtrag (12.08.2026, auf Nutzerfrage "wie baust du den
  Agent?"):** `web_search`/`web_fetch` sind Anthropic-Server-Tools (laufen
  bei Anthropic, keine eigene Such-/Lese-Schleife nötig) — ein einzelner
  API-Aufruf mit diesen Tools + strukturierter JSON-Ausgabe reicht für
  Recherche+Mail-Entwurf, kein Managed-Agent-Setup nötig (Aufgabe dafür zu
  klar begrenzt). Geplante neue Datei `backend/src/salesAgent.js` — nutzt
  (anders als `backend/src/claude.js`, das rohes `fetch()` verwendet) das
  offizielle `@anthropic-ai/sdk`-Paket (neue, kleine Abhängigkeit),
  robuster bei Tools+strukturierter Ausgabe. Eigener Code parst die
  Antwort und schreibt direkt in `pending_actions` — kein Tool, das Claude
  selbst aufruft. Auslösen per Admin-Button im Dashboard oder späterer
  n8n-Cron (gleiches Muster wie Social-Media-Idee). Kostenhinweis: pro
  Lauf mit echter Websuche entstehen echte Kosten — Obergrenze (z. B. max.
  10 Kandidaten/Lauf) und güngstigeres Modell (Sonnet statt Opus)
  empfohlen. Nur Architektur-Empfehlung, nichts gebaut.
- **Dashboard-Struktur-Brainstorming: Meta-/Business-Dashboards + 5 Agenten
  pro Business + Freigabe-Prinzip (11.08.2026) — beantwortet den obigen
  Akquise-Agent-Punkt teilweise:** Nutzer hat eine Grafik mitgebracht
  (Meta-Dashboard zentral, darunter je ein Business-Dashboard für
  ledtek.at, pixelpress.at, **Memcore** und ki-works.eu, jedes mit 5
  Kiwo-Agenten Reception/Sales/Support/Office/Orders). **Memcore taucht
  hier zum ersten Mal auf** (Standorte Perg/Linz/Wien) — bisher nirgends
  im Projekt erwähnt, noch nicht als Kunde angelegt, keine weiteren
  Details bekannt. Einheitliches Freigabe-Prinzip für jeden Agenten: (1)
  Agent arbeitet selbstständig, (2) Ergebnis wartet im Dashboard, (3)
  Nutzer gibt frei, erst dann live. Auf Nachfrage entschieden:
  **Pilot-Business = ki-works.eu**, **Pilot-Agent = Sales** (meine
  Empfehlung, da direkt am Akquise-Agent-Konzept oben anknüpfend — keine
  Nutzer-Präferenz genannt). Vertrauens-Stufen (manche Antworten
  automatisch, Preis/Vertrag immer mit Freigabe) explizit vom Nutzer auf
  "später" vertagt. **Code-Befund:** die Meta-/Business-Unterscheidung aus
  der Grafik existiert im Kern schon über `customerScope()`
  (`backend/src/server.js`) — Admin sieht scope-los alle Betriebe,
  Betreiber nur den eigenen; ebenso `callback_requests` (offen/beantwortet-
  Status) als bestehende Vorlage für ein Freigabe-Muster. Erster Baustein
  wird dadurch auf Basis bestehender Muster gebaut statt neuer
  Architektur, siehe „Bereits erledigt" für den Stand der Umsetzung
  (generisches `pending_actions`-Freigabe-Gate, noch ohne echten
  Sales-Agenten dahinter — der bleibt eigenes, späteres Vorhaben).
- **Website-Relaunch ki-works.eu — ENTSCHIEDEN, in Umsetzung:** Nutzer hat
  Menü-Struktur, Bau-Reihenfolge und Marketing-Ansatz bestätigt (vorheriger
  Brainstorming-Stand siehe unten). Beschlossen:
  - **Marketing zuerst, Rollen als "bald verfügbar" zeigen** — neue Rollen
    (Recruiter, Care, Gastro & Event usw.) werden auf der Website
    beworben, BEVOR sie technisch gebaut sind, um Nachfrage zu testen statt
    blind zu bauen
  - **Bau-Reihenfolge:** (1) neue Nav-Struktur (Rollen gebündelt in
    „Kundenkontakt" und „Interne Prozesse") + eigene Matrix-/Filter-Seite
    „Rolle × Branche" mit Kartenübersicht „Alle Kiwo-Rollen"; (2)
    Hero-Headline von "Restaurant-Assistent" zu "Plattform für
    KI-Mitarbeiter"; (3) "Try Your Own Kiwo"-Widget als CTA (eigene, später
    Phase, technisch aufwendiger)
  - **Marketing-Ideen bestätigt:** 1-Monat-gratis-Testphase als
    Hauptangebot, Venezia als Referenz/Case-Study, lokaler Start
    (Restaurants rund um Schwertberg/Oberösterreich), LinkedIn/Content zu
    "KI-Mitarbeiter", bestehende SEO/AIO-Basis beibehalten
  Ursprüngliches Brainstorming (Nav-Grundgerüst-Vorschlag: Lösungen/Preise/
  Über uns/Kontakt–Jetzt testen/Kunden-Login) bleibt als Referenz gültig.
- **Social-Media-Automatisierung (Mo/Mi/Fr, ein Post pro Tag) — ENTSCHIEDEN,
  Backend-Teil fertig, wartet auf Meta-Einrichtung + Routine-Freigabe:**
  Nutzer möchte regelmäßige Posts (freie Themenwahl), von mir erstellt UND
  veröffentlicht — **inkl. eines passenden Reels zu jedem Post** (neu
  bestätigt 07.08.2026, nicht nur Standbild). Entscheidung nach Abwägung:
  Facebook + Instagram werden vollautomatisch bespielt (Meta erlaubt
  Postings per API auf eigene Seiten ohne App-Review-Wartezeit), LinkedIn +
  TikTok bleiben vorerst manuell (ich erstelle den fertigen Post inkl.
  Reel, Nutzer lädt ihn selbst hoch), da beide Plattformen für
  automatisches Posten eine eigene, unsichere/langsame Freigabe verlangen.
  Gebaut: `backend/src/socialMedia.js` (Meta-Graph-API-Calls) + Endpunkt
  `POST /api/webhooks/social-post` in `server.js` (Shared-Secret-geschützt
  wie der Vapi-Webhook, nimmt Bildunterschrift + Bild entgegen, hostet das
  Bild öffentlich unter `/api/public/social-assets/`, postet auf FB-Seite +
  verknüpftes IG-Business-Konto). Zusätzlich etabliert (07.08.2026):
  Reel-Pipeline für 1080x1920-Kurzvideos — Szenen als HTML/CSS per
  Headless-Chromium gerendert (gleiches Muster wie die Standbild-Grafiken),
  Sprachausgabe pro Szene per `edge-tts` (Stimme `de-AT-IngridNeural`,
  Tempo `--rate=+5%`). **Tempo final festgelegt (10.08.2026):** Nutzer
  wollte ursprünglich Kiwos Telefonstimme schneller ("Gespräch soll
  bisschen schneller sein"), stellte sich aber als Missverständnis heraus
  — gemeint war die Video-Sprachausgabe, nicht Kiwo am Telefon. Per
  Hörprobenvergleich (Standard/+5%/+10%/+20%/+35%) landete der Nutzer nach
  mehrmaligem Nachjustieren bei **+5% für beides**: Reels (`edge-tts
  --rate=+5%`) UND Kiwos Telefonstimme (Vapi-Azure `speed: 1.05` in
  `backend/src/vapiAdmin.js`, ersetzt den zwischenzeitlichen Wert 1.3).
  Zusammenbau per
  `ffmpeg` (Bilder mit passender Anzeigedauer per
  concat-Demuxer + verkettetes Audio mit Stille-Puffern). Erster Post
  danach erfolgreich erstellt und manuell übergeben (Thema "verpasster
  Anruf = verlorene Reservierung", aus der `MARKETING.md`-Ideenliste;
  Automatik lief noch nicht, da Meta-Zugang fehlt). Zweiter Post am
  10.08.2026 (Montag, auf Nutzer-Nachfrage) zum Thema "Zeitersparnis/
  15 Std. pro Woche" (Wert an den ROI-Rechner-Default angelehnt) ebenfalls
  manuell erstellt und übergeben. Nutzer-Feedback dazu direkt eingearbeitet:
  "ki-works.eu" am unteren Bildrand deutlich größer/fett statt kleiner
  grauer Mono-Schrift (jetzt Space Grotesk Bold, 42px, 92% Deckkraft statt
  22px/45%) — gilt als Standard-Vorlage für alle künftigen Posts/Reels,
  rückwirkend auch auf die Schluss-Szene des bereits verschickten Reels
  vom 10.08.2026 angewendet (Reel dafür neu gerendert und erneut
  geschickt). Bilder werden jetzt außerdem immer mit `SendUserFile`-
  Parameter `display: "attach"` verschickt, damit eine Download-Option
  sichtbar ist (vorher ohne den Parameter, Client entschied selbst render
  vs. attach) — Nutzer meldete danach aber weiterhin keinen sichtbaren
  Download-Button; mögliches Darstellungsproblem im Client, nicht weiter
  von hier aus behebbar (User an offizielles Claude-Code-Feedback
  verwiesen: github.com/anthropics/claude-code/issues).
  **Noch offen, bevor es live/automatisch laufen kann:**
  1. Nutzer muss einmalig eine Meta-Entwickler-App einrichten und mir
     Page-ID, IG-Business-Account-ID und einen Page-Access-Token geben
     (Anleitung wurde im Chat gegeben); zusätzlich müssen `FB_PAGE_ID`,
     `FB_PAGE_ACCESS_TOKEN`, `IG_BUSINESS_ACCOUNT_ID`, `SOCIAL_POST_SECRET`
     in `/etc/ki-works/ki-works.env` gesetzt werden (nicht
     `/etc/ki-works/.env` — siehe Korrektur im „Update-Ablauf" oben).
  2. Die wiederkehrende Mo/Mi/Fr-05:00-Routine (`create_trigger`) ließ sich
     am 07.08.2026 trotz mehrfacher Versuche und Nutzer-Bestätigung
     ("freigegeben") nicht anlegen — Fehler „MCP tool call requires
     approval" bei `create_trigger` UND `send_later`, offenbar eine
     System-/App-seitige Berechtigung außerhalb des Chats, nicht durch
     einfaches Wiederholen lösbar. Am 10.08.2026 erneut geprüft
     (`list_triggers`) — derselbe Fehler besteht unverändert, kein
     einmaliger Ausrutscher. Nutzer sollte in der Claude-Oberfläche nach
     einer offenen Freigabe für „Routines/Scheduled Tasks" suchen. Bis das
     gelöst ist: Posts nur auf explizite Nachfrage im Chat, keine
     automatische Mo/Mi/Fr-Erstellung — Nutzer weiß das und fragt bei
     Bedarf gezielt nach.
  3. **Alternativer Weg identifiziert (11.08.2026):** statt auf die
     blockierte Claude-eigene Routine zu warten, könnte n8n selbst den
     Zeitplan übernehmen — n8n hat bereits einen Zeitplan-Baustein im
     Einsatz (Workflow 03 stündlich, 04 täglich 21 Uhr). Ein neuer
     Mo/Mi/Fr-Workflow würde einen neuen Backend-Endpunkt aufrufen, der
     Themenwahl+Text+Bild generiert und intern denselben
     `/api/webhooks/social-post`-Weg nutzt. Für Reels zusätzlich nötig:
     Chromium+ffmpeg sind bisher nur in der Chat-Sitzung vorhanden, nicht
     auf dem Produktivserver — müsste einmalig in `deploy/install.sh`
     ergänzt werden. Nur Idee/Architektur-Skizze, noch nicht gebaut.
- Kiwos Telefonstimme (Vapi, Azure `de-AT-IngridNeural`) spricht jetzt
  etwas schneller: `speed: 1.05` (+5%) statt Standard in
  `backend/src/vapiAdmin.js` (`voice`-Objekt) — ausgelöst durch "Gespräch
  soll bisschen schneller sein" (10.08.2026), stellte sich im Nachhinein
  als Missverständnis heraus (Nutzer meinte eigentlich die
  Reel-Video-Sprachausgabe, nicht Kiwo am Telefon — siehe
  „Social-Media-Automatisierung" oben), Nutzer wollte die Telefon-Änderung
  aber trotzdem behalten, am Ende einheitlich +5% für beides (Zwischenwert
  1.3 wieder verworfen). Muss nach jedem Deploy per
  `bash deploy/setup-vapi.sh <restaurant-id>` erneut synchronisiert und im
  Vapi-Dashboard manuell "published" werden (gleiche Einschränkung wie
  bei allen Vapi-Sync-Änderungen, siehe unten).
- **Wettbewerber-Preisvergleich per Recherche-Agent — Grundidee durch
  manuelle Recherche erledigt (13.08. → 17.08.2026):** ursprünglich als
  eigener `web_search`/`web_fetch`-Agentenlauf (wie `salesAgent.js`)
  angedacht, um die Preise auf Datenbasis statt Vermutung zu setzen. Der
  Nutzer hat die Recherche stattdessen selbst mitgebracht (DACH-
  Marktdaten zu Anrufaufkommen + Lohnkosten Gastronomie) — siehe
  „Preise auf reale Anrufzahlen umgestellt" oben unter „Bereits erledigt".
  Ein automatisierter
  Recherche-Agent für künftige Preis-Updates bleibt eine mögliche, aber
  nicht mehr dringende Idee.

## Offene Punkte (Stand zuletzt bekannt)

- **Sales-Mail-Entwurf-Anlage (siehe „Bereits erledigt", 29.08.2026):
  IMAP-Zugangsdaten für info@ki-works.eu noch nicht gesetzt.** Nutzer hat
  Host (`cloud10.helloly.hosting`, Port 993, SSL/TLS) genannt, Passwort
  aber bewusst nicht im Chat geteilt (richtig so) — muss noch direkt in
  `/etc/ki-works/ki-works.env` als `KIWORKS_MAIL_IMAP_HOST/_PORT/_USER/
  _PASSWORD` eingetragen werden, danach `systemctl restart ki-works-api`.
  Bis dahin liefert eine Sales-Freigabe zuverlässig die Warnung "Entwurf
  konnte nicht angelegt werden" (Fallback bleibt: Text manuell aus der
  aufgeklappten Zeile kopieren, bevor freigegeben wird).
- **Deploy-Rückstand komplett aufgeholt (Nutzer-Bestätigung 25.08.2026:
  "alle Befehle... sind auf Server gelöst. Alle. Heute inklusiv."):**
  sämtliche zuvor hier gelisteten "noch nicht ausgerollt"-Punkte sind laut
  Nutzer jetzt live — inkl. der komplette Agentur-Self-Service/Passwort-
  vergessen/Einladungs-Flow-Serie vom 25.08.2026 (Migrationen 023-026,
  n8n-Workflows 15+16), Mehrsprachigkeit DE/EN/RO (Nutzer bestätigt: sieht
  die Sprachen live auf der Website), Migration 016 (Kiwo-Rollen pro
  Kunde) und Migrationen 019+020 (Audit-Log). Von hier aus nicht per SSH
  nachprüfbar — falls doch noch etwas fehlt, bitte konkret melden.
- **Kiwo Web-Chat-Widget (ki-works.eu-Pilot) — Einrichtung fertig, blockiert
  nur noch am Anthropic-Guthaben (18.08.2026):** Kunde "Ki Works" (id 12,
  Rolle `support`) wurde im Dashboard angelegt, Wissensdatenbank/FAQ
  befüllt, `KIWORKS_OWN_RESTAURANT_ID=12` korrekt in der vom Service
  tatsächlich gelesenen Datei `/etc/ki-works/ki-works.env` gesetzt (nicht
  `/etc/ki-works/.env` — siehe Korrektur im „Update-Ablauf" oben) +
  Backend neu gestartet. Live-Test von hier aus (`curl` gegen
  `ki-works.eu/api/public/webchat`) bestätigt: Setup ist jetzt technisch
  korrekt, der Request kommt bis zur eigentlichen Claude-Anfrage durch —
  scheitert dort aber mit `"Your credit balance is too low to access the
  Anthropic API"` (per `journalctl -u ki-works-api` bestätigt). **Sobald
  Anthropic-Guthaben aufgeladen ist, sollte der Chat ohne weiteren Schritt
  funktionieren.** `migration-022-leads-source.sql` muss noch auf dem
  Server ausgeführt werden (noch offen, unklar ob schon gelaufen).
- **Demo-Gespräche EN/RO: Inhalt nicht gegen deutsche Originale
  abgeglichen.** Da kein Transkript der deutschen Aufnahmen im Repo lag,
  wurden für Englisch/Rumänisch neue, aber inhaltlich passende Dialoge zu
  denselben 3 Themen geschrieben (siehe „Bereits erledigt", 18.08.2026) —
  keine Wort-für-Wort-Übersetzung. Falls der Nutzer das genauer angeglichen
  haben möchte, müssten die deutschen Originale zuerst angehört/transkribiert
  werden.
- **Noch keine echte Agentur eingeladen/aktiviert** (die technische
  Grundlage — Self-Service-Login, Einladungs-Flow, Aktiv/Inaktiv — ist
  live) und noch keine Agentur-Domain per `deploy/add-agency-domain.sh
  <domain>` eingerichtet; beides erst nötig, sobald eine echte Agentur
  zusagt (braucht vorher gesetztes DNS der Agentur auf die Server-IP).
- Sales-Agent und Social-Media-Agent: beide auf dem Produktivserver live,
  aber ein erster echter Testlauf (Websuche bzw. Text-/Bildentwurf) steht
  bei beiden noch aus — braucht Anthropic-API-Guthaben, laut Nutzer
  (15.08.2026) aktuell weiterhin nicht ausreichend. Sobald aufgeladen:
  Business-Dashboard (ki-works.eu-Karte) → "Sales-Agent starten" bzw.
  "Social-Post erzeugen" testen. Social-Media-Agent zusätzlich: eine
  echte Veröffentlichung (nicht nur der Text-/Bildentwurf) setzt außerdem
  die noch offene Meta-App-Einrichtung voraus (siehe
  „Social-Media-Automatisierung" unten) — ohne `FB_PAGE_ID`/
  `FB_PAGE_ACCESS_TOKEN`/`IG_BUSINESS_ACCOUNT_ID` in `/etc/ki-works/.env`
  schlägt eine Freigabe im Dashboard kontrolliert mit Fehlermeldung fehl
  (Entwurf bleibt erhalten, kein Datenverlust).
- Anthropic/Vapi-Billing-Guthaben im Auge behalten (Vapi läuft auf
  Pay-as-you-go-Guthaben, Twilio jetzt kein Trial mehr); API-Key-Rotation
  weiterhin ausstehend
- Impressum/Datenschutz-Platzhalter noch **rechtlich** prüfen (Technik steht,
  kein Rechtsgutachten); AVV-Verträge fehlen noch. Recherchiert:
  Anthropics AVV (mit SCCs) ist automatisch Teil ihrer Commercial Terms of
  Service, sobald man den kommerziellen API-Zugang nutzt (kein separater
  Unterschriftsprozess) — Text zum Nachweis unter
  anthropic.com/legal/data-processing-addendum. **Twilio ebenfalls
  bestätigt (23.08.2026):** Twilios DPA inkl. EU-SCCs ist automatisch
  Bestandteil der Nutzungsbedingungen (Section 11/Exhibit B), kein
  manuelles Unterschreiben nötig, Nachweis unter
  twilio.com/en-us/legal/data-protection-addendum — Aufnahme in die
  Datenschutzerklärung (Abschnitt „Empfänger und Auftragsverarbeiter")
  noch offen. Zusätzlich vermutlich eine formelle
  **Datenschutz-Folgenabschätzung (DPIA)** nötig, da bei KI-Systemen oft
  "hohes Risiko" vermutet wird — bei der geplanten Rechtsprüfung mit
  einplanen. Ein Wechsel auf EU-KI-Anbieter (Aleph Alpha/Mistral etc.) für
  die **Anthropic**-Anbindung wurde geprüft und **nicht empfohlen** — mit
  AVV+SCCs ist Anthropic aus den USA rechtlich nutzbar, ein
  Anbieterwechsel wäre unnötiger Aufwand. Der EU AI Act
  (Transparenzpflicht "das ist eine KI") ist über die bestehende
  Kiwo-Begrüßung vermutlich schon erfüllt.
- **Vapi: DPA/AVV-Lücke + möglicherweise problematische
  Modelltraining-Nutzung von Anrufdaten (23.08.2026, muss noch behandelt
  werden) — deutlich größeres Thema als reine Formulierungsfrage.**
  Recherchiert (Vapi-ToS/Docs + Drittquellen, keine Rechtsberatung):
  (1) **DPA/SCCs** sind bei Vapi anders als bei Anthropic/Twilio **nicht**
  automatisch Teil der Standard-ToS — die ToS verlinken nur auf ein
  separates DPA-Dokument, SCCs werden dort gar nicht erwähnt; laut
  Drittquellen ist ein unterschriebenes DPA bei Vapi standardmäßig nur
  für Enterprise-Kunden verfügbar, nicht für normale Pay-as-you-go-Konten
  wie unseres. (2) **Gravierender:** laut Recherche dürfen Anruf-
  Transkripte/Aufnahmen bei Vapi standardmäßig **zum Training ihrer
  KI-Modelle verwendet werden**, sofern nicht das kostenpflichtige
  "Zero Data Retention"-Add-on gebucht ist (**1.000 $/Monat** — bei
  aktuellen Tarifen mit 99 €/Monat Solo-Umsatz unrealistisch). Das ist
  unabhängig von unserer eigenen 7-Tage-Löschung (die betrifft nur unsere
  DB, nicht was Vapi selbst mit den Rohdaten macht) und vermutlich nicht
  von dem, was der telefonische Aufzeichnungshinweis für Gäste aktuell
  kommuniziert (nur "wird aufgezeichnet", nicht "kann zum
  KI-Modelltraining verwendet werden") — potenzieller
  Zweckbindungskonflikt (Art. 5 DSGVO), keine Rechtsberatung, nur
  Verdacht. Kein kostenloser Zwischenweg (Trainings-Opt-out ohne volles
  ZDR) in Vapis Doku gefunden. **Nächster Schritt, noch nicht
  durchgeführt:** direkt bei Vapi (`security.vapi.ai`/Support) klären, ob
  (a) es einen günstigeren Trainings-Opt-out ohne 1.000-$-ZDR gibt, (b)
  als Pay-as-you-go-Kunde trotzdem ein unterschriebenes DPA erhältlich
  ist. Bis geklärt: in der Datenschutzerklärung bei Vapi **nicht**
  pauschal "SCC-basiertes DPA" behaupten (anders als bei Anthropic/
  Twilio), sondern neutral halten ("wir prüfen aktuell die
  Vertragsgrundlagen").
  **Recherchierte Alternativen (nur Idee, keine Entscheidung, kein
  Wechsel geplant) — zweifach korrigiert nach Nutzer-Hinweisen
  (23.08.2026):** ursprünglich Synthflow UND Retell AI als reine
  "Vapi-Ersatz"-Infrastruktur gelistet — beide Einordnungen waren zu
  unkritisch, per Nachfrage-Recherche korrigiert:
  - **Synthflow** ("Synthflow macht deselbe wie kiwo"): ist **kein**
    Entwickler-Infrastruktur-Layer, sondern eine fertige No-Code-
    Endkunden-Plattform ("end-to-end Voice AI platform" mit eigener
    Telefoninfrastruktur, No-Code-Flow-Designer, 200+ CRM-Integrationen)
    — Unternehmen bauen damit direkt ihre eigenen KI-Telefonassistenten.
    **Das ist derselbe Markt wie Kiwo/KI-Works selbst**, kein Baustein
    darunter — als Vapi-Ersatz ungeeignet, eher ein weiterer Konkurrent
    (ähnlich `kiwerk.one`, siehe frühere Konkurrenzanalyse in dieser
    Sitzung, auf Nutzer-Wunsch nicht dokumentiert).
  - **Retell AI** ("Retell auch so"): hat zwar (anders als Synthflow)
    eine echte Entwickler-API und wäre technisch als Infrastruktur-Layer
    nutzbar (Self-Service-DPA inkl. SCCs kostenlos per Click-Agreement
    unter click-agreements.retellai.com, granulare Retention pro Agent 1
    Tag–2 Jahre einstellbar) — **positioniert sich aber selbst als
    Hybrid**: vorgefertigte Anwendungsfälle (Rezeption, Terminvergabe,
    Lead-Qualifikation) direkt an Endunternehmen, inklusive eigenem
    White-Label-Angebot. Damit ebenfalls potenziell ein Konkurrent zu
    Kiwo, nicht nur ein sauberer Infrastruktur-Ersatz darunter — Risiko,
    dass ein Anbieter, auf dem wir aufbauen, gleichzeitig direkt um
    dieselben Endkunden wirbt.
  - **Fazit:** bisher **keine** überzeugende "reine Infrastruktur ohne
    Produkt-Konkurrenz"-Alternative zu Vapi gefunden — Bland AI (DPA nur
    Enterprise) bleibt als dritte Option ähnlich schwach wie Vapi selbst.
    Weitere Recherche nötig, falls ein Wechsel je ernsthaft verfolgt
    wird. Ein Wechsel wäre ohnehin **kein kleiner Schritt** —
  `backend/src/vapiAdmin.js`, der komplette Webhook-Handler
  (`backend/src/vapi.js`) und alle Tool-Calling-Flows (Reservierung/
  Bestellung/Rückruf/Stornierung) müssten komplett neu gegen eine andere
  API gebaut werden, kein reiner Konfigurationswechsel.
- **`audit_log` ist kein compliance-taugliches Audit-Log (16.08.2026,
  Nutzer-Nachfrage nach dem neu gebauten Aktivitätsprotokoll) —
  konkrete Lücken:** (1) **Wer:** bei Telefon-Aktionen wird die
  Anrufernummer mitgeloggt, aber interne Aktionen (Agenten-Starts,
  Freigabe-Klicks) lassen sich keiner Person zuordnen — es gibt aktuell
  nur einen einzigen geteilten Admin-Account (`ADMIN_EMAIL`/
  `ADMIN_PASSWORD`), der Login-Token trägt nicht mal einen echten Namen
  (hartcodiert `"Betreiber"`); außerdem wird eine normale
  Freigabe/Ablehnung (z. B. einer Sales-Mail) aktuell gar nicht
  protokolliert, nur Agenten-Läufe und die Social-Veröffentlichung
  selbst. (2) **Rechtsgrundlage:** kein Feld dafür — gehört ohnehin eher
  in ein separates Verarbeitungsverzeichnis (ROPA) als in einzelne
  Log-Zeilen. (3) **Unveränderlichkeit:** ganz normale Postgres-Tabelle,
  das Backend hat vollen Schreibzugriff, kein Append-only-Schutz, kein
  Hash-Chaining, kein WORM-Speicher — Einträge könnten technisch
  verändert/gelöscht werden, ohne dass es auffällt. Das aktuelle
  `audit_log` erfüllt damit das Website-Versprechen "Kiwo protokolliert
  transparent, was es tut", aber NICHT den Anspruch eines rechtlich
  belastbaren Audit-Logs (z. B. bei Betriebsprüfung/Aufsichtsbehörde).
  **Bewusst nicht sofort mitgebaut** — hängt eng an der oben stehenden,
  bereits offenen Rechtsprüfung (AVV/DPIA) und sollte zusammen mit dieser
  angegangen werden, nicht isoliert. Für eine spätere Umsetzung nötig:
  echte Mehrbenutzer-Admin-Identität (aktuell nicht vorhanden),
  lückenlose Protokollierung aller Freigabe-Entscheidungen, technische
  Unveränderlichkeit (z. B. Datenbank-Rechte einschränken oder
  Hash-Chaining).
- **Technisches Sicherheits-Audit (03.08.2026) — konkrete Lücken gefunden**
  (Nutzer-Frage "wie ist ki-works/Kiwo gegen Hacker abgesichert", zwei
  Explore-Agents haben Backend + Server-Infrastruktur geprüft). Positiv
  bestätigt: Passwort-Hashing (scrypt+Salt, `auth.js`), durchgehend
  parametrisierte SQL-Queries (keine SQL-Injection gefunden),
  `customerScope`-Mandantentrennung sauber umgesetzt, keine Secrets im Git
  committet (`.env` sauber ausgeschlossen, Passwörter/Keys werden erst beim
  Server-Install generiert). Konkrete offene Lücken:
  - Kein Rate-Limiting auf Login/öffentlichen Endpunkten (Brute-Force
    aktuell nicht ausgebremst)
  - Vapi-Webhook (`backend/src/vapi.js`) prüft das `X-Vapi-Secret` nur,
    wenn `VAPI_WEBHOOK_SECRET` gesetzt ist — ohne diese Env-Variable wäre
    der Endpunkt für jeden offen
  - Interner Admin-Bypass für Zugriffe von `127.0.0.1` (`auth.js`) — jeder
    Prozess auf demselben Server (z. B. ein kompromittiertes n8n) bekäme
    automatisch Admin-Rechte auf die API
  - Hardcodierte Fallback-Secrets im Code, falls Env-Variablen fehlen
    (`AUTH_SECRET` default `'dev-secret-change-me'` in `auth.js`,
    DB-Connection-String-Fallback in `db.js`) — nur riskant, falls die
    echte Env-Variable in Produktion vergessen wird
  - Keine Sicherheits-Header in nginx (HSTS/CSP/X-Frame-Options fehlen
    komplett), kein Äquivalent zu `helmet` im Backend
  - `README.md` behauptet Basic-Auth auf Dashboard/API per nginx — in der
    tatsächlichen `deploy/nginx/ki-works.conf` nicht umgesetzt (veraltete
    Doku, Schutz kommt aktuell nur aus der App-Ebene)
  - Contabo-Root-Passwort-SSH-Login laut README-Hinweis weiterhin aktiv
    (sollte auf reinen Key-Login umgestellt werden), kein fail2ban
  - Backups (`backup-db.sh`) unverschlüsselt (nur gzip) und nur lokal auf
    dem Server, kein Offsite-Backup
  - Kein dokumentierter Patch-/Update-Prozess für OS/Node/npm
  - Admin-Login vergleicht Passwort nicht zeitkonstant (`===` statt
    constant-time compare) — kleines Risiko

  Noch nichts davon behoben, nur erfasst. Größere Credential-Rotation
  (Contabo-Root-Passwort, im Setup im Klartext geteilte API-Keys) bleibt
  weiterhin zusätzlich offen. **Update (13.08.2026):** Contabo bietet
  inzwischen eine kostenlose Firewall pro Server an — Nutzer hat während
  einer Sitzung mit der Einrichtung begonnen (empfohlene Regeln: eingehend
  nur 22/TCP, 80/TCP, 443/TCP erlauben, Rest blocken). Ob die Firewall
  fertig eingerichtet und dem Server zugewiesen wurde, ist von hier aus
  nicht prüfbar (kein SSH-Zugriff) — beim nächsten Gespräch nachfragen,
  falls nicht von selbst erwähnt.
- **Preise-Fußnote "zzgl. USt." — Rechtsform/USt.-Status ungeklärt
  (23.08.2026, Nutzer-Frage noch offen):** Nutzer wies darauf hin, dass
  die Preise-Fußnote "Alle Preise zzgl. USt." voraussetzt, dass ki-works
  umsatzsteuerpflichtig ist — das ist unklar, solange auch der
  Verantwortlicher-Platzhalter in der Datenschutzerklärung noch nicht
  ausgefüllt ist (siehe oben). Falls Alex als **Kleinunternehmer**
  (§ 6 Abs. 1 Z 27 UStG) firmiert, darf **keine** USt. ausgewiesen
  werden — "zzgl. USt." wäre dann falsch (suggeriert einen Aufschlag,
  der nicht kommt), richtig wäre z. B. "umsatzsteuerbefreit gemäß § 6
  Abs. 1 Z 27 UStG". Frage an Nutzer gestellt (Kleinunternehmer/
  reguläres Einzelunternehmen mit USt-ID/GmbH?), noch nicht beantwortet
  — Fußnote (`landing/src/i18n/*.json`, Key `pricing.footnote`) erst
  danach korrigieren.
- **Nutzungsmessung berechnet nur, bucht nicht ab (23.08.2026, Nutzer-
  Nachfrage "kann das Platform das rechnen für Kunden?")** — Antwort:
  `GET /api/usage` (`backend/src/server.js`) berechnet `overageCost`
  korrekt und zeigt es in der `UsageTile` im Kunden-Dashboard an, aber
  im gesamten Backend gibt es keine Stripe/PayPal/Rechnungs-Integration
  (per Grep bestätigt) — eine Überschreitung muss Alex weiterhin manuell
  in Rechnung stellen. Deckt sich mit dem bereits dokumentierten Stand
  bei „Nutzungsmessung + Anzeige pro Kunde" (17.08.2026): „Automatische
  Abrechnung ist explizit ein späterer, noch nicht begonnener Schritt".
- `backend/sql/dev-seed-cleanup.sql` muss vor echtem Go-Live einmal auf dem
  Server laufen (entfernt `[DEMO]`-Testdaten). **Zusätzlich seit 25.08.2026:**
  vor Go-Live auch den neuen `ki-works-demo-refresh.timer` deaktivieren
  (`systemctl disable --now ki-works-demo-refresh.timer`) und alle
  `[AUTO-DEMO]`-markierten Venezia-Einträge einmalig per Hand löschen
  (`DELETE FROM reservations/orders WHERE notes LIKE '%[AUTO-DEMO]%'`,
  `DELETE FROM calls WHERE summary LIKE '[AUTO-DEMO]%'`) — siehe „Bereits
  erledigt" für den Auto-Refresh selbst.
- **Vapi "Publish"-Problem** (Details siehe „Bereits erledigt"): jeder neue/
  geänderte Kunde braucht aktuell einen manuellen "Publish"-Klick im
  Vapi-Dashboard, sonst nimmt der Assistent keine Anrufe an — noch kein
  API-Weg gefunden, um das zu automatisieren
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
  **Vollständige Bestandsaufnahme (23.08.2026, auf Nutzer-Nachfrage
  "wo ist Claude-API-Guthaben notwendig"):** verbraucht unser eigenes
  Anthropic-Guthaben (`ANTHROPIC_API_KEY`) an sieben Stellen: (1)
  Anruf-Ergebnis-Klassifizierung (jeder Anruf, siehe oben), (2)
  Anruf-Zusammenfassung als Fallback (`summarizeCall`, nur falls Vapi
  keine eigene liefert — selten), (3) KI-Empfehlungen
  (`/api/recommendations`, on-demand), (4) Sales-Agent (`salesAgent.js`,
  inkl. Web-Search/-Fetch-Zusatzkosten), (5) Social-Media-Agent
  (`socialAgent.js`), (6) Web-Chat-Widget "Kiwo" auf ki-works.eu
  (`webchat.js`, `/api/public/webchat` — bei jeder Besucher-Nachricht),
  (7) das einmalige Übersetzungs-Backfill-Skript. **Neu verifiziert:
  das eigentliche Telefongespräch mit Kiwo selbst (Vapi-Assistent,
  `model: {provider: 'anthropic', ...}` in `vapiAdmin.js`) hängt NICHT
  an unserem eigenen Anthropic-Guthaben** — im Vapi-Setup ist kein
  eigener API-Key/`credentialId` hinterlegt, Vapi rechnet das laut deren
  Doku dann über die eigene Anthropic-Anbindung ab und verrechnet es im
  Vapi-Minutenpreis. Erklärt, warum Kiwo am Telefon durchgehend
  funktionierte, obwohl unser Anthropic-Guthaben mehrfach bei 0 war —
  betroffen sind wirklich nur die 7 Punkte oben.

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
