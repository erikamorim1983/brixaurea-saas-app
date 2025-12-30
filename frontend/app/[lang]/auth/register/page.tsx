import { getDictionary } from '@/get-dictionary';
import RegistrationForm from './components/RegistrationForm';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    const titles = {
        en: 'Create Account - BrixAurea',
        pt: 'Criar Conta - BrixAurea',
        es: 'Crear Cuenta - BrixAurea',
    };

    return {
        title: titles[lang as keyof typeof titles] || titles.en,
    };
}

export default async function RegisterPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ plan?: string; billing?: string }>;
}) {
    const { lang } = await params;
    const { plan: preselectedPlan, billing: preselectedBilling } = await searchParams;
    const dictionary = await getDictionary(lang);

    return (
        <div className="flex flex-col min-h-screen">
            <Header lang={lang} dictionary={dictionary} showAuthButtons={false} />

            {/* Main Content */}
            <main className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Simple Card Container (no animated border) */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-12">
                        <RegistrationForm
                            dictionary={dictionary}
                            lang={lang}
                            preselectedPlan={preselectedPlan}
                            preselectedBilling={preselectedBilling as 'monthly' | 'yearly' | undefined}
                        />
                    </div>

                    {/* Already have account */}
                    <p className="text-center mt-6 text-gray-600">
                        {dictionary.register?.already_have_account || 'Already have an account?'}{' '}
                        <Link href={`/${lang}/auth/login`} className="text-[#00D9FF] font-semibold hover:underline">
                            {dictionary.nav?.login || 'Login'}
                        </Link>
                    </p>
                </div>
            </main>

            <Footer lang={lang} dictionary={dictionary} />
        </div>
    );
}
