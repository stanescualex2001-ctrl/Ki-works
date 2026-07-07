import React, { useEffect, useState, useCallback, useMemo } from 'react';

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('de-AT', { dateStyle: 'medium', timeStyle: 'short' }) : '–';
const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' }) : '–';
const todayISO = () => new Date().toISOString().slice(0, 10);

const CAPACITY = 60; // Plätze gesamt (Runde 2: echte Tischverwaltung pro Betrieb)
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
          <img src="/logo.png" alt="" className="logo-img"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="logo-word">ki-works</span>
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
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- widgets
function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value ?? '–'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function StatRow({ title, row }) {
  return (
    <section>
      <h2>{title}</h2>
      <div className="stat-grid">
        <StatCard label="Anrufe" value={row?.calls} />
        <StatCard label="Reservierungen" value={row?.reservations} />
        <StatCard label="davon telefonisch (KI)" value={row?.phone_reservations} />
        <StatCard label="Gäste" value={row?.guests} />
      </div>
    </section>
  );
}

function Overview({ restaurantId, refreshKey }) {
  const { data: daily } = useFetch('/api/stats/daily/by-restaurant', refreshKey);
  const { data: weekly } = useFetch('/api/stats/weekly/by-restaurant', refreshKey);
  const pick = (rows) => rows?.find((r) => String(r.restaurant_id) === String(restaurantId));
  return (
    <>
      <StatRow title="Heute" row={pick(daily)} />
      <StatRow title="Letzte 7 Tage" row={pick(weekly)} />
    </>
  );
}

const STATUS_LABELS = {
  confirmed: 'Bestätigt', cancelled: 'Storniert', no_show: 'Nicht erschienen', completed: 'Abgeschlossen',
};

function Reservations({ restaurantId, refreshKey, onChanged }) {
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
            <tr key={r.id} className={r.status === 'cancelled' ? 'muted' : ''}>
              <td>{fmtDateTime(r.reserved_at)}</td>
              <td>{r.customer_name}</td>
              <td>{r.customer_phone || '–'}</td>
              <td>{r.party_size}</td>
              <td>{r.source === 'phone' ? '📞 Telefon' : 'Dashboard'}</td>
              <td><span className={`badge badge-${r.status}`}>{STATUS_LABELS[r.status] || r.status}</span></td>
              <td>{r.notes || ''}</td>
              <td>
                {r.status === 'confirmed' && (
                  <button className="link" onClick={() => setStatus(r.id, 'cancelled')}>Stornieren</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalendarDay({ restaurantId, refreshKey }) {
  const [date, setDate] = useState(todayISO());
  const { data: reservations } = useFetch(
    `/api/reservations?restaurant_id=${restaurantId}&date=${date}`, refreshKey,
  );
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []); // ganzer Tag
  const active = (reservations || []).filter((r) => r.status === 'confirmed');

  const occupancyAt = (hour) => {
    const slot = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`);
    return active
      .filter((r) => Math.abs(new Date(r.reserved_at) - slot) <= 90 * 60000)
      .reduce((sum, r) => sum + r.party_size, 0);
  };
  const startingAt = (hour) =>
    active.filter((r) => new Date(r.reserved_at).getHours() === hour);

  return (
    <>
      <div className="toolbar">
        <label htmlFor="cal-date">Tag:&nbsp;</label>
        <input id="cal-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <span className="cal-legend">
          <span className="dot dot-free" /> frei&nbsp;&nbsp;
          <span className="dot dot-busy" /> belegt
        </span>
      </div>
      {!reservations ? <p>Lade…</p> : (
        <div className="calendar">
          {hours.map((h) => {
            const occ = occupancyAt(h);
            const free = Math.max(0, CAPACITY - occ);
            const pct = Math.min(100, Math.round((occ / CAPACITY) * 100));
            return (
              <div className="cal-row" key={h}>
                <div className="cal-hour">{String(h).padStart(2, '0')}:00</div>
                <div className="cal-bar-track" title={`${occ} von ${CAPACITY} Plätzen belegt`}>
                  <div className="cal-bar" style={{ width: `${pct}%` }} />
                </div>
                <div className="cal-free">{free} Plätze frei</div>
                <div className="cal-entries">
                  {startingAt(h).map((r) => (
                    <span className="cal-chip" key={r.id} title={r.notes || ''}>
                      {fmtTime(r.reserved_at)} · {r.customer_name} ({r.party_size})
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="hint">Kapazität aktuell pauschal {CAPACITY} Plätze pro Zeitfenster — echte Tischverwaltung folgt.</p>
    </>
  );
}

function Calls({ restaurantId, refreshKey }) {
  const { data: calls, error } = useFetch(`/api/calls?restaurant_id=${restaurantId}`, refreshKey);
  if (error) return <p className="error">Fehler: {error}</p>;
  if (!calls) return <p>Lade…</p>;
  if (!calls.length) return <p>Noch keine Anrufe.</p>;
  return (
    <div className="call-list">
      {calls.map((c) => (
        <div className="call-card" key={c.id}>
          <div className="call-head">
            <strong>{c.caller_number || 'Unbekannte Nummer'}</strong>
            <span>{fmtDateTime(c.started_at || c.created_at)}</span>
            {c.duration_seconds != null && <span>{Math.round(c.duration_seconds / 60)} min</span>}
            <span className={`badge badge-${c.outcome}`}>{c.outcome || '–'}</span>
          </div>
          {c.summary && <p className="call-summary">{c.summary}</p>}
          {c.recording_url && <a href={c.recording_url} target="_blank" rel="noreferrer">Aufnahme anhören</a>}
        </div>
      ))}
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

function Customers({ refreshKey, onChanged }) {
  const { data: daily } = useFetch('/api/stats/daily/by-restaurant', refreshKey);
  const { data: weekly } = useFetch('/api/stats/weekly/by-restaurant', refreshKey);
  const { data: restaurants } = useFetch('/api/restaurants', refreshKey);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

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
      </div>
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
                  <td><strong>{d.name}</strong></td>
                  <td>{r.login_email || <span className="warn-text">kein Zugang</span>}</td>
                  <td>{r.vapi_phone_number || '–'}</td>
                  <td>{d.calls}</td>
                  <td>{d.reservations}</td>
                  <td>{w.calls ?? '–'}</td>
                  <td>{w.reservations ?? '–'}</td>
                  <td>{w.guests ?? '–'}</td>
                  <td>
                    <button className="link" onClick={() => setEditing(d.restaurant_id)}>
                      {r.login_email ? 'Zugang ändern' : 'Zugang anlegen'}
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

// ---------------------------------------------------------------- shell
const NAV = [
  { id: 'overview', label: 'Übersicht', icon: '📊' },
  { id: 'calendar', label: 'Kalender', icon: '📅' },
  { id: 'reservations', label: 'Reservierungen', icon: '🍽️' },
  { id: 'calls', label: 'Anrufe', icon: '📞' },
  { id: 'reco', label: 'KI-Empfehlungen', icon: '💡' },
  { id: 'customers', label: 'Kunden (Betreiber)', icon: '🏢', divider: true, adminOnly: true },
];

const TITLES = {
  overview: 'Übersicht', calendar: 'Kalender', reservations: 'Reservierungen',
  calls: 'Anrufe', reco: 'KI-Empfehlungen', customers: 'Kundenübersicht',
};

export default function App() {
  const [auth, setAuth] = useState(loadAuth);
  const [view, setView] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const isAdmin = auth?.role === 'admin';

  const { data: restaurants } = useFetch(auth ? '/api/restaurants' : null, refreshKey);
  const [restaurantId, setRestaurantId] = useState(null);
  const [sideSearch, setSideSearch] = useState('');

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

  if (!auth) return <Login onLogin={setAuth} />;

  const logout = () => { clearAuth(); setAuth(null); setView('overview'); };
  const current = restaurants?.find((r) => String(r.id) === String(restaurantId));
  const filtered = (restaurants || []).filter(
    (r) => r.name.toLowerCase().includes(sideSearch.trim().toLowerCase()),
  );
  const nav = NAV.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo-area">
          <img src="/logo.png" alt="" className="logo-img"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="logo-word">ki-works</span>
        </div>

        {isAdmin ? (
          <>
            <label className="side-label" htmlFor="restaurant-search">Betrieb</label>
            <input
              id="restaurant-search" type="search" className="search"
              placeholder="🔍 Suchen…" value={sideSearch}
              onChange={(e) => setSideSearch(e.target.value)}
            />
            <select
              id="restaurant-select" size={Math.min(Math.max(filtered.length, 2), 6)}
              value={restaurantId ?? ''}
              onChange={(e) => setRestaurantId(e.target.value)}
            >
              {filtered.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </>
        ) : (
          <div className="customer-name-box">{auth.name}</div>
        )}

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
      </aside>

      <main>
        <header className="main-head">
          <h1>{TITLES[view]}</h1>
          {view !== 'customers' && current && <span className="current-name">{current.name}</span>}
        </header>
        {restaurantId == null && view !== 'customers' ? <p>Lade…</p> : (
          <>
            {view === 'overview' && <Overview restaurantId={restaurantId} refreshKey={refreshKey} />}
            {view === 'calendar' && <CalendarDay restaurantId={restaurantId} refreshKey={refreshKey} />}
            {view === 'reservations' && (
              <Reservations restaurantId={restaurantId} refreshKey={refreshKey} onChanged={refresh} />
            )}
            {view === 'calls' && <Calls restaurantId={restaurantId} refreshKey={refreshKey} />}
            {view === 'reco' && <Recommendations restaurantId={restaurantId} />}
            {view === 'customers' && isAdmin && (
              <Customers refreshKey={refreshKey} onChanged={refresh} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
