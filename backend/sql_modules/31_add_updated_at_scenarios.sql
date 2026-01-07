-- MIGRATION: Add updated_at to financial_scenarios
-- This is often missing in early table definitions and required by various sync logic

ALTER TABLE public.financial_scenarios 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger for auto-updating updated_at (if not already handled)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_financial_scenarios_updated_at ON public.financial_scenarios;
CREATE TRIGGER update_financial_scenarios_updated_at
    BEFORE UPDATE ON public.financial_scenarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
