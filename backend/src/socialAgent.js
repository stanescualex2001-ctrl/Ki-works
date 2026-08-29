// Social-Media-Agent (Pilot ki-works.eu, Bild-Posts): wählt ein Thema, texted
// Headline/Subline/Caption per Claude und rendert die passende Grafik
// (socialGraphic.js). Landet als pending_actions-Entwurf zur Freigabe im
// Business-Dashboard — kein automatischer Versand, siehe Sales-Agent für
// dasselbe Freigabe-Muster. Reels bleiben bewusst außerhalb dieses ersten
// Schritts (siehe CLAUDE.md).
import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { query } from './db.js';
import { renderSocialImage } from './socialGraphic.js';
import { logAction } from './auditLog.js';

const MODEL = process.env.SOCIAL_AGENT_MODEL || 'claude-sonnet-5';

// Bereits vor Einführung dieses Agenten manuell veröffentlichte Themen —
// damit der erste automatische Lauf sie nicht sofort wiederholt.
const ALREADY_USED_TOPICS = [
  'Verpasster Anruf = verlorene Reservierung',
  'Zeitersparnis: 15 Stunden pro Woche',
];

const BRAND_BRIEF = `ki-works.eu ist eine Plattform für digitale KI-Mitarbeiter
("Kiwo"). Aktuell live: Kiwo Reception/Orders/Support für Restaurants
(Telefon nimmt Reservierungen/Bestellungen entgegen, beantwortet FAQ, rund
um die Uhr erreichbar, auch am Ruhetag). Test-Referenz: Venezia,
Marktplatz 10, Schwertberg. Zielgruppe: Restaurants/Gasthäuser in
Oberösterreich. Hauptangebot: 1 Monat kostenlos testen. Tonalität: klar,
konkret, keine Buzzword-Übertreibung, deutschsprachig (AT).`;

function buildPrompt(excludeList) {
  return `Du entwirfst einen Instagram/Facebook-Post für ki-works.eu.

${BRAND_BRIEF}

Bereits verwendete Themen (NICHT wiederholen):
${excludeList}

Wähle EIN neues, konkretes Thema (z. B. ein Schmerzpunkt von Restaurants,
ein Nutzen von Kiwo, eine Zahl/ein Vergleich, eine kurze Vorher/Nachher-
Idee — orientiere dich an sowas wie "nie wieder verpasste Reservierung"
oder "15 Stunden pro Woche gespart", aber wiederhole diese Beispiele nicht).

Antworte NUR mit einem JSON-Codeblock (\`\`\`json ... \`\`\`), keinem weiteren
Text davor oder danach. Format: ein Objekt mit genau diesen Feldern:
- topic: kurzer interner Titel des Themas (für Dopplungs-Erkennung)
- headline: sehr kurzer Blickfang-Satz fürs Bild (max. ca. 6 Wörter, ohne
  Punkt am Ende)
- subline: ein erklärender Satz fürs Bild (max. ca. 12 Wörter)
- caption: der eigentliche Instagram/Facebook-Beitragstext (2-4 Sätze,
  deutsch, endet mit einem dezenten Call-to-Action Richtung
  "1 Monat kostenlos testen" und 3-5 passenden Hashtags, z. B. #KIWorks
  #Kiwo #Restaurant #KI)`;
}

function extractJsonObject(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text.match(/(\{[\s\S]*\})/)?.[1];
  if (!raw) throw new Error('Social-Agent: keine verwertbare JSON-Antwort erhalten');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Social-Agent: JSON-Antwort ungültig (${err.message})`);
  }
  if (!parsed.headline || !parsed.caption) {
    throw new Error('Social-Agent: Antwort unvollständig (headline/caption fehlen)');
  }
  return parsed;
}

export async function runSocialAgent({ assetsDir }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY fehlt');
  if (!assetsDir) throw new Error('runSocialAgent: assetsDir erforderlich');

  const { rows: existing } = await query(
    `SELECT payload->>'topic' AS topic FROM pending_actions WHERE role = 'social' AND kind = 'post'`,
  );
  const excludeList = [...ALREADY_USED_TOPICS, ...existing.map((r) => r.topic).filter(Boolean)]
    .map((t) => `- ${t}`).join('\n');

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: buildPrompt(excludeList) }],
  });
  const fullText = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  const draft = extractJsonObject(fullText);

  const imageBuffer = await renderSocialImage({ headline: draft.headline, subline: draft.subline });
  const filename = `${crypto.randomUUID()}.png`;
  fs.writeFileSync(path.join(assetsDir, filename), imageBuffer);
  const imageUrl = `${process.env.KIWORKS_PUBLIC_URL || 'https://ki-works.eu'}/api/public/social-assets/${filename}`;

  const payload = {
    topic: draft.topic ?? draft.headline,
    headline: draft.headline,
    subline: draft.subline ?? null,
    caption: draft.caption,
    imageUrl,
  };
  const { rows } = await query(
    `INSERT INTO pending_actions (restaurant_id, business, role, kind, summary, payload)
     VALUES (NULL, 'ki-works', 'social', 'post', $1, $2) RETURNING *`,
    [draft.headline, JSON.stringify(payload)],
  );

  await logAction({
    business: 'ki-works',
    source: 'social_agent',
    action: 'draft_created',
    summary: `Social-Post-Entwurf erstellt: „${draft.headline}"`,
    details: { topic: payload.topic, headline: draft.headline },
  });

  return rows[0];
}
