-- =====================================================
-- FLOOR PLAN LIBRARY: UPDATE UNITS_MIX TABLE
-- =====================================================
-- Purpose: Add references to floor plans and subtypes
-- Author: Erik @ BrixAurea
-- Date: 2026-01-01
-- =====================================================

-- Add new columns to units_mix table
ALTER TABLE units_mix 
ADD COLUMN IF NOT EXISTS floor_plan_id UUID REFERENCES floor_plan_library(id) ON DELETE SET NULL;

ALTER TABLE units_mix
ADD COLUMN IF NOT EXISTS subtype_id UUID REFERENCES property_subtypes(id) ON DELETE SET NULL;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_units_mix_floor_plan ON units_mix(floor_plan_id);
CREATE INDEX IF NOT EXISTS idx_units_mix_subtype ON units_mix(subtype_id);

-- =====================================================
-- MIGRATION: BACKFILL LOGIC (Optional)
-- =====================================================
-- If you want to migrate existing units to match project subtypes later,
-- you can add backfill logic here. For now, leaving it as NULL is fine.

COMMENT ON COLUMN units_mix.floor_plan_id IS 'Optional reference to a floor plan from the library. If set, unit inherits characteristics from the floor plan.';
COMMENT ON COLUMN units_mix.subtype_id IS 'Optional reference to property subtype. Useful for mixed-use projects with multiple unit types.';

-- =====================================================
-- TRIGGER: AUTO-POPULATE UNIT DATA FROM FLOOR PLAN
-- =====================================================
-- When a floor_plan_id is set, auto-populate unit characteristics

CREATE OR REPLACE FUNCTION populate_unit_from_floor_plan()
RETURNS TRIGGER AS $$
DECLARE
    fp_record RECORD;
BEGIN
    -- If floor_plan_id is set and we're inserting/updating
    IF NEW.floor_plan_id IS NOT NULL THEN
        -- Fetch floor plan data
        SELECT 
            plan_name,
            bedrooms,
            bathrooms,
            half_baths,
            suites,
            garages,
            area_sqft,
            area_outdoor,
            area_total,
            standard_price_sqft,
            subtype_id
        INTO fp_record
        FROM floor_plan_library
        WHERE id = NEW.floor_plan_id;
        
        -- Auto-populate fields if not explicitly set
        IF NEW.model_name IS NULL OR NEW.model_name = '' THEN
            NEW.model_name := fp_record.plan_name;
        END IF;
        
        IF NEW.bedrooms IS NULL OR NEW.bedrooms = 0 THEN
            NEW.bedrooms := fp_record.bedrooms;
        END IF;
        
        IF NEW.bathrooms IS NULL OR NEW.bathrooms = 0 THEN
            NEW.bathrooms := fp_record.bathrooms;
        END IF;

        IF NEW.half_baths IS NULL OR NEW.half_baths = 0 THEN
            NEW.half_baths := fp_record.half_baths;
        END IF;
        
        IF NEW.suites IS NULL OR NEW.suites = 0 THEN
            NEW.suites := fp_record.suites;
        END IF;
        
        IF NEW.garages IS NULL OR NEW.garages = 0 THEN
            NEW.garages := fp_record.garages;
        END IF;
        
        IF NEW.area_sqft IS NULL OR NEW.area_sqft = 0 THEN
            NEW.area_sqft := fp_record.area_sqft;
        END IF;
        
        IF NEW.area_outdoor IS NULL OR NEW.area_outdoor = 0 THEN
            NEW.area_outdoor := fp_record.area_outdoor;
        END IF;
        
        IF NEW.area_total IS NULL OR NEW.area_total = 0 THEN
            NEW.area_total := fp_record.area_total;
        END IF;
        
        -- Suggest price_sqft if available
        IF (NEW.price_sqft IS NULL OR NEW.price_sqft = 0) AND fp_record.standard_price_sqft IS NOT NULL THEN
            NEW.price_sqft := fp_record.standard_price_sqft;
        END IF;
        
        -- Auto-populate subtype_id from floor plan
        IF NEW.subtype_id IS NULL THEN
            NEW.subtype_id := fp_record.subtype_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_populate_unit_from_floor_plan
    BEFORE INSERT OR UPDATE ON units_mix
    FOR EACH ROW
    EXECUTE FUNCTION populate_unit_from_floor_plan();

COMMENT ON FUNCTION populate_unit_from_floor_plan() IS 'Auto-populates unit_mix fields from referenced floor_plan_library entry.';
