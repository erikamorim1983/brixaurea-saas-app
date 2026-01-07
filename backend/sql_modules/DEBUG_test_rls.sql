-- DEBUG: Testar se o usuário atual pode ver as unidades
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar qual é o user_id atual
SELECT auth.uid() as current_user_id;

-- 2. Verificar se o projeto pertence ao usuário atual
SELECT 
    id,
    user_id,
    name,
    (user_id = auth.uid()) as is_owner
FROM projects 
WHERE id = '7c73c299-9410-471d-b203-7711e3f4e4d7';

-- 3. Testar a política RLS de financial_scenarios
SELECT 
    id,
    name,
    scenario_type,
    project_id,
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()) as rls_check
FROM financial_scenarios
WHERE project_id = '7c73c299-9410-471d-b203-7711e3f4e4d7';

-- 4. Testar a política RLS de units_mix
SELECT 
    u.id,
    u.model_name,
    u.scenario_id,
    u.scenario_id IN (
        SELECT id FROM public.financial_scenarios 
        WHERE project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    ) as rls_check
FROM units_mix u
WHERE u.scenario_id = '4edb8cf6-5697-4abe-8cd3-0d01d6735abe';

-- 5. Se RLS estiver bloqueando, desabilite temporariamente para confirmar
-- (NÃO FAÇA ISSO EM PRODUÇÃO!)
-- ALTER TABLE units_mix DISABLE ROW LEVEL SECURITY;
