// Szenen (Hintergrund + Motiv) für Social-Media-Bilder — der Social-Agent
// wählt zum Thema einen Motiv-Key (siehe SCENE_HINTS), socialGraphic.js
// rendert Szene + Text. Alle Motive liegen im unteren Bildbereich
// (y >= 600), damit der große Text oben nicht überdeckt wird.
// Neues Motiv = ein Eintrag hier (+ Zeile in SCENE_HINTS), kein Umbau.
const W = 1080;
const PHONE = 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z';
const phone = (x, y, s, fill) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="${PHONE}" fill="${fill}"/></g>`;
const rings = (x, y, color) => `<g fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" opacity="0.8"><path d="M${x} ${y} q-24 34 0 68"/><path d="M${x - 30} ${y - 15} q-42 50 0 100"/></g>`;
const gradient = (stops, x2 = 1, y2 = 1) => `<linearGradient id="sg" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const bgRect = '<rect width="1080" height="1080" fill="url(#sg)"/>';

export const SCENE_HINTS = {
  handwerker: 'Handwerker, Installateure, Elektriker, Dach/Baustelle',
  friseur: 'Friseure, Kosmetik, Nagelstudios, Termine',
  werkstatt: 'KFZ-Werkstätten, Autohäuser, Reparatur',
  restaurant: 'Restaurants, Gasthäuser, Cafés, Reservierungen',
  immobilien: 'Immobilienmakler, Besichtigungen, Hausverwaltung',
  zaehlen: 'verpasste Anrufe zählen, Zahlen, Wochenbilanz, Rechnung',
  demo: 'Demo-Nummer, "selbst anhören/testen", Telefon-Aktion',
  agentur: 'Agenturen, White-Label, Partnerprogramm, eigene Marke',
  standard: 'alles andere (allgemeines Plattform-/Marken-Thema)',
};

const tallyCells = () => {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const tally = [3, 5, 2, 4, 5, 1, 2];
  return days.map((d, i) => {
    const x = 70 + i * 134;
    const n = tally[i];
    const marks = Array.from({ length: Math.min(n, 4) }, (_, k) => `<line x1="${x + 24 + k * 22}" y1="725" x2="${x + 24 + k * 22}" y2="805" stroke="#5EEAD4" stroke-width="8" stroke-linecap="round"/>`).join('')
      + (n >= 5 ? `<line x1="${x + 12}" y1="815" x2="${x + 112}" y2="715" stroke="#5EEAD4" stroke-width="8" stroke-linecap="round"/>` : '');
    return `<rect x="${x}" y="640" width="120" height="290" rx="18" fill="#FFFFFF" fill-opacity="0.07" stroke="#5EEAD4" stroke-opacity="0.4" stroke-width="2"/>
<text x="${x + 60}" y="685" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="30" fill="#99F6E4">${d}</text>${marks}`;
  }).join('');
};

export const SCENES = {
  handwerker: {
    accent: '#FDBA74',
    defs: `${gradient([[0, '#0F172A'], [0.55, '#7C2D12'], [1, '#F97316']], 0, 1)}<radialGradient id="sun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FDBA74" stop-opacity="0.9"/><stop offset="1" stop-color="#FDBA74" stop-opacity="0"/></radialGradient>`,
    bg: `${bgRect}<circle cx="800" cy="780" r="260" fill="url(#sun)"/>`,
    motif: `<polygon points="0,1080 0,880 330,740 660,880 660,1080" fill="#111827"/>
<polygon points="560,1080 560,900 800,800 1080,920 1080,1080" fill="#0B1220"/>
<rect x="470" y="700" width="46" height="110" fill="#111827"/>
<g stroke="#FDBA74" stroke-width="12" stroke-linecap="round"><line x1="640" y1="650" x2="730" y2="930"/><line x1="720" y1="630" x2="810" y2="910"/>
<line x1="656" y1="695" x2="736" y2="670"/><line x1="672" y1="740" x2="752" y2="715"/><line x1="688" y1="785" x2="768" y2="760"/><line x1="704" y1="830" x2="784" y2="805"/></g>
${phone(850, 620, 7, '#FDBA74')}${rings(830, 650, '#FDBA74')}`,
  },
  friseur: {
    accent: '#FBCFE8',
    defs: gradient([[0, '#2E1065'], [0.6, '#9D174D'], [1, '#F472B6']]),
    bg: `${bgRect}<g fill="none" stroke="#FBCFE8" stroke-width="6" opacity="0.25"><path d="M0 700 C250 600 400 820 700 720 S950 650 1080 700"/><path d="M0 760 C250 660 400 880 700 780 S950 710 1080 760"/><path d="M0 820 C250 720 400 940 700 840 S950 770 1080 820"/><path d="M0 880 C250 780 400 1000 700 900 S950 830 1080 880"/></g>`,
    motif: `<g transform="translate(790 790) rotate(-25) scale(0.8)" stroke="#FBCFE8" stroke-width="16" stroke-linecap="round" fill="none"><circle cx="-70" cy="150" r="50"/><circle cx="70" cy="150" r="50"/><line x1="-48" y1="108" x2="40" y2="-230"/><line x1="48" y1="108" x2="-40" y2="-230"/></g>
${phone(180, 690, 9, '#FBCFE8')}${rings(150, 730, '#FBCFE8')}`,
  },
  werkstatt: {
    accent: '#FCD34D',
    defs: gradient([[0, '#0B1B2E'], [0.6, '#1E3A5F'], [1, '#B45309']]),
    bg: `${bgRect}<g stroke="#FCD34D" stroke-opacity="0.07" stroke-width="30">${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="${-200 + i * 260}" y1="1100" x2="${200 + i * 260}" y2="500"/>`).join('')}</g>`,
    motif: `<g transform="translate(760 810)"><circle r="130" fill="none" stroke="#FCD34D" stroke-width="44" stroke-dasharray="36 28"/><circle r="104" fill="#FCD34D"/><circle r="42" fill="#1E3A5F"/></g>
<g transform="translate(560 830) rotate(35)" stroke="#E2E8F0" stroke-width="30" stroke-linecap="round" fill="none"><line x1="0" y1="-120" x2="0" y2="120"/><path d="M-30 -150 a50 50 0 1 0 60 0" stroke-width="22"/></g>
${phone(150, 690, 9, '#FCD34D')}${rings(120, 730, '#FCD34D')}`,
  },
  restaurant: {
    accent: '#FDE68A',
    defs: gradient([[0, '#3B0A0A'], [0.55, '#7F1D1D'], [1, '#B45309']]),
    bg: `${bgRect}<g fill="#FDE68A" opacity="0.07"><circle cx="150" cy="800" r="260"/><circle cx="950" cy="980" r="200"/></g>`,
    motif: `<g transform="translate(700 810)"><circle r="150" fill="#FEF3C7"/><circle r="112" fill="none" stroke="#B45309" stroke-width="6" opacity="0.6"/><circle r="70" fill="#FDE68A" opacity="0.6"/></g>
<g stroke="#FEF3C7" stroke-width="14" stroke-linecap="round" fill="none"><line x1="490" y1="690" x2="490" y2="930"/><line x1="470" y1="690" x2="470" y2="770"/><line x1="510" y1="690" x2="510" y2="770"/><path d="M470 770 q20 36 40 0"/>
<line x1="930" y1="690" x2="930" y2="930"/><path d="M930 690 q-40 50 -30 130 h30"/></g>
${phone(150, 690, 9, '#FDE68A')}${rings(120, 730, '#FDE68A')}`,
  },
  immobilien: {
    accent: '#67E8F9',
    defs: gradient([[0, '#0B1B3A'], [0.6, '#0E4F6E'], [1, '#0E7490']]),
    bg: `${bgRect}<g stroke="#67E8F9" stroke-opacity="0.1" stroke-width="2">${Array.from({ length: 10 }, (_, i) => `<line x1="0" y1="${600 + i * 50}" x2="1080" y2="${600 + i * 50}"/>`).join('')}</g>`,
    motif: `<g transform="translate(700 700)"><polygon points="-190,110 0,-60 190,110" fill="#0B1220" stroke="#67E8F9" stroke-width="10" stroke-linejoin="round"/><rect x="-140" y="110" width="280" height="190" fill="#0B1220" stroke="#67E8F9" stroke-width="10"/><rect x="-35" y="190" width="70" height="110" rx="8" fill="#67E8F9"/><rect x="70" y="150" width="50" height="50" fill="#67E8F9" opacity="0.7"/></g>
<g transform="translate(900 780) rotate(35)" stroke="#FDE68A" stroke-width="14" stroke-linecap="round" fill="none"><circle r="34"/><line x1="0" y1="34" x2="0" y2="150"/><line x1="0" y1="110" x2="26" y2="110"/><line x1="0" y1="140" x2="26" y2="140"/></g>
${phone(150, 690, 9, '#67E8F9')}${rings(120, 730, '#67E8F9')}`,
  },
  zaehlen: {
    accent: '#5EEAD4',
    defs: gradient([[0, '#042F2E'], [1, '#115E59']]),
    bg: `${bgRect}<g stroke="#5EEAD4" stroke-opacity="0.08" stroke-width="2">${Array.from({ length: 14 }, (_, i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="1080"/><line x1="0" y1="${i * 80}" x2="1080" y2="${i * 80}"/>`).join('')}</g>`,
    motif: tallyCells(),
  },
  demo: {
    accent: '#67E8F9',
    defs: gradient([[0, '#0B1220'], [0.5, '#312E81'], [1, '#7C3AED']]),
    bg: `${bgRect}<g fill="none" stroke="#22D3EE">${[120, 210, 300, 390, 480].map((r, i) => `<circle cx="800" cy="760" r="${r}" stroke-opacity="${0.5 - i * 0.08}" stroke-width="4"/>`).join('')}</g>`,
    motif: `<circle cx="800" cy="760" r="120" fill="#22D3EE"/>${phone(715, 675, 7.1, '#0B1220')}
<rect x="70" y="760" width="560" height="110" rx="55" fill="#FFFFFF"/>
<text x="350" y="832" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="54" fill="#312E81">+43 726 223 417</text>`,
  },
  agentur: {
    accent: '#A5B4FC',
    defs: gradient([[0, '#0F172A'], [1, '#1E1B4B']]),
    bg: `${bgRect}<g stroke="#818CF8" stroke-opacity="0.12" stroke-width="40">${[0, 1, 2, 3, 4].map((i) => `<line x1="${-100 + i * 300}" y1="1180" x2="${500 + i * 300}" y2="-100"/>`).join('')}</g>`,
    motif: `<g transform="translate(130 150) scale(0.8)"><rect x="420" y="700" width="560" height="300" rx="28" fill="#312E81" stroke="#818CF8" stroke-width="3" transform="rotate(-6 700 850)"/>
<rect x="380" y="690" width="560" height="300" rx="28" fill="#1E293B" stroke="#94A3B8" stroke-width="3" transform="rotate(-2 660 840)"/>
<rect x="340" y="680" width="560" height="300" rx="28" fill="#FFFFFF"/>
<circle cx="440" cy="780" r="46" fill="#6366F1"/><text x="440" y="798" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="52" fill="#FFFFFF">A</text>
<rect x="520" y="755" width="280" height="22" rx="11" fill="#1E293B"/><rect x="520" y="795" width="190" height="16" rx="8" fill="#94A3B8"/>
<rect x="380" y="860" width="440" height="16" rx="8" fill="#CBD5E1"/><rect x="380" y="896" width="360" height="16" rx="8" fill="#CBD5E1"/>
<text x="620" y="965" text-anchor="middle" font-family="Space Grotesk" font-weight="700" font-size="30" fill="#6366F1">Ihre Marke</text></g>`,
  },
};

export const SCENE_KEYS = [...Object.keys(SCENES), 'standard'];
export const SCENE_W = W;
