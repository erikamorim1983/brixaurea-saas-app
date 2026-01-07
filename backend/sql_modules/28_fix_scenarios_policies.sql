-- 28_fix_scenarios_policies.sql
-- Purpose: Ensure financial_scenarios and related tables have proper RLS policies
-- Author: Antigravity @ BrixAurea
-- Date: 2026-01-07

-- 1. financial_scenarios
ALTER TABLE public.financial_scenarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own financial scenarios" ON public.financial_scenarios;
CREATE POLICY "Users can manage own financial scenarios" ON public.financial_scenarios
FOR ALL USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
);

-- 2. units_mix
ALTER TABLE public.units_mix ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own units mix" ON public.units_mix;
CREATE POLICY "Users can manage own units mix" ON public.units_mix
FOR ALL USING (
    scenario_id IN (
        SELECT id FROM public.financial_scenarios 
        WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    )
);

-- 3. cost_line_items
ALTER TABLE public.cost_line_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cost items" ON public.cost_line_items;
CREATE POLICY "Users can manage own cost items" ON public.cost_line_items
FOR ALL USING (
    scenario_id IN (
        SELECT id FROM public.financial_scenarios 
        WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    )
);

-- 4. project_schedule (Skipped if not exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_schedule') THEN
        ALTER TABLE public.project_schedule ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can manage own schedules" ON public.project_schedule;
        EXECUTE 'CREATE POLICY "Users can manage own schedules" ON public.project_schedule FOR ALL USING (scenario_id IN (SELECT id FROM public.financial_scenarios WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())))';
    END IF;
END $$;
