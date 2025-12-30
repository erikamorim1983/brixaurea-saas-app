-- ============================================
-- 03_organization_members.sql
-- Organization members with role-based access
-- ============================================

-- Member roles
-- owner: Full access, can delete org, manage billing
-- admin: Can manage members and settings
-- member: Can access all modules assigned
-- viewer: Read-only access

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  module_permissions TEXT[] DEFAULT '{}', -- Specific modules this user can access
  invited_by UUID REFERENCES public.user_profiles(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: user can only be member once per org
  UNIQUE (organization_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);

-- Row Level Security
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Members can view other members in their organization
CREATE POLICY "Members can view org members" 
  ON public.organization_members FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id AND om.user_id = auth.uid()
    )
  );

-- Only owner/admin can add members
CREATE POLICY "Admins can add members" 
  ON public.organization_members FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id 
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- Only owner/admin can update member roles
CREATE POLICY "Admins can update members" 
  ON public.organization_members FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id 
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- Only owner/admin can remove members (but not themselves if owner)
CREATE POLICY "Admins can remove members" 
  ON public.organization_members FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id 
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
    AND NOT (role = 'owner' AND user_id = auth.uid()) -- Owner cannot remove themselves
  );
