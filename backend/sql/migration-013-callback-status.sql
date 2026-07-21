-- Erlaubt es, offene Rückruf-Anfragen im Dashboard als beantwortet zu markieren,
-- sobald der Kunde die Antwort selbst in die FAQ eingetragen hat.
ALTER TABLE callback_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
