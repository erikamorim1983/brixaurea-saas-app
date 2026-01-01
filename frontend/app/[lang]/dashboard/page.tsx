import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/get-dictionary';
import Link from 'next/link';
import SubscriptionStatusBadge from './components/SubscriptionStatusBadge';
import YellowWaveEmoji from './components/YellowWaveEmoji';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    const titles = {
        en: 'Dashboard - BrixAurea',
        pt: 'Painel - BrixAurea',
        es: 'Panel - BrixAurea',
    };

    return {
        title: titles[lang as keyof typeof titles] || titles.en,
    };
}

export default async function DashboardPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);
    const supabase = await createClient();

    // Get user data safely
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;

    if (userError || !user) {
        console.error('Dashboard Page Auth Error:', userError?.message);
    }

    // Get user profile safely
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, account_type')
        .eq('id', user?.id)
        .single();

    if (profileError) {
        console.warn('Dashboard Page Profile Warning:', profileError.message);
    }

    const t = dictionary.dashboard || {
        welcome: 'Welcome',
        overview: 'Overview',
        quick_actions: 'Quick Actions',
        recent_activity: 'Recent Activity',
        no_activity: 'No recent activity',
        new_project: 'New Project',
        view_reports: 'View Reports',
        run_analysis: 'Run Analysis',
        stats: {
            projects: 'Total Projects',
            analyses: 'Analyses Run',
            reports: 'Reports Generated',
        },
    };

    const firstName = profile?.first_name || user?.email?.split('@')[0] || 'User';

    // Placeholder stats (will be real data later)
    const stats = [
        {
            label: t.stats?.projects || 'Total de Projetos Analizados',
            value: '0',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            color: 'from-cyan-500 to-blue-500',
        },
        {
            label: t.stats?.analyses || 'Total de Projetos em andamento',
            value: '0',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            color: 'from-purple-500 to-pink-500',
        },
        {
            label: t.stats?.reports || 'Total de Projetos em analise',
            value: '0',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'from-orange-500 to-red-500',
        },
    ];

    const quickActions = [
        {
            name: t.new_project || 'New Project',
            href: `/${lang}/dashboard/projects/new`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
        },
        {
            name: t.run_analysis || 'Run Analysis',
            href: `/${lang}/dashboard/analysis`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            name: t.view_reports || 'View Reports',
            href: `/${lang}/dashboard/reports`,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
    ];

    const BentoGrid = (await import('@/components/ui/BentoGrid')).BentoGrid;
    const BentoCard = (await import('@/components/ui/BentoCard')).BentoCard;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Welcome Section - Glass Header */}
            <div className="relative rounded-3xl p-8 overflow-hidden glass-card border border-white/20">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <div className="w-64 h-64 bg-gradient-to-br from-[var(--gold)] to-[var(--gold-glow)] rounded-full blur-3xl animate-pulse" />
                </div>

                <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]">
                    {t.welcome}, {firstName}! <YellowWaveEmoji />
                </h1>
                <p className="text-gray-500 max-w-2xl text-lg">
                    {dictionary.dashboard?.subtitle || 'Here\'s an overview of your real estate projects.'}
                </p>
            </div>

            <BentoGrid className="auto-rows-[12rem]">
                {/* Stats Cards */}
                {stats.map((stat, index) => (
                    <BentoCard
                        key={index}
                        className={index === 0 ? "md:col-span-1" : ""}
                        header={
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${stat.color} shadow-lg shadow-cyan-500/20`}>
                                {stat.icon}
                            </div>
                        }
                        title={
                            <span className="text-3xl font-bold text-gray-800">
                                {stat.value}
                            </span>
                        }
                        description={
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                {stat.label}
                            </span>
                        }
                    />
                ))}

                {/* Quick Actions - Featured Card */}
                <BentoCard
                    className="md:col-span-2 md:row-span-2 glass-heavy text-white border-white/10"
                    title={
                        <span className="text-2xl font-bold text-white">
                            {t.quick_actions || 'Quick Actions'}
                        </span>
                    }
                    description="Start a new feasibility study today."
                    header={<div className="h-full min-h-[6rem] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] w-full flex items-center justify-center rounded-xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                        <div className="grid grid-cols-2 gap-4 w-full px-8 relative z-10">
                            {quickActions.map((action, i) => (
                                <Link key={i} href={action.href} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 backdrop-blur-sm">
                                    <div className="text-cyan-400">{action.icon}</div>
                                    <span className="text-sm font-medium text-gray-200">{action.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>}
                />

                {/* Recent Activity */}
                <BentoCard
                    className="md:col-span-1 md:row-span-2"
                    title={t.recent_activity || 'Recent Activity'}
                    description={t.no_activity || 'No recent activity'}
                    header={
                        <div className="flex flex-col items-center justify-center h-40 text-gray-300">
                            <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    }
                />
            </BentoGrid>
        </div>
    );
}
