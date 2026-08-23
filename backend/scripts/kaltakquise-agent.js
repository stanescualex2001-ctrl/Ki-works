// Täglicher Kaltakquise-Agent für ki-works.eu (Kiwo). Läuft server-seitig per
// Cron (nicht Teil des Backend-Service, kein DB-Zugriff nötig) — hält einen
// persistenten Kandidaten-Puffer außerhalb von /opt/ki-works aktuell (siehe
// CLAUDE.md "Update-Ablauf": rsync --delete würde Zustand in /opt/ki-works
// sonst bei jedem Deploy löschen) und legt jeden Tag 5 individuelle
// Akquise-Mails als Entwürfe im info@ki-works.eu-Postfach ab.
//
// Aufruf: node backend/scripts/kaltakquise-agent.js
// Benötigte Env-Variablen: ANTHROPIC_API_KEY (wie salesAgent.js),
// IMAP_HOST, IMAP_PORT, IMAP_USER, IMAP_PASS, DRAFTS_FOLDER (siehe
// /etc/ki-works/kaltakquise.env).
import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { ImapFlow } from 'imapflow';

const MODEL = process.env.KALTAKQUISE_AGENT_MODEL || 'claude-sonnet-5';
const STATE_PATH = process.env.KALTAKQUISE_STATE_PATH || '/var/lib/ki-works/kaltakquise-state.json';
const DAILY_COUNT = 5;
const BUFFER_TARGET = 15;

// Bewusst branchenoffen (Nutzer-Wunsch: nicht nur Restaurants/Hotels) — siehe
// CLAUDE.md "Andere Branchen als Restaurants"-Brainstorming für die Auswahl.
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

const SENDER_NAME = process.env.KALTAKQUISE_SENDER_NAME || 'Alex';

// Stil-Vorlage (23.08.2026, zweite Iteration nach Nutzer-Feedback) — locker/
// "du" wie im ersten Vorbild beibehalten, aber diesmal MIT konkret
// aufgezählten Vorteilen (inkl. Kunden-Dashboard) statt nur einem
// pauschalen Satz — Nutzer-Feedback: "brauche eine bessere Email
// Vorlage...mit Vorteile...Dashboard usw." zur ersten (zu knappen) Version.
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

Bereits kontaktiert oder schon im Puffer (NICHT nochmal vorschlagen):
${excludeList}

Finde bis zu ${maxCandidates} passende, noch nicht vorgeschlagene Betriebe
per Websuche, verteilt über mehrere Branchen (nicht nur eine). Entwirf für
jeden Kandidaten eine individuelle Akquise-Mail auf Deutsch (Betreff + Text)
in genau diesem Stil (vom Nutzer bestätigtes Vorbild, Aufbau/Ton beibehalten,
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
- Insgesamt trotz der Bullet-Points kompakt bleiben (wie im Vorbild) — keine
  Marketing-Floskeln, keine übertriebenen Versprechen.

Antworte NUR mit einem JSON-Codeblock (\`\`\`json ... \`\`\`), keinem weiteren
Text davor oder danach. Format: ein JSON-Array von Objekten mit genau diesen
Feldern: business_name, branch, website (string oder null), city (string
oder null), contact_email (string, Pflichtfeld — Kandidaten ohne
auffindbare E-Mail nicht aufnehmen), subject, body.
Wenn du keine passenden, noch nicht vorgeschlagenen Kandidaten findest, gib
ein leeres Array [] zurück.`;
}

function extractJsonArray(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text.match(/(\[[\s\S]*\])/)?.[1];
  if (!raw) throw new Error('Kaltakquise-Agent: keine verwertbare JSON-Antwort erhalten');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('Kaltakquise-Agent: Antwort ist kein Array');
  return parsed;
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return { contacted: [], buffer: [] };
  }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

async function fetchNewCandidates(count, contacted, buffer) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY fehlt');

  const excludeNames = [...contacted, ...buffer].map((c) => `${c.business_name} (${c.website || 'Website unbekannt'})`);
  const excludeList = excludeNames.length ? excludeNames.join('\n') : '(noch keine)';

  const client = new Anthropic({ apiKey });
  const tools = [
    { type: 'web_search_20260209', name: 'web_search', max_uses: 20 },
    { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 20 },
  ];
  const messages = [{ role: 'user', content: buildPrompt(count, excludeList) }];

  let response;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    response = await client.messages.create({ model: MODEL, max_tokens: 8000, tools, messages });
    if (response.stop_reason !== 'pause_turn') break;
    messages.push({ role: 'assistant', content: response.content });
  }

  const fullText = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  return extractJsonArray(fullText).filter((c) => c.business_name && c.contact_email && c.subject && c.body);
}

async function draftEmails(candidates) {
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
    for (const c of candidates) {
      const message = [
        `From: ${process.env.IMAP_USER}`,
        `To: ${c.business_name} <${c.contact_email}>`,
        `Subject: ${c.subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=utf-8',
        '',
        c.body,
      ].join('\r\n');
      // eslint-disable-next-line no-await-in-loop
      await client.append(draftsFolder, message, ['\\Draft']);
      console.log(`  Entwurf angelegt: ${c.business_name} <${c.contact_email}>`);
    }
  } finally {
    await client.logout();
  }
}

async function main() {
  const state = loadState();

  if (state.buffer.length < DAILY_COUNT) {
    const need = BUFFER_TARGET - state.buffer.length;
    console.log(`Puffer niedrig (${state.buffer.length}) — recherchiere bis zu ${need} neue Kandidaten...`);
    const fresh = await fetchNewCandidates(need, state.contacted, state.buffer);
    console.log(`  ${fresh.length} neue Kandidaten gefunden.`);
    state.buffer.push(...fresh);
    saveState(state);
  }

  const todaysBatch = state.buffer.slice(0, DAILY_COUNT);
  if (todaysBatch.length === 0) {
    console.log('Kein Kandidat im Puffer und keine neuen gefunden — nichts zu tun.');
    return;
  }

  await draftEmails(todaysBatch);

  state.buffer = state.buffer.slice(todaysBatch.length);
  state.contacted.push(...todaysBatch.map((c) => ({ business_name: c.business_name, website: c.website, contacted_at: new Date().toISOString() })));
  saveState(state);

  console.log(`Fertig: ${todaysBatch.length} Entwürfe angelegt. Puffer verbleibend: ${state.buffer.length}. Insgesamt kontaktiert: ${state.contacted.length}.`);
}

main().catch((err) => {
  console.error('Kaltakquise-Agent fehlgeschlagen:', err);
  process.exit(1);
});
