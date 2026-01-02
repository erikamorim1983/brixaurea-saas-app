-- =====================================================
-- FLOOR PLAN LIBRARY: COMPLETE SETUP SCRIPT
-- =====================================================
-- Purpose: Execute ALL floor plan library setup in one go
-- Author: Erik @ BrixAurea
-- Date: 2026-01-01
-- 
-- INSTRUCTIONS:
-- 1. Open Supabase SQL Editor
-- 2. Copy and paste this ENTIRE file
-- 3. Click "Run" (or F5)
-- 4. Refresh your app
-- =====================================================

-- =====================================================
-- PART 1: PROPERTY CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS property_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_pt VARCHAR(100) NOT NULL,
    name_es VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_categories_key ON property_categories(key);
CREATE INDEX IF NOT EXISTS idx_property_categories_active ON property_categories(is_active);

CREATE OR REPLACE FUNCTION update_property_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_property_categories_updated_at
    BEFORE UPDATE ON property_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_property_categories_updated_at();

-- Insert Categories
INSERT INTO property_categories (key, name_en, name_pt, name_es, icon, sort_order, description) VALUES
('residential_for_sale', 'Residential – For Sale', 'Residencial – Para Venda', 'Residencial – En Venta', '🏘️', 1, 'Traditional real estate development for sale'),
('residential_for_rent', 'Residential – For Rent', 'Residencial – Para Alugar', 'Residencial – En Alquiler', '🏢', 2, 'Multifamily income-producing assets'),
('commercial', 'Commercial', 'Comercial', 'Comercial', '🏬', 3, 'Commercial real estate'),
('mixed_use', 'Mixed Use', 'Uso Misto', 'Uso Mixto', '🏙️', 4, 'Combined-use developments'),
('hospitality', 'Hospitality', 'Hospitalidade', 'Hospitalidad', '🌴', 5, 'Short-term rental and hotel properties'),
('specialty', 'Specialty / Niche', 'Especialidade / Nicho', 'Especialidad / Nicho', '🧓', 6, 'Specialized housing')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE property_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by authenticated users"
    ON property_categories FOR SELECT TO authenticated USING (true);

-- =====================================================
-- PART 2: PROPERTY SUBTYPES
-- =====================================================

CREATE TABLE IF NOT EXISTS property_subtypes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES property_categories(id) ON DELETE CASCADE,
    key VARCHAR(50) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_pt VARCHAR(100) NOT NULL,
    name_es VARCHAR(100) NOT NULL,
    description TEXT,
    typical_income_level VARCHAR(20),
    typical_liquidity VARCHAR(20),
    typical_complexity VARCHAR(20),
    relevant_fields JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id, key)
);

CREATE INDEX IF NOT EXISTS idx_property_subtypes_category ON property_subtypes(category_id);
CREATE INDEX IF NOT EXISTS idx_property_subtypes_key ON property_subtypes(key);

CREATE OR REPLACE FUNCTION update_property_subtypes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_property_subtypes_updated_at
    BEFORE UPDATE ON property_subtypes
    FOR EACH ROW
    EXECUTE FUNCTION update_property_subtypes_updated_at();

-- Insert Subtypes (Residential - For Sale)
INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order) VALUES
((SELECT id FROM property_categories WHERE key = 'residential_for_sale'), 'townhomes', 'Townhomes', 'Townhomes', 'Adosados', 'medium', 'high', 'low', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "vgv"}'::jsonb, 1),
((SELECT id FROM property_categories WHERE key = 'residential_for_sale'), 'condos_low_rise', 'Condos (Low-Rise)', 'Condos (Baixo)', 'Condos (Baja Altura)', 'medium', 'high', 'medium', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "vgv"}'::jsonb, 2),
((SELECT id FROM property_categories WHERE key = 'residential_for_sale'), 'condos_mid_rise', 'Condos (Mid-Rise)', 'Condos (Médio)', 'Condos (Media Altura)', 'medium', 'medium', 'medium', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "vgv"}'::jsonb, 3),
((SELECT id FROM property_categories WHERE key = 'residential_for_sale'), 'condos_high_rise', 'Condos (High-Rise)', 'Condos (Alto)', 'Condos (Alta Altura)', 'high', 'medium', 'high', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "vgv"}'::jsonb, 4),
((SELECT id FROM property_categories WHERE key = 'residential_for_sale'), 'single_family_spec', 'Single Family – Spec Homes', 'Casa Unifamiliar – Spec', 'Casa Unifamiliar – Spec', 'medium', 'very_high', 'low', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "vgv"}'::jsonb, 5),
((SELECT id FROM property_categories WHERE key = 'residential_for_sale'), 'single_family_bto', 'Single Family – Build to Order', 'Casa Unifamiliar – Sob Encomenda', 'Casa Unifamiliar – A Pedido', 'medium', 'high', 'medium', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "vgv"}'::jsonb, 6),
((SELECT id FROM property_categories WHERE key = 'residential_for_sale'), 'villas_patio_homes', 'Villas / Patio Homes', 'Villas / Casas Pátio', 'Villas / Casas Patio', 'medium', 'medium', 'low', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "vgv"}'::jsonb, 7),
((SELECT id FROM property_categories WHERE key = 'residential_for_sale'), 'duplex', 'Duplex', 'Duplex', 'Duplex', 'medium', 'high', 'low', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "vgv"}'::jsonb, 8);

-- Insert Subtypes (Residential - For Rent)
INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order) VALUES
((SELECT id FROM property_categories WHERE key = 'residential_for_rent'), 'garden_style_apartments', 'Garden Style Apartments', 'Apartamentos Estilo Jardim', 'Apartamentos Estilo Jardín', 'high', 'low', 'medium', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "noi"}'::jsonb, 1),
((SELECT id FROM property_categories WHERE key = 'residential_for_rent'), 'mid_rise_multifamily', 'Mid-Rise Multifamily', 'Multifamiliar Médio Porte', 'Multifamiliar Media Altura', 'high', 'low', 'medium', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "noi"}'::jsonb, 2),
((SELECT id FROM property_categories WHERE key = 'residential_for_rent'), 'high_rise_multifamily', 'High-Rise Multifamily', 'Multifamiliar Alto Porte', 'Multifamiliar Alta Altura', 'high', 'low', 'high', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "noi"}'::jsonb, 3);

-- Insert Subtypes (Commercial)
INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order) VALUES
((SELECT id FROM property_categories WHERE key = 'commercial'), 'retail_strip_mall', 'Retail Strip Mall', 'Strip Mall Comercial', 'Strip Mall Comercial', 'medium', 'medium', 'medium', '{"has_bedrooms": false, "has_bathrooms": true, "primary_metric": "lease_rate"}'::jsonb, 1),
((SELECT id FROM property_categories WHERE key = 'commercial'), 'office_low_rise', 'Office – Low Rise', 'Escritório – Baixo', 'Oficina – Baja Altura', 'medium', 'medium', 'medium', '{"has_bedrooms": false, "has_bathrooms": true, "primary_metric": "lease_rate"}'::jsonb, 2),
((SELECT id FROM property_categories WHERE key = 'commercial'), 'warehouse_industrial', 'Warehouse / Industrial', 'Galpão / Industrial', 'Almacén / Industrial', 'high', 'high', 'low', '{"has_bedrooms": false, "has_bathrooms": true, "primary_metric": "lease_rate"}'::jsonb, 3);

-- Insert Subtypes (Hospitality)
INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order) VALUES
((SELECT id FROM property_categories WHERE key = 'hospitality'), 'vacation_homes', 'Vacation Homes', 'Casas de Férias', 'Casas Vacacionales', 'high', 'medium', 'high', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "revpar"}'::jsonb, 1),
((SELECT id FROM property_categories WHERE key = 'hospitality'), 'condo_hotel', 'Condo-Hotel', 'Condo-Hotel', 'Condo-Hotel', 'high', 'medium', 'very_high', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "revpar"}'::jsonb, 2);

-- Insert Subtypes (Mixed Use)
INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order) VALUES
((SELECT id FROM property_categories WHERE key = 'mixed_use'), 'residential_retail', 'Residential + Retail', 'Residencial + Comercial', 'Residencial + Comercial', 'medium', 'medium', 'high', '{"has_multiple_components": true, "primary_metric": "blended"}'::jsonb, 1);

-- Insert Subtypes (Specialty)
INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order) VALUES
((SELECT id FROM property_categories WHERE key = 'specialty'), 'affordable_housing', 'Affordable Housing', 'Habitação Acessível', 'Vivienda Asequible', 'medium', 'low', 'high', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "noi"}'::jsonb, 1),
((SELECT id FROM property_categories WHERE key = 'specialty'), 'senior_living', 'Senior Living', 'Residência para Idosos', 'Residencia para Mayores', 'high', 'low', 'high', '{"has_bedrooms": true, "has_bathrooms": true, "primary_metric": "noi"}'::jsonb, 2);

ALTER TABLE property_subtypes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subtypes are viewable by authenticated users"
    ON property_subtypes FOR SELECT TO authenticated USING (true);

-- =====================================================
-- PART 3: FLOOR PLAN LIBRARY
-- =====================================================

CREATE TABLE IF NOT EXISTS floor_plan_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subtype_id UUID REFERENCES property_subtypes(id) ON DELETE SET NULL,
    plan_name VARCHAR(100) NOT NULL,
    plan_code VARCHAR(50),
    bedrooms DECIMAL(3,1) DEFAULT 0,
    bathrooms DECIMAL(3,1) DEFAULT 0,
    suites INTEGER DEFAULT 0,
    garages INTEGER DEFAULT 0,
    area_sqft DECIMAL(10,2),
    area_outdoor DECIMAL(10,2),
    area_total DECIMAL(10,2),
    standard_cost_sqft DECIMAL(10,2),
    standard_price_sqft DECIMAL(10,2),
    custom_attributes JSONB DEFAULT '{}',
    floor_plan_image_url TEXT,
    rendering_url TEXT,
    notes TEXT,
    is_template BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_floor_plan_library_user ON floor_plan_library(user_id);
CREATE INDEX IF NOT EXISTS idx_floor_plan_library_subtype ON floor_plan_library(subtype_id);

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

CREATE OR REPLACE FUNCTION calculate_floor_plan_area_total()
RETURNS TRIGGER AS $$
BEGIN
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

ALTER TABLE floor_plan_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own floor plans"
    ON floor_plan_library FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own floor plans"
    ON floor_plan_library FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own floor plans"
    ON floor_plan_library FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own floor plans"
    ON floor_plan_library FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================
-- PART 4: UPDATE UNITS_MIX TABLE
-- =====================================================

ALTER TABLE units_mix 
ADD COLUMN IF NOT EXISTS floor_plan_id UUID REFERENCES floor_plan_library(id) ON DELETE SET NULL;

ALTER TABLE units_mix
ADD COLUMN IF NOT EXISTS subtype_id UUID REFERENCES property_subtypes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_units_mix_floor_plan ON units_mix(floor_plan_id);
CREATE INDEX IF NOT EXISTS idx_units_mix_subtype ON units_mix(subtype_id);

CREATE OR REPLACE FUNCTION populate_unit_from_floor_plan()
RETURNS TRIGGER AS $$
DECLARE
    fp_record RECORD;
BEGIN
    IF NEW.floor_plan_id IS NOT NULL THEN
        SELECT plan_name, bedrooms, bathrooms, suites, garages, area_sqft, area_outdoor, area_total, standard_price_sqft, subtype_id
        INTO fp_record
        FROM floor_plan_library
        WHERE id = NEW.floor_plan_id;
        
        IF NEW.model_name IS NULL OR NEW.model_name = '' THEN
            NEW.model_name := fp_record.plan_name;
        END IF;
        
        IF NEW.bedrooms IS NULL OR NEW.bedrooms = 0 THEN
            NEW.bedrooms := fp_record.bedrooms;
        END IF;
        
        IF NEW.bathrooms IS NULL OR NEW.bathrooms = 0 THEN
            NEW.bathrooms := fp_record.bathrooms;
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
        
        IF (NEW.price_sqft IS NULL OR NEW.price_sqft = 0) AND fp_record.standard_price_sqft IS NOT NULL THEN
            NEW.price_sqft := fp_record.standard_price_sqft;
        END IF;
        
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

-- =====================================================
-- PART 5: UPDATE PROJECTS TABLE
-- =====================================================

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES property_categories(id) ON DELETE SET NULL;

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS subtype_id UUID REFERENCES property_subtypes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_subtype ON projects(subtype_id);

-- =====================================================
-- DONE!
-- =====================================================
-- All tables created, indexes added, RLS enabled!
-- Your app should now work without errors.
-- =====================================================
