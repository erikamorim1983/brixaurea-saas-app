-- Add Sales Strategy columns to financial_scenarios
ALTER TABLE public.financial_scenarios 
ADD COLUMN IF NOT EXISTS absorption_rate_monthly DECIMAL(5,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS sales_start_offset INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS marketing_cost_percent DECIMAL(5,2) DEFAULT 2.00,
ADD COLUMN IF NOT EXISTS deposit_structure JSONB DEFAULT '{"initial_deposit": 10, "second_deposit": 10, "closing_funding": 80}'::jsonb;

COMMENT ON COLUMN public.financial_scenarios.absorption_rate_monthly IS 'Suggested monthly sales absorption rate (%) for the entire project.';
COMMENT ON COLUMN public.financial_scenarios.sales_start_offset IS 'Number of months from T0 to start selling.';
COMMENT ON COLUMN public.financial_scenarios.marketing_cost_percent IS 'Projected marketing costs as % of Gross Revenue.';
COMMENT ON COLUMN public.financial_scenarios.deposit_structure IS 'Payment structure breakdown (e.g., 10% down, 10% during construction, 80% at closing).';
