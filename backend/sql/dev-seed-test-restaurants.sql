-- Ein paar Test-Betriebe, um die Betrieb-Auswahl (BusinessPicker) im Dashboard
-- mit mehreren Einträgen zu testen. Klar als [DEMO] markiert, vor Go-Live mit
-- dev-seed-cleanup.sql wieder entfernen.
INSERT INTO restaurants (name, address, contact_email, opening_hours)
VALUES
  ('[DEMO] Trattoria Bella', 'Hauptplatz 1, 4020 Linz', 'demo1@ki-works.eu', '{}'::jsonb),
  ('[DEMO] Gasthaus Alpenblick', 'Dorfstraße 5, 5020 Salzburg', 'demo2@ki-works.eu', '{}'::jsonb),
  ('[DEMO] Pizzeria Napoli', 'Bahnhofstraße 12, 1010 Wien', 'demo3@ki-works.eu', '{}'::jsonb);
