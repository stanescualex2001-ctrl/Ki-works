// Prüft täglich das Gesprächsminuten-Kontingent jedes Kunden (gleiche
// Datenbasis wie GET /api/usage, siehe server.js) und löst bei Annäherung/
// Überschreitung eine E-Mail an Kunde + Admin aus — plus eine regelbasierte
// (kein Claude-Aufruf, keine laufenden Kosten) Einschätzung, ob ein anderer
// Tarif besser passen würde. Der eigentliche E-Mail-Versand/-Text läuft wie
// bei allen anderen Benachrichtigungen über n8n (notifyN8n), nicht hier —
// dieses Modul liefert nur die Daten.
import { query } from './db.js';
import { notifyN8n } from './n8n.js';
import { PRICING_TIERS, PRICING_TIER_ORDER, OVERAGE_RATE_PER_MINUTE } from './pricing.js';

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
// Ab wann die Vorwarnung ("bald voll") greift. 100%-Schwelle ergibt sich
// direkt aus minutesIncluded.
const APPROACHING_RATIO = 0.8;
// Für die Tarif-Empfehlung: Monatsdurchschnitt über/unter diesem Anteil des
// Kontingents löst Hoch-/Runterstufungs-Vorschlag aus. 2 volle Monate
// Datenbasis nötig, damit ein einzelner ungewöhnlicher Monat nicht sofort
// einen Tarifwechsel vorschlägt.
const UPGRADE_RATIO = 0.9;
const DOWNGRADE_RATIO = 0.4;
const MIN_MONTHS_FOR_RECOMMENDATION = 2;

function currentPeriodStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

// Regelbasierte Tarif-Empfehlung aus den letzten (bis zu 3) abgeschlossenen
// Kalendermonaten — bewusst ohne Claude-Aufruf (Standing Rule: kein
// automatisierter, laufender Anthropic-Verbrauch ohne Bestätigung pro Lauf).
function recommendTierChange(tierKey, completedMonthMinutes) {
  const tier = PRICING_TIERS[tierKey];
  if (!tier || completedMonthMinutes.length < MIN_MONTHS_FOR_RECOMMENDATION) return null;
  const avg = completedMonthMinutes.reduce((a, b) => a + b, 0) / completedMonthMinutes.length;
  const idx = PRICING_TIER_ORDER.indexOf(tierKey);

  if (avg >= tier.minutesIncluded * UPGRADE_RATIO && idx < PRICING_TIER_ORDER.length - 1) {
    const nextKey = PRICING_TIER_ORDER[idx + 1];
    return { action: 'upgrade', suggestedTier: nextKey, suggestedTierLabel: PRICING_TIERS[nextKey].label, avgMinutesUsed: Math.round(avg) };
  }
  if (avg <= tier.minutesIncluded * DOWNGRADE_RATIO && idx > 0) {
    const prevKey = PRICING_TIER_ORDER[idx - 1];
    return { action: 'downgrade', suggestedTier: prevKey, suggestedTierLabel: PRICING_TIERS[prevKey].label, avgMinutesUsed: Math.round(avg) };
  }
  return null;
}

async function alreadySent(restaurantId, periodStart, threshold) {
  const { rows } = await query(
    'SELECT 1 FROM usage_warnings_sent WHERE restaurant_id = $1 AND period_start = $2 AND threshold = $3',
    [restaurantId, periodStart, threshold],
  );
  return rows.length > 0;
}

async function markSent(restaurantId, periodStart, threshold) {
  await query(
    `INSERT INTO usage_warnings_sent (restaurant_id, period_start, threshold)
     VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
    [restaurantId, periodStart, threshold],
  );
}

export async function checkUsageWarnings() {
  const periodStart = currentPeriodStart();
  const adminEmail = process.env.ADMIN_EMAIL || null;

  const { rows: restaurants } = await query(
    `SELECT r.id, r.name, r.contact_email, r.pricing_tier,
       COALESCE((SELECT sum(c.duration_seconds) FROM calls c
         WHERE c.restaurant_id = r.id
           AND c.created_at >= date_trunc('month', now())
           AND c.created_at < date_trunc('month', now()) + interval '1 month'), 0) AS current_month_seconds
     FROM restaurants r
     WHERE r.pricing_tier IS NOT NULL AND r.contact_email IS NOT NULL`,
  );
  if (!restaurants.length) return;

  const { rows: history } = await query(
    `SELECT restaurant_id, date_trunc('month', created_at) AS month, sum(duration_seconds) AS seconds
     FROM calls
     WHERE created_at >= date_trunc('month', now()) - interval '3 months'
       AND created_at < date_trunc('month', now())
     GROUP BY restaurant_id, month`,
  );
  const historyByRestaurant = new Map();
  for (const row of history) {
    const list = historyByRestaurant.get(row.restaurant_id) || [];
    list.push(Math.round((row.seconds || 0) / 60));
    historyByRestaurant.set(row.restaurant_id, list);
  }

  for (const r of restaurants) {
    const tier = PRICING_TIERS[r.pricing_tier];
    if (!tier) continue;
    const minutesUsed = Math.round((r.current_month_seconds || 0) / 60);
    const overageMinutes = Math.max(0, minutesUsed - tier.minutesIncluded);
    const completedMonthMinutes = historyByRestaurant.get(r.id) || [];
    const recommendation = recommendTierChange(r.pricing_tier, completedMonthMinutes);

    let kind = null;
    let threshold = null;
    if (minutesUsed >= tier.minutesIncluded) {
      kind = 'exceeded';
      threshold = '100pct';
    } else if (minutesUsed >= tier.minutesIncluded * APPROACHING_RATIO) {
      kind = 'approaching';
      threshold = '80pct';
    }

    if (kind && !(await alreadySent(r.id, periodStart, threshold))) {
      notifyN8n('usage-warning', {
        kind,
        restaurantId: r.id,
        restaurantName: r.name,
        contactEmail: r.contact_email,
        adminEmail,
        tier: r.pricing_tier,
        tierLabel: tier.label,
        minutesIncluded: tier.minutesIncluded,
        minutesUsed,
        overageMinutes,
        overageCost: Math.round(overageMinutes * OVERAGE_RATE_PER_MINUTE * 100) / 100,
        recommendation,
        periodStart,
      });
      await markSent(r.id, periodStart, threshold);
    }

    // Downgrade-Empfehlung ist unabhängig von der aktuellen Monats-Auslastung
    // (genau umgekehrter Fall: dauerhaft zu wenig genutzt) — eigene
    // Benachrichtigung, einmal pro Monat, auch wenn kein Schwellenwert oben
    // ausgelöst hat.
    if (recommendation?.action === 'downgrade' && !(await alreadySent(r.id, periodStart, 'downgrade'))) {
      notifyN8n('usage-warning', {
        kind: 'downgrade-suggestion',
        restaurantId: r.id,
        restaurantName: r.name,
        contactEmail: r.contact_email,
        adminEmail,
        tier: r.pricing_tier,
        tierLabel: tier.label,
        minutesIncluded: tier.minutesIncluded,
        minutesUsed,
        recommendation,
        periodStart,
      });
      await markSent(r.id, periodStart, 'downgrade');
    }
  }
}

export function startUsageWarningChecks() {
  checkUsageWarnings().catch((err) => console.error('checkUsageWarnings failed:', err.message));
  setInterval(
    () => checkUsageWarnings().catch((err) => console.error('checkUsageWarnings failed:', err.message)),
    CHECK_INTERVAL_MS,
  );
}
