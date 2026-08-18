import React, { useEffect, useState, useCallback, useMemo, useId, useRef } from 'react';
import { getStoredTheme, applyTheme } from './theme.js';
import { useI18n, SUPPORTED_LOCALES } from './i18n/index.jsx';

/* ---------- Light/Dark-Umschalter ---------- */
function ThemeToggle({ className = '' }) {
  const { t } = useI18n();
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
      {theme === 'dark' ? t('themeToggle.light') : t('themeToggle.dark')}
    </button>
  );
}

/* ---------- Sprach-Auswahl (Dropdown, wie das Flaggen-Menü auf der Landingpage) ---------- */
const LOCALE_FLAG = { de: '🇩🇪', en: '🇬🇧', ro: '🇷🇴' };
const LOCALE_NATIVE = { de: 'Deutsch', en: 'English', ro: 'Română' };
function LanguageToggle({ className = '' }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="lang-select" ref={ref}>
      <button
        type="button"
        className={`refresh ${className}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t('languageToggle.ariaLabel')}
        title={t('languageToggle.ariaLabel')}
      >
        {LOCALE_FLAG[locale]} {LOCALE_NATIVE[locale]}
      </button>
      {open && (
        <div className="lang-select-list">
          {SUPPORTED_LOCALES.filter((l) => l !== locale).map((l) => (
            <button key={l} type="button" onClick={() => { setLocale(l); setOpen(false); }}>
              {LOCALE_FLAG[l]} {LOCALE_NATIVE[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Brand mark: Orbit K (ring + K-monogram, orbiting channel dots) ---------- */
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

/* ---------- Kiwo character: Orb Buddy (neutral state) ---------- */
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

const LOCALE_INTL = { de: 'de-AT', en: 'en-US', ro: 'ro-RO' };
const fmtDateTime = (iso, locale = 'de-AT') =>
  iso ? new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) : '–';
const fmtTime = (iso, locale = 'de-AT') =>
  iso ? new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '–';
const AUTH_KEY = 'kiworks-auth';

// Sprachneutrale Status-/Tarif-Schlüssel + Hooks, die die passenden i18n-Texte
// nachschlagen (statt hartcodierter deutscher Label-Objekte auf Modul-Ebene,
// die kein useI18n() aufrufen könnten).
const STATUS_KEYS = ['confirmed', 'cancelled', 'no_show', 'completed'];
function useStatusLabels() {
  const { t } = useI18n();
  return useMemo(() => Object.fromEntries(STATUS_KEYS.map((k) => [k, t(`status.${k}`)])), [t]);
}

const ORDER_STATUS_KEYS = ['new', 'in_progress', 'ready', 'completed', 'cancelled'];
function useOrderStatusLabels() {
  const { t } = useI18n();
  return useMemo(() => Object.fromEntries(ORDER_STATUS_KEYS.map((k) => [k, t(`orderStatus.${k}`)])), [t]);
}

const PRICING_TIER_KEYS = ['', 'solo', 'team', 'scale'];
function usePricingTierOptions() {
  const { t } = useI18n();
  return useMemo(
    () => PRICING_TIER_KEYS.map((k) => ({ value: k, label: t(`pricingTier.${k || 'none'}`) })),
    [t],
  );
}

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

// Öffnet ein Fenster synchron (sonst blockt der Popup-Blocker), lädt dann die
// aktuell gültige Aufnahme-URL nach (Vapis Links sind zeitlich befristet).
function openRecording(callId, t) {
  const win = window.open('', '_blank');
  apiFetch(`/api/calls/${callId}/recording`)
    .then((r) => r.json())
    .then((d) => {
      if (d.url && win) win.location.href = d.url;
      else { win?.close(); alert(d.error || t('recording.notAvailableExpired')); }
    })
    .catch(() => { win?.close(); alert(t('recording.notAvailable')); });
}

function useFetch(url, refreshKey) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const prevUrl = useRef(null);
  useEffect(() => {
    if (!url) { prevUrl.current = null; setData(null); return undefined; }
    let alive = true;
    // Nur bei echtem URL-Wechsel (Tab/Betrieb gewechselt) auf null zurücksetzen
    // und "Lade…" zeigen. Beim stillen 30s-Auto-Refresh (gleiche URL, nur
    // refreshKey geändert) alte Daten sichtbar lassen, sonst würde jede
    // offene Eingabe (z. B. "+ Neuer Kunde"-Formular) durch den kurzzeitigen
    // Unmount alle 30s verworfen.
    if (prevUrl.current !== url) setData(null);
    prevUrl.current = url;
    apiFetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [url, refreshKey]);
  return { data, error };
}

// ---------------------------------------------------------------- Login
function Login({ onLogin }) {
  const { t } = useI18n();
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
        <p className="login-sub">{t('login.subtitle')}</p>
        <label htmlFor="login-email">{t('login.email')}</label>
        <input id="login-email" type="email" required autoComplete="username"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="login-pass">{t('login.password')}</label>
        <input id="login-pass" type="password" required autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? t('login.submitting') : t('login.submit')}
        </button>
        <a className="site-link login-site-link" href="/">← {t('sidebar.backToWebsite')}</a>
        <div className="login-toggles">
          <ThemeToggle className="login-theme-toggle" />
          <LanguageToggle className="login-theme-toggle" />
        </div>
      </form>
    </div>
  );
}

// DSGVO: Pflicht-Zustimmung beim ersten Login eines Kunden-Zugangs.
function ConsentGate({ restaurantName, onAccepted, onLogout }) {
  const { t } = useI18n();
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const confirm = () => {
    setSaving(true);
    setError(null);
    apiFetch('/api/accept-terms', { method: 'POST' })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        onAccepted();
      })
      .catch((err) => { setError(err.message); setSaving(false); });
  };

  return (
    <div className="login-page">
      <div className="login-card consent-card">
        <div className="logo-area login-logo">
          <span className="logo-badge" aria-hidden="true"><OrbitKLogo size={34} /></span>
          <span className="logo-word">KI-Works</span>
        </div>
        <p className="login-sub">{t('consent.subtitle', { name: restaurantName })}</p>
        <p>
          {t('consent.introBefore')}{' '}
          <a href="/datenschutz.html" target="_blank" rel="noreferrer">{t('consent.linkText')}</a>{' '}
          {t('consent.introAfter')}
        </p>
        <label className="consent-checkbox">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          {t('consent.checkboxLabel')}
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={!checked || saving} onClick={confirm}>
          {saving ? t('consent.confirming') : t('consent.confirm')}
        </button>
        <button type="button" className="link-strong" onClick={onLogout}>{t('sidebar.logout')}</button>
      </div>
    </div>
  );
}

// Öffentliche Seite: Kunde setzt sein eigenes Passwort über den Einladungslink.
function SetupPassword({ token, onDone }) {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [state, setState] = useState({ loading: false, error: null, success: false });

  const submit = (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setState({ loading: false, error: t('setupPassword.minLength'), success: false });
      return;
    }
    if (password !== confirm) {
      setState({ loading: false, error: t('setupPassword.mismatch'), success: false });
      return;
    }
    setState({ loading: true, error: null, success: false });
    fetch('/api/public/setup-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
        setState({ loading: false, error: null, success: true });
      })
      .catch((err) => setState({ loading: false, error: err.message, success: false }));
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-area login-logo">
          <span className="logo-badge" aria-hidden="true"><OrbitKLogo size={34} /></span>
          <span className="logo-word">KI-Works</span>
        </div>
        <p className="login-sub">{t('setupPassword.subtitle')}</p>
        {state.success ? (
          <>
            <p>{t('setupPassword.success')}</p>
            <button className="primary" onClick={onDone}>{t('setupPassword.goToLogin')}</button>
          </>
        ) : (
          <form onSubmit={submit}>
            <label htmlFor="su-pw">{t('setupPassword.newPassword')}</label>
            <input id="su-pw" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)} />
            <label htmlFor="su-pw2">{t('setupPassword.repeatPassword')}</label>
            <input id="su-pw2" type="password" required value={confirm}
              onChange={(e) => setConfirm(e.target.value)} />
            {state.error && <p className="error">{state.error}</p>}
            <button className="primary" type="submit" disabled={state.loading}>
              {state.loading ? t('setupPassword.saving') : t('setupPassword.save')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- widgets
function StatCard({ label, value, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={`stat-card${onClick ? ' clickable' : ''}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <div className="stat-value">{value ?? '–'}</div>
      <div className="stat-label">{label}</div>
    </Tag>
  );
}

function StatRow({ title, row, onNavigate }) {
  const { t } = useI18n();
  return (
    <section>
      <h2>{title}</h2>
      <div className="stat-grid">
        <StatCard label={t('stats.calls')} value={row?.calls} onClick={onNavigate && (() => onNavigate('calls'))} />
        <StatCard
          label={t('stats.reservations')} value={row?.reservations}
          onClick={onNavigate && (() => onNavigate('reservations'))}
        />
        <StatCard
          label={t('stats.phoneReservations')} value={row?.phone_reservations}
          onClick={onNavigate && (() => onNavigate('reservations'))}
        />
        <StatCard label={t('stats.guests')} value={row?.guests} onClick={onNavigate && (() => onNavigate('reservations'))} />
        <StatCard label={t('stats.orders')} value={row?.orders} onClick={onNavigate && (() => onNavigate('orders'))} />
      </div>
    </section>
  );
}

// Ersparnis-Kachel: echte Anruf-Zahlen seit dem ersten Anruf (= Live-Start bei
// diesem Kunden), nicht nur die letzten 7 Tage — zeigt die kumulierte Wirkung.
function RoiTile({ totalCalls, firstCallAt }) {
  const { t, locale } = useI18n();
  const intlLocale = LOCALE_INTL[locale] || LOCALE_INTL.de;
  const minutesPerCall = 4;
  const hourlyCost = 21;
  const hours = ((totalCalls || 0) * minutesPerCall) / 60;
  const euros = Math.round(hours * hourlyCost);
  const daysLive = firstCallAt
    ? Math.max(1, Math.ceil((Date.now() - new Date(firstCallAt).getTime()) / 86400000))
    : null;
  return (
    <section className="roi-tile">
      <div className="roi-tile-label">
        {t('roiTile.label')}
        {daysLive ? t(daysLive === 1 ? 'roiTile.liveSinceDay' : 'roiTile.liveSinceDays', { days: daysLive }) : ''}
      </div>
      <div className="roi-tile-values">
        <span className="roi-tile-value">
          {t('roiTile.hoursValue', { hours: hours.toLocaleString(intlLocale, { maximumFractionDigits: 1 }) })}
        </span>
        <span className="roi-tile-value">{euros.toLocaleString(intlLocale)} €</span>
      </div>
      <div className="roi-tile-note">
        {t('roiTile.note', { calls: totalCalls || 0, minutes: minutesPerCall, cost: hourlyCost })}
      </div>
    </section>
  );
}

// Minuten-Nutzung im laufenden Monat vs. gebuchtes Tarif-Kontingent — rein
// informativ (Anzeige, kein automatisches Billing, siehe CLAUDE.md
// „Offene Punkte"). Ohne hinterlegten Tarif nur der Verbrauch ohne Vergleich.
function UsageTile({ restaurantId, refreshKey }) {
  const { t, locale } = useI18n();
  const intlLocale = LOCALE_INTL[locale] || LOCALE_INTL.de;
  const { data: usage } = useFetch(
    restaurantId != null ? `/api/usage?restaurant_id=${restaurantId}` : null, refreshKey,
  );
  if (!usage) return null;
  const pct = usage.minutesIncluded ? Math.min(100, Math.round((usage.minutesUsed / usage.minutesIncluded) * 100)) : null;
  return (
    <section className="roi-tile">
      <div className="roi-tile-label">{t('usageTile.label')}</div>
      <div className="roi-tile-values">
        <span className="roi-tile-value">
          {usage.minutesIncluded
            ? t('usageTile.minutesOfIncluded', {
                used: usage.minutesUsed.toLocaleString(intlLocale),
                included: usage.minutesIncluded.toLocaleString(intlLocale),
              })
            : t('usageTile.minutesOnly', { used: usage.minutesUsed.toLocaleString(intlLocale) })}
        </span>
        {usage.overageMinutes > 0 && (
          <span className="roi-tile-value warn-text">
            {t('usageTile.overage', {
              minutes: usage.overageMinutes,
              cost: usage.overageCost.toLocaleString(intlLocale, { minimumFractionDigits: 2 }),
            })}
          </span>
        )}
      </div>
      {pct != null && (
        <div className="usage-bar">
          <div className="usage-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
      <div className="roi-tile-note">
        {usage.tierLabel
          ? t('usageTile.tierNote', {
              tier: usage.tierLabel,
              rate: usage.overageRatePerMinute.toLocaleString(intlLocale, { minimumFractionDigits: 2 }),
            })
          : t('usageTile.noTierNote')}
      </div>
    </section>
  );
}

function Overview({ restaurantId, refreshKey, onNavigate }) {
  const { t } = useI18n();
  const { data: daily } = useFetch('/api/stats/daily/by-restaurant', refreshKey);
  const { data: weekly } = useFetch('/api/stats/weekly/by-restaurant', refreshKey);
  const pick = (rows) => rows?.find((r) => String(r.restaurant_id) === String(restaurantId));
  return (
    <>
      <RoiTile totalCalls={pick(weekly)?.total_calls} firstCallAt={pick(weekly)?.first_call_at} />
      <UsageTile restaurantId={restaurantId} refreshKey={refreshKey} />
      <StatRow title={t('overview.today')} row={pick(daily)} onNavigate={onNavigate} />
      <StatRow title={t('overview.last7Days')} row={pick(weekly)} onNavigate={onNavigate} />
    </>
  );
}

// Zeigt alle Felder einer Reservierung/Bestellung/eines Anrufs + Status-Änderung.
function DetailModal({ item, onClose, onStatusChange, onOpenDetail }) {
  const { t, locale } = useI18n();
  const intlLocale = LOCALE_INTL[locale] || LOCALE_INTL.de;
  const STATUS_LABELS = useStatusLabels();
  const ORDER_STATUS = useOrderStatusLabels();
  if (!item) return null;
  const { type, data } = item;

  if (type === 'call') {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label={t('common.close')}>×</button>
          <h2>{t('detail.callTitle')}</h2>
          <dl className="detail-list">
            <dt>{t('detail.number')}</dt><dd>{data.caller_number || t('detail.unknownNumber')}</dd>
            <dt>{t('detail.time')}</dt><dd>{fmtDateTime(data.started_at || data.created_at, intlLocale)}</dd>
            <dt>{t('detail.duration')}</dt>
            <dd>{data.duration_seconds != null ? t('detail.durationMinutes', { min: Math.round(data.duration_seconds / 60) }) : '–'}</dd>
            <dt>{t('detail.outcome')}</dt><dd><span className={`badge badge-${data.outcome}`}>{data.outcome || '–'}</span></dd>
            <dt>{t('detail.summary')}</dt><dd>{data.summary || '–'}</dd>
            {data.callback_topic && (
              <><dt>{t('detail.callbackRequested')}</dt><dd><span className="badge badge-callback">📞 {data.callback_topic}</span></dd></>
            )}
          </dl>
          {data.linkedReservation && (
            <p>
              <button
                className="link"
                onClick={() => onOpenDetail('reservation', data.linkedReservation)}
              >
                {t('detail.viewLinkedReservation')}
              </button>
            </p>
          )}
          {data.linkedOrder && (
            <p>
              <button className="link" onClick={() => onOpenDetail('order', data.linkedOrder)}>
                {t('detail.viewLinkedOrder')}
              </button>
            </p>
          )}
          {data.recording_url && (
            <p><button type="button" className="link" onClick={() => openRecording(data.id, t)}>{t('detail.listenRecording')}</button></p>
          )}
          <label className="side-label" htmlFor="detail-transcript">{t('detail.transcript')}</label>
          <div className="transcript-box" id="detail-transcript">{data.transcript || t('detail.noTranscript')}</div>
        </div>
      </div>
    );
  }

  const isReservation = type === 'reservation';
  const statusMap = isReservation ? STATUS_LABELS : ORDER_STATUS;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label={t('common.close')}>×</button>
        <h2>{isReservation ? t('detail.reservationTitle') : t('detail.orderTitle')}</h2>
        <dl className="detail-list">
          <dt>{t('detail.name')}</dt><dd>{data.customer_name}</dd>
          <dt>{t('detail.phone')}</dt><dd>{data.customer_phone || '–'}</dd>
          {isReservation ? (
            <>
              <dt>{t('detail.reservedTime')}</dt><dd>{fmtDateTime(data.reserved_at, intlLocale)}</dd>
              <dt>{t('detail.partySize')}</dt><dd>{data.party_size}</dd>
            </>
          ) : (
            <>
              <dt>{t('detail.orderItems')}</dt><dd>{data.items}</dd>
              <dt>{t('detail.pickupTime')}</dt><dd>{data.requested_at ? fmtDateTime(data.requested_at, intlLocale) : '–'}</dd>
            </>
          )}
          <dt>{t('detail.source')}</dt><dd>{data.source === 'phone' ? t('detail.sourcePhone') : t('detail.sourceDashboard')}</dd>
          <dt>{t('detail.notes')}</dt><dd>{data.notes || '–'}</dd>
          <dt>{t('detail.received')}</dt><dd>{fmtDateTime(data.created_at, intlLocale)}</dd>
        </dl>
        <label className="side-label" htmlFor="detail-status">{t('detail.status')}</label>
        <select
          id="detail-status" value={data.status}
          onChange={(e) => onStatusChange(type, data.id, e.target.value)}
        >
          {Object.entries(statusMap).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
    </div>
  );
}

// Durchsuchbarer Betrieb-Wähler — zeigt nach Auswahl nur noch den gewählten Namen.
// Der Text bleibt immer normal editierbar (kein Zurücksetzen per State bei jedem
// Tastendruck) — auf Fokus wird der Text nur markiert, damit man direkt lostippen
// oder mit Backspace/Entf normal löschen kann.
function BusinessPicker({ restaurants, restaurantId, onSelect }) {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const current = restaurants.find((r) => String(r.id) === String(restaurantId));

  useEffect(() => {
    setText(current?.name || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const matches = restaurants.filter((r) => r.name.toLowerCase().includes(text.trim().toLowerCase()));

  const selectRestaurant = (r) => {
    onSelect(r.id);
    setText(r.name);
    setOpen(false);
  };

  return (
    <div className="business-picker">
      <input
        type="text" className="business-picker-input" placeholder={t('businessPicker.placeholder')}
        autoComplete="off" value={text}
        onFocus={() => { setOpen(true); setText(''); }}
        onChange={(e) => { setText(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => {
          setOpen(false);
          if (current) setText(current.name);
        }, 150)}
      />
      {open && (
        <ul className="business-picker-list">
          {matches.length === 0 && <li className="business-picker-empty">{t('businessPicker.noResults')}</li>}
          {matches.map((r) => (
            <li key={r.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => selectRestaurant(r)}>
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Reservations({ restaurantId, refreshKey, onChanged, onOpenDetail }) {
  const { t, locale } = useI18n();
  const intlLocale = LOCALE_INTL[locale] || LOCALE_INTL.de;
  const STATUS_LABELS = useStatusLabels();
  const { data: reservations, error } = useFetch(
    `/api/reservations?restaurant_id=${restaurantId}`, refreshKey,
  );
  const setStatus = useCallback((id, status) => {
    apiFetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(onChanged);
  }, [onChanged]);

  if (error) return <p className="error">{t('common.error', { message: error })}</p>;
  if (!reservations) return <p>{t('common.loading')}</p>;
  if (!reservations.length) return <p>{t('reservations.empty')}</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{t('reservations.colDateTime')}</th><th>{t('reservations.colName')}</th>
            <th>{t('reservations.colPhone')}</th><th>{t('reservations.colParty')}</th>
            <th>{t('reservations.colSource')}</th><th>{t('reservations.colStatus')}</th>
            <th>{t('reservations.colNotes')}</th><th></th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr
              key={r.id} className={`clickable-row${r.status === 'cancelled' ? ' muted' : ''}`}
              onClick={() => onOpenDetail('reservation', r)}
            >
              <td>{fmtDateTime(r.reserved_at, intlLocale)}</td>
              <td>{r.customer_name}</td>
              <td>{r.customer_phone || '–'}</td>
              <td>{r.party_size}</td>
              <td>{r.source === 'phone' ? t('detail.sourcePhone') : t('detail.sourceDashboard')}</td>
              <td><span className={`badge badge-${r.status}`}>{STATUS_LABELS[r.status] || r.status}</span></td>
              <td>{r.notes || ''}</td>
              <td>
                {r.status === 'confirmed' && (
                  <button
                    className="link"
                    onClick={(e) => { e.stopPropagation(); setStatus(r.id, 'cancelled'); }}
                  >
                    {t('reservations.cancel')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const mondayOf = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() + (day === 0 ? -6 : 1) - day);
  date.setHours(0, 0, 0, 0);
  return date;
};

function WeekCalendar({ restaurantId, refreshKey, onOpenDetail }) {
  const { t: translate, locale } = useI18n();
  const intlLocale = LOCALE_INTL[locale] || LOCALE_INTL.de;
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const { data: reservations } = useFetch(`/api/reservations?restaurant_id=${restaurantId}`, refreshKey);
  const { data: orders } = useFetch(`/api/orders?restaurant_id=${restaurantId}`, refreshKey);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
  }), [weekStart]);
  const hours = useMemo(() => Array.from({ length: 16 }, (_, i) => i + 8), []); // 08–23 Uhr

  const weekEnd = useMemo(() => { const e = new Date(weekStart); e.setDate(e.getDate() + 7); return e; }, [weekStart]);
  const inWeek = (iso) => { if (!iso) return false; const d = new Date(iso); return d >= weekStart && d < weekEnd; };
  const dayIndex = (iso) => Math.floor((new Date(iso) - weekStart) / 86400000);

  const resByCell = {};
  (reservations || []).forEach((r) => {
    if (r.status === 'cancelled' || !inWeek(r.reserved_at)) return;
    const key = `${dayIndex(r.reserved_at)}-${new Date(r.reserved_at).getHours()}`;
    (resByCell[key] ||= []).push(r);
  });
  const ordByCell = {};
  (orders || []).forEach((o) => {
    if (o.status === 'cancelled' || !inWeek(o.requested_at)) return;
    const key = `${dayIndex(o.requested_at)}-${new Date(o.requested_at).getHours()}`;
    (ordByCell[key] ||= []).push(o);
  });

  const rangeLabel = () => {
    const end = new Date(weekStart); end.setDate(end.getDate() + 6);
    const opts = { day: '2-digit', month: '2-digit' };
    return `${weekStart.toLocaleDateString(intlLocale, opts)}–${end.toLocaleDateString(intlLocale, { ...opts, year: 'numeric' })}`;
  };
  const shiftWeek = (delta) => setWeekStart((s) => { const n = new Date(s); n.setDate(n.getDate() + delta * 7); return n; });
  const loading = !reservations || !orders;

  return (
    <>
      <div className="toolbar">
        <button className="link" onClick={() => shiftWeek(-1)}>{translate('calendar.previous')}</button>
        <strong>{rangeLabel()}</strong>
        <button className="link" onClick={() => shiftWeek(1)}>{translate('calendar.next')}</button>
        <button className="link" onClick={() => setWeekStart(mondayOf(new Date()))}>{translate('calendar.today')}</button>
      </div>
      {loading ? <p>{translate('common.loading')}</p> : (
        <div className="table-wrap">
          <div className="week-grid">
            <div className="week-cell week-corner" />
            {days.map((d, i) => (
              <div className="week-cell week-day-head" key={i}>
                {d.toLocaleDateString(intlLocale, { weekday: 'short', day: '2-digit', month: '2-digit' })}
              </div>
            ))}
            {hours.map((h) => (
              <React.Fragment key={h}>
                <div className="week-cell week-hour">{String(h).padStart(2, '0')}:00</div>
                {days.map((_, di) => {
                  const key = `${di}-${h}`;
                  return (
                    <div className="week-cell week-slot" key={di}>
                      {(resByCell[key] || []).map((r) => (
                        <button
                          key={`r${r.id}`} className="event-chip reservation" title={r.notes || ''}
                          onClick={() => onOpenDetail('reservation', r)}
                        >
                          {translate('calendar.reservationChip', { name: r.customer_name, party: r.party_size })}
                        </button>
                      ))}
                      {(ordByCell[key] || []).map((o) => (
                        <button
                          key={`o${o.id}`} className="event-chip order" title={o.notes || ''}
                          onClick={() => onOpenDetail('order', o)}
                        >
                          🛍️ {o.items.length > 18 ? `${o.items.slice(0, 18)}…` : o.items}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      <p className="hint">{translate('calendar.hint')}</p>
    </>
  );
}

function AuditLogDetail({ details }) {
  const entries = Object.entries(details || {}).filter(([, v]) => v !== null && v !== undefined && v !== '');
  if (!entries.length) return null;
  return (
    <div className="audit-detail">
      {entries.map(([key, value]) => (
        <div key={key} className="audit-detail-field">
          <div className="audit-detail-label">{key}</div>
          <div className="audit-detail-value">
            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

// Zeigt jede protokollierte Kiwo-Aktion (Telefon-Tool-Aufrufe, ggf. Sales-/
// Social-Agent bei ki-works.eu selbst) — Grundlage für das
// "Audit-Logs für jede Aktion von Kiwo"-Versprechen auf der Landingpage.
function AuditLog({ restaurantId, refreshKey }) {
  const { t, locale } = useI18n();
  const intlLocale = LOCALE_INTL[locale] || LOCALE_INTL.de;
  const AUDIT_SOURCE_LABEL = {
    phone: t('auditLog.sourcePhone'), sales_agent: t('auditLog.sourceSalesAgent'), social_agent: t('auditLog.sourceSocialAgent'),
  };
  const { data: entries, error } = useFetch(`/api/audit-log?restaurant_id=${restaurantId}`, refreshKey);
  const [expandedId, setExpandedId] = useState(null);

  if (error) return <p className="error">{t('common.error', { message: error })}</p>;
  if (!entries) return <p>{t('common.loading')}</p>;
  if (!entries.length) return <p>{t('auditLog.empty')}</p>;

  return (
    <>
      <p className="hint">
        {t('auditLog.hint')}
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>{t('auditLog.colTime')}</th><th>{t('auditLog.colSource')}</th><th>{t('auditLog.colAction')}</th><th>{t('auditLog.colSummary')}</th></tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <React.Fragment key={e.id}>
                <tr className="clickable-row" onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}>
                  <td>{fmtDateTime(e.created_at, intlLocale)}</td>
                  <td>{AUDIT_SOURCE_LABEL[e.source] || e.source}</td>
                  <td>{e.action}</td>
                  <td>{e.summary}</td>
                </tr>
                {expandedId === e.id && (
                  <tr className="audit-detail-row"><td colSpan={4}><AuditLogDetail details={e.details} /></td></tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Calls({ restaurantId, refreshKey, onOpenDetail }) {
  const { t, locale } = useI18n();
  const intlLocale = LOCALE_INTL[locale] || LOCALE_INTL.de;
  const { data: calls, error } = useFetch(`/api/calls?restaurant_id=${restaurantId}`, refreshKey);
  const { data: reservations } = useFetch(`/api/reservations?restaurant_id=${restaurantId}`, refreshKey);
  const { data: orders } = useFetch(`/api/orders?restaurant_id=${restaurantId}`, refreshKey);

  if (error) return <p className="error">{t('common.error', { message: error })}</p>;
  if (!calls) return <p>{t('common.loading')}</p>;
  if (!calls.length) return <p>{t('calls.empty')}</p>;

  const reservationFor = (callId) => (reservations || []).find((r) => r.call_id === callId);
  const orderFor = (callId) => (orders || []).find((o) => o.call_id === callId);

  return (
    <div className="call-list">
      {calls.map((c) => {
        const res = reservationFor(c.id);
        const ord = orderFor(c.id);
        const openCall = () => onOpenDetail('call', { ...c, linkedReservation: res, linkedOrder: ord });
        return (
          <div className="call-card clickable-row" key={c.id} onClick={openCall}>
            <div className="call-head">
              <strong>{c.caller_number || t('calls.unknownNumber')}</strong>
              <span>{fmtDateTime(c.started_at || c.created_at, intlLocale)}</span>
              {c.duration_seconds != null && <span>{t('detail.durationMinutes', { min: Math.round(c.duration_seconds / 60) })}</span>}
              <span className={`badge badge-${c.outcome}`}>{c.outcome || '–'}</span>
              {c.callback_topic && <span className="badge badge-callback">{t('calls.callbackBadge')}</span>}
            </div>
            {c.summary && <p className="call-summary">{c.summary}</p>}
            <div className="call-actions">
              {c.recording_url && (
                <button
                  type="button"
                  className="link"
                  onClick={(e) => { e.stopPropagation(); openRecording(c.id, t); }}
                >
                  {t('detail.listenRecording')}
                </button>
              )}
              {res && (
                <button
                  className="link"
                  onClick={(e) => { e.stopPropagation(); onOpenDetail('reservation', res); }}
                >
                  {t('calls.viewReservation')}
                </button>
              )}
              {ord && (
                <button className="link" onClick={(e) => { e.stopPropagation(); onOpenDetail('order', ord); }}>
                  {t('calls.viewOrder')}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Recommendations({ restaurantId }) {
  const { t } = useI18n();
  const [state, setState] = useState({ loading: false, text: null, error: null });
  const generate = () => {
    setState({ loading: true, text: null, error: null });
    apiFetch(`/api/recommendations?restaurant_id=${restaurantId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => setState({ loading: false, text: d.recommendations, error: null }))
      .catch((e) => setState({ loading: false, text: null, error: e.message }));
  };
  return (
    <>
      <p>{t('recommendations.intro')}</p>
      <button className="primary" onClick={generate} disabled={state.loading}>
        {state.loading ? t('recommendations.generating') : t('recommendations.generate')}
      </button>
      {state.error && <p className="error">{t('common.error', { message: state.error })}</p>}
      {state.text && <div className="reco-box">{state.text}</div>}
    </>
  );
}

// Zugangs-Formular für einen Kunden (nur Betreiber).
// Muss mit ROLE_DEFINITIONS in backend/src/vapiAdmin.js synchron gehalten
// werden. "implemented: false" heißt: noch keine Tools/Prompt-Logik dafür
// gebaut (nur Marketing-Versprechen auf der Landingpage) — nicht anhakbar.
const ROLE_META = [
  { id: 'orders', implemented: true },
  { id: 'support', implemented: true },
  { id: 'sales', implemented: false },
  { id: 'office', implemented: false },
];

function RoleCheckboxes({ roles, onToggle }) {
  const { t } = useI18n();
  return (
    <div className="role-checkboxes">
      {ROLE_META.map((r) => (
        <label key={r.id} className={r.implemented ? '' : 'role-disabled'}>
          <input
            type="checkbox"
            checked={r.implemented ? roles.includes(r.id) : false}
            disabled={!r.implemented}
            onChange={() => onToggle(r.id)}
          />
          {t(`roles.${r.id}`)}{!r.implemented && t('roles.comingSoon')}
        </label>
      ))}
    </div>
  );
}

// Formular zum nachträglichen Ändern der freigeschalteten Kiwo-Rollen
// eines Bestandskunden (löst nach dem Speichern eine Vapi-Neusynchronisierung aus).
function RolesForm({ restaurant, onDone, onCancel }) {
  const { t } = useI18n();
  const [roles, setRoles] = useState(restaurant.enabled_roles || ['orders', 'support']);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const toggle = (id) => {
    setRoles((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));
  };

  const save = (e) => {
    e.preventDefault();
    setSaving(true);
    apiFetch(`/api/restaurants/${restaurant.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ enabled_roles: roles }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        onDone();
      })
      .catch((err) => { setError(err.message); setSaving(false); });
  };

  return (
    <form className="access-form" onSubmit={save}>
      <strong>{t('rolesForm.title', { name: restaurant.name })}</strong>
      <RoleCheckboxes roles={roles} onToggle={toggle} />
      {error && <p className="error">{error}</p>}
      <div className="form-row">
        <button className="primary" type="submit" disabled={saving}>{t('common.save')}</button>
        <button type="button" className="link" onClick={onCancel}>{t('common.cancel')}</button>
      </div>
    </form>
  );
}

function PricingTierForm({ restaurant, onDone, onCancel }) {
  const { t } = useI18n();
  const tierOptions = usePricingTierOptions();
  const [tier, setTier] = useState(restaurant.pricing_tier || '');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = (e) => {
    e.preventDefault();
    setSaving(true);
    apiFetch(`/api/restaurants/${restaurant.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pricing_tier: tier || null }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        onDone();
      })
      .catch((err) => { setError(err.message); setSaving(false); });
  };

  return (
    <form className="access-form" onSubmit={save}>
      <strong>{t('pricingTierForm.title', { name: restaurant.name })}</strong>
      <label>{t('pricingTierForm.tierLabel')}
        <select value={tier} onChange={(e) => setTier(e.target.value)}>
          {tierOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      {error && <p className="error">{error}</p>}
      <div className="form-row">
        <button className="primary" type="submit" disabled={saving}>{t('common.save')}</button>
        <button type="button" className="link" onClick={onCancel}>{t('common.cancel')}</button>
      </div>
    </form>
  );
}

function AccessForm({ restaurant, onDone, onCancel }) {
  const { t } = useI18n();
  const [email, setEmail] = useState(restaurant.login_email || restaurant.contact_email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = (e) => {
    e.preventDefault();
    setSaving(true);
    apiFetch(`/api/restaurants/${restaurant.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ login_email: email, ...(password ? { password } : {}) }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        onDone();
      })
      .catch((err) => { setError(err.message); setSaving(false); });
  };

  return (
    <form className="access-form" onSubmit={save}>
      <strong>{t('accessForm.title', { name: restaurant.name })}</strong>
      <label>{t('accessForm.emailLabel')}
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>{t('accessForm.passwordLabel')} {restaurant.login_email ? t('accessForm.passwordHintUnchanged') : ''}
        <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}
          required={!restaurant.login_email} placeholder={t('accessForm.passwordPlaceholder')} />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="form-row">
        <button className="primary" type="submit" disabled={saving}>{t('common.save')}</button>
        <button type="button" className="link" onClick={onCancel}>{t('common.cancel')}</button>
      </div>
    </form>
  );
}

// Formular zum Anlegen eines neuen Kunden (nur Betreiber).
function NewCustomerForm({ onDone, onCancel }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [vapiNumber, setVapiNumber] = useState('');
  const [roles, setRoles] = useState(['orders', 'support']);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const toggleRole = (id) => {
    setRoles((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));
  };

  const save = (e) => {
    e.preventDefault();
    setSaving(true);
    apiFetch('/api/restaurants', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        vapi_phone_number: vapiNumber || null,
        enabled_roles: roles,
      }),
    })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.error || `HTTP ${r.status}`);
        onDone(body);
      })
      .catch((err) => { setError(err.message); setSaving(false); });
  };

  return (
    <form className="access-form" onSubmit={save}>
      <strong>{t('newCustomerForm.title')}</strong>
      <label>{t('newCustomerForm.nameLabel')}
        <input required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>{t('newCustomerForm.emailLabel')}
        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
      </label>
      <label>{t('newCustomerForm.phoneLabel')}
        <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
      </label>
      <label>{t('newCustomerForm.numberLabel')}
        <input value={vapiNumber} onChange={(e) => setVapiNumber(e.target.value)} />
      </label>
      <label>{t('newCustomerForm.rolesLabel')}
        <RoleCheckboxes roles={roles} onToggle={toggleRole} />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="form-row">
        <button className="primary" type="submit" disabled={saving}>{t('newCustomerForm.create')}</button>
        <button type="button" className="link" onClick={onCancel}>{t('common.cancel')}</button>
      </div>
    </form>
  );
}

function Customers({ refreshKey, onChanged, onOpenRestaurant }) {
  const { t, locale } = useI18n();
  const tierOptions = usePricingTierOptions();
  const { data: daily } = useFetch('/api/stats/daily/by-restaurant', refreshKey);
  const { data: weekly } = useFetch('/api/stats/weekly/by-restaurant', refreshKey);
  const { data: restaurants } = useFetch('/api/restaurants', refreshKey);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [editing, setEditing] = useState(null);
  const [editingRoles, setEditingRoles] = useState(null);
  const [editingTier, setEditingTier] = useState(null);
  const [adding, setAdding] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);

  const sendInvite = (id) => {
    setInviteMsg(t('customers.inviteSending'));
    apiFetch(`/api/restaurants/${id}/invite`, { method: 'POST' })
      .then((r) => (r.ok ? setInviteMsg(t('customers.inviteSent')) : setInviteMsg(t('customers.inviteError'))))
      .catch(() => setInviteMsg(t('customers.inviteError')));
  };

  const markPublished = (id) => {
    apiFetch(`/api/restaurants/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ vapi_published: true }),
    }).then((r) => r.ok && onChanged());
  };

  if (!daily || !weekly || !restaurants) return <p>{t('common.loading')}</p>;
  const weekOf = (id) => weekly.find((w) => w.restaurant_id === id) || {};
  const info = (id) => restaurants.find((r) => r.id === id) || {};
  const q = search.trim().toLowerCase();
  const filtered = daily.filter((d) => {
    if (!q) return true;
    const r = info(d.restaurant_id);
    return [d.name, d.contact_email, r.login_email, r.address]
      .some((v) => (v || '').toLowerCase().includes(q));
  });
  const SORTERS = {
    'name-asc': (a, b) => a.name.localeCompare(b.name, locale),
    'name-desc': (a, b) => b.name.localeCompare(a.name, locale),
    'newest': (a, b) => new Date(info(b.restaurant_id).created_at || 0) - new Date(info(a.restaurant_id).created_at || 0),
    'oldest': (a, b) => new Date(info(a.restaurant_id).created_at || 0) - new Date(info(b.restaurant_id).created_at || 0),
    'calls-desc': (a, b) => (weekOf(b.restaurant_id).calls || 0) - (weekOf(a.restaurant_id).calls || 0),
    'reservations-desc': (a, b) => (weekOf(b.restaurant_id).reservations || 0) - (weekOf(a.restaurant_id).reservations || 0),
  };
  const rows = [...filtered].sort(SORTERS[sortBy]);

  return (
    <>
      <p>{t('customers.intro')}</p>
      <div className="toolbar">
        <input
          type="search" className="search" placeholder={t('customers.searchPlaceholder')}
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name-asc">{t('customers.sortNameAsc')}</option>
          <option value="name-desc">{t('customers.sortNameDesc')}</option>
          <option value="newest">{t('customers.sortNewest')}</option>
          <option value="oldest">{t('customers.sortOldest')}</option>
          <option value="calls-desc">{t('customers.sortCallsDesc')}</option>
          <option value="reservations-desc">{t('customers.sortReservationsDesc')}</option>
        </select>
        <span className="hint">{t('customers.countLabel', { shown: rows.length, total: daily.length })}</span>
        <button className="primary" onClick={() => setAdding(true)}>{t('customers.addButton')}</button>
      </div>
      {inviteMsg && <p className="hint">{inviteMsg}</p>}
      {adding && (
        <NewCustomerForm
          onCancel={() => setAdding(false)}
          onDone={(result) => {
            setAdding(false);
            onChanged();
            if (result?.vapi) {
              setInviteMsg(result.vapi.ok
                ? t('customers.vapiSetupOk') + (result.vapi.warning ? t('customers.vapiSetupWarningHint', { warning: result.vapi.warning }) : '')
                : t('customers.vapiSetupFailed', { warning: result.vapi.warning }));
            }
          }}
        />
      )}
      {editing && (
        <AccessForm
          restaurant={info(editing)}
          onCancel={() => setEditing(null)}
          onDone={() => { setEditing(null); onChanged(); }}
        />
      )}
      {editingRoles && (
        <RolesForm
          restaurant={info(editingRoles)}
          onCancel={() => setEditingRoles(null)}
          onDone={() => { setEditingRoles(null); onChanged(); }}
        />
      )}
      {editingTier && (
        <PricingTierForm
          restaurant={info(editingTier)}
          onCancel={() => setEditingTier(null)}
          onDone={() => { setEditingTier(null); onChanged(); }}
        />
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('customers.colCustomer')}</th><th>{t('customers.colLogin')}</th>
              <th>{t('customers.colAiNumber')}</th><th>{t('customers.colVapiStatus')}</th><th>{t('customers.colTier')}</th>
              <th>{t('customers.colCallsToday')}</th><th>{t('customers.colResToday')}</th>
              <th>{t('customers.colCalls7')}</th><th>{t('customers.colRes7')}</th><th>{t('customers.colGuests7')}</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => {
              const w = weekOf(d.restaurant_id);
              const r = info(d.restaurant_id);
              return (
                <tr key={d.restaurant_id}>
                  <td>
                    <button className="link-strong" onClick={() => onOpenRestaurant(d.restaurant_id)}>
                      {d.name}
                    </button>
                  </td>
                  <td>{r.login_email || <span className="warn-text">{t('customers.noAccess')}</span>}</td>
                  <td>{r.vapi_phone_number || '–'}</td>
                  <td className="vapi-status-cell">
                    {!r.vapi_assistant_id ? (
                      <span className="hint">–</span>
                    ) : r.vapi_published ? (
                      <span className="ok-text">{t('customers.publishDone')}</span>
                    ) : (
                      <>
                        <span className="warn-text">{t('customers.publishNeeded')}</span>
                        <button type="button" className="link" onClick={() => markPublished(d.restaurant_id)}>
                          {t('customers.markPublished')}
                        </button>
                      </>
                    )}
                  </td>
                  <td>{tierOptions.find((o) => o.value === r.pricing_tier)?.label.replace(/ \(.*\)/, '') || '–'}</td>
                  <td>{d.calls}</td>
                  <td>{d.reservations}</td>
                  <td>{w.calls ?? '–'}</td>
                  <td>{w.reservations ?? '–'}</td>
                  <td>{w.guests ?? '–'}</td>
                  <td className="lead-actions">
                    <button className="link" onClick={() => setEditing(d.restaurant_id)}>
                      {r.login_email ? t('customers.changeAccess') : t('customers.createAccess')}
                    </button>
                    <button className="link" onClick={() => sendInvite(d.restaurant_id)}>
                      {t('customers.sendInvite')}
                    </button>
                    <button className="link" onClick={() => setEditingRoles(d.restaurant_id)}>
                      {t('customers.changeRoles')}
                    </button>
                    <button className="link" onClick={() => setEditingTier(d.restaurant_id)}>
                      {t('customers.changeTier')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Orders({ restaurantId, refreshKey, onChanged, onOpenDetail }) {
  const { t, locale } = useI18n();
  const intlLocale = LOCALE_INTL[locale] || LOCALE_INTL.de;
  const ORDER_STATUS = useOrderStatusLabels();
  const { data: orders, error } = useFetch(`/api/orders?restaurant_id=${restaurantId}`, refreshKey);
  const setStatus = (id, status) => {
    apiFetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(onChanged);
  };
  if (error) return <p className="error">{t('common.error', { message: error })}</p>;
  if (!orders) return <p>{t('common.loading')}</p>;
  if (!orders.length) return <p>{t('orders.empty')}</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{t('orders.colReceived')}</th><th>{t('orders.colName')}</th><th>{t('orders.colPhone')}</th>
            <th>{t('orders.colOrder')}</th><th>{t('orders.colPickup')}</th><th>{t('orders.colNotes')}</th>
            <th>{t('orders.colStatus')}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id} className={`clickable-row${['completed', 'cancelled'].includes(o.status) ? ' muted' : ''}`}
              onClick={() => onOpenDetail('order', o)}
            >
              <td>{fmtDateTime(o.created_at, intlLocale)}</td>
              <td><strong>{o.customer_name}</strong></td>
              <td>{o.customer_phone || '–'}</td>
              <td>{o.items}</td>
              <td>{o.requested_at ? fmtTime(o.requested_at, intlLocale) : '–'}</td>
              <td>{o.notes || ''}</td>
              <td>
                <select
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="lead-status"
                >
                  {Object.entries(ORDER_STATUS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const LEAD_STATUS_KEYS = ['new', 'contacted', 'won', 'lost'];

function Leads({ refreshKey, onChanged, onOpenRestaurant }) {
  const { t, locale } = useI18n();
  const intlLocale = LOCALE_INTL[locale] || LOCALE_INTL.de;
  const LEAD_STATUS = useMemo(
    () => Object.fromEntries(LEAD_STATUS_KEYS.map((k) => [k, t(`leadStatus.${k}`)])),
    [t],
  );
  const { data: leads, error } = useFetch('/api/leads', refreshKey);
  const [converting, setConverting] = useState(null);
  const setStatus = (id, status) => {
    apiFetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(onChanged);
  };
  const convert = (id) => {
    setConverting(id);
    apiFetch(`/api/leads/${id}/convert`, { method: 'POST' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => onChanged())
      .catch(() => {})
      .finally(() => setConverting(null));
  };
  if (error) return <p className="error">{t('common.error', { message: error })}</p>;
  if (!leads) return <p>{t('common.loading')}</p>;
  if (!leads.length) return <p>{t('leads.empty')}</p>;
  return (
    <>
      <p>{t('leads.intro')}</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('leads.colReceived')}</th><th>{t('leads.colName')}</th><th>{t('leads.colBusiness')}</th>
              <th>{t('leads.colEmail')}</th><th>{t('leads.colPhone')}</th><th>{t('leads.colMessage')}</th>
              <th>{t('leads.colStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className={['won', 'lost'].includes(l.status) ? 'muted' : ''}>
                <td>{fmtDateTime(l.created_at, intlLocale)}</td>
                <td><strong>{l.name}</strong></td>
                <td>{l.business || '–'}</td>
                <td>{l.email || '–'}</td>
                <td>{l.phone || '–'}</td>
                <td>{l.message || ''}</td>
                <td className="lead-actions">
                  <select
                    value={l.status}
                    onChange={(e) => setStatus(l.id, e.target.value)}
                    className="lead-status"
                  >
                    {Object.entries(LEAD_STATUS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {l.converted_restaurant_id ? (
                    <button className="link" onClick={() => onOpenRestaurant(l.converted_restaurant_id)}>
                      {t('leads.viewCustomer')}
                    </button>
                  ) : (
                    <button className="link" disabled={converting === l.id} onClick={() => convert(l.id)}>
                      {converting === l.id ? t('leads.converting') : t('leads.convert')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatusTile({ label, ok, detail }) {
  const { t } = useI18n();
  const cls = ok === true ? 'ok' : ok === false ? 'problem' : 'unknown';
  const text = ok === true ? t('system.ok') : ok === false ? t('system.problem') : t('system.unknown');
  return (
    <div className={`status-tile status-${cls}`}>
      <div className="status-label">{label}</div>
      <div className="status-value">{text}</div>
      {detail != null && <div className="status-detail">{detail}</div>}
    </div>
  );
}

function fmtUptime(seconds, t) {
  if (seconds == null) return '–';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const unitD = t('system.unitDay');
  const unitH = t('system.unitHour');
  const unitM = t('system.unitMinute');
  if (d > 0) return `${d}${unitD} ${h}${unitH}`;
  if (h > 0) return `${h}${unitH} ${m}${unitM}`;
  return `${m}${unitM}`;
}

// Admin-Ansicht: Server-Gesundheit (live geprüft) + Fehlerprotokoll.
// Erkennt nur Probleme, die auftreten, während der Backend-Prozess selbst noch
// läuft (DB/n8n nicht erreichbar, Platte voll, SSL läuft ab, Backup fehlt) —
// einen kompletten Server-Ausfall kann dieser Check naturgemäß nicht melden.
function SystemStatus({ refreshKey }) {
  const { t, locale } = useI18n();
  const intlLocale = LOCALE_INTL[locale] || LOCALE_INTL.de;
  const { data: status, error } = useFetch('/api/admin/system-status', refreshKey);
  const { data: errors } = useFetch('/api/admin/errors?limit=50', refreshKey);

  if (error) return <p className="error">{t('common.error', { message: error })}</p>;
  if (!status) return <p>{t('common.loading')}</p>;

  return (
    <>
      <div className="stat-grid">
        <StatusTile label={t('system.db')} ok={status.db.ok} detail={status.db.detail} />
        <StatusTile label={t('system.n8n')} ok={status.n8n.ok} detail={status.n8n.detail} />
        <StatusTile
          label={t('system.disk')}
          ok={status.disk.ok}
          detail={status.disk.percent != null ? t('system.diskPercent', { percent: status.disk.percent }) : status.disk.detail}
        />
        <StatusTile
          label={t('system.ssl')}
          ok={status.ssl.ok}
          detail={status.ssl.daysLeft != null ? t('system.sslDaysLeft', { days: status.ssl.daysLeft }) : status.ssl.detail}
        />
        <StatusTile
          label={t('system.backup')}
          ok={status.backup.ok}
          detail={status.backup.hoursAgo != null
            ? t('system.backupAgo', { hours: status.backup.hoursAgo, file: status.backup.file })
            : status.backup.detail}
        />
        <StatusTile label={t('system.uptime')} ok={true} detail={fmtUptime(status.uptimeSeconds, t)} />
      </div>
      <p className="muted">{t('system.lastChecked', { time: fmtDateTime(status.checkedAt, intlLocale) })}</p>

      <h2>{t('system.errorLogTitle')}</h2>
      {!errors?.length ? <p>{t('system.noEntries')}</p> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>{t('system.colTime')}</th><th>{t('system.colLevel')}</th><th>{t('system.colSource')}</th><th>{t('system.colMessage')}</th></tr>
            </thead>
            <tbody>
              {errors.map((e) => (
                <tr key={e.id}>
                  <td>{fmtDateTime(e.created_at, intlLocale)}</td>
                  <td><span className={`badge badge-${e.level}`}>{e.level}</span></td>
                  <td>{e.source}</td>
                  <td>{e.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// Eine offene Kundenfrage mit eigenem Antwort-Feld + eigenem Speichern-Button
// (bewusst unabhängig vom großen Wissensdatenbank/Öffnungszeiten/FAQ-Formular).
const CHANNEL_KEYS = ['sms', 'whatsapp', 'email'];

function OpenQuestionRow({ question, onSave }) {
  const { t } = useI18n();
  const CHANNEL_LABELS = useMemo(
    () => Object.fromEntries(CHANNEL_KEYS.map((k) => [k, t(`channel.${k}`)])),
    [t],
  );
  const [answer, setAnswer] = useState('');
  const [state, setState] = useState({ saving: false, error: null });

  const save = () => {
    if (!answer.trim()) return;
    setState({ saving: true, error: null });
    onSave(question.id, question.topic, answer.trim())
      .catch((err) => setState({ saving: false, error: err.message }));
  };

  return (
    <div className="open-question-row">
      <div className="open-question-topic">
        <strong>{question.topic}</strong>
        {question.caller_number && <span className="hint"> · {question.caller_number}</span>}
        {question.preferred_channel && (
          <span className="hint">
            {t('openQuestion.answerVia', { channel: CHANNEL_LABELS[question.preferred_channel] || question.preferred_channel })}
            {question.contact ? `: ${question.contact}` : ''}
          </span>
        )}
      </div>
      <input
        placeholder={t('openQuestion.placeholder')}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button type="button" className="link" disabled={state.saving || !answer.trim()} onClick={save}>
        {state.saving ? t('openQuestion.saving') : t('openQuestion.save')}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </div>
  );
}

// Einstellungen: Wissensdatenbank, Öffnungszeiten, FAQ und Zugangsdaten — für den
// Betreiber (nur eigener Betrieb) und den Admin (beliebiger, per BusinessPicker
// gewählter Betrieb) gleichermaßen nutzbar.
function Settings({ restaurantId, isAdmin }) {
  const { t } = useI18n();
  // Bewusst NICHT an den globalen 30s-Auto-Refresh gekoppelt: das würde
  // laufende Eingaben in den Feldern immer wieder zurücksetzen. Stattdessen
  // lädt diese Ansicht ihre Daten nur beim Öffnen bzw. Betrieb-Wechsel neu.
  const [current, setCurrent] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [hours, setHours] = useState({});
  const [faq, setFaq] = useState([]);
  const [loginEmail, setLoginEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [savingContent, setSavingContent] = useState(false);
  const [contentMsg, setContentMsg] = useState(null);
  const [savingCreds, setSavingCreds] = useState(false);
  const [credsMsg, setCredsMsg] = useState(null);

  // Fragen von Gästen, die Kiwo nicht beantworten konnte — der Kunde trägt die
  // Antwort selbst ein und übernimmt sie per eigenem Button in die FAQ.
  const [openQuestions, setOpenQuestions] = useState([]);
  const [openQuestionsError, setOpenQuestionsError] = useState(null);

  const loadOpenQuestions = useCallback(() => {
    if (restaurantId == null) return;
    apiFetch(`/api/callback-requests?restaurant_id=${restaurantId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setOpenQuestions)
      .catch((err) => setOpenQuestionsError(err.message));
  }, [restaurantId]);

  const loadRestaurant = useCallback(() => {
    if (restaurantId == null) return;
    apiFetch('/api/restaurants')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((list) => {
        const found = list.find((r) => String(r.id) === String(restaurantId)) || list[0] || null;
        setCurrent(found);
      })
      .catch((err) => setLoadError(err.message));
  }, [restaurantId]);

  useEffect(() => { setCurrent(null); loadRestaurant(); loadOpenQuestions(); }, [loadRestaurant, loadOpenQuestions]);

  useEffect(() => {
    if (!current) return;
    setKnowledgeBase(current.knowledge_base || '');
    setHours(current.opening_hours || {});
    setFaq(current.faq?.length ? current.faq : []);
    setLoginEmail(current.login_email || '');
    setCurrentPassword('');
    setNewPassword('');
    setContentMsg(null);
    setCredsMsg(null);
  }, [current?.id]);

  if (loadError) return <p className="error">{loadError}</p>;
  if (!current) return <p>{t('common.loading')}</p>;

  const saveContent = (e) => {
    e.preventDefault();
    setSavingContent(true);
    setContentMsg(null);
    apiFetch(`/api/restaurants/${current.id}/settings`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ knowledge_base: knowledgeBase, opening_hours: hours, faq }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        setContentMsg({ ok: true, text: t('settings.saved') });
      })
      .catch((err) => setContentMsg({ ok: false, text: err.message }))
      .finally(() => setSavingContent(false));
  };

  const saveCredentials = (e) => {
    e.preventDefault();
    setSavingCreds(true);
    setCredsMsg(null);
    const body = { login_email: loginEmail };
    if (newPassword) body.new_password = newPassword;
    if (!isAdmin) body.current_password = currentPassword;
    apiFetch(`/api/restaurants/${current.id}/credentials`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        setCredsMsg({ ok: true, text: t('settings.saved') });
        setCurrentPassword('');
        setNewPassword('');
      })
      .catch((err) => setCredsMsg({ ok: false, text: err.message }))
      .finally(() => setSavingCreds(false));
  };

  const updateFaqItem = (i, key, val) =>
    setFaq((f) => f.map((item, idx) => (idx === i ? { ...item, [key]: val } : item)));
  const addFaqItem = () => setFaq((f) => [...f, { question: '', answer: '' }]);
  const removeFaqItem = (i) => setFaq((f) => f.filter((_, idx) => idx !== i));

  // Eigener Speichern-Button je offener Frage: Antwort wird sofort in die FAQ
  // übernommen (nicht an das große Formular unten gekoppelt) und die Anfrage
  // als erledigt markiert, damit sie aus der Liste verschwindet.
  const saveQuestionAnswer = (reqId, question, answer) => {
    const updatedFaq = [...faq, { question, answer }];
    return apiFetch(`/api/restaurants/${current.id}/settings`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ knowledge_base: knowledgeBase, opening_hours: hours, faq: updatedFaq }),
    })
      .then((r) => (r.ok ? r : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(() => apiFetch(`/api/callback-requests/${reqId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'answered' }),
      }))
      .then(() => {
        setFaq(updatedFaq);
        setOpenQuestions((qs) => qs.filter((q) => q.id !== reqId));
      });
  };

  return (
    <>
      <div className="settings-section">
        <h2>{t('settings.openQuestionsTitle')}</h2>
        {openQuestionsError && <p className="error">{openQuestionsError}</p>}
        {openQuestions.length === 0 ? (
          <p className="hint">{t('settings.noOpenQuestions')}</p>
        ) : (
          openQuestions.map((q) => <OpenQuestionRow key={q.id} question={q} onSave={saveQuestionAnswer} />)
        )}
      </div>

      <div className="settings-section">
        <h2>{t('settings.knowledgeBaseTitle')}</h2>
        <textarea
          rows={10}
          style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.92rem' }}
          value={knowledgeBase}
          onChange={(e) => setKnowledgeBase(e.target.value)}
          placeholder={t('settings.knowledgeBasePlaceholder')}
        />
      </div>

      <div className="settings-section">
        <h2>{t('settings.openingHoursTitle')}</h2>
        {WEEKDAY_KEYS.map((key) => (
          <div className="hours-row" key={key}>
            <label>{t(`weekday.${key}`)}</label>
            <input
              value={hours[key] || ''}
              onChange={(e) => setHours((h) => ({ ...h, [key]: e.target.value }))}
              placeholder={t('settings.openingHoursPlaceholder')}
            />
          </div>
        ))}
      </div>

      <div className="settings-section">
        <h2>{t('settings.faqTitle')}</h2>
        {faq.map((item, i) => (
          <div className="faq-row" key={i}>
            <input
              placeholder={t('settings.faqQuestionPlaceholder')}
              value={item.question}
              onChange={(e) => updateFaqItem(i, 'question', e.target.value)}
            />
            <input
              placeholder={t('settings.faqAnswerPlaceholder')}
              value={item.answer}
              onChange={(e) => updateFaqItem(i, 'answer', e.target.value)}
            />
            <button type="button" className="link" onClick={() => removeFaqItem(i)}>{t('settings.faqRemove')}</button>
          </div>
        ))}
        <button type="button" className="link" onClick={addFaqItem}>{t('settings.faqAdd')}</button>
      </div>

      <form className="settings-section" onSubmit={saveContent}>
        {contentMsg && <p className={contentMsg.ok ? 'hint' : 'error'}>{contentMsg.text}</p>}
        <button className="primary" type="submit" disabled={savingContent}>
          {t('settings.saveContent')}
        </button>
      </form>

      <form className="access-form settings-section" onSubmit={saveCredentials}>
        <strong>{t('settings.credentialsTitle')}</strong>
        <label>{t('settings.loginEmailLabel')}
          <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
        </label>
        {!isAdmin && (
          <label>{t('settings.currentPasswordLabel')}
            <input type="password" value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)} placeholder={t('settings.currentPasswordPlaceholder')} />
          </label>
        )}
        <label>{t('settings.newPasswordLabel')}
          <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>
        {credsMsg && <p className={credsMsg.ok ? 'hint' : 'error'}>{credsMsg.text}</p>}
        <button className="primary" type="submit" disabled={savingCreds}>{t('settings.saveCredentials')}</button>
      </form>
    </>
  );
}

// ---------------------------------------------------------------- shell
// label/Titel kommen jetzt aus i18n (t('nav.<id>')/t('pageTitle.<id>')) statt
// hier hartcodiert zu stehen — id bleibt die stabile Referenz.
const NAV = [
  { id: 'overview', icon: '📊' },
  { id: 'calendar', icon: '📅' },
  { id: 'reservations', icon: '🍽️' },
  { id: 'orders', icon: '🛍️' },
  { id: 'calls', icon: '📞' },
  { id: 'audit', icon: '📋' },
  { id: 'reco', icon: '💡' },
  { id: 'settings', icon: '⚙️' },
  { id: 'customers', icon: '🏢', divider: true, adminOnly: true },
  { id: 'leads', icon: '📥', adminOnly: true },
  { id: 'system', icon: '🛠️', adminOnly: true },
];

export default function App() {
  const { t } = useI18n();
  const [auth, setAuth] = useState(loadAuth);
  const [view, setView] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const isAdmin = auth?.role === 'admin';
  const [detail, setDetail] = useState(null);

  const setupToken = useMemo(() => new URLSearchParams(window.location.search).get('setup'), []);

  const { data: restaurants } = useFetch(auth ? '/api/restaurants' : null, refreshKey);
  const [restaurantId, setRestaurantId] = useState(null);

  // Notification-Zähler: neue Reservierungen/Bestellungen/Anrufe seit dem
  // letzten Besuch der jeweiligen Seite (Zeitstempel lokal im Browser
  // gespeichert, pro Betrieb + Ansicht).
  const { data: navReservations } = useFetch(
    restaurantId != null ? `/api/reservations?restaurant_id=${restaurantId}` : null, refreshKey,
  );
  const { data: navOrders } = useFetch(
    restaurantId != null ? `/api/orders?restaurant_id=${restaurantId}` : null, refreshKey,
  );
  const { data: navCalls } = useFetch(
    restaurantId != null ? `/api/calls?restaurant_id=${restaurantId}` : null, refreshKey,
  );

  useEffect(() => {
    if (restaurantId == null) return;
    ['reservations', 'orders', 'calls'].forEach((v) => {
      const key = `kiworks-lastseen-${restaurantId}-${v}`;
      if (localStorage.getItem(key) == null) localStorage.setItem(key, String(Date.now()));
    });
  }, [restaurantId]);

  const countNew = (items, viewId) => {
    if (!items || restaurantId == null) return 0;
    const lastSeen = Number(localStorage.getItem(`kiworks-lastseen-${restaurantId}-${viewId}`)) || Date.now();
    return items.filter((item) => new Date(item.created_at).getTime() > lastSeen).length;
  };
  const unseenCounts = {
    reservations: countNew(navReservations, 'reservations'),
    orders: countNew(navOrders, 'orders'),
    calls: countNew(navCalls, 'calls'),
  };
  const markSeen = (viewId) => {
    if (restaurantId == null) return;
    localStorage.setItem(`kiworks-lastseen-${restaurantId}-${viewId}`, String(Date.now()));
  };

  useEffect(() => {
    if (!auth) return;
    if (auth.role === 'customer') setRestaurantId(auth.restaurant_id);
    else if (restaurants?.length && restaurantId == null) setRestaurantId(restaurants[0].id);
  }, [auth, restaurants, restaurantId]);

  useEffect(() => {
    if (!auth) return undefined;
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [auth, refresh]);

  if (setupToken) {
    return <SetupPassword token={setupToken} onDone={() => { window.location.href = '/dashboard/'; }} />;
  }

  if (!auth) return <Login onLogin={setAuth} />;

  const logout = () => { clearAuth(); setAuth(null); setView('overview'); };

  if (auth.role === 'customer' && restaurants && !restaurants[0]?.terms_accepted_at) {
    return (
      <ConsentGate
        restaurantName={restaurants[0]?.name || auth.name}
        onAccepted={refresh}
        onLogout={logout}
      />
    );
  }

  const current = restaurants?.find((r) => String(r.id) === String(restaurantId));
  // Kalender/Reservierungen/Bestellungen nur zeigen, wenn die orders-Rolle
  // aktiv ist — sonst sehen Support-only-Kunden (z. B. LEDTEK, pixelpress)
  // dauerhaft leere Tabs. Ohne geladene Daten/enabled_roles (Altbestand)
  // bewusst weiter anzeigen, damit sich bestehende Kunden nicht ändern.
  const ordersRoleActive = !current?.enabled_roles || current.enabled_roles.includes('orders');
  const nav = NAV.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (['calendar', 'reservations', 'orders'].includes(item.id) && !ordersRoleActive) return false;
    return true;
  });
  const noPicker = ['customers', 'leads', 'system'].includes(view);

  const openDetail = (type, data) => setDetail({ type, data });
  const closeDetail = () => setDetail(null);
  const changeDetailStatus = (type, id, status) => {
    const url = type === 'reservation' ? `/api/reservations/${id}` : `/api/orders/${id}`;
    apiFetch(url, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(() => { refresh(); closeDetail(); });
  };
  const openRestaurant = (id) => { setRestaurantId(id); setView('overview'); };

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
            <div className="kiwo-presence-name">Kiwo</div>
            <div className="kiwo-presence-status">{t('sidebar.kiwoStatus')}</div>
          </div>
        </div>

        {!isAdmin && <div className="customer-name-box">{auth.name}</div>}

        <nav>
          {nav.map((item) => (
            <React.Fragment key={item.id}>
              {item.divider && <hr className="nav-divider" />}
              <button
                className={view === item.id ? 'active' : ''}
                onClick={() => { setView(item.id); markSeen(item.id); }}
              >
                <span className="nav-icon">{item.icon}</span> {t(`nav.${item.id}`)}
                {!!unseenCounts[item.id] && <span className="nav-badge">{unseenCounts[item.id]}</span>}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-actions">
          <button className="refresh" onClick={refresh}>⟳ {t('sidebar.refresh')}</button>
          <ThemeToggle />
          <LanguageToggle />
          <button className="refresh" onClick={logout}>{t('sidebar.logout')} ({isAdmin ? t('sidebar.operator') : auth.name})</button>
          <a className="site-link" href="/">← {t('sidebar.backToWebsite')}</a>
        </div>
      </aside>

      <main>
        <header className="main-head">
          <div className="main-head-top">
            <h1>{t(`pageTitle.${view}`)}</h1>
            {!noPicker && current && <span className="current-name">{current.name}</span>}
          </div>
          {isAdmin && !noPicker && restaurants && (
            <BusinessPicker restaurants={restaurants} restaurantId={restaurantId} onSelect={setRestaurantId} />
          )}
        </header>
        {restaurantId == null && !noPicker ? <p>{t('common.loading')}</p> : (
          <>
            {view === 'overview' && (
              <Overview restaurantId={restaurantId} refreshKey={refreshKey} onNavigate={setView} />
            )}
            {view === 'calendar' && (
              <WeekCalendar restaurantId={restaurantId} refreshKey={refreshKey} onOpenDetail={openDetail} />
            )}
            {view === 'reservations' && (
              <Reservations
                restaurantId={restaurantId} refreshKey={refreshKey}
                onChanged={refresh} onOpenDetail={openDetail}
              />
            )}
            {view === 'orders' && (
              <Orders
                restaurantId={restaurantId} refreshKey={refreshKey}
                onChanged={refresh} onOpenDetail={openDetail}
              />
            )}
            {view === 'calls' && (
              <Calls restaurantId={restaurantId} refreshKey={refreshKey} onOpenDetail={openDetail} />
            )}
            {view === 'audit' && (
              <AuditLog restaurantId={restaurantId} refreshKey={refreshKey} />
            )}
            {view === 'reco' && <Recommendations restaurantId={restaurantId} />}
            {view === 'settings' && (
              <Settings restaurantId={restaurantId} isAdmin={isAdmin} />
            )}
            {view === 'customers' && isAdmin && (
              <Customers refreshKey={refreshKey} onChanged={refresh} onOpenRestaurant={openRestaurant} />
            )}
            {view === 'leads' && isAdmin && (
              <Leads refreshKey={refreshKey} onChanged={refresh} onOpenRestaurant={openRestaurant} />
            )}
            {view === 'system' && isAdmin && <SystemStatus refreshKey={refreshKey} />}
          </>
        )}
      </main>
      <DetailModal
        item={detail} onClose={closeDetail}
        onStatusChange={changeDetailStatus} onOpenDetail={openDetail}
      />
    </div>
  );
}
