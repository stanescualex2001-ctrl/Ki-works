import Anthropic from '@anthropic-ai/sdk';
import { query } from './db.js';
import { logAction } from './auditLog.js';

const MODEL = process.env.SALES_AGENT_MODEL || 'claude-sonnet-5';

// Ziel-Profil + Qualifizierungskriterien für ki-works.eu (Pilot-Business,
// siehe CLAUDE.md "Akquise-Agent"). Bewusst als eigene, benannte Konstanten
// gehalten statt im Prompt-String vergraben — dieselbe Definition kann
// später 1:1 in eine Vapi-"Kiwo Sales"-Telefonrolle (Live-Qualifizierung von
// Anrufer-Leads) einfließen, ohne neu entworfen werden zu müssen.
const DEFAULT_REGION = 'Schwertberg / Mühlviertel / Oberösterreich';

// buildTargetProfile: region ist im Business-Dashboard vor jedem Lauf
// einstellbar (Feld "Ort/Region"), Default deckt sich mit dem geplanten
// lokalen Markteinstieg aus MARKETING.md.
function buildTargetProfile(region) {
  return `Restaurants, Gasthäuser, Cafés und kleine Hotels im
Raum ${region || DEFAULT_REGION}.`;
}

const QUALIFICATION_CRITERIA = `Ein guter Kandidat:
- ist ein Restaurant/Gasthaus/Café/kleines Hotel mit Telefonnummer und
  Website ODER zumindest einem öffentlichen Google-Business-/
  Social-Media-Eintrag
- liegt im Zielgebiet (siehe oben)
- hat erkennbar Bedarf an besserer telefonischer Erreichbarkeit (z. B. keine
  Online-Reservierung, Hinweise auf Personalmangel, Bewertungen die
  "schwer erreichbar" erwähnen)`;

function buildPrompt(maxCandidates, excludeList, region) {
  return `Du recherchierst potenzielle Neukunden für ki-works.eu, eine
Plattform für KI-Telefonassistenten (Produktname "Kiwo") für Restaurants.

Zielprofil:
${buildTargetProfile(region)}

Qualifizierungskriterien:
${QUALIFICATION_CRITERIA}

Bereits kontaktiert (NICHT nochmal vorschlagen):
${excludeList}

Finde bis zu ${maxCandidates} passende, noch nicht kontaktierte Betriebe per
Websuche. Entwirf für jeden Kandidaten eine kurze, individuelle Akquise-Mail
auf Deutsch (Betreff + Text), die konkret auf etwas von der Website/dem
Online-Auftritt des Betriebs Bezug nimmt (z. B. fehlende Online-Reservierung,
Öffnungszeiten, eine echte Bewertung) — kein Massenmail-Ton, keine generische
Anrede. Erwähne kurz den Nutzen (Telefon rund um die Uhr, Reservierungen
automatisch entgegennehmen) und den ersten Monat kostenlos.

WICHTIG — Kontakt-E-Mail-Suche: du hast bereits Zugriff auf die Website
jedes Kandidaten per web_fetch, nutze das aktiv, um eine E-Mail-Adresse zu
finden. Fast jede Geschäftswebsite in Österreich/Deutschland zeigt eine
E-Mail-Adresse im Footer der Startseite, auf einer Impressum-Seite oder auf
einer Kontakt-Seite (Impressumspflicht ist dort gesetzlich vorgeschrieben).
Gehe für jeden Kandidaten diese Schritte durch, BEVOR du contact_email auf
null setzt:
1. Footer der Startseite auf eine E-Mail-Adresse prüfen.
2. Verlinkte Seiten mit "Impressum"/"Kontakt"/"Imprint"/"Contact" im
   Linktext oder in der URL (z. B. .../impressum, .../kontakt) gezielt per
   web_fetch laden und dort nach einer E-Mail-Adresse suchen.
3. Erst wenn du nach Prüfung von Startseite, Footer, Impressum UND
   Kontakt-Seite wirklich keine E-Mail-Adresse gefunden hast (z. B. nur ein
   Kontaktformular ohne sichtbare Adresse), darfst du contact_email auf
   null setzen — das soll die Ausnahme sein, nicht der Normalfall.

Antworte NUR mit einem JSON-Codeblock (\`\`\`json ... \`\`\`), keinem weiteren
Text davor oder danach. Format: ein JSON-Array von Objekten mit genau diesen
Feldern: business_name, website (string oder null), city (string oder null),
why_fit (ein Satz Begründung), contact_email (string oder null, nur falls
nach den obigen Schritten wirklich keine Mail-Adresse auffindbar war),
subject, body.
Wenn du keine passenden, noch nicht kontaktierten Kandidaten findest, gib ein
leeres Array [] zurück.`;
}

function extractJsonArray(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text.match(/(\[[\s\S]*\])/)?.[1];
  if (!raw) throw new Error('Sales-Agent: keine verwertbare JSON-Antwort erhalten');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Sales-Agent: JSON-Antwort ungültig (${err.message})`);
  }
  if (!Array.isArray(parsed)) throw new Error('Sales-Agent: Antwort ist kein Array');
  return parsed;
}

export async function runSalesAgent({ maxCandidates = 5, region } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY fehlt');

  const { rows: existing } = await query(
    `SELECT payload->>'business_name' AS business_name, payload->>'website' AS website
     FROM pending_actions WHERE role = 'sales'`,
  );
  const excludeList = existing.length
    ? existing.map((r) => `${r.business_name || '?'} (${r.website || 'Website unbekannt'})`).join('\n')
    : '(noch keine)';

  const client = new Anthropic({ apiKey });
  const tools = [
    { type: 'web_search_20260209', name: 'web_search', max_uses: 15 },
    // 20 statt 15: pro Kandidat kommt jetzt zusätzlich das gezielte Nachladen
    // von Impressum-/Kontakt-Seiten für die E-Mail-Suche dazu.
    { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 20 },
  ];
  const messages = [{ role: 'user', content: buildPrompt(maxCandidates, excludeList, region) }];

  // Server-Tools laufen serverseitig in einer eigenen Schleife; bei vielen
  // Websuchen kann das Limit von 10 Runden erreicht werden (stop_reason
  // "pause_turn") — dann laut Doku Assistant-Antwort anhängen und erneut
  // senden, bis zu einem kleinen Sicherheits-Limit.
  let response;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      tools,
      messages,
    });
    if (response.stop_reason !== 'pause_turn') break;
    messages.push({ role: 'assistant', content: response.content });
  }

  const fullText = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  const candidates = extractJsonArray(fullText);

  let drafted = 0;
  let skipped = 0;
  for (const c of candidates.slice(0, maxCandidates)) {
    if (!c.business_name || !c.subject || !c.body) { skipped += 1; continue; }
    const summary = `Akquise-Mail an ${c.business_name}${c.city ? ` (${c.city})` : ''}`;
    const payload = {
      business_name: c.business_name,
      website: c.website ?? null,
      city: c.city ?? null,
      why_fit: c.why_fit ?? null,
      contact_email: c.contact_email ?? null,
      subject: c.subject,
      body: c.body,
      qualified_by: 'research',
    };
    // eslint-disable-next-line no-await-in-loop
    await query(
      `INSERT INTO pending_actions (restaurant_id, business, role, kind, summary, payload)
       VALUES (NULL, 'ki-works', 'sales', 'outreach_email', $1, $2)`,
      [summary, JSON.stringify(payload)],
    );
    drafted += 1;
  }

  await logAction({
    business: 'ki-works',
    source: 'sales_agent',
    action: 'run',
    summary: `Sales-Agent-Lauf: ${candidates.length} Kandidaten gefunden, ${drafted} Entwürfe erstellt`,
    details: { found: candidates.length, drafted, skipped, maxCandidates, region: region || DEFAULT_REGION },
  });

  return { found: candidates.length, drafted, skipped };
}
