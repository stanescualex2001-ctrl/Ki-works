import express from 'express';
import { query } from './db.js';
import { handleVapiWebhook } from './vapi.js';
import { notifyN8n } from './n8n.js';
import { businessRecommendations } from './claude.js';
import { sendSms, reservationSms } from './sms.js';
import {
  authMiddleware, adminOnly, customerScope,
  hashPassword, verifyPassword, signToken,
} from './auth.js';

process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));

const app = express();
app.set('trust proxy', 'loopback');
app.use(express.json({ limit: '2mb' }));
app.use(authMiddleware);

// Async-Fehler aus Routen landen im Error-Handler statt die Anfrage hängen zu lassen.
for (const method of ['get', 'post', 'patch']) {
  const orig = app[method].bind(app);
  app[method] = (path, ...handlers) => (handlers.length
    ? orig(path, ...handlers.map((h) => (req, res, next) =>
      Promise.resolve(h(req, res, next)).catch(next)))
    : orig(path));
}

const publicRestaurant = ({ password_hash, ...rest }) => rest;

// --- Health -----------------------------------------------------------------
app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, service: 'ki-works-api' });
  } catch {
    res.status(500).json({ ok: false });
  }
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

// --- Restaurants --------------------------------------------------------------
app.get('/api/restaurants', async (req, res) => {
  const scope = customerScope(req);
  const { rows } = scope
    ? await query('SELECT * FROM restaurants WHERE id = $1', [scope])
    : await query('SELECT * FROM restaurants ORDER BY id');
  res.json(rows.map(publicRestaurant));
});

app.post('/api/restaurants', adminOnly, async (req, res) => {
  const { name, address, contact_email, contact_phone, vapi_phone_number } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const { rows } = await query(
    `INSERT INTO restaurants (name, address, contact_email, contact_phone, vapi_phone_number)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, address || null, contact_email || null, contact_phone || null, vapi_phone_number || null],
  );
  notifyN8n('restaurant-onboarding', { restaurant: publicRestaurant(rows[0]) });
  res.status(201).json(publicRestaurant(rows[0]));
});

app.patch('/api/restaurants/:id', adminOnly, async (req, res) => {
  const allowed = ['name', 'address', 'contact_email', 'contact_phone',
    'vapi_phone_number', 'vapi_assistant_id', 'login_email'];
  const sets = [];
  const vals = [];
  for (const key of allowed) {
    if (key in req.body) {
      vals.push(req.body[key] === '' ? null : req.body[key]);
      sets.push(`${key} = $${vals.length}`);
    }
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

// --- Calls -------------------------------------------------------------------
app.get('/api/calls', async (req, res) => {
  const scope = customerScope(req);
  const restaurantId = scope ?? req.query.restaurant_id;
  const vals = [];
  let where = '';
  if (restaurantId) { vals.push(restaurantId); where = 'WHERE c.restaurant_id = $1'; }
  const { rows } = await query(
    `SELECT c.*, rest.name AS restaurant_name FROM calls c
     LEFT JOIN restaurants rest ON rest.id = c.restaurant_id
     ${where} ORDER BY c.created_at DESC LIMIT 200`, vals,
  );
  res.json(rows);
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
           AND x.status = 'confirmed')                                                  AS guests
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

// -----------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error('API error:', err.message);
  res.status(500).json({ error: 'internal error' });
});

const port = process.env.PORT || 3001;
app.listen(port, '127.0.0.1', () => console.log(`ki-works API listening on 127.0.0.1:${port}`));
