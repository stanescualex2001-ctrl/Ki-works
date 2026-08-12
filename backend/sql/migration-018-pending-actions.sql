-- Generisches Freigabe-Gate: Ausgaben von Kiwo-Agenten (z.B. Sales-Akquise-
-- Mails), die vor dem Ausführen eine manuelle Freigabe im Dashboard brauchen.
CREATE TABLE IF NOT EXISTS pending_actions (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id),
  role TEXT NOT NULL,
  kind TEXT NOT NULL,
  summary TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  decided_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_pending_actions_status ON pending_actions(status);
CREATE INDEX IF NOT EXISTS idx_pending_actions_restaurant ON pending_actions(restaurant_id);
