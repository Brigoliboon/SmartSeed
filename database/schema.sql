-- Smartseed Nursery Database Schema

-- Create database (run this separately if database doesn't exist)
-- CREATE DATABASE Smartseed;

-- Drop tables if exists (for development)
DROP TABLE IF EXISTS batch_bed_assignments CASCADE;
DROP TABLE IF EXISTS beds CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS batches CASCADE;

-- Drop types if exists
DROP TYPE IF EXISTS category CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Create ENUM types
CREATE TYPE category AS ENUM ('Fruit Tree', 'Forestry', 'Ornamental');
CREATE TYPE user_role AS ENUM ('admin', 'field_worker', 'cenro');

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

-- Users table (with password for local auth)
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'field_worker',
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Locations table
CREATE TABLE locations (
  location_id SERIAL PRIMARY KEY,
  location_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_locations_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Beds table
CREATE TABLE beds (
  bed_id SERIAL PRIMARY KEY,
  bed_name VARCHAR(100) NOT NULL,
  location_id INTEGER NOT NULL,
  species_category category NOT NULL,
  in_charge INTEGER,
  capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
  current_occupancy INTEGER DEFAULT 0 CHECK (current_occupancy >= 0),
  qr_code TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_beds_location FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE RESTRICT,
  CONSTRAINT fk_beds_user FOREIGN KEY (in_charge) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT uq_beds_name_location UNIQUE (bed_name, location_id)
);

CREATE INDEX idx_beds_category ON beds(species_category);
CREATE INDEX idx_beds_location ON beds(location_id);
CREATE INDEX idx_beds_in_charge ON beds(in_charge);
CREATE INDEX idx_beds_qr_code ON beds(qr_code);

CREATE TRIGGER update_beds_updated_at
BEFORE UPDATE ON beds
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Batch-Bed Assignments table (tracks which batches are in which beds)
CREATE TABLE batch_bed_assignments (
  assignment_id SERIAL PRIMARY KEY,
  batch_id INTEGER NOT NULL,
  bed_id INTEGER NOT NULL,
  quantity_assigned INTEGER NOT NULL CHECK (quantity_assigned > 0),
  species_name VARCHAR(200),
  date_assigned TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_assignment_batch FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_assignment_bed FOREIGN KEY (bed_id) REFERENCES beds(bed_id) ON DELETE CASCADE
);

CREATE INDEX idx_assignments_batch ON batch_bed_assignments(batch_id);
CREATE INDEX idx_assignments_bed ON batch_bed_assignments(bed_id);

-- Bed Tasks table (defines what tasks need to be done for beds)
CREATE TABLE bed_tasks (
  task_id SERIAL PRIMARY KEY,
  task_name VARCHAR(200) NOT NULL,
  task_description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default bed tasks
INSERT INTO bed_tasks (task_name, task_description, is_default) VALUES
  ('Watering', 'Check soil moisture and water seedlings as needed', TRUE),
  ('Weeding', 'Remove weeds and unwanted vegetation from the bed', TRUE),
  ('Pest Check', 'Inspect plants for pests and diseases', TRUE),
  ('Fertilizing', 'Apply fertilizer according to plant needs', TRUE),
  ('Shading Check', 'Ensure proper shade coverage for seedlings', TRUE);

-- Daily Bed Task Completions table
CREATE TABLE daily_task_completions (
  completion_id SERIAL PRIMARY KEY,
  bed_id INTEGER NOT NULL,
  task_id INTEGER NOT NULL,
  completed_by INTEGER NOT NULL,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completion_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  photo_url TEXT,
  notes TEXT,
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  
  CONSTRAINT fk_completion_bed FOREIGN KEY (bed_id) REFERENCES beds(bed_id) ON DELETE CASCADE,
  CONSTRAINT fk_completion_task FOREIGN KEY (task_id) REFERENCES bed_tasks(task_id) ON DELETE CASCADE,
  CONSTRAINT fk_completion_user FOREIGN KEY (completed_by) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT uq_daily_completion UNIQUE (bed_id, task_id, completion_date)
);

CREATE INDEX idx_completions_bed ON daily_task_completions(bed_id);
CREATE INDEX idx_completions_date ON daily_task_completions(completion_date DESC);
CREATE INDEX idx_completions_user ON daily_task_completions(completed_by);

-- Insert sample data for testing

-- Sample Users (password: 'password123' for all - CHANGE IN PRODUCTION!)
-- Note: In production, use proper password hashing (bcrypt)
INSERT INTO users (name, email, password_hash, role, phone) VALUES
  ('Admin User', 'admin@Smartseed.com', '$2a$10$rKzDMOKKQJ8LhS9VEqxBJOU7EQ3YqJxV9xKhLZPXqGqYGzYgYqKYe', 'admin', '09191234567'),
  ('Juan Dela Cruz', 'juan@Smartseed.com', '$2a$10$rKzDMOKKQJ8LhS9VEqxBJOU7EQ3YqJxV9xKhLZPXqGqYGzYgYqKYe', 'field_worker', '09171234567'),
  ('Maria Santos', 'maria@Smartseed.com', '$2a$10$rKzDMOKKQJ8LhS9VEqxBJOU7EQ3YqJxV9xKhLZPXqGqYGzYgYqKYe', 'field_worker', '09187654321');

-- Sample Locations
INSERT INTO locations (location_name, description) VALUES
  ('Greenhouse A', 'Main greenhouse area for forestry species'),
  ('Greenhouse B', 'Secondary greenhouse for fruit trees'),
  ('Outdoor Area C', 'Open area for ornamental plants');

-- Sample Beds (with unique QR codes)
INSERT INTO beds (bed_name, location_id, species_category, in_charge, capacity, qr_code, notes) VALUES
  ('Bed A-1', 1, 'Forestry', 2, 1000, 'BED-A1-QR2024', 'Primary bed for native tree seedlings'),
  ('Bed A-2', 1, 'Forestry', 3, 1000, 'BED-A2-QR2024', 'Secondary bed for hardwood species'),
  ('Bed B-1', 2, 'Fruit Tree', 2, 800, 'BED-B1-QR2024', 'Mango and citrus varieties'),
  ('Bed C-1', 3, 'Ornamental', 3, 500, 'BED-C1-QR2024', 'Flowering plants and decorative species');

-- Sample Batches
INSERT INTO batches (batch_id, source_location, wildlings_count, notes, person_in_charge)
VALUES 
  ('WLD-202510-001', 'Mount Makiling Forest Reserve', 500, 'Good quality mahogany wildlings', 'Juan Dela Cruz'),
  ('WLD-202510-002', 'Sierra Madre Mountains', 750, 'Mixed species: Narra and Apitong', 'Maria Santos');

-- Sample Batch-Bed Assignments
INSERT INTO batch_bed_assignments (batch_id, bed_id, quantity_assigned, species_name, notes) VALUES
  (1, 1, 500, 'Swietenia macrophylla (Mahogany)', 'Initial distribution from WLD-202510-001'),
  (2, 2, 750, 'Pterocarpus indicus (Narra)', 'Initial distribution from WLD-202510-002');

-- Update bed occupancy based on assignments
UPDATE beds b
SET current_occupancy = (
  SELECT COALESCE(SUM(quantity_assigned), 0)
  FROM batch_bed_assignments
  WHERE bed_id = b.bed_id
);

-- Verify the setup
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Locations', COUNT(*) FROM locations
UNION ALL
SELECT 'Beds', COUNT(*) FROM beds
UNION ALL
SELECT 'Batches', COUNT(*) FROM batches
UNION ALL
SELECT 'Assignments', COUNT(*) FROM batch_bed_assignments;

-- Show beds with their details
SELECT 
  b.bed_id,
  b.bed_name,
  l.location_name,
  b.species_category,
  u.name as person_in_charge,
  b.capacity,
  b.current_occupancy,
  ROUND((b.current_occupancy::DECIMAL / NULLIF(b.capacity, 0) * 100), 2) as occupancy_percentage
FROM beds b
LEFT JOIN locations l ON b.location_id = l.location_id
LEFT JOIN users u ON b.in_charge = u.user_id
ORDER BY b.bed_id;
