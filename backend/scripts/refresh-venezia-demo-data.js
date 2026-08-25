// Hält das Test-Restaurant Venezia für Vorführungen/Verkaufsgespräche
// "frisch" — löscht die zuvor selbst erzeugten Demo-Einträge (erkennbar am
// [AUTO-DEMO]-Marker, echte/manuelle Testeinträge bleiben unangetastet) und
// legt neue Reservierungen/Anrufe/Bestellungen für die aktuelle Kalenderwoche
// (Montag-Sonntag) an. Läuft wöchentlich per systemd-Timer
// (ki-works-demo-refresh.timer), siehe deploy/systemd/.
//
// WICHTIG: Vor dem echten Live-Gang (erste zahlende Restaurant-Kunden) muss
// dieser Timer deaktiviert und alle [AUTO-DEMO]-Einträge final gelöscht
// werden — siehe CLAUDE.md "Offene Punkte".
//
// Aufruf: node backend/scripts/refresh-venezia-demo-data.js
import { query } from '../src/db.js';

const MARKER = '[AUTO-DEMO]';

const FIRST_NAMES = ['Anna', 'Lukas', 'Sophie', 'Michael', 'Julia', 'Thomas', 'Laura', 'Stefan',
  'Elena', 'Markus', 'Katharina', 'Andreas', 'Nina', 'Christian', 'Sarah', 'Florian', 'Lena', 'Daniel'];
const LAST_NAMES = ['Gruber', 'Huber', 'Bauer', 'Wagner', 'Pichler', 'Steiner', 'Moser', 'Berger',
  'Fuchs', 'Mayer', 'Winkler', 'Weber', 'Schmid', 'Leitner', 'Hofer', 'Aigner'];
const PIZZAS = ['Margherita', 'Salami', 'Al Funghi', 'Diavolo', 'Quattro Formaggio', 'Prosciutto',
  'Capricciosa', 'Frutti di Mare', 'Vegetarische Pizza', 'Hawai'];
const CALL_SUMMARIES = [
  'Gast hat nach den Öffnungszeiten am Wochenende gefragt.',
  'Reservierung für den Abend telefonisch bestätigt.',
  'Anrufer wollte wissen, ob es glutenfreie Pizza gibt.',
  'Kurzer Anruf, aufgelegt bevor ein Anliegen genannt wurde.',
  'Frage nach der Speisekarte für eine Firmenfeier beantwortet.',
  'Reservierung storniert, Tisch wird nicht mehr benötigt.',
  'Frage zu Lieferzeiten und Liefergebiet beantwortet.',
];

const randOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const fakePhone = () => `+43 664 ${randInt(1000000, 9999999)}`;

function mondayOf(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Montag = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function atDayHour(monday, dayOffset, hour, minute = 0) {
  const d = new Date(monday);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  const { rows } = await query("SELECT id FROM restaurants WHERE name = 'Venezia'");
  if (!rows[0]) {
    console.error('Restaurant "Venezia" nicht gefunden — nichts zu tun.');
    process.exit(1);
  }
  const restaurantId = rows[0].id;

  const delRes = await query(
    "DELETE FROM reservations WHERE restaurant_id = $1 AND notes LIKE '%' || $2 || '%'",
    [restaurantId, MARKER],
  );
  const delOrd = await query(
    "DELETE FROM orders WHERE restaurant_id = $1 AND notes LIKE '%' || $2 || '%'",
    [restaurantId, MARKER],
  );
  const delCalls = await query(
    "DELETE FROM calls WHERE restaurant_id = $1 AND summary LIKE $2 || '%'",
    [restaurantId, MARKER],
  );
  console.log(`Alte Demo-Einträge gelöscht: ${delRes.rowCount} Reservierungen, `
    + `${delOrd.rowCount} Bestellungen, ${delCalls.rowCount} Anrufe.`);

  const monday = mondayOf(new Date());
  const now = new Date();

  let createdRes = 0;
  for (let i = 0; i < 18; i += 1) {
    const day = randInt(0, 6);
    const lunch = Math.random() < 0.35;
    const hour = lunch ? randInt(11, 13) : randInt(18, 21);
    const reservedAt = atDayHour(monday, day, hour, randOf([0, 15, 30, 45]));
    const status = reservedAt < now ? randOf(['completed', 'completed', 'no_show']) : 'confirmed';
    await query(
      `INSERT INTO reservations (restaurant_id, customer_name, customer_phone, party_size, reserved_at, status, notes, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'phone')`,
      [restaurantId, `${randOf(FIRST_NAMES)} ${randOf(LAST_NAMES)}`, fakePhone(),
        randInt(2, 6), reservedAt.toISOString(), status, MARKER],
    );
    createdRes += 1;
  }

  let createdOrd = 0;
  for (let i = 0; i < 8; i += 1) {
    const day = randInt(0, 6);
    const hour = randOf([12, 13, 18, 19, 20]);
    const requestedAt = atDayHour(monday, day, hour, randOf([0, 30]));
    const itemCount = randInt(1, 3);
    const items = Array.from({ length: itemCount }, () => `1x Pizza ${randOf(PIZZAS)}`).join(', ');
    const status = requestedAt < now ? 'completed' : randOf(['new', 'in_progress']);
    await query(
      `INSERT INTO orders (restaurant_id, customer_name, customer_phone, items, fulfillment, requested_at, status, notes, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'phone')`,
      [restaurantId, `${randOf(FIRST_NAMES)} ${randOf(LAST_NAMES)}`, fakePhone(), items,
        randOf(['pickup', 'delivery']), requestedAt.toISOString(), status, MARKER],
    );
    createdOrd += 1;
  }

  let createdCalls = 0;
  for (let i = 0; i < 14; i += 1) {
    const day = randInt(0, 6);
    const startedAt = atDayHour(monday, day, randInt(10, 21), randOf([0, 20, 40]));
    if (startedAt > now) continue; // Anrufe nur in der Vergangenheit, nicht "vorhersagen"
    const duration = randInt(30, 240);
    const endedAt = new Date(startedAt.getTime() + duration * 1000);
    await query(
      `INSERT INTO calls (restaurant_id, vapi_call_id, caller_number, started_at, ended_at,
                           duration_seconds, summary, outcome, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $4)`,
      [restaurantId, `demo-${Date.now()}-${i}`, fakePhone(), startedAt.toISOString(), endedAt.toISOString(),
        duration, `${MARKER} ${randOf(CALL_SUMMARIES)}`, randOf(['reservation', 'info', 'info', 'missed', 'other'])],
    );
    createdCalls += 1;
  }

  console.log(`Neue Demo-Einträge für die aktuelle Woche: ${createdRes} Reservierungen, `
    + `${createdOrd} Bestellungen, ${createdCalls} Anrufe.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Fehler beim Demo-Daten-Refresh:', err);
  process.exit(1);
});
