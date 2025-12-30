/**
 * Stripe Checkout API Route
 * Creates a Stripe Checkout Session for subscription purchases
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, getStripePriceId, getTrialDays } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { planId, billingFrequency } = body;

        // Validate inputs
        if (!planId || !billingFrequency) {
            return NextResponse.json(
                { error: 'Missing required fields: planId, billingFrequency' },
                { status: 400 }
            );
        }

        if (!['monthly', 'yearly'].includes(billingFrequency)) {
            return NextResponse.json(
                { error: 'Invalid billing frequency. Must be "monthly" or "yearly"' },
                { status: 400 }
            );
        }

        // Get user's email
        const userEmail = user.email;
        if (!userEmail) {
            return NextResponse.json(
                { error: 'User email not found' },
                { status: 400 }
            );
        }

        // Check if user already has a Stripe customer ID
        const { data: userData, error: userError } = await supabase
            .from('user_profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (userError) {
            console.error('Error fetching user data:', userError);
            return NextResponse.json(
                { error: 'Failed to fetch user data' },
                { status: 500 }
            );
        }

        let customerId = userData?.stripe_customer_id;

        // Create Stripe customer if doesn't exist
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: userEmail,
                metadata: {
                    supabase_user_id: user.id,
                },
            });

            customerId = customer.id;

            // Update user with Stripe customer ID
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error updating user with customer ID:', updateError);
            }
        }

        // Get the Stripe price ID
        const priceId = getStripePriceId(planId, billingFrequency);
        const trialDays = getTrialDays(planId);

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                trial_period_days: trialDays > 0 ? trialDays : undefined,
                metadata: {
                    supabase_user_id: user.id,
                    plan_id: planId,
                },
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
            metadata: {
                supabase_user_id: user.id,
                plan_id: planId,
            },
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });

    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
