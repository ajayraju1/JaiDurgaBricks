-- Create brick loads tables

-- Create brick_loads table
CREATE TABLE IF NOT EXISTS brick_loads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_name TEXT NOT NULL,
  phone_number TEXT,
  brick_quantity NUMERIC(10, 2) NOT NULL,
  brick_rate NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  amount_paid NUMERIC(10, 2) DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create brick_load_logs table
CREATE TABLE IF NOT EXISTS brick_load_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brick_load_id UUID REFERENCES brick_loads(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('brick', 'payment')),
  brick_quantity NUMERIC(10, 2),
  brick_rate NUMERIC(10, 2),
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for improved query performance
CREATE INDEX IF NOT EXISTS brick_loads_date_idx ON brick_loads(date);
CREATE INDEX IF NOT EXISTS brick_load_logs_brick_load_id_idx ON brick_load_logs(brick_load_id);
CREATE INDEX IF NOT EXISTS brick_load_logs_date_idx ON brick_load_logs(date);

-- Enable Row Level Security
ALTER TABLE brick_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE brick_load_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
-- For now, allow full access without authentication
CREATE POLICY "Allow full access to brick_loads" ON brick_loads FOR ALL USING (true);
CREATE POLICY "Allow full access to brick_load_logs" ON brick_load_logs FOR ALL USING (true); 