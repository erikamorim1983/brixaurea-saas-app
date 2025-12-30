-- 13_land_details_update.sql
-- Add columns for Option Agreement and Ground Lease

ALTER TABLE public.land_details
ADD COLUMN IF NOT EXISTS option_fee_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS option_duration_months INTEGER,
ADD COLUMN IF NOT EXISTS lease_initial_rent DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS lease_term_years INTEGER;
