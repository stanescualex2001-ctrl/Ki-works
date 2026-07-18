import fs from 'node:fs';
import tls from 'node:tls';
import { query } from './db.js';
import { notifyN8n } from './n8n.js';

const BACKUP_DIR = process.env.BACKUP_DIR || '/var/backups/ki-works';
const ALERT_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const alertedAt = {};

export async function logError(source, err, level = 'error') {
  const message = (err instanceof Error ? err.message : String(err)) || 'unbekannter Fehler';
  const detail = err instanceof Error ? err.stack : null;
  console.error(`[${source}]`, message);
  try {
    await query(
      'INSERT INTO error_log (level, source, message, detail) VALUES ($1, $2, $3, $4)',
      [level, source, message.slice(0, 500), detail ? detail.slice(0, 4000) : null],
    );
  } catch (e) {
    console.error('logError insert failed:', e.message);
  }
}

export async function purgeOldErrorLog() {
  try {
    await query("DELETE FROM error_log WHERE created_at < now() - interval '30 days'");
  } catch (err) {
    console.error('purgeOldErrorLog failed:', err.message);
  }
}

async function checkDb() {
  try {
    await query('SELECT 1');
    return { ok: true };
  } catch (err) {
    return { ok: false, detail: err.message };
  }
}

async function checkN8n() {
  const base = process.env.N8N_BASE_URL;
  if (!base) return { ok: null, detail: 'nicht konfiguriert' };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    await fetch(base, { signal: ctrl.signal });
    clearTimeout(t);
    return { ok: true };
  } catch (err) {
    return { ok: false, detail: err.message };
  }
}

function checkDisk() {
  try {
    const stats = fs.statfsSync('/');
    const used = stats.blocks - stats.bfree;
    const percent = Math.round((used / stats.blocks) * 100);
    return { ok: percent < 90, percent };
  } catch (err) {
    return { ok: null, detail: err.message };
  }
}

function checkSsl() {
  const publicUrl = process.env.KIWORKS_PUBLIC_URL;
  if (!publicUrl) return Promise.resolve({ ok: null, detail: 'nicht konfiguriert' });
  let host;
  try { host = new URL(publicUrl).hostname; } catch { return Promise.resolve({ ok: null, detail: 'ungültige URL' }); }
  return new Promise((resolve) => {
    let done = false;
    const finish = (result) => { if (!done) { done = true; resolve(result); } };
    const socket = tls.connect({ host, port: 443, servername: host, timeout: 4000 }, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      if (!cert?.valid_to) return finish({ ok: null, detail: 'kein Zertifikat gefunden' });
      const daysLeft = Math.round((new Date(cert.valid_to).getTime() - Date.now()) / 86400000);
      finish({ ok: daysLeft > 14, daysLeft });
    });
    socket.on('error', (err) => finish({ ok: false, detail: err.message }));
    socket.on('timeout', () => { socket.destroy(); finish({ ok: false, detail: 'Timeout' }); });
  });
}

function checkBackup() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return { ok: null, detail: 'Backup-Verzeichnis nicht gefunden' };
    const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.sql.gz'));
    if (!files.length) return { ok: false, detail: 'Keine Backups gefunden' };
    const newest = files
      .map((f) => ({ f, mtime: fs.statSync(`${BACKUP_DIR}/${f}`).mtime.getTime() }))
      .sort((a, b) => b.mtime - a.mtime)[0];
    const hoursAgo = Math.round((Date.now() - newest.mtime) / 3600000);
    return { ok: hoursAgo < 36, hoursAgo, file: newest.f };
  } catch (err) {
    return { ok: null, detail: err.message };
  }
}

// Liefert den aktuellen System-Status live (keine Zwischenspeicherung) — genutzt
// vom Admin-Dashboard und vom periodischen Health-Check.
export async function getSystemStatus() {
  const [db, n8n, ssl] = await Promise.all([checkDb(), checkN8n(), checkSsl()]);
  return {
    db,
    n8n,
    ssl,
    disk: checkDisk(),
    backup: checkBackup(),
    uptimeSeconds: Math.round(process.uptime()),
    checkedAt: new Date().toISOString(),
  };
}

// Alarmiert per E-Mail (über n8n) höchstens einmal pro Problem und Abklingzeit,
// damit bei einem andauernden Problem nicht alle 15 Minuten eine Mail kommt.
async function alertIfProblem(name, check, describe) {
  if (check.ok === false) {
    const last = alertedAt[name];
    if (!last || Date.now() - last > ALERT_COOLDOWN_MS) {
      alertedAt[name] = Date.now();
      const detail = describe(check);
      await logError('health-check', new Error(detail), 'warn');
      notifyN8n('system-alarm', { check: name, detail });
    }
  } else {
    delete alertedAt[name];
  }
}

export async function runHealthCheck() {
  const status = await getSystemStatus();
  await alertIfProblem('db', status.db, () => 'Datenbank nicht erreichbar');
  await alertIfProblem('n8n', status.n8n, (c) => `n8n nicht erreichbar: ${c.detail || ''}`);
  await alertIfProblem('disk', status.disk, (c) => `Festplatte fast voll: ${c.percent}% belegt`);
  await alertIfProblem('ssl', status.ssl, (c) => `SSL-Zertifikat läuft bald ab oder Fehler: ${c.daysLeft != null ? `${c.daysLeft} Tage übrig` : c.detail || ''}`);
  await alertIfProblem('backup', status.backup, (c) => `Kein aktuelles Backup: ${c.detail || `letztes vor ${c.hoursAgo}h`}`);
}

export function startMonitoring() {
  purgeOldErrorLog();
  setInterval(purgeOldErrorLog, 24 * 60 * 60 * 1000);
  runHealthCheck().catch((err) => console.error('runHealthCheck failed:', err.message));
  setInterval(
    () => runHealthCheck().catch((err) => console.error('runHealthCheck failed:', err.message)),
    15 * 60 * 1000,
  );
}
