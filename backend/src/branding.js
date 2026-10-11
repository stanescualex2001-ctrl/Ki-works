import { query } from './db.js';

// Zentrale Stelle für Agentur-Branding in Benachrichtigungen (E-Mails über
// n8n) — damit Agentur-Kunden (White-Label, z. B. pixelpress) nie "KI-Works"
// oder "Kiwo" sehen, wenn ihr eigenes Branding gesetzt ist. Gleiche
// Branding-Struktur wie dashboard/business-dashboard (agencies.branding
// JSONB: productName, assistantName, logoUrl, accent, ...).
//
// baseUrl ist wichtig für Links in diesen Mails (Setup-/Reset-Link): zeigt
// der Link auf ki-works.eu statt auf die eigene Agentur-Domain, landet der
// Kunde beim Klick erst recht wieder auf KI-Works-Branding, bevor er die
// richtige Domain findet (11.10.2026, Nutzer-Hinweis). `agencies.domain`
// ist NOT NULL — jede Agentur hat also immer eine eigene Domain, sobald sie
// angelegt ist.
const DEFAULT_BRANDING = {
  productName: 'KI-Works',
  assistantName: 'Kiwo',
  baseUrl: 'https://ki-works.eu',
};

export async function getAgencyBranding(agencyId) {
  if (!agencyId) return DEFAULT_BRANDING;
  try {
    const { rows } = await query('SELECT branding, domain FROM agencies WHERE id = $1', [agencyId]);
    if (!rows[0]) return DEFAULT_BRANDING;
    const b = rows[0].branding || {};
    return {
      productName: b.productName || DEFAULT_BRANDING.productName,
      assistantName: b.assistantName || DEFAULT_BRANDING.assistantName,
      baseUrl: rows[0].domain ? `https://${rows[0].domain}` : DEFAULT_BRANDING.baseUrl,
    };
  } catch (err) {
    console.error('getAgencyBranding failed:', err.message);
    return DEFAULT_BRANDING;
  }
}
