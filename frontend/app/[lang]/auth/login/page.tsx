import { getDictionary } from '@/get-dictionary';
import LoginForm from './components/LoginForm';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    const titles = {
        en: 'Login - BrixAurea',
        pt: 'Entrar - BrixAurea',
        es: 'Iniciar Sesión - BrixAurea',
    };

    return {
        title: titles[lang as keyof typeof titles] || titles.en,
    };
}

export default async function LoginPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ verified?: string; error?: string }>;
}) {
    const { lang } = await params;
    const { verified, error } = await searchParams;
    const dictionary = await getDictionary(lang);

    return (
        <div className="flex flex-col min-h-screen">
            <Header lang={lang} dictionary={dictionary} />

            {/* Main Content */}
            <main className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6 flex items-center justify-center">
                <div className="w-full max-w-md">
                    {/* Success Message */}
                    {verified === 'true' && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-center">
                            ✅ {dictionary.login?.email_verified || 'Email verified successfully! You can now login.'}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-center">
                            ⚠️ {decodeURIComponent(error)}
                        </div>
                    )}

                    {/* Card Container */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-10">
                        <LoginForm dictionary={dictionary} lang={lang} />
                    </div>
                </div>
            </main>

            <Footer lang={lang} dictionary={dictionary} />
        </div>
    );
}
