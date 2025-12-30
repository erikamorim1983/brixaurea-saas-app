-- ============================================
-- 01_users_extension.sql
-- Extends Supabase auth.users with profile data
-- Compatible with Supabase CLI migrations
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if exists (for clean re-run)
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- User profiles table (extends auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(14), -- Format: (###) ###-####
  account_type VARCHAR(15) NOT NULL DEFAULT 'individual' CHECK (account_type IN ('individual', 'organization')),
  
  -- Organization Info (only for organization accounts)
  company_name VARCHAR(200),
  ein VARCHAR(10), -- Format: ##-#######
  website VARCHAR(255),
  logo_url VARCHAR(500), -- URL to logo in Supabase Storage
  
  -- Address
  address_street VARCHAR(255),
  address_suite VARCHAR(50),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zip VARCHAR(10),
  
  -- Professional Info
  organization_types TEXT[], -- Array of types: developer, builder, realtor, lender, broker, consultant, other
  
  -- Status
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX idx_user_profiles_account_type ON public.user_profiles(account_type);
CREATE INDEX idx_user_profiles_state ON public.user_profiles(address_state);

-- Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
