import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
    checkRateLimit,
    getClientIdentifier,
    rateLimitedResponse,
    getRateLimitHeaders,
    isValidEmail,
    sanitizeTextField,
    logAuditEvent,
    logRateLimitHit,
} from '@/lib/security';

export async function POST(request: Request) {
    // 1. Strict rate limiting for password reset (sensitive action)
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, 'passwordReset');

    if (!rateLimitResult.allowed) {
        await logRateLimitHit('password_reset', request);
        return rateLimitedResponse(rateLimitResult);
    }

    try {
        const body = await request.json();
        const { email } = body;

        // 2. Sanitize and validate email
        const sanitizedEmail = sanitizeTextField(email, 254).toLowerCase().trim();

        if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
            // Still return success message to prevent email enumeration
            return NextResponse.json(
                {
                    message: 'If this email exists, a password reset link has been sent.',
                },
                {
                    headers: getRateLimitHeaders(rateLimitResult),
                }
            );
        }

        // 3. Log password reset request attempt
        await logAuditEvent({
            event_type: 'password_reset_request',
            email: sanitizedEmail,
            success: true,
        }, request);

        const supabase = await createClient();

        // 4. Send password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/en/auth/reset-password`,
        });

        if (error) {
            console.error('Password reset error:', error);
            // Don't reveal error to client - could be used for enumeration
        }

        // 5. Always return success (security best practice - prevents email enumeration)
        return NextResponse.json(
            {
                message: 'If this email exists, a password reset link has been sent.',
            },
            {
                headers: getRateLimitHeaders(rateLimitResult),
            }
        );
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { message: 'An error occurred' },
            { status: 500 }
        );
    }
}
