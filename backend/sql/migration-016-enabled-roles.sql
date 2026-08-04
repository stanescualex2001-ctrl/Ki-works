-- Welche Kiwo-Rollen ein Kunde gebucht hat (z. B. nur "support" statt allem).
-- Default entspricht dem bisherigen Verhalten (Buchung + FAQ/Rückruf für
-- alle Kunden) — bestehende Kunden ändern sich durch diese Migration nicht.
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS enabled_roles JSONB DEFAULT '["orders","support"]'::jsonb;
