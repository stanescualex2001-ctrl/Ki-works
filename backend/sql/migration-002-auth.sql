-- Kunden-Logins: jeder Betrieb bekommt eigene Zugangsdaten.
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS login_email TEXT UNIQUE;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS password_hash TEXT;
