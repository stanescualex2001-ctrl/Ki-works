-- Agenturen werden deaktiviert statt gelöscht (z. B. bei Zahlungsverzug) —
-- sperrt nur den Login, Daten/Kunden/Historie (für Rechnungen) bleiben
-- vollständig erhalten und lassen sich jederzeit reaktivieren.
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
