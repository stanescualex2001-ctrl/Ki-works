// Social-Media-Agent (Bild-Posts): wählt ein Thema, textet
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
import { getBusinessProfile } from './businessProfiles.js';
import { ask } from './claude.js';

const MODEL = process.env.SOCIAL_AGENT_MODEL || 'claude-sonnet-5';

// Wiederverwendet von runSocialAgent (Dopplungs-Vermeidung) UND
// getSocialTrendSuggestions (Vorschläge sollen keine bereits verwendeten
// Themen erneut nennen).
async function getUsedTopics(business, profile) {
  const { rows: existing } = await query(
    `SELECT payload->>'topic' AS topic FROM pending_actions WHERE role = 'social' AND kind = 'post' AND business = $1`,
    [business],
  );
  return [...profile.seedTopics, ...existing.map((r) => r.topic).filter(Boolean)];
}

function buildPrompt(excludeList, profile, topic) {
  const excludeBlock = excludeList.length
    ? excludeList.map((t) => `- ${t}`).join('\n')
    : '(noch keine)';

  const topicInstruction = topic
    ? `Der Nutzer hat ein konkretes Thema/Fokus vorgegeben. Du MUSST den
Post exakt auf dieses Thema aufbauen — wähle KEIN eigenes Thema, auch
wenn es der folgenden Ausschlussliste ähnelt:
"${topic}"`
    : `Wähle EIN neues, konkretes Thema (z. B. ein Schmerzpunkt der Zielgruppe,
ein Nutzen des Angebots, eine Zahl/ein Vergleich, eine kurze Vorher/Nachher-
Idee), das noch NICHT in dieser Liste bereits verwendeter Themen vorkommt:
${excludeBlock}`;

  return `Du entwirfst einen Instagram/Facebook-Post für ${profile.name}.

${profile.brandBrief}

${topicInstruction}

Antworte NUR mit einem JSON-Codeblock (\`\`\`json ... \`\`\`), keinem weiteren
Text davor oder danach. Format: ein Objekt mit genau diesen Feldern:
- topic: kurzer interner Titel des Themas (für Dopplungs-Erkennung)
- headline: sehr kurzer Blickfang-Satz fürs Bild (max. ca. 6 Wörter, ohne
  Punkt am Ende)
- subline: ein erklärender Satz fürs Bild (max. ca. 12 Wörter)
- caption: der eigentliche Instagram/Facebook-Beitragstext (2-4 Sätze,
  deutsch, endet mit einem dezenten Call-to-Action und 3-5 passenden
  Hashtags)`;
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

export async function runSocialAgent({ business, assetsDir, topic }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY fehlt');
  if (!assetsDir) throw new Error('runSocialAgent: assetsDir erforderlich');
  const profile = getBusinessProfile(business);
  const excludeList = await getUsedTopics(business, profile);

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: 'user', content: buildPrompt(excludeList, profile, topic) }],
  });
  const fullText = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  const draft = extractJsonObject(fullText);

  const imageBuffer = await renderSocialImage({ headline: draft.headline, subline: draft.subline, visual: profile.visual });
  const filename = `${crypto.randomUUID()}.png`;
  fs.mkdirSync(assetsDir, { recursive: true });
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
     VALUES (NULL, $1, 'social', 'post', $2, $3) RETURNING *`,
    [business, draft.headline, JSON.stringify(payload)],
  );

  await logAction({
    business,
    source: 'social_agent',
    action: 'draft_created',
    summary: `Social-Post-Entwurf erstellt: „${draft.headline}"`,
    details: { topic: payload.topic, headline: draft.headline },
  });

  return rows[0];
}

// Kurzer, günstiger Claude-Aufruf (Haiku über claude.js' ask()) für 3
// business-spezifische Themenvorschläge — läuft beim Öffnen der
// Business-Karte im Dashboard, MUSS fail-soft sein (leeres Array statt
// Fehler), damit ein Ausfall/leeres Guthaben die Karte nicht kaputt macht.
export async function getSocialTrendSuggestions(business) {
  try {
    const profile = getBusinessProfile(business);
    const excludeList = await getUsedTopics(business, profile);
    const excludeBlock = excludeList.length
      ? excludeList.map((t) => `- ${t}`).join('\n')
      : '(noch keine)';

    const system = 'Du bist Social-Media-Trendscout. Antworte AUSSCHLIESSLICH mit einem JSON-Array aus genau 3 kurzen deutschen Strings, ohne weitere Erklärung.';
    const user = `Business: ${profile.name}
Zielgruppe/Branche: ${profile.targetKind}
Markenkern/Tonalität: ${profile.brandBrief}

Bereits verwendete/vorgemerkte Themen (nicht erneut vorschlagen):
${excludeBlock}

Schlage 3 aktuelle, zu diesem Business passende Social-Media-Themen vor.
Jede Idee: max. ca. 6 Wörter, konkret, Deutsch. Antworte NUR mit einem
JSON-Array aus genau 3 Strings.`;

    const text = await ask(system, user, 300);
    if (!text) return [];
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t) => typeof t === 'string' && t.trim()).slice(0, 3);
  } catch (err) {
    console.error('Trend-Vorschläge fehlgeschlagen:', err.message);
    return [];
  }
}
