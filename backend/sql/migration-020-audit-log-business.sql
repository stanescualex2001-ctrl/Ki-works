-- Interne Business-Aktionen (Sales-/Social-Agent für ki-works.eu selbst,
-- künftig auch für weitere eigene Businesses wie LEDTEK/pixelpress/Memcore)
-- haben keinen restaurant_id-Bezug — "business" identifiziert stattdessen,
-- zu welcher Business-Dashboard-Karte ein Eintrag gehört.
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS business TEXT;
CREATE INDEX IF NOT EXISTS idx_audit_log_business ON audit_log(business);
