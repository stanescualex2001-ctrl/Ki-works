-- Demo-Daten für Venezia (restaurant_id = 1), um Wochenkalender/Übersicht/Details
-- vorzuführen. Alle Zeilen sind mit "[DEMO]" markiert — vor Go-Live mit
-- dev-seed-cleanup.sql wieder entfernen.
INSERT INTO reservations (restaurant_id, customer_name, customer_phone, party_size, reserved_at, notes, source, status)
VALUES
 (1, 'Huber',  '+4366011111', 4, (now()::date + interval '1 day'  + interval '19 hour'), '[DEMO] Fensterplatz', 'phone',     'confirmed'),
 (1, 'Gruber', '+4366022222', 2, (now()::date + interval '2 day'  + interval '12 hour'), '[DEMO]',              'dashboard', 'confirmed'),
 (1, 'Mayer',  '+4366033333', 6, (now()::date + interval '4 day'  + interval '20 hour'), '[DEMO] Geburtstag',   'phone',     'confirmed'),
 (1, 'Berger', '+4366044444', 3, (now()::date + interval '0 day'  + interval '13 hour'), '[DEMO]',              'phone',     'confirmed'),
 (1, 'Wimmer', '+4366055555', 5, (now()::date + interval '5 day'  + interval '19 hour'), '[DEMO]',              'phone',     'confirmed');

INSERT INTO orders (restaurant_id, customer_name, customer_phone, items, requested_at, notes, source, status)
VALUES
 (1, 'Fischer', '+4366066666', '2x Pizza 05 Salami, 1x Tiramisu',        (now()::date + interval '1 day' + interval '18 hour'), '[DEMO]', 'phone', 'new'),
 (1, 'Wagner',  '+4366077777', '1x Lasagne 103, 1x Cola 0,33l',          (now()::date + interval '3 day' + interval '13 hour'), '[DEMO]', 'phone', 'ready'),
 (1, 'Steiner', '+4366088888', '3x Pizza 01 Margherita zum Mitnehmen',   (now()::date + interval '0 day' + interval '19 hour'), '[DEMO]', 'phone', 'in_progress');

INSERT INTO calls (restaurant_id, caller_number, started_at, ended_at, duration_seconds, transcript, summary, outcome)
VALUES
 (1, '+4366011111', now() - interval '1 day', now() - interval '1 day' + interval '3 minutes', 180,
  '[DEMO] Beispieltranskript', '[DEMO] Gast hat einen Tisch für 4 Personen reserviert.', 'reservation'),
 (1, '+4366099999', now() - interval '2 hours', now() - interval '2 hours' + interval '1 minutes', 60,
  '[DEMO] Beispieltranskript', '[DEMO] Anrufer hat nach den Öffnungszeiten gefragt.', 'info');
