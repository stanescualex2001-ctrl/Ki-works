// Einmaliges Backfill: übersetzt bestehende Anruf-Zusammenfassungen, die vor
// dem analysisPlan.summaryPrompt-Fix teils auf Englisch gespeichert wurden,
// ins Deutsche. Bereits deutsche Zusammenfassungen bleiben unverändert.
// Aufruf: node backend/scripts/translate-call-summaries.js
import { query } from '../src/db.js';
import { translateToGerman } from '../src/claude.js';

async function main() {
  const { rows } = await query('SELECT id, summary FROM calls WHERE summary IS NOT NULL ORDER BY id');
  console.log(`${rows.length} Anrufe mit Zusammenfassung gefunden.`);

  let translated = 0;
  let skipped = 0;

  for (const row of rows) {
    const result = await translateToGerman(row.summary);
    if (!result) {
      console.warn(`  [${row.id}] übersprungen (kein Ergebnis von Claude — Guthaben/Key prüfen).`);
      skipped += 1;
      continue;
    }
    if (result.trim() !== row.summary.trim()) {
      await query('UPDATE calls SET summary = $1 WHERE id = $2', [result.trim(), row.id]);
      console.log(`  [${row.id}] übersetzt.`);
      translated += 1;
    } else {
      console.log(`  [${row.id}] bereits Deutsch, unverändert.`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`Fertig: ${translated} übersetzt, ${skipped} übersprungen, ${rows.length - translated - skipped} bereits Deutsch.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Fehler beim Übersetzen:', err);
  process.exit(1);
});
