-- Verknüpft bereits vorhandene Anrufe nachträglich mit passenden Reservierungen/
-- Bestellungen (Restaurant + Anrufernummer + großzügigeres Zeitfenster ±15 Min.,
-- da alte Daten nicht exakt zum Anruf-Ende passen müssen). Einmalig nach dem
-- Deployment von migration-007 ausführen; danach übernehmen neue Anrufe die
-- Verknüpfung automatisch.
UPDATE reservations r SET call_id = c.id
FROM calls c
WHERE r.call_id IS NULL
  AND r.restaurant_id = c.restaurant_id
  AND r.customer_phone = c.caller_number
  AND r.created_at BETWEEN c.started_at - interval '15 minutes' AND COALESCE(c.ended_at, c.created_at) + interval '15 minutes';

UPDATE orders o SET call_id = c.id
FROM calls c
WHERE o.call_id IS NULL
  AND o.restaurant_id = c.restaurant_id
  AND o.customer_phone = c.caller_number
  AND o.created_at BETWEEN c.started_at - interval '15 minutes' AND COALESCE(c.ended_at, c.created_at) + interval '15 minutes';
