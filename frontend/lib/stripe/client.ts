/**
 * Stripe Client Configuration
 * Client-side Stripe.js initialization
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
}

// Singleton instance of Stripe.js
let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe.js instance (client-side only)
 * Uses singleton pattern to avoid multiple initializations
 */
export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
        );
    }
    return stripePromise;
};
