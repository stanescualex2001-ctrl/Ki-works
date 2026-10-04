// Registry der eigenen Businesses, die Kiwo-Agenten (Sales/Social) nutzen
// können. Ein neues Business = ein neuer Eintrag hier, kein Umbau der
// Agenten-Kernlogik (salesAgent.js/socialAgent.js) nötig — gleiches
// Prinzip wie ROLE_BLOCKS in vapiAdmin.js für die Telefonrollen.
//
// Hinweis Inhalte LEDTEK/pixelpress: Markenstimme/Zielprofil sind
// sinnvolle Annahmen auf Basis bereits dokumentierter Fakten (siehe
// CLAUDE.md "Erste Social-Media-Inhalte für LEDTEK und pixelpress").
// Kontaktdaten in den Signaturen sind vom Nutzer bestätigt (29.08.2026).
export const BUSINESS_PROFILES = {
  'ki-works': {
    name: 'ki-works.eu',
    brandBrief: `ki-works.eu ist eine Plattform für digitale KI-Mitarbeiter
("Kiwo"). Aktuell live: Kiwo geht ans Telefon, nimmt Anrufe rund um die Uhr
an, beantwortet häufige Fragen (FAQ), nimmt Reservierungen/Bestellungen bzw.
Termine auf und schickt dem Betrieb die Details sofort per E-Mail; kann der
Agent etwas nicht beantworten, wird ein Rückruf notiert. Branchen live:
Restaurants, Handwerker, Friseure/Kosmetik, KFZ-Werkstätten, Immobilien.
Test-Referenz: Venezia, Marktplatz 10, Schwertberg. Zielgruppe: Betriebe in
Österreich, Deutschland und Rumänien, die vom Telefon leben und oft keine
Hand frei haben. Hauptangebot: 1 Monat kostenlos testen. Tonalität: klar,
konkret, keine Buzzword-Übertreibung, deutschsprachig (AT).`,
    productPitch: `Kernproblem (in jeder Branche gleich): das Telefon klingelt,
der Inhaber hat gerade keine Hand frei — jeder verpasste Anruf ist ein
verlorener Auftrag/Termin/Gast. Nutze das Branchen-Beispiel aus dem
Branchen-Block unten (nicht erfinden).
Lösung: Kiwo nimmt Anrufe rund um die Uhr an, notiert Anliegen bzw.
Termin/Reservierung und schickt dem Betrieb die Details sofort per E-Mail.
Handlung (die EINZIGE): "Rufen Sie +43 726 223 417 an und hören Sie selbst,
wie Kiwo klingt (2 Minuten)." Optional ein Halbsatz: erster Monat kostenlos.
Link nur, falls nötig: https://ki-works.eu/?utm_source=sales_email&utm_campaign=ki-works`,
    targetProfileDefault: 'Österreich, Deutschland und Rumänien',
    targetKind: 'Betriebe, die vom Telefon leben (Restaurants, Handwerker, Friseure, KFZ-Werkstätten, Immobilienmakler)',
    qualificationCriteria: `Ein guter Kandidat:
- ist ein aktiver Betrieb aus einer der Branchen im Branchen-Block unten, mit
  Telefonnummer und Website ODER zumindest einem öffentlichen Google-Business-/
  Social-Media-Eintrag
- liegt im Zielgebiet (siehe oben)
- ist vermutlich oft beschäftigt/vor Ort und hat erkennbar Bedarf an besserer
  telefonischer Erreichbarkeit (z. B. nur Telefonnummer ohne Online-Buchung,
  Öffnungszeiten, Hinweise auf kleines Team, Bewertungen die "schwer
  erreichbar" erwähnen)`,
    // Branchen für gezielte Sales-Läufe (Dropdown im Business-Dashboard).
    // Ohne Auswahl verteilt der Agent die Kandidaten auf mehrere Branchen.
    // `mailExample` ist reine STILVORLAGE (Aufbau/Länge/Ton), nicht kopieren.
    // Nur Funktionen nennen, die live sind (kein Hotel/Arztpraxis: "bald").
    industries: [
      {
        key: 'handwerker',
        name: 'Handwerker (Installateur, Elektriker, Tischler …)',
        targetKind: 'Handwerksbetriebe (Installateure, Elektriker, Tischler, Maler, Dachdecker)',
        problem: 'Auf dem Dach oder in der Werkstatt geht niemand ans Telefon — der Auftrag geht an den Nächsten.',
        mailExample: `Betreff: Wer geht ans Telefon, wenn Sie auf dem Dach stehen?

Guten Tag Herr Huber,
Installateure werden meist gesucht, wenn es dringend ist — und wer dann nicht abhebt, verliert den Auftrag an den Nächsten in der Liste.
Kiwo nimmt Ihre Anrufe rund um die Uhr an, notiert das Anliegen und schickt Ihnen die Details sofort per E-Mail.
Rufen Sie +43 726 223 417 an und hören Sie selbst, wie Kiwo klingt (2 Minuten).`,
      },
      {
        key: 'friseur',
        name: 'Friseure, Kosmetik, Nagelstudios',
        targetKind: 'Friseursalons, Kosmetik- und Nagelstudios',
        problem: 'Hände im Haar oder in der Behandlung — das Telefon klingelt, der Termin geht verloren.',
        mailExample: `Betreff: Hände im Haar, Telefon klingelt?

Guten Tag Frau Maier,
wer mitten in einer Behandlung steckt, kann nicht ans Telefon — und viele Kundinnen versuchen es dann nicht ein zweites Mal.
Kiwo nimmt Terminwünsche rund um die Uhr entgegen und schickt Ihnen die Details sofort per E-Mail.
Rufen Sie +43 726 223 417 an und hören Sie selbst, wie Kiwo klingt (2 Minuten).`,
      },
      {
        key: 'werkstatt',
        name: 'KFZ-Werkstätten',
        targetKind: 'KFZ-Werkstätten und Autohäuser mit Werkstatt',
        problem: 'Während der Reparatur kommen Anrufe — Terminanfragen und Rückfragen bleiben liegen.',
        mailExample: `Betreff: Wer hebt ab, während Sie unter dem Auto liegen?

Guten Tag Herr Gruber,
in einer Werkstatt klingelt das Telefon meist genau dann, wenn alle Hände gebraucht werden — Terminanfragen gehen so an die nächste Werkstatt.
Kiwo nimmt Anrufe rund um die Uhr an, notiert Anliegen und Terminwunsch und schickt Ihnen die Details per E-Mail.
Rufen Sie +43 726 223 417 an und hören Sie selbst, wie Kiwo klingt (2 Minuten).`,
      },
      {
        key: 'restaurant',
        name: 'Restaurants, Gasthäuser, Cafés',
        targetKind: 'Restaurants, Gasthäuser und Cafés',
        problem: 'Zur Stoßzeit klingelt das Telefon, niemand hat eine Hand frei — die Reservierung geht verloren.',
        mailExample: `Betreff: Wie viele Reservierungen gehen zur Stoßzeit verloren?

Guten Tag Herr Wagner,
wenn das Haus voll ist, klingelt das Telefon meist genau dann, wenn niemand abheben kann — und die Reservierung geht woanders hin.
Kiwo nimmt Reservierungen und Bestellungen rund um die Uhr entgegen und schickt Ihnen die Details sofort per E-Mail.
Rufen Sie +43 726 223 417 an und hören Sie selbst, wie Kiwo klingt (2 Minuten).`,
      },
      {
        key: 'immobilien',
        name: 'Immobilienmakler',
        targetKind: 'Immobilienmakler und Hausverwaltungen',
        problem: 'Ein Interessent ruft an, während Sie bei einer Besichtigung sind — niemand hebt ab.',
        mailExample: `Betreff: Wer nimmt den Anruf an, während Sie bei einer Besichtigung sind?

Guten Tag Frau Berger,
ein Interessent ruft meist genau einmal an — und wer nicht abhebt, verliert die Anfrage oft an den nächsten Makler.
Kiwo nimmt Anrufe rund um die Uhr an, notiert Anliegen und Terminwunsch und schickt Ihnen die Details per E-Mail.
Rufen Sie +43 726 223 417 an und hören Sie selbst, wie Kiwo klingt (2 Minuten).`,
      },
    ],
    // Themenreihe "Das Telefon klingelt, aber ..." für den Social-Agent
    // (je Branche ein Post) — erscheinen als Chips unter "Thema/Fokus".
    topicSeries: [
      'Das Telefon klingelt, aber … ich stehe auf dem Dach',
      'Das Telefon klingelt, aber … meine Hände sind im Haar',
      'Das Telefon klingelt, aber … ich liege unter dem Auto',
      'Das Telefon klingelt, aber … die Küche ist voll',
      'Das Telefon klingelt, aber … ich bin bei einer Besichtigung',
    ],
    signature: `Freundliche Grüße
Alex von ki-works.eu
Tel. +43 650 9915759
info@ki-works.eu`,
    seedTopics: ['Verpasster Anruf = verlorene Reservierung', 'Zeitersparnis: 15 Stunden pro Woche'],
    // Sichtbares Branding für Social-Media-Grafiken (socialGraphic.js) —
    // je Business eigene Farben/Beschriftung, sonst würde jedes Bild
    // ki-works-Branding tragen, egal für welches Business erzeugt.
    visual: {
      eyebrow: 'KI-WORKS · KIWO',
      domain: 'ki-works.eu',
      bgColors: ['#0B1220', '#161233', '#1E1B4B'],
      accentColor: '#22D3EE',
      textColor: '#F3F6FB',
      mascot: 'orb',
    },
  },
  ledtek: {
    name: 'LEDTEK',
    brandBrief: `LEDTEK (ledtek.at) ist ein LED-Leuchten-Händler für
Handwerk, Gewerbe und Bauunternehmen — schneller Versand (48h-Versprechen),
klares Sortiment ohne Rätselraten. Tonalität: nüchtern-technisch, B2B,
keine Spielereien, deutschsprachig (AT).`,
    productPitch: `Problem: Baustelle oder Projekt steht, weil die bestellte
LED-Ware nicht rechtzeitig kommt oder Angebote wochenlang dauern.
Lösung: LEDTEK liefert geprüfte LED-Ware aus einem klaren Sortiment in 48h.
Handlung (die EINZIGE): "Schicken Sie uns Ihre nächste Anfrage, Sie bekommen
innerhalb eines Werktags ein Angebot." Link nur, falls nötig:
https://ledtek.at/?utm_source=sales_email&utm_campaign=ledtek`,
    targetProfileDefault: 'Österreich, Deutschland und Rumänien',
    targetKind: 'Elektrobetriebe, Bauunternehmen und Einzelhändler mit Ladenbau-Bedarf',
    qualificationCriteria: `Ein guter Kandidat:
- ist ein Elektro-/Bau-/Handwerksbetrieb oder Einzelhändler mit
  erkennbarem, wiederkehrendem Bedarf an LED-Beleuchtung (z. B.
  Renovierungen, Ladenbau, Neubauprojekte)
- liegt im Zielgebiet (siehe oben)
- hat eine Website oder einen öffentlichen Google-Business-Eintrag
  mit Kontaktmöglichkeit`,
    signature: `Freundliche Grüße
Alex von LEDTEK
Tel. +43 650 9915759
kontakt@ledtek.at`,
    seedTopics: ['LED-Ware in 48h. Ohne Rätselraten.'],
    // Schwarz/Weiß mit grünem Akzent — abgeleitet von ledtek.at (siehe
    // CLAUDE.md "Erste Social-Media-Inhalte für LEDTEK und pixelpress").
    visual: {
      eyebrow: 'LEDTEK',
      domain: 'ledtek.at',
      bgColors: ['#050505', '#0A0A0A', '#101410'],
      accentColor: '#22C55E',
      textColor: '#F5F5F5',
      mascot: 'none',
    },
  },
  pixelpress: {
    name: 'pixelpress',
    brandBrief: `pixelpress (pixelpress.at) ist eine Web-/KI-Agentur.
Slogan: "Struktur schlägt Design". Baut klare, strukturierte Websites statt
Templates von der Stange, auf Wunsch mit modernen KI-Features. Tonalität:
locker, direkt, kein Buzzword-Bingo, deutschsprachig (AT).`,
    productPitch: `Problem: dem Betrieb fehlt eine Website bzw. sie ist veraltet
— wer spontan einen Anbieter sucht, googelt zuerst und ruft dort an, wo er
etwas findet; ohne Auftritt gehen solche Anfragen an den Nächsten.
Lösung: pixelpress baut kleinen Betrieben eine klare, mobile, DSGVO-konforme
Website — das Starter-Paket kostet 690 € netto (zzgl. USt.), das Starter-
Paket ist oft schon in 3 bis 7 Tagen online (so steht es auch auf
pixelpress.at; größere Projekte dauern bis zu 4 Wochen — nur das Starter-Paket
nennen). Nenne Preis und diese Dauer konkret in der Mail, aber
keine weiteren Leistungen, Rabatte oder Gratis-Angebote erfinden.
Handlung (die EINZIGE, ohne Aufwand für den Empfänger): "Rufen Sie mich
kurz an: +43 650 9915759." Keine Gegenleistung vom Empfänger verlangen
(keine Unterlagen schicken, nichts ausfüllen, keine Antwort mit Stichwort).
Link nur, falls nötig: https://pixelpress.at/?utm_source=sales_email&utm_campaign=pixelpress`,
    targetProfileDefault: 'Österreich, Deutschland und Rumänien',
    targetKind: 'lokale Betriebe mit veralteter oder fehlender Website',
    qualificationCriteria: `Ein guter Kandidat:
- hat eine sichtbar veraltete, nicht mobiloptimierte oder ganz fehlende
  Website (nur Facebook-Seite/Google-Eintrag als Online-Präsenz)
- liegt im Zielgebiet (siehe oben)
- ist ein aktiver, laufender Betrieb (keine verwaisten Einträge)`,
    signature: `Freundliche Grüße
Alex von pixelpress
Tel. +43 650 9915759
hallo@pixelpress.at`,
    seedTopics: [],
    // Dunkles Blau + hellblauer Akzent — mangels eigener Farbvorgabe
    // gewählt (siehe CLAUDE.md "Erste Social-Media-Inhalte für LEDTEK und
    // pixelpress", noch nicht vom Nutzer final bestätigt).
    visual: {
      eyebrow: 'PIXELPRESS',
      domain: 'pixelpress.at',
      bgColors: ['#050A14', '#0B1830', '#0F2544'],
      accentColor: '#38BDF8',
      textColor: '#F0F6FF',
      mascot: 'none',
    },
  },
  // Kein eigenes Unternehmen, sondern ki-works' eigene Akquise von
  // White-Label-Partner-Agenturen (Kaltansprache) — separat von der
  // bereits bestehenden "Agenturen"-Verwaltung im Kunden-Dashboard, die
  // Partner verwaltet, die bereits zugesagt haben (siehe CLAUDE.md
  // "Agentur-Self-Service"). Nutzt dieselbe Registry, weil derselbe
  // Sales-/Social-Agent-Mechanismus, nur andere Zielgruppe/Pitch.
  reseller: {
    name: 'ki-works.eu Partnerprogramm',
    brandBrief: `ki-works.eu betreibt eine fertige Plattform für KI-
Telefonassistenten (Kiwo) und bietet Agenturen ein White-Label-
Partnerprogramm: die Plattform läuft unter der eigenen Domain/Marke der
Agentur, mit deren eigenen Preisen — Endkunden sehen zu keinem Zeitpunkt
"ki-works". Die Agentur bekommt dadurch ein sofort verkaufbares Produkt
für ihre Bestandskunden (z. B. Gastronomie, Handwerk, Dienstleistung)
ohne eigenen Entwicklungsaufwand — wiederkehrende monatliche Einnahmen
statt Einzelprojekte. Kostenlose Live-Demo zum sofort Ausprobieren:
+43 726 223 417 anrufen und mit dem digitalen Mitarbeiter "Kiwo"
sprechen. Details: ki-works.eu/partner.html. Tonalität: professionell,
auf Augenhöhe (Agentur zu Agentur), kein Massenmail-Ton.`,
    productPitch: `Erwähne kurz den Kernnutzen für die Agentur (eigenes
Branding/eigene Preise, kein Entwicklungsaufwand, wiederkehrende
Einnahmen), lade konkret zur Live-Demo (+43 726 223 417) und zu einem
kurzen 10-Minuten-Gespräch ein, falls Potenzial für ihre Bestandskunden
besteht. Verlinke auf ki-works.eu/partner.html für Details.`,
    targetProfileDefault: 'Österreich, Deutschland und Rumänien',
    targetKind: 'Werbeagenturen, Webagenturen und IT-Systemhäuser mit Bestandskunden aus KMU-Branchen (Gastronomie, Handwerk, Einzelhandel, Dienstleister)',
    qualificationCriteria: `Ein guter Kandidat:
- ist eine Werbe-/Web-/Digitalagentur oder ein IT-Systemhaus mit mehreren
  Bestandskunden aus KMU-Branchen, die von Telefonerreichbarkeit/
  Terminvergabe profitieren würden
- bietet aktuell KEIN eigenes, konkurrierendes KI-Telefon-/Voice-Produkt an
- hat einen echten, vertrauenswürdigen Online-Auftritt (Impressum,
  Referenzen, aktive Website)
Kein Kandidat: Einzelperson ohne Agenturstruktur, Agentur mit
offensichtlich eigenem KI-Voice-Produkt (Konkurrent statt Partner).`,
    signature: `Freundliche Grüße
Alex von ki-works.eu
Tel. +43 650 9915759
info@ki-works.eu`,
    seedTopics: [],
    // Identisch zu ki-works — ist derselbe Absender, nur andere
    // Zielgruppe (Agenturen statt Restaurants).
    visual: {
      eyebrow: 'KI-WORKS · PARTNER',
      domain: 'ki-works.eu/partner',
      bgColors: ['#0B1220', '#161233', '#1E1B4B'],
      accentColor: '#22D3EE',
      textColor: '#F3F6FB',
      mascot: 'orb',
    },
  },
};

export function getBusinessProfile(business) {
  const profile = BUSINESS_PROFILES[business];
  if (!profile) throw new Error(`Unbekanntes Business: ${business}`);
  return profile;
}
