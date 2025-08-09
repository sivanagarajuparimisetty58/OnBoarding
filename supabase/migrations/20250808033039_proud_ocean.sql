/*
  # Create onboarding system tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique, required)
      - `password` (text, required)
      - `about_me` (text, optional)
      - `street_address` (text, optional)
      - `city` (text, optional)
      - `state` (text, optional)
      - `zip` (text, optional)
      - `birthdate` (date, optional)
      - `current_step` (integer, default 1)
      - `completed` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `onboarding_config`
      - `id` (uuid, primary key)
      - `page_number` (integer, 2 or 3)
      - `component_name` (text, one of: about_me, address, birthdate)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (as specified in requirements)
    
  3. Default Configuration
    - Set up initial component configuration
    - Page 2: About Me, Birthdate
    - Page 3: Address
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  about_me text DEFAULT '',
  street_address text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  zip text DEFAULT '',
  birthdate date,
  current_step integer DEFAULT 1,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create onboarding_config table
CREATE TABLE IF NOT EXISTS onboarding_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_number integer NOT NULL CHECK (page_number IN (2, 3)),
  component_name text NOT NULL CHECK (component_name IN ('about_me', 'address', 'birthdate')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(component_name)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_config ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (as per requirements)
CREATE POLICY "Allow all operations on users"
  ON users
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on onboarding_config"
  ON onboarding_config
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert default configuration
INSERT INTO onboarding_config (page_number, component_name) VALUES
  (2, 'about_me'),
  (2, 'birthdate'),
  (3, 'address')
ON CONFLICT (component_name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_config_updated_at BEFORE UPDATE ON onboarding_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();