-- Telefonische Bestellungen (Abholung/Lieferung).
CREATE TABLE IF NOT EXISTS orders (
    id             SERIAL PRIMARY KEY,
    restaurant_id  INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_name  TEXT NOT NULL,
    customer_phone TEXT,
    items          TEXT NOT NULL,               -- Freitext: "2x Pizza Margherita, 1x Lasagne"
    fulfillment    TEXT NOT NULL DEFAULT 'pickup', -- pickup | delivery
    address        TEXT,
    requested_at   TIMESTAMPTZ,                 -- gewünschte Abhol-/Lieferzeit
    notes          TEXT,
    status         TEXT NOT NULL DEFAULT 'new', -- new | in_progress | ready | completed | cancelled
    source         TEXT NOT NULL DEFAULT 'phone',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_time ON orders (restaurant_id, created_at);
