-- ============================================
-- EMERGENCY FIX: PROJECT VISIBILITY & USA LOCK
-- ============================================

-- 1. Redefinir a política de segurança (RLS) para ser mais inclusiva
-- Permite que o criador veja o projeto mesmo que não tenha Organization vinculada.
DROP POLICY IF EXISTS "MODERN_PROJECTS_ISOLATION" ON public.projects;
DROP POLICY IF EXISTS "PROJECTS_ISOLATION_ADAPTIVE" ON public.projects;

CREATE POLICY "MODERN_PROJECTS_ISOLATION" ON public.projects
FOR ALL USING (
    -- Regra A: O usuário é o criador do projeto (Garante que projetos antigos apareçam)
    auth.uid() = user_id
    OR 
    -- Regra B: O usuário faz parte da organização dona do projeto
    organization_id IN (SELECT public.get_my_organizations())
);

-- 2. Trava de Integridade: Garantir que novos projetos sejam sempre USA
-- Adiciona um check constraint na tabela de localizações
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_only_usa') THEN
        ALTER TABLE public.project_locations 
        ADD CONSTRAINT check_only_usa 
        CHECK (country = 'USA');
    END IF;
END $$;

COMMENT ON POLICY "MODERN_PROJECTS_ISOLATION" ON public.projects IS 'Garante que criadores e membros da organização vejam os projetos. Corrige bug de projetos sumindo.';
