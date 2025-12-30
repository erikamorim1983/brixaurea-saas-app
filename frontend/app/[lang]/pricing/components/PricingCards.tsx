'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plan, formatStorage, formatPrice, getMonthlyEquivalent, BillingFrequency } from '@/lib/config/plans';
import StripeCheckoutButton from '@/app/[lang]/components/StripeCheckoutButton';

interface PricingCardsProps {
    plans: Plan[];
    lang: string;
    content: {
        toggle: {
            monthly: string;
            yearly: string;
            savePercent: string;
            twoMonthsFree: string;
        };
        plans: {
            popular: string;
            perMonth: string;
            perYear: string;
            billedYearly: string;
            trialDays: string;
            startTrial: string;
            users: string;
            user: string;
            projects: string;
            unlimited: string;
            storage: string;
        };
        features: Record<string, string>;
    };
}

// Format currency with thousands separator (e.g., $1,499)
function formatCurrency(value: number, decimals: boolean = true): string {
    if (decimals) {
        return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return Math.round(value).toLocaleString('en-US');
}

export default function PricingCards({ plans, lang, content }: PricingCardsProps) {
    const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>('monthly');
    const c = content;

    return (
        <div>
            {/* Billing Toggle */}
            <div className="flex flex-col items-center mb-12">
                <div className="inline-flex items-center bg-gray-100 rounded-xl p-1.5 mb-3">
                    <button
                        onClick={() => setBillingFrequency('monthly')}
                        className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${billingFrequency === 'monthly'
                            ? 'bg-white text-[#081F2E] shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {c.toggle.monthly}
                    </button>
                    <button
                        onClick={() => setBillingFrequency('yearly')}
                        className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${billingFrequency === 'yearly'
                            ? 'bg-white text-[#081F2E] shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {c.toggle.yearly}
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            {c.toggle.savePercent}
                        </span>
                    </button>
                </div>

                {/* "2 months free" message for yearly */}
                {billingFrequency === 'yearly' && (
                    <p className="text-green-600 text-sm font-medium flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {c.toggle.twoMonthsFree}
                    </p>
                )}
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {plans.map((plan) => {
                    const displayPrice = billingFrequency === 'yearly'
                        ? getMonthlyEquivalent(plan)
                        : plan.price;

                    return (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${plan.isPopular
                                ? 'border-[#00D9FF] ring-2 ring-[#00D9FF]/20'
                                : 'border-gray-200'
                                }`}
                        >
                            {plan.isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="px-4 py-1.5 bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white text-sm font-semibold rounded-full shadow-lg">
                                        {c.plans.popular}
                                    </span>
                                </div>
                            )}

                            <div className="p-8">
                                {/* Plan Name */}
                                <h3 className="text-xl font-bold text-[#081F2E] mb-2">
                                    {plan.name}
                                </h3>

                                {/* Trial Badge */}
                                <p className="text-sm text-[#00D9FF] font-medium mb-4">
                                    {c.plans.trialDays.replace('{days}', plan.trialDays.toString())}
                                </p>

                                {/* Price */}
                                <div className="mb-2">
                                    <span className="text-4xl font-bold text-[#081F2E]">
                                        ${formatPrice(displayPrice)}
                                    </span>
                                    <span className="text-gray-500">{c.plans.perMonth}</span>
                                </div>

                                {/* Billing info - only for yearly */}
                                <div className="mb-6 min-h-[24px]">
                                    {billingFrequency === 'yearly' && (
                                        <p className="text-sm text-gray-500">
                                            ${formatCurrency(plan.priceYearly, false)}{c.plans.perYear} {c.plans.billedYearly}
                                        </p>
                                    )}
                                </div>

                                {/* Quick Stats */}
                                <div className="space-y-3 mb-8 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-[#00D9FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>
                                            {plan.maxUsers === -1
                                                ? c.plans.unlimited
                                                : `${plan.maxUsers} ${plan.maxUsers === 1 ? c.plans.user : c.plans.users}`
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-[#00D9FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        <span>
                                            {plan.maxProjects === -1
                                                ? c.plans.unlimited + ' ' + c.plans.projects
                                                : `${plan.maxProjects} ${c.plans.projects}`
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-[#00D9FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                        </svg>
                                        <span>{formatStorage(plan.maxStorageMb)} {c.plans.storage}</span>
                                    </div>
                                </div>

                                {/* Features List */}
                                <ul className="space-y-2 mb-8">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>{c.features[feature] || feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <Link
                                    href={`/${lang}/auth/register?plan=${plan.id}&billing=${billingFrequency}`}
                                    className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${plan.isPopular
                                        ? 'bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white hover:shadow-lg hover:shadow-cyan-500/30'
                                        : 'bg-gray-100 text-[#081F2E] hover:bg-gray-200'
                                        }`}
                                >
                                    {c.plans.startTrial}
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
