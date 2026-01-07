-- 30_prevent_duplicate_scenarios.sql
-- Purpose: Prevent duplicate scenarios per project
-- Author: Antigravity @ BrixAurea
-- Date: 2026-01-07

-- Step 1: Delete duplicate scenarios, keeping only the oldest one per type per project
DELETE FROM financial_scenarios
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY project_id, scenario_type 
                ORDER BY created_at ASC, id ASC
            ) as row_num
        FROM financial_scenarios
        WHERE scenario_type IS NOT NULL
    ) t
    WHERE t.row_num > 1
);

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE public.financial_scenarios
ADD CONSTRAINT unique_scenario_per_project 
UNIQUE (project_id, scenario_type);

-- This will ensure only one base, one optimistic, and one pessimistic scenario per project
