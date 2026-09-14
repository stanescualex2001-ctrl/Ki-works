-- Live-Weiterleitung an einen Menschen (Anruf-Weiterleitung während der
-- Öffnungszeiten, siehe backend/src/vapiAdmin.js TRANSFER_PROMPT). Leer =
-- Feature für diesen Kunden inaktiv, explizites Opt-in pro Kunde. Eigenes
-- Feld statt Wiederverwendung von contact_phone, da letzteres nicht
-- zwangsläufig eine während der Öffnungszeiten persönlich erreichbare
-- Nummer ist.
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS transfer_phone_number TEXT;
