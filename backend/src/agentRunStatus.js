// In-Memory-Status laufender Sales-/Social-Agent-Läufe pro Business —
// kein DB-Schema nötig, der Lauf lebt ohnehin nur so lange wie der
// Node-Prozess (ein Backend-Neustart killt einen laufenden Lauf ohnehin
// schon heute). Löst zwei Probleme im Business-Dashboard: (1) beim
// Wechsel auf eine andere Business-Karte und zurück, oder bei einem
// Seiten-Refresh, "vergaß" die Oberfläche bisher einen noch laufenden
// Agenten und zeigte wieder den Ausgangszustand; (2) ein zweiter Klick
// während ein Lauf noch aktiv ist, konnte einen teuren parallelen
// zweiten Lauf auslösen.
const runs = new Map();

export function startRun(key) {
  if (runs.get(key)?.status === 'running') return false;
  runs.set(key, { status: 'running', startedAt: Date.now() });
  return true;
}

export function finishRun(key, result) {
  runs.set(key, { ...runs.get(key), status: 'done', finishedAt: Date.now(), result });
}

export function failRun(key, error) {
  runs.set(key, { ...runs.get(key), status: 'error', finishedAt: Date.now(), error });
}

export function getRunStatus(key) {
  return runs.get(key) || { status: 'idle' };
}
