-- Speisekarte/Preisliste pro Betrieb — wird dem Telefonagenten pro Anruf mitgegeben.
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS menu TEXT;
