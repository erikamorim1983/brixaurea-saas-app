-- ============================================
-- 07_audit_logs.sql
-- Security audit logging for ISO 27001 compliance
-- Control: A.12.4.1 - Event logging
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if exists (for clean re-run)
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- ============================================
-- AUDIT LOGS TABLE
-- Records security-relevant events
-- ============================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event information
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    
    -- Actor information (hashed for privacy)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email VARCHAR(64), -- Hashed email for privacy
    ip_hash VARCHAR(16) NOT NULL,
    user_agent_hash VARCHAR(16) NOT NULL,
    
    -- Resource information
    resource_type VARCHAR(50),
    resource_id UUID,
    
    -- Event details (JSONB for flexibility)
    details JSONB DEFAULT '{}'::jsonb,
    
    -- Outcome
    success BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Partition key for efficient querying and retention
    log_date DATE DEFAULT CURRENT_DATE
);

-- ============================================
-- INDEXES
-- ============================================

-- Primary query patterns
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_audit_logs_severity ON public.audit_logs(severity);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_log_date ON public.audit_logs(log_date);

-- Composite index for common queries
CREATE INDEX idx_audit_logs_user_event ON public.audit_logs(user_id, event_type, created_at DESC);

-- Index for security incident investigation
CREATE INDEX idx_audit_logs_ip_hash ON public.audit_logs(ip_hash);
CREATE INDEX idx_audit_logs_success ON public.audit_logs(success) WHERE success = false;

-- GIN index for JSONB details
CREATE INDEX idx_audit_logs_details ON public.audit_logs USING GIN(details);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- No user can insert directly - only service role
-- This is enforced by not creating an INSERT policy

-- No updates allowed
-- No deletes allowed (immutable audit trail)

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to insert audit log (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_event_type VARCHAR(50),
    p_severity VARCHAR(20) DEFAULT 'info',
    p_user_id UUID DEFAULT NULL,
    p_email VARCHAR(64) DEFAULT NULL,
    p_ip_hash VARCHAR(16) DEFAULT 'unknown',
    p_user_agent_hash VARCHAR(16) DEFAULT 'unknown',
    p_resource_type VARCHAR(50) DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb,
    p_success BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        event_type,
        severity,
        user_id,
        email,
        ip_hash,
        user_agent_hash,
        resource_type,
        resource_id,
        details,
        success
    ) VALUES (
        p_event_type,
        p_severity,
        p_user_id,
        p_email,
        p_ip_hash,
        p_user_agent_hash,
        p_resource_type,
        p_resource_id,
        p_details,
        p_success
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's recent security events
CREATE OR REPLACE FUNCTION public.get_user_security_events(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    event_type VARCHAR(50),
    severity VARCHAR(20),
    created_at TIMESTAMPTZ,
    success BOOLEAN,
    details JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.id,
        al.event_type,
        al.severity,
        al.created_at,
        al.success,
        al.details
    FROM public.audit_logs al
    WHERE al.user_id = p_user_id
    ORDER BY al.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count failed login attempts (for rate limiting)
CREATE OR REPLACE FUNCTION public.count_failed_logins(
    p_ip_hash VARCHAR(16),
    p_window_minutes INTEGER DEFAULT 15
)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.audit_logs
        WHERE ip_hash = p_ip_hash
        AND event_type = 'login_failed'
        AND created_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RETENTION POLICY
-- Automatically delete logs older than 90 days
-- (Run this as a scheduled job in Supabase)
-- ============================================

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    -- Keep critical logs for 1 year, others for 90 days
    DELETE FROM public.audit_logs
    WHERE (
        (severity != 'critical' AND log_date < CURRENT_DATE - INTERVAL '90 days')
        OR
        (severity = 'critical' AND log_date < CURRENT_DATE - INTERVAL '365 days')
    );
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    -- Log the cleanup action
    PERFORM public.log_audit_event(
        'audit_cleanup',
        'info',
        NULL,
        NULL,
        'system',
        'system',
        'audit_logs',
        NULL,
        jsonb_build_object('deleted_count', v_deleted),
        true
    );
    
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.audit_logs IS 'Security audit trail for ISO 27001 A.12.4.1 compliance';
COMMENT ON COLUMN public.audit_logs.ip_hash IS 'Hashed IP address for privacy';
COMMENT ON COLUMN public.audit_logs.email IS 'Hashed email for privacy';
COMMENT ON COLUMN public.audit_logs.details IS 'Additional event context as JSON';
