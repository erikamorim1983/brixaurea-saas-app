-- =====================================================
-- FLOOR PLAN LIBRARY: PROPERTY SUBTYPES
-- =====================================================
-- Purpose: Detailed subtypes for each property category
-- Author: Erik @ BrixAurea
-- Date: 2026-01-01
-- =====================================================

-- Create property_subtypes table
CREATE TABLE IF NOT EXISTS property_subtypes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES property_categories(id) ON DELETE CASCADE,
    key VARCHAR(50) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_pt VARCHAR(100) NOT NULL,
    name_es VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Market Characteristics
    typical_income_level VARCHAR(20), -- 'low', 'medium', 'high', 'very_high'
    typical_liquidity VARCHAR(20), -- 'very_low', 'low', 'medium', 'high', 'very_high'
    typical_complexity VARCHAR(20), -- 'low', 'medium', 'high', 'very_high'
    
    -- Configuration for dynamic fields and validations
    relevant_fields JSONB DEFAULT '{}',
    
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(category_id, key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_property_subtypes_category ON property_subtypes(category_id);
CREATE INDEX IF NOT EXISTS idx_property_subtypes_key ON property_subtypes(key);
CREATE INDEX IF NOT EXISTS idx_property_subtypes_active ON property_subtypes(is_active);

-- Add trigger for updated_at
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

-- =====================================================
-- SEED DATA: RESIDENTIAL - FOR SALE
-- =====================================================

INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order) VALUES

-- Residential - For Sale
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
    'townhomes',
    'Townhomes',
    'Townhomes',
    'Adosados',
    'medium',
    'high',
    'low',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb,
    1
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
    'condos_low_rise',
    'Condos (Low-Rise)',
    'Condos (Baixo)',
    'Condos (Baja Altura)',
    'medium',
    'high',
    'medium',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_hoa": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb,
    2
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
    'condos_mid_rise',
    'Condos (Mid-Rise)',
    'Condos (Médio)',
    'Condos (Media Altura)',
    'medium',
    'medium',
    'medium',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_hoa": true, "has_amenities": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb,
    3
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
    'condos_high_rise',
    'Condos (High-Rise)',
    'Condos (Alto)',
    'Condos (Alta Altura)',
    'high',
    'medium',
    'high',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_hoa": true, "has_amenities": true, "has_concierge": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb,
    4
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
    'single_family_spec',
    'Single Family – Spec Homes',
    'Casa Unifamiliar – Spec',
    'Casa Unifamiliar – Spec',
    'medium',
    'very_high',
    'low',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_lot_size": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb,
    5
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
    'single_family_bto',
    'Single Family – Build to Order',
    'Casa Unifamiliar – Sob Encomenda',
    'Casa Unifamiliar – A Pedido',
    'medium',
    'high',
    'medium',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_lot_size": true, "has_customization": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb,
    6
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
    'villas_patio_homes',
    'Villas / Patio Homes',
    'Villas / Casas Pátio',
    'Villas / Casas Patio',
    'medium',
    'medium',
    'low',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_outdoor_space": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb,
    7
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
    'duplex',
    'Duplex',
    'Duplex',
    'Duplex',
    'medium',
    'high',
    'low',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "units_per_building": 2, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb,
    8
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
    'fourplex',
    'Triplex / Fourplex',
    'Triplex / Fourplex',
    'Triplex / Fourplex',
    'medium',
    'medium',
    'medium',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "units_per_building": 4, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb,
    9
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
    'planned_community',
    'Planned Communities',
    'Condomínios Planejados',
    'Comunidades Planificadas',
    'medium',
    'high',
    'medium',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_amenities": true, "has_hoa": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb,
    10
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_sale'),
    'master_planned_community',
    'Master-Planned Community (MPC)',
    'Comunidade Master-Planejada (MPC)',
    'Comunidad Master-Planificada (MPC)',
    'medium',
    'medium',
    'very_high',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_amenities": true, "has_infrastructure": true, "has_phases": true, "primary_metric": "vgv", "sale_type": "for_sale"}'::jsonb,
    11
);

-- =====================================================
-- SEED DATA: RESIDENTIAL - FOR RENT (MULTIFAMILY)
-- =====================================================

INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order) VALUES
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_rent'),
    'garden_style_apartments',
    'Garden Style Apartments',
    'Apartamentos Estilo Jardim',
    'Apartamentos Estilo Jardín',
    'high',
    'low',
    'medium',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "primary_metric": "noi", "sale_type": "for_rent", "has_cap_rate": true, "has_dscr": true}'::jsonb,
    1
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_rent'),
    'mid_rise_multifamily',
    'Mid-Rise Multifamily',
    'Multifamiliar Médio Porte',
    'Multifamiliar Media Altura',
    'high',
    'low',
    'medium',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_amenities": true, "primary_metric": "noi", "sale_type": "for_rent", "has_cap_rate": true, "has_dscr": true}'::jsonb,
    2
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_rent'),
    'high_rise_multifamily',
    'High-Rise Multifamily',
    'Multifamiliar Alto Porte',
    'Multifamiliar Alta Altura',
    'high',
    'low',
    'high',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_amenities": true, "has_concierge": true, "primary_metric": "noi", "sale_type": "for_rent", "has_cap_rate": true, "has_dscr": true}'::jsonb,
    3
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_rent'),
    'build_to_rent',
    'Build-to-Rent (BTR) Communities',
    'Comunidades Build-to-Rent (BTR)',
    'Comunidades Build-to-Rent (BTR)',
    'high',
    'medium',
    'medium',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_amenities": true, "primary_metric": "noi", "sale_type": "for_rent", "has_cap_rate": true, "has_dscr": true}'::jsonb,
    4
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_rent'),
    'student_housing',
    'Student Housing',
    'Moradia Estudantil',
    'Vivienda Estudiantil',
    'high',
    'low',
    'high',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": false, "bed_by_bed_lease": true, "primary_metric": "noi", "sale_type": "for_rent", "has_cap_rate": true}'::jsonb,
    5
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_rent'),
    'senior_housing_55plus',
    'Senior Housing / 55+',
    'Moradia para Idosos / 55+',
    'Vivienda para Mayores / 55+',
    'high',
    'low',
    'medium',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_amenities": true, "primary_metric": "noi", "sale_type": "for_rent", "has_cap_rate": true}'::jsonb,
    6
),
(
    (SELECT id FROM property_categories WHERE key = 'residential_for_rent'),
    'co_living',
    'Co-Living',
    'Co-Living',
    'Co-Living',
    'medium',
    'low',
    'high',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_common_areas": true, "primary_metric": "noi", "sale_type": "for_rent", "has_cap_rate": true}'::jsonb,
    7
);

-- =====================================================
-- SEED DATA: COMMERCIAL
-- =====================================================

INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order) VALUES
(
    (SELECT id FROM property_categories WHERE key = 'commercial'),
    'retail_strip_mall',
    'Retail Strip Mall',
    'Strip Mall Comercial',
    'Strip Mall Comercial',
    'medium',
    'medium',
    'medium',
    '{"has_bedrooms": false, "has_bathrooms": true, "has_parking": true, "primary_metric": "lease_rate", "sale_type": "for_rent", "has_tenant_mix": true, "has_cam": true}'::jsonb,
    1
),
(
    (SELECT id FROM property_categories WHERE key = 'commercial'),
    'standalone_retail',
    'Standalone Retail (Pad-Ready)',
    'Varejo Independente (Pad-Ready)',
    'Comercio Independiente (Pad-Ready)',
    'medium',
    'high',
    'low',
    '{"has_bedrooms": false, "has_bathrooms": true, "has_parking": true, "primary_metric": "lease_rate", "sale_type": "for_rent", "triple_net": true}'::jsonb,
    2
),
(
    (SELECT id FROM property_categories WHERE key = 'commercial'),
    'office_low_rise',
    'Office – Low Rise',
    'Escritório – Baixo',
    'Oficina – Baja Altura',
    'medium',
    'medium',
    'medium',
    '{"has_bedrooms": false, "has_bathrooms": true, "has_parking": true, "primary_metric": "lease_rate", "sale_type": "for_rent", "has_cam": true}'::jsonb,
    3
),
(
    (SELECT id FROM property_categories WHERE key = 'commercial'),
    'medical_office_building',
    'Medical Office Building (MOB)',
    'Edifício Médico (MOB)',
    'Edificio Médico (MOB)',
    'high',
    'medium',
    'high',
    '{"has_bedrooms": false, "has_bathrooms": true, "has_parking": true, "primary_metric": "lease_rate", "sale_type": "for_rent", "has_cam": true, "medical_grade": true}'::jsonb,
    4
),
(
    (SELECT id FROM property_categories WHERE key = 'commercial'),
    'warehouse_industrial',
    'Warehouse / Industrial',
    'Galpão / Industrial',
    'Almacén / Industrial',
    'high',
    'high',
    'low',
    '{"has_bedrooms": false, "has_bathrooms": true, "has_loading_docks": true, "primary_metric": "lease_rate", "sale_type": "for_rent", "triple_net": true}'::jsonb,
    5
),
(
    (SELECT id FROM property_categories WHERE key = 'commercial'),
    'flex_space',
    'Flex Space',
    'Espaço Flexível',
    'Espacio Flexible',
    'medium',
    'medium',
    'low',
    '{"has_bedrooms": false, "has_bathrooms": true, "has_parking": true, "primary_metric": "lease_rate", "sale_type": "for_rent"}'::jsonb,
    6
),
(
    (SELECT id FROM property_categories WHERE key = 'commercial'),
    'self_storage',
    'Self-Storage',
    'Self-Storage',
    'Almacenamiento',
    'high',
    'high',
    'low',
    '{"has_bedrooms": false, "has_bathrooms": false, "unit_based": true, "primary_metric": "noi", "sale_type": "for_rent", "has_cap_rate": true}'::jsonb,
    7
),
(
    (SELECT id FROM property_categories WHERE key = 'commercial'),
    'data_center',
    'Data Center',
    'Data Center',
    'Centro de Datos',
    'very_high',
    'low',
    'very_high',
    '{"has_bedrooms": false, "has_bathrooms": true, "has_specialized_infrastructure": true, "primary_metric": "lease_rate", "sale_type": "for_rent", "triple_net": true}'::jsonb,
    8
);

-- =====================================================
-- SEED DATA: HOSPITALITY
-- =====================================================

INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order) VALUES
(
    (SELECT id FROM property_categories WHERE key = 'hospitality'),
    'vacation_homes',
    'Vacation Homes',
    'Casas de Férias',
    'Casas Vacacionales',
    'high',
    'medium',
    'high',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "primary_metric": "revpar", "sale_type": "str", "has_adr": true, "has_occupancy": true}'::jsonb,
    1
),
(
    (SELECT id FROM property_categories WHERE key = 'hospitality'),
    'str_communities',
    'Short-Term Rental Communities',
    'Comunidades de Aluguel Temporário',
    'Comunidades de Alquiler a Corto Plazo',
    'high',
    'medium',
    'high',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_amenities": true, "primary_metric": "revpar", "sale_type": "str", "has_adr": true, "has_occupancy": true}'::jsonb,
    2
),
(
    (SELECT id FROM property_categories WHERE key = 'hospitality'),
    'condo_hotel',
    'Condo-Hotel',
    'Condo-Hotel',
    'Condo-Hotel',
    'high',
    'medium',
    'very_high',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "mixed_ownership": true, "primary_metric": "revpar", "sale_type": "mixed", "has_adr": true, "has_occupancy": true}'::jsonb,
    3
),
(
    (SELECT id FROM property_categories WHERE key = 'hospitality'),
    'boutique_hotel',
    'Boutique Hotel',
    'Hotel Boutique',
    'Hotel Boutique',
    'high',
    'low',
    'very_high',
    '{"has_bedrooms": false, "has_keys": true, "has_bathrooms": true, "has_parking": true, "has_amenities": true, "primary_metric": "revpar", "sale_type": "for_rent", "has_adr": true, "has_occupancy": true}'::jsonb,
    4
),
(
    (SELECT id FROM property_categories WHERE key = 'hospitality'),
    'extended_stay',
    'Extended Stay',
    'Estadia Prolongada',
    'Estadía Prolongada',
    'medium',
    'medium',
    'medium',
    '{"has_bedrooms": false, "has_keys": true, "has_bathrooms": true, "has_parking": true, "has_kitchen": true, "primary_metric": "revpar", "sale_type": "for_rent", "has_adr": true, "has_occupancy": true}'::jsonb,
    5
);

-- =====================================================
-- SEED DATA: MIXED USE
-- =====================================================

INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order) VALUES
(
    (SELECT id FROM property_categories WHERE key = 'mixed_use'),
    'residential_retail',
    'Residential + Retail',
    'Residencial + Comercial',
    'Residencial + Comercial',
    'medium',
    'medium',
    'high',
    '{"has_multiple_components": true, "primary_metric": "blended", "sale_type": "mixed"}'::jsonb,
    1
),
(
    (SELECT id FROM property_categories WHERE key = 'mixed_use'),
    'residential_office',
    'Residential + Office',
    'Residencial + Escritório',
    'Residencial + Oficina',
    'medium',
    'medium',
    'high',
    '{"has_multiple_components": true, "primary_metric": "blended", "sale_type": "mixed"}'::jsonb,
    2
),
(
    (SELECT id FROM property_categories WHERE key = 'mixed_use'),
    'residential_hotel',
    'Residential + Hotel',
    'Residencial + Hotel',
    'Residencial + Hotel',
    'high',
    'low',
    'very_high',
    '{"has_multiple_components": true, "primary_metric": "blended", "sale_type": "mixed"}'::jsonb,
    3
),
(
    (SELECT id FROM property_categories WHERE key = 'mixed_use'),
    'live_work_play',
    'Live-Work-Play Developments',
    'Desenvolvimentos Live-Work-Play',
    'Desarrollos Live-Work-Play',
    'high',
    'medium',
    'very_high',
    '{"has_multiple_components": true, "primary_metric": "blended", "sale_type": "mixed", "has_amenities": true}'::jsonb,
    4
),
(
    (SELECT id FROM property_categories WHERE key = 'mixed_use'),
    'tod',
    'Transit-Oriented Developments (TOD)',
    'Desenvolvimentos Orientados ao Transporte (TOD)',
    'Desarrollos Orientados al Transporte (TOD)',
    'high',
    'medium',
    'very_high',
    '{"has_multiple_components": true, "primary_metric": "blended", "sale_type": "mixed", "has_transit_access": true}'::jsonb,
    5
);

-- =====================================================
-- SEED DATA: SPECIALTY / NICHE
-- =====================================================

INSERT INTO property_subtypes (category_id, key, name_en, name_pt, name_es, typical_income_level, typical_liquidity, typical_complexity, relevant_fields, sort_order) VALUES
(
    (SELECT id FROM property_categories WHERE key = 'specialty'),
    'affordable_housing',
    'Affordable Housing',
    'Habitação Acessível',
    'Vivienda Asequible',
    'medium',
    'low',
    'high',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_subsidies": true, "has_tax_credits": true, "primary_metric": "noi", "sale_type": "for_rent"}'::jsonb,
    1
),
(
    (SELECT id FROM property_categories WHERE key = 'specialty'),
    'workforce_housing',
    'Workforce Housing',
    'Habitação para Trabalhadores',
    'Vivienda para Trabajadores',
    'medium',
    'medium',
    'medium',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "primary_metric": "noi", "sale_type": "for_rent"}'::jsonb,
    2
),
(
    (SELECT id FROM property_categories WHERE key = 'specialty'),
    'senior_living',
    'Senior Living',
    'Residência para Idosos',
    'Residencia para Mayores',
    'high',
    'low',
    'high',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_parking": true, "has_care_services": true, "primary_metric": "noi", "sale_type": "for_rent"}'::jsonb,
    3
),
(
    (SELECT id FROM property_categories WHERE key = 'specialty'),
    'assisted_living',
    'Assisted Living',
    'Residência Assistida',
    'Residencia Asistida',
    'high',
    'low',
    'very_high',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_care_services": true, "has_medical_staff": true, "primary_metric": "noi", "sale_type": "for_rent"}'::jsonb,
    4
),
(
    (SELECT id FROM property_categories WHERE key = 'specialty'),
    'memory_care',
    'Memory Care',
    'Cuidados de Memória',
    'Cuidado de Memoria',
    'very_high',
    'low',
    'very_high',
    '{"has_bedrooms": true, "has_bathrooms": true, "has_specialized_care": true, "has_medical_staff": true, "primary_metric": "noi", "sale_type": "for_rent"}'::jsonb,
    5
),
(
    (SELECT id FROM property_categories WHERE key = 'specialty'),
    'mobile_home_park',
    'Mobile Home Park (MHP)',
    'Parque de Casas Móveis (MHP)',
    'Parque de Casas Móviles (MHP)',
    'high',
    'high',
    'medium',
    '{"has_bedrooms": false, "has_pads": true, "has_utilities": true, "primary_metric": "noi", "sale_type": "for_rent", "has_cap_rate": true}'::jsonb,
    6
),
(
    (SELECT id FROM property_categories WHERE key = 'specialty'),
    'rv_park',
    'RV Park',
    'Parque de RVs',
    'Parque de RVs',
    'medium',
    'high',
    'low',
    '{"has_bedrooms": false, "has_pads": true, "has_utilities": true, "primary_metric": "noi", "sale_type": "for_rent"}'::jsonb,
    7
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE property_subtypes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read subtypes
CREATE POLICY "Subtypes are viewable by authenticated users"
    ON property_subtypes
    FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can modify (insert/update/delete)

COMMENT ON TABLE property_subtypes IS 'Detailed subtypes for each property category with market characteristics and configuration for dynamic fields.';
