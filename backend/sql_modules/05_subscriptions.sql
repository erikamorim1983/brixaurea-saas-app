-- ============================================
-- 05_subscriptions.sql
-- Subscription plans and organization members
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SUBSCRIPTION PLANS TABLE
-- Defines available plans with their limits
-- ============================================
DROP TABLE IF EXISTS public.subscription_plans CASCADE;

CREATE TABLE public.subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Pricing (in cents to avoid float issues)
    price_monthly INTEGER NOT NULL DEFAULT 0,
    price_yearly INTEGER NOT NULL DEFAULT 0,
    
    -- Limits
    max_users INTEGER NOT NULL DEFAULT 1,
    max_projects INTEGER NOT NULL DEFAULT 5,
    max_storage_mb INTEGER NOT NULL DEFAULT 2048, -- 2GB default
    
    -- Features (stored as JSON for flexibility)
    features JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans (prices in cents)
INSERT INTO public.subscription_plans (id, name, description, price_monthly, price_yearly, max_users, max_projects, max_storage_mb, features, display_order) VALUES
    ('individual', 'Individual', 'Perfect for independent professionals', 4990, 49900, 1, 5, 2048, 
     '["Basic analysis", "5 projects", "2GB storage", "Email support"]'::jsonb, 1),
    
    ('business_starter', 'Business Starter', 'For small teams getting started', 9990, 99900, 3, -1, 10240,
     '["Unlimited projects", "3 team members", "10GB storage", "Priority support", "Team management"]'::jsonb, 2),
    
    ('business_pro', 'Business Pro', 'For growing organizations', 14990, 149900, 10, -1, 51200,
     '["Unlimited projects", "10 team members", "50GB storage", "Priority support", "Team management", "Advanced reports"]'::jsonb, 3),
    
    ('business_plus', 'Business Plus', 'For larger teams', 49990, 499900, 25, -1, 102400,
     '["Unlimited projects", "25 team members", "100GB storage", "Priority support", "Team management", "Advanced reports", "API access"]'::jsonb, 4),
    
    ('enterprise', 'Enterprise', 'Custom solutions for large organizations', 0, 0, -1, -1, -1,
     '["Unlimited everything", "Custom integrations", "Dedicated support", "SLA guarantee", "Custom branding"]'::jsonb, 5);

-- Note: -1 means unlimited

-- ============================================
-- SUBSCRIPTIONS TABLE
-- Links users/organizations to their plan
-- ============================================
DROP TABLE IF EXISTS public.subscriptions CASCADE;

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Owner (user who owns the subscription)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Plan
    plan_id VARCHAR(50) NOT NULL REFERENCES public.subscription_plans(id),
    
    -- Billing info
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'paused')),
    billing_cycle VARCHAR(10) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    
    -- Stripe/Payment info (for future integration)
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    
    -- Trial period
    trial_ends_at TIMESTAMPTZ,
    
    -- Billing dates
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    canceled_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one active subscription per user
    CONSTRAINT unique_active_subscription UNIQUE (user_id)
);

-- ============================================
-- ORGANIZATION MEMBERS TABLE
-- Team members within an organization
-- ============================================
DROP TABLE IF EXISTS public.organization_members CASCADE;

CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Organization owner (the user with the subscription)
    organization_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Member user
    member_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role with permissions
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
    
    -- Invitation
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_member_per_org UNIQUE (organization_owner_id, member_user_id)
);

-- ============================================
-- INVITATIONS TABLE
-- Pending invitations to join organization
-- ============================================
DROP TABLE IF EXISTS public.organization_invitations CASCADE;

CREATE TABLE public.organization_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Organization
    organization_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Invitation details
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    
    -- Token for accepting invitation
    token UUID NOT NULL DEFAULT uuid_generate_v4(),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'canceled')),
    
    -- Expiration
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
    
    -- Tracking
    invited_by UUID REFERENCES auth.users(id),
    accepted_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_pending_invitation UNIQUE (organization_owner_id, email, status)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan ON public.subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

CREATE INDEX idx_org_members_owner ON public.organization_members(organization_owner_id);
CREATE INDEX idx_org_members_user ON public.organization_members(member_user_id);
CREATE INDEX idx_org_members_role ON public.organization_members(role);

CREATE INDEX idx_invitations_owner ON public.organization_invitations(organization_owner_id);
CREATE INDEX idx_invitations_email ON public.organization_invitations(email);
CREATE INDEX idx_invitations_token ON public.organization_invitations(token);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Subscription Plans (read-only for all authenticated users)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
    ON public.subscription_plans FOR SELECT
    USING (is_active = TRUE);

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscription"
    ON public.subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Organization Members
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners can view members"
    ON public.organization_members FOR SELECT
    USING (
        auth.uid() = organization_owner_id 
        OR auth.uid() = member_user_id
    );

CREATE POLICY "Org owners/admins can manage members"
    ON public.organization_members FOR ALL
    USING (
        auth.uid() = organization_owner_id
        OR EXISTS (
            SELECT 1 FROM public.organization_members om
            WHERE om.organization_owner_id = organization_members.organization_owner_id
            AND om.member_user_id = auth.uid()
            AND om.role = 'admin'
            AND om.status = 'active'
        )
    );

-- Organization Invitations
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org owners can manage invitations"
    ON public.organization_invitations FOR ALL
    USING (auth.uid() = organization_owner_id);

CREATE POLICY "Invited users can view their invitation"
    ON public.organization_invitations FOR SELECT
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND status = 'pending'
    );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user has reached member limit
CREATE OR REPLACE FUNCTION public.check_member_limit(org_owner_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    max_allowed INTEGER;
BEGIN
    -- Get current member count
    SELECT COUNT(*) INTO current_count
    FROM public.organization_members
    WHERE organization_owner_id = org_owner_id
    AND status = 'active';
    
    -- Get plan limit
    SELECT sp.max_users INTO max_allowed
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON s.plan_id = sp.id
    WHERE s.user_id = org_owner_id
    AND s.status = 'active';
    
    -- -1 means unlimited
    IF max_allowed = -1 THEN
        RETURN TRUE;
    END IF;
    
    RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in an organization
CREATE OR REPLACE FUNCTION public.get_user_role(org_owner_id UUID, user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    -- Check if user is the owner
    IF org_owner_id = user_id THEN
        RETURN 'owner';
    END IF;
    
    -- Get role from members table
    SELECT role INTO user_role
    FROM public.organization_members
    WHERE organization_owner_id = org_owner_id
    AND member_user_id = user_id
    AND status = 'active';
    
    RETURN COALESCE(user_role, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(
    org_owner_id UUID, 
    user_id UUID, 
    required_roles VARCHAR[]
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    user_role := public.get_user_role(org_owner_id, user_id);
    
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN user_role = ANY(required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- NOTE: Subscription creation is handled by the API route (/api/auth/register)
-- This allows proper plan selection, trial periods, and account type handling.
-- DO NOT add an auto-create trigger here as it will conflict with the API.

-- Update timestamps trigger
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS update_org_members_updated_at ON public.organization_members;

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
