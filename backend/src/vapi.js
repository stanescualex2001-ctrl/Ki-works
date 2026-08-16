import { query } from './db.js';
import { summarizeCall, classifyOutcome } from './claude.js';
import { notifyN8n } from './n8n.js';
import { sendSms, reservationSms, orderSms, cancellationSms, rescheduleSms } from './sms.js';
import { logError } from './monitoring.js';
import { logAction } from './auditLog.js';

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
      'SELECT id, name, address, contact_email, vapi_assistant_id, knowledge_base, opening_hours, faq FROM restaurants WHERE vapi_phone_number = $1 LIMIT 1',
      [phoneNumber],
    );
    if (r.rows[0]) return r.rows[0];
  }
  const r = await query('SELECT id, name, address, contact_email, vapi_assistant_id, knowledge_base, opening_hours, faq FROM restaurants ORDER BY id LIMIT 1');
  return r.rows[0] || null;
}

// Vapi tool call: create_reservation({name, phone, party_size, datetime, notes})
async function createReservation(restaurant, args, callerNumber) {
  const reservedAt = parseGuestDatetime(args.datetime || args.date_time || args.time);
  if (Number.isNaN(reservedAt.getTime())) {
    return { error: 'Ungültiges Datum. Bitte Datum und Uhrzeit im Format JJJJ-MM-TT HH:MM angeben.' };
  }
  if (reservedAt.getTime() < Date.now()) {
    return { error: 'Dieser Zeitpunkt liegt in der Vergangenheit. Bitte einen Termin in der Zukunft nennen.' };
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
    result: `Reservierung bestätigt für ${reservation.customer_name}, ${reservation.party_size} Personen am ${reservedAt.toLocaleString('de-AT', { timeZone: 'Europe/Vienna' })}. [reservation_id: ${reservation.id}]`,
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

// Findet die zu stornierende/verschiebende Reservierung anhand von Restaurant +
// Anrufernummer, optional eingeengt auf ein Zeitfenster um einen genannten Termin.
// Rückgabe: die Reservierung, null (nichts gefunden) oder ein Array (mehrdeutig).
async function findReservation(restaurant, args, callerNumber) {
  const phone = args.phone || callerNumber;
  if (!phone) return { error: 'Ohne Telefonnummer kann ich die Reservierung nicht finden.' };
  const around = args.datetime || args.old_datetime;
  let sql = `SELECT * FROM reservations
             WHERE restaurant_id = $1 AND customer_phone = $2
               AND status = 'confirmed' AND reserved_at > now()`;
  const params = [restaurant.id, phone];
  if (around) {
    const at = parseGuestDatetime(around);
    if (!Number.isNaN(at.getTime())) {
      params.push(new Date(at.getTime() - 90 * 60000).toISOString());
      params.push(new Date(at.getTime() + 90 * 60000).toISOString());
      sql += ` AND reserved_at BETWEEN $3 AND $4`;
    }
  }
  sql += ' ORDER BY reserved_at ASC';
  const { rows } = await query(sql, params);
  if (rows.length === 0) return null;
  if (rows.length === 1) return rows[0];
  return rows;
}

function listReservationTimes(rows) {
  return rows
    .map((r) => new Date(r.reserved_at).toLocaleString('de-AT', { timeZone: 'Europe/Vienna', dateStyle: 'medium', timeStyle: 'short' }))
    .join(', ');
}

// Vapi tool call: cancel_reservation({name, phone, datetime})
async function cancelReservation(restaurant, args, callerNumber) {
  const found = await findReservation(restaurant, args, callerNumber);
  if (found === null) return { error: 'Ich konnte keine passende Reservierung finden.' };
  if (Array.isArray(found)) {
    return { result: `Ich habe mehrere Reservierungen gefunden: ${listReservationTimes(found)}. Für welchen Termin möchten Sie stornieren?` };
  }
  if (found.error) return { error: found.error };
  const { rows } = await query(
    "UPDATE reservations SET status = 'cancelled' WHERE id = $1 RETURNING *",
    [found.id],
  );
  const reservation = rows[0];
  notifyN8n('reservierung-storniert', { reservation, restaurant });
  if (reservation.customer_phone) {
    sendSms(reservation.customer_phone, cancellationSms(reservation, restaurant.name))
      .catch((err) => console.error('SMS failed:', err.message));
  }
  const when = new Date(reservation.reserved_at).toLocaleString('de-AT', { timeZone: 'Europe/Vienna', dateStyle: 'medium', timeStyle: 'short' });
  return { result: `Reservierung für ${reservation.customer_name} am ${when} wurde storniert.` };
}

// Vapi tool call: reschedule_reservation({name, phone, old_datetime, new_datetime})
async function rescheduleReservation(restaurant, args, callerNumber) {
  if (!args.new_datetime) return { error: 'Bitte den gewünschten neuen Termin angeben.' };
  const newAt = parseGuestDatetime(args.new_datetime);
  if (Number.isNaN(newAt.getTime())) {
    return { error: 'Ungültiges Datum. Bitte Datum und Uhrzeit im Format JJJJ-MM-TT HH:MM angeben.' };
  }
  if (newAt.getTime() < Date.now()) {
    return { error: 'Dieser Zeitpunkt liegt in der Vergangenheit. Bitte einen Termin in der Zukunft nennen.' };
  }
  const found = await findReservation(restaurant, args, callerNumber);
  if (found === null) return { error: 'Ich konnte keine passende Reservierung finden.' };
  if (Array.isArray(found)) {
    return { result: `Ich habe mehrere Reservierungen gefunden: ${listReservationTimes(found)}. Welchen Termin möchten Sie verschieben?` };
  }
  if (found.error) return { error: found.error };
  const { rows } = await query(
    'UPDATE reservations SET reserved_at = $1 WHERE id = $2 RETURNING *',
    [newAt.toISOString(), found.id],
  );
  const reservation = rows[0];
  notifyN8n('reservierung-verschoben', { reservation, restaurant });
  if (reservation.customer_phone) {
    sendSms(reservation.customer_phone, rescheduleSms(reservation, restaurant.name))
      .catch((err) => console.error('SMS failed:', err.message));
  }
  const when = new Date(reservation.reserved_at).toLocaleString('de-AT', { timeZone: 'Europe/Vienna', dateStyle: 'medium', timeStyle: 'short' });
  return { result: `Reservierung für ${reservation.customer_name} wurde auf ${when} verschoben.` };
}

// Vapi tool call: create_order({name, phone, items, pickup_time, notes, reservation_id, fulfillment})
async function createOrder(restaurant, args, callerNumber) {
  if (!args.items) return { error: 'Bitte die gewünschten Gerichte angeben.' };

  let linkedReservation = null;
  if (args.reservation_id) {
    const { rows } = await query(
      'SELECT * FROM reservations WHERE id = $1 AND restaurant_id = $2',
      [args.reservation_id, restaurant.id],
    );
    linkedReservation = rows[0] || null;
  }
  const fulfillment = args.fulfillment || (linkedReservation ? 'dine_in' : 'pickup');

  // Bei Tisch-Verknüpfung ohne eigene Abholzeit: Essen ist zur Reservierungszeit fertig.
  let requestedAt = args.pickup_time ? parseGuestDatetime(args.pickup_time) : null;
  if ((!requestedAt || Number.isNaN(requestedAt?.getTime())) && linkedReservation) {
    requestedAt = new Date(linkedReservation.reserved_at);
  }
  if (requestedAt && !Number.isNaN(requestedAt.getTime()) && requestedAt.getTime() < Date.now()) {
    return { error: 'Dieser Zeitpunkt liegt in der Vergangenheit. Bitte eine Uhrzeit in der Zukunft nennen.' };
  }

  const { rows } = await query(
    `INSERT INTO orders (restaurant_id, customer_name, customer_phone, items, fulfillment, reservation_id, requested_at, notes, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'phone') RETURNING *`,
    [
      restaurant.id,
      args.name || linkedReservation?.customer_name || 'Unbekannt',
      args.phone || callerNumber || null,
      String(args.items).slice(0, 1000),
      fulfillment,
      linkedReservation?.id || null,
      requestedAt && !Number.isNaN(requestedAt.getTime()) ? requestedAt.toISOString() : null,
      args.notes || null,
    ],
  );
  const order = rows[0];
  notifyN8n('bestellung-erstellt', { order, restaurant });
  if (order.customer_phone) {
    sendSms(order.customer_phone, orderSms(order, restaurant.name))
      .catch((err) => console.error('SMS failed:', err.message));
  }
  const time = order.requested_at
    ? new Date(order.requested_at).toLocaleTimeString('de-AT', { timeZone: 'Europe/Vienna', hour: '2-digit', minute: '2-digit' })
    : null;
  const when = linkedReservation
    ? ` — wird zur Reservierung um ${time} Uhr am Tisch vorbereitet`
    : (time ? ` zur Abholung um ${time} Uhr` : '');
  return { result: `Bestellung aufgenommen für ${order.customer_name}: ${order.items}${when}.` };
}

// Vapi tool call: request_callback({topic, phone, channel, contact}) — Kiwo
// weiß etwas nicht oder kann es nicht selbst erledigen; ein Mitarbeitender
// soll zurückrufen. channel/contact halten nur den Gast-Wunsch fest, wie er
// die Antwort erhalten möchte (kein automatischer Versand).
async function requestCallback(restaurant, args, callerNumber, callId) {
  const phone = args.phone || callerNumber || null;
  const channel = ['sms', 'whatsapp', 'email'].includes(args.channel) ? args.channel : null;
  const { rows } = await query(
    `INSERT INTO callback_requests (restaurant_id, vapi_call_id, caller_number, topic, preferred_channel, contact)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [restaurant.id, callId || null, phone, args.topic || 'Nicht spezifiziert', channel, args.contact || null],
  );
  notifyN8n('rueckruf-gewuenscht', { request: rows[0], restaurant });
  return { result: 'Alles klar, ich habe Ihr Anliegen notiert — jemand vom Team meldet sich bei Ihnen zurück.' };
}

const TOOL_HANDLERS = {
  create_reservation: createReservation,
  check_availability: checkAvailability,
  cancel_reservation: cancelReservation,
  reschedule_reservation: rescheduleReservation,
  create_order: createOrder,
  request_callback: requestCallback,
};

async function handleToolCalls(message, restaurant) {
  // Supports both legacy "function-call" and current "tool-calls" formats.
  const calls = message.toolCallList
    || (message.functionCall ? [{ id: 'legacy', function: message.functionCall }] : []);
  const callerNumber = message.call?.customer?.number || message.customer?.number || null;
  const callId = message.call?.id || message.callId || null;
  const results = [];
  for (const call of calls) {
    const fn = call.function || call;
    const name = fn.name;
    let args = fn.arguments ?? fn.parameters ?? {};
    if (typeof args === 'string') { try { args = JSON.parse(args); } catch { args = {}; } }
    const handler = TOOL_HANDLERS[name];
    const out = handler
      ? await handler(restaurant, args, callerNumber, callId)
      : { error: `Unbekannte Funktion: ${name}` };
    const value = out.result ?? out.error;
    results.push({ toolCallId: call.id, result: typeof value === 'string' ? value : JSON.stringify(value) });
    // Bewusst nicht awaited — Vapi wartet live auf die Tool-Antwort, das
    // Audit-Log darf die Gesprächslatenz nicht verzögern (logAction fängt
    // eigene Fehler intern ab, kein unhandled rejection möglich).
    logAction({
      restaurantId: restaurant?.id ?? null,
      source: 'phone',
      action: name,
      summary: out.error ? `${name} fehlgeschlagen: ${String(out.error).slice(0, 160)}` : `${name} ausgeführt`,
      details: { args, result: value },
      callId,
    });
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

const WEEKDAY_LABELS = [
  ['mon', 'Mo'], ['tue', 'Di'], ['wed', 'Mi'], ['thu', 'Do'],
  ['fri', 'Fr'], ['sat', 'Sa'], ['sun', 'So'],
];

// Wandelt {"mon":"11:00-22:00", "wed":"closed", ...} in einen lesbaren Satz
// für den Vapi-Systemprompt um, damit Kiwo die echten Öffnungszeiten pro
// Betrieb kennt (statt fest im Prompt eincodierter Ruhetage).
function formatOpeningHours(hours) {
  if (!hours || typeof hours !== 'object') return 'Keine Öffnungszeiten hinterlegt.';
  return WEEKDAY_LABELS.map(([key, label]) => {
    const val = hours[key];
    return `${label} ${!val || val === 'closed' ? 'geschlossen' : val}`;
  }).join(', ');
}

// Wandelt die im Dashboard gepflegten FAQ-Einträge [{question, answer}, ...]
// in lesbaren Text für den Vapi-Systemprompt um.
function formatFaq(faq) {
  if (!Array.isArray(faq) || !faq.length) return 'Keine zusätzlichen FAQ hinterlegt.';
  return faq
    .filter((item) => item?.question && item?.answer)
    .map((item) => `F: ${item.question} A: ${item.answer}`)
    .join(' | ');
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
    assistantOverrides: {
      variableValues: {
        guestContext: context,
        restaurant_name: restaurant.name || 'unser Unternehmen',
        restaurant_address: restaurant.address || '',
        knowledge_base: restaurant.knowledge_base || 'Keine Informationen hinterlegt — bei inhaltlichen Fragen bitte auf einen Rückruf verweisen.',
        opening_hours: formatOpeningHours(restaurant.opening_hours),
        faq: formatFaq(restaurant.faq),
      },
    },
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
  await linkCallArtifacts(saved);
  notifyN8n('anruf-abgeschlossen', { call: saved, restaurant });
  if (outcome === 'missed') notifyN8n('anruf-verpasst', { call: saved, restaurant });
  return {};
}

// Verknüpft die während dieses Anrufs erstellte Reservierung/Bestellung mit dem
// Anruf-Datensatz, damit das Dashboard von einem Anruf aus direkt zu den Details
// springen kann. Zuordnung über Restaurant + Anrufernummer + Zeitfenster des Anrufs.
async function linkCallArtifacts(call) {
  if (!call.caller_number || !call.started_at || !call.restaurant_id) return;
  const windowEnd = call.ended_at || new Date().toISOString();
  try {
    await query(
      `UPDATE reservations SET call_id = $1
       WHERE call_id IS NULL AND restaurant_id = $2 AND customer_phone = $3
         AND created_at BETWEEN $4 AND $5::timestamptz + interval '2 minutes'`,
      [call.id, call.restaurant_id, call.caller_number, call.started_at, windowEnd],
    );
    await query(
      `UPDATE orders SET call_id = $1
       WHERE call_id IS NULL AND restaurant_id = $2 AND customer_phone = $3
         AND created_at BETWEEN $4 AND $5::timestamptz + interval '2 minutes'`,
      [call.id, call.restaurant_id, call.caller_number, call.started_at, windowEnd],
    );
  } catch (err) {
    console.error('linkCallArtifacts failed:', err.message);
  }
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
    await logError('vapi-webhook', err);
    return res.status(500).json({ error: 'internal error' });
  }
}
