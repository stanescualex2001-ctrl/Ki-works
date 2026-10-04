# Offene Punkte – ausführliche Fassung (Archiv)


- **Mehrsprachigkeit am Telefon — Teil A + Teil B ausgerollt und live
  getestet (22.–23.09.2026), rumänische Stimme final bei Azure/Alina
  belassen.** Teil B: `sync-demo-squad` wurde ausgelöst, 4 neue
  Vapi-Assistenten + 1 Squad erfolgreich angelegt (Squad
  `59c5e394-b533-45a1-a360-b44b22e8927c`, Sprachauswahl-Assistent
  `a10ce7d9-9427-446c-b0c4-bc0f24486582`, DE `c13524ad-b345-4ea7-ad36-
  f1cfe05cab80`, EN `844e26a9-b06b-42ed-9e02-dde7efa43d83`, RO
  `952176e2-17c2-43e8-921e-fa036cef474e`), im Vapi-Dashboard "Publish"
  geklickt. Erster Testanruf auf Rumänisch fand die Stimme (Azure
  `ro-RO-AlinaNeural`) unnatürlich/roboterhaft + falsch ausgesprochen —
  daraufhin direkt im Vapi-Editor mehrere ElevenLabs-Alternativen
  probegehört ("Ana-Maria" `ieyDbsg4D73NUao7PAUt` abgelehnt, "Eva"
  `mSQ52FoQiuRydZA1FOpg`/"Liviu Mihai" `Q1khAM9K4Mi6p5TK0ueC` vorgeschlagen
  aber nie final bestätigt). **Nach weiteren Tests Nutzer-Entscheidung:
  bei Azure/Alina bleiben** — passt für den RO-Assistenten. Kein
  Code-Fix nötig, `voiceOptions.js`/`vapiAdmin.js` bleiben unverändert.
  **Weiterhin klein und separat offen:** die Sprachauswahl-Begrüßung
  selbst (`buildLanguageSelectBody()`, ein Assistent liest den ganzen
  dreisprachigen Satz "Für Deutsch... — for English... — pentru
  română...") läuft komplett auf der deutschen Azure-Stimme (Ingrid) —
  der rumänische Teilsatz darin klingt dadurch mit deutschem Akzent.
  Niedrige Priorität (nur ein kurzer Begrüßungssatz, nicht das
  eigentliche Gespräch), bisher nicht angegangen.

- **"Forbidden"-Mobilfunk-Test nach dem AAAA-Fix noch ausstehend
  (26.09.2026, Test für Dienstag 29.09. angekündigt):** die vermutliche
  Ursache (falscher AAAA-Eintrag für ki-works.eu, siehe „Bereits
  erledigt") ist behoben — Nutzer testet ki-works.eu am Dienstag nochmal
  auf demselben Handy/Mobilfunknetz, das vorher "Forbidden" zeigte, um
  das final zu bestätigen. Falls das Problem doch weiterbesteht, war die
  Arbeitshypothese (Mobilfunk-Provider-Filter) nicht korrekt und es
  braucht eine neue Diagnose.

- **Live-Anruf-Banner — bis auf einen Punkt erledigt (06.09.2026):** Deploy
  von `landing/`+`dashboard/` sowie Venezia-Nummer geleert/"Ki Works"-Nummer
  auf +43 726 223 417 gesetzt sind laut Nutzer-Bestätigung ("alles erledigt")
  durch — Nutzer hat dabei auch live im Vapi-Dashboard "ki-works – Ki Works"
  als Assistent für die Inbound-Nummer ausgewählt. Wissensdatenbank für
  "Ki Works" mehrfach überarbeitet und final akzeptiert (siehe unten,
  inkl. Reseller/White-Label-Absatz). **Einzig unbestätigt:** ob im
  Vapi-Dashboard nach der Nummer-Zuordnung auch tatsächlich auf "Publish"
  geklickt wurde (bekannte Einschränkung, siehe "Vapi Publish-Problem")
  — beim nächsten Gespräch nachfragen bzw. bei einem Testanruf verifizieren.
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
  Social-Media-Agent zusätzlich: eine echte Veröffentlichung (nicht nur
  der Text-/Bildentwurf) setzt weiterhin die offene Meta-App-Einrichtung
  voraus (siehe „Social-Media-Automatisierung" unten) — ohne `FB_PAGE_ID`/
  `FB_PAGE_ACCESS_TOKEN`/`IG_BUSINESS_ACCOUNT_ID` in `/etc/ki-works/
  ki-works.env` schlägt eine Freigabe im Dashboard kontrolliert mit
  Fehlermeldung fehl (Entwurf bleibt erhalten, kein Datenverlust).
- Anthropic/Vapi-Billing-Guthaben im Auge behalten (Vapi läuft auf
  Pay-as-you-go-Guthaben, Twilio jetzt kein Trial mehr)
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

  Noch nichts davon behoben, nur erfasst. **Update (08.09.2026): die
  Credential-Rotation ist erledigt** — Auslöser war ein versehentlich im
  Chat geteilter Screenshot mit dem originalen Setup-Text (Contabo-
  Root-Passwort, Anthropic- und Vapi-Key im Klartext). Alle drei rotiert:
  neuer Anthropic-Key (ohne Ablaufdatum, da der Key statisch in
  `/etc/ki-works/ki-works.env` liegt und nicht automatisch erneuert wird),
  neuer Vapi Private-API-Key (bewusst ohne "Allowed Assistants"-
  Einschränkung gelassen, da das Backend auch künftige, noch nicht
  existierende Kundenassistenten per API anlegen muss), Contabo-Root-
  Passwort per "Reset credentials" im Kundencenter neu gesetzt. Beide
  API-Keys in `/etc/ki-works/ki-works.env` eingetragen,
  `systemctl restart ki-works-api` sauber ohne Auth-Fehler durchgelaufen
  (`journalctl` geprüft). SSH-Key-only-Login (statt Passwort) weiterhin
  offen, siehe Punkt oben. **Update (23.09.2026): Contabo Cloud-Firewall
  fertig eingerichtet.** Die am 13.08.2026 begonnene, seither nie
  zugewiesene Firewall "ki-works-server" (Contabo-Kundencenter, nicht
  SSH) war bis dahin inaktiv (0 zugewiesene VPS/VDS) — beim Prüfen der
  „Forbidden"-Diagnose (siehe „Offene Punkte") aufgefallen und direkt
  fertiggestellt: alle drei Erlauben-Regeln (HTTPS/HTTP/SSH) laufen jetzt
  auf Quelle "Any" (IPv4 **und** IPv6 — wichtig, sonst hätte die Aktivierung
  jeglichen IPv6-Zugriff gekappt, inkl. der gerade erst gefixten
  Mobilfunk-IPv6-Erreichbarkeit), alles andere wird per Default-Regel
  gedroppt. Firewall dem Server `vmi3419465` (213.199.42.208) zugewiesen
  und aktiv. **War NICHT die Ursache des weiterhin offenen
  Forbidden-Problems** (war zum Zeitpunkt des Auftretens ja inaktiv),
  schließt aber eine reale, lange offene Sicherheitslücke.
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

