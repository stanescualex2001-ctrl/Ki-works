-- Gast kann bei einer Rückruf-Anfrage angeben, auf welchem Kanal er die
-- spätere Antwort erhalten möchte (nur Erfassung, kein automatischer Versand).
ALTER TABLE callback_requests ADD COLUMN IF NOT EXISTS preferred_channel TEXT;
ALTER TABLE callback_requests ADD COLUMN IF NOT EXISTS contact TEXT;
