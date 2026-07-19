-- Verknüpft eine Bestellung optional mit einer Reservierung (z. B. Essen soll
-- am reservierten Tisch bereits vorbereitet sein, statt Abholung).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reservation_id INTEGER REFERENCES reservations(id);
