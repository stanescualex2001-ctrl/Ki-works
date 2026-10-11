-- Verhindert, dass dieselbe Kontingent-Warn-Mail (80%/100%) mehrfach pro
-- Kalendermonat verschickt wird, da der Check periodisch läuft (täglich)
-- und sonst bei jedem Lauf erneut auslösen würde. period_start statt NOW()
-- im PK, damit ein neuer Monat die Warnung wieder zulässt.
CREATE TABLE IF NOT EXISTS usage_warnings_sent (
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  period_start  DATE NOT NULL,
  threshold     TEXT NOT NULL CHECK (threshold IN ('80pct', '100pct', 'downgrade')),
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (restaurant_id, period_start, threshold)
);
