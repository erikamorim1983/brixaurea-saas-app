-- ============================================
-- 08_security_policies.sql
-- Additional security functions and policies
-- ISO 27001 Controls: A.9.4.3, A.14.2.5
-- ============================================

-- ============================================
-- PASSWORD STRENGTH VALIDATION
-- Control: A.9.4.3 - Password management system
-- ============================================

-- Function to check password strength
-- Returns a score from 0-5 and list of issues
CREATE OR REPLACE FUNCTION public.check_password_strength(p_password TEXT)
RETURNS TABLE (
    score INTEGER,
    is_valid BOOLEAN,
    issues TEXT[]
) AS $$
DECLARE
    v_score INTEGER := 0;
    v_issues TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check minimum length (required)
    IF LENGTH(p_password) < 8 THEN
        v_issues := array_append(v_issues, 'Password must be at least 8 characters');
    ELSE
        v_score := v_score + 1;
    END IF;
    
    -- Check for lowercase letters
    IF p_password ~ '[a-z]' THEN
        v_score := v_score + 1;
    ELSE
        v_issues := array_append(v_issues, 'Password should contain lowercase letters');
    END IF;
    
    -- Check for uppercase letters
    IF p_password ~ '[A-Z]' THEN
        v_score := v_score + 1;
    ELSE
        v_issues := array_append(v_issues, 'Password should contain uppercase letters');
    END IF;
    
    -- Check for numbers
    IF p_password ~ '[0-9]' THEN
        v_score := v_score + 1;
    ELSE
        v_issues := array_append(v_issues, 'Password should contain numbers');
    END IF;
    
    -- Check for special characters
    IF p_password ~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>/?]' THEN
        v_score := v_score + 1;
    ELSE
        v_issues := array_append(v_issues, 'Password should contain special characters');
    END IF;
    
    -- Check for common passwords
    IF LOWER(p_password) IN (
        'password', 'password1', 'password123', '123456', '12345678',
        'qwerty', 'abc123', 'admin', 'letmein', 'welcome', 'monkey',
        'dragon', 'master', 'login', 'sunshine', 'princess'
    ) THEN
        v_score := GREATEST(0, v_score - 2);
        v_issues := array_append(v_issues, 'Password is too common');
    END IF;
    
    -- Check for repeated characters
    IF p_password ~ '(.)\1{2,}' THEN
        v_issues := array_append(v_issues, 'Avoid repeating characters');
    END IF;
    
    RETURN QUERY SELECT 
        v_score,
        (LENGTH(p_password) >= 8 AND v_score >= 3),
        v_issues;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- AUTOMATIC AUDIT TRIGGERS
-- ============================================

-- Generic trigger function for audit logging on sensitive tables
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
    v_event_type VARCHAR(50);
    v_user_id UUID;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    -- Build event type
    v_event_type := TG_TABLE_NAME || '_' || LOWER(TG_OP);
    
    -- Prepare data (exclude sensitive fields)
    IF TG_OP = 'DELETE' THEN
        v_old_data := to_jsonb(OLD) - ARRAY['password', 'password_hash', 'ein'];
        v_new_data := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        v_old_data := NULL;
        v_new_data := to_jsonb(NEW) - ARRAY['password', 'password_hash', 'ein'];
    ELSE -- UPDATE
        v_old_data := to_jsonb(OLD) - ARRAY['password', 'password_hash', 'ein'];
        v_new_data := to_jsonb(NEW) - ARRAY['password', 'password_hash', 'ein'];
    END IF;
    
    -- Insert audit log
    INSERT INTO public.audit_logs (
        event_type,
        severity,
        user_id,
        resource_type,
        resource_id,
        details,
        success,
        ip_hash,
        user_agent_hash
    ) VALUES (
        v_event_type,
        CASE 
            WHEN TG_OP = 'DELETE' THEN 'warning'
            ELSE 'info'
        END,
        v_user_id,
        TG_TABLE_NAME,
        COALESCE(
            (NEW).id,
            (OLD).id
        ),
        jsonb_build_object(
            'operation', TG_OP,
            'old_data', v_old_data,
            'new_data', v_new_data
        ),
        true,
        'trigger',
        'trigger'
    );
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Don't fail the main operation if audit logging fails
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_user_profiles ON public.user_profiles;
CREATE TRIGGER audit_user_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_organizations ON public.organizations;
CREATE TRIGGER audit_organizations
    AFTER INSERT OR UPDATE OR DELETE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_subscriptions ON public.subscriptions;
CREATE TRIGGER audit_subscriptions
    AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_organization_members ON public.organization_members;
CREATE TRIGGER audit_organization_members
    AFTER INSERT OR UPDATE OR DELETE ON public.organization_members
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_trigger_function();

-- ============================================
-- RATE LIMITING HELPER (Database-backed)
-- ============================================

-- Table for rate limit tracking (optional - can use in-memory in API)
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(64) NOT NULL, -- Hashed IP or user ID
    action VARCHAR(50) NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    first_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    blocked_until TIMESTAMPTZ,
    UNIQUE(identifier, action)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits(identifier, action);

-- Cleanup function for expired entries
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM public.rate_limits
    WHERE first_attempt_at < NOW() - INTERVAL '2 hours'
    AND (blocked_until IS NULL OR blocked_until < NOW());
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SESSION SECURITY
-- ============================================

-- Function to invalidate all user sessions (for password change, account compromise)
CREATE OR REPLACE FUNCTION public.invalidate_user_sessions(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Log the session invalidation
    PERFORM public.log_audit_event(
        'sessions_invalidated',
        'warning',
        p_user_id,
        NULL,
        'system',
        'system',
        'sessions',
        p_user_id,
        jsonb_build_object('reason', 'manual_invalidation'),
        true
    );
    
    -- Note: Actual session invalidation is handled by Supabase Auth
    -- This function logs the event and can be extended for custom session management
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DATA RETENTION POLICIES
-- ISO 27001 Control: A.18.1.3 - Protection of records
-- ============================================

-- View to show data retention status
CREATE OR REPLACE VIEW public.data_retention_status AS
SELECT 
    'audit_logs' AS table_name,
    COUNT(*) AS total_records,
    MIN(created_at) AS oldest_record,
    MAX(created_at) AS newest_record,
    COUNT(*) FILTER (WHERE log_date < CURRENT_DATE - INTERVAL '90 days') AS records_for_cleanup
FROM public.audit_logs
UNION ALL
SELECT 
    'rate_limits' AS table_name,
    COUNT(*) AS total_records,
    MIN(first_attempt_at) AS oldest_record,
    MAX(first_attempt_at) AS newest_record,
    COUNT(*) FILTER (WHERE first_attempt_at < NOW() - INTERVAL '2 hours') AS records_for_cleanup
FROM public.rate_limits;

-- ============================================
-- SECURITY EVENT NOTIFICATIONS
-- (Placeholder for webhook/email integration)
-- ============================================

CREATE OR REPLACE FUNCTION public.notify_security_event()
RETURNS TRIGGER AS $$
BEGIN
    -- For critical events, we could trigger notifications here
    -- This is a placeholder for integration with external notification services
    
    IF NEW.severity = 'critical' THEN
        -- In production, integrate with:
        -- - Email service (SendGrid, etc.)
        -- - Slack/Teams webhook
        -- - PagerDuty for on-call alerts
        RAISE NOTICE 'CRITICAL SECURITY EVENT: % for user %', NEW.event_type, NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_critical_security_events ON public.audit_logs;
CREATE TRIGGER notify_critical_security_events
    AFTER INSERT ON public.audit_logs
    FOR EACH ROW
    WHEN (NEW.severity = 'critical')
    EXECUTE FUNCTION public.notify_security_event();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION public.check_password_strength IS 'ISO 27001 A.9.4.3 - Password strength validation';
COMMENT ON FUNCTION public.audit_trigger_function IS 'Automatic audit logging for sensitive tables';
COMMENT ON TABLE public.rate_limits IS 'Database-backed rate limiting for distributed systems';
