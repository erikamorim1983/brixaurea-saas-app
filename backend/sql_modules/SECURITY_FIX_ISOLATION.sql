
-- ============================================
-- CRITICAL SECURITY PATCH: PROJECTS ISOLATION (V2)
-- Fixing column naming conflict (organization_id vs organization_owner_id)
-- ============================================

-- 1. Ensure Projects table has the owner/org context
-- We will use 'organization_owner_id' to align with the subscription model in your DB
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS organization_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Backfill: Existing projects are owned by their creator's "org" (themselves)
UPDATE public.projects 
SET organization_owner_id = user_id 
WHERE organization_owner_id IS NULL;

-- 3. FORCE RE-ENABLE RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 4. CLEAN UP OLD POLICIES
DROP POLICY IF EXISTS "STRICT_PROJECTS_ISOLATION" ON public.projects;
DROP POLICY IF EXISTS "View Projects Policy" ON public.projects;
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all" ON public.projects;

-- 5. CREATE STRICT ISOLATION POLICY (Adaptive to your DB)
-- This covers both Individual and Organization plans.
CREATE POLICY "PROJECTS_ISOLATION_ADAPTIVE" ON public.projects
FOR SELECT USING (
    -- Case A: You are the creator
    auth.uid() = user_id
    OR
    -- Case B: You are a member of the organization that owns this project
    -- (Checks the organization_members table using organization_owner_id)
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_owner_id = projects.organization_owner_id
        AND om.member_user_id = auth.uid()
        AND om.status = 'active'
    )
);

-- 6. INSERT POLICY
DROP POLICY IF EXISTS "STRICT_PROJECTS_INSERT" ON public.projects;
DROP POLICY IF EXISTS "Create Projects Policy" ON public.projects;
CREATE POLICY "PROJECTS_INSERT_ADAPTIVE" ON public.projects
FOR INSERT WITH CHECK (
    -- You can create projects for yourself
    (auth.uid() = user_id AND (organization_owner_id IS NULL OR organization_owner_id = auth.uid()))
    OR
    -- You can create projects for an organization you belong to (if active)
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_owner_id = organization_owner_id
        AND om.member_user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin', 'member') -- Viewers can't create
    )
);

-- 7. UPDATE POLICY
DROP POLICY IF EXISTS "STRICT_PROJECTS_UPDATE" ON public.projects;
DROP POLICY IF EXISTS "Update Projects Policy" ON public.projects;
CREATE POLICY "PROJECTS_UPDATE_ADAPTIVE" ON public.projects
FOR UPDATE USING (
    -- Creator can update
    auth.uid() = user_id
    OR
    -- Org Owner/Admin can update
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_owner_id = projects.organization_owner_id
        AND om.member_user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin')
    )
);

-- 8. DELETE POLICY
DROP POLICY IF EXISTS "STRICT_PROJECTS_DELETE" ON public.projects;
DROP POLICY IF EXISTS "Delete Projects Policy" ON public.projects;
CREATE POLICY "PROJECTS_DELETE_ADAPTIVE" ON public.projects
FOR DELETE USING (
    -- Creator can delete
    auth.uid() = user_id
    OR
    -- Org Owner/Admin can delete
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_owner_id = projects.organization_owner_id
        AND om.member_user_id = auth.uid()
        AND om.status = 'active'
        AND om.role IN ('owner', 'admin')
    )
);

-- 9. Refresh RLS for related tables too (Just safety)
ALTER TABLE public.project_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Locations Isolation" ON public.project_locations;
CREATE POLICY "Locations Isolation" ON public.project_locations
FOR ALL USING (
    project_id IN (SELECT id FROM public.projects)
);
