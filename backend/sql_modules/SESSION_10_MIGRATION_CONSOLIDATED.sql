-- =================================================================
-- SESSION 10 - CONSOLIDATED MIGRATIONS
-- =================================================================

-- 1. ADD UNITS MIX DETAILS
-- Add new columns for unit details (Bedrooms, Bathrooms, Suites, Garages, Total Area)
ALTER TABLE units_mix
ADD COLUMN IF NOT EXISTS bedrooms NUMERIC DEFAULT 0;

ALTER TABLE units_mix
ADD COLUMN IF NOT EXISTS bathrooms NUMERIC DEFAULT 0;

ALTER TABLE units_mix
ADD COLUMN IF NOT EXISTS suites NUMERIC DEFAULT 0;

ALTER TABLE units_mix
ADD COLUMN IF NOT EXISTS garages NUMERIC DEFAULT 0;

ALTER TABLE units_mix
ADD COLUMN IF NOT EXISTS area_total NUMERIC DEFAULT 0;

-- 2. ADD SCENARIO VARIATION
-- Add valid_percent column to financial_scenarios for Optimistic/Pessimistic offset
ALTER TABLE financial_scenarios
ADD COLUMN IF NOT EXISTS variation_percent NUMERIC DEFAULT 0;

-- 3. ADD OUTDOOR/NON-CONDITIONED AREA
-- Add area_outdoor for balcony/garage area separation
ALTER TABLE units_mix
ADD COLUMN IF NOT EXISTS area_outdoor NUMERIC DEFAULT 0;
