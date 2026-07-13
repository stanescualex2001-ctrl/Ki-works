-- Interessenten-Anfragen von der Firmen-Website (ki-works.eu).
CREATE TABLE IF NOT EXISTS leads (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    business   TEXT,
    email      TEXT,
    phone      TEXT,
    message    TEXT,
    status     TEXT NOT NULL DEFAULT 'new', -- new | contacted | won | lost
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
