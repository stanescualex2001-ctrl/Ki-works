import React, { useEffect, useState, useId } from 'react';
import { getStoredTheme, applyTheme } from './theme.js';

/* ---------- Light/Dark-Umschalter ---------- */
function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button type="button" className={`refresh ${className}`} onClick={toggle}>
      {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}

/* ---------- Brand mark: Orbit K (identisch zum Kunden-Dashboard) ---------- */
function OrbitKLogo({ size = 34 }) {
  const uid = useId().replace(/:/g, '');
  const dots = [
    { offset: 0, color: '#67E8F9', r: 5.4, w: 3, op: 0.6, blink: '1;0.15;1', begin: 0 },
    { offset: 120, color: '#A5B4FC', r: 4.2, w: 2.6, op: 0.55, blink: '0.2;1;0.2', begin: 0.667 },
    { offset: 240, color: '#F3F6FB', r: 3.4, w: 2.2, op: 0.5, blink: '0.15;1;0.15', begin: 1.333 },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 150 150" aria-hidden="true">
      <defs>
        <linearGradient id={`ok-ring-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22D3EE" /><stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id={`ok-k-${uid}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#06B6D4" /><stop offset="1" stopColor="#818CF8" />
        </linearGradient>
      </defs>
      <circle cx="75" cy="75" r="52" fill="none" stroke={`url(#ok-ring-${uid})`} strokeWidth="2.5" opacity="0.35" />
      <path d="M64 52 L64 98 M64 75 L86 52 M72 75 L86 98" fill="none" stroke={`url(#ok-k-${uid})`}
            strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      {dots.map((d) => (
        <g key={d.offset} transform={`rotate(${d.offset} 75 75)`}>
          <animateTransform attributeName="transform" type="rotate" from={`${d.offset} 75 75`}
                             to={`${d.offset + 360} 75 75`} dur="8s" repeatCount="indefinite" />
          <path d="M 52.2 28.26 A 52 52 0 0 1 75 23" fill="none" stroke={d.color}
                strokeWidth={d.w} strokeLinecap="round" opacity={d.op} />
          <circle cx="75" cy="23" r={d.r} fill={d.color}>
            <animate attributeName="opacity" values={d.blink} dur="2s" begin={`${d.begin}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
    </svg>
  );
}

/* ---------- Kiwo character: Orb Buddy (identisch zum Kunden-Dashboard) ---------- */
function OrbBuddy({ size = 44 }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" className="orb-float">
      <defs>
        <radialGradient id={`ob-glow-${uid}`} cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor="#22D3EE" stopOpacity="0.55" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`ob-body-${uid}`} cx="34%" cy="28%" r="80%">
          <stop offset="0" stopColor="#A5F3FC" />
          <stop offset="0.4" stopColor="#22D3EE" />
          <stop offset="1" stopColor="#7C3AED" />
        </radialGradient>
        <radialGradient id={`ob-shine-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id={`ob-blurA-${uid}`}><feGaussianBlur stdDeviation="10" /></filter>
        <filter id={`ob-blurB-${uid}`}><feGaussianBlur stdDeviation="3.2" /></filter>
        <filter id={`ob-blurC-${uid}`}><feGaussianBlur stdDeviation="5" /></filter>
      </defs>
      <ellipse cx="100" cy="172" rx="32" ry="7" fill="#000" opacity="0.28" filter={`url(#ob-blurC-${uid})`} />
      <circle cx="100" cy="112" r="66" fill={`url(#ob-glow-${uid})`} filter={`url(#ob-blurA-${uid})`} />
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-6 100 60;6 100 60;-6 100 60"
                           dur="3.5s" repeatCount="indefinite" />
        <line x1="100" y1="60" x2="100" y2="45" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="40" r="9" fill="#67E8F9" opacity="0.45" filter={`url(#ob-blurB-${uid})`} />
        <circle cx="100" cy="40" r="4.4" fill="#ECFEFF" />
      </g>
      <circle cx="100" cy="112" r="46" fill={`url(#ob-body-${uid})`} />
      <ellipse cx="83" cy="92" rx="20" ry="14" fill={`url(#ob-shine-${uid})`} opacity="0.8"
               filter={`url(#ob-blurB-${uid})`} transform="rotate(-18 83 92)" />
      <path d="M124 132 A46 46 0 0 1 96 157" fill="none" stroke="#4C1D95" strokeWidth="10"
            strokeLinecap="round" opacity="0.18" filter={`url(#ob-blurB-${uid})`} />
      <g>
        <animate attributeName="opacity" values="1;1;0.1;1;1" keyTimes="0;0.46;0.5;0.54;1"
                 dur="4.2s" repeatCount="indefinite" />
        <circle cx="86" cy="110" r="5.6" fill="#0B1220" />
        <circle cx="114" cy="110" r="5.6" fill="#0B1220" />
        <circle cx="88" cy="107.5" r="1.6" fill="#fff" />
        <circle cx="116" cy="107.5" r="1.6" fill="#fff" />
      </g>
      <path d="M87 126 Q100 136 113 126" fill="none" stroke="#0B1220" strokeWidth="4.2" strokeLinecap="round" />
    </svg>
  );
}

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('de-AT', { dateStyle: 'medium', timeStyle: 'short' }) : '–';
const AUTH_KEY = 'kiworks-business-auth';

// ---------------------------------------------------------------- auth utils
const loadAuth = () => {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; } catch { return null; }
};
const saveAuth = (a) => localStorage.setItem(AUTH_KEY, JSON.stringify(a));
const clearAuth = () => localStorage.removeItem(AUTH_KEY);

function apiFetch(url, opts = {}) {
  const auth = loadAuth();
  const headers = { ...(opts.headers || {}) };
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;
  return fetch(url, { ...opts, headers }).then((r) => {
    if (r.status === 401 && auth) { clearAuth(); window.location.reload(); }
    return r;
  });
}

function useFetch(url, refreshKey) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!url) { setData(null); return undefined; }
    let alive = true;
    apiFetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [url, refreshKey]);
  return { data, error };
}

// ---------------------------------------------------------------- Login (nur Admin)
function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    fetch('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
        if (d.role !== 'admin') throw new Error('Dieser Zugang ist nur für den Admin-Login.');
        saveAuth(d);
        onLogin(d);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="logo-area login-logo">
          <span className="logo-badge" aria-hidden="true"><OrbitKLogo size={34} /></span>
          <span className="logo-word">KI-Works</span>
        </div>
        <p className="login-sub">Business-Dashboard — nur für Admin</p>
        <label htmlFor="login-email">E-Mail</label>
        <input id="login-email" type="email" required autoComplete="username"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="login-pass">Passwort</label>
        <input id="login-pass" type="password" required autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Anmelden…' : 'Anmelden'}
        </button>
        <a className="site-link login-site-link" href="/">← Zur Website</a>
        <ThemeToggle />
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- Meta-Ansicht (alle Freigaben)
const PENDING_KIND_LABEL = { outreach_email: 'Akquise-E-Mail' };
const PENDING_ROLE_LABEL = { sales: 'Sales', support: 'Support', office: 'Office', orders: 'Orders' };

function PendingActions({ refreshKey, onChanged }) {
  const { data: actions, error } = useFetch('/api/pending-actions', refreshKey);
  const [deciding, setDeciding] = useState(null);
  const decide = (id, status) => {
    setDeciding(id);
    apiFetch(`/api/pending-actions/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then(() => onChanged())
      .finally(() => setDeciding(null));
  };
  if (error) return <p className="error">Fehler: {error}</p>;
  if (!actions) return <p>Lade…</p>;
  if (!actions.length) return <p className="hint">Keine offenen Freigaben — hier landen künftig die Ergebnisse der Kiwo-Agenten (z. B. Sales-Akquise-Mails), sobald sie aktiv sind.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Erstellt</th><th>Betrieb</th><th>Rolle</th><th>Art</th><th>Zusammenfassung</th><th>Aktion</th></tr>
        </thead>
        <tbody>
          {actions.map((a) => (
            <tr key={a.id}>
              <td>{fmtDateTime(a.created_at)}</td>
              <td>{a.restaurant_name || '–'}</td>
              <td>{PENDING_ROLE_LABEL[a.role] || a.role}</td>
              <td>{PENDING_KIND_LABEL[a.kind] || a.kind}</td>
              <td>{a.summary}</td>
              <td className="lead-actions">
                <button className="link" disabled={deciding === a.id} onClick={() => decide(a.id, 'approved')}>✅ Freigeben</button>
                <button className="link" disabled={deciding === a.id} onClick={() => decide(a.id, 'rejected')}>❌ Ablehnen</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------- Business-Karten
const ROLE_ORDER = ['reception', 'sales', 'support', 'office', 'orders'];
const ROLE_LABEL = { reception: 'Reception', sales: 'Sales', support: 'Support', office: 'Office', orders: 'Orders' };

const BUSINESSES = [
  { id: 'ledtek', name: 'ledtek.at', tag: 'LED B2B · formell' },
  { id: 'pixelpress', name: 'pixelpress.at', tag: 'Webdesign · locker' },
  { id: 'memcore', name: 'Memcore', tag: 'Perg · Linz · Wien' },
  { id: 'ki-works', name: 'ki-works.eu', tag: 'Plattform · Restaurants' },
];

function BusinessGrid({ onOpen }) {
  return (
    <div className="business-grid">
      {BUSINESSES.map((b) => (
        <button key={b.id} className="business-card" onClick={() => onOpen(b)}>
          <div className="business-card-name">{b.name}</div>
          <div className="business-card-tag">{b.tag}</div>
          <div className="business-card-roles">
            {ROLE_ORDER.map((r) => (
              <span key={r} className="role-chip role-chip-soon">{ROLE_LABEL[r]}</span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}

function BusinessDetail({ business, onBack }) {
  return (
    <>
      <button className="link back-link" onClick={onBack}>← Zurück zur Übersicht</button>
      <h1 style={{ marginBottom: '0.3rem' }}>{business.name}</h1>
      <p className="hint">
        Noch nicht mit einem Kiwo-Kunden verknüpft. Sobald {business.name} als echter Kunde im
        System angelegt ist, erscheinen hier die Freigaben der einzelnen Kiwo-Rollen für diesen
        Betrieb.
      </p>
    </>
  );
}

// ---------------------------------------------------------------- App
export default function App() {
  const [auth, setAuth] = useState(loadAuth);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openBusiness, setOpenBusiness] = useState(null);
  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    if (!auth) return undefined;
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [auth]);

  if (!auth) return <Login onLogin={setAuth} />;

  const logout = () => { clearAuth(); setAuth(null); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo-area">
          <span className="logo-badge" aria-hidden="true"><OrbitKLogo size={34} /></span>
          <span className="logo-word">KI-Works</span>
        </div>
        <div className="kiwo-presence">
          <OrbBuddy size={40} />
          <div className="kiwo-presence-text">
            <div className="kiwo-presence-name">Business-Dashboard</div>
            <div className="kiwo-presence-status">intern · Admin</div>
          </div>
        </div>
        <button className="refresh" onClick={refresh}>⟳ Aktualisieren</button>
        <ThemeToggle />
        <button className="refresh" onClick={logout}>Abmelden</button>
      </aside>
      <main>
        {openBusiness ? (
          <BusinessDetail business={openBusiness} onBack={() => setOpenBusiness(null)} />
        ) : (
          <>
            <header className="main-head">
              <div className="main-head-top">
                <h1>Meta-Ansicht</h1>
              </div>
              <p className="hint" style={{ margin: 0 }}>
                Alle offenen Freigaben aus allen Businesses, gebündelt.
              </p>
            </header>
            <PendingActions refreshKey={refreshKey} onChanged={refresh} />

            <h2 style={{ marginTop: '2rem' }}>Businesses</h2>
            <BusinessGrid onOpen={setOpenBusiness} />
          </>
        )}
      </main>
    </div>
  );
}
