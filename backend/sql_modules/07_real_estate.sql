-- 07_real_estate.sql
-- Real Estate Viability & Execution Module Schema

-- 1. Projects & Locations
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, feasibility, active, completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.project_locations (
    project_id UUID PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
    address_full TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    county VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'USA',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    zoning_code VARCHAR(50),
    lot_size_sqft DECIMAL(12,2),
    lot_size_acres DECIMAL(12,2),
    google_place_id VARCHAR(255)
);

-- Enable RLS
ALTER TABLE public.project_locations ENABLE ROW LEVEL SECURITY;

-- 2. Project Partners (CRM)
CREATE TABLE IF NOT EXISTS public.project_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    role VARCHAR(50), -- 'developer', 'builder', 'architect'
    name VARCHAR(255),
    contact_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_partners ENABLE ROW LEVEL SECURITY;

-- 3. Financial Scenarios (Viability/PPA)
CREATE TABLE IF NOT EXISTS public.financial_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(100) DEFAULT 'Base Scenario',
    is_active BOOLEAN DEFAULT TRUE,
    base_date DATE DEFAULT CURRENT_DATE,
    
    -- Global Revenue Assumptions
    gross_sales_projected DECIMAL(15,2),
    commission_rate DECIMAL(5,2) DEFAULT 6.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.financial_scenarios ENABLE ROW LEVEL SECURITY;

-- 4. Financing Assumptions
CREATE TABLE IF NOT EXISTS public.financing_assumptions (
    scenario_id UUID PRIMARY KEY REFERENCES public.financial_scenarios(id) ON DELETE CASCADE,
    
    -- Construction Loan
    loan_to_cost_ratio DECIMAL(5,2) DEFAULT 80.00,
    interest_rate_annual DECIMAL(5,2) DEFAULT 7.50,
    origination_fee DECIMAL(5,2) DEFAULT 1.00,
    
    -- Equity
    required_equity_percent DECIMAL(5,2),
    repayment_start_trigger VARCHAR(50) DEFAULT 'first_sale'
);

-- Enable RLS
ALTER TABLE public.financing_assumptions ENABLE ROW LEVEL SECURITY;

-- 5. Unit Mix & Sales Strategy
CREATE TABLE IF NOT EXISTS public.units_mix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID REFERENCES public.financial_scenarios(id) ON DELETE CASCADE,
    model_name VARCHAR(100), -- 'Premium', 'Penthouse'
    unit_count INTEGER,
    area_sqft DECIMAL(10,2),
    avg_price DECIMAL(15,2),
    
    -- Sales Curve
    sales_start_month_offset INTEGER DEFAULT 0,
    sales_velocity_per_month DECIMAL(5,2) DEFAULT 1.0,
    
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.units_mix ENABLE ROW LEVEL SECURITY;

-- 6. Budget & Timeline (Planned)
CREATE TABLE IF NOT EXISTS public.project_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID REFERENCES public.financial_scenarios(id) ON DELETE CASCADE,
    phase_name VARCHAR(100),
    start_date DATE,
    duration_months INTEGER,
    display_order INTEGER
);

-- Enable RLS
ALTER TABLE public.project_schedule ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.cost_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID REFERENCES public.financial_scenarios(id) ON DELETE CASCADE,
    
    category VARCHAR(50), -- 'ACQUISITION', 'HARD_COSTS', 'SOFT_COSTS', 'IMPACT_FEES', 'FINANCING'
    item_name VARCHAR(100),
    
    -- Budget Values
    calculation_method VARCHAR(50) DEFAULT 'fixed',
    input_value DECIMAL(15,2),
    total_estimated DECIMAL(15,2),
    
    -- Distribution Curve
    distribution_curve VARCHAR(50) DEFAULT 'linear',
    start_month_offset INTEGER DEFAULT 0,
    duration_months INTEGER DEFAULT 1,
    
    is_impact_fee BOOLEAN DEFAULT FALSE,
    display_order INTEGER
);

-- Enable RLS
ALTER TABLE public.cost_line_items ENABLE ROW LEVEL SECURITY;

-- 7. Actuals Tracking (Investidor/Execução)
CREATE TABLE IF NOT EXISTS public.actual_cashflow_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    month_date DATE NOT NULL,
    cost_item_id UUID REFERENCES public.cost_line_items(id) ON DELETE SET NULL,
    category VARCHAR(50), -- Fallback if item deleted
    
    type VARCHAR(20) DEFAULT 'expense', -- income, expense
    amount DECIMAL(15,2) NOT NULL,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.actual_cashflow_entries ENABLE ROW LEVEL SECURITY;

-- 8. Cash Flow Reporting (The "Cache")
CREATE TABLE IF NOT EXISTS public.monthly_cashflow_report (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID REFERENCES public.financial_scenarios(id) ON DELETE CASCADE,
    month_date DATE,
    project_month_index INTEGER,
    
    -- Projected
    projected_income DECIMAL(15,2) DEFAULT 0,
    projected_costs DECIMAL(15,2) DEFAULT 0,
    projected_net_flow DECIMAL(15,2) DEFAULT 0,
    
    -- Actual
    actual_income DECIMAL(15,2) DEFAULT 0,
    actual_costs DECIMAL(15,2) DEFAULT 0,
    actual_net_flow DECIMAL(15,2) DEFAULT 0,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.monthly_cashflow_report ENABLE ROW LEVEL SECURITY;

-- 9. Investor Guest Access
CREATE TABLE IF NOT EXISTS public.project_guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'investor',
    access_token UUID DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_guests ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_project ON public.financial_scenarios(project_id);
CREATE INDEX IF NOT EXISTS idx_actuals_project_date ON public.actual_cashflow_entries(project_id, month_date);
