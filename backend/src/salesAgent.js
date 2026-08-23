import Anthropic from '@anthropic-ai/sdk';
import { ImapFlow } from 'imapflow';
import { query } from './db.js';
import { logAction } from './auditLog.js';

const MODEL = process.env.SALES_AGENT_MODEL || 'claude-sonnet-5';
const SENDER_NAME = process.env.KALTAKQUISE_SENDER_NAME || 'Alex';

// Ziel-Profil + Qualifizierungskriterien für ki-works.eu. Bewusst als eigene,
// benannte Konstanten gehalten statt im Prompt-String vergraben — dieselbe
// Definition kann später 1:1 in eine Vapi-"Kiwo Sales"-Telefonrolle
// (Live-Qualifizierung von Anrufer-Leads) einfließen, ohne neu entworfen
// werden zu müssen.
//
// Verschmolzen (23.08.2026) mit dem vormals separaten
// backend/scripts/kaltakquise-agent.js: gleicher Kandidaten-Pool/Prompt/
// E-Mail-Stil für beide Auslöser (Dashboard-Button UND täglicher Cron) —
// Zielgebiet/Branchen dabei auf den breiteren Kaltakquise-Scope angehoben
// (bewusst branchenoffen, nicht nur Restaurants/Hotels, siehe CLAUDE.md
// "Andere Branchen als Restaurants"-Brainstorming).
const TARGET_PROFILE = `Kleine und mittlere Betriebe mit viel telefonischem
Kundenkontakt im Bezirk Perg und in der Stadt Linz (Oberösterreich).
Branchenoffen: Restaurants/Gasthäuser/Cafés/kleine Hotels, Handwerk
(z. B. KFZ-Werkstätten), Friseure/Kosmetik, Physiotherapie, Kanzleien,
Immobilienmakler und ähnliche Betriebe mit Rezeption/Empfang.`;

const QUALIFICATION_CRITERIA = `Ein guter Kandidat:
- ist ein Betrieb aus dem Zielprofil mit Telefonnummer und Website ODER
  zumindest einem öffentlichen Google-Business-/Social-Media-Eintrag
- liegt im Zielgebiet (Bezirk Perg oder Stadt Linz)
- hat erkennbar Bedarf an besserer telefonischer Erreichbarkeit (z. B.
  keine/kaum Online-Terminbuchung, Hinweise auf Personalmangel)
- hat eine öffentlich auffindbare Kontakt-E-Mail-Adresse (kein Kandidat
  ohne E-Mail — sonst kann keine Kaltakquise-Mail vorbereitet werden)`;

// Stil-Vorlage (23.08.2026, vom Nutzer bestätigt nach zwei Iterationen) —
// locker/"du", mit konkret aufgezählten Vorteilen (inkl. Kunden-Dashboard)
// statt nur einem pauschalen Nutzensatz.
const STYLE_EXAMPLE = `Hallo,

bei einem Betrieb wie Hotel B3 geht oft viel Zeit für Telefon, WhatsApp und
Reservierungs-/Anfragenmanagement drauf – neben dem eigentlichen Betrieb.
Genau da setzt Kiwo (ki-works.eu) an: ein KI-Mitarbeiter, der diese Arbeit
für euch übernimmt.

Konkret heißt das:
- Anrufe und WhatsApp-Anfragen werden rund um die Uhr entgegengenommen,
  auch abends und am Wochenende
- Reservierungen und Terminanfragen landen automatisch organisiert bei euch
  – keine verpassten Anfragen mehr
- Ein eigenes Kunden-Dashboard zeigt euch jederzeit alle Anrufe,
  Reservierungen und Anfragen auf einen Blick, inklusive Aufzeichnungen
  zum Nachhören
- Alles DSGVO-konform gehostet in der EU

Der erste Monat ist kostenlos, danach unverbindlich kündbar.

Hättest du Lust auf ein kurzes Gespräch (15 Min), um zu schauen, ob das für
euch passt?

Beste Grüße
${SENDER_NAME}
ki-works.eu`;

function buildPrompt(maxCandidates, excludeList) {
  return `Du recherchierst potenzielle Neukunden für ki-works.eu, eine
Plattform für KI-Telefonassistenten (Produktname "Kiwo").

Zielprofil:
${TARGET_PROFILE}

Qualifizierungskriterien:
${QUALIFICATION_CRITERIA}

Bereits kontaktiert (NICHT nochmal vorschlagen):
${excludeList}

Finde bis zu ${maxCandidates} passende, noch nicht kontaktierte Betriebe per
Websuche, verteilt über mehrere Branchen (nicht nur eine). Entwirf für jeden
Kandidaten eine individuelle Akquise-Mail auf Deutsch (Betreff + Text) in
genau diesem Stil (vom Nutzer bestätigtes Vorbild, Aufbau/Ton beibehalten,
Inhalt pro Kandidat individuell anpassen):

---
${STYLE_EXAMPLE}
---

Wichtige Stilregeln:
- Lockere, persönliche Anrede mit "du" (NICHT "Sie") — kein Massenmail-Ton.
- Erster Absatz: konkreter, auf den Betrieb zugeschnittener Zeitfresser
  (z. B. "bei einem Betrieb wie [Name] geht oft viel Zeit für Telefon,
  WhatsApp und Reservierungs-/Anfragenmanagement drauf" — an die tatsächliche
  Situation des Betriebs anpassen, nicht wortgleich kopieren) + kurze
  Überleitung zu Kiwo.
- Danach 3-4 Bullet-Points mit KONKRETEN Vorteilen, angepasst an den
  Betriebstyp (z. B. bei einem Hotel: Zimmeranfragen; bei einer Werkstatt:
  Terminvereinbarung für Service). Mindestens einer der Punkte muss das
  **Kunden-Dashboard** erwähnen (Überblick über Anrufe/Anfragen/Termine,
  Aufzeichnungen zum Nachhören), einer die **24/7-Erreichbarkeit**, einer
  **DSGVO-Konformität/EU-Hosting**.
- Satz zum ersten Monat kostenlos + unverbindlich kündbar.
- Kurze, konkrete Frage nach einem 15-minütigen Gespräch als Call-to-Action.
- Unterschrift: "Beste Grüße", "${SENDER_NAME}", "ki-works.eu" (drei Zeilen).
- WICHTIG: Setze immer den echten, recherchierten Firmennamen ein
  ("Hotel B3" im Vorbild ist nur ein Beispielname). Verwende NIEMALS ein
  Platzhalter-Token wie "[Firmenname]", "{{name}}", "<Name des Betriebs>"
  o. ä. im fertigen Mailtext — der Text muss versandfertig sein.
- Insgesamt trotz der Bullet-Points kompakt bleiben (wie im Vorbild) — keine
  Marketing-Floskeln, keine übertriebenen Versprechen.

Antworte NUR mit einem JSON-Codeblock (\`\`\`json ... \`\`\`), keinem weiteren
Text davor oder danach. Format: ein JSON-Array von Objekten mit genau diesen
Feldern: business_name, branch, website (string oder null), city (string
oder null), contact_email (string, Pflichtfeld — Kandidaten ohne
auffindbare E-Mail nicht aufnehmen), subject, body.
Wenn du keine passenden, noch nicht kontaktierten Kandidaten findest, gib ein
leeres Array [] zurück.`;
}

function extractJsonArray(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text.match(/(\[[\s\S]*\])/)?.[1];
  if (!raw) throw new Error('Sales-Agent: keine verwertbare JSON-Antwort erhalten');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Sales-Agent: JSON-Antwort ungültig (${err.message})`);
  }
  if (!Array.isArray(parsed)) throw new Error('Sales-Agent: Antwort ist kein Array');
  return parsed;
}

// Best-effort: legt die Mail zusätzlich als echten IMAP-Entwurf im
// konfigurierten Postfach ab, damit sie sofort versandfertig ist (nicht nur
// als Dashboard-Freigabe sichtbar). Läuft nur, wenn IMAP-Zugangsdaten
// vorhanden sind (siehe /etc/ki-works/kaltakquise.env) — fehlen sie (z. B.
// wenn der Dashboard-Button ohne diese Env-Variablen läuft), wird das
// Draften übersprungen, ohne den restlichen Lauf zu beeinträchtigen.
async function draftImapEmail(candidate) {
  if (!process.env.IMAP_HOST || !process.env.IMAP_USER || !process.env.IMAP_PASS) return false;

  const client = new ImapFlow({
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT || 993),
    secure: true,
    auth: { user: process.env.IMAP_USER, pass: process.env.IMAP_PASS },
    logger: false,
  });
  const draftsFolder = process.env.DRAFTS_FOLDER || 'Drafts';

  await client.connect();
  try {
    const message = [
      `From: ${process.env.IMAP_USER}`,
      `To: ${candidate.business_name} <${candidate.contact_email}>`,
      `Subject: ${candidate.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      '',
      candidate.body,
    ].join('\r\n');
    await client.append(draftsFolder, message, ['\\Draft']);
    return true;
  } finally {
    await client.logout();
  }
}

export async function runSalesAgent({ maxCandidates = 5 } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY fehlt');

  const { rows: existing } = await query(
    `SELECT payload->>'business_name' AS business_name, payload->>'website' AS website
     FROM pending_actions WHERE role = 'sales'`,
  );
  const excludeList = existing.length
    ? existing.map((r) => `${r.business_name || '?'} (${r.website || 'Website unbekannt'})`).join('\n')
    : '(noch keine)';

  const client = new Anthropic({ apiKey });
  const tools = [
    { type: 'web_search_20260209', name: 'web_search', max_uses: 15 },
    { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 15 },
  ];
  const messages = [{ role: 'user', content: buildPrompt(maxCandidates, excludeList) }];

  // Server-Tools laufen serverseitig in einer eigenen Schleife; bei vielen
  // Websuchen kann das Limit von 10 Runden erreicht werden (stop_reason
  // "pause_turn") — dann laut Doku Assistant-Antwort anhängen und erneut
  // senden, bis zu einem kleinen Sicherheits-Limit.
  let response;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      tools,
      messages,
    });
    if (response.stop_reason !== 'pause_turn') break;
    messages.push({ role: 'assistant', content: response.content });
  }

  const fullText = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  const candidates = extractJsonArray(fullText);

  let drafted = 0;
  let skipped = 0;
  let imapDrafted = 0;
  for (const c of candidates.slice(0, maxCandidates)) {
    if (!c.business_name || !c.contact_email || !c.subject || !c.body) { skipped += 1; continue; }
    const summary = `Akquise-Mail an ${c.business_name}${c.city ? ` (${c.city})` : ''}`;
    const payload = {
      business_name: c.business_name,
      branch: c.branch ?? null,
      website: c.website ?? null,
      city: c.city ?? null,
      contact_email: c.contact_email,
      subject: c.subject,
      body: c.body,
      qualified_by: 'research',
    };
    // eslint-disable-next-line no-await-in-loop
    await query(
      `INSERT INTO pending_actions (restaurant_id, role, kind, summary, payload)
       VALUES (NULL, 'sales', 'outreach_email', $1, $2)`,
      [summary, JSON.stringify(payload)],
    );
    drafted += 1;

    try {
      // eslint-disable-next-line no-await-in-loop
      if (await draftImapEmail(c)) imapDrafted += 1;
    } catch (err) {
      console.error(`IMAP-Entwurf für ${c.business_name} fehlgeschlagen:`, err.message);
    }
  }

  await logAction({
    business: 'ki-works',
    source: 'sales_agent',
    action: 'run',
    summary: `Sales-Agent-Lauf: ${candidates.length} Kandidaten gefunden, ${drafted} Entwürfe erstellt (${imapDrafted} als IMAP-Entwurf)`,
    details: { found: candidates.length, drafted, skipped, imapDrafted, maxCandidates },
  });

  return { found: candidates.length, drafted, skipped, imapDrafted };
}
