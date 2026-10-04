import Anthropic from '@anthropic-ai/sdk';
import { query } from './db.js';
import { logAction } from './auditLog.js';
import { getBusinessProfile } from './businessProfiles.js';

const MODEL = process.env.SALES_AGENT_MODEL || 'claude-sonnet-5';

// buildTargetProfile: region ist im Business-Dashboard vor jedem Lauf
// einstellbar (Feld "Ort/Region"), Default kommt aus dem Business-Profil.
function buildTargetProfile(region, profile) {
  return `${profile.targetKind} im
Raum ${region || profile.targetProfileDefault}.`;
}

function buildPrompt(maxCandidates, excludeList, region, profile) {
  return `Du recherchierst potenzielle Neukunden für ${profile.name}.

${profile.brandBrief}

Zielprofil:
${buildTargetProfile(region, profile)}

Qualifizierungskriterien:
${profile.qualificationCriteria}

Bereits kontaktiert (NICHT nochmal vorschlagen):
${excludeList}

Finde bis zu ${maxCandidates} passende, noch nicht kontaktierte Betriebe per
Websuche.

WICHTIG — negative Behauptungen aktiv verifizieren: Falls die
Qualifizierungskriterien oben eine FEHLENDE Eigenschaft verlangen (z. B.
"keine eigene Website", "veraltete Website"), darfst du das niemals nur
daraus schließen, dass du zufällig nur eine Facebook-Seite oder einen
Branchenverzeichnis-Eintrag gefunden hast. Suche IMMER gezielt nach der
eigenen Website des Betriebs (z. B. Websuche nach "<Firmenname> <Ort>"
oder "<Firmenname> offizielle Website") und prüfe die Treffer, BEVOR du
"keine eigene Website" behauptest. Findest du dabei doch eine eigene,
zeitgemäße Website, ist dieser Kandidat NICHT qualifiziert (falls die
fehlende Website der einzige Qualifizierungsgrund war) — verwirf ihn und
suche einen anderen. Eine falsche Behauptung in einer Akquise-Mail über
den Empfänger selbst ist schädlicher als ein verpasster Kandidat.

Entwirf für jeden verbleibenden, wirklich qualifizierten Kandidaten eine
kurze, individuelle Akquise-Mail auf Deutsch (Betreff + Text), die konkret auf
etwas von der Website/dem Online-Auftritt des Betriebs Bezug nimmt (z. B.
fehlende Online-Reservierung, Öffnungszeiten, eine echte Bewertung) — kein
Massenmail-Ton, keine generische Anrede.

PFLICHT-AUFBAU (Problem → Lösung → eine Handlung), maximal ca. 90 Wörter,
KEINE Feature-Liste, kein Eigenlob:
1. Betreff: eine Frage zum konkreten Problem des Empfängers (kein
   Firmenname/Produktname im Betreff, keine Werbe-Floskeln).
2. Ein Satz mit echtem, überprüfbarem Bezug zum Betrieb.
3. Das Problem aus Sicht des Empfängers in 1-2 Sätzen (was kostet es ihn?).
4. Die Lösung in 1-2 Sätzen, ohne Fachbegriffe.
5. Genau EINE einfache Handlung (siehe unten), keine zweite Option.

${profile.productPitch}

Stil: keine Standard-Einleitung wie "Bei der Suche nach ... bin ich auf ...
gestoßen" für jede Mail — variiere den Einstieg je Kandidat, klinge wie ein
Mensch, nicht wie eine Vorlage. Verspreche nichts, was nicht im Pitch oben
steht, und verlange vom Empfänger keine Vorarbeit.

Beende den Mail-Text (body) IMMER exakt mit
dieser Signatur, unverändert, keine eigene Grußformel davor:

${profile.signature}

WICHTIG — Kontakt-E-Mail-Suche (sparsam, Kosten!): lade pro Kandidat
HÖCHSTENS diese drei Seiten per web_fetch, keine weiteren Unterseiten
(keine Speisekarte, kein Blog, keine "Über uns"-Seite):
1. Startseite (Kontext für die Mail; achte auch auf eine E-Mail im Footer).
2. Impressum (in AT/DE gesetzlich Pflicht, enthält meist die E-Mail).
3. Kontakt-Seite — nur falls das Impressum keine E-Mail enthielt.
Setze contact_email nur dann auf null, wenn nach diesen Seiten wirklich
keine Adresse sichtbar ist (z. B. nur ein Kontaktformular) — das soll die
Ausnahme sein, nicht der Normalfall. Weitere Seiten zu laden ist nicht
erlaubt, auch nicht für zusätzlichen Kontext.

Antworte NUR mit einem JSON-Codeblock (\`\`\`json ... \`\`\`), keinem weiteren
Text davor oder danach — KEINE Zwischenüberlegungen, keine Erklärungen, keine
Aufzählung verworfener Kandidaten (das kostet unnötig Ausgabe-Tokens). Format: ein JSON-Array von Objekten mit genau diesen
Feldern: business_name, website (Link zum schnellen Nachschlagen/Prüfen des
Kandidaten — die eigene Website, falls vorhanden; hat der Betrieb KEINE
eigene Website, stattdessen den Link zu dessen Facebook-Seite,
Google-Maps-/Google-Business-Eintrag oder Branchenverzeichnis-Eintrag, den du
bei der Recherche gefunden hast; nur null setzen, wenn wirklich gar kein
öffentlicher Online-Auftritt auffindbar war), city (string oder null),
why_fit (ein Satz Begründung), contact_email (string oder null, nur falls
nach den obigen Schritten wirklich keine Mail-Adresse auffindbar war),
subject, body.
Wenn du keine passenden, noch nicht kontaktierten Kandidaten findest, gib ein
leeres Array [] zurück.`;
}

// Das Modell schreibt mehrzeilige Mail-Texte oft mit echten Zeilenumbrüchen
// statt \n in JSON-Strings — striktes JSON.parse scheitert dann ("Bad control
// character in string literal"), obwohl der teure Lauf fertig war. Steuer-
// zeichen innerhalb von String-Literalen werden daher vor dem Parsen escaped.
function escapeControlCharsInStrings(raw) {
  let out = '';
  let inString = false;
  let escaped = false;
  for (const ch of raw) {
    if (inString) {
      if (escaped) { escaped = false; out += ch; continue; }
      if (ch === '\\') { escaped = true; out += ch; continue; }
      if (ch === '"') { inString = false; out += ch; continue; }
      if (ch === '\n') { out += '\\n'; continue; }
      if (ch === '\r') { continue; }
      if (ch === '\t') { out += '\\t'; continue; }
      out += ch;
    } else {
      if (ch === '"') inString = true;
      out += ch;
    }
  }
  return out;
}

function extractJsonArray(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text.match(/(\[[\s\S]*\])/)?.[1];
  if (!raw) throw new Error('Sales-Agent: keine verwertbare JSON-Antwort erhalten');
  let parsed;
  try {
    parsed = JSON.parse(escapeControlCharsInStrings(raw));
  } catch (err) {
    const e = new Error(`Sales-Agent: JSON-Antwort ungültig (${err.message})`);
    e.rawText = raw;
    throw e;
  }
  if (!Array.isArray(parsed)) throw new Error('Sales-Agent: Antwort ist kein Array');
  return parsed;
}

export async function runSalesAgent({ business, maxCandidates = 3, region } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY fehlt');
  const profile = getBusinessProfile(business);

  try {
    return await runSalesAgentInner({ business, maxCandidates, region, apiKey, profile });
  } catch (err) {
    // Bisher verschwand ein Fehlschlag (Timeout, ungültige JSON-Antwort,
    // DB-Fehler) spurlos — nur console.error, kein Audit-Log-Eintrag.
    // Dadurch war ein Lauf, der reales Guthaben verbraucht (Websuchen
    // laufen ja schon), aber am Ende scheitert, im Dashboard nicht mehr
    // auffindbar. logAction ist selbst fehlerfest (siehe auditLog.js).
    await logAction({
      business,
      source: 'sales_agent',
      action: 'error',
      summary: `Sales-Agent-Lauf fehlgeschlagen: ${err.message}`,
      details: {
        error: err.message, maxCandidates, region: region || profile.targetProfileDefault,
        // Bezahlte Rohantwort nicht verlieren, falls nur das Parsen scheiterte.
        ...(err.rawText ? { rawText: err.rawText.slice(0, 20000) } : {}),
        ...(err.usage ? { usage: err.usage } : {}),
      },
    });
    throw err;
  }
}

async function runSalesAgentInner({ business, maxCandidates, region, apiKey, profile }) {
  const { rows: existing } = await query(
    `SELECT payload->>'business_name' AS business_name, payload->>'website' AS website
     FROM pending_actions WHERE role = 'sales' AND business = $1`,
    [business],
  );
  const excludeList = existing.length
    ? existing.map((r) => `${r.business_name || '?'} (${r.website || 'Website unbekannt'})`).join('\n')
    : '(noch keine)';

  // Standard-SDK-Timeout (~10 Min.) reicht bei mehreren Kandidaten mit
  // tiefer Impressum-/Kontakt-Suche (bis zu 20 web_fetch-Aufrufe) nicht
  // immer — der Lauf wird dann komplett verworfen, obwohl er im Hintergrund
  // noch echtes Guthaben verbraucht hätte. Erst auf 20 Min. angehoben
  // (08.09.2026), reichte bei einem Lauf mit Region "Wien" + 5 Kandidaten
  // immer noch nicht (13.09.2026, echter Fehlversuch mit realen Kosten) —
  // jetzt auf 30 Min. angehoben, zusätzlich maxCandidates-Default gesenkt
  // (siehe unten), damit einzelne Läufe erst gar nicht mehr so lange dauern.
  const client = new Anthropic({ apiKey, timeout: 30 * 60 * 1000 });
  const tools = [
    // Kostenbremse (04.10.2026): Limits skalieren mit der Kandidatenzahl —
    // pro Kandidat höchstens 3 Seitenabrufe (Startseite, Impressum, Kontakt)
    // und ca. 3 Suchen, statt der früheren festen 15/20.
    { type: 'web_search_20260209', name: 'web_search', max_uses: Math.max(8, maxCandidates * 4) },
    // max_content_tokens begrenzt, wie viel Text pro abgerufener Seite in
    // den Kontext wandert (Impressum-/Kontaktseiten sind kurz).
    { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: maxCandidates * 3, max_content_tokens: 2000 },
  ];
  const messages = [{ role: 'user', content: buildPrompt(maxCandidates, excludeList, region, profile) }];

  // Server-Tools laufen serverseitig in einer eigenen Schleife; bei vielen
  // Websuchen kann das Limit von 10 Runden erreicht werden (stop_reason
  // "pause_turn") — dann laut Doku Assistant-Antwort anhängen und erneut
  // senden, bis zu einem kleinen Sicherheits-Limit. Ohne Caching wird dabei
  // bei jedem Versuch der komplette bisherige Verlauf (inkl. aller
  // Web-Search-/Web-Fetch-Ergebnisse) erneut voll abgerechnet — automatisches
  // Caching (Top-Level-Feld) liest das ab dem 2. Versuch stattdessen zu 10%
  // des Preises aus dem Cache.
  // Diagnose-Logging (13./14.09.2026) deckte am 27.09.2026 den echten Root
  // Cause auf: zwei Fehlschläge (vor UND nach dem 30-Min.-Timeout-Deploy)
  // brachen beide nach exakt ~900s (15 Min.) ab, mit status/code/cause
  // durchgehend "n/a" — kein echter Fehler von Anthropic, sondern eine
  // Zwischenstation im Netzwerk, die eine lange Verbindung ohne Datenfluss
  // von sich aus kappt. `client.messages.create()` sendet bei einem langen
  // Tool-Use-Lauf (viele Websuchen) minutenlang gar keine Bytes, bis am
  // Ende die komplette Antwort auf einmal kommt — genau das Muster, vor
  // dem Anthropics eigene Doku für lange Anfragen warnt. Fix: Streaming
  // (`client.messages.stream()`) statt einer einzelnen großen Antwort —
  // die Verbindung bekommt durchgehend Daten (inkl. Anthropics eigener
  // Keep-Alive-Ping-Events), wird also nicht mehr als "still" erkannt.
  // `.finalMessage()` liefert am Ende dasselbe Message-Objekt wie
  // `create()` vorher — der Rest der Logik bleibt unverändert.
  const startedAt = Date.now();
  let response;
  // Token-Verbrauch über alle Versuche (inkl. Cache-Lese-/Schreib-Tokens),
  // damit sichtbar wird, ob Prompt-Caching wirklich greift und was ein Lauf kostet.
  const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const attemptStartedAt = Date.now();
      // max_tokens 8000→16000 (27.09.2026): ein Lauf mit 3 Kandidaten +
      // vollständigen Mail-Texten/Begründungen hat stop_reason:max_tokens
      // erreicht (Antwort mitten im JSON abgeschnitten, "keine verwertbare
      // JSON-Antwort erhalten") — mehr Puffer für vollständige Antworten.
      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: 16000,
        cache_control: { type: 'ephemeral' },
        tools,
        messages,
      });
      // eslint-disable-next-line no-await-in-loop
      response = await stream.finalMessage();
      usage.input += response.usage?.input_tokens || 0;
      usage.output += response.usage?.output_tokens || 0;
      usage.cacheRead += response.usage?.cache_read_input_tokens || 0;
      usage.cacheWrite += response.usage?.cache_creation_input_tokens || 0;
      const attemptS = ((Date.now() - attemptStartedAt) / 1000).toFixed(1);
      console.log(`Sales-Agent: Versuch ${attempt + 1} abgeschlossen nach ${attemptS}s (stop_reason: ${response.stop_reason})`);
      if (response.stop_reason !== 'pause_turn') break;
      messages.push({ role: 'assistant', content: response.content });
    }
  } catch (err) {
    const totalS = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.error(
      `Sales-Agent: Anthropic-Aufruf fehlgeschlagen nach ${totalS}s gesamt — `
      + `name=${err.name} message=${err.message} status=${err.status ?? 'n/a'} `
      + `code=${err.code ?? 'n/a'} cause=${err.cause?.message || err.cause || 'n/a'}`,
    );
    throw err;
  }

  const fullText = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  console.log(`Sales-Agent: Tokens input=${usage.input} output=${usage.output} cacheRead=${usage.cacheRead} cacheWrite=${usage.cacheWrite}`);
  let candidates;
  try {
    candidates = extractJsonArray(fullText);
  } catch (err) {
    err.usage = usage;
    throw err;
  }

  let drafted = 0;
  let skipped = 0;
  for (const c of candidates.slice(0, maxCandidates)) {
    if (!c.business_name || !c.subject || !c.body) { skipped += 1; continue; }
    const summary = `Akquise-Mail an ${c.business_name}${c.city ? ` (${c.city})` : ''}`;
    const payload = {
      business_name: c.business_name,
      website: c.website ?? null,
      city: c.city ?? null,
      why_fit: c.why_fit ?? null,
      contact_email: c.contact_email ?? null,
      subject: c.subject,
      body: c.body,
      qualified_by: 'research',
    };
    // eslint-disable-next-line no-await-in-loop
    await query(
      `INSERT INTO pending_actions (restaurant_id, business, role, kind, summary, payload)
       VALUES (NULL, $1, 'sales', 'outreach_email', $2, $3)`,
      [business, summary, JSON.stringify(payload)],
    );
    drafted += 1;
  }

  await logAction({
    business,
    source: 'sales_agent',
    action: 'run',
    summary: `Sales-Agent-Lauf: ${candidates.length} Kandidaten gefunden, ${drafted} Entwürfe erstellt`,
    details: {
      found: candidates.length, drafted, skipped, maxCandidates, region: region || profile.targetProfileDefault, usage,
      // Bei 0 Kandidaten die Antwort des Agenten sichern, damit sichtbar ist, warum alles verworfen wurde.
      ...(candidates.length === 0 ? { agentReply: fullText.slice(0, 3000) } : {}),
    },
  });

  return { found: candidates.length, drafted, skipped };
}
