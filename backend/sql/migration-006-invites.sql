-- Einladungs-Link: Kunde setzt sein eigenes Passwort selbst.
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS setup_token TEXT UNIQUE;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS setup_token_expires TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_restaurant_id INTEGER REFERENCES restaurants(id);
