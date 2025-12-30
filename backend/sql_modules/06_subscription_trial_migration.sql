-- ============================================
-- 06_subscription_trial_migration.sql
-- Add trial_days to subscription_plans
-- ============================================

-- Add trial_days column to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS trial_days INTEGER NOT NULL DEFAULT 7;

-- Add trial_project_limit column for trial restrictions
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS trial_project_limit INTEGER DEFAULT NULL;

-- Update trial days for each plan
UPDATE public.subscription_plans SET trial_days = 7, trial_project_limit = 1 WHERE id = 'individual';
UPDATE public.subscription_plans SET trial_days = 14, trial_project_limit = NULL WHERE id = 'business_starter';
UPDATE public.subscription_plans SET trial_days = 14, trial_project_limit = NULL WHERE id = 'business_pro';
UPDATE public.subscription_plans SET trial_days = 14, trial_project_limit = NULL WHERE id = 'business_plus';
UPDATE public.subscription_plans SET trial_days = 0, trial_project_limit = NULL WHERE id = 'enterprise';

-- ============================================
-- Update subscriptions table for better trial tracking
-- ============================================

-- Add is_trial column for easier querying
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT FALSE;

-- Add trial_started_at for tracking
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;

-- ============================================
-- Helper function to check if subscription is in trial
-- ============================================

CREATE OR REPLACE FUNCTION public.is_subscription_in_trial(sub_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    trial_end TIMESTAMPTZ;
    is_trialing BOOLEAN;
BEGIN
    SELECT trial_ends_at, is_trial INTO trial_end, is_trialing
    FROM public.subscriptions
    WHERE user_id = sub_user_id;
    
    IF is_trialing IS NULL OR is_trialing = FALSE THEN
        RETURN FALSE;
    END IF;
    
    RETURN trial_end IS NOT NULL AND trial_end > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Helper function to get days remaining in trial
-- ============================================

CREATE OR REPLACE FUNCTION public.get_trial_days_remaining(sub_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    trial_end TIMESTAMPTZ;
BEGIN
    SELECT trial_ends_at INTO trial_end
    FROM public.subscriptions
    WHERE user_id = sub_user_id;
    
    IF trial_end IS NULL OR trial_end <= NOW() THEN
        RETURN 0;
    END IF;
    
    RETURN GREATEST(0, EXTRACT(DAY FROM (trial_end - NOW()))::INTEGER);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Update the auto-create subscription trigger
-- Now includes trial period based on plan
-- ============================================

CREATE OR REPLACE FUNCTION public.create_subscription_with_trial(
    p_user_id UUID,
    p_plan_id VARCHAR(50)
)
RETURNS UUID AS $$
DECLARE
    v_trial_days INTEGER;
    v_subscription_id UUID;
BEGIN
    -- Get trial days for the plan
    SELECT trial_days INTO v_trial_days
    FROM public.subscription_plans
    WHERE id = p_plan_id;
    
    -- Default to 7 days if plan not found
    IF v_trial_days IS NULL THEN
        v_trial_days := 7;
    END IF;
    
    -- Insert subscription with trial
    INSERT INTO public.subscriptions (
        user_id, 
        plan_id, 
        status,
        is_trial,
        trial_started_at,
        trial_ends_at,
        current_period_start,
        current_period_end
    )
    VALUES (
        p_user_id,
        p_plan_id,
        CASE WHEN v_trial_days > 0 THEN 'trialing' ELSE 'active' END,
        v_trial_days > 0,
        CASE WHEN v_trial_days > 0 THEN NOW() ELSE NULL END,
        CASE WHEN v_trial_days > 0 THEN NOW() + (v_trial_days || ' days')::INTERVAL ELSE NULL END,
        NOW(),
        NOW() + INTERVAL '30 days'
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        plan_id = EXCLUDED.plan_id,
        status = EXCLUDED.status,
        is_trial = EXCLUDED.is_trial,
        trial_started_at = EXCLUDED.trial_started_at,
        trial_ends_at = EXCLUDED.trial_ends_at,
        updated_at = NOW()
    RETURNING id INTO v_subscription_id;
    
    RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
