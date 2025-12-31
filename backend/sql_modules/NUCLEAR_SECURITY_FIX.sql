
-- ============================================
-- NUCLEAR SECURITY FIX: COMPLETE ISOLATION
-- ============================================

-- 1. DROP ALL POLICIES ON PROJECTS (Brute Force)
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'projects' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.projects', pol.policyname);
    END LOOP;
END $$;

-- 2. DROP ALL POLICIES ON ORGANIZATION_MEMBERS
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'organization_members' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.organization_members', pol.policyname);
    END LOOP;
END $$;

-- 3. APPLY STrictest organization_members isolation (No recursion)
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MEMBERS_SELECT" ON public.organization_members
FOR SELECT USING (
    auth.uid() = member_user_id 
    OR 
    auth.uid() = organization_owner_id
);

CREATE POLICY "MEMBERS_MANAGE" ON public.organization_members
FOR ALL USING (
    auth.uid() = organization_owner_id
);


-- 4. APPLY STrictest projects isolation
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PROJECTS_SELECT" ON public.projects
FOR SELECT USING (
    -- a) I am the creator
    auth.uid() = user_id
    OR
    -- b) I am the owner of the organization that owns this project
    auth.uid() = organization_owner_id
    OR
    -- c) I am a member of the organization that owns this project
    EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_owner_id = projects.organization_owner_id
        AND member_user_id = auth.uid()
        AND status = 'active'
    )
);

CREATE POLICY "PROJECTS_INSERT" ON public.projects
FOR INSERT WITH CHECK (
    -- Only allow inserting if I'm setting myself as the user or if I'm the org owner
    (auth.uid() = user_id)
);

CREATE POLICY "PROJECTS_UPDATE" ON public.projects
FOR UPDATE USING (
    auth.uid() = user_id OR auth.uid() = organization_owner_id
);

CREATE POLICY "PROJECTS_DELETE" ON public.projects
FOR DELETE USING (
    auth.uid() = user_id OR auth.uid() = organization_owner_id
);


-- 5. FIX THE PRICE IN THE DATABASE (Individual Plan)
-- The user confirmed it shows $29, but code says $49.90.
-- Let's update it to $49.90 (4990 cents) to match the code expectation.
UPDATE public.subscription_plans 
SET price_monthly = 4990 
WHERE id = 'individual';


-- 6. ENSURE ALL PROJECTS HAVE OWNERSHIP (Backfill again just in case)
UPDATE public.projects 
SET organization_owner_id = user_id 
WHERE organization_owner_id IS NULL;
