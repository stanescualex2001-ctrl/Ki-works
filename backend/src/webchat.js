import Anthropic from '@anthropic-ai/sdk';
import { query } from './db.js';
import { logAction } from './auditLog.js';
import { formatFaq, formatOpeningHours } from './vapi.js';
import { notifyN8n } from './n8n.js';

const MODEL = process.env.WEBCHAT_MODEL || 'claude-sonnet-5';

const CAPTURE_LEAD_TOOL = {
  name: 'capture_lead',
  description: 'Erfasst einen Interessenten, wenn du eine Frage nicht beantworten kannst oder der Besucher konkretes Interesse zeigt (z. B. Demo/Kontakt wünscht). Erfinde niemals Angaben — frage vorher nach Name und E-Mail oder Telefon.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name des Besuchers' },
      business: { type: 'string', description: 'Firma/Betrieb des Besuchers, falls genannt' },
      email: { type: 'string', description: 'E-Mail-Adresse, falls angegeben' },
      phone: { type: 'string', description: 'Telefonnummer, falls angegeben' },
      message: { type: 'string', description: 'Kurze Zusammenfassung des Anliegens/der unbeantworteten Frage' },
    },
    required: ['name', 'message'],
  },
  // Letztes (einziges) Tool -> Cache-Breakpoint für den Tools-Block, siehe
  // buildSystemPrompt()/runWebchatTurn() für die restlichen Breakpoints.
  cache_control: { type: 'ephemeral' },
};

function buildSystemPrompt(restaurant) {
  return `Du bist Kiwo, der freundliche digitale Chat-Assistent von ${restaurant.name || 'diesem Unternehmen'} auf dessen Website. Du chattest schriftlich mit einem Website-Besucher (kein Telefonat) — antworte kurz, klar und in der Sprache, in der der Besucher schreibt.

INFORMATIONEN: ${restaurant.knowledge_base || 'Keine Informationen hinterlegt.'}
Nutze für Fragen zu Leistungen, Produkten und Preisen AUSSCHLIESSLICH diese Informationen — erfinde nichts.

ÖFFNUNGSZEITEN: ${formatOpeningHours(restaurant.opening_hours)}

HÄUFIGE FRAGEN: ${formatFaq(restaurant.faq)}
Prüfe diese Liste immer, bevor du eine Frage als unbeantwortbar einstufst.

Kannst du eine Frage trotzdem nicht beantworten, oder möchte der Besucher erkennbar Kontakt/eine Demo/ein Angebot, frage höflich nach Name und E-Mail oder Telefon und rufe dann capture_lead auf, statt zu raten. Sag dem Besucher danach, dass sich jemand vom Team meldet.`;
}

async function handleCaptureLead(restaurant, input) {
  const clip = (v, n) => (typeof v === 'string' ? v.slice(0, n) : null);
  const { rows } = await query(
    `INSERT INTO leads (name, business, email, phone, message, source)
     VALUES ($1, $2, $3, $4, $5, 'webchat') RETURNING *`,
    [clip(input.name, 120), clip(input.business, 120), clip(input.email, 160), clip(input.phone, 40), clip(input.message, 2000)],
  );
  notifyN8n('neuer-interessent', { lead: rows[0] });
  logAction({
    restaurantId: restaurant.id,
    source: 'webchat',
    action: 'capture_lead',
    summary: `Lead über Web-Chat erfasst: ${rows[0].name}`,
    details: { leadId: rows[0].id },
  });
  return rows[0];
}

// history: Array von {role: 'user'|'assistant', content: string} aus dem
// bisherigen Gesprächsverlauf des Widgets (nur pro Seitenaufruf im Speicher
// des Browsers, nicht persistiert — siehe Plan). Bis zu 3 interne
// Tool-Use-Runden, bevor sicherheitshalber abgebrochen wird.
export async function runWebchatTurn({ restaurant, history, message }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY fehlt');

  const client = new Anthropic({ apiKey });
  // Cache-Breakpoint: derselbe System-Prompt (Wissensdatenbank/FAQ/
  // Öffnungszeiten des Restaurants) wird bei jeder Besucher-Nachricht
  // mitgeschickt — Caching spart hier laut Anthropic 50-90% der
  // Eingabekosten, sobald das Widget aktiv genutzt wird.
  const system = [
    {
      type: 'text',
      text: buildSystemPrompt(restaurant),
      cache_control: { type: 'ephemeral' },
    },
  ];
  const messages = [...history, { role: 'user', content: message }];
  const tools = [CAPTURE_LEAD_TOOL];

  for (let round = 0; round < 3; round += 1) {
    // eslint-disable-next-line no-await-in-loop
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages,
      tools,
    });

    const toolUses = response.content.filter((b) => b.type === 'tool_use');
    if (!toolUses.length) {
      const reply = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
      messages.push({ role: 'assistant', content: response.content });
      return { reply, messages };
    }

    messages.push({ role: 'assistant', content: response.content });
    const toolResults = [];
    for (const toolUse of toolUses) {
      if (toolUse.name === 'capture_lead') {
        // eslint-disable-next-line no-await-in-loop
        await handleCaptureLead(restaurant, toolUse.input);
        toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: 'Erfasst.' });
      } else {
        toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: 'Unbekanntes Tool.', is_error: true });
      }
    }
    messages.push({ role: 'user', content: toolResults });
  }

  return {
    reply: 'Entschuldigung, dabei ist etwas schiefgelaufen. Bitte versuchen Sie es noch einmal.',
    messages,
  };
}
