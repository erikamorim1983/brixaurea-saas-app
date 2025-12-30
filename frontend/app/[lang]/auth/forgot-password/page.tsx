import { getDictionary } from '@/get-dictionary';
import ForgotPasswordForm from './ForgotPasswordForm';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    const titles = {
        en: 'Forgot Password - BrixAurea',
        pt: 'Esqueci a Senha - BrixAurea',
        es: 'Olvidé mi Contraseña - BrixAurea',
    };

    return {
        title: titles[lang as keyof typeof titles] || titles.en,
    };
}

export default async function ForgotPasswordPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);

    return (
        <div className="flex flex-col min-h-screen">
            <Header lang={lang} dictionary={dictionary} />

            {/* Main Content */}
            <main className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-10">
                        <ForgotPasswordForm dictionary={dictionary} lang={lang} />
                    </div>
                </div>
            </main>

            <Footer lang={lang} dictionary={dictionary} />
        </div>
    );
}
