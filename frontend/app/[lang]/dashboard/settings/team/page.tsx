import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/get-dictionary';
import { redirect } from 'next/navigation';
import TeamMembersList from './components/TeamMembersList';

export default async function TeamSettingsPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${lang}/auth/login`);
    }

    // Verify Organization Access & Limits
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('account_type')
        .eq('id', user.id)
        .single();

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('subscription_plans(max_users)')
        .eq('user_id', user.id)
        .single();

    // Safely access max_users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maxUsers = (subscription?.subscription_plans as any)?.max_users ?? 1;

    if (profile?.account_type !== 'organization') {
        return (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-xl font-bold text-gray-800 mb-4">Acesso Restrito</h1>
                <p className="text-gray-600">
                    O gerenciamento de equipe está disponível apenas para contas empresariais (Organization).
                    Atualize seu plano nas configurações.
                </p>
                <div className="mt-6">
                    <a href={`/${lang}/dashboard/settings`} className="text-cyan-600 hover:underline">
                        &larr; Voltar para Configurações
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {lang === 'pt' ? 'Gerenciar Equipe' : 'Team Management'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {lang === 'pt' ? 'Convide membros e gerencie permissões' : 'Invite members and manage permissions'}
                    </p>
                </div>
                {/* Back Link */}
                <a href={`/${lang}/dashboard/settings`} className="text-sm text-gray-500 hover:text-gray-700">
                    &larr; {lang === 'pt' ? 'Voltar' : 'Back'}
                </a>
            </div>

            {/* Members List Component */}
            <TeamMembersList lang={lang} user={user} maxUsers={maxUsers} />
        </div>
    );
}
