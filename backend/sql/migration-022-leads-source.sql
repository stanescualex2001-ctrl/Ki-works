-- Woher ein Lead kam (z. B. "webchat" vom neuen Kiwo-Chat-Widget) — NULL
-- bleibt weiterhin "Kontaktformular" (bisheriges Verhalten, unverändert).
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT;
