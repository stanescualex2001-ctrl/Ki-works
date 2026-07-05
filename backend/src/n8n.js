// Fire-and-forget event forwarding to n8n webhooks.
const BASE = process.env.N8N_BASE_URL || 'http://127.0.0.1:5678';

export function notifyN8n(path, payload) {
  fetch(`${BASE}/webhook/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((err) => console.warn(`n8n notify ${path} failed:`, err.message));
}
