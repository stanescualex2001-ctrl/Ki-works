// Zentraler Audit-Log-Helfer: jede Aktion eines Kiwo-Agenten (Telefon-Tool-
// Aufrufe, Sales-/Social-Agent-Läufe, echte Social-Media-Veröffentlichung)
// wird hierüber protokolliert. Schreibfehler dürfen die eigentliche Aktion
// nie blockieren — deshalb best-effort mit Fehler-Log statt throw.
import { query } from './db.js';
import { logError } from './monitoring.js';

export async function logAction({
  restaurantId = null, business = null, source, action, summary, details = {}, callId = null,
}) {
  try {
    await query(
      `INSERT INTO audit_log (restaurant_id, business, source, action, summary, details, call_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [restaurantId, business, source, action, summary, JSON.stringify(details), callId],
    );
  } catch (err) {
    logError('audit-log', err);
  }
}
