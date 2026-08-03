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
- Landingpage: neues Mega-Menü "Lösungen" in der Navigation (Desktop-Dropdown
  + Mobile-Accordion) — Rollen jetzt gruppiert in "Kundenkontakt" (Reception,
  Sales, Support, Orders — live) und "Interne Prozesse" (Office live, plus
  Recruiting/Collection/Onboarding/Finance als "bald verfügbar"). Branchen
  um Autowerkstätten und Immobilien erweitert. Rollen-Sektion zeigt alle
  Rollen als Karten, "bald"-Rollen deutlich gedimmt ohne CTA-Link. Erster
  Baustein des vereinbarten Website-Relaunchs (Marketing-zuerst-Ansatz,
  siehe „Ideen & Zukunftsplanung"), nächster Schritt: eigene Matrix-/
  Filter-Seite „Rolle × Branche".

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
- **Multi-Tenant-SaaS-Architektur:** Nutzer-Brainstorming — ein einziger
  Kiwo-Server soll mehrere Unternehmen/Branchen bedienen können, jeder Kunde
  mit eigener Wissensbasis/Prompts und getrennten Daten (Restaurants, Hotels,
  Handwerksbetriebe usw.), als Basis für ein skalierbares SaaS-Angebot.
  Einschätzung dazu: die Grundarchitektur (ein Server, eine DB,
  `restaurant_id`-Scoping über alle Tabellen, `customerScope`) trägt das
  schon weitgehend. Lücke (1) "Vapi-Assistent-Erstellung manuell/hardcoded
  auf Venezia" ist inzwischen behoben (automatisch bei Kundenanlage, siehe
  „Bereits erledigt"). Verbleibende Lücken: (2) Prompt/Tools sind
  Restaurant-spezifisch (Reservierung/Bestellung) — andere Branchen bräuchten
  eigene Prompt-/Tool-Vorlagen (siehe auch Branchen-Brainstorming unten);
  (3) Isolationsmodell bewusst als shared DB + Zeilen-Trennung vorgeschlagen
  (kein DB-pro-Kunde). Billing/Nutzungsmessung fehlt komplett. Noch nichts
  entschieden oder gebaut, nur vorgemerkt.
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
- **Mehrsprachigkeit (Englisch zusätzlich zu Deutsch):** Nutzer-Frage, ob
  Kiwo auch Englisch können soll. Technisch möglich, aber Transkription
  (Deepgram, aktuell fest `"language": "de"`) UND Stimme (Azure
  `de-AT-IngridNeural`, reine Deutsch-Stimme) müssten beide auf mehrsprachig
  umgestellt werden, sonst klingt/versteht Kiwo Englisch schlecht. Zwei
  Varianten besprochen: automatische Spracherkennung vs. nur auf
  Gast-Wunsch umschalten. Noch nicht entschieden, nichts gebaut.
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
  - Neue Rollen: **Kiwo Recruiter** (Bewerber-Erstqualifizierung), **Kiwo
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
    Systemhäuser zum Weiterverkauf unter eigener Marke anbieten.
    Detaillierter durchdacht: braucht (1) neue Agentur-Ebene über den
    Betrieben (jeder Betrieb gehört einer Agentur, Rechte-Modell über
    `customerScope` hinaus erweitern), (2) austauschbares Branding
    (Logo/Farben/Name) pro Agentur im Dashboard statt hartcodiertem
    "KI-Works"-Design, (3) zweistufige Abrechnung (Großhandel an Agentur,
    Agentur an Endkunde) — hängt am selben fehlenden Preismodell wie beim
    Admin-Dashboard-Punkt, (4) Support-Trennung (Agentur = Erstsupport).
    Größter Aufwand ist Branding-Flexibilität + Billing, nicht die
    Multi-Tenant-Grundarchitektur (die trägt schon). Nutzer-Priorität:
    **explizit für später** — zuerst sollen alle Kiwo-Rollen, Branchen und
    das neue Design fertig werden.
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

## Offene Punkte (Stand zuletzt bekannt)

- Anthropic/Vapi-Billing-Guthaben im Auge behalten (Vapi läuft auf
  Pay-as-you-go-Guthaben, Twilio jetzt kein Trial mehr); API-Key-Rotation
  weiterhin ausstehend
- Impressum/Datenschutz-Platzhalter noch **rechtlich** prüfen (Technik steht,
  kein Rechtsgutachten); AVV-Verträge fehlen noch. Recherchiert:
  Anthropics AVV (mit SCCs) ist automatisch Teil ihrer Commercial Terms of
  Service, sobald man den kommerziellen API-Zugang nutzt (kein separater
  Unterschriftsprozess) — Text zum Nachweis unter
  anthropic.com/legal/data-processing-addendum. Für Vapi/Twilio muss das
  gleiche noch einzeln geprüft werden. Zusätzlich vermutlich eine formelle
  **Datenschutz-Folgenabschätzung (DPIA)** nötig, da bei KI-Systemen oft
  "hohes Risiko" vermutet wird — bei der geplanten Rechtsprüfung mit
  einplanen. Ein Wechsel auf EU-KI-Anbieter (Aleph Alpha/Mistral etc.)
  wurde geprüft und **nicht empfohlen** — mit AVV+SCCs ist Anthropic aus
  den USA rechtlich nutzbar, ein Anbieterwechsel wäre unnötiger Aufwand.
  Der EU AI Act (Transparenzpflicht "das ist eine KI") ist über die
  bestehende Kiwo-Begrüßung vermutlich schon erfüllt.
- Größere Credential-Rotation nötig (Contabo-Root-Passwort, im Setup im
  Klartext geteilte API-Keys)
- `backend/sql/dev-seed-cleanup.sql` muss vor echtem Go-Live einmal auf dem
  Server laufen (entfernt `[DEMO]`-Testdaten)
- Test-Kunde "Kunde Test" (angelegt zum Testen der automatischen
  Vapi-Einrichtung) ist NICHT `[DEMO]`-markiert und wird vom Cleanup-Skript
  daher nicht erfasst — vor Go-Live manuell aus der `restaurants`-Tabelle
  entfernen (bzw. den zugehörigen Vapi-Assistenten löschen)
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
