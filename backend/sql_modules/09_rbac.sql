-- 09_rbac.sql
-- Role Based Access Control & Project Permissions

-- 1. Add Organization Context to Projects
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_projects_org ON public.projects(organization_id);

-- Optional: Backfill organization_id for existing projects (Best Guess: Owner's Organization)
-- UPDATE public.projects p
-- SET organization_id = (SELECT id FROM public.organizations WHERE owner_id = p.user_id LIMIT 1)
-- WHERE organization_id IS NULL;


-- 2. Create Project Members (Granular Access)
-- Replaces "project_guests" with a user_id based system
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('editor', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(project_id, user_id)
);

-- Enable RLS
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Projects

-- Drop potential old policies
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- A. SELECT (View)
-- 1. Legacy: Own projects (if no org)
-- 2. Org: Admins/members see ALL org projects.
-- 3. Project Member: Explicit access (Guest/Investor).
CREATE POLICY "View Projects Policy" ON public.projects FOR SELECT USING (
    -- 1. Creator (Legacy / Personal)
    (auth.uid() = user_id AND organization_id IS NULL)
    OR
    -- 2. Organization Member (Admin/Editor/Viewer sees ALL in Org)
    -- NOTE: We might want to restrict 'guest' role here if we add it later.
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = projects.organization_id
        AND om.user_id = auth.uid()
        -- Exclude 'guest' role from seeing ALL projects if we implement it.
        -- For now, assume all org members see all.
    )
    OR
    -- 3. Project Specific Member (The "Investor" Case)
    EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = projects.id
        AND pm.user_id = auth.uid()
    )
    OR
    -- 4. Org Owner (Always sees everything)
    EXISTS (
        SELECT 1 FROM public.organizations o
        WHERE o.id = projects.organization_id
        AND o.owner_id = auth.uid()
    )
);

-- B. INSERT (Create)
-- Only allowed if involved in the Org (or personal)
CREATE POLICY "Create Projects Policy" ON public.projects FOR INSERT WITH CHECK (
    -- Personal
    (organization_id IS NULL AND auth.uid() = user_id)
    OR
    -- Organization Member (Editor/Admin)
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'editor', 'member') -- Viewers cannot create
    )
    OR
    -- Org Owner
    EXISTS (
        SELECT 1 FROM public.organizations o
        WHERE o.id = organization_id
        AND o.owner_id = auth.uid()
    )
);

-- C. UPDATE (Edit)
CREATE POLICY "Update Projects Policy" ON public.projects FOR UPDATE USING (
    -- Personal
    (auth.uid() = user_id AND organization_id IS NULL)
    OR
    -- Org Member (Admin/Editor)
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = projects.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'editor', 'member') -- Viewers cannot edit
    )
    OR
    -- Project Member (Editor Role)
    EXISTS (
        SELECT 1 FROM public.project_members pm
        WHERE pm.project_id = projects.id
        AND pm.user_id = auth.uid()
        AND pm.role = 'editor'
    )
    OR
    -- Org Owner
    EXISTS (
        SELECT 1 FROM public.organizations o
        WHERE o.id = projects.organization_id
        AND o.owner_id = auth.uid()
    )
);

-- D. DELETE (Archive)
-- Only Admins/Owners
CREATE POLICY "Delete Projects Policy" ON public.projects FOR DELETE USING (
    -- Personal
    (auth.uid() = user_id AND organization_id IS NULL)
    OR
    -- Org Admin
    EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = projects.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
    OR
    -- Org Owner
    EXISTS (
        SELECT 1 FROM public.organizations o
        WHERE o.id = projects.organization_id
        AND o.owner_id = auth.uid()
    )
);
