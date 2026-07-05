import React, { useEffect, useState, useCallback } from 'react';

const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('de-AT', { dateStyle: 'medium', timeStyle: 'short' }) : '–';

function useFetch(url, refreshKey) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [url, refreshKey]);
  return { data, error };
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value ?? '–'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Overview({ refreshKey }) {
  const { data: stats } = useFetch('/api/stats', refreshKey);
  return (
    <>
      <h2>Heute</h2>
      <div className="stat-grid">
        <StatCard label="Anrufe" value={stats?.today?.calls} />
        <StatCard label="Reservierungen" value={stats?.today?.reservations} />
        <StatCard label="davon telefonisch" value={stats?.today?.phone_reservations} />
        <StatCard label="Gäste" value={stats?.today?.guests} />
      </div>
      <h2>Letzte 7 Tage</h2>
      <div className="stat-grid">
        <StatCard label="Anrufe" value={stats?.week?.calls} />
        <StatCard label="Reservierungen" value={stats?.week?.reservations} />
        <StatCard label="davon telefonisch" value={stats?.week?.phone_reservations} />
        <StatCard label="Gäste" value={stats?.week?.guests} />
      </div>
    </>
  );
}

const STATUS_LABELS = {
  confirmed: 'Bestätigt', cancelled: 'Storniert', no_show: 'Nicht erschienen', completed: 'Abgeschlossen',
};

function Reservations({ refreshKey, onChanged }) {
  const { data: reservations, error } = useFetch('/api/reservations', refreshKey);
  const setStatus = useCallback((id, status) => {
    fetch(`/api/reservations/${id}`, {
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

function Calls({ refreshKey }) {
  const { data: calls, error } = useFetch('/api/calls', refreshKey);
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

export default function App() {
  const [tab, setTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const { data: restaurants } = useFetch('/api/restaurants', refreshKey);

  useEffect(() => {
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div className="app">
      <header>
        <h1>ki-works</h1>
        <span className="restaurant-name">{restaurants?.[0]?.name || ''}</span>
        <nav>
          <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Übersicht</button>
          <button className={tab === 'reservations' ? 'active' : ''} onClick={() => setTab('reservations')}>Reservierungen</button>
          <button className={tab === 'calls' ? 'active' : ''} onClick={() => setTab('calls')}>Anrufe</button>
        </nav>
        <button className="refresh" onClick={refresh} title="Aktualisieren">⟳</button>
      </header>
      <main>
        {tab === 'overview' && <Overview refreshKey={refreshKey} />}
        {tab === 'reservations' && <Reservations refreshKey={refreshKey} onChanged={refresh} />}
        {tab === 'calls' && <Calls refreshKey={refreshKey} />}
      </main>
    </div>
  );
}
