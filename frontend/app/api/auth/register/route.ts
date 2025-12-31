import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { getTrialDays, getAccountType, getPlanById } from '@/lib/config/plans';
import {
    checkRateLimit,
    getClientIdentifier,
    rateLimitedResponse,
    getRateLimitHeaders,
    isValidEmail,
    validatePassword,
    sanitizeRegistrationForm,
    logAccountCreated,
    logRateLimitHit,
    logAuditEvent,
} from '@/lib/security';


export async function POST(request: Request) {
    // 1. Rate limiting check (stricter for registration)
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, 'register');

    if (!rateLimitResult.allowed) {
        await logRateLimitHit('register', request);
        return rateLimitedResponse(rateLimitResult);
    }

    try {
        const body = await request.json();

        // 2. Sanitize all inputs
        const sanitized = sanitizeRegistrationForm(body);
        const {
            email,
            firstName,
            lastName,
            phone,
            companyName,
            website,
            addressStreet,
            addressSuite,
            addressCity,
            addressState,
            addressZip,
        } = sanitized;

        // Extract non-sanitizable fields
        const { password, planId, billingFrequency, ein, organizationTypes, lang } = body;

        // 3. Server-side validation
        if (!email || !isValidEmail(email)) {
            return NextResponse.json(
                { message: 'Invalid email address' },
                {
                    status: 400,
                    headers: getRateLimitHeaders(rateLimitResult),
                }
            );
        }

        // Password strength validation
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                {
                    message: 'Password does not meet requirements',
                    errors: passwordValidation.errors,
                },
                {
                    status: 400,
                    headers: getRateLimitHeaders(rateLimitResult),
                }
            );
        }

        if (!firstName || !lastName) {
            return NextResponse.json(
                { message: 'First name and last name are required' },
                {
                    status: 400,
                    headers: getRateLimitHeaders(rateLimitResult),
                }
            );
        }

        // 4. Derive account type from plan
        const selectedPlanId = planId || 'individual';
        const derivedAccountType = getAccountType(selectedPlanId);
        const trialDays = getTrialDays(selectedPlanId);
        const validBillingFrequency = billingFrequency === 'yearly' ? 'yearly' : 'monthly';

        const plan = getPlanById(selectedPlanId);
        if (!plan) {
            return NextResponse.json(
                { message: 'Invalid plan selected' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // 5. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    account_type: derivedAccountType,
                    plan_id: selectedPlanId,
                    billing_frequency: validBillingFrequency,
                    lang: lang || 'en',
                },
            },
        });

        if (authError) {
            console.error('Auth error:', authError);
            // Log failed registration attempt
            await logAuditEvent({
                event_type: 'account_created',
                email,
                success: false,
                details: { reason: authError.message },
            }, request);

            // Generic error message
            return NextResponse.json(
                { message: 'Registration failed. Please try again.' },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { message: 'Registration failed. Please try again.' },
                { status: 400 }
            );
        }

        // Initialize Admin Client for database operations (Bypass RLS)
        const supabaseAdmin = createAdminClient();

        if (!supabaseAdmin) {
            console.error('CRITICAL: Failed to initialize Admin Client. Check SUPABASE_SERVICE_ROLE_KEY.');
            // We shouldn't fail silently here, but we also can't easily rollback the auth user creation.
            // Ideally, we return an error telling the dev to fix env vars.
            return NextResponse.json(
                { message: 'Server configuration error. Please contact support.' },
                { status: 500 }
            );
        }


        // 6. Create user profile with sanitized data using Admin Client
        const profileData: Record<string, unknown> = {
            id: authData.user.id,
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            account_type: derivedAccountType,
        };

        // Add organization fields if business plan
        if (derivedAccountType === 'organization') {
            profileData.company_name = companyName || null;
            profileData.ein = ein || null;
            profileData.website = website || null;
            profileData.organization_types = organizationTypes || [];
            profileData.address_street = addressStreet || null;
            profileData.address_suite = addressSuite || null;
            profileData.address_city = addressCity || null;
            profileData.address_state = addressState || null;
            profileData.address_zip = addressZip || null;
        }

        const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .insert(profileData);

        if (profileError) {
            console.error('Profile error:', profileError);
            // Consider rollback logic or queueing for retry
        }

        // 7. Create subscription with trial using Admin Client
        const trialEndsAt = trialDays > 0
            ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
            : null;

        const periodDays = validBillingFrequency === 'yearly' ? 365 : 30;

        const { error: subscriptionError } = await supabaseAdmin
            .from('subscriptions')
            .insert({
                user_id: authData.user.id,
                plan_id: selectedPlanId,
                billing_cycle: validBillingFrequency,
                status: trialDays > 0 ? 'trialing' : 'active',
                trial_ends_at: trialEndsAt,
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000).toISOString(),
            });

        if (subscriptionError) {
            console.error('Subscription error:', subscriptionError);
        }

        // 8. Log successful account creation
        await logAccountCreated(authData.user.id, email, derivedAccountType, request);

        return NextResponse.json(
            {
                message: 'Registration successful. Please check your email to verify your account.',
                user: {
                    id: authData.user.id,
                    email: authData.user.email,
                },
                subscription: {
                    planId: selectedPlanId,
                    trialDays,
                    trialEndsAt,
                },
            },
            {
                headers: getRateLimitHeaders(rateLimitResult),
            }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'An error occurred during registration' },
            { status: 500 }
        );
    }
}

