-- =====================================================
-- FLOOR PLAN LIBRARY: FLOOR PLAN LIBRARY TABLE
-- =====================================================
-- Purpose: Reusable floor plans with technical specifications
-- Author: Erik @ BrixAurea
-- Date: 2026-01-01
-- =====================================================

-- Create floor_plan_library table
CREATE TABLE IF NOT EXISTS floor_plan_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Classification
    subtype_id UUID REFERENCES property_subtypes(id) ON DELETE SET NULL,
    
    -- Identification
    plan_name VARCHAR(100) NOT NULL,
    plan_code VARCHAR(50),
    
    -- Residential Characteristics
    bedrooms DECIMAL(3,1) DEFAULT 0, -- 3.0, 3.5 (den), 4.0
    bathrooms DECIMAL(3,1) DEFAULT 0, -- 2.0, 2.5 (half bath), 3.0
    suites INTEGER DEFAULT 0,
    garages INTEGER DEFAULT 0,
    
    -- Areas (in square feet)
    area_sqft DECIMAL(10,2), -- Area Under Air / Sellable / Leasable
    area_outdoor DECIMAL(10,2), -- Balcony, Patio, Non-Conditioned
    area_total DECIMAL(10,2), -- Total (computed or explicit)
    
    -- Standard Costs (Optional - for quick estimation)
    standard_cost_sqft DECIMAL(10,2), -- Standard construction cost per sqft
    standard_price_sqft DECIMAL(10,2), -- Suggested sale/lease price per sqft
    
    -- Commercial / Hospitality Attributes (JSONB for flexibility)
    custom_attributes JSONB DEFAULT '{}',
    -- Examples:
    -- {"parking_ratio": "3.5/1000", "ceiling_height": "14ft", "loading_docks": 2}
    -- {"keys": 120, "room_type": "king_suite"}
    -- {"tenant_category": "retail", "storefront_linear_ft": 45}
    
    -- Media
    floor_plan_image_url TEXT,
    rendering_url TEXT,
    
    -- Metadata
    notes TEXT,
    is_template BOOLEAN DEFAULT FALSE, -- System templates vs user-created
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_floor_plan_library_user ON floor_plan_library(user_id);
CREATE INDEX IF NOT EXISTS idx_floor_plan_library_subtype ON floor_plan_library(subtype_id);
CREATE INDEX IF NOT EXISTS idx_floor_plan_library_active ON floor_plan_library(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_floor_plan_library_name ON floor_plan_library(plan_name);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_floor_plan_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_floor_plan_library_updated_at
    BEFORE UPDATE ON floor_plan_library
    FOR EACH ROW
    EXECUTE FUNCTION update_floor_plan_library_updated_at();

-- Trigger to auto-calculate area_total before insert/update
CREATE OR REPLACE FUNCTION calculate_floor_plan_area_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-calculate total area if not explicitly provided
    IF NEW.area_total IS NULL OR NEW.area_total = 0 THEN
        NEW.area_total := COALESCE(NEW.area_sqft, 0) + COALESCE(NEW.area_outdoor, 0);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_area_total
    BEFORE INSERT OR UPDATE ON floor_plan_library
    FOR EACH ROW
    EXECUTE FUNCTION calculate_floor_plan_area_total();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE floor_plan_library ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own floor plans
CREATE POLICY "Users can view own floor plans"
    ON floor_plan_library
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own floor plans
CREATE POLICY "Users can create own floor plans"
    ON floor_plan_library
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own floor plans
CREATE POLICY "Users can update own floor plans"
    ON floor_plan_library
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own floor plans
CREATE POLICY "Users can delete own floor plans"
    ON floor_plan_library
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get floor plans by subtype
CREATE OR REPLACE FUNCTION get_floor_plans_by_subtype(
    p_user_id UUID,
    p_subtype_id UUID
)
RETURNS TABLE (
    id UUID,
    plan_name VARCHAR,
    plan_code VARCHAR,
    bedrooms DECIMAL,
    bathrooms DECIMAL,
    area_sqft DECIMAL,
    area_total DECIMAL,
    standard_price_sqft DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fp.id,
        fp.plan_name,
        fp.plan_code,
        fp.bedrooms,
        fp.bathrooms,
        fp.area_sqft,
        fp.area_total,
        fp.standard_price_sqft
    FROM floor_plan_library fp
    WHERE fp.user_id = p_user_id
      AND fp.subtype_id = p_subtype_id
      AND fp.is_active = TRUE
    ORDER BY fp.plan_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_floor_plans_by_subtype(UUID, UUID) TO authenticated;

COMMENT ON TABLE floor_plan_library IS 'Reusable floor plans library for quick project setup. Private per user with RLS enforcement.';
