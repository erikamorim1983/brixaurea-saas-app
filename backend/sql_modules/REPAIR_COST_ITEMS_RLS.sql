-- REPAIR_COST_ITEMS_RLS.sql
-- Purpose: Backfill missing organization_id for cost_line_items and project_schedule to fix deletion and visibility issues.
-- Author: Antigravity @ BrixAurea
-- Date: 2026-01-20

BEGIN;

-- 1. Backfill cost_line_items orphaned by previous sync scripts or old bugs
UPDATE public.cost_line_items c
SET organization_id = s.organization_id
FROM public.financial_scenarios s
WHERE c.scenario_id = s.id
AND c.organization_id IS NULL
AND s.organization_id IS NOT NULL;

-- 2. Backfill project_schedule orphans (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_schedule') THEN
        UPDATE public.project_schedule p
        SET organization_id = s.organization_id
        FROM public.financial_scenarios s
        WHERE p.scenario_id = s.id
        AND p.organization_id IS NULL
        AND s.organization_id IS NOT NULL;
    END IF;
END $$;

-- 3. Safety check: Ensure no items are left without organization_id if their project has one
-- This handles cases where scenario might be missing org_id but project has it
UPDATE public.cost_line_items c
SET organization_id = prj.organization_id
FROM public.financial_scenarios s
JOIN public.projects prj ON s.project_id = prj.id
WHERE c.scenario_id = s.id
AND c.organization_id IS NULL
AND prj.organization_id IS NOT NULL;

COMMIT;

-- Verification query:
-- SELECT id, item_name, organization_id FROM public.cost_line_items WHERE organization_id IS NULL;
