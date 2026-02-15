-- =============================================================================
-- FOODKEYS WEBLOG - PostgreSQL Initialization Script
-- This script runs when the PostgreSQL container is first created
-- =============================================================================

-- Enable extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search

-- Grant all privileges to the application user
-- (Already done by default, but explicit is better)
GRANT ALL PRIVILEGES ON DATABASE foodkeys_db TO foodkeys;

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'FoodKeys database initialized successfully!';
END $$;
