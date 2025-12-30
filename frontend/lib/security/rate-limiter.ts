/**
 * Rate Limiter - Sliding Window Algorithm
 * 
 * ISO 27001 Control: A.9.4.2 - Secure log-on procedures
 * Prevents brute force attacks on authentication endpoints
 */

interface RateLimitConfig {
    maxAttempts: number;      // Max attempts allowed
    windowMs: number;         // Time window in milliseconds
    blockDurationMs?: number; // Block duration after max attempts (defaults to windowMs)
}

interface RateLimitEntry {
    attempts: number[];       // Timestamps of attempts
    blockedUntil?: number;    // Block expiry timestamp
}

// In-memory store - for production with multiple instances, use Redis
const store = new Map<string, RateLimitEntry>();

// Predefined configurations
export const RATE_LIMIT_CONFIGS = {
    // Login: 5 attempts per 15 minutes
    login: {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000,         // 15 minutes
        blockDurationMs: 30 * 60 * 1000,  // 30 minutes block
    },
    // Registration: 100 attempts per hour (DEVELOPMENT - reduce for production!)
    register: {
        maxAttempts: 100,
        windowMs: 60 * 60 * 1000,         // 1 hour
        blockDurationMs: 5 * 60 * 1000, // 5 minutes block
    },
    // Sensitive actions: 3 attempts per hour
    sensitive: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000,         // 1 hour
        blockDurationMs: 60 * 60 * 1000,  // 1 hour block
    },
    // Password reset: 3 attempts per hour
    passwordReset: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000,
        blockDurationMs: 60 * 60 * 1000,
    },
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Get client identifier from request
 * Uses IP address with fallback to session token
 */
export function getClientIdentifier(request: Request): string {
    // Try to get IP from various headers (proxies, load balancers)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    let ip = cfConnectingIp || realIp || forwarded?.split(',')[0]?.trim() || 'unknown';

    // Hash the IP for privacy (we don't need to store raw IPs)
    // Using simple hash - in production, use crypto.subtle
    const hash = simpleHash(ip);

    return hash;
}

/**
 * Simple string hash function
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}

/**
 * Clean up expired entries from the store
 */
function cleanupStore(): void {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        // Remove entries with no recent attempts and not blocked
        const recentAttempts = entry.attempts.filter(t => t > now - 2 * 60 * 60 * 1000);
        if (recentAttempts.length === 0 && (!entry.blockedUntil || entry.blockedUntil < now)) {
            store.delete(key);
        }
    }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupStore, 5 * 60 * 1000);
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;           // Timestamp when limit resets
    retryAfterSeconds?: number; // Seconds until retry is allowed
    blocked: boolean;          // Is the client blocked?
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Client identifier (hashed IP)
 * @param type - Type of rate limit to apply
 * @returns RateLimitResult with status and metadata
 */
export function checkRateLimit(
    identifier: string,
    type: RateLimitType
): RateLimitResult {
    const config = RATE_LIMIT_CONFIGS[type];
    const key = `${type}:${identifier}`;
    const now = Date.now();

    // Get or create entry
    let entry = store.get(key);
    if (!entry) {
        entry = { attempts: [] };
        store.set(key, entry);
    }

    // Check if blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
        const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.blockedUntil,
            retryAfterSeconds,
            blocked: true,
        };
    }

    // Clear block if expired
    if (entry.blockedUntil && entry.blockedUntil <= now) {
        entry.blockedUntil = undefined;
        entry.attempts = [];
    }

    // Remove attempts outside the window (sliding window)
    entry.attempts = entry.attempts.filter(t => t > now - config.windowMs);

    // Check if limit exceeded
    if (entry.attempts.length >= config.maxAttempts) {
        // Block the client
        entry.blockedUntil = now + (config.blockDurationMs || config.windowMs);
        store.set(key, entry);

        const retryAfterSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.blockedUntil,
            retryAfterSeconds,
            blocked: true,
        };
    }

    // Allow the request and record attempt
    entry.attempts.push(now);
    store.set(key, entry);

    const remaining = config.maxAttempts - entry.attempts.length;
    const oldestAttempt = entry.attempts[0];
    const resetAt = oldestAttempt + config.windowMs;

    return {
        allowed: true,
        remaining,
        resetAt,
        blocked: false,
    };
}

/**
 * Record a successful action (clears rate limit for that type)
 * Call this after successful login to reset failed attempts
 */
export function clearRateLimit(identifier: string, type: RateLimitType): void {
    const key = `${type}:${identifier}`;
    store.delete(key);
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
    };

    if (result.retryAfterSeconds) {
        headers['Retry-After'] = result.retryAfterSeconds.toString();
    }

    return headers;
}

/**
 * Create rate-limited JSON response
 */
export function rateLimitedResponse(result: RateLimitResult): Response {
    return new Response(
        JSON.stringify({
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter: result.retryAfterSeconds,
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                ...getRateLimitHeaders(result),
            },
        }
    );
}
