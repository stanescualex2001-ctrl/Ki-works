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
("Kiwo"). Aktuell live: Kiwo Reception/Orders/Support für Restaurants
(Telefon nimmt Reservierungen/Bestellungen entgegen, beantwortet FAQ, rund
um die Uhr erreichbar, auch am Ruhetag). Test-Referenz: Venezia,
Marktplatz 10, Schwertberg. Zielgruppe: Restaurants/Gasthäuser in
Oberösterreich. Hauptangebot: 1 Monat kostenlos testen. Tonalität: klar,
konkret, keine Buzzword-Übertreibung, deutschsprachig (AT).`,
    productPitch: `Erwähne kurz den Nutzen (Telefon rund um die Uhr,
Reservierungen automatisch entgegennehmen) und den ersten Monat kostenlos.`,
    targetProfileDefault: 'Schwertberg / Mühlviertel / Oberösterreich',
    targetKind: 'Restaurants, Gasthäuser, Cafés und kleine Hotels',
    qualificationCriteria: `Ein guter Kandidat:
- ist ein Restaurant/Gasthaus/Café/kleines Hotel mit Telefonnummer und
  Website ODER zumindest einem öffentlichen Google-Business-/
  Social-Media-Eintrag
- liegt im Zielgebiet (siehe oben)
- hat erkennbar Bedarf an besserer telefonischer Erreichbarkeit (z. B. keine
  Online-Reservierung, Hinweise auf Personalmangel, Bewertungen die
  "schwer erreichbar" erwähnen)`,
    signature: `Freundliche Grüße
Alex von ki-works.eu
Tel. +43 650 9915759
info@ki-works.eu`,
    seedTopics: ['Verpasster Anruf = verlorene Reservierung', 'Zeitersparnis: 15 Stunden pro Woche'],
  },
  ledtek: {
    name: 'LEDTEK',
    brandBrief: `LEDTEK (ledtek.at) ist ein LED-Leuchten-Händler für
Handwerk, Gewerbe und Bauunternehmen — schneller Versand (48h-Versprechen),
klares Sortiment ohne Rätselraten. Tonalität: nüchtern-technisch, B2B,
keine Spielereien, deutschsprachig (AT).`,
    productPitch: `Erwähne kurz den Nutzen: schnelle Lieferung (48h),
verlässliches LED-Sortiment für laufende Projekte, keine langen
Wartezeiten wie bei Großhändlern.`,
    targetProfileDefault: 'Oberösterreich',
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
  },
  pixelpress: {
    name: 'pixelpress',
    brandBrief: `pixelpress (pixelpress.at) ist eine Web-/KI-Agentur.
Slogan: "Struktur schlägt Design". Baut klare, strukturierte Websites statt
Templates von der Stange, auf Wunsch mit modernen KI-Features. Tonalität:
locker, direkt, kein Buzzword-Bingo, deutschsprachig (AT).`,
    productPitch: `Erwähne kurz den Nutzen: klare, strukturierte Website
statt Template von der Stange, moderne KI-Features auf Wunsch.`,
    targetProfileDefault: 'Oberösterreich',
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
  },
};

export function getBusinessProfile(business) {
  const profile = BUSINESS_PROFILES[business];
  if (!profile) throw new Error(`Unbekanntes Business: ${business}`);
  return profile;
}
