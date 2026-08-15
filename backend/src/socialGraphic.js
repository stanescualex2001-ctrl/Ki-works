// Erzeugt quadratische Social-Media-Grafiken (1080x1080, Instagram/Facebook)
// im ki-works-Design. Bewusst SVG+sharp statt Headless-Chromium (wie beim
// manuellen Vorgehen im Chat) — kein Browser-Prozess nötig, deutlich
// leichter für einen dauerhaft laufenden Server. Space Grotesk wird als
// echte Schriftdatei eingebettet (assets/fonts/), damit die Optik unabhängig
// von auf dem Server installierten System-Fonts konsistent bleibt.
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_DIR = path.join(__dirname, '..', 'assets', 'fonts');
const BOLD_FONT = `file://${path.join(FONT_DIR, 'SpaceGrotesk-Bold.ttf')}`;
const MEDIUM_FONT = `file://${path.join(FONT_DIR, 'SpaceGrotesk-Medium.ttf')}`;

const WIDTH = 1080;
const HEIGHT = 1080;
const PADDING = 90;
const MAX_TEXT_WIDTH = WIDTH - PADDING * 2;

function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[c]));
}

// Grobe Zeilenumbruch-Schätzung ohne echte Textmessung (SVG/sharp bietet das
// vor dem Rendern nicht) — Erfahrungswert für Space Grotesk Bold.
function wrapLines(text, fontSize, maxWidth = MAX_TEXT_WIDTH, maxLines = 4) {
  const avgCharWidth = fontSize * 0.58;
  const maxChars = Math.max(6, Math.floor(maxWidth / avgCharWidth));
  const words = text.trim().split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    truncated[maxLines - 1] = `${truncated[maxLines - 1].replace(/\s*\S*$/, '')}…`;
    return truncated;
  }
  return lines;
}

function headlineFontSize(headline) {
  const len = headline.length;
  if (len <= 20) return 84;
  if (len <= 40) return 66;
  if (len <= 70) return 52;
  return 42;
}

// Statische (nicht animierte) Kurzform von Orb Buddy als Wiedererkennungs-
// Element unten rechts — dieselben Formen wie die Live-Figur in
// landing/dashboard, nur ohne <animate>-Elemente (unnötig für ein Standbild).
function orbBuddyMark(cx, cy, scale) {
  return `
    <g transform="translate(${cx} ${cy}) scale(${scale})">
      <circle cx="0" cy="12" r="66" fill="url(#ob-glow)" />
      <circle cx="0" cy="12" r="46" fill="url(#ob-body)" />
      <ellipse cx="-17" cy="-8" rx="20" ry="14" fill="url(#ob-shine)" opacity="0.8" transform="rotate(-18 -17 -8)" />
      <circle cx="-14" cy="10" r="5.6" fill="#0B1220" />
      <circle cx="14" cy="10" r="5.6" fill="#0B1220" />
      <circle cx="-12" cy="7.5" r="1.6" fill="#fff" />
      <circle cx="16" cy="7.5" r="1.6" fill="#fff" />
      <path d="M-13 26 Q0 36 13 26" fill="none" stroke="#0B1220" stroke-width="4.2" stroke-linecap="round" />
    </g>`;
}

function buildSvg({ headline, subline }) {
  const fontSize = headlineFontSize(headline);
  const lines = wrapLines(headline, fontSize);
  const lineHeight = fontSize * 1.12;
  const blockHeight = lines.length * lineHeight;
  const startY = HEIGHT / 2 - blockHeight / 2 - 30;

  const headlineTspans = lines.map((line, i) =>
    `<tspan x="${PADDING}" y="${startY + i * lineHeight}">${escapeXml(line)}</tspan>`).join('');

  const sublineLines = subline ? wrapLines(subline, 34, MAX_TEXT_WIDTH, 2) : [];
  const sublineY = startY + blockHeight + 20;
  const sublineTspans = sublineLines.map((line, i) =>
    `<tspan x="${PADDING}" y="${sublineY + i * 44}">${escapeXml(line)}</tspan>`).join('');

  return `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face { font-family: 'Space Grotesk'; font-weight: 700; src: url('${BOLD_FONT}'); }
      @font-face { font-family: 'Space Grotesk'; font-weight: 500; src: url('${MEDIUM_FONT}'); }
    </style>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0B1220" />
      <stop offset="0.55" stop-color="#161233" />
      <stop offset="1" stop-color="#1E1B4B" />
    </linearGradient>
    <radialGradient id="accent-glow" cx="82%" cy="18%" r="45%">
      <stop offset="0" stop-color="#22D3EE" stop-opacity="0.28" />
      <stop offset="1" stop-color="#22D3EE" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="ob-glow" cx="50%" cy="55%" r="55%">
      <stop offset="0" stop-color="#22D3EE" stop-opacity="0.55" />
      <stop offset="1" stop-color="#22D3EE" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="ob-body" cx="34%" cy="28%" r="80%">
      <stop offset="0" stop-color="#A5F3FC" />
      <stop offset="0.4" stop-color="#22D3EE" />
      <stop offset="1" stop-color="#7C3AED" />
    </radialGradient>
    <radialGradient id="ob-shine" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.9" />
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#accent-glow)" />

  <text font-family="Space Grotesk" font-weight="700" font-size="30" fill="#67E8F9" opacity="0.85" letter-spacing="1">
    <tspan x="${PADDING}" y="120">KI-WORKS · KIWO</tspan>
  </text>

  <text font-family="Space Grotesk" font-weight="700" fill="#F3F6FB" font-size="${fontSize}">
    ${headlineTspans}
  </text>

  ${subline ? `<text font-family="Space Grotesk" font-weight="500" fill="#CBD5F5" opacity="0.85" font-size="34">${sublineTspans}</text>` : ''}

  ${orbBuddyMark(WIDTH - 150, HEIGHT - 210, 1.05)}

  <text font-family="Space Grotesk" font-weight="700" font-size="42" fill="#F3F6FB" opacity="0.92">
    <tspan x="${PADDING}" y="${HEIGHT - 70}">ki-works.eu</tspan>
  </text>
</svg>`;
}

export async function renderSocialImage({ headline, subline }) {
  if (!headline) throw new Error('renderSocialImage: headline erforderlich');
  const svg = buildSvg({ headline, subline });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
