-- Kiwo kann während eines Anrufs signalisieren, dass ein Anliegen nicht
-- beantwortet werden konnte und ein Mitarbeitender zurückrufen soll.
CREATE TABLE IF NOT EXISTS callback_requests (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id),
  vapi_call_id TEXT,
  caller_number TEXT,
  topic TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_callback_requests_call ON callback_requests(vapi_call_id);
