ALTER TABLE financial_scenarios
ADD COLUMN IF NOT EXISTS variation_percent NUMERIC DEFAULT 0;
