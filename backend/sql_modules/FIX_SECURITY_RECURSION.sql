
-- ============================================
-- FIX: INFINITE RECURSION IN RLS POLICIES
-- ============================================

-- 1. FIX ORGANIZATION_MEMBERS POLICIES (Primary Source of Recursion)
-- We need to remove the self-referencing EXISTS clause.

DROP POLICY IF EXISTS "Org owners/admins can manage members" ON public.organization_members;
DROP POLICY IF EXISTS "Org owners can view members" ON public.organization_members;
DROP POLICY IF EXISTS "Members can view org members" ON public.organization_members;

-- Safe non-recursive policy for organization_members
-- A user can see a membership record if:
-- a) It's their own record
-- b) They are the owner of the organization
CREATE POLICY "ORG_MEMBERS_SELECT" ON public.organization_members
FOR SELECT USING (
    auth.uid() = member_user_id 
    OR 
    auth.uid() = organization_owner_id
);

-- Admin management policy (Simplified to avoid recursion for now)
-- Only the owner can manage members for now to break the loop.
-- You can add a Security Definer function later for Admins.
CREATE POLICY "ORG_MEMBERS_OWNER_MANAGE" ON public.organization_members
FOR ALL USING (
    auth.uid() = organization_owner_id
);


-- 2. RE-APPLY PROJECTS ISOLATION (Optimized)
DROP POLICY IF EXISTS "PROJECTS_ISOLATION_ADAPTIVE" ON public.projects;
DROP POLICY IF EXISTS "PROJECTS_INSERT_ADAPTIVE" ON public.projects;
DROP POLICY IF EXISTS "PROJECTS_UPDATE_ADAPTIVE" ON public.projects;
DROP POLICY IF EXISTS "PROJECTS_DELETE_ADAPTIVE" ON public.projects;

-- optimized select: 
-- 1. I am the creator
-- 2. I am the owner of the organization
-- 3. I am a member (This one is the tricky one that can cause recursion if not careful)
CREATE POLICY "PROJECTS_SELECT_SECURE" ON public.projects
FOR SELECT USING (
    auth.uid() = user_id -- Fast path: Creator
    OR 
    auth.uid() = organization_owner_id -- Fast path: Org Owner
    OR
    EXISTS (
        -- This subquery is now safe because ORG_MEMBERS_SELECT is non-recursive
        SELECT 1 FROM public.organization_members
        WHERE organization_owner_id = projects.organization_owner_id
        AND member_user_id = auth.uid()
        AND status = 'active'
    )
);

CREATE POLICY "PROJECTS_INSERT_SECURE" ON public.projects
FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    OR 
    auth.uid() = organization_owner_id
);

CREATE POLICY "PROJECTS_UPDATE_SECURE" ON public.projects
FOR UPDATE USING (
    auth.uid() = user_id 
    OR 
    auth.uid() = organization_owner_id
);

CREATE POLICY "PROJECTS_DELETE_SECURE" ON public.projects
FOR DELETE USING (
    auth.uid() = user_id 
    OR 
    auth.uid() = organization_owner_id
);
