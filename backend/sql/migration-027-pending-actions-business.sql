-- Wie audit_log.business (migration-020): interne Business-Aktionen (Sales-/
-- Social-Agent für ki-works.eu selbst, künftig auch weitere eigene
-- Businesses wie LEDTEK/pixelpress/Memcore) haben keinen restaurant_id-
-- Bezug — "business" identifiziert stattdessen, zu welcher
-- Business-Dashboard-Karte ein pending_actions-Eintrag gehört, damit
-- Freigaben pro Karte statt vermischt angezeigt werden können.
ALTER TABLE pending_actions ADD COLUMN IF NOT EXISTS business TEXT;
CREATE INDEX IF NOT EXISTS idx_pending_actions_business ON pending_actions(business);
