-- "menu" hieß bisher immer Speisekarte — jetzt, wo Kiwo auch für
-- Nicht-Restaurant-Kunden (LEDTEK, pixelpress) läuft, wird die Spalte
-- generisch umbenannt. Reiner Metadaten-Rename in Postgres, keine
-- Tabellen-Neuschreibung, kein Downtime.
ALTER TABLE restaurants RENAME COLUMN menu TO knowledge_base;
