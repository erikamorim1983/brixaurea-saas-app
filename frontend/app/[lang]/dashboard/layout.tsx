import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getDictionary } from '@/get-dictionary';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardHeader from './components/DashboardHeader';
import BrixAureAI from '@/components/BrixAureAI/BrixAureAI';

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const supabase = await createClient();
    const dictionary = await getDictionary(lang);

    // Double-check authentication on the server side
    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user;

    if (authError || !user) {
        console.error('Dashboard Auth Error:', authError?.message);
        redirect(`/${lang}/auth/login`);
    }

    // Get user profile data safely
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, company_name, logo_url, account_type')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.warn('Profile fetch warning (Dashboard):', profileError.message);
    }

    const userName = profile?.first_name
        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
        : user.email?.split('@')[0] || 'User';

    const displayCompanyName = profile?.account_type === 'organization' && profile?.company_name
        ? profile.company_name
        : undefined;

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <DashboardSidebar lang={lang} dictionary={dictionary} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col ml-64">
                {/* Top Header */}
                <DashboardHeader
                    lang={lang}
                    dictionary={dictionary}
                    userName={userName}
                    userEmail={user.email || ''}
                    companyName={displayCompanyName}
                    logoUrl={profile?.logo_url || undefined}
                />

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
                <BrixAureAI lang={lang} dict={dictionary.ai} />
            </div>
        </div>
    );
}
