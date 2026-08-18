import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { query } from './db.js';
import { handleVapiWebhook } from './vapi.js';
import { syncVapiAssistant } from './vapiAdmin.js';
import { notifyN8n } from './n8n.js';
import { logError, getSystemStatus, startMonitoring } from './monitoring.js';
import { businessRecommendations } from './claude.js';
import { runSalesAgent } from './salesAgent.js';
import { runSocialAgent } from './socialAgent.js';
import { runWebchatTurn } from './webchat.js';
import { logAction } from './auditLog.js';
import { sendSms, reservationSms } from './sms.js';
import { publishFacebookPhoto, publishInstagramPhoto } from './socialMedia.js';
import {
  authMiddleware, adminOnly, customerScope,
  hashPassword, verifyPassword, signToken, generateSetupToken,
} from './auth.js';

process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));

const app = express();
app.set('trust proxy', 'loopback');
app.use(express.json({ limit: '6mb' }));
app.use(authMiddleware);

// Öffentlich erreichbarer Ablageort für Social-Media-Grafiken (Meta Graph API
// braucht eine öffentliche Bild-URL, kein Base64-Upload).
const SOCIAL_ASSETS_DIR = path.join(process.cwd(), 'public', 'social-assets');
fs.mkdirSync(SOCIAL_ASSETS_DIR, { recursive: true });
app.use('/api/public/social-assets', express.static(SOCIAL_ASSETS_DIR, { maxAge: '1d' }));

// Async-Fehler aus Routen landen im Error-Handler statt die Anfrage hängen zu lassen.
for (const method of ['get', 'post', 'patch']) {
  const orig = app[method].bind(app);
  app[method] = (path, ...handlers) => (handlers.length
    ? orig(path, ...handlers.map((h) => (req, res, next) =>
      Promise.resolve(h(req, res, next)).catch(next)))
    : orig(path));
}

const publicRestaurant = ({ password_hash, setup_token, ...rest }) => rest;

// --- Health -----------------------------------------------------------------
app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, service: 'ki-works-api' });
  } catch {
    res.status(500).json({ ok: false });
  }
});

app.get('/api/admin/system-status', adminOnly, async (_req, res) => {
  res.json(await getSystemStatus());
});

app.get('/api/admin/errors', adminOnly, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const { rows } = await query('SELECT * FROM error_log ORDER BY created_at DESC LIMIT $1', [limit]);
  res.json(rows);
});

// DSGVO: Kunden-Login bestätigt die Datenschutzerklärung/Auftragsverarbeitung.
app.post('/api/accept-terms', async (req, res) => {
  const scope = customerScope(req);
  if (!scope) return res.status(400).json({ error: 'nur für Kunden-Logins verfügbar' });
  await query('UPDATE restaurants SET terms_accepted_at = now() WHERE id = $1', [scope]);
  res.json({ ok: true });
});

// --- Login --------------------------------------------------------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email und password erforderlich' });

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPass
    && email.toLowerCase() === adminEmail.toLowerCase() && password === adminPass) {
    return res.json({
      token: signToken({ role: 'admin', name: 'Betreiber' }),
      role: 'admin',
      name: 'Betreiber',
    });
  }

  const { rows } = await query(
    'SELECT id, name, password_hash FROM restaurants WHERE lower(login_email) = lower($1)',
    [email],
  );
  const r = rows[0];
  if (!r || !verifyPassword(password, r.password_hash)) {
    return res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
  }
  return res.json({
    token: signToken({ role: 'customer', restaurant_id: r.id, name: r.name }),
    role: 'customer',
    restaurant_id: r.id,
    name: r.name,
  });
});

// --- Vapi webhook (called by Vapi servers) ------------------------------------
app.post('/api/webhooks/vapi', handleVapiWebhook);

// --- Social-Media-Post (Claude generiert Text+Grafik, ruft diesen Endpunkt auf) --
app.post('/api/webhooks/social-post', async (req, res) => {
  const secret = process.env.SOCIAL_POST_SECRET;
  if (!secret || req.headers['x-social-post-secret'] !== secret) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const { caption, imageBase64 } = req.body || {};
  if (!caption || !imageBase64) {
    return res.status(400).json({ error: 'caption und imageBase64 erforderlich' });
  }
  const filename = `${crypto.randomUUID()}.png`;
  fs.writeFileSync(path.join(SOCIAL_ASSETS_DIR, filename), Buffer.from(imageBase64, 'base64'));
  const imageUrl = `${process.env.KIWORKS_PUBLIC_URL || 'https://ki-works.eu'}/api/public/social-assets/${filename}`;

  const results = {};
  try {
    results.facebook = await publishFacebookPhoto({ imageUrl, caption });
  } catch (err) {
    results.facebook = { error: err.message };
  }
  try {
    results.instagram = await publishInstagramPhoto({ imageUrl, caption });
  } catch (err) {
    results.instagram = { error: err.message };
  }
  res.json({ ok: true, imageUrl, results });
});

// --- Interessenten-Formular der Firmen-Website (öffentlich) --------------------
app.post('/api/public/interest', async (req, res) => {
  const { name, business, email, phone, message } = req.body || {};
  if (!name || (!email && !phone)) {
    return res.status(400).json({ error: 'Name und E-Mail oder Telefon erforderlich' });
  }
  const clip = (v, n) => (typeof v === 'string' ? v.slice(0, n) : null);
  const { rows } = await query(
    `INSERT INTO leads (name, business, email, phone, message)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [clip(name, 120), clip(business, 120), clip(email, 160), clip(phone, 40), clip(message, 2000)],
  );
  notifyN8n('neuer-interessent', { lead: rows[0] });
  res.status(201).json({ ok: true });
});

app.get('/api/leads', adminOnly, async (_req, res) => {
  const { rows } = await query('SELECT * FROM leads ORDER BY created_at DESC LIMIT 200');
  res.json(rows);
});

// --- Kiwo Web-Chat-Widget (öffentlich) ------------------------------------
// Einfaches In-Memory-Rate-Limiting pro IP — kein Redis nötig bei aktueller
// Größenordnung (ein Prozess). Schützt einen öffentlichen, unauthentifizierten
// LLM-Endpunkt vor Kosten-/Missbrauchsrisiko (siehe Sicherheits-Audit in
// CLAUDE.md: es gibt sonst nirgends Rate-Limiting im Backend).
const webchatRateLimit = new Map();
const WEBCHAT_RATE_LIMIT = 20; // Nachrichten
const WEBCHAT_RATE_WINDOW_MS = 10 * 60 * 1000; // pro 10 Minuten

function checkWebchatRateLimit(ip) {
  const now = Date.now();
  const entry = webchatRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    webchatRateLimit.set(ip, { count: 1, resetAt: now + WEBCHAT_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= WEBCHAT_RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

app.post('/api/public/webchat', async (req, res) => {
  // restaurantId ist optional — das Widget auf ki-works.eu selbst kennt/
  // braucht keine interne DB-ID, sondern nutzt den auf dem Server hinterlegten
  // Standard-Betrieb (KIWORKS_OWN_RESTAURANT_ID). Explizite restaurantId
  // bleibt für einen künftigen Multi-Kunden-Einsatz (LEDTEK/pixelpress) offen.
  const { message, history } = req.body || {};
  const restaurantId = req.body?.restaurantId || process.env.KIWORKS_OWN_RESTAURANT_ID;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'message erforderlich' });
  }
  if (!restaurantId) {
    return res.status(503).json({ error: 'Chat ist noch nicht eingerichtet (KIWORKS_OWN_RESTAURANT_ID fehlt).' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ error: 'Nachricht zu lang' });
  }
  if (!checkWebchatRateLimit(req.ip)) {
    return res.status(429).json({ error: 'Zu viele Nachrichten — bitte kurz warten.' });
  }

  const { rows } = await query(
    'SELECT id, name, knowledge_base, faq, opening_hours, enabled_roles FROM restaurants WHERE id = $1',
    [restaurantId],
  );
  const restaurant = rows[0];
  if (!restaurant || !Array.isArray(restaurant.enabled_roles) || !restaurant.enabled_roles.includes('support')) {
    return res.status(404).json({ error: 'Chat für diesen Betrieb nicht verfügbar' });
  }

  const safeHistory = Array.isArray(history) ? history.slice(-20) : [];

  try {
    const { reply } = await runWebchatTurn({ restaurant, history: safeHistory, message: message.trim() });
    logAction({
      restaurantId: restaurant.id,
      source: 'webchat',
      action: 'message',
      summary: `Web-Chat-Nachricht beantwortet`,
      details: { message: message.trim().slice(0, 500), reply: reply.slice(0, 500) },
    });
    res.json({ reply });
  } catch (err) {
    await logError('webchat', err);
    res.status(502).json({ error: 'Kiwo ist gerade nicht erreichbar. Bitte versuchen Sie es später erneut.' });
  }
});

app.patch('/api/leads/:id', adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!['new', 'contacted', 'won', 'lost'].includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }
  const { rows } = await query(
    'UPDATE leads SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id],
  );
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

// Erzeugt einen Einladungslink (7 Tage gültig) und benachrichtigt n8n, das die
// Setup-Mail verschickt. Der Kunde setzt sein Passwort selbst über den Link.
async function inviteRestaurant(restaurant) {
  const token = generateSetupToken();
  const { rows } = await query(
    `UPDATE restaurants SET setup_token = $1, setup_token_expires = now() + interval '7 days',
            login_email = COALESCE(login_email, contact_email)
     WHERE id = $2 RETURNING *`,
    [token, restaurant.id],
  );
  const updated = rows[0];
  const base = process.env.KIWORKS_PUBLIC_URL || 'https://ki-works.eu';
  const setup_link = `${base}/dashboard/?setup=${token}`;
  notifyN8n('kunde-eingeladen', { restaurant: publicRestaurant(updated), setup_link });
  return { restaurant: updated, setup_link };
}

app.post('/api/restaurants/:id/invite', adminOnly, async (req, res) => {
  const { rows } = await query('SELECT * FROM restaurants WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  if (!rows[0].login_email && !rows[0].contact_email) {
    return res.status(400).json({ error: 'Keine E-Mail-Adresse hinterlegt (weder Login- noch Kontakt-E-Mail)' });
  }
  const { setup_link } = await inviteRestaurant(rows[0]);
  res.json({ ok: true, setup_link });
});

app.post('/api/leads/:id/convert', adminOnly, async (req, res) => {
  const { rows } = await query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
  const lead = rows[0];
  if (!lead) return res.status(404).json({ error: 'not found' });
  const name = lead.business || lead.name;
  const inserted = await query(
    `INSERT INTO restaurants (name, contact_email, contact_phone, login_email)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, lead.email, lead.phone, lead.email],
  );
  const restaurant = inserted.rows[0];
  await query(
    "UPDATE leads SET status = 'won', converted_restaurant_id = $1 WHERE id = $2",
    [restaurant.id, lead.id],
  );
  const { setup_link } = await inviteRestaurant(restaurant);
  res.status(201).json({ ok: true, restaurant: publicRestaurant(restaurant), setup_link });
});

// Öffentlich: Kunde setzt über den Einladungslink sein eigenes Passwort.
app.post('/api/public/setup-password', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'Token und Passwort (min. 8 Zeichen) erforderlich' });
  }
  const { rows } = await query(
    `SELECT id FROM restaurants
     WHERE setup_token = $1 AND setup_token_expires > now()`,
    [token],
  );
  if (!rows[0]) return res.status(400).json({ error: 'Link ungültig oder abgelaufen' });
  await query(
    `UPDATE restaurants SET password_hash = $1, setup_token = NULL, setup_token_expires = NULL
     WHERE id = $2`,
    [hashPassword(password), rows[0].id],
  );
  res.json({ ok: true });
});

// --- Restaurants --------------------------------------------------------------
app.get('/api/restaurants', async (req, res) => {
  const scope = customerScope(req);
  const { rows } = scope
    ? await query('SELECT * FROM restaurants WHERE id = $1', [scope])
    : await query('SELECT * FROM restaurants ORDER BY id');
  res.json(rows.map(publicRestaurant));
});

app.post('/api/restaurants', adminOnly, async (req, res) => {
  const { name, address, contact_email, contact_phone, vapi_phone_number, enabled_roles } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const { rows } = await query(
    `INSERT INTO restaurants (name, address, contact_email, contact_phone, vapi_phone_number${enabled_roles ? ', enabled_roles' : ''})
     VALUES ($1, $2, $3, $4, $5${enabled_roles ? ', $6' : ''}) RETURNING *`,
    [name, address || null, contact_email || null, contact_phone || null, vapi_phone_number || null,
      ...(enabled_roles ? [JSON.stringify(enabled_roles)] : [])],
  );
  notifyN8n('restaurant-onboarding', { restaurant: publicRestaurant(rows[0]) });
  const vapi = await syncVapiAssistant(rows[0].id).catch((err) => ({ ok: false, warning: err.message }));
  const { rows: updated } = await query('SELECT * FROM restaurants WHERE id = $1', [rows[0].id]);
  res.status(201).json({ ...publicRestaurant(updated[0]), vapi });
});

app.patch('/api/restaurants/:id', adminOnly, async (req, res) => {
  const allowed = ['name', 'address', 'contact_email', 'contact_phone',
    'vapi_phone_number', 'vapi_assistant_id', 'login_email', 'vapi_published', 'pricing_tier'];
  const sets = [];
  const vals = [];
  for (const key of allowed) {
    if (key in req.body) {
      vals.push(req.body[key] === '' ? null : req.body[key]);
      sets.push(`${key} = $${vals.length}`);
    }
  }
  if ('enabled_roles' in req.body) {
    vals.push(JSON.stringify(req.body.enabled_roles || []));
    sets.push(`enabled_roles = $${vals.length}`);
  }
  if (req.body.password) {
    vals.push(hashPassword(req.body.password));
    sets.push(`password_hash = $${vals.length}`);
  }
  if (!sets.length) return res.status(400).json({ error: 'no fields' });
  vals.push(req.params.id);
  const { rows } = await query(
    `UPDATE restaurants SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`, vals,
  );
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  // Name/Adresse/Nummer/Rollen beeinflussen den Vapi-Assistenten — bei
  // Änderung gleich mit-synchronisieren, statt manuell setup-vapi.sh
  // nachzuziehen.
  let vapi;
  if (['name', 'address', 'vapi_phone_number', 'enabled_roles'].some((key) => key in req.body)) {
    vapi = await syncVapiAssistant(rows[0].id).catch((err) => ({ ok: false, warning: err.message }));
    const { rows: updated } = await query('SELECT * FROM restaurants WHERE id = $1', [rows[0].id]);
    return res.json({ ...publicRestaurant(updated[0]), vapi });
  }
  res.json(publicRestaurant(rows[0]));
});

// Manuelles Nachziehen für Bestandskunden, z. B. nach einer Prompt-Änderung
// (deploy/setup-vapi.sh ruft das auf) — dieselbe Logik wie oben, nur ohne
// gleichzeitige Feldänderung.
app.post('/api/restaurants/:id/sync-vapi', adminOnly, async (req, res) => {
  const vapi = await syncVapiAssistant(req.params.id);
  const { rows } = await query('SELECT * FROM restaurants WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json({ ...publicRestaurant(rows[0]), vapi });
});

// Selbstverwaltung: Betreiber ändert eigene Speisekarte/Öffnungszeiten/FAQ,
// Admin kann dasselbe für jeden Betrieb (kein adminOnly, stattdessen Scope-Check).
app.patch('/api/restaurants/:id/settings', async (req, res) => {
  const scope = customerScope(req);
  if (scope && String(scope) !== String(req.params.id)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const allowed = ['name', 'address', 'contact_email', 'contact_phone'];
  const sets = [];
  const vals = [];
  for (const key of allowed) {
    if (key in req.body) {
      vals.push(req.body[key] === '' ? null : req.body[key]);
      sets.push(`${key} = $${vals.length}`);
    }
  }
  if ('knowledge_base' in req.body) {
    vals.push(req.body.knowledge_base === '' ? null : req.body.knowledge_base);
    sets.push(`knowledge_base = $${vals.length}`);
  }
  if ('opening_hours' in req.body) {
    vals.push(JSON.stringify(req.body.opening_hours || {}));
    sets.push(`opening_hours = $${vals.length}`);
  }
  if ('faq' in req.body) {
    vals.push(JSON.stringify(req.body.faq || []));
    sets.push(`faq = $${vals.length}`);
  }
  if (!sets.length) return res.status(400).json({ error: 'no fields' });
  vals.push(req.params.id);
  const { rows } = await query(
    `UPDATE restaurants SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`, vals,
  );
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(publicRestaurant(rows[0]));
});

// Zugangsdaten ändern: Kunde muss sein aktuelles Passwort bestätigen, Admin nicht.
app.patch('/api/restaurants/:id/credentials', async (req, res) => {
  const scope = customerScope(req);
  if (scope && String(scope) !== String(req.params.id)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const { login_email, new_password, current_password } = req.body;
  if (!login_email && !new_password) return res.status(400).json({ error: 'no fields' });
  if (scope) {
    if (!new_password && !login_email) return res.status(400).json({ error: 'no fields' });
    if (!current_password) return res.status(400).json({ error: 'current_password required' });
    const { rows } = await query('SELECT password_hash FROM restaurants WHERE id = $1', [req.params.id]);
    if (!rows[0] || !verifyPassword(current_password, rows[0].password_hash)) {
      return res.status(403).json({ error: 'wrong current password' });
    }
  }
  const sets = [];
  const vals = [];
  if (login_email) { vals.push(login_email); sets.push(`login_email = $${vals.length}`); }
  if (new_password) { vals.push(hashPassword(new_password)); sets.push(`password_hash = $${vals.length}`); }
  vals.push(req.params.id);
  const { rows } = await query(
    `UPDATE restaurants SET ${sets.join(', ')} WHERE id = $${vals.length} RETURNING *`, vals,
  );
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(publicRestaurant(rows[0]));
});

// --- Reservations ---------------------------------------------------------------
app.get('/api/reservations', async (req, res) => {
  const scope = customerScope(req);
  const restaurantId = scope ?? req.query.restaurant_id;
  const cond = [];
  const vals = [];
  if (restaurantId) { vals.push(restaurantId); cond.push(`r.restaurant_id = $${vals.length}`); }
  if (req.query.date) { vals.push(req.query.date); cond.push(`r.reserved_at::date = $${vals.length}::date`); }
  const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT r.*, rest.name AS restaurant_name FROM reservations r
     JOIN restaurants rest ON rest.id = r.restaurant_id
     ${where} ORDER BY r.reserved_at DESC LIMIT 200`, vals,
  );
  res.json(rows);
});

// Upcoming reservations within N hours — used by the n8n reminder workflow.
app.get('/api/reservations/upcoming', async (req, res) => {
  const scope = customerScope(req);
  const hours = Math.min(parseInt(req.query.hours, 10) || 2, 48);
  const { rows } = await query(
    `SELECT r.*, rest.name AS restaurant_name, rest.contact_email FROM reservations r
     JOIN restaurants rest ON rest.id = r.restaurant_id
     WHERE r.status = 'confirmed'
       AND r.reserved_at BETWEEN now() AND now() + ($1 || ' hours')::interval
       AND ($2::int IS NULL OR r.restaurant_id = $2)
     ORDER BY r.reserved_at`, [hours, scope],
  );
  res.json(rows);
});

app.post('/api/reservations', async (req, res) => {
  const scope = customerScope(req);
  const restaurantId = scope ?? req.body.restaurant_id;
  const { customer_name, customer_phone, party_size, reserved_at, notes } = req.body;
  if (!restaurantId || !customer_name || !reserved_at) {
    return res.status(400).json({ error: 'restaurant_id, customer_name, reserved_at required' });
  }
  if (new Date(reserved_at).getTime() < Date.now()) {
    return res.status(400).json({ error: 'reserved_at liegt in der Vergangenheit' });
  }
  const { rows } = await query(
    `INSERT INTO reservations (restaurant_id, customer_name, customer_phone, party_size, reserved_at, notes, source)
     VALUES ($1, $2, $3, $4, $5, $6, 'dashboard') RETURNING *`,
    [restaurantId, customer_name, customer_phone || null, party_size || 2, reserved_at, notes || null],
  );
  notifyN8n('reservierung-erstellt', { reservation: rows[0] });
  if (rows[0].customer_phone) {
    const rest = await query('SELECT name FROM restaurants WHERE id = $1', [restaurantId]);
    sendSms(rows[0].customer_phone, reservationSms(rows[0], rest.rows[0]?.name || 'ki-works'))
      .catch((err) => console.error('SMS failed:', err.message));
  }
  res.status(201).json(rows[0]);
});

app.patch('/api/reservations/:id', async (req, res) => {
  const scope = customerScope(req);
  const { status } = req.body;
  if (!['confirmed', 'cancelled', 'no_show', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }
  const { rows } = await query(
    `UPDATE reservations SET status = $1
     WHERE id = $2 AND ($3::int IS NULL OR restaurant_id = $3) RETURNING *`,
    [status, req.params.id, scope],
  );
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

// --- Orders ------------------------------------------------------------------
app.get('/api/orders', async (req, res) => {
  const scope = customerScope(req);
  const restaurantId = scope ?? req.query.restaurant_id;
  const vals = [];
  let where = '';
  if (restaurantId) { vals.push(restaurantId); where = 'WHERE o.restaurant_id = $1'; }
  const { rows } = await query(
    `SELECT o.*, rest.name AS restaurant_name FROM orders o
     JOIN restaurants rest ON rest.id = o.restaurant_id
     ${where} ORDER BY o.created_at DESC LIMIT 200`, vals,
  );
  res.json(rows);
});

app.patch('/api/orders/:id', async (req, res) => {
  const scope = customerScope(req);
  const { status } = req.body;
  if (!['new', 'in_progress', 'ready', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }
  const { rows } = await query(
    `UPDATE orders SET status = $1
     WHERE id = $2 AND ($3::int IS NULL OR restaurant_id = $3) RETURNING *`,
    [status, req.params.id, scope],
  );
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

// --- Calls -------------------------------------------------------------------
app.get('/api/calls', async (req, res) => {
  const scope = customerScope(req);
  const restaurantId = scope ?? req.query.restaurant_id;
  const vals = [];
  let where = '';
  if (restaurantId) { vals.push(restaurantId); where = 'WHERE c.restaurant_id = $1'; }
  const { rows } = await query(
    `SELECT c.*, rest.name AS restaurant_name, cb.topic AS callback_topic FROM calls c
     LEFT JOIN restaurants rest ON rest.id = c.restaurant_id
     LEFT JOIN LATERAL (
       SELECT topic FROM callback_requests
       WHERE vapi_call_id = c.vapi_call_id ORDER BY created_at DESC LIMIT 1
     ) cb ON true
     ${where} ORDER BY c.created_at DESC LIMIT 200`, vals,
  );
  res.json(rows);
});

// Von Kiwo nicht beantwortete Fragen — der Kunde trägt die Antwort selbst in
// die FAQ ein (siehe PATCH .../settings) und markiert die Anfrage hier als
// erledigt, damit sie aus der offenen Liste verschwindet.
app.get('/api/callback-requests', async (req, res) => {
  const scope = customerScope(req);
  const restaurantId = scope ?? req.query.restaurant_id;
  const vals = [];
  const cond = [`status = 'open'`];
  if (restaurantId) { vals.push(restaurantId); cond.push(`restaurant_id = $${vals.length}`); }
  const { rows } = await query(
    `SELECT * FROM callback_requests WHERE ${cond.join(' AND ')} ORDER BY created_at DESC LIMIT 100`,
    vals,
  );
  res.json(rows);
});

app.patch('/api/callback-requests/:id', async (req, res) => {
  const scope = customerScope(req);
  const { status } = req.body;
  if (!['open', 'answered'].includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }
  const { rows } = await query(
    `UPDATE callback_requests SET status = $1
     WHERE id = $2 AND ($3::int IS NULL OR restaurant_id = $3) RETURNING *`,
    [status, req.params.id, scope],
  );
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

// Freigabe-Gate: Ausgaben von Kiwo-Agenten (z.B. Sales-Akquise-Mails), die
// vor dem Ausführen eine manuelle Freigabe im Dashboard brauchen. Admin ohne
// Betrieb-Filter sieht alle Betriebe (Meta-Ansicht), Betreiber nur eigene.
app.get('/api/pending-actions', async (req, res) => {
  const scope = customerScope(req);
  const restaurantId = scope ?? req.query.restaurant_id;
  const vals = [];
  const cond = [`status = 'pending'`];
  if (restaurantId) { vals.push(restaurantId); cond.push(`restaurant_id = $${vals.length}`); }
  const { rows } = await query(
    `SELECT pa.*, rest.name AS restaurant_name FROM pending_actions pa
     LEFT JOIN restaurants rest ON rest.id = pa.restaurant_id
     WHERE ${cond.join(' AND ')} ORDER BY created_at DESC LIMIT 100`,
    vals,
  );
  res.json(rows);
});

// Audit-Log: jede protokollierte Kiwo-Aktion (Telefon-Tool-Aufrufe, Sales-/
// Social-Agent-Läufe, echte Social-Media-Veröffentlichung). Kunden sehen nur
// die eigenen Einträge (customerScope filtert automatisch); interne
// Business-Aktionen ohne restaurant_id (Sales/Social für ki-works.eu selbst,
// künftig auch weitere eigene Businesses) sind per business-Query-Param
// filterbar — nur für Admin (Business-Dashboard), Kunden können den
// business-Filter nicht nutzen.
app.get('/api/audit-log', async (req, res) => {
  const scope = customerScope(req);
  const restaurantId = scope ?? req.query.restaurant_id;
  const business = scope ? null : req.query.business;
  const vals = [];
  const cond = [];
  if (restaurantId) { vals.push(restaurantId); cond.push(`restaurant_id = $${vals.length}`); }
  if (business) { vals.push(business); cond.push(`business = $${vals.length}`); }
  const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT * FROM audit_log ${where} ORDER BY created_at DESC LIMIT 200`,
    vals,
  );
  res.json(rows);
});

// payload (optional) überschreibt/ergänzt einzelne Felder vor dem Entscheiden
// (z. B. Caption-Text bearbeiten) — für alle pending_actions-Kinds nutzbar.
// Für role 'social' + kind 'post' löst eine Freigabe zusätzlich die echte
// Veröffentlichung aus (Facebook + Instagram); schlägt sie auf beiden
// Plattformen fehl, bleibt die Aktion "pending" (Bearbeitung wird trotzdem
// gespeichert, damit ein erneuter Versuch nicht die Änderungen verliert).
app.patch('/api/pending-actions/:id', async (req, res) => {
  const scope = customerScope(req);
  const { status, payload: payloadEdit } = req.body || {};
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'invalid status' });
  }
  const { rows: currentRows } = await query(
    `SELECT * FROM pending_actions WHERE id = $1 AND status = 'pending' AND ($2::int IS NULL OR restaurant_id = $2)`,
    [req.params.id, scope],
  );
  const action = currentRows[0];
  if (!action) return res.status(404).json({ error: 'not found' });
  let payload = payloadEdit ? { ...action.payload, ...payloadEdit } : action.payload;

  if (status === 'approved' && action.role === 'social' && action.kind === 'post') {
    const results = {};
    try {
      results.facebook = await publishFacebookPhoto({ imageUrl: payload.imageUrl, caption: payload.caption });
    } catch (err) {
      results.facebook = { error: err.message };
    }
    try {
      results.instagram = await publishInstagramPhoto({ imageUrl: payload.imageUrl, caption: payload.caption });
    } catch (err) {
      results.instagram = { error: err.message };
    }
    payload = { ...payload, published: results };
    const failed = Boolean(results.facebook?.error && results.instagram?.error);
    await logAction({
      business: 'ki-works',
      source: 'social_agent',
      action: 'publish',
      summary: failed
        ? `Veröffentlichung fehlgeschlagen: „${payload.headline}"`
        : `Post veröffentlicht: „${payload.headline}"`,
      details: { headline: payload.headline, results },
    });
    if (failed) {
      await query('UPDATE pending_actions SET payload = $1 WHERE id = $2', [JSON.stringify(payload), action.id]);
      return res.status(502).json({
        error: `Veröffentlichung fehlgeschlagen (Facebook: ${results.facebook.error}; Instagram: ${results.instagram.error})`,
      });
    }
  }

  const { rows } = await query(
    `UPDATE pending_actions SET status = $1, payload = $2, decided_at = now()
     WHERE id = $3 RETURNING *`,
    [status, JSON.stringify(payload), action.id],
  );
  res.json(rows[0]);
});

// Social-Media-Agent (Pilot ki-works.eu, Bild-Posts): wählt ein Thema, textet
// Headline/Subline/Caption per Claude, rendert die Grafik und legt einen
// pending_actions-Entwurf an (role 'social', kind 'post') — Veröffentlichung
// erst nach Freigabe im Dashboard (siehe PATCH oben).
app.post('/api/social-agent/run', adminOnly, async (req, res) => {
  try {
    const action = await runSocialAgent({ assetsDir: SOCIAL_ASSETS_DIR });
    res.json(action);
  } catch (err) {
    console.error('Social-Agent fehlgeschlagen:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// Sales-/Akquise-Agent (Pilot ki-works.eu): recherchiert per Websuche
// passende Betriebe und legt Mail-Entwürfe als pending_actions an. Läuft
// synchron im Request (wie /api/recommendations) — ein echter Lauf dauert
// durch die Websuchen spürbar länger, der Button im Dashboard zeigt
// währenddessen einen Ladezustand.
app.post('/api/sales-agent/run', adminOnly, async (req, res) => {
  try {
    const maxCandidates = Number(req.body?.maxCandidates) || 5;
    const result = await runSalesAgent({ maxCandidates });
    res.json(result);
  } catch (err) {
    console.error('Sales-Agent fehlgeschlagen:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// Vapis Aufnahme-URLs sind zeitlich befristet signiert (laufen nach einiger
// Zeit ab) — deshalb hier bei jedem Klick frisch von Vapi nachladen statt die
// beim Anruf gespeicherte URL direkt zu verwenden.
app.get('/api/calls/:id/recording', async (req, res) => {
  const scope = customerScope(req);
  const vals = [req.params.id];
  let where = 'id = $1';
  if (scope) { vals.push(scope); where += ' AND restaurant_id = $2'; }
  const { rows } = await query(`SELECT vapi_call_id, recording_url FROM calls WHERE ${where}`, vals);
  const call = rows[0];
  if (!call) return res.status(404).json({ error: 'not found' });
  if (!call.vapi_call_id || !process.env.VAPI_API_KEY) {
    if (call.recording_url) return res.json({ url: call.recording_url });
    return res.status(404).json({ error: 'keine Aufnahme verfügbar' });
  }
  try {
    const r = await fetch(`https://api.vapi.ai/call/${call.vapi_call_id}`, {
      headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
    });
    const data = await r.json();
    const fresh = data.artifact?.recordingUrl || data.recordingUrl || call.recording_url;
    if (!fresh) return res.status(404).json({ error: 'keine Aufnahme verfügbar' });
    res.json({ url: fresh });
  } catch (err) {
    console.error('Aufnahme-Abruf fehlgeschlagen:', err.message);
    if (call.recording_url) return res.json({ url: call.recording_url });
    res.status(502).json({ error: 'Vapi nicht erreichbar' });
  }
});

// --- Stats (dashboard + n8n reports) ----------------------------------------
async function statsSince(interval) {
  const { rows } = await query(
    `SELECT
       (SELECT count(*) FROM calls WHERE created_at > now() - $1::interval)                          AS calls,
       (SELECT count(*) FROM reservations WHERE created_at > now() - $1::interval)                   AS reservations,
       (SELECT count(*) FROM reservations WHERE created_at > now() - $1::interval AND source='phone') AS phone_reservations,
       (SELECT COALESCE(sum(party_size),0) FROM reservations
         WHERE created_at > now() - $1::interval AND status='confirmed')                             AS guests`,
    [interval],
  );
  return rows[0];
}

app.get('/api/stats', adminOnly, async (_req, res) => {
  const [today, week] = await Promise.all([statsSince('1 day'), statsSince('7 days')]);
  res.json({ today, week });
});
app.get('/api/stats/daily', adminOnly, async (_req, res) => res.json(await statsSince('1 day')));
app.get('/api/stats/weekly', adminOnly, async (_req, res) => res.json(await statsSince('7 days')));

// Per-customer stats: one row per restaurant incl. contact_email,
// so n8n can send each customer their own report.
async function statsByRestaurant(interval) {
  const { rows } = await query(
    `SELECT r.id AS restaurant_id, r.name, r.contact_email,
       (SELECT count(*) FROM calls c
         WHERE c.restaurant_id = r.id AND c.created_at > now() - $1::interval)          AS calls,
       (SELECT count(*) FROM reservations x
         WHERE x.restaurant_id = r.id AND x.created_at > now() - $1::interval)          AS reservations,
       (SELECT count(*) FROM reservations x
         WHERE x.restaurant_id = r.id AND x.created_at > now() - $1::interval
           AND x.source = 'phone')                                                      AS phone_reservations,
       (SELECT COALESCE(sum(x.party_size), 0) FROM reservations x
         WHERE x.restaurant_id = r.id AND x.created_at > now() - $1::interval
           AND x.status = 'confirmed')                                                  AS guests,
       (SELECT count(*) FROM orders o
         WHERE o.restaurant_id = r.id AND o.created_at > now() - $1::interval
           AND o.status <> 'cancelled')                                                 AS orders,
       (SELECT count(*) FROM calls c WHERE c.restaurant_id = r.id)                       AS total_calls,
       (SELECT min(created_at) FROM calls c WHERE c.restaurant_id = r.id)                AS first_call_at
     FROM restaurants r ORDER BY r.id`,
    [interval],
  );
  return rows;
}

const scopedStats = async (req, interval) => {
  const scope = customerScope(req);
  const rows = await statsByRestaurant(interval);
  return scope ? rows.filter((r) => r.restaurant_id === scope) : rows;
};

app.get('/api/stats/daily/by-restaurant', async (req, res) =>
  res.json(await scopedStats(req, '1 day')));
app.get('/api/stats/weekly/by-restaurant', async (req, res) =>
  res.json(await scopedStats(req, '7 days')));

// Minuten-Kontingente je Tarif (siehe landing/src/App.jsx pricingTiers —
// bei einer künftigen Preisänderung dort UND hier anpassen) + einheitlicher
// Überschreitungspreis (siehe MARKETING.md Tarif-Tabelle).
const PRICING_TIERS = {
  solo: { label: 'Solo', minutesIncluded: 600 },
  team: { label: 'Team', minutesIncluded: 1500 },
  scale: { label: 'Scale', minutesIncluded: 3500 },
};
const OVERAGE_RATE_PER_MINUTE = 0.20;

// Verbrauchte Gesprächsminuten im laufenden Kalendermonat + Vergleich gegen
// das Kontingent des gebuchten Tarifs (rein informativ — es gibt noch kein
// automatisches Billing, siehe CLAUDE.md „Offene Punkte").
app.get('/api/usage', async (req, res) => {
  const scope = customerScope(req);
  const restaurantId = scope ?? req.query.restaurant_id;
  if (!restaurantId) return res.status(400).json({ error: 'restaurant_id required' });

  const { rows: restaurantRows } = await query(
    'SELECT pricing_tier FROM restaurants WHERE id = $1', [restaurantId],
  );
  if (!restaurantRows[0]) return res.status(404).json({ error: 'not found' });
  const tierKey = restaurantRows[0].pricing_tier;
  const tier = PRICING_TIERS[tierKey] || null;

  const { rows } = await query(
    `SELECT COALESCE(sum(duration_seconds), 0) AS total_seconds
     FROM calls
     WHERE restaurant_id = $1
       AND created_at >= date_trunc('month', now())
       AND created_at < date_trunc('month', now()) + interval '1 month'`,
    [restaurantId],
  );
  const minutesUsed = Math.round((rows[0].total_seconds || 0) / 60);
  const overageMinutes = tier ? Math.max(0, minutesUsed - tier.minutesIncluded) : 0;

  res.json({
    tier: tierKey || null,
    tierLabel: tier?.label || null,
    minutesIncluded: tier?.minutesIncluded ?? null,
    minutesUsed,
    overageMinutes,
    overageCost: Math.round(overageMinutes * OVERAGE_RATE_PER_MINUTE * 100) / 100,
    overageRatePerMinute: OVERAGE_RATE_PER_MINUTE,
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
  });
});

// KI-Empfehlungen für einen Betrieb auf Basis der Wochenzahlen.
app.get('/api/recommendations', async (req, res) => {
  const scope = customerScope(req);
  const rows = await statsByRestaurant('7 days');
  const wanted = scope ?? req.query.restaurant_id;
  const row = wanted
    ? rows.find((r) => String(r.restaurant_id) === String(wanted))
    : rows[0];
  if (!row) return res.status(404).json({ error: 'restaurant not found' });
  const text = await businessRecommendations(row.name, {
    anrufe: row.calls,
    reservierungen: row.reservations,
    davon_telefonisch: row.phone_reservations,
    gaeste: row.guests,
  });
  res.json({
    restaurant_id: row.restaurant_id,
    name: row.name,
    recommendations: text || 'Keine Empfehlungen verfügbar (Claude-API nicht erreichbar).',
  });
});

// --- DSGVO: Anruf-Rohdaten (Transkript, Aufnahme) nach 7 Tagen löschen ----------
// Zusammenfassung, Rufnummer, Zeiten und Ergebnis bleiben für Statistik und
// Stammgast-Erkennung erhalten — nur der Wortlaut des Gesprächs wird entfernt.
async function purgeOldCallRawData() {
  try {
    const { rowCount } = await query(
      `UPDATE calls SET transcript = NULL, recording_url = NULL
       WHERE created_at < now() - interval '7 days'
         AND (transcript IS NOT NULL OR recording_url IS NOT NULL)`,
    );
    if (rowCount) console.log(`DSGVO-Löschung: ${rowCount} Anruf-Rohdatensätze bereinigt`);
  } catch (err) {
    console.error('purgeOldCallRawData failed:', err.message);
  }
}
purgeOldCallRawData();
setInterval(purgeOldCallRawData, 24 * 60 * 60 * 1000);
startMonitoring();

// -----------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  logError('api', err);
  res.status(500).json({ error: 'internal error' });
});

const port = process.env.PORT || 3001;
app.listen(port, '127.0.0.1', () => console.log(`ki-works API listening on 127.0.0.1:${port}`));
