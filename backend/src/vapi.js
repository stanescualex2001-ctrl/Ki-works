import { query } from './db.js';
import { summarizeCall, classifyOutcome } from './claude.js';
import { notifyN8n } from './n8n.js';
import { sendSms, reservationSms } from './sms.js';

// Naive datetimes from the assistant ("2026-07-06T19:00") are Vienna local time.
function viennaOffsetMs(date) {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Vienna', timeZoneName: 'longOffset' })
    .formatToParts(date).find((p) => p.type === 'timeZoneName')?.value || '';
  const m = name.match(/([+-])(\d{2}):(\d{2})/);
  return m ? (m[1] === '+' ? 1 : -1) * (Number(m[2]) * 60 + Number(m[3])) * 60000 : 0;
}

function parseGuestDatetime(str) {
  if (!str || typeof str !== 'string') return new Date(NaN);
  if (/(?:[zZ]|[+-]\d{2}:?\d{2})$/.test(str)) return new Date(str);
  const asUtc = new Date(`${str.trim().replace(' ', 'T')}Z`);
  if (Number.isNaN(asUtc.getTime())) return asUtc;
  return new Date(asUtc.getTime() - viennaOffsetMs(asUtc));
}

// Resolve which restaurant a Vapi call belongs to (by dialed number, fallback: first).
async function resolveRestaurant(phoneNumber) {
  if (phoneNumber) {
    const r = await query(
      'SELECT id, name, contact_email, vapi_assistant_id FROM restaurants WHERE vapi_phone_number = $1 LIMIT 1',
      [phoneNumber],
    );
    if (r.rows[0]) return r.rows[0];
  }
  const r = await query('SELECT id, name, contact_email, vapi_assistant_id FROM restaurants ORDER BY id LIMIT 1');
  return r.rows[0] || null;
}

// Vapi tool call: create_reservation({name, phone, party_size, datetime, notes})
async function createReservation(restaurant, args, callerNumber) {
  const reservedAt = parseGuestDatetime(args.datetime || args.date_time || args.time);
  if (Number.isNaN(reservedAt.getTime())) {
    return { error: 'Ungültiges Datum. Bitte Datum und Uhrzeit im Format JJJJ-MM-TT HH:MM angeben.' };
  }
  const { rows } = await query(
    `INSERT INTO reservations (restaurant_id, customer_name, customer_phone, party_size, reserved_at, notes, source)
     VALUES ($1, $2, $3, $4, $5, $6, 'phone') RETURNING *`,
    [
      restaurant.id,
      args.name || 'Unbekannt',
      args.phone || callerNumber || null,
      parseInt(args.party_size, 10) || 2,
      reservedAt.toISOString(),
      args.notes || null,
    ],
  );
  const reservation = rows[0];
  notifyN8n('reservierung-erstellt', { reservation, restaurant });
  if (reservation.customer_phone) {
    sendSms(reservation.customer_phone, reservationSms(reservation, restaurant.name))
      .catch((err) => console.error('SMS failed:', err.message));
  }
  return {
    result: `Reservierung bestätigt für ${reservation.customer_name}, ${reservation.party_size} Personen am ${reservedAt.toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })}.`,
  };
}

async function checkAvailability(restaurant, args) {
  const at = parseGuestDatetime(args.datetime || args.date_time || args.time);
  if (Number.isNaN(at.getTime())) return { error: 'Ungültiges Datum.' };
  const windowStart = new Date(at.getTime() - 90 * 60000).toISOString();
  const windowEnd = new Date(at.getTime() + 90 * 60000).toISOString();
  const { rows } = await query(
    `SELECT COALESCE(SUM(party_size), 0) AS seated FROM reservations
     WHERE restaurant_id = $1 AND status = 'confirmed' AND reserved_at BETWEEN $2 AND $3`,
    [restaurant.id, windowStart, windowEnd],
  );
  const capacity = 60; // MVP: fixed capacity
  const free = capacity - Number(rows[0].seated);
  return { result: free > 0 ? `Ja, es sind noch Plätze frei (ca. ${free}).` : 'Leider ausgebucht zu dieser Zeit.' };
}

const TOOL_HANDLERS = {
  create_reservation: createReservation,
  check_availability: checkAvailability,
};

async function handleToolCalls(message, restaurant) {
  // Supports both legacy "function-call" and current "tool-calls" formats.
  const calls = message.toolCallList
    || (message.functionCall ? [{ id: 'legacy', function: message.functionCall }] : []);
  const callerNumber = message.call?.customer?.number || message.customer?.number || null;
  const results = [];
  for (const call of calls) {
    const fn = call.function || call;
    const name = fn.name;
    let args = fn.arguments ?? fn.parameters ?? {};
    if (typeof args === 'string') { try { args = JSON.parse(args); } catch { args = {}; } }
    const handler = TOOL_HANDLERS[name];
    const out = handler
      ? await handler(restaurant, args, callerNumber)
      : { error: `Unbekannte Funktion: ${name}` };
    const value = out.result ?? out.error;
    results.push({ toolCallId: call.id, result: typeof value === 'string' ? value : JSON.stringify(value) });
  }
  return { results };
}

// Kunden-Gedächtnis: erkennt Stammgäste an der Rufnummer und liefert dem
// Agenten Kontext (Name, Besuche, letzte Reservierung, Notizen, letzter Anruf).
async function guestContext(phone, restaurant) {
  if (!phone || !restaurant) return 'Kein bekannter Stammgast.';
  const { rows } = await query(
    `SELECT customer_name, count(*) AS visits, max(reserved_at) AS last_visit,
            string_agg(DISTINCT notes, '; ') AS notes
     FROM reservations
     WHERE restaurant_id = $1 AND customer_phone = $2 AND status <> 'cancelled'
     GROUP BY customer_name ORDER BY count(*) DESC, max(reserved_at) DESC LIMIT 1`,
    [restaurant.id, phone],
  );
  const guest = rows[0];
  if (!guest) return 'Kein bekannter Stammgast.';
  const lastCall = await query(
    `SELECT summary FROM calls
     WHERE restaurant_id = $1 AND caller_number = $2 AND summary IS NOT NULL
     ORDER BY created_at DESC LIMIT 1`,
    [restaurant.id, phone],
  );
  const parts = [
    `Stammgast erkannt: ${guest.customer_name}`,
    `${guest.visits} bisherige Reservierungen`,
    `zuletzt am ${new Date(guest.last_visit).toLocaleDateString('de-AT', { timeZone: 'Europe/Vienna' })}`,
  ];
  if (guest.notes) parts.push(`Notizen: ${guest.notes}`);
  if (lastCall.rows[0]?.summary) parts.push(`Letztes Gespräch: ${lastCall.rows[0].summary}`);
  return `${parts.join(', ')}.`;
}

// Vapi fragt hier an, welcher Assistent den Anruf übernehmen soll —
// wir antworten mit dem Assistenten des Restaurants plus Gast-Kontext.
async function handleAssistantRequest(message, restaurant) {
  const caller = message.call?.customer?.number || message.customer?.number || null;
  let context = 'Kein bekannter Stammgast.';
  try {
    context = await guestContext(caller, restaurant);
  } catch (err) {
    console.error('guestContext failed:', err.message);
  }
  if (!restaurant?.vapi_assistant_id) {
    return { error: 'Kein Assistent für dieses Restaurant konfiguriert.' };
  }
  return {
    assistantId: restaurant.vapi_assistant_id,
    assistantOverrides: { variableValues: { guestContext: context } },
  };
}

async function handleEndOfCall(message, restaurant) {
  const call = message.call || {};
  const artifact = message.artifact || message;
  const transcript = artifact.transcript || message.transcript || null;
  const [summary, outcome] = await Promise.all([
    message.summary ? Promise.resolve(message.summary) : summarizeCall(transcript),
    classifyOutcome(transcript),
  ]);
  const startedAt = message.startedAt || call.startedAt || null;
  const endedAt = message.endedAt || call.endedAt || null;
  const duration = startedAt && endedAt
    ? Math.round((new Date(endedAt) - new Date(startedAt)) / 1000)
    : null;
  const { rows } = await query(
    `INSERT INTO calls (restaurant_id, vapi_call_id, caller_number, started_at, ended_at,
                        duration_seconds, transcript, summary, outcome, recording_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (vapi_call_id) DO UPDATE SET
       transcript = EXCLUDED.transcript, summary = EXCLUDED.summary,
       outcome = EXCLUDED.outcome, ended_at = EXCLUDED.ended_at,
       duration_seconds = EXCLUDED.duration_seconds, recording_url = EXCLUDED.recording_url
     RETURNING *`,
    [
      restaurant?.id ?? null,
      call.id || message.callId || null,
      call.customer?.number || message.customer?.number || null,
      startedAt, endedAt, duration, transcript, summary, outcome,
      artifact.recordingUrl || message.recordingUrl || null,
    ],
  );
  const saved = rows[0];
  notifyN8n('anruf-abgeschlossen', { call: saved, restaurant });
  if (outcome === 'missed') notifyN8n('anruf-verpasst', { call: saved, restaurant });
  return {};
}

export async function handleVapiWebhook(req, res) {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (secret && req.headers['x-vapi-secret'] !== secret) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const message = req.body?.message || req.body || {};
  const dialed = message.phoneNumber?.number || message.call?.phoneNumber?.number || null;
  const restaurant = await resolveRestaurant(dialed);
  try {
    switch (message.type) {
      case 'assistant-request':
        return res.json(await handleAssistantRequest(message, restaurant));
      case 'tool-calls':
      case 'function-call':
        return res.json(await handleToolCalls(message, restaurant));
      case 'end-of-call-report':
        return res.json(await handleEndOfCall(message, restaurant));
      default:
        return res.json({});
    }
  } catch (err) {
    console.error('Vapi webhook error:', err);
    return res.status(500).json({ error: 'internal error' });
  }
}
