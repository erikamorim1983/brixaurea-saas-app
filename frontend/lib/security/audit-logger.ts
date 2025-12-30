/**
 * Audit Logger
 * 
 * ISO 27001 Control: A.12.4.1 - Event logging
 * Records security-relevant events for compliance and monitoring
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Security event types
 */
export type AuditEventType =
    | 'login_success'
    | 'login_failed'
    | 'logout'
    | 'password_change'
    | 'password_reset_request'
    | 'password_reset_complete'
    | 'account_created'
    | 'account_deleted'
    | 'email_verified'
    | 'profile_updated'
    | 'subscription_created'
    | 'subscription_updated'
    | 'subscription_cancelled'
    | 'team_member_added'
    | 'team_member_removed'
    | 'permission_changed'
    | 'rate_limit_hit'
    | 'suspicious_activity';

/**
 * Event severity levels
 */
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
    event_type: AuditEventType;
    severity: AuditSeverity;
    user_id?: string;
    email?: string;
    ip_hash: string;
    user_agent_hash: string;
    resource_type?: string;
    resource_id?: string;
    details?: Record<string, unknown>;
    success: boolean;
}

/**
 * Simple hash function for IP/User Agent privacy
 */
function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Extract and hash client information from request
 */
export function getClientInfo(request: Request): { ipHash: string; userAgentHash: string } {
    // Get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    const ip = cfConnectingIp || realIp || forwarded?.split(',')[0]?.trim() || 'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    return {
        ipHash: hashString(ip),
        userAgentHash: hashString(userAgent),
    };
}

/**
 * Determine severity based on event type
 */
function getDefaultSeverity(eventType: AuditEventType): AuditSeverity {
    const severityMap: Record<AuditEventType, AuditSeverity> = {
        login_success: 'info',
        login_failed: 'warning',
        logout: 'info',
        password_change: 'warning',
        password_reset_request: 'warning',
        password_reset_complete: 'info',
        account_created: 'info',
        account_deleted: 'warning',
        email_verified: 'info',
        profile_updated: 'info',
        subscription_created: 'info',
        subscription_updated: 'info',
        subscription_cancelled: 'warning',
        team_member_added: 'info',
        team_member_removed: 'warning',
        permission_changed: 'warning',
        rate_limit_hit: 'warning',
        suspicious_activity: 'critical',
    };
    return severityMap[eventType] || 'info';
}

/**
 * Log a security event to the database
 * 
 * @param entry - Audit log entry data
 * @param request - Optional request object for client info
 */
export async function logAuditEvent(
    entry: Omit<AuditLogEntry, 'ip_hash' | 'user_agent_hash' | 'severity'> & {
        severity?: AuditSeverity;
    },
    request?: Request
): Promise<void> {
    try {
        const supabase = await createClient();

        // Get client info from request or use defaults
        let ipHash = 'unknown';
        let userAgentHash = 'unknown';

        if (request) {
            const clientInfo = getClientInfo(request);
            ipHash = clientInfo.ipHash;
            userAgentHash = clientInfo.userAgentHash;
        }

        const logEntry = {
            event_type: entry.event_type,
            severity: entry.severity || getDefaultSeverity(entry.event_type),
            user_id: entry.user_id || null,
            email: entry.email ? hashString(entry.email) : null, // Hash email for privacy
            ip_hash: ipHash,
            user_agent_hash: userAgentHash,
            resource_type: entry.resource_type || null,
            resource_id: entry.resource_id || null,
            details: entry.details || {},
            success: entry.success,
            created_at: new Date().toISOString(),
        };

        // Insert using service role (bypasses RLS)
        const { error } = await supabase
            .from('audit_logs')
            .insert(logEntry);

        if (error) {
            // Log to console if database insert fails
            // Don't throw - we don't want audit logging to break the main flow
            console.error('[AuditLogger] Failed to insert audit log:', error.message);
            console.log('[AuditLogger] Event:', JSON.stringify(logEntry));
        }
    } catch (err) {
        // Silent failure - audit logging should never break the application
        console.error('[AuditLogger] Error:', err);
    }
}

/**
 * Convenience function to log successful login
 */
export async function logLoginSuccess(
    userId: string,
    email: string,
    request: Request
): Promise<void> {
    await logAuditEvent({
        event_type: 'login_success',
        user_id: userId,
        email,
        success: true,
    }, request);
}

/**
 * Convenience function to log failed login
 */
export async function logLoginFailed(
    email: string,
    reason: string,
    request: Request
): Promise<void> {
    await logAuditEvent({
        event_type: 'login_failed',
        email,
        success: false,
        details: { reason },
    }, request);
}

/**
 * Convenience function to log rate limit hit
 */
export async function logRateLimitHit(
    action: string,
    request: Request
): Promise<void> {
    await logAuditEvent({
        event_type: 'rate_limit_hit',
        success: false,
        details: { action },
        severity: 'warning',
    }, request);
}

/**
 * Convenience function to log account creation
 */
export async function logAccountCreated(
    userId: string,
    email: string,
    accountType: string,
    request: Request
): Promise<void> {
    await logAuditEvent({
        event_type: 'account_created',
        user_id: userId,
        email,
        success: true,
        details: { account_type: accountType },
    }, request);
}

/**
 * Convenience function to log password change
 */
export async function logPasswordChange(
    userId: string,
    request: Request
): Promise<void> {
    await logAuditEvent({
        event_type: 'password_change',
        user_id: userId,
        success: true,
    }, request);
}

/**
 * Convenience function to log suspicious activity
 */
export async function logSuspiciousActivity(
    description: string,
    details: Record<string, unknown>,
    request: Request
): Promise<void> {
    await logAuditEvent({
        event_type: 'suspicious_activity',
        success: false,
        severity: 'critical',
        details: { description, ...details },
    }, request);
}
