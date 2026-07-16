-- DSGVO: Zeitpunkt, zu dem ein Kunden-Login der Datenverarbeitung zugestimmt hat.
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
