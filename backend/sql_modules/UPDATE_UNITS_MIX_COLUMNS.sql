-- MIGRATION: Add missing columns to units_mix table
-- Purpose: Support detailed unit characteristics and price calculation
-- Author: Erik @ BrixAurea
-- Date: 2026-01-01

ALTER TABLE public.units_mix 
ADD COLUMN IF NOT EXISTS bedrooms NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS bathrooms NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS half_baths NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS suites INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS garages INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS area_outdoor NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS area_total NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_sqft NUMERIC DEFAULT 0;

-- Comments for clarity
COMMENT ON COLUMN units_mix.area_sqft IS 'Living area (heated/cooled)';
COMMENT ON COLUMN units_mix.area_outdoor IS 'Non-conditioned areas (entry, lanai, etc)';
COMMENT ON COLUMN units_mix.area_total IS 'Total construction area';
COMMENT ON COLUMN units_mix.price_sqft IS 'Reference sale price per square foot';
