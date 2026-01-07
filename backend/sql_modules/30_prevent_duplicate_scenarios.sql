-- 30_prevent_duplicate_scenarios.sql
-- Purpose: Prevent duplicate scenarios per project
-- Author: Antigravity @ BrixAurea
-- Date: 2026-01-07

-- Add unique constraint to prevent duplicate scenario types per project
ALTER TABLE public.financial_scenarios
ADD CONSTRAINT unique_scenario_per_project 
UNIQUE (project_id, scenario_type);

-- This will ensure only one base, one optimistic, and one pessimistic scenario per project
