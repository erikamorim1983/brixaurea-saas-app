/**
 * Stripe Customer Portal API Route
 * Creates a Stripe Customer Portal session for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
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

        // Get user's Stripe customer ID
        const { data: userData, error: userError } = await supabase
            .from('user_profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (userError || !userData?.stripe_customer_id) {
            return NextResponse.json(
                { error: 'No Stripe customer found for this user' },
                { status: 404 }
            );
        }

        // Create Customer Portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: userData.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        });

        return NextResponse.json({
            url: session.url,
        });

    } catch (error) {
        console.error('Error creating customer portal session:', error);
        return NextResponse.json(
            { error: 'Failed to create customer portal session' },
            { status: 500 }
        );
    }
}
