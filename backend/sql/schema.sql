-- ki-works MVP schema
CREATE TABLE IF NOT EXISTS restaurants (
    id                SERIAL PRIMARY KEY,
    name              TEXT NOT NULL,
    address           TEXT,
    contact_email     TEXT,
    contact_phone     TEXT,
    vapi_phone_number TEXT,
    vapi_assistant_id TEXT,
    opening_hours     JSONB DEFAULT '{}'::jsonb,
    settings          JSONB DEFAULT '{}'::jsonb,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reservations (
    id             SERIAL PRIMARY KEY,
    restaurant_id  INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_name  TEXT NOT NULL,
    customer_phone TEXT,
    party_size     INTEGER NOT NULL DEFAULT 2,
    reserved_at    TIMESTAMPTZ NOT NULL,
    status         TEXT NOT NULL DEFAULT 'confirmed', -- confirmed | cancelled | no_show | completed
    notes          TEXT,
    source         TEXT NOT NULL DEFAULT 'phone',     -- phone | dashboard | web
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_time
    ON reservations (restaurant_id, reserved_at);

CREATE TABLE IF NOT EXISTS calls (
    id               SERIAL PRIMARY KEY,
    restaurant_id    INTEGER REFERENCES restaurants(id) ON DELETE SET NULL,
    vapi_call_id     TEXT UNIQUE,
    caller_number    TEXT,
    started_at       TIMESTAMPTZ,
    ended_at         TIMESTAMPTZ,
    duration_seconds INTEGER,
    transcript       TEXT,
    summary          TEXT,
    outcome          TEXT, -- reservation | info | missed | other
    recording_url    TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_calls_restaurant_time
    ON calls (restaurant_id, created_at);
