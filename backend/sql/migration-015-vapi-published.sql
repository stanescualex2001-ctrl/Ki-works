-- Hält fest, ob der Vapi-Assistent eines Kunden manuell im Vapi-Dashboard
-- "published" wurde (per API angelegte/aktualisierte Assistenten sind das
-- nicht automatisch, siehe CLAUDE.md). Wird bei jeder automatischen
-- Vapi-Synchronisierung auf false zurückgesetzt, damit der Betreiber nach
-- jeder Änderung erneut bestätigt.
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS vapi_published BOOLEAN DEFAULT false;
