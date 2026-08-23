-- White-Label-Agenturen: eigene Domain + Branding, Endkunden bleiben in
-- restaurants (customer-Login unverändert), nur einer Agentur zugeordnet.
CREATE TABLE IF NOT EXISTS agencies (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL,
    domain        TEXT UNIQUE NOT NULL,
    branding      JSONB DEFAULT '{}'::jsonb,
    login_email   TEXT UNIQUE,
    password_hash TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS agency_id INTEGER
  REFERENCES agencies(id) ON DELETE SET NULL;
