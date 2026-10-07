# Ideen & Zukunftsplanung (noch nicht entschieden/gebaut)


- **Urgency-Erzeugung für ki-works.eu + automatisches Billing —
  Brainstorming (18.09.2026):** Nutzer-Frage "wie können wir urgency für
  kiwo/ki-works generieren?" — zwei Hebel besprochen, beide nur vorgemerkt,
  nichts umgesetzt: (1) **Kapazitäts-Knappheit** (echte Begrenzung durch
  aktuell manuelle Einrichtung, z. B. "nur X neue Kunden/Monat" oder ein
  Kiwo pro Branche/Ort) als ehrlichere Alternative zu erfundener
  Verknappung; (2) **Preisgarantie**, vom Nutzer präzisiert auf **1 Jahr
  fixer Preis** als Einstiegs-Anreiz — sollte auf der Preise-Seite
  kommuniziert werden, sobald entschieden (aktuelle Marge ~40-49%
  federt das ab). Nutzer wollte danach zusätzlich **Self-Service**
  durchdenken (Kunde bestellt/bezahlt selbst, ohne dass Alex jeden Schritt
  manuell macht) — dafür fehlt bisher (a) jede Zahlungs-/Abo-Integration
  und (b) wäre das bekannte Vapi-"Publish"-Problem ein echter Blocker
  (neue Assistenten brauchen weiterhin einen manuellen Klick im
  Vapi-Dashboard, siehe „Vapi Publish-Problem" in den Offenen Punkten) —
  müsste vor einem echten Self-Service-Bestell-Flow gelöst sein, sonst
  bliebe ein frisch zahlender Kunde erstmal ohne funktionierenden
  Telefonagenten. Auf Nachfrage zum Billing-Anbieter empfohlen: kein
  reiner IBAN-Vergleich, sondern ein Zahlungsanbieter mit
  **SEPA-Lastschrift-Unterstützung** (gewohntes Verfahren bei
  AT/DE-B2B-Kunden) plus Kreditkarte als Alternative — **Stripe**
  (Abo-Verwaltung, USt.-Handling, SEPA+Karte in einem, aber etwas teurer)
  vs. **GoCardless** (günstiger, reiner SEPA-Spezialist ohne
  Kreditkarten-Support) als zwei Kandidaten genannt, noch keine
  Entscheidung. Hängt inhaltlich mit dem länger offenen Punkt "kein
  Preismodell/Billing pro Kunde" (siehe „Admin-Dashboard überarbeiten"
  weiter unten) zusammen — bisher nirgends im Projekt eine
  Zahlungs-Integration vorhanden.
- **Kiwo WhatsApp — Architektur ausgearbeitet, noch nicht gebaut
  (14.09.2026):** Nutzer-Frage "kiwo whatsapp. was kann sein?" —
  Konzept: gleiche Claude-Logik wie das bestehende Web-Chat-Widget
  (`backend/src/webchat.js`, Wissensdatenbank/FAQ, `capture_lead`-Tool),
  nur über einen anderen Kanal. Twilio (bereits für SMS angebunden,
  `backend/src/sms.js`) bietet auch WhatsApp Business API über denselben
  Messages-Endpunkt (`whatsapp:`-Präfix vor der Nummer) — technisch eine
  kleine Erweiterung, kein neuer Anbieter. **Größter Unterschied zum
  Web-Chat:** dort hält der Browser den Gesprächsverlauf im Speicher; bei
  WhatsApp muss das Backend selbst eine Konversationshistorie über
  Stunden/Tage hinweg vorhalten (neue, kleine DB-Tabelle nötig,
  Restaurant+Telefonnummer → letzte Nachrichten, Ablauf nach z. B.
  24 Std. Inaktivität). **Größte Hürde ist nicht Code, sondern extern:**
  Twilio verlangt eine eigene WhatsApp-Business-Absenderfreigabe inkl.
  Meta-Business-Verifizierung — kann Tage bis Wochen dauern; Nachrichten,
  die Kiwo von sich aus schickt (außerhalb 24 Std. nach der letzten
  Gast-Nachricht), brauchen von Meta vorab genehmigte Vorlagen. Outbound
  (Kiwo schreibt von sich aus, z. B. Rückruf-Antwort) würde
  `sendSms()` um eine `sendWhatsapp()`-Variante erweitern (fast 1:1
  derselbe Code) — verknüpft direkt mit der ebenfalls noch offenen Idee
  "Automatische Rückmeldung an den Gast" weiter unten. Empfehlung für den
  Start: Pilot nur für "Ki Works" selbst (gleiches Muster wie beim
  Web-Chat-Widget), da die externe Freigabe ohnehin zuerst kommen muss.
  Nur Konzept — nichts gebaut, externe Freigabe noch nicht angestoßen.
  Direkter Nebenfund bei der Ausarbeitung: die Website behauptete
  WhatsApp bereits an 6 Stellen als existierenden Kanal — auf
  Nutzer-Wunsch entfernt, siehe „Bereits erledigt".
- **pixelpress.at ↔ ki-works.eu bewusst NICHT öffentlich verknüpfen —
  ENTSCHIEDEN, kein Vorhaben (11.09.2026):** Nutzer wollte auf pixelpress.at
  etwas zu ki-works/KI-Projekten präsentieren (z. B. Case-Study mit
  Live-Demo der Kiwo-Telefon-/Chat-Funktion, um Kunden zu zeigen, dass
  pixelpress echte KI-Projekte baut). Nach Abwägung des Nachteils dagegen
  entschieden: ki-works positioniert sich bewusst als eigenständige,
  neutrale Plattform — das trägt vor allem das Reseller-/Agentur-
  Partnerprogramm (siehe „White-Label/Agentur-Partner-Programm" oben).
  Würde öffentlich sichtbar, dass ki-works ein Projekt der
  Ein-Personen-Agentur pixelpress ist, wirkt das für eine fremde Agentur,
  die ki-works selbst weiterverkaufen soll, weniger vertrauenswürdig — sie
  hinge dann sichtbar an der Infrastruktur eines möglichen Mitbewerbers
  (pixelpress macht ebenfalls Web-/KI-Projekte). Für Restaurant-Endkunden
  wäre das egal, aber der Nachteil trifft genau den Reseller-Pitch.
  Nutzer-Entscheidung: **beide bleiben öffentlich getrennt**, keine
  Case-Study/Verlinkung von ki-works auf pixelpress.at (oder umgekehrt).
  Nichts umgesetzt, nichts zu tun — nur damit die Idee nicht in einer
  künftigen Sitzung erneut vorgeschlagen wird.
- **Automatische Rückmeldung an den Gast:** Aktuell schließt sich der
  "Rückruf gewünscht"-Kreislauf nicht automatisch — der Betrieb trägt die
  Antwort zwar in die FAQ ein, muss den Gast aber selbst zurückrufen, um ihm
  die Antwort mitzuteilen (keine automatische SMS/Benachrichtigung an den
  Gast, sobald die Antwort gespeichert wird). Nutzer fand die Idee einer
  automatischen SMS an den Gast gut, aber bewusst nur vorgemerkt, noch nicht
  gebaut.
  **Konkreter Anwendungsfall ergänzt (07.10.2026, Werkstatt-Kostenvoranschlag):**
  Kiwo kann einen echten Kostenvoranschlag nicht selbst erstellen (braucht
  Diagnose vor Ort), aber einen bereits von der Werkstatt erstellten Betrag
  **übermitteln** — drei Varianten unterschiedlichen Aufwands: (1) **leicht:**
  automatische SMS, sobald Personal den Betrag bei der bestehenden
  `request_callback`-Zeile im Dashboard einträgt — nutzt `backend/src/sms.js`
  fast 1:1, genau die oben beschriebene, bereits vorgemerkte Automatisierung;
  (2) **mittel:** ruft der Kunde selbst zurück, könnte Kiwo den gespeicherten
  Betrag nachschlagen und vorlesen — braucht ein neues Lookup-Tool, aber keine
  neue Infrastruktur; (3) **schwerer, eigenes Thema:** Kiwo ruft von sich aus
  aktiv an (echter Outbound-Anruf) — gibt es in diesem Projekt noch gar nicht
  (Vapi kann das technisch, aber nirgends angebunden), separates, bereits an
  anderer Stelle vorgemerktes Thema "Voice-Outbound für Karteileichen".
- **Live-Weiterleitung an echten Menschen — GEBAUT (14.09.2026), siehe
  „Bereits erledigt".** War hier lange nur vorgemerkt; auf Nutzer-Nachfrage
  "kann Kiwo nicht wissen, ob außerhalb der Arbeitsstunden ist" jetzt
  genau mit der ursprünglich befürchteten Contra-Einschränkung gelöst:
  Live-Transfer nur während der Öffnungszeiten, sonst automatisch
  Rückruf-Angebot statt unbeantworteter Weiterleitung.
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
- **Andere Branchen als Restaurants — Terminbuchung für Handwerker/
  Friseure/Autowerkstätten/Immobilien inzwischen GEBAUT (14.09.2026, siehe
  „Bereits erledigt").** Ursprüngliches Brainstorming, was zum Muster
  Terminbuchung+FAQ+Rückruf passt: Arztpraxis/Zahnarzt/Physio (technisch
  passend, aber DSGVO-Sonderkategorie-Daten — bewusst weiterhin "bald",
  nicht live), Friseur/Kosmetik/Wellness ✅, Handwerker/KFZ-Werkstatt ✅,
  Hotels (Zimmer- statt Tischreservierung — braucht Zeitraum statt
  Einzeltermin, bewusst weiterhin "bald"), Anwaltskanzlei/
  Immobilienmakler (Ersttermin/Besichtigung) ✅. Schwieriger bleiben
  weiterhin: Branchen mit komplexer Logik statt einfachem Terminslot
  (Online-Shop mit Warenkorb) oder starker Regulierung (Bank/Versicherung).
- **Mehrsprachigkeit am Telefon — GEBAUT (22.09.2026), siehe „Bereits
  erledigt".** War hier lange nur eingeplant; Nutzer hat nach Klärung der
  Deepgram-Rumänisch-Frage (kein Blocker, siehe Vorgeschichte unten) den
  Bau direkt beauftragt.
  **Vorgeschichte (19.08.2026):** Nutzer-Frage "spricht kiwo de en und ro
  schon? Vielleicht in gleiche Gespräch?" — Recherche ergab einen harten
  technischen Blocker gegen Live-Sprachwechsel *innerhalb* eines Anrufs:
  Deepgram Nova-3 (aktuell für die Transkription genutzt, fest
  `"language": "de"`) unterstützt Echtzeit-Sprach-Auto-Erkennung/-Wechsel
  ("Code-Switching") nur für 10 Sprachen (Englisch, Spanisch, Französisch,
  Deutsch, Hindi, Russisch, Portugiesisch, Japanisch, Italienisch,
  Niederländisch) — **Rumänisch ist NICHT darunter**.
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
  - **Live-Agent-Handover**: deckte sich mit der "Live-Weiterleitung an
    echten Menschen"-Idee — inzwischen gebaut, siehe „Bereits erledigt"
    (14.09.2026)
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

- **Sales-Agent-Kosten drastisch gesenkt (30.08.2026):** Auslöser — ein
  einzelner Sales-Agent-Lauf hat laut Anthropic-Konsole 4,14 Mio.
  Eingabe-Tokens auf `claude-sonnet-5` verbraucht (~9 $), obwohl er wegen
  eines 504-Fehlers nicht mal im Dashboard sichtbar wurde. Ursache: die
  `pause_turn`-Retry-Schleife in `backend/src/salesAgent.js` (bis zu 3
  Versuche bei vielen Websuchen) hat bei jedem Versuch den kompletten
  bisherigen Verlauf inkl. aller Web-Search-/Web-Fetch-Ergebnisse erneut
  voll abgerechnet — es gab dort kein Prompt Caching. Behoben: (1)
  automatisches Caching aktiviert (`cache_control: {type: 'ephemeral'}`
  als Top-Level-Feld im `client.messages.create()`-Aufruf) — ab dem 2.
  Retry-Versuch wird der bereits gesendete Verlauf zu 10 % des Preises aus
  dem Cache gelesen statt voll neu abgerechnet; (2) `max_content_tokens:
  3000` auf dem `web_fetch`-Tool ergänzt, begrenzt die Textmenge pro
  abgerufener Seite. `max_uses` (15 Websuchen/20 Seitenabrufe) bewusst
  unverändert gelassen, da erst kürzlich gezielt erhöht für bessere
  E-Mail-Fundquote. **Andere Agenten geprüft, keine Änderung nötig:**
  `claude.js` (Anruf-Zusammenfassung/-Klassifizierung/Empfehlungen/
  Übersetzung) läuft bereits auf `claude-haiku-4-5-20251001` — schon das
  günstigste Modell. `socialAgent.js` ist mit ~200 Wörtern Prompt (unter
  der 1024-Token-Cache-Mindestgröße) ohnehin schon der günstigste der
  größeren Agenten, kein Caching nötig. `webchat.js` hatte bereits am
  selben Tag Caching bekommen (siehe Eintrag oben). **Modellwahl bewusst
  bei `claude-sonnet-5` belassen** (Sales-/Social-Agent) statt auf Haiku
  zu wechseln: `claude-haiku-4-5` unterstützt die genutzten Web-Tools
  `web_search_20260209`/`web_fetch_20260209` (dynamische Filterung) laut
  Anthropic-Doku nicht — ein Wechsel würde auf ältere Basic-Varianten ohne
  Filterung zurückfallen, potenziell mehr Rohtext laden statt weniger, und
  die Qualität von Akquise-Mails (nach außen sichtbarer Content) senken.
  Da das fehlende Caching der eigentliche Kostentreiber war, nicht das
  Modell, bringt der Caching-Fix den weitaus größeren Hebel ohne
  Qualitätsverlust. Nur Syntax-Check möglich (kein echter Testlauf,
  Standing Rule Nutzungsguthaben) — Wirkung zeigt sich beim nächsten
  echten Lauf über `cache_read_input_tokens` > 0 in der Anthropic-Konsole.
  **Auf dem Produktivserver ausgerollt (Nutzer-Bestätigung 30.08.2026,**
  reiner Backend-Neustart, kein Frontend-Build/keine Migration nötig).
  **Nachfass-Check zu den neuen Kosten in einer Woche vereinbart** — der
  automatische `send_later`-Reminder dafür ließ sich technisch nicht
  einrichten ("MCP tool call requires approval", dieselbe bekannte
  Einschränkung wie bei `create_trigger` für die Social-Media-Routine,
  siehe „Social-Media-Automatisierung" oben) — Nutzer muss selbst
  nachfragen, wenn er die Anthropic-Konsolen-Zahlen vom nächsten
  Sales-Agent-Lauf mit den früheren 4,14 Mio. Tokens vergleichen will.
- **Kunden-Dashboard-Vorschau: "Ihr Dashboard ansehen"-Link auf Mobile
  nach unten verschoben (30.08.2026):** Nutzer-Screenshot zeigte den
  Link zwischen den vier Vertrauensargumenten und dem Screenshot-Mockup
  — auf Mobile (Grid stapelt einspaltig) stand er dadurch VOR dem
  Übersicht-Screenshot und der schwebenden Anruf-Transkript-Karte, statt
  danach. `landing/src/App.jsx` (Dashboard-Sektion): der Link existiert
  jetzt zweimal — eine Desktop-Version (`hidden md:inline-flex`, bleibt
  an der bisherigen Stelle im Textblock links) und eine neue
  Mobile-Version (`md:hidden`) direkt nach der Anruf-Transkript-Karte
  im Bild-Block. Ab `md:` (Grid wird zweispaltig) ist die Mobile-Version
  unsichtbar, keine Dopplung. Build + Prerender fehlerfrei geprüft.
- **Header: "Kunden-Login"/"Kiwo testen" auf Mobile getauscht + zwei
  Nachbesserungen (30.08.2026):** Nutzer-Fund — auf großen Handys (S25
  Ultra) blieb "Kunden-Login" trotz einer gemeldeten Breite über 640px
  unsichtbar. Ursache geklärt: die CSS-Viewport-Breite (die für
  Tailwinds `sm:`-Grenze zählt) ist bei solchen Geräten trotz hoher
  physischer Auflösung nur ca. 412-480px — kein Bug, die 640px-Grenze
  aus der Nachschärfung vom 13.08.2026 bleibt bestehen. Auf
  Nutzer-Wunsch stattdessen die Sichtbarkeits-Regel der beiden
  CTA-Buttons in `landing/src/components/Header.jsx` getauscht: auf
  Handy-Breiten (< 640px) steht jetzt "Kunden-Login" in der Kopfzeile
  statt "Kiwo testen" (Commit `a515626`). **Nachbesserung, direkt vom
  Nutzer nach dem Livetest gemeldet:** (1) "Kunden-Login" stand dadurch
  doppelt da (schon fest in der Kopfzeile + weiterhin als eigene Zeile
  im aufklappbaren Mobile-Menü) — Menü-Zeile entfernt; (2) "Kiwo testen"
  war auf Mobile dadurch nur noch als unauffälliger Text-Link
  ("Live testen") im Menü erreichbar, wirkte für den Nutzer wie
  komplett verschwunden — auf Nachfrage entschieden (`AskUserQuestion`:
  "Nur im Menü, aber als CTA-Button gestalten"), der bisherige
  "Live testen"-Text-Link im Mobile-Menü wurde zu einer echten
  CTA-Pille (Farbverlauf, wie in der Kopfzeile) mit dem Label
  "Kiwo testen" umgestaltet, statt eines zusätzlichen zweiten
  Menüpunkts (Commit `fa90f95`). Desktop/Tablet (≥ 640px) war von der
  gesamten Änderung nie betroffen — dort waren und bleiben beide Buttons
  nebeneinander sichtbar. **Sofort-Nachbesserung (Nutzer-Fund):** die
  neue "Kiwo testen"-Pille im Menü hatte anfangs keine eigene
  Breiten-Bedingung — im Bereich 640-1439px (Nav schon zum Hamburger
  eingeklappt, "Kiwo testen" in der Kopfzeile aber schon sichtbar)
  erschien sie beim Öffnen des Menüs zusätzlich zur bereits sichtbaren
  Kopfzeilen-Pille — zwei "Kiwo testen"-Buttons gleichzeitig auf dem
  Screen. Mit `sm:hidden` behoben (Commit `76509a5`), damit die
  Menü-Pille exakt im Gegenzug zur Kopfzeilen-Pille sichtbar ist (nur
  unter 640px). Build + Prerender nach jedem Schritt fehlerfrei
  geprüft, kein Playwright-Screenshot-Test möglich (Tool in dieser
  Sitzung nicht verfügbar) — nur per Code-Analyse verifiziert. **Lehre:**
  bei einem neuen, breitenbedingt sichtbaren UI-Element in einer bereits
  bestehenden Breiten-Logik immer sofort die komplementäre
  Sichtbarkeits-Bedingung mitdenken, nicht nur den ursprünglich
  gemeldeten Breitenbereich.
- **ROI-Rechner: Ergebnis-Box auf Mobile an den Anfang gestellt
  (03.09.2026):** Nutzer-Idee nach eigenem Live-Screenshot — auf Mobile
  stapelten sich bisher erst alle 8 Eingabefelder + 3 Paket-Karten,
  bevor überhaupt eine Ergebniszahl sichtbar war (auf Desktop stand die
  Box dank des zweispaltigen Layouts schon immer direkt daneben).
  `landing/src/App.jsx` (`ROICalc`): die "Geschätzter Netto-Nutzen"-Box
  (inkl. ROI/Amortisation) wurde in eine gemeinsame `heroContent`-
  Variable ausgelagert, die jetzt zweimal gerendert wird — einmal ganz
  oben (`lg:hidden`, nur Mobile/Tablet) mit den Default-Werten
  vorberechnet, einmal an der bisherigen Stelle (`hidden lg:block`, nur
  Desktop) — kein doppelter Code, nur sichtbarkeitsgesteuert. Reagiert
  live auf die Eingaben weiter unten, genau wie zuvor. Build + Prerender
  fehlerfrei geprüft.
- **Fix: ROI-Rechner Zahlenfeld blieb beim Löschen bei 0 hängen
  (03.09.2026):** Nutzer-Fund per Screenshot — das Zahlenfeld
  ("Ø Wert pro gewonnenem Kontakt") ließ sich nicht leeren, neue Ziffern
  landeten hinter der stehengebliebenen "0" (z. B. "0220" statt "220").
  Ursache in `RoiNumberField` (`landing/src/App.jsx`): `value={value}`
  war direkt an die Zahl gebunden — beim Löschen der letzten Ziffer wird
  `Number('')` sofort zu `0`, der Zustand ändert sich dadurch nicht
  (0 → 0), React rendert nicht neu, das Feld bleibt optisch bei "0"
  hängen. Fix: eigener Text-Zustand im Feld, der während der Eingabe
  leer sein darf; die Zahl wird trotzdem bei jedem gültigen Zwischenwert
  live an den Rechner gemeldet, beim Verlassen des Feldes springt ein
  leerer/ungültiger Wert auf den letzten gültigen Stand zurück. Betrifft
  beide Zahlenfelder im Rechner (Stundensatz + Wert pro Kontakt), da
  beide dieselbe Komponente nutzen. Build + Prerender fehlerfrei
  geprüft.
- **Business-Dashboard: verlorene Freigaben, falsches Branding bei
  Social-Posts, fehlender Website-Link bei Sales-Leads (05.09.2026):**
  drei Nutzer-Funde in einer Sitzung. (1) **Freigaben-Verlust:** ein
  versehentlicher Klick auf "Freigeben"/"Ablehnen" bei einer Sales-/
  Social-Zeile machte deren Inhalt (Mailtext, Kontakt-E-Mail, Bild)
  unwiderruflich unzugänglich — `GET /api/pending-actions` liefert nur
  `status='pending'`, und die Entscheidung wurde bisher nicht mit vollem
  Inhalt geloggt. Fix: `PATCH /api/pending-actions/:id`
  (`backend/src/server.js`) schreibt jetzt bei jeder Sales-Entscheidung
  und jeder Social-Ablehnung/-Fremdbusiness-Freigabe einen `logAction()`-
  Eintrag mit dem kompletten Inhalt (Betreff/Text/Kontakt-E-Mail bzw.
  Bild/Caption) in `audit_log`. Neue Komponenten `SalesEmailAuditDetail`/
  `SocialPostAuditDetail` (`business-dashboard/src/App.jsx`) zeigen das
  im Aktivitätsprotokoll genauso aufklappbar mit Kopieren-Buttons wie in
  den Freigaben selbst — nichts geht mehr verloren, unabhängig davon, ob
  danach z. B. der Mail-Entwurf (IMAP) fehlschlägt. (2) **Falsches
  Branding:** ein Social-Post für LEDTEK zeigte optisch ki-works-Design
  (Farben/Eyebrow/Orb Buddy) — `backend/src/socialGraphic.js` war beim
  Generalisieren der Agenten auf mehrere Businesses (29.08.2026) nie
  business-bewusst gemacht worden, nur der Text lief über die Registry,
  das Bild blieb hartcodiert. Fix: neues `visual`-Feld pro Business in
  `backend/src/businessProfiles.js` (Farben/Eyebrow/Domain/Mascot je
  ki-works/LEDTEK/pixelpress), `socialGraphic.js`s `buildSvg()` nutzt
  jetzt `{...DEFAULT_VISUAL, ...visual}` statt fixer Werte,
  `socialAgent.js` reicht `profile.visual` durch. (3) **Fehlender
  Website-Link:** Sales-Leads hatten kein `website`-Feld, wenn der
  Kandidat keine eigene Website hat — erschwerte den schnellen manuellen
  Check. Prompt in `salesAgent.js` verlangt jetzt einen Fallback-Link
  (Facebook-Seite/Google-Maps-Eintrag/Branchenverzeichnis), `null` nur
  falls wirklich gar kein Online-Auftritt auffindbar war. Dabei geklärt:
  "nur 1 statt 5 Social-Posts pro Lauf" ist kein Bug — der Social-Agent
  erzeugt bewusst genau einen Entwurf pro Lauf (anders als der
  5-Kandidaten-Sales-Agent). `business-dashboard`-Build fehlerfrei.
  **Committet+gepusht (`377c97d`), braucht Backend-Neustart**
  (`server.js`/`socialGraphic.js`/`businessProfiles.js`/`socialAgent.js`
  geändert) plus normalen `business-dashboard/`-Build.
- **Fix: Sales-Agent behauptete fälschlich fehlende Website bei
  Kandidaten (05.09.2026):** direkt im Anschluss an den Website-Link-Fix
  oben zwei reale Fälle vom Nutzer gemeldet — "Bäckerei Kern"
  (kern-baecker.at) und "PANI der Bäcker" (pani.baecker.at) hatten beide
  eine eigene, funktionierende Website, der Agent hat die Akquise-Mail
  aber komplett auf der falschen Behauptung "keine eigene Website"
  aufgebaut (nur aus einem Facebook-/Branchenbuch-Treffer geschlossen,
  nie aktiv nachgeprüft). Prompt in `buildPrompt()`
  (`backend/src/salesAgent.js`) verlangt jetzt eine gezielte Websuche
  nach der eigenen Website, BEVOR eine "keine Website"-Behauptung erlaubt
  ist, und verwirft den Kandidaten, falls doch eine gefunden wird (falls
  die fehlende Website der einzige Qualifizierungsgrund war). Die beiden
  fehlerhaften Alt-Einträge muss der Nutzer im Business-Dashboard manuell
  ablehnen (sind mit falscher Grundlage entstanden, vor diesem Fix
  erzeugt). Nur Syntax-Check möglich (`node --check`, kein echter
  Testlauf, Standing Rule Nutzungsguthaben). **Committet+gepusht
  (`eba3a6a`), braucht Backend-Neustart** (`salesAgent.js` geändert).
- **Neue Sektion "Live-Anruf-Banner" im "Live testen"-Bereich (06.09.2026):**
  Nutzer hat lacopstudio.com (Mitbewerber) als Vergleich gezeigt — deren
  Startseite hat eine echte anrufbare Demo-Nummer statt nur Audio-Beispiele.
  Vorher als Artifact-Vorschau gezeigt (2 Varianten), Nutzer wählte
  Variante A (eigenständige Banner-Sektion, kein zusätzliches Kärtchen).
  Umgesetzt in `landing/src/App.jsx`: neuer `GlowCard`-Banner direkt vor
  den 3 bestehenden `DemoCallCard`s — `OrbBuddy` (statisch, ohne
  `track`-Prop), Headline/Subtext, klickbarer `tel:`-Link im bestehenden
  Cyan-Violet-Verlauf-CTA-Stil. Neuer i18n-Namespace `liveCallBanner.*`
  in de/en/ro.json (Rufnummer hartcodiert: **+43 726 223 417**, wie die
  bestehende Kontakt-Nummer auf der Kontakt-Seite). **Wichtige
  Architektur-Entscheidung dazu:** keine neue Telefonnummer gekauft —
  die bestehende Venezia-Nummer wird zur reinen Kiwo-Demo-Nummer
  umgewidmet (Venezia läuft ohnehin nur mit automatisch generierten
  `[AUTO-DEMO]`-Daten, kein echter Anrufbetrieb, der gestört würde).
  Venezia bekommt erst dann eine eigene neue Nummer, wenn sie wirklich
  als zahlender Kunde live geht. Die Demo selbst bekommt eine **eigene,
  generische Kiwo-Identität** (nicht "Fake-Venezia") und **erklärt nur/
  beantwortet Fragen** (Rolle `support`, wie beim bestehenden
  Web-Chat-Kunden "Ki Works") — legt bewusst KEINE echten Test-
  Reservierungen/-Bestellungen an, um keinen neuen Rollen-/Tool-Code zu
  brauchen. Kein Backend-Code nötig — die Nummer-Umwidmung läuft komplett
  über die bestehende Kunden-Anlage/-Bearbeitung im Dashboard + den
  automatischen Vapi-Sync. Textvorschlag für die Wissensdatenbank des
  neuen Demo-Kunden wurde dem Nutzer als Datei übergeben. Build +
  SSR-Prerender aller 3 Sprachen fehlerfrei, `tel:`-Link-Format per Grep
  geprüft. **Committet+gepusht, noch NICHT auf dem Produktivserver
  ausgerollt** (normaler rsync/Build-Ablauf für `landing/`, kein
  Backend-Neustart nötig) — **und die manuellen Dashboard-Schritte
  stehen noch aus** (siehe „Offene Punkte"): (1) Venezia-Telefonnummer
  im Kunden-Dashboard leeren, (2) neuen Kunden "Kiwo Live-Demo" mit
  Rolle Support und der freigewordenen Nummer +43 726 223 417 anlegen,
  (3) Wissensdatenbank befüllen, (4) im Vapi-Dashboard einmal "Publish"
  klicken.
  **Korrektur (06.09.2026), Nutzer-Screenshot deckte auf:** Schritt (2)
  war so nicht umsetzbar — die "Kunden (Betreiber)"-Liste bot keine
  Möglichkeit, die Telefonnummer eines *bestehenden* Kunden zu ändern
  (das Feld gab es nur im "+ Neuer Kunde"-Formular), und "Kiwo Live-Demo"
  als neuer Kunde war unnötig, da mit "Ki Works" (bereits vorhandener
  Kunde für das Web-Chat-Widget, Rolle Support) schon der passende
  Kandidat existiert. Fix: neue Aktion **"Kontakt ändern"** in der
  Kundenliste (`dashboard/src/App.jsx`, neue `ContactForm`-Komponente,
  Felder Name/Adresse/Kontakt-Telefon/Vapi-Telefonnummer) — nutzt
  `PATCH /api/restaurants/:id`, das diese Felder inkl. automatischem
  Vapi-Resync bereits unterstützte, nur die Oberfläche fehlte. Sichtbar
  für Admin UND Agentur (Backend erlaubt Agenturen dieselben Felder für
  eigene Kunden). Kein manuelles Bearbeiten des Vapi-System-Prompts
  nötig — der wird automatisch aus Rolle+Wissensdatenbank generiert und
  würde bei einem manuellen Vapi-Edit beim nächsten Sync ohnehin
  überschrieben. `dashboard`-Build fehlerfrei, neue i18n-Keys
  (`contactForm.*`, `customers.changeContact`) in allen 3 Sprachen.
  **Committet+gepusht (`1aac0ba`), noch NICHT auf dem Produktivserver
  ausgerollt.**
- **Root Cause des "Forbidden"-Mobilfunk-Rätsels gefunden + SSL-Zertifikat
  verlängert + Mail-Spam-Bug gefixt (26.09.2026):** Auslöser war eine
  wiederholte "ki-works System-Alarm: ssl"-Mail (10x an 2 Tagen) —
  Diagnose per `journalctl -u ki-works-api` zeigte zwei getrennte Dinge.
  (1) **Echte, berechtigte Warnung:** das SSL-Zertifikat hatte nur noch
  8-10 Tage Gültigkeit (Ablauf 04.10.2026), obwohl der Certbot-Timer
  planmäßig 2x täglich lief. `certbot renew --dry-run` zeigte die
  eigentliche Ursache: Let's Encrypts Validierung schlug über **IPv6**
  fehl (404 auf die Challenge-Datei). Per DNS-Check von hier aus (`dig`
  nicht installiert, `getent ahostsv6`/Node `dns.resolve6` als
  Alternative genutzt) und `ip -6 addr show` auf dem Server verglichen:
  der **AAAA-Eintrag von `ki-works.eu` zeigte auf `2a13:6602:1::10`**
  (die IPv6 des alten Hosting-Panel-Servers bei helloly.hosting, wo die
  DNS-Zone liegt), während der Contabo-Server tatsächlich
  `2a02:c207:2341:9465::1` ist — beim Umzug der eigentlichen Website auf
  Contabo wurde nur der A-Eintrag (IPv4) aktualisiert, der AAAA-Eintrag
  der nackten Domain nie. **Das erklärt vermutlich auch das seit
  23.09.2026 offene "Forbidden"-Mobilfunk-Rätsel** (IPv6-bevorzugende
  Mobilfunknetze landeten auf dem falschen Server) — nginx und die
  Contabo-Firewall waren wie dokumentiert nie die Ursache. Alle anderen
  AAAA-Einträge der Zone (ftp/whm/webmail/cpanel/cpcontacts/cpcalendars/
  webdisk/ipv6.ki-works.eu sowie die komplette `ledtek.at.ki-works.eu`/
  `pixelpress.at.ki-works.eu`-Housekeeping) zeigen bewusst weiterhin auf
  den Hosting-Panel-Server — das ist korrekt so (E-Mail/Webdisk/
  Panel-Zugang laufen dort), nur der eine AAAA-Eintrag der Domain selbst
  war falsch. Nutzer hat den AAAA-Eintrag im helloly.hosting-Kundencenter
  auf `2a02:c207:2341:9465::1` korrigiert, `certbot renew` lief danach
  erfolgreich durch ("Congratulations, all renewals succeeded"), nginx
  automatisch neu geladen. **Mobilfunk-Test nach dem Fix vom Nutzer noch
  nicht rückgemeldet** (siehe „Offene Punkte"). (2) **Warum 10 Mails statt
  max. 4 in 2 Tagen (6h-Abklingzeit):** Bug in `alertIfProblem()`
  (`backend/src/monitoring.js`) — die Abklingzeit wurde bisher bei jedem
  `check.ok !== false` gelöscht, also auch bei `ok: null` (Check konnte
  kein eindeutiges Ergebnis liefern, z. B. durch den oben beschriebenen
  IPv6-Fehlschlag). Jeder solche unklare Zwischen-Check hat die
  Abklingzeit lautlos zurückgesetzt, der nächste reguläre Fehlschlag hat
  dann sofort wieder alarmiert statt bis 6h zu warten — belegt im
  Vergleich zum "Kein aktuelles Backup"-Alarm im selben Log, der die 6h
  sauber eingehalten hat. Fix: Abklingzeit nur noch bei echtem
  `check.ok === true` löschen (`else` → `else if (check.ok === true)`).
  `node --check` fehlerfrei. Committet+gepusht (`0962617`), **noch NICHT
  auf dem Produktivserver ausgerollt** — braucht nur `npm install
  --omit=dev` (keine neue Abhängigkeit, also eigentlich nur den normalen
  Backend-Deploy-Schritt) + `systemctl restart ki-works-api`, keine
  Migration.

- **Hotels live setzen — Scope besprochen, noch nicht gebaut (06.10.2026):**
  Nutzer fragte nach, was für "Hotels live" (`industries`-Status `soon`)
  nötig wäre. Kein reiner Prompt-Job wie Handwerker/Friseure (laufen über
  die bestehende `appointments`-Rolle, ein einzelner Zeitpunkt) — echter
  Datenmodell-Umbau, weil `reservations.reserved_at` nur einen einzelnen
  Zeitpunkt kennt, keine An-/Abreise-Spanne. Gebraucht:
  1. neue Spalte `checkout_at` (nullable TIMESTAMPTZ) in `reservations` —
     reine Erweiterung, bricht nichts Bestehendes.
  2. Kapazität: aktuell gibt's kein Zimmer-Konzept, `check_availability`
     (`backend/src/vapi.js`) hat nur eine feste Konstante `capacity = 60`
     fürs Restaurant-Platz-Modell — für Hotels bräuchte es minimal eine
     Zimmerzahl pro Hotel (z. B. `restaurants.settings.roomCount`) und
     eine Prüfung auf Datumsbereich-Überschneidung statt des bisherigen
     90-Minuten-Fensters.
  3. neuer Prompt-/Tool-Baustein (wie `APPOINTMENTS_PROMPT` in
     `vapiAdmin.js`, aber mit Check-in + Check-out statt nur einem
     Termin) — `create_reservation` braucht ein zweites Datumsfeld.
  4. Dashboard-Kalender/Detailansicht zeigt bisher nur den einen
     Zeitpunkt — müsste bei Hotel-Kunden auch Checkout-Datum/
     Aufenthaltsdauer anzeigen.
  5. Validierung: Checkout muss nach Checkin liegen, beide in der Zukunft.
  Bewusst **kein** echtes Zimmertyp-/Preis-Management für einen ersten
  Wurf vorgesehen — nur "Zimmer frei ja/nein" gegen eine Gesamtzahl.
  **Nutzer-Entscheidung: jetzt nicht umsetzen, nur vormerken** ("Nicht
  jetzt. Aber merken.").

- **Kiwo für Autowerkstätten erweitern — Scope besprochen, noch nicht
  gebaut (07.10.2026):** Nutzer fragte, ob Kiwo Lagerbestand/Stückzahl,
  Angebote, Bestellungen und Termine für eine Werkstatt abdecken könnte.
  Eingeschätzt nach bereits live/geplanten Bausteinen:
  - **Schon live** (Autowerkstätten sind bereits als Branche aktiv):
    Termine über die bestehende `appointments`-Rolle; allgemeine Fragen
    über die `support`-Rolle, aber nur was die Werkstatt selbst in ihre
    Wissensdatenbank/FAQ einträgt — Kiwo erfindet laut Basisprompt
    (`backend/src/vapiAdmin.js`, `basePrompt`) nie eigene Preise/Zahlen.
  - **Lagerbestand/Stückzahl:** kein Inventar-/Lagersystem im Projekt
    vorhanden (per Grep bestätigt, keine Tabelle/kein Code dafür). Zwei
    Wege: (a) Werkstatt pflegt Teile+Stückzahl selbst im Dashboard
    (analog Wissensdatenbank) — überschaubar, aber manuell/veraltet
    schnell; (b) echte Anbindung an die Lagersoftware der Werkstatt —
    unbekanntes Zielsystem, deutlich größerer, nicht planbarer Aufwand.
  - **Angebote/Kostenvoranschläge:** realistisch nicht automatisierbar
    per Telefon-KI (braucht Diagnose vor Ort). Machbar: Kiwo nimmt die
    Anfrage auf und meldet sie als Rückruf-Wunsch — nutzt die
    bestehende `request_callback`-Mechanik, kein Neubau nötig, nur als
    Standardfall für diese Branche vorsehen.
  - **Bestellungen bearbeiten** (z. B. Ersatzteile) — **Korrektur
    07.10.2026, Scope kleiner als erst gedacht:** die `orders`-Tabelle/
    `create_order` (`backend/src/vapi.js`) sind bereits generisch —
    `items` wird nur als freier Text gespeichert, keine Restaurant-
    spezifischen DB-Felder. Die Restaurant-Kopplung steckt fast
    komplett im Prompt-Text (`ORDERS_PROMPT` in `vapiAdmin.js`), der
    Tischreservierung + Bestellung bewusst zusammen bündelt und von
    "Gerichte"/"Speisekarte" spricht. Eine Teile-Bestell-Rolle für
    Werkstätten wäre damit **kein** Umbau wie bei Hotels, sondern
    derselbe leichte Weg wie bei `appointments` (siehe oben) — ein
    neuer Prompt-/Tool-Schema-Registry-Eintrag, der `create_order` ohne
    die Tisch-Bündelung wiederverwendet, keine neue Tabelle/Migration.
  Nutzer-Frage dazu: ob lieber generischer/weniger hartcodiert gebaut
  werden sollte, statt jedes Mal neu hartzucodieren — Antwort: Prinzip
  stimmt, macht das Projekt über die `ROLE_BLOCKS`-Registry bereits so
  (gleiche Tabellen/Tools, nur Prompt/Tool-Schema variiert pro Rolle,
  siehe `appointments` als Präzedenzfall). Bewusst **kein** vorab
  entworfenes, abstraktes Universal-Bestellsystem für alle denkbaren
  Branchen — Risiko falsch geratener Abstraktionen ohne zweiten echten
  Anwendungsfall; stattdessen beim nächsten echten Bedarf denselben
  bewährten, leichten Weg gehen.
  **Nutzer-Entscheidung: jetzt nicht umsetzen, nur vormerken** ("Ja,
  vormerken wie Hotels").

