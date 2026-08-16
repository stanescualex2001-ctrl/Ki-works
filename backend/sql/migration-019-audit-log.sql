-- Audit-Log für Kiwo-Aktionen: jede Aktion, die ein Kiwo-Agent ausführt
-- (Telefon-Tool-Aufrufe, Sales-/Social-Agent-Läufe, echte Veröffentlichungen)
-- landet hier — Grundlage für das "Audit-Logs für jede Aktion von Kiwo"-
-- Versprechen auf der Landingpage.
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id),
  source TEXT NOT NULL,
  action TEXT NOT NULL,
  summary TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  call_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_restaurant ON audit_log(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
