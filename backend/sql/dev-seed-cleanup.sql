-- Entfernt alle Demo-Daten (Marker "[DEMO]") vor dem Go-Live.
DELETE FROM reservations WHERE notes LIKE '%[DEMO]%';
DELETE FROM orders WHERE notes LIKE '%[DEMO]%';
DELETE FROM calls WHERE summary LIKE '%[DEMO]%' OR transcript LIKE '%[DEMO]%';
DELETE FROM restaurants WHERE name LIKE '[DEMO]%';
