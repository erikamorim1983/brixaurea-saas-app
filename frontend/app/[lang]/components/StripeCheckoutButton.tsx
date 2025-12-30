'use client';

/**
 * Stripe Checkout Button Component
 * Handles Stripe checkout flow for subscription purchases
 */

import { useState } from 'react';
import { getStripe } from '@/lib/stripe/client';

interface StripeCheckoutButtonProps {
    planId: string;
    billingFrequency: 'monthly' | 'yearly';
    label: string;
    className?: string;
    disabled?: boolean;
}

export default function StripeCheckoutButton({
    planId,
    billingFrequency,
    label,
    className = '',
    disabled = false,
}: StripeCheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        try {
            setLoading(true);
            setError(null);

            // Create checkout session
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planId,
                    billingFrequency,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create checkout session');
            }

            const { url } = await response.json();

            // Redirect to Stripe Checkout
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleCheckout}
                disabled={disabled || loading}
                className={`${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
            >
                {loading ? 'Loading...' : label}
            </button>
            {error && (
                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
