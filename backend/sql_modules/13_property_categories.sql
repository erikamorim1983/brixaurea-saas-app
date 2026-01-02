-- =====================================================
-- FLOOR PLAN LIBRARY: PROPERTY CATEGORIES
-- =====================================================
-- Purpose: Main categories for property development types
-- Author: Erik @ BrixAurea
-- Date: 2026-01-01
-- =====================================================

-- Create property_categories table
CREATE TABLE IF NOT EXISTS property_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_pt VARCHAR(100) NOT NULL,
    name_es VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- emoji or icon identifier
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_categories_key ON property_categories(key);
CREATE INDEX IF NOT EXISTS idx_property_categories_active ON property_categories(is_active);

-- Add trigger for updated_at
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

-- Insert seed data: Main Categories
INSERT INTO property_categories (key, name_en, name_pt, name_es, icon, sort_order, description) VALUES
(
    'residential_for_sale',
    'Residential – For Sale',
    'Residencial – Para Venda',
    'Residencial – En Venta',
    '🏘️',
    1,
    'Traditional real estate development for sale: townhomes, condos, single-family homes. Focus on GDV, absorption, and gross margin.'
),
(
    'residential_for_rent',
    'Residential – For Rent',
    'Residencial – Para Alugar',
    'Residencial – En Alquiler',
    '🏢',
    2,
    'Multifamily income-producing assets: apartments, BTR communities. Focus on NOI, Cap Rate, and DSCR.'
),
(
    'commercial',
    'Commercial',
    'Comercial',
    'Comercial',
    '🏬',
    3,
    'Commercial real estate: retail, office, industrial, self-storage. Focus on lease rates, tenant mix, and yield.'
),
(
    'mixed_use',
    'Mixed Use',
    'Uso Misto',
    'Uso Mixto',
    '🏙️',
    4,
    'Combined-use developments: residential + retail, residential + office. Each component analyzed independently.'
),
(
    'hospitality',
    'Hospitality',
    'Hospitalidade',
    'Hospitalidad',
    '🌴',
    5,
    'Short-term rental and hotel properties. Focus on ADR, occupancy, and RevPAR.'
),
(
    'specialty',
    'Specialty / Niche',
    'Especialidade / Nicho',
    'Especialidad / Nicho',
    '🧓',
    6,
    'Specialized housing: affordable, senior living, assisted living, mobile home parks. High barriers, specific financing.'
)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================
-- Categories are public (read-only for all authenticated users)

ALTER TABLE property_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read categories
CREATE POLICY "Categories are viewable by authenticated users"
    ON property_categories
    FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can modify (insert/update/delete)
-- This ensures data integrity

COMMENT ON TABLE property_categories IS 'Main categories for property development types (Residential, Commercial, etc). Public read-only data.';
