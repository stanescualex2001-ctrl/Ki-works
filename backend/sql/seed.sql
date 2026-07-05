-- Test-Restaurant: Venezia (Schwertberg)
INSERT INTO restaurants (name, address, contact_phone, vapi_phone_number, opening_hours, settings)
SELECT
    'Venezia',
    'Marktplatz 10, 4311 Schwertberg',
    NULL,
    '+15022603690',
    '{"mon":"11:00-22:00","tue":"11:00-22:00","wed":"11:00-22:00","thu":"11:00-22:00","fri":"11:00-23:00","sat":"11:00-23:00","sun":"11:00-21:00"}'::jsonb,
    '{"max_party_size": 12, "language": "de"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'Venezia');
