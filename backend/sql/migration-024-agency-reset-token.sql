-- Passwort-vergessen für Agenturen: gleicher Token-Mechanismus wie bei
-- Restaurants (migration-006-invites.sql) — wird sowohl für die erstmalige
-- Zugangsvergabe als auch für "Passwort vergessen" genutzt.
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS setup_token TEXT UNIQUE;
ALTER TABLE agencies ADD COLUMN IF NOT EXISTS setup_token_expires TIMESTAMPTZ;
