-- ============================================
-- 04_subscription_plans.sql
-- Subscription plans and user/org subscriptions
-- ============================================

-- Available modules in the platform
-- feasibility: Basic feasibility generation
-- market_analysis: Market analysis with indicators
-- api_census: Census API integration
-- api_schools: Schools API integration
-- api_custom: Custom API integrations
-- white_label: White label/custom branding

-- Subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2), -- TBD
  price_yearly DECIMAL(10,2),  -- TBD
  max_users INTEGER DEFAULT 1, -- -1 for unlimited
  max_projects INTEGER DEFAULT 5, -- -1 for unlimited
  modules TEXT[] NOT NULL, -- Array of module identifiers
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (links to org OR user, not both)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'past_due')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Ensure subscription belongs to either org OR user, not both
  CONSTRAINT subscription_owner CHECK (
    (organization_id IS NOT NULL AND user_id IS NULL) OR
    (organization_id IS NULL AND user_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans
CREATE POLICY "Anyone can view active plans" 
  ON public.subscription_plans FOR SELECT 
  USING (is_active = TRUE);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscription" 
  ON public.subscriptions FOR SELECT 
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = organization_id AND o.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id 
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- Seed default plans (prices TBD)
-- ============================================
INSERT INTO public.subscription_plans (name, display_name, description, max_users, max_projects, modules, sort_order) VALUES
  ('basic', 'Basic', 'Simple feasibility generation for individual users', 1, 5, ARRAY['feasibility'], 1),
  ('premium', 'Premium', 'Complete analysis with market indicators and API integrations', 5, 20, ARRAY['feasibility', 'market_analysis', 'api_census', 'api_schools'], 2),
  ('enterprise', 'Enterprise', 'Full solution for large companies with unlimited access', -1, -1, ARRAY['feasibility', 'market_analysis', 'api_census', 'api_schools', 'api_custom', 'white_label'], 3)
ON CONFLICT (name) DO NOTHING;
