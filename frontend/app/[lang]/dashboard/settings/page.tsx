import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/get-dictionary';
import ProfileForm from './components/ProfileForm';
import NotificationSettings from './components/NotificationSettings';
import MFASettings from './components/MFASettings';
import UpdatePasswordForm from './components/UpdatePasswordForm';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    const titles = {
        en: 'Settings - BrixAurea',
        pt: 'Configurações - BrixAurea',
        es: 'Configuración - BrixAurea',
    };

    return {
        title: titles[lang as keyof typeof titles] || titles.en,
    };
}

export default async function SettingsPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);
    const supabase = await createClient();

    // Get user data
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null; // Should be handled by layout/middleware, but safe check for TS
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Get subscription with plan details
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
            *,
            subscription_plans (
                id,
                name,
                description,
                price_monthly,
                max_users,
                max_projects,
                max_storage_mb,
                features
            )
        `)
        .eq('user_id', user.id)
        .single();

    // Get project count
    const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

    // Get member count (if org)
    const { count: memberCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_owner_id', user?.id)
        .eq('status', 'active');

    const plan = subscription?.subscription_plans;
    const currentMembers = (memberCount || 0) + 1; // +1 for owner
    const currentProjects = projectCount || 0;

    const t = dictionary.settings || {
        title: 'Settings',
        profile: {
            title: 'Profile Information',
            subtitle: 'Update your personal information',
        },
        account: {
            title: 'Account',
            change_password: 'Change Password',
            delete_account: 'Delete Account',
        },
    };

    const planT = {
        pt: {
            title: 'Meu Plano',
            subtitle: 'Seu plano de assinatura atual',
            current_plan: 'Plano Atual',
            usage: 'Uso',
            members: 'Membros',
            projects: 'Projetos',
            storage: 'Armazenamento',
            unlimited: 'Ilimitado',
            upgrade: 'Fazer Upgrade',
            manage: 'Gerenciar Plano',
            features: 'Recursos Incluídos',
            manage_team: 'Gerenciar Equipe',
        },
        en: {
            title: 'My Plan',
            subtitle: 'Your current subscription plan',
            current_plan: 'Current Plan',
            usage: 'Usage',
            members: 'Members',
            projects: 'Projects',
            storage: 'Storage',
            unlimited: 'Unlimited',
            upgrade: 'Upgrade',
            manage: 'Manage Plan',
            features: 'Included Features',
            manage_team: 'Manage Team',
        },
        es: {
            title: 'Mi Plan',
            subtitle: 'Tu plan de suscripción actual',
            current_plan: 'Plan Actual',
            usage: 'Uso',
            members: 'Miembros',
            projects: 'Proyectos',
            storage: 'Almacenamiento',
            unlimited: 'Ilimitado',
            upgrade: 'Actualizar',
            manage: 'Administrar Plan',
            features: 'Características Incluidas',
            manage_team: 'Administrar Equipo',
        },
    };

    const pt = planT[lang as keyof typeof planT] || planT.en;

    const formatStorage = (mb: number) => {
        if (mb === -1) return pt.unlimited;
        if (mb >= 1024) return `${Math.round(mb / 1024)} GB`;
        return `${mb} MB`;
    };

    // Calculate trial status
    const isInTrial = subscription?.is_trial && subscription?.trial_ends_at;
    const trialEndsAt = subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
    const trialDaysRemaining = trialEndsAt
        ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;
    const trialExpiringSoon = trialDaysRemaining > 0 && trialDaysRemaining <= 3;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
                <p className="text-gray-500 mt-1">{t.profile?.subtitle || 'Manage your account settings'}</p>
            </div>

            {/* Trial Banner - Show when trial is active */}
            {isInTrial && trialDaysRemaining > 0 && (
                <div className={`rounded-xl p-4 flex items-center justify-between ${trialExpiringSoon
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            {trialExpiringSoon ? '⏰' : '🎉'}
                        </div>
                        <div>
                            <p className="font-semibold">
                                {trialExpiringSoon
                                    ? `Trial expira em ${trialDaysRemaining} dia${trialDaysRemaining > 1 ? 's' : ''}!`
                                    : `${trialDaysRemaining} dias restantes no trial`
                                }
                            </p>
                            <p className="text-sm opacity-90">
                                {trialExpiringSoon
                                    ? 'Adicione um método de pagamento para continuar usando'
                                    : 'Aproveite todos os recursos sem cobranças'
                                }
                            </p>
                        </div>
                    </div>
                    {trialExpiringSoon && (
                        <a
                            href={`/${lang}/dashboard/settings/billing`}
                            className="px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
                        >
                            Adicionar Pagamento
                        </a>
                    )}
                </div>
            )}

            {/* My Plan Section */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-slate-400 text-sm">{pt.current_plan}</p>
                        <h2 className="text-2xl font-bold mt-1">
                            {plan?.name || 'Individual'}
                            {isInTrial && trialDaysRemaining > 0 && (
                                <span className="ml-2 px-2 py-1 bg-cyan-500/30 text-cyan-300 text-xs font-medium rounded-full">
                                    Trial
                                </span>
                            )}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">{plan?.description || 'Basic plan'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold">
                            ${((plan?.price_monthly ?? 2900) / 100).toFixed(0)}
                            <span className="text-lg font-normal text-slate-400">/mês</span>
                        </p>
                        {isInTrial && trialDaysRemaining > 0 && (
                            <p className="text-cyan-400 text-sm">Primeiro pagamento após o trial</p>
                        )}
                    </div>
                </div>

                {/* Usage Stats (Actionable Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Members - Clickable for Organizations */}
                    {profile?.account_type === 'organization' ? (
                        <a
                            href={`/${lang}/dashboard/settings/team`}
                            className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <p className="text-slate-400 text-xs uppercase">{pt.members}</p>
                                <svg className="w-4 h-4 text-slate-400 group-hover:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                            <p className="text-xl font-semibold mt-1 group-hover:text-cyan-300 transition-colors">
                                {currentMembers} / {plan?.max_users === -1 ? '∞' : plan?.max_users || 1}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">{pt.manage_team} &rarr;</p>
                        </a>
                    ) : (
                        <div className="bg-white/10 rounded-lg p-4">
                            <p className="text-slate-400 text-xs uppercase">{pt.members}</p>
                            <p className="text-xl font-semibold mt-1">
                                {currentMembers} / {plan?.max_users === -1 ? '∞' : plan?.max_users || 1}
                            </p>
                        </div>
                    )}

                    {/* Projects - Link to projects */}
                    <a
                        href={`/${lang}/dashboard/projects`}
                        className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer group"
                    >
                        <div className="flex justify-between items-start">
                            <p className="text-slate-400 text-xs uppercase">{pt.projects}</p>
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </div>
                        <p className="text-xl font-semibold mt-1 group-hover:text-cyan-300 transition-colors">
                            {currentProjects} / {plan?.max_projects === -1 ? '∞' : plan?.max_projects || 5}
                        </p>
                    </a>

                    {/* Storage - Static for now */}
                    <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-slate-400 text-xs uppercase">{pt.storage}</p>
                        <p className="text-xl font-semibold mt-1">
                            0 / {formatStorage(plan?.max_storage_mb || 2048)}
                        </p>
                    </div>
                </div>

                {/* Features */}
                {plan?.features && (
                    <div className="mb-6">
                        <p className="text-slate-400 text-sm mb-2">{pt.features}:</p>
                        <div className="flex flex-wrap gap-2">
                            {(plan.features as string[]).map((feature, i) => (
                                <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                                    ✓ {feature}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <a
                        href={`/${lang}/dashboard/settings/billing`}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg text-center hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                    >
                        {pt.upgrade}
                    </a>
                </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    {t.profile?.title || 'Profile Information'}
                </h2>

                <ProfileForm
                    lang={lang}
                    dictionary={dictionary}
                    initialData={{
                        firstName: profile?.first_name || '',
                        lastName: profile?.last_name || '',
                        email: user.email || '',
                        phone: profile?.phone || '',
                        accountType: profile?.account_type || 'individual',
                        companyName: profile?.company_name || '',
                        ein: profile?.ein || '',
                        website: profile?.website || '',
                        logoUrl: profile?.logo_url || '',
                        addressStreet: profile?.address_street || '',
                        addressSuite: profile?.address_suite || '',
                        addressCity: profile?.address_city || '',
                        addressState: profile?.address_state || '',
                        addressZip: profile?.address_zip || '',
                        organizationTypes: profile?.organization_types || [],
                    }}
                />
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <NotificationSettings lang={lang} userId={user.id} initialPreferences={profile?.notification_preferences} />
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    {lang === 'pt' ? 'Segurança' : 'Security'}
                </h2>
                <div className="space-y-6">
                    <MFASettings lang={lang} />
                    <div className="border-t border-gray-100 pt-6">
                        <UpdatePasswordForm lang={lang} />
                    </div>
                </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    {lang === 'pt' ? 'Configurações Avançadas' : 'Advanced Settings'}
                </h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800">
                            {lang === 'pt' ? 'Cancelar ou Excluir' : 'Cancel or Delete'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {lang === 'pt'
                                ? 'Gerencie o cancelamento da sua assinatura ou a exclusão da conta.'
                                : 'Manage your subscription cancellation or account deletion.'}
                        </p>
                    </div>
                    <a
                        href={`/${lang}/dashboard/settings/delete-account`}
                        className="px-4 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {lang === 'pt' ? 'Gerenciar' : 'Manage'}
                    </a>
                </div>
            </div>
        </div>
    );
}
