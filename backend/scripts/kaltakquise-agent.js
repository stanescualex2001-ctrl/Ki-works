// Täglicher Cron-Aufruf des gemeinsamen Sales-Agenten (siehe
// backend/src/salesAgent.js). Verschmolzen mit dem vormals separaten
// Kaltakquise-Agenten (23.08.2026, Nutzer-Wunsch: "mit Sales Agent binden")
// — gleicher Kandidaten-Pool/Prompt/E-Mail-Stil wie der Dashboard-Button
// "Sales-Agent starten", nur mit anderem Auslöser (Cron statt Klick) und
// zusätzlichem IMAP-Draft-Schritt (siehe salesAgent.js `draftImapEmail`).
// Dopplungsvermeidung läuft jetzt einheitlich über die `pending_actions`-
// Tabelle (DB) statt einer separaten JSON-Zustandsdatei — beide Auslöser
// teilen sich denselben "bereits kontaktiert"-Puffer.
//
// Aufruf: node backend/scripts/kaltakquise-agent.js
// Benötigte Env-Variablen: ANTHROPIC_API_KEY + Datenbank-Verbindung (wie
// der Backend-Service, aus ki-works.env), IMAP_HOST, IMAP_PORT, IMAP_USER,
// IMAP_PASS, DRAFTS_FOLDER (aus kaltakquise.env) für den IMAP-Draft-Schritt.
import { runSalesAgent } from '../src/salesAgent.js';

const DAILY_COUNT = Number(process.env.KALTAKQUISE_DAILY_COUNT || 5);

runSalesAgent({ maxCandidates: DAILY_COUNT })
  .then(({ found, drafted, skipped, imapDrafted }) => {
    console.log(`Fertig: ${found} Kandidaten gefunden, ${drafted} Freigaben angelegt (${imapDrafted} davon als IMAP-Entwurf), ${skipped} übersprungen.`);
  })
  .catch((err) => {
    console.error('Kaltakquise-Agent fehlgeschlagen:', err);
    process.exit(1);
  });
