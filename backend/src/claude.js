const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';

async function ask(system, user, maxTokens = 512) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) {
    console.error('Claude API error', res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? null;
}

export async function summarizeCall(transcript) {
  if (!transcript) return null;
  return ask(
    'Du bist ein Assistent für ein Restaurant-Reservierungssystem. Fasse das folgende Telefonat in 1-2 deutschen Sätzen zusammen (Anliegen, Ergebnis). Antworte nur mit der Zusammenfassung.',
    transcript.slice(0, 12000),
    300,
  );
}

export async function classifyOutcome(transcript) {
  if (!transcript) return 'other';
  const answer = await ask(
    'Klassifiziere das Telefonat. Antworte mit genau einem Wort: reservation, info, missed oder other.',
    transcript.slice(0, 12000),
    10,
  );
  const word = (answer || '').trim().toLowerCase();
  return ['reservation', 'info', 'missed', 'other'].includes(word) ? word : 'other';
}
