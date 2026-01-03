-- 21_update_land_fields.sql
-- Add detailed physical and utility fields to land/location
-- Author: Erik @ BrixAurea
-- Date: 2026-01-02

-- 1. Update project_locations with physical details
ALTER TABLE public.project_locations 
ADD COLUMN IF NOT EXISTS lot_width DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS lot_length DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS parcel_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS subdivision VARCHAR(255);

-- 2. Update land_details with utilities and community
ALTER TABLE public.land_details
ADD COLUMN IF NOT EXISTS sewer_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS water_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS hoa_fees_monthly DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS special_conditions TEXT;

-- 3. Comments for clarity
COMMENT ON COLUMN public.project_locations.parcel_number IS 'Official Property ID / APN';
COMMENT ON COLUMN public.land_details.sewer_type IS 'Sewer system (Sewer, Septic, None)';
COMMENT ON COLUMN public.land_details.water_type IS 'Water system (Public, Well, None)';
