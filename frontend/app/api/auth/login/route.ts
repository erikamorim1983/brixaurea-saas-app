import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
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
        const { email, password, rememberMe } = body;

        // 2. Input validation (server-side)
        const sanitizedEmail = sanitizeTextField(email, 254).toLowerCase().trim();

        if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
            await logLoginFailed(sanitizedEmail, 'invalid_email', request);
            // Generic error message
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

        // Custom Supabase Client Initialization for Login
        // This allows us to handle the 'rememberMe' logic by intercepting cookie setting
        const cookieStore = await cookies();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // If Remember Me is FALSE, make it a session cookie (remove expiry)
                            // Otherwise, keep the default (which is usually persistent for Supabase)
                            if (!rememberMe) {
                                delete options.maxAge;
                                delete options.expires;
                            }
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // Ignored
                    }
                },
            },
        });

        // 3. Attempt authentication
        const { data, error } = await supabase.auth.signInWithPassword({
            email: sanitizedEmail,
            password,
        });

        if (error) {
            // 4. Log failed attempt
            console.error('Authentication attempt failed:', error.message, '| Email:', sanitizedEmail);
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
        if (!data.user) throw new Error('User object missing after login');

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
    } catch (error: any) {
        console.error('API Login critical error:', error.message || error);
        return NextResponse.json(
            { message: 'An error occurred during login' },
            { status: 500 }
        );
    }
}
