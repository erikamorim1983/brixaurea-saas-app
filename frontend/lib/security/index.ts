/**
 * Security Module - Index
 * 
 * Centralized exports for all security utilities
 * ISO 27001 compliant security controls
 */

// Rate Limiter
export {
    checkRateLimit,
    clearRateLimit,
    getClientIdentifier,
    getRateLimitHeaders,
    rateLimitedResponse,
    RATE_LIMIT_CONFIGS,
    type RateLimitType,
    type RateLimitResult,
} from './rate-limiter';

// Input Sanitizer
export {
    escapeHtml,
    stripHtml,
    removeDangerousPatterns,
    isValidEmail,
    validatePassword,
    sanitizeTextField,
    sanitizePhone,
    sanitizeZip,
    sanitizeUrl,
    sanitizeRegistrationForm,
    type PasswordValidation,
    type SanitizedFormData,
} from './input-sanitizer';

// Audit Logger
export {
    logAuditEvent,
    logLoginSuccess,
    logLoginFailed,
    logRateLimitHit,
    logAccountCreated,
    logPasswordChange,
    logSuspiciousActivity,
    getClientInfo,
    type AuditEventType,
    type AuditSeverity,
    type AuditLogEntry,
} from './audit-logger';
