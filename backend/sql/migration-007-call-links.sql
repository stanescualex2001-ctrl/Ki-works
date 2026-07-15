-- Verknüpft Anrufe mit der dabei erstellten Reservierung/Bestellung,
-- damit das Dashboard von einem Anruf aus direkt zu den Details springen kann.
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS call_id INTEGER REFERENCES calls(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS call_id INTEGER REFERENCES calls(id);
