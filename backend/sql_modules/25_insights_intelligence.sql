-- =====================================================
-- BRIXAUREA INTELLIGENCE: INSIGHTS & MARKET TRENDS
-- =====================================================
-- Purpose: Store articles, market trends, and curated intelligence
-- Author: Erik @ BrixAurea
-- Date: 2026-01-06
-- =====================================================

-- 1. Create insights table (Articles/Blog)
CREATE TABLE IF NOT EXISTS public.insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_pt VARCHAR(255) NOT NULL,
    title_es VARCHAR(255) NOT NULL,
    summary_en TEXT,
    summary_pt TEXT,
    summary_es TEXT,
    content_en TEXT, -- Markdown content
    content_pt TEXT,
    content_es TEXT,
    category VARCHAR(50), -- 'Market', 'Tax', 'Corporate', 'Investment', 'Tech'
    image_url TEXT,
    author_id UUID REFERENCES auth.users(id),
    is_premium BOOLEAN DEFAULT FALSE,
    read_time_minutes INTEGER DEFAULT 5,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create market_trends table (Data points for AI/Dashboards)
-- This stores aggregated, anonymized trends that the AI can reference.
CREATE TABLE IF NOT EXISTS public.market_intelligence_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES property_categories(id),
    subtype_id UUID REFERENCES property_subtypes(id),
    region_code VARCHAR(10), -- 'FL', 'TX', etc.
    city VARCHAR(100),
    metric_name VARCHAR(100), -- 'avg_absorption_rate', 'price_sqft_trend', 'liquidity_index'
    metric_value DECIMAL(15,4),
    entry_date DATE DEFAULT CURRENT_DATE,
    source_name VARCHAR(100) DEFAULT 'BrixAurea Intelligence',
    confidence_level DECIMAL(3,2) DEFAULT 0.90,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_intelligence_data ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Insights are viewable by everyone" ON public.insights;
CREATE POLICY "Insights are viewable by everyone" ON public.insights FOR SELECT USING (true);

DROP POLICY IF EXISTS "Market data viewable by authenticated users" ON public.market_intelligence_data;
CREATE POLICY "Market data viewable by authenticated users" ON public.market_intelligence_data FOR SELECT TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_insights_slug ON public.insights(slug);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_category ON public.market_intelligence_data(category_id, subtype_id);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_region ON public.market_intelligence_data(region_code, city);

-- Comments
COMMENT ON TABLE public.insights IS 'Editorial content and market articles signed by BrixAurea Intelligence.';
COMMENT ON TABLE public.market_intelligence_data IS 'Anonymized and aggregated market data points used for suggestions and AI trends.';
