-- Migration: Add scheduling dates to units_mix
-- Description: Adds sale_date and construction_start_date to allow individual unit planning.

ALTER TABLE units_mix ADD COLUMN IF NOT EXISTS sale_date DATE;
ALTER TABLE units_mix ADD COLUMN IF NOT EXISTS construction_start_date DATE;

-- Update existing units to have null dates by default
COMMENT ON COLUMN units_mix.sale_date IS 'Optional specific date for the unit sale (overrides/subtracts from generic flow)';
COMMENT ON COLUMN units_mix.construction_start_date IS 'Optional specific date for the construction start of this unit';
