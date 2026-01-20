-- 34_modernize_cost_items.sql
-- Purpose: Add organization_id to cost_line_items and update RLS policies to match modern standard
-- Author: Antigravity @ BrixAurea
-- Date: 2026-01-10

-- 1. Add organization_id column
ALTER TABLE public.cost_line_items 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 2. Backfill organization_id from scenarios
UPDATE public.cost_line_items c
SET organization_id = s.organization_id
FROM public.financial_scenarios s
WHERE c.scenario_id = s.id
AND c.organization_id IS NULL;

-- 3. Enable RLS and apply modern policy
ALTER TABLE public.cost_line_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cost items" ON public.cost_line_items;
DROP POLICY IF EXISTS "MODERN_COST_ITEMS_ISOLATION" ON public.cost_line_items;

CREATE POLICY "MODERN_COST_ITEMS_ISOLATION" ON public.cost_line_items
FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

-- 4. Create Index for performance
CREATE INDEX IF NOT EXISTS idx_cost_items_org_v4 ON public.cost_line_items(organization_id);

-- 5. Repeat for project_schedule (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_schedule') THEN
        ALTER TABLE public.project_schedule ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        
        UPDATE public.project_schedule p
        SET organization_id = s.organization_id
        FROM public.financial_scenarios s
        WHERE p.scenario_id = s.id
        AND p.organization_id IS NULL;

        ALTER TABLE public.project_schedule ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can manage own schedules" ON public.project_schedule;
        DROP POLICY IF EXISTS "MODERN_SCHEDULE_ISOLATION" ON public.project_schedule;
        
        EXECUTE 'CREATE POLICY "MODERN_SCHEDULE_ISOLATION" ON public.project_schedule FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()))';
        CREATE INDEX IF NOT EXISTS idx_schedule_org_v4 ON public.project_schedule(organization_id);
    END IF;
END $$;
