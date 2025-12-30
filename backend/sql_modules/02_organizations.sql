-- ============================================
-- 02_organizations.sql
-- Organizations table for multi-tenant support
-- Compatible with Supabase CLI migrations
-- ============================================

-- Create organization_type_enum if not exists
-- Using DO block since CREATE TYPE doesn't support IF NOT EXISTS
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_type_enum') THEN
    CREATE TYPE organization_type_enum AS ENUM (
      'developer',    -- Real Estate Developer
      'builder',      -- Builder/Constructor
      'realtor',      -- Real Estate Agency
      'lender',       -- Financial Lender
      'broker',       -- Independent Broker
      'consultant',   -- Consultant
      'other'         -- Other
    );
  END IF;
END $$;

-- Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  ein VARCHAR(10), -- EIN format: XX-XXXXXXX
  company_size VARCHAR(20) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  organization_types TEXT[] NOT NULL DEFAULT '{}', -- Can have multiple types
  website VARCHAR(255),
  
  -- Branding
  logo_url VARCHAR(500),
  
  -- Address (US format)
  address_street VARCHAR(255),
  address_suite VARCHAR(100),
  address_city VARCHAR(100),
  address_state VARCHAR(2), -- State code: CA, NY, TX, FL
  address_zip VARCHAR(10),  -- ZIP: 12345 or 12345-6789
  
  -- Owner reference
  owner_id UUID NOT NULL REFERENCES public.user_profiles(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_types ON public.organizations USING GIN(organization_types);

-- Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Members can view organization" ON public.organizations;
DROP POLICY IF EXISTS "Owner can update organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organization" ON public.organizations;
DROP POLICY IF EXISTS "Owner can delete organization" ON public.organizations;

-- Organization members can view their organization
CREATE POLICY "Members can view organization" 
  ON public.organizations FOR SELECT 
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE organization_id = id AND user_id = auth.uid()
    )
  );

-- Only owner can update organization
CREATE POLICY "Owner can update organization" 
  ON public.organizations FOR UPDATE 
  USING (owner_id = auth.uid());

-- Users can create organizations
CREATE POLICY "Users can create organization" 
  ON public.organizations FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

-- Only owner can delete organization
CREATE POLICY "Owner can delete organization" 
  ON public.organizations FOR DELETE 
  USING (owner_id = auth.uid());

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
