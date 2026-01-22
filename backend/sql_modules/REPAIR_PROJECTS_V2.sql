-- ============================================
-- REPAIR SCRIPT: PROJECT LINKING & MEMBERSHIP
-- ============================================

-- 1. Garantir que a tabela de membros tenha a restrição de unicidade correta
-- Isso evita duplicações e permite o uso do ON CONFLICT
DO $$
BEGIN
    -- Remover restrições antigas que podem estar quebradas (referenciando user_id em vez de member_user_id)
    ALTER TABLE public.organization_members DROP CONSTRAINT IF EXISTS organization_members_organization_id_user_id_key;
    
    -- Adicionar a restrição correta se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_org_member_pair') THEN
        ALTER TABLE public.organization_members 
        ADD CONSTRAINT unique_org_member_pair UNIQUE (organization_id, member_user_id);
    END IF;
END $$;

-- 2. Vincular projetos à organização
UPDATE public.projects
SET organization_id = '593fce4b-84d1-4212-891d-81fd1d3e48bf'
WHERE organization_id IS NULL 
  AND user_id = '5583f273-e60d-484e-a4b4-53950b59505c';

-- 3. Inserir/Atualizar você como dono da organização
INSERT INTO public.organization_members (organization_id, member_user_id, role, status)
VALUES ('593fce4b-84d1-4212-891d-81fd1d3e48bf', '5583f273-e60d-484e-a4b4-53950b59505c', 'owner', 'active')
ON CONFLICT ON CONSTRAINT unique_org_member_pair
DO UPDATE SET role = 'owner', status = 'active';

-- 4. Resetar Políticas de Segurança para refletir a nova estrutura
DROP POLICY IF EXISTS "MODERN_PROJECTS_ISOLATION" ON public.projects;

CREATE POLICY "MODERN_PROJECTS_ISOLATION" ON public.projects
FOR ALL USING (
    organization_id IN (
        SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        UNION
        SELECT organization_id FROM public.organization_members WHERE member_user_id = auth.uid() AND status = 'active'
    )
);

-- 5. Garantir que localizações e cenários também sigam a regra
ALTER TABLE public.project_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Locations Isolation" ON public.project_locations;
CREATE POLICY "Locations Isolation" ON public.project_locations
FOR ALL USING (
    project_id IN (SELECT id FROM public.projects)
);
