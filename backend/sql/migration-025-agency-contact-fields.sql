-- Agenturen bekommen dieselben Kontaktfelder wie restaurants (Adresse,
-- Kontakt-E-Mail, Kontakt-Telefon) — login_email bleibt separat für den
-- Dashboard-Zugang, analog zum bestehenden restaurants-Schema.
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS contact_phone TEXT;
