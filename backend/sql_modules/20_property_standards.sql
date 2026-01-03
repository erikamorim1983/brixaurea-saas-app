-- =====================================================
-- PROPERTY STANDARDS / MARKET TIERS
-- =====================================================
-- Purpose: Add market tier (padrão) classification to projects
-- Author: Erik @ BrixAurea
-- Date: 2026-01-02
-- =====================================================

-- 1. Create property_standards table
CREATE TABLE IF NOT EXISTS property_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_pt VARCHAR(100) NOT NULL,
    name_es VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert standard tiers
INSERT INTO property_standards (key, name_en, name_pt, name_es, sort_order) VALUES
('luxury', 'Luxury', 'Luxo / Alto Padrão', 'Lujo / Alto Nivel', 1),
('high_end', 'High-end / Premium', 'Alto Padrão', 'Nivel Alto / Premium', 2),
('mid_market', 'Mid-market', 'Médio Padrão', 'Nivel Medio', 3),
('entry_level', 'Entry-level / Workforce', 'Baixo Padrão / Econômico', 'Nivel Inicial / Económico', 4),
('affordable', 'Affordable', 'Acessível / Social', 'Asequible / Social', 5)
ON CONFLICT (key) DO NOTHING;

-- 3. Add standard_id to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS standard_id UUID REFERENCES property_standards(id) ON DELETE SET NULL;

-- 4. Create index
CREATE INDEX IF NOT EXISTS idx_projects_standard ON projects(standard_id);

-- 5. Enable RLS
ALTER TABLE property_standards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Standards are viewable by authenticated users" ON property_standards FOR SELECT TO authenticated USING (true);

-- 6. Cleanup some subtypes (Optional but recommended to avoid confusion)
-- Rename specific residential subtypes to be more focused on building type
UPDATE property_subtypes SET 
    name_en = 'Condos (Low-Rise)', 
    name_pt = 'Condos (Low-Rise)', 
    name_es = 'Condos (Baja Altura)' 
WHERE key = 'condos_low_rise';

UPDATE property_subtypes SET 
    name_en = 'Condos (Mid-Rise)', 
    name_pt = 'Condos (Mid-Rise)', 
    name_es = 'Condos (Media Altura)' 
WHERE key = 'condos_mid_rise';

UPDATE property_subtypes SET 
    name_en = 'Condos (High-Rise)', 
    name_pt = 'Condos (High-Rise / Torre)', 
    name_es = 'Condos (Torre / Alta Altura)' 
WHERE key = 'condos_high_rise';

-- Add a generic Single Family if needed, but we already have spec/bto
-- Let's add a generic one for those who don't want to specify spec/bto yet
INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, sort_order) 
SELECT id, 'single_family_generic', 'Single Family Home', 'Casa Unifamiliar', 'Casa Unifamiliar', 4
FROM property_categories WHERE key = 'residential_for_sale'
ON CONFLICT (category_id, key) DO NOTHING;

COMMENT ON COLUMN projects.standard_id IS 'Market tier / Standard (Luxury, Mid-market, etc). Refines costs and pricing expectations.';
