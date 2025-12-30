-- ============================================
-- 06_stripe_events.sql
-- Stripe webhook events logging table
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STRIPE EVENTS TABLE
-- Logs all Stripe webhook events for auditing
-- ============================================
DROP TABLE IF EXISTS public.stripe_events CASCADE;

CREATE TABLE public.stripe_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event details from Stripe
    event_id VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    
    -- Processing status
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_stripe_events_event_id ON public.stripe_events(event_id);
CREATE INDEX idx_stripe_events_event_type ON public.stripe_events(event_type);
CREATE INDEX idx_stripe_events_processed ON public.stripe_events(processed);
CREATE INDEX idx_stripe_events_created_at ON public.stripe_events(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Only service role can access stripe events (admin only)
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can access stripe events"
    ON public.stripe_events
    USING (false);  -- No user access, only service_role

-- ============================================
-- ADDITIONAL INDEXES FOR SUBSCRIPTIONS TABLE
-- (Referenced in implementation plan)
-- ============================================

-- Add indexes for Stripe IDs if not exist
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer 
    ON public.subscriptions(stripe_customer_id);
    
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription 
    ON public.subscriptions(stripe_subscription_id);

-- ============================================
-- ADD STRIPE_CUSTOMER_ID TO USERS TABLE
-- ============================================

-- Check if column exists and add if not
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE public.users ADD COLUMN stripe_customer_id VARCHAR(100);
        CREATE INDEX idx_users_stripe_customer ON public.users(stripe_customer_id);
    END IF;
END $$;
