import { getDictionary } from '@/get-dictionary';
import RegistrationForm from './components/RegistrationForm';
import Link from 'next/link';

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
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href={`/${lang}`} className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] flex items-center justify-center">
                            <span className="text-white font-bold text-xl">B</span>
                        </div>
                        <span className="text-xl font-bold text-[#081F2E]">BrixAurea</span>
                    </Link>
                    <Link
                        href={`/${lang}/login`}
                        className="text-sm font-medium text-gray-600 hover:text-[#00D9FF] transition-colors"
                    >
                        {dictionary.nav?.login || 'Login'}
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Card Container */}
                    <div className="animated-border-card">
                        <div className="animated-border-card-content bg-white">
                            <RegistrationForm dictionary={dictionary} lang={lang} />
                        </div>
                    </div>

                    {/* Already have account */}
                    <p className="text-center mt-6 text-gray-600">
                        {dictionary.register?.already_have_account || 'Already have an account?'}{' '}
                        <Link href={`/${lang}/login`} className="text-[#00D9FF] font-semibold hover:underline">
                            {dictionary.nav?.login || 'Login'}
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
