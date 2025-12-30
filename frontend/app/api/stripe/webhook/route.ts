// @ts-nocheck
/**
 * Stripe Webhook Handler
 * Processes Stripe webhook events for subscription lifecycle management
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'Missing stripe-signature header' },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 400 }
        );
    }

    const supabase = await createClient();

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session, supabase);
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription, supabase);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription, supabase);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentSucceeded(invoice, supabase);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(invoice, supabase);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Log the event
        await supabase.from('stripe_events').insert({
            event_id: event.id,
            event_type: event.type,
            event_data: event.data.object,
            processed: true,
        });

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);

        // Log failed event
        await supabase.from('stripe_events').insert({
            event_id: event.id,
            event_type: event.type,
            event_data: event.data.object,
            processed: false,
        });

        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

/**
 * Handle checkout.session.completed event
 * Creates a new subscription in the database
 */
async function handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
    supabase: any
) {
    const userId = session.metadata?.supabase_user_id;
    const planId = session.metadata?.plan_id;
    const subscriptionId = session.subscription as string;

    if (!userId || !planId || !subscriptionId) {
        console.error('Missing metadata in checkout session');
        return;
    }

    // Get full subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Determine subscription status
    let status = subscription.status;
    if (status === 'trialing') {
        status = 'trialing';
    } else if (status === 'active') {
        status = 'active';
    }

    // Create or update subscription in database
    const { error } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: userId,
            plan_id: planId,
            status: status,
            billing_cycle: subscription.items.data[0].price.recurring?.interval === 'year' ? 'yearly' : 'monthly',
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscriptionId,
            trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }, {
            onConflict: 'user_id',
        });

    if (error) {
        console.error('Error creating subscription:', error);
        throw error;
    }

    console.log(`Subscription created for user ${userId}: ${subscriptionId}`);
}

/**
 * Handle customer.subscription.updated event
 * Updates subscription details in the database
 */
async function handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
    supabase: any
) {
    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: subscription.status,
            trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            canceled_at: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000).toISOString()
                : null,
        })
        .eq('stripe_subscription_id', subscription.id);

    if (error) {
        console.error('Error updating subscription:', error);
        throw error;
    }

    console.log(`Subscription updated: ${subscription.id}`);
}

/**
 * Handle customer.subscription.deleted event
 * Marks subscription as canceled in the database
 */
async function handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
    supabase: any
) {
    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

    if (error) {
        console.error('Error deleting subscription:', error);
        throw error;
    }

    console.log(`Subscription canceled: ${subscription.id}`);
}

/**
 * Handle invoice.payment_succeeded event
 * Logs successful payment
 */
async function handlePaymentSucceeded(
    invoice: Stripe.Invoice,
    supabase: any
) {
    console.log(`Payment succeeded for invoice: ${invoice.id}`);
    // You can add additional logic here, such as sending confirmation emails
}

/**
 * Handle invoice.payment_failed event
 * Updates subscription status and notifies user
 */
async function handlePaymentFailed(
    invoice: Stripe.Invoice,
    supabase: any
) {
    const subscriptionId = invoice.subscription as string;

    if (!subscriptionId) {
        return;
    }

    const { error } = await supabase
        .from('subscriptions')
        .update({
            status: 'past_due',
        })
        .eq('stripe_subscription_id', subscriptionId);

    if (error) {
        console.error('Error updating subscription status:', error);
    }

    console.log(`Payment failed for subscription: ${subscriptionId}`);
    // TODO: Send email notification to user
}
