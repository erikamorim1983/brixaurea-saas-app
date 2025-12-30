import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
    checkRateLimit,
    getClientIdentifier,
    rateLimitedResponse,
    getRateLimitHeaders,
    isValidEmail,
    sanitizeTextField,
    logLoginSuccess,
    logLoginFailed,
    logRateLimitHit,
} from '@/lib/security';

export async function POST(request: Request) {
    // 1. Rate limiting check
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, 'login');

    if (!rateLimitResult.allowed) {
        await logRateLimitHit('login', request);
        return rateLimitedResponse(rateLimitResult);
    }

    try {
        const body = await request.json();
        const { email, password } = body;

        // 2. Input validation (server-side)
        const sanitizedEmail = sanitizeTextField(email, 254).toLowerCase().trim();

        if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
            await logLoginFailed(sanitizedEmail, 'invalid_email', request);
            // Generic error message - don't reveal if email format is wrong
            return NextResponse.json(
                { message: 'Invalid credentials' },
                {
                    status: 401,
                    headers: getRateLimitHeaders(rateLimitResult),
                }
            );
        }

        if (!password) {
            await logLoginFailed(sanitizedEmail, 'empty_password', request);
            return NextResponse.json(
                { message: 'Invalid credentials' },
                {
                    status: 401,
                    headers: getRateLimitHeaders(rateLimitResult),
                }
            );
        }

        const supabase = await createClient();

        // 3. Attempt authentication
        const { data, error } = await supabase.auth.signInWithPassword({
            email: sanitizedEmail,
            password,
        });

        if (error) {
            // 4. Log failed attempt (don't reveal specific error)
            await logLoginFailed(sanitizedEmail, error.message, request);

            return NextResponse.json(
                { message: 'Invalid credentials' }, // Generic message
                {
                    status: 401,
                    headers: getRateLimitHeaders(rateLimitResult),
                }
            );
        }

        // 5. Successful login - log and respond
        await logLoginSuccess(data.user.id, sanitizedEmail, request);

        return NextResponse.json(
            {
                message: 'Login successful',
                user: {
                    id: data.user.id,
                    email: data.user.email,
                },
            },
            {
                headers: getRateLimitHeaders(rateLimitResult),
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'An error occurred' }, // Generic error
            { status: 500 }
        );
    }
}
