'use client';

/**
 * Subscription Status Badge Component
 * Displays current subscription status including trial info
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface SubscriptionStatus {
    status: string;
    plan_id: string;
    trial_ends_at: string | null;
    current_period_end: string;
}

export default function SubscriptionStatusBadge({ lang }: { lang: string }) {
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSubscription() {
            try {
                const supabase = createClient();

                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Get subscription
                const { data } = await supabase
                    .from('subscriptions')
                    .select('status, plan_id, trial_ends_at, current_period_end')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setSubscription(data);
                }
            } catch (error) {
                console.error('Error fetching subscription:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchSubscription();
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse bg-gray-100 rounded-xl p-4 h-24"></div>
        );
    }

    if (!subscription) {
        // No subscription - show CTA
        return (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                        <p className="font-semibold text-orange-800">
                            {lang === 'pt' ? 'Sem assinatura ativa' : lang === 'es' ? 'Sin suscripción activa' : 'No active subscription'}
                        </p>
                        <p className="text-sm text-orange-600 mt-1">
                            {lang === 'pt' ? 'Escolha um plano para continuar usando a plataforma' : lang === 'es' ? 'Elige un plan para seguir usando la plataforma' : 'Choose a plan to continue using the platform'}
                        </p>
                        <Link
                            href={`/${lang}/pricing`}
                            className="inline-block mt-2 text-sm font-semibold text-orange-600 hover:text-orange-700 underline"
                        >
                            {lang === 'pt' ? 'Ver Planos →' : lang === 'es' ? 'Ver Planes →' : 'View Plans →'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (subscription.trial_ends_at) {
        const trialEnd = new Date(subscription.trial_ends_at);
        const now = new Date();
        const diffTime = trialEnd.getTime() - now.getTime();
        trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Status: trialing
    if (subscription.status === 'trialing' && trialDaysRemaining > 0) {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <p className="font-semibold text-blue-800">
                            {lang === 'pt' ? 'Trial Ativo' : lang === 'es' ? 'Prueba Activa' : 'Trial Active'}
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                            <span className="font-bold text-lg">{trialDaysRemaining}</span>{' '}
                            {trialDaysRemaining === 1
                                ? (lang === 'pt' ? 'dia restante' : lang === 'es' ? 'día restante' : 'day remaining')
                                : (lang === 'pt' ? 'dias restantes' : lang === 'es' ? 'días restantes' : 'days remaining')
                            }
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                            {lang === 'pt' ? 'Plano: ' : lang === 'es' ? 'Plan: ' : 'Plan: '}
                            <span className="font-semibold capitalize">{subscription.plan_id.replace('_', ' ')}</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Status: active
    if (subscription.status === 'active') {
        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                        <p className="font-semibold text-green-800">
                            {lang === 'pt' ? 'Assinatura Ativa' : lang === 'es' ? 'Suscripción Activa' : 'Subscription Active'}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                            {lang === 'pt' ? 'Plano: ' : lang === 'es' ? 'Plan: ' : 'Plan: '}
                            <span className="font-semibold capitalize">{subscription.plan_id.replace('_', ' ')}</span>
                        </p>
                        <Link
                            href={`/${lang}/dashboard/settings`}
                            className="inline-block mt-2 text-xs text-green-600 hover:text-green-700 underline"
                        >
                            {lang === 'pt' ? 'Gerenciar assinatura' : lang === 'es' ? 'Gestionar suscripción' : 'Manage subscription'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Status: past_due
    if (subscription.status === 'past_due') {
        return (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                        <p className="font-semibold text-yellow-800">
                            {lang === 'pt' ? 'Pagamento Pendente' : lang === 'es' ? 'Pago Pendiente' : 'Payment Pending'}
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                            {lang === 'pt' ? 'Atualize seu método de pagamento' : lang === 'es' ? 'Actualiza tu método de pago' : 'Please update your payment method'}
                        </p>
                        <Link
                            href={`/${lang}/dashboard/settings`}
                            className="inline-block mt-2 text-sm font-semibold text-yellow-700 hover:text-yellow-800 underline"
                        >
                            {lang === 'pt' ? 'Atualizar pagamento →' : lang === 'es' ? 'Actualizar pago →' : 'Update payment →'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Status: canceled
    if (subscription.status === 'canceled') {
        return (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-300 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-700">
                            {lang === 'pt' ? 'Assinatura Cancelada' : lang === 'es' ? 'Suscripción Cancelada' : 'Subscription Canceled'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {lang === 'pt' ? 'Reative sua assinatura para continuar' : lang === 'es' ? 'Reactiva tu suscripción para continuar' : 'Reactivate to continue'}
                        </p>
                        <Link
                            href={`/${lang}/pricing`}
                            className="inline-block mt-2 text-sm font-semibold text-gray-700 hover:text-gray-800 underline"
                        >
                            {lang === 'pt' ? 'Ver Planos →' : lang === 'es' ? 'Ver Planes →' : 'View Plans →'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Default fallback
    return null;
}
