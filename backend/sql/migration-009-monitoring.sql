CREATE TABLE IF NOT EXISTS error_log (
    id         SERIAL PRIMARY KEY,
    level      TEXT NOT NULL DEFAULT 'error', -- error | warn
    source     TEXT NOT NULL,
    message    TEXT NOT NULL,
    detail     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_error_log_created ON error_log (created_at DESC);
