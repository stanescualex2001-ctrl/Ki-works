import React, { useEffect, useState, useCallback, useMemo, useId } from 'react';

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
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true">
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
      <line x1="100" y1="60" x2="100" y2="45" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="40" r="9" fill="#67E8F9" opacity="0.45" filter={`url(#ob-blurB-${uid})`} />
      <circle cx="100" cy="40" r="4.4" fill="#ECFEFF" />
      <circle cx="100" cy="112" r="46" fill={`url(#ob-body-${uid})`} />
      <ellipse cx="83" cy="92" rx="20" ry="14" fill={`url(#ob-shine-${uid})`} opacity="0.8"
               filter={`url(#ob-blurB-${uid})`} transform="rotate(-18 83 92)" />
      <path d="M124 132 A46 46 0 0 1 96 157" fill="none" stroke="#4C1D95" strokeWidth="10"
            strokeLinecap="round" opacity="0.18" filter={`url(#ob-blurB-${uid})`} />
      <circle cx="86" cy="110" r="5.6" fill="#0B1220" />
      <circle cx="114" cy="110" r="5.6" fill="#0B1220" />
      <circle cx="88" cy="107.5" r="1.6" fill="#fff" />
      <circle cx="116" cy="107.5" r="1.6" fill="#fff" />
      <path d="M87 126 Q100 136 113 126" fill="none" stroke="#0B1220" strokeWidth="4.2" strokeLinecap="round" />
    </svg>
  );
}

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('de-AT', { dateStyle: 'medium', timeStyle: 'short' }) : '–';
const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' }) : '–';
const AUTH_KEY = 'kiworks-auth';

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
function openRecording(callId) {
  const win = window.open('', '_blank');
  apiFetch(`/api/calls/${callId}/recording`)
    .then((r) => r.json())
    .then((d) => {
      if (d.url && win) win.location.href = d.url;
      else { win?.close(); alert(d.error || 'Aufnahme nicht verfügbar (evtl. abgelaufen).'); }
    })
    .catch(() => { win?.close(); alert('Aufnahme nicht verfügbar.'); });
}

function useFetch(url, refreshKey) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!url) return undefined;
    let alive = true;
    setData(null);
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
        <p className="login-sub">Ihr KI-Telefonassistent — Anmeldung</p>
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
      </form>
    </div>
  );
}

// DSGVO: Pflicht-Zustimmung beim ersten Login eines Kunden-Zugangs.
function ConsentGate({ restaurantName, onAccepted, onLogout }) {
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
        <p className="login-sub">Bevor es losgeht, {restaurantName}</p>
        <p>
          Bevor Sie das Dashboard nutzen können, benötigen wir Ihre Zustimmung zur
          Verarbeitung der Gästedaten (Reservierungen, Bestellungen, Anrufprotokolle)
          im Rahmen unserer{' '}
          <a href="/datenschutz.html" target="_blank" rel="noreferrer">Datenschutzerklärung</a>{' '}
          und der damit verbundenen Auftragsverarbeitung.
        </p>
        <label className="consent-checkbox">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          Ich habe die Datenschutzerklärung gelesen und stimme der Verarbeitung der
          Gästedaten gemäß Auftragsverarbeitung zu.
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={!checked || saving} onClick={confirm}>
          {saving ? 'Wird gespeichert…' : 'Bestätigen und fortfahren'}
        </button>
        <button type="button" className="link-strong" onClick={onLogout}>Abmelden</button>
      </div>
    </div>
  );
}

// Öffentliche Seite: Kunde setzt sein eigenes Passwort über den Einladungslink.
function SetupPassword({ token, onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [state, setState] = useState({ loading: false, error: null, success: false });

  const submit = (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setState({ loading: false, error: 'Mindestens 8 Zeichen.', success: false });
      return;
    }
    if (password !== confirm) {
      setState({ loading: false, error: 'Passwörter stimmen nicht überein.', success: false });
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
        <p className="login-sub">Ihr Passwort festlegen</p>
        {state.success ? (
          <>
            <p>✅ Passwort gespeichert. Sie können sich jetzt anmelden.</p>
            <button className="primary" onClick={onDone}>Zur Anmeldung</button>
          </>
        ) : (
          <form onSubmit={submit}>
            <label htmlFor="su-pw">Neues Passwort</label>
            <input id="su-pw" type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)} />
            <label htmlFor="su-pw2">Passwort wiederholen</label>
            <input id="su-pw2" type="password" required value={confirm}
              onChange={(e) => setConfirm(e.target.value)} />
            {state.error && <p className="error">{state.error}</p>}
            <button className="primary" type="submit" disabled={state.loading}>
              {state.loading ? 'Speichern…' : 'Passwort speichern'}
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
  return (
    <section>
      <h2>{title}</h2>
      <div className="stat-grid">
        <StatCard label="Anrufe" value={row?.calls} onClick={onNavigate && (() => onNavigate('calls'))} />
        <StatCard
          label="Reservierungen" value={row?.reservations}
          onClick={onNavigate && (() => onNavigate('reservations'))}
        />
        <StatCard
          label="davon telefonisch (KI)" value={row?.phone_reservations}
          onClick={onNavigate && (() => onNavigate('reservations'))}
        />
        <StatCard label="Gäste" value={row?.guests} onClick={onNavigate && (() => onNavigate('reservations'))} />
        <StatCard label="Bestellungen" value={row?.orders} onClick={onNavigate && (() => onNavigate('orders'))} />
      </div>
    </section>
  );
}

// Ersparnis-Kachel: echte Anruf-Zahlen seit dem ersten Anruf (= Live-Start bei
// diesem Kunden), nicht nur die letzten 7 Tage — zeigt die kumulierte Wirkung.
function RoiTile({ totalCalls, firstCallAt }) {
  const minutesPerCall = 4;
  const hourlyCost = 42;
  const hours = ((totalCalls || 0) * minutesPerCall) / 60;
  const euros = Math.round(hours * hourlyCost);
  const daysLive = firstCallAt
    ? Math.max(1, Math.ceil((Date.now() - new Date(firstCallAt).getTime()) / 86400000))
    : null;
  return (
    <section className="roi-tile">
      <div className="roi-tile-label">
        Von Kiwo übernommen{daysLive ? ` — seit ${daysLive} ${daysLive === 1 ? 'Tag' : 'Tagen'} live` : ''}
      </div>
      <div className="roi-tile-values">
        <span className="roi-tile-value">{hours.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Std</span>
        <span className="roi-tile-value">{euros.toLocaleString('de-DE')} €</span>
      </div>
      <div className="roi-tile-note">
        Basis: {totalCalls || 0} Anrufe × {minutesPerCall} Min. manuelle Bearbeitungszeit × Ø {hourlyCost} €/Std Vollkosten
        (Gehalt, Lohnnebenkosten &amp; Overhead)
      </div>
    </section>
  );
}

function Overview({ restaurantId, refreshKey, onNavigate }) {
  const { data: daily } = useFetch('/api/stats/daily/by-restaurant', refreshKey);
  const { data: weekly } = useFetch('/api/stats/weekly/by-restaurant', refreshKey);
  const pick = (rows) => rows?.find((r) => String(r.restaurant_id) === String(restaurantId));
  return (
    <>
      <StatRow title="Heute" row={pick(daily)} onNavigate={onNavigate} />
      <StatRow title="Letzte 7 Tage" row={pick(weekly)} onNavigate={onNavigate} />
      <RoiTile totalCalls={pick(weekly)?.total_calls} firstCallAt={pick(weekly)?.first_call_at} />
    </>
  );
}

// Zeigt alle Felder einer Reservierung/Bestellung/eines Anrufs + Status-Änderung.
function DetailModal({ item, onClose, onStatusChange, onOpenDetail }) {
  if (!item) return null;
  const { type, data } = item;

  if (type === 'call') {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose} aria-label="Schließen">×</button>
          <h2>📞 Anruf</h2>
          <dl className="detail-list">
            <dt>Nummer</dt><dd>{data.caller_number || 'Unbekannt'}</dd>
            <dt>Zeit</dt><dd>{fmtDateTime(data.started_at || data.created_at)}</dd>
            <dt>Dauer</dt><dd>{data.duration_seconds != null ? `${Math.round(data.duration_seconds / 60)} min` : '–'}</dd>
            <dt>Ergebnis</dt><dd><span className={`badge badge-${data.outcome}`}>{data.outcome || '–'}</span></dd>
            <dt>Zusammenfassung</dt><dd>{data.summary || '–'}</dd>
            {data.callback_topic && (
              <><dt>Rückruf gewünscht</dt><dd><span className="badge badge-callback">📞 {data.callback_topic}</span></dd></>
            )}
          </dl>
          {data.linkedReservation && (
            <p>
              <button
                className="link"
                onClick={() => onOpenDetail('reservation', data.linkedReservation)}
              >
                🍽️ Verknüpfte Reservierung ansehen
              </button>
            </p>
          )}
          {data.linkedOrder && (
            <p>
              <button className="link" onClick={() => onOpenDetail('order', data.linkedOrder)}>
                🛍️ Verknüpfte Bestellung ansehen
              </button>
            </p>
          )}
          {data.recording_url && (
            <p><button type="button" className="link" onClick={() => openRecording(data.id)}>Aufnahme anhören</button></p>
          )}
          <label className="side-label" htmlFor="detail-transcript">Transkript</label>
          <div className="transcript-box" id="detail-transcript">{data.transcript || 'Kein Transkript verfügbar.'}</div>
        </div>
      </div>
    );
  }

  const isReservation = type === 'reservation';
  const statusMap = isReservation ? STATUS_LABELS : ORDER_STATUS;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Schließen">×</button>
        <h2>{isReservation ? '🍽️ Reservierung' : '🛍️ Bestellung'}</h2>
        <dl className="detail-list">
          <dt>Name</dt><dd>{data.customer_name}</dd>
          <dt>Telefon</dt><dd>{data.customer_phone || '–'}</dd>
          {isReservation ? (
            <>
              <dt>Zeit</dt><dd>{fmtDateTime(data.reserved_at)}</dd>
              <dt>Personen</dt><dd>{data.party_size}</dd>
            </>
          ) : (
            <>
              <dt>Bestellung</dt><dd>{data.items}</dd>
              <dt>Abholzeit</dt><dd>{data.requested_at ? fmtDateTime(data.requested_at) : '–'}</dd>
            </>
          )}
          <dt>Quelle</dt><dd>{data.source === 'phone' ? '📞 Telefon' : 'Dashboard'}</dd>
          <dt>Notizen</dt><dd>{data.notes || '–'}</dd>
          <dt>Eingegangen</dt><dd>{fmtDateTime(data.created_at)}</dd>
        </dl>
        <label className="side-label" htmlFor="detail-status">Status</label>
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
        type="text" className="business-picker-input" placeholder="🔍 Betrieb suchen…"
        autoComplete="off" value={text}
        onFocus={(e) => { setOpen(true); e.target.select(); }}
        onChange={(e) => { setText(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => {
          setOpen(false);
          if (current) setText(current.name);
        }, 150)}
      />
      {open && (
        <ul className="business-picker-list">
          {matches.length === 0 && <li className="business-picker-empty">Keine Treffer</li>}
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

const STATUS_LABELS = {
  confirmed: 'Bestätigt', cancelled: 'Storniert', no_show: 'Nicht erschienen', completed: 'Abgeschlossen',
};

function Reservations({ restaurantId, refreshKey, onChanged, onOpenDetail }) {
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

  if (error) return <p className="error">Fehler: {error}</p>;
  if (!reservations) return <p>Lade…</p>;
  if (!reservations.length) return <p>Noch keine Reservierungen.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Datum/Zeit</th><th>Name</th><th>Telefon</th><th>Pers.</th><th>Quelle</th><th>Status</th><th>Notizen</th><th></th></tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr
              key={r.id} className={`clickable-row${r.status === 'cancelled' ? ' muted' : ''}`}
              onClick={() => onOpenDetail('reservation', r)}
            >
              <td>{fmtDateTime(r.reserved_at)}</td>
              <td>{r.customer_name}</td>
              <td>{r.customer_phone || '–'}</td>
              <td>{r.party_size}</td>
              <td>{r.source === 'phone' ? '📞 Telefon' : 'Dashboard'}</td>
              <td><span className={`badge badge-${r.status}`}>{STATUS_LABELS[r.status] || r.status}</span></td>
              <td>{r.notes || ''}</td>
              <td>
                {r.status === 'confirmed' && (
                  <button
                    className="link"
                    onClick={(e) => { e.stopPropagation(); setStatus(r.id, 'cancelled'); }}
                  >
                    Stornieren
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
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const { data: reservations } = useFetch(`/api/reservations?restaurant_id=${restaurantId}`, refreshKey);
  const { data: orders } = useFetch(`/api/orders?restaurant_id=${restaurantId}`, refreshKey);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
  }), [weekStart]);
  const hours = useMemo(() => Array.from({ length: 16 }, (_, i) => i + 8), []); // 08–23 Uhr

  const weekEnd = useMemo(() => { const e = new Date(weekStart); e.setDate(e.getDate() + 7); return e; }, [weekStart]);
  const inWeek = (iso) => { if (!iso) return false; const t = new Date(iso); return t >= weekStart && t < weekEnd; };
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
    return `${weekStart.toLocaleDateString('de-AT', opts)}–${end.toLocaleDateString('de-AT', { ...opts, year: 'numeric' })}`;
  };
  const shiftWeek = (delta) => setWeekStart((s) => { const n = new Date(s); n.setDate(n.getDate() + delta * 7); return n; });
  const loading = !reservations || !orders;

  return (
    <>
      <div className="toolbar">
        <button className="link" onClick={() => shiftWeek(-1)}>← Vorherige</button>
        <strong>{rangeLabel()}</strong>
        <button className="link" onClick={() => shiftWeek(1)}>Nächste →</button>
        <button className="link" onClick={() => setWeekStart(mondayOf(new Date()))}>Heute</button>
      </div>
      {loading ? <p>Lade…</p> : (
        <div className="table-wrap">
          <div className="week-grid">
            <div className="week-cell week-corner" />
            {days.map((d, i) => (
              <div className="week-cell week-day-head" key={i}>
                {d.toLocaleDateString('de-AT', { weekday: 'short', day: '2-digit', month: '2-digit' })}
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
                          🍽️ {r.customer_name} ({r.party_size})
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
      <p className="hint">Klick auf einen Eintrag zeigt alle Details und erlaubt eine Status-Änderung.</p>
    </>
  );
}

function Calls({ restaurantId, refreshKey, onOpenDetail }) {
  const { data: calls, error } = useFetch(`/api/calls?restaurant_id=${restaurantId}`, refreshKey);
  const { data: reservations } = useFetch(`/api/reservations?restaurant_id=${restaurantId}`, refreshKey);
  const { data: orders } = useFetch(`/api/orders?restaurant_id=${restaurantId}`, refreshKey);

  if (error) return <p className="error">Fehler: {error}</p>;
  if (!calls) return <p>Lade…</p>;
  if (!calls.length) return <p>Noch keine Anrufe.</p>;

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
              <strong>{c.caller_number || 'Unbekannte Nummer'}</strong>
              <span>{fmtDateTime(c.started_at || c.created_at)}</span>
              {c.duration_seconds != null && <span>{Math.round(c.duration_seconds / 60)} min</span>}
              <span className={`badge badge-${c.outcome}`}>{c.outcome || '–'}</span>
              {c.callback_topic && <span className="badge badge-callback">📞 Rückruf gewünscht</span>}
            </div>
            {c.summary && <p className="call-summary">{c.summary}</p>}
            <div className="call-actions">
              {c.recording_url && (
                <button
                  type="button"
                  className="link"
                  onClick={(e) => { e.stopPropagation(); openRecording(c.id); }}
                >
                  Aufnahme anhören
                </button>
              )}
              {res && (
                <button
                  className="link"
                  onClick={(e) => { e.stopPropagation(); onOpenDetail('reservation', res); }}
                >
                  🍽️ Reservierung ansehen
                </button>
              )}
              {ord && (
                <button className="link" onClick={(e) => { e.stopPropagation(); onOpenDetail('order', ord); }}>
                  🛍️ Bestellung ansehen
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
      <p>Claude analysiert die Zahlen der letzten 7 Tage und gibt konkrete Tipps für diesen Betrieb.</p>
      <button className="primary" onClick={generate} disabled={state.loading}>
        {state.loading ? 'Claude denkt nach…' : 'Empfehlungen generieren'}
      </button>
      {state.error && <p className="error">Fehler: {state.error}</p>}
      {state.text && <div className="reco-box">{state.text}</div>}
    </>
  );
}

// Zugangs-Formular für einen Kunden (nur Betreiber).
function AccessForm({ restaurant, onDone, onCancel }) {
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
      <strong>Login für „{restaurant.name}"</strong>
      <label>Login-E-Mail
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>Passwort {restaurant.login_email ? '(leer = unverändert)' : ''}
        <input type="text" value={password} onChange={(e) => setPassword(e.target.value)}
          required={!restaurant.login_email} placeholder="Neues Passwort" />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="form-row">
        <button className="primary" type="submit" disabled={saving}>Speichern</button>
        <button type="button" className="link" onClick={onCancel}>Abbrechen</button>
      </div>
    </form>
  );
}

// Formular zum Anlegen eines neuen Kunden (nur Betreiber).
function NewCustomerForm({ onDone, onCancel }) {
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [vapiNumber, setVapiNumber] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

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
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        onDone();
      })
      .catch((err) => { setError(err.message); setSaving(false); });
  };

  return (
    <form className="access-form" onSubmit={save}>
      <strong>Neuen Kunden anlegen</strong>
      <label>Name*
        <input required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>Kontakt-E-Mail
        <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
      </label>
      <label>Kontakt-Telefon
        <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
      </label>
      <label>KI-Telefonnummer (falls schon vorhanden)
        <input value={vapiNumber} onChange={(e) => setVapiNumber(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <div className="form-row">
        <button className="primary" type="submit" disabled={saving}>Anlegen</button>
        <button type="button" className="link" onClick={onCancel}>Abbrechen</button>
      </div>
    </form>
  );
}

function Customers({ refreshKey, onChanged, onOpenRestaurant }) {
  const { data: daily } = useFetch('/api/stats/daily/by-restaurant', refreshKey);
  const { data: weekly } = useFetch('/api/stats/weekly/by-restaurant', refreshKey);
  const { data: restaurants } = useFetch('/api/restaurants', refreshKey);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);

  const sendInvite = (id) => {
    setInviteMsg('Wird gesendet…');
    apiFetch(`/api/restaurants/${id}/invite`, { method: 'POST' })
      .then((r) => (r.ok ? setInviteMsg('✅ Einladung gesendet') : setInviteMsg('Fehler beim Senden')))
      .catch(() => setInviteMsg('Fehler beim Senden'));
  };

  if (!daily || !weekly || !restaurants) return <p>Lade…</p>;
  const weekOf = (id) => weekly.find((w) => w.restaurant_id === id) || {};
  const info = (id) => restaurants.find((r) => r.id === id) || {};
  const q = search.trim().toLowerCase();
  const rows = daily.filter((d) => {
    if (!q) return true;
    const r = info(d.restaurant_id);
    return [d.name, d.contact_email, r.login_email, r.address]
      .some((v) => (v || '').toLowerCase().includes(q));
  });

  return (
    <>
      <p>Alle Kennzahlen deiner Geschäftskunden auf einen Blick — dein Bericht, ohne E-Mail-Flut.</p>
      <div className="toolbar">
        <input
          type="search" className="search" placeholder="🔍 Kunde suchen…"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <span className="hint">{rows.length} von {daily.length} Kunden</span>
        <button className="primary" onClick={() => setAdding(true)}>+ Neuer Kunde</button>
      </div>
      {inviteMsg && <p className="hint">{inviteMsg}</p>}
      {adding && (
        <NewCustomerForm
          onCancel={() => setAdding(false)}
          onDone={() => { setAdding(false); onChanged(); }}
        />
      )}
      {editing && (
        <AccessForm
          restaurant={info(editing)}
          onCancel={() => setEditing(null)}
          onDone={() => { setEditing(null); onChanged(); }}
        />
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kunde</th><th>Login</th><th>KI-Nummer</th>
              <th>Anrufe heute</th><th>Res. heute</th>
              <th>Anrufe 7 T</th><th>Res. 7 T</th><th>Gäste 7 T</th><th></th>
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
                  <td>{r.login_email || <span className="warn-text">kein Zugang</span>}</td>
                  <td>{r.vapi_phone_number || '–'}</td>
                  <td>{d.calls}</td>
                  <td>{d.reservations}</td>
                  <td>{w.calls ?? '–'}</td>
                  <td>{w.reservations ?? '–'}</td>
                  <td>{w.guests ?? '–'}</td>
                  <td className="lead-actions">
                    <button className="link" onClick={() => setEditing(d.restaurant_id)}>
                      {r.login_email ? 'Zugang ändern' : 'Zugang anlegen'}
                    </button>
                    <button className="link" onClick={() => sendInvite(d.restaurant_id)}>
                      Einladung senden
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

const ORDER_STATUS = {
  new: '🆕 Neu', in_progress: '👨‍🍳 In Arbeit', ready: '✅ Abholbereit',
  completed: '📦 Abgeschlossen', cancelled: '❌ Storniert',
};

function Orders({ restaurantId, refreshKey, onChanged, onOpenDetail }) {
  const { data: orders, error } = useFetch(`/api/orders?restaurant_id=${restaurantId}`, refreshKey);
  const setStatus = (id, status) => {
    apiFetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(onChanged);
  };
  if (error) return <p className="error">Fehler: {error}</p>;
  if (!orders) return <p>Lade…</p>;
  if (!orders.length) return <p>Noch keine Bestellungen.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Eingegangen</th><th>Name</th><th>Telefon</th><th>Bestellung</th><th>Abholzeit</th><th>Notizen</th><th>Status</th></tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id} className={`clickable-row${['completed', 'cancelled'].includes(o.status) ? ' muted' : ''}`}
              onClick={() => onOpenDetail('order', o)}
            >
              <td>{fmtDateTime(o.created_at)}</td>
              <td><strong>{o.customer_name}</strong></td>
              <td>{o.customer_phone || '–'}</td>
              <td>{o.items}</td>
              <td>{o.requested_at ? fmtTime(o.requested_at) : '–'}</td>
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

const LEAD_STATUS = { new: '🆕 Neu', contacted: '📞 Kontaktiert', won: '✅ Gewonnen', lost: '❌ Verloren' };

function Leads({ refreshKey, onChanged, onOpenRestaurant }) {
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
  if (error) return <p className="error">Fehler: {error}</p>;
  if (!leads) return <p>Lade…</p>;
  if (!leads.length) return <p>Noch keine Anfragen über die Website.</p>;
  return (
    <>
      <p>Anfragen über das Formular auf ki-works.eu.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Eingegangen</th><th>Name</th><th>Betrieb</th><th>E-Mail</th><th>Telefon</th><th>Nachricht</th><th>Status</th></tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className={['won', 'lost'].includes(l.status) ? 'muted' : ''}>
                <td>{fmtDateTime(l.created_at)}</td>
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
                      Zum Kunden →
                    </button>
                  ) : (
                    <button className="link" disabled={converting === l.id} onClick={() => convert(l.id)}>
                      {converting === l.id ? 'Wird umgewandelt…' : 'In Kunde umwandeln & einladen'}
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
  const cls = ok === true ? 'ok' : ok === false ? 'problem' : 'unknown';
  const text = ok === true ? 'OK' : ok === false ? 'Problem' : 'Unbekannt';
  return (
    <div className={`status-tile status-${cls}`}>
      <div className="status-label">{label}</div>
      <div className="status-value">{text}</div>
      {detail != null && <div className="status-detail">{detail}</div>}
    </div>
  );
}

function fmtUptime(seconds) {
  if (seconds == null) return '–';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

// Admin-Ansicht: Server-Gesundheit (live geprüft) + Fehlerprotokoll.
// Erkennt nur Probleme, die auftreten, während der Backend-Prozess selbst noch
// läuft (DB/n8n nicht erreichbar, Platte voll, SSL läuft ab, Backup fehlt) —
// einen kompletten Server-Ausfall kann dieser Check naturgemäß nicht melden.
function SystemStatus({ refreshKey }) {
  const { data: status, error } = useFetch('/api/admin/system-status', refreshKey);
  const { data: errors } = useFetch('/api/admin/errors?limit=50', refreshKey);

  if (error) return <p className="error">Fehler: {error}</p>;
  if (!status) return <p>Lade…</p>;

  return (
    <>
      <div className="stat-grid">
        <StatusTile label="Datenbank" ok={status.db.ok} detail={status.db.detail} />
        <StatusTile label="n8n" ok={status.n8n.ok} detail={status.n8n.detail} />
        <StatusTile
          label="Festplatte"
          ok={status.disk.ok}
          detail={status.disk.percent != null ? `${status.disk.percent}% belegt` : status.disk.detail}
        />
        <StatusTile
          label="SSL-Zertifikat"
          ok={status.ssl.ok}
          detail={status.ssl.daysLeft != null ? `noch ${status.ssl.daysLeft} Tage` : status.ssl.detail}
        />
        <StatusTile
          label="Letztes Backup"
          ok={status.backup.ok}
          detail={status.backup.hoursAgo != null ? `vor ${status.backup.hoursAgo}h (${status.backup.file})` : status.backup.detail}
        />
        <StatusTile label="Backend-Laufzeit" ok={true} detail={fmtUptime(status.uptimeSeconds)} />
      </div>
      <p className="muted">Zuletzt geprüft: {fmtDateTime(status.checkedAt)}</p>

      <h2>Fehlerprotokoll (letzte 30 Tage)</h2>
      {!errors?.length ? <p>Keine Einträge.</p> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Zeit</th><th>Stufe</th><th>Quelle</th><th>Meldung</th></tr>
            </thead>
            <tbody>
              {errors.map((e) => (
                <tr key={e.id}>
                  <td>{fmtDateTime(e.created_at)}</td>
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

const WEEKDAYS = [
  ['mon', 'Montag'], ['tue', 'Dienstag'], ['wed', 'Mittwoch'], ['thu', 'Donnerstag'],
  ['fri', 'Freitag'], ['sat', 'Samstag'], ['sun', 'Sonntag'],
];

// Eine offene Kundenfrage mit eigenem Antwort-Feld + eigenem Speichern-Button
// (bewusst unabhängig vom großen Speisekarte/Öffnungszeiten/FAQ-Formular).
function OpenQuestionRow({ question, onSave }) {
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
      </div>
      <input
        placeholder="Antwort eintragen…"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button type="button" className="link" disabled={state.saving || !answer.trim()} onClick={save}>
        {state.saving ? 'Speichert…' : 'Speichern'}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </div>
  );
}

// Einstellungen: Speisekarte, Öffnungszeiten, FAQ und Zugangsdaten — für den
// Betreiber (nur eigener Betrieb) und den Admin (beliebiger, per BusinessPicker
// gewählter Betrieb) gleichermaßen nutzbar.
function Settings({ restaurantId, isAdmin }) {
  // Bewusst NICHT an den globalen 30s-Auto-Refresh gekoppelt: das würde
  // laufende Eingaben in den Feldern immer wieder zurücksetzen. Stattdessen
  // lädt diese Ansicht ihre Daten nur beim Öffnen bzw. Betrieb-Wechsel neu.
  const [current, setCurrent] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const [menu, setMenu] = useState('');
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
    setMenu(current.menu || '');
    setHours(current.opening_hours || {});
    setFaq(current.faq?.length ? current.faq : []);
    setLoginEmail(current.login_email || '');
    setCurrentPassword('');
    setNewPassword('');
    setContentMsg(null);
    setCredsMsg(null);
  }, [current?.id]);

  if (loadError) return <p className="error">{loadError}</p>;
  if (!current) return <p>Lade…</p>;

  const saveContent = (e) => {
    e.preventDefault();
    setSavingContent(true);
    setContentMsg(null);
    apiFetch(`/api/restaurants/${current.id}/settings`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ menu, opening_hours: hours, faq }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
        setContentMsg({ ok: true, text: 'Gespeichert.' });
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
        setCredsMsg({ ok: true, text: 'Gespeichert.' });
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
      body: JSON.stringify({ menu, opening_hours: hours, faq: updatedFaq }),
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
        <h2>Offene Fragen von Kunden</h2>
        {openQuestionsError && <p className="error">{openQuestionsError}</p>}
        {openQuestions.length === 0 ? (
          <p className="hint">Keine offenen Fragen.</p>
        ) : (
          openQuestions.map((q) => <OpenQuestionRow key={q.id} question={q} onSave={saveQuestionAnswer} />)
        )}
      </div>

      <div className="settings-section">
        <h2>Speisekarte</h2>
        <textarea
          rows={10}
          style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.92rem' }}
          value={menu}
          onChange={(e) => setMenu(e.target.value)}
          placeholder="z. B. Nr. 05 Pizza Salami — € 9,90 (Tomaten, Käse, Salami)"
        />
      </div>

      <div className="settings-section">
        <h2>Öffnungszeiten</h2>
        {WEEKDAYS.map(([key, label]) => (
          <div className="hours-row" key={key}>
            <label>{label}</label>
            <input
              value={hours[key] || ''}
              onChange={(e) => setHours((h) => ({ ...h, [key]: e.target.value }))}
              placeholder="11:00-22:00 · mit Pause: 11:00-14:00, 17:00-22:00 · oder geschlossen"
            />
          </div>
        ))}
      </div>

      <div className="settings-section">
        <h2>FAQ</h2>
        {faq.map((item, i) => (
          <div className="faq-row" key={i}>
            <input
              placeholder="Frage"
              value={item.question}
              onChange={(e) => updateFaqItem(i, 'question', e.target.value)}
            />
            <input
              placeholder="Antwort"
              value={item.answer}
              onChange={(e) => updateFaqItem(i, 'answer', e.target.value)}
            />
            <button type="button" className="link" onClick={() => removeFaqItem(i)}>Entfernen</button>
          </div>
        ))}
        <button type="button" className="link" onClick={addFaqItem}>+ Frage hinzufügen</button>
      </div>

      <form className="settings-section" onSubmit={saveContent}>
        {contentMsg && <p className={contentMsg.ok ? 'hint' : 'error'}>{contentMsg.text}</p>}
        <button className="primary" type="submit" disabled={savingContent}>
          Speisekarte, Öffnungszeiten & FAQ speichern
        </button>
      </form>

      <form className="access-form settings-section" onSubmit={saveCredentials}>
        <strong>Zugangsdaten</strong>
        <label>Login-E-Mail
          <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
        </label>
        {!isAdmin && (
          <label>Aktuelles Passwort
            <input type="password" value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)} placeholder="zur Bestätigung" />
          </label>
        )}
        <label>Neues Passwort (leer = unverändert)
          <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>
        {credsMsg && <p className={credsMsg.ok ? 'hint' : 'error'}>{credsMsg.text}</p>}
        <button className="primary" type="submit" disabled={savingCreds}>Zugangsdaten speichern</button>
      </form>
    </>
  );
}

// ---------------------------------------------------------------- shell
const NAV = [
  { id: 'overview', label: 'Übersicht', icon: '📊' },
  { id: 'calendar', label: 'Kalender', icon: '📅' },
  { id: 'reservations', label: 'Reservierungen', icon: '🍽️' },
  { id: 'orders', label: 'Bestellungen', icon: '🛍️' },
  { id: 'calls', label: 'Anrufe', icon: '📞' },
  { id: 'reco', label: 'KI-Empfehlungen', icon: '💡' },
  { id: 'settings', label: 'Einstellungen', icon: '⚙️' },
  { id: 'customers', label: 'Kunden (Betreiber)', icon: '🏢', divider: true, adminOnly: true },
  { id: 'leads', label: 'Anfragen', icon: '📥', adminOnly: true },
  { id: 'system', label: 'System', icon: '🛠️', adminOnly: true },
];

const TITLES = {
  overview: 'Übersicht', calendar: 'Kalender', reservations: 'Reservierungen',
  orders: 'Bestellungen', calls: 'Anrufe', reco: 'KI-Empfehlungen',
  settings: 'Einstellungen', customers: 'Kundenübersicht', leads: 'Anfragen',
  system: 'System-Status',
};

export default function App() {
  const [auth, setAuth] = useState(loadAuth);
  const [view, setView] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const isAdmin = auth?.role === 'admin';
  const [detail, setDetail] = useState(null);

  const setupToken = useMemo(() => new URLSearchParams(window.location.search).get('setup'), []);

  const { data: restaurants } = useFetch(auth ? '/api/restaurants' : null, refreshKey);
  const [restaurantId, setRestaurantId] = useState(null);

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
  const nav = NAV.filter((item) => !item.adminOnly || isAdmin);
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
            <div className="kiwo-presence-status">bereit</div>
          </div>
        </div>

        {!isAdmin && <div className="customer-name-box">{auth.name}</div>}

        <nav>
          {nav.map((item) => (
            <React.Fragment key={item.id}>
              {item.divider && <hr className="nav-divider" />}
              <button
                className={view === item.id ? 'active' : ''}
                onClick={() => setView(item.id)}
              >
                <span className="nav-icon">{item.icon}</span> {item.label}
              </button>
            </React.Fragment>
          ))}
        </nav>

        <button className="refresh" onClick={refresh}>⟳ Aktualisieren</button>
        <button className="refresh" onClick={logout}>Abmelden ({isAdmin ? 'Betreiber' : auth.name})</button>
        <a className="site-link" href="/">← Zur Website</a>
      </aside>

      <main>
        <header className="main-head">
          <div className="main-head-top">
            <h1>{TITLES[view]}</h1>
            {!noPicker && current && <span className="current-name">{current.name}</span>}
          </div>
          {isAdmin && !noPicker && restaurants && (
            <BusinessPicker restaurants={restaurants} restaurantId={restaurantId} onSelect={setRestaurantId} />
          )}
        </header>
        {restaurantId == null && !noPicker ? <p>Lade…</p> : (
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
