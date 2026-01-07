-- =====================================================
-- SEED: BRIXAUREA INTELLIGENCE MARKET DATA
-- =====================================================
-- Purpose: Populate basic market trends for study suggestions
-- =====================================================

-- 1. Insert Sample Market Intelligence Data (Trends)
INSERT INTO public.market_intelligence_data 
(subtype_id, region_code, city, metric_name, metric_value, source_name, confidence_level) 
VALUES
-- Townhomes in Florida
(
    (SELECT id FROM property_subtypes WHERE key = 'townhomes' LIMIT 1),
    'FL', 'Orlando', 'avg_absorption_rate', 4.5, 'BrixAurea Intelligence', 0.95
),
(
    (SELECT id FROM property_subtypes WHERE key = 'townhomes' LIMIT 1),
    'FL', 'Miami', 'avg_absorption_rate', 3.8, 'BrixAurea Intelligence', 0.92
),
-- High-Rise Condos
(
    (SELECT id FROM property_subtypes WHERE key = 'condos_high_rise' LIMIT 1),
    'FL', 'Miami', 'avg_absorption_rate', 2.1, 'BrixAurea Intelligence', 0.88
),
-- Single Family
(
    (SELECT id FROM property_subtypes WHERE key = 'single_family_detached' LIMIT 1),
    'FL', 'Tampa', 'avg_absorption_rate', 5.2, 'BrixAurea Intelligence', 0.94
),
-- Price trends (just examples)
(
    (SELECT id FROM property_subtypes WHERE key = 'condos_high_rise' LIMIT 1),
    'FL', 'Miami', 'price_sqft_avg', 1150.00, 'BrixAurea Intelligence', 0.90
),
(
    (SELECT id FROM property_subtypes WHERE key = 'townhomes' LIMIT 1),
    'FL', 'Orlando', 'price_sqft_avg', 320.00, 'BrixAurea Intelligence', 0.93
);

-- 2. Insert Initial Insights (Sample Articles)
INSERT INTO public.insights 
(slug, title_en, title_pt, title_es, summary_en, summary_pt, summary_es, category, read_time_minutes, is_premium)
VALUES
(
    'ai-real-estate-2026',
    'AI in Real Estate: From Hype to ROI in 2026',
    'IA no Imobiliário: Do Hype ao ROI em 2026',
    'IA en el Sector Inmobiliario: Del Hype al ROI en 2026',
    'Why generative AI is no longer a toy but a core financial tool for modern developers.',
    'Por que a IA generativa não é mais um brinquedo, mas uma ferramenta financeira central.',
    'Por qué la IA generativa ya no es un juguete, sino una herramienta financiera central.',
    'Tech', 6, false
),
(
    'miami-luxury-market-trends',
    'Miami Luxury Market: The New Normal',
    'Mercado de Luxo em Miami: O Novo Normal',
    'Mercado de Lujo en Miami: La Nueva Normalidad',
    'An analysis of absorption rates in Miami for high-end residential projects.',
    'Uma análise das taxas de absorção em Miami para projetos residenciais de alto padrão.',
    'Un análisis de las tasas de absorción en Miami para proyectos residenciales de alta gama.',
    'Market', 8, true
),
(
    'construction-costs-stabilization',
    'Stabilization of Hard Costs: A 2026 Outlook',
    'Estabilização de Hard Costs: Uma Perspectiva para 2026',
    'Estabilización de Hard Costs: Una Perspectiva para 2026',
    'How supply chain improvements are finally slowing down construction cost escalation.',
    'Como as melhorias na cadeia de suprimentos estão finalmente desacelerando a escalada dos custos.',
    'Cómo las mejoras en la cadena de suministro finalmente están frenando la escalada de costos.',
    'Corporate', 5, false
);
