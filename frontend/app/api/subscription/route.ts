import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Get subscription details
export async function GET() {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user's subscription with plan details
        const { data: subscription, error } = await supabase
            .from('subscriptions')
            .select(`
                *,
                subscription_plans (*)
            `)
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Subscription fetch error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch subscription' },
                { status: 500 }
            );
        }

        // Get all available plans for upgrade options
        const { data: plans } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        // Calculate usage stats
        const { count: memberCount } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_owner_id', user.id)
            .eq('status', 'active');

        const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', user.id);

        const plan = subscription?.subscription_plans;

        return NextResponse.json({
            subscription: subscription ? {
                id: subscription.id,
                planId: subscription.plan_id,
                status: subscription.status,
                billingCycle: subscription.billing_cycle,
                currentPeriodStart: subscription.current_period_start,
                currentPeriodEnd: subscription.current_period_end,
                trialEndsAt: subscription.trial_ends_at,
            } : null,
            plan: plan ? {
                id: plan.id,
                name: plan.name,
                description: plan.description,
                priceMonthly: plan.price_monthly,
                priceYearly: plan.price_yearly,
                maxUsers: plan.max_users,
                maxProjects: plan.max_projects,
                maxStorageMb: plan.max_storage_mb,
                features: plan.features,
            } : null,
            usage: {
                members: (memberCount || 0) + 1, // +1 for owner
                projects: projectCount || 0,
                // TODO: Add storage calculation
                storageMb: 0,
            },
            availablePlans: (plans || []).map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                priceMonthly: p.price_monthly,
                priceYearly: p.price_yearly,
                maxUsers: p.max_users,
                maxProjects: p.max_projects,
                maxStorageMb: p.max_storage_mb,
                features: p.features,
            })),
        });
    } catch (error) {
        console.error('Get subscription error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}

// PUT - Upgrade/change subscription
export async function PUT(request: Request) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { planId, billingCycle } = body;

        if (!planId) {
            return NextResponse.json(
                { error: 'Plan ID is required' },
                { status: 400 }
            );
        }

        // Validate plan exists
        const { data: plan } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('id', planId)
            .eq('is_active', true)
            .single();

        if (!plan) {
            return NextResponse.json(
                { error: 'Invalid plan' },
                { status: 400 }
            );
        }

        // Update or create subscription
        const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .single();

        const subscriptionData = {
            plan_id: planId,
            billing_cycle: billingCycle || 'monthly',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        };

        if (existingSub) {
            const { error } = await supabase
                .from('subscriptions')
                .update(subscriptionData)
                .eq('id', existingSub.id);

            if (error) {
                console.error('Update subscription error:', error);
                return NextResponse.json(
                    { error: 'Failed to update subscription' },
                    { status: 500 }
                );
            }
        } else {
            const { error } = await supabase
                .from('subscriptions')
                .insert({
                    user_id: user.id,
                    ...subscriptionData,
                });

            if (error) {
                console.error('Create subscription error:', error);
                return NextResponse.json(
                    { error: 'Failed to create subscription' },
                    { status: 500 }
                );
            }
        }

        // TODO: Integrate with Stripe for payment processing

        return NextResponse.json({
            message: 'Subscription updated successfully',
            planId,
        });
    } catch (error) {
        console.error('Update subscription error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}
