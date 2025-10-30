-- SmartSeed Nursery Database Schema

-- Create database (run this separately if database doesn't exist)
-- CREATE DATABASE smartseed;

-- Drop table if exists (for development)
DROP TABLE IF EXISTS batches CASCADE;

-- Batches table for wildling registration
CREATE TABLE batches (
  id SERIAL PRIMARY KEY,
  batch_id VARCHAR(50) UNIQUE NOT NULL,
  date_received TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source_location TEXT NOT NULL,
  photo_url TEXT,
  wildlings_count INTEGER NOT NULL CHECK (wildlings_count >= 0),
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'received',
  person_in_charge VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_batch_id ON batches(batch_id);
CREATE INDEX idx_status ON batches(status);
CREATE INDEX idx_date_received ON batches(date_received DESC);

-- Function to auto-generate batch_id
CREATE OR REPLACE FUNCTION generate_batch_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  year_month TEXT;
  counter INTEGER;
BEGIN
  -- Format: WLD-YYYYMM-XXX (e.g., WLD-202510-001)
  year_month := TO_CHAR(CURRENT_DATE, 'YYYYMM');
  
  -- Get the count of batches for this month
  SELECT COUNT(*) + 1 INTO counter
  FROM batches
  WHERE batch_id LIKE 'WLD-' || year_month || '-%';
  
  -- Generate the batch ID
  new_id := 'WLD-' || year_month || '-' || LPAD(counter::TEXT, 3, '0');
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_batches_updated_at
BEFORE UPDATE ON batches
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO batches (batch_id, source_location, wildlings_count, notes, person_in_charge)
VALUES 
  ('WLD-202510-001', 'Mount Makiling Forest Reserve', 500, 'Good quality mahogany wildlings', 'Juan Dela Cruz'),
  ('WLD-202510-002', 'Sierra Madre Mountains', 750, 'Mixed species: Narra and Apitong', 'Maria Santos');

-- Verify the setup
SELECT * FROM batches ORDER BY date_received DESC;
