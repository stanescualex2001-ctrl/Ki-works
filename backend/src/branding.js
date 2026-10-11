import { query } from './db.js';

// Zentrale Stelle für Agentur-Branding in Benachrichtigungen (E-Mails über
// n8n) — damit Agentur-Kunden (White-Label, z. B. pixelpress) nie "KI-Works"
// oder "Kiwo" sehen, wenn ihr eigenes Branding gesetzt ist. Gleiche
// Branding-Struktur wie dashboard/business-dashboard (agencies.branding
// JSONB: productName, assistantName, logoUrl, accent, ...).
const DEFAULT_BRANDING = { productName: 'KI-Works', assistantName: 'Kiwo' };

export async function getAgencyBranding(agencyId) {
  if (!agencyId) return DEFAULT_BRANDING;
  try {
    const { rows } = await query('SELECT branding FROM agencies WHERE id = $1', [agencyId]);
    const b = rows[0]?.branding || {};
    return {
      productName: b.productName || DEFAULT_BRANDING.productName,
      assistantName: b.assistantName || DEFAULT_BRANDING.assistantName,
    };
  } catch (err) {
    console.error('getAgencyBranding failed:', err.message);
    return DEFAULT_BRANDING;
  }
}
