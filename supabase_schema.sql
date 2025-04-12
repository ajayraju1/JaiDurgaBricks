-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  initial_debt NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create work_types enum
CREATE TYPE work_type AS ENUM (
  'kundi',
  'kundiDriver',
  'brickCarry',
  'brickBaking',
  'brickLoadTractor',
  'brickLoadVan',
  'topWork'
);

-- Create work records table
CREATE TABLE IF NOT EXISTS work_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  work_type work_type NOT NULL,
  date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  is_driver BOOLEAN DEFAULT FALSE,
  brick_count INTEGER,
  is_half_day BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create usage records table
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for improved query performance
CREATE INDEX IF NOT EXISTS work_records_worker_id_idx ON work_records(worker_id);
CREATE INDEX IF NOT EXISTS work_records_date_idx ON work_records(date);
CREATE INDEX IF NOT EXISTS usage_records_worker_id_idx ON usage_records(worker_id);
CREATE INDEX IF NOT EXISTS usage_records_date_idx ON usage_records(date);

-- Enable Row Level Security
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Create policies
-- For now, allow full access without authentication
CREATE POLICY "Allow full access to workers" ON workers FOR ALL USING (true);
CREATE POLICY "Allow full access to work_records" ON work_records FOR ALL USING (true);
CREATE POLICY "Allow full access to usage_records" ON usage_records FOR ALL USING (true);

-- Create function to get worker balance
CREATE OR REPLACE FUNCTION get_worker_balance(worker_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  work_total NUMERIC;
  usage_total NUMERIC;
  initial_debt NUMERIC;
BEGIN
  -- Get initial debt (if any)
  SELECT COALESCE(w.initial_debt, 0) INTO initial_debt
  FROM workers w
  WHERE w.id = worker_id;

  -- Calculate total from work records
  SELECT COALESCE(SUM(amount), 0) INTO work_total
  FROM work_records
  WHERE worker_id = get_worker_balance.worker_id;

  -- Calculate total from usage records
  SELECT COALESCE(SUM(amount), 0) INTO usage_total
  FROM usage_records
  WHERE worker_id = get_worker_balance.worker_id;

  -- Return the balance (work_total - usage_total - initial_debt)
  RETURN work_total - usage_total - initial_debt;
END;
$$ LANGUAGE plpgsql; 