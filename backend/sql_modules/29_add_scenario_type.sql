-- 29_add_scenario_type.sql
-- Purpose: Add a machine-readable scenario_type column to financial_scenarios to avoid localization issues
-- Author: Antigravity @ BrixAurea
-- Date: 2026-01-07

-- 1. Add column
ALTER TABLE public.financial_scenarios 
ADD COLUMN IF NOT EXISTS scenario_type VARCHAR(20);

-- 2. Backfill existing scenarios based on their names (covering en, pt, es)
-- Base Case
UPDATE public.financial_scenarios 
SET scenario_type = 'base' 
WHERE scenario_type IS NULL 
AND name IN ('Base Case', 'Base Scenario', 'Caso Base');

-- Optimistic
UPDATE public.financial_scenarios 
SET scenario_type = 'optimistic' 
WHERE scenario_type IS NULL 
AND name IN ('Optimistic', 'Otimista');

-- Pessimistic
UPDATE public.financial_scenarios 
SET scenario_type = 'pessimistic' 
WHERE scenario_type IS NULL 
AND name IN ('Pessimistic', 'Pessimista', 'Pesimista', 'Conservador');

-- 3. Set default for new ones
-- Note: We can't easily set a default that varies, but the app should handle it.

-- 4. Clean up duplicates (OPTIONAL BUT RECOMMENDED)
-- If a project has two 'base' scenarios now, we should probably merge them or at least prioritize the one with units.
-- For now, we'll just let them exist but the app will only pick the 'base' one.
