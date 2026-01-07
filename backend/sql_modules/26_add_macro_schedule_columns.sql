-- Add schedule columns to financial_scenarios
-- We use financial_scenarios so we can have different timelines for different scenarios
ALTER TABLE public.financial_scenarios
ADD COLUMN IF NOT EXISTS study_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS land_purchase_date DATE,
ADD COLUMN IF NOT EXISTS pre_construction_months INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS construction_months INTEGER DEFAULT 18,
ADD COLUMN IF NOT EXISTS closeout_months INTEGER DEFAULT 3,

-- Granular Groups (Requested by User)
ADD COLUMN IF NOT EXISTS incorp_dd_months INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS incorp_dd_start_offset INTEGER DEFAULT 0,

ADD COLUMN IF NOT EXISTS incorp_projects_months INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS incorp_projects_start_offset INTEGER DEFAULT 0,

ADD COLUMN IF NOT EXISTS incorp_permits_months INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS incorp_permits_start_offset INTEGER DEFAULT 0,

ADD COLUMN IF NOT EXISTS incorp_closing_months INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS incorp_closing_start_offset INTEGER DEFAULT 2,

ADD COLUMN IF NOT EXISTS financing_months INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS financing_start_offset INTEGER DEFAULT 4,

ADD COLUMN IF NOT EXISTS construction_pre_months INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS construction_pre_start_offset INTEGER DEFAULT 6,

ADD COLUMN IF NOT EXISTS construction_main_months INTEGER DEFAULT 16,
ADD COLUMN IF NOT EXISTS construction_main_start_offset INTEGER DEFAULT 8,

ADD COLUMN IF NOT EXISTS sales_duration_months INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS sales_start_offset INTEGER DEFAULT 6,

ADD COLUMN IF NOT EXISTS delivery_months INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS delivery_start_offset INTEGER DEFAULT 24,

ADD COLUMN IF NOT EXISTS manual_absorption_curve JSONB;

COMMENT ON COLUMN public.financial_scenarios.study_date IS 'Starting point of the project analysis (Month 0).';
COMMENT ON COLUMN public.financial_scenarios.land_purchase_date IS 'Date of land acquisition/closing.';
COMMENT ON COLUMN public.financial_scenarios.incorp_projects_months IS 'Duration of Design/Projetos phase.';
COMMENT ON COLUMN public.financial_scenarios.incorp_permits_months IS 'Duration of Permitting/Licenças phase.';
COMMENT ON COLUMN public.financial_scenarios.construction_pre_months IS 'Duration of Pre-construction phase.';
COMMENT ON COLUMN public.financial_scenarios.construction_main_months IS 'Duration of the main Building/Construção phase.';
COMMENT ON COLUMN public.financial_scenarios.sales_duration_months IS 'Estimated total duration of the sales cycle.';
