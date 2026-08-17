-- Welchen Preistarif (solo/team/scale) ein Kunde gebucht hat — Grundlage für
-- die Nutzungs-/Überschreitungsanzeige im Dashboard. NULL = noch kein Tarif
-- hinterlegt (bestehende Kunden bleiben unverändert, Dashboard zeigt dann
-- nur den Minutenverbrauch ohne Kontingent-Vergleich).
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS pricing_tier TEXT;
