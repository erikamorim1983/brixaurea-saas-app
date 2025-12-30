/**
 * Stripe Server Configuration
 * Server-side Stripe SDK initialization and configuration
 */

import Stripe from 'stripe';

// Validate required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe SDK
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any, // Bypass strict version check for now
    typescript: true,
});

// Stripe Product IDs mapping
export const STRIPE_PRODUCTS = {
    individual: process.env.STRIPE_PRODUCT_INDIVIDUAL || '',
    business_starter: process.env.STRIPE_PRODUCT_STARTER || '',
    business_pro: process.env.STRIPE_PRODUCT_PRO || '',
    business_plus: process.env.STRIPE_PRODUCT_PLUS || '',
} as const;

// Stripe Price IDs mapping
export const STRIPE_PRICES = {
    individual: {
        monthly: process.env.STRIPE_PRICE_INDIVIDUAL_MONTHLY || '',
        yearly: process.env.STRIPE_PRICE_INDIVIDUAL_YEARLY || '',
    },
    business_starter: {
        monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
        yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || '',
    },
    business_pro: {
        monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
        yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
    },
    business_plus: {
        monthly: process.env.STRIPE_PRICE_PLUS_MONTHLY || '',
        yearly: process.env.STRIPE_PRICE_PLUS_YEARLY || '',
    },
} as const;

// Helper function to get price ID for a plan
export function getStripePriceId(
    planId: string,
    billingFrequency: 'monthly' | 'yearly'
): string {
    const priceMap = STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES];
    if (!priceMap) {
        throw new Error(`Invalid plan ID: ${planId}`);
    }
    return priceMap[billingFrequency];
}

// Helper function to get product ID for a plan
export function getStripeProductId(planId: string): string {
    const productId = STRIPE_PRODUCTS[planId as keyof typeof STRIPE_PRODUCTS];
    if (!productId) {
        throw new Error(`Invalid plan ID: ${planId}`);
    }
    return productId;
}

// Trial days configuration (matching plans.ts)
export const TRIAL_DAYS = {
    individual: 7,
    business_starter: 14,
    business_pro: 14,
    business_plus: 14,
    enterprise: 0,
} as const;

export function getTrialDays(planId: string): number {
    return TRIAL_DAYS[planId as keyof typeof TRIAL_DAYS] || 0;
}
