-- ==============================================================================
-- CONSOLIDATED MASTER MODERNIZATION - BRIXAUREA SaaS (V4 - SCHEMA FIX)
-- Resolvendo conflitos de nomes de colunas (member_user_id vs user_id)
-- ==============================================================================

-- 1. Garante a existência da tabela âncora
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    billing_email TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Normalização de Colunas (Idempotente)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.financial_scenarios ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.units_mix ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 3. Backfill com Proteção de Esquema
DO $$
DECLARE
    u_id UUID;
    new_org_id UUID;
    col_exists BOOLEAN;
BEGIN
    FOR u_id IN SELECT DISTINCT user_id FROM public.projects WHERE organization_id IS NULL
    LOOP
        -- Tenta encontrar org existente
        SELECT id INTO new_org_id FROM public.organizations WHERE owner_id = u_id LIMIT 1;
        
        IF new_org_id IS NULL THEN
            INSERT INTO public.organizations (name, owner_id)
            VALUES ('My Organization', u_id)
            RETURNING id INTO new_org_id;
        END IF;

        -- Vincula Projetos e Subscrições
        UPDATE public.projects SET organization_id = new_org_id WHERE user_id = u_id AND organization_id IS NULL;
        UPDATE public.subscriptions SET organization_id = new_org_id WHERE user_id = u_id AND organization_id IS NULL;
        
        -- Atualiza membros usando o nome de coluna correto constatado (member_user_id)
        -- Corrigido: Adicionado a cláusula USING para passar os parâmetros $1 e $2
        EXECUTE 'UPDATE public.organization_members SET organization_id = $1 WHERE member_user_id = $2 AND organization_id IS NULL' 
        USING new_org_id, u_id;
    END LOOP;
END $$;

-- 4. Função de Segurança Blindada (SECURITY DEFINER)
-- Esta função é o segredo para RLS rápido e sem recursão.
CREATE OR REPLACE FUNCTION public.get_my_organizations()
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    -- Organizações onde sou membro
    SELECT organization_id FROM public.organization_members WHERE member_user_id = auth.uid() AND status = 'active'
    UNION
    -- Organizações que eu possuo
    SELECT id FROM public.organizations WHERE owner_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Aplicação das Políticas Modernas
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "MODERN_PROJECTS_ISOLATION" ON public.projects;
CREATE POLICY "MODERN_PROJECTS_ISOLATION" ON public.projects
FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

ALTER TABLE public.financial_scenarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "MODERN_SCENARIOS_ISOLATION" ON public.financial_scenarios;
CREATE POLICY "MODERN_SCENARIOS_ISOLATION" ON public.financial_scenarios
FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

-- 6. Otimização de Performance
CREATE INDEX IF NOT EXISTS idx_projects_org_v4 ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_v4 ON public.organization_members(organization_id, member_user_id);

COMMENT ON TABLE public.organization_members IS 'Modernized member table with dynamic organization linking.';
