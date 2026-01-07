-- MIGRATION: Add missing Sales Strategy columns to financial_scenarios
-- Ensure columns exist for manual adjustments and commissions

ALTER TABLE public.financial_scenarios 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 6.00,
ADD COLUMN IF NOT EXISTS manual_absorption_curve NUMERIC[],
ADD COLUMN IF NOT EXISTS study_date DATE DEFAULT CURRENT_DATE;

-- Add comments for clarity
COMMENT ON COLUMN public.financial_scenarios.commission_rate IS 'Sales commission percentage.';
COMMENT ON COLUMN public.financial_scenarios.manual_absorption_curve IS 'Custom monthly absorption percentages for manual override.';
COMMENT ON COLUMN public.financial_scenarios.study_date IS 'Reference date for the feasibility study.';
