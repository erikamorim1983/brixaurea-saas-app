-- =====================================================
-- SUPER REPAIR: FLOOR PLAN VISIBILITY & DATA RECOVERY
-- =====================================================
-- Purpose: Ensure all floor plans are visible to their owners/org members
-- and fix any column/naming issues once and for all.
-- =====================================================

ALTER TABLE public.floor_plan_library 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS architect_firm VARCHAR(255),
ADD COLUMN IF NOT EXISTS half_baths INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stories INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS plan_width_lf DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS plan_depth_lf DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_pool BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS living_area_sqft DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS entry_area_sqft DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS lanai_area_sqft DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS garage_area_sqft DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_const_area_sqft DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS construction_duration_months INTEGER DEFAULT 10;

ALTER TABLE public.floor_plan_library
ADD COLUMN IF NOT EXISTS construction_curve JSONB DEFAULT '{"type": "linear", "percentages": []}';

-- 2. DATA RECOVERY: Force backfill of organization_id
-- We try to find the organization where the user is either the owner or a member
UPDATE public.floor_plan_library f
SET organization_id = (
    -- Try to find membership organization
    SELECT om.organization_id 
    FROM public.organization_members om 
    WHERE om.member_user_id = f.user_id 
    LIMIT 1
)
WHERE f.organization_id IS NULL;

-- If still NULL, try to find an organization they OWN
UPDATE public.floor_plan_library f
SET organization_id = (
    SELECT o.id 
    FROM public.organizations o 
    WHERE o.owner_id = f.user_id 
    LIMIT 1
)
WHERE f.organization_id IS NULL;

-- 3. RLS POLICIES: Maximum Visibility for Owners
-- First, clean up
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'floor_plan_library' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.floor_plan_library', pol.policyname);
    END LOOP;
END $$;

ALTER TABLE public.floor_plan_library ENABLE ROW LEVEL SECURITY;

-- Policy: Select (View)
-- Allows view if:
-- a) You are the individual creator (fallback for old data)
-- b) You belong to the organization via organization_members
-- c) You ARE the owner of the organization
CREATE POLICY "Floor Plan View Policy" ON public.floor_plan_library
FOR SELECT USING (
    auth.uid() = user_id -- Direct ownership fallback
    OR 
    organization_id IN (
        SELECT om.organization_id 
        FROM public.organization_members om 
        WHERE om.member_user_id = auth.uid()
        UNION
        SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
);

-- Policy: Insert
CREATE POLICY "Floor Plan Insert Policy" ON public.floor_plan_library
FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

-- Policy: Update
CREATE POLICY "Floor Plan Update Policy" ON public.floor_plan_library
FOR UPDATE USING (
    auth.uid() = user_id
    OR
    organization_id IN (
        SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
);

-- Policy: Delete
CREATE POLICY "Floor Plan Delete Policy" ON public.floor_plan_library
FOR DELETE USING (
    auth.uid() = user_id
    OR
    organization_id IN (
        SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
);

-- 4. PROPERTY SUBTYPES FIX
-- Ensure 'single_family_generic' exists
INSERT INTO public.property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order)
SELECT 
    id, 
    'single_family_generic', 
    'Single Family', 
    'Single Family', -- Using the name user preferred
    'Casa Unifamiliar', 
    'medium', 
    'very_high', 
    'low', 
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_lot_size": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb,
    0
FROM public.property_categories 
WHERE key = 'residential_for_sale'
ON CONFLICT (category_id, key) DO UPDATE 
SET name_pt = 'Single Family', is_active = true;

-- Ensure all common ones are active
UPDATE public.property_subtypes 
SET is_active = true 
WHERE key IN ('single_family_generic', 'single_family_spec', 'single_family_bto', 'townhomes', 'condos_low_rise');

-- 5. Trigger update (float precision fix)
CREATE OR REPLACE FUNCTION validate_floor_plan_curve()
RETURNS TRIGGER AS $$
DECLARE
    p_sum NUMERIC := 0;
    p_item NUMERIC;
    p_array JSONB;
BEGIN
    p_array := NEW.construction_curve->'percentages';
    IF p_array IS NOT NULL AND jsonb_array_length(p_array) > 0 THEN
        FOR p_item IN SELECT * FROM jsonb_array_elements_text(p_array) LOOP
            p_sum := p_sum + p_item::NUMERIC;
        END LOOP;
        IF ABS(p_sum - 100) > 0.5 THEN -- Larger tolerance for manual input
            RAISE EXCEPTION 'Construction curve percentages must sum to 100 (current: %)', p_sum;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_floor_plan_curve ON public.floor_plan_library;
CREATE TRIGGER trigger_validate_floor_plan_curve
    BEFORE INSERT OR UPDATE ON public.floor_plan_library
    FOR EACH ROW
    EXECUTE FUNCTION validate_floor_plan_curve();
