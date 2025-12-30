import { getDictionary } from '@/get-dictionary';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ResendButton from './ResendButton';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    const titles = {
        en: 'Verify Your Email - BrixAurea',
        pt: 'Verifique seu Email - BrixAurea',
        es: 'Verifica tu Email - BrixAurea',
    };

    return {
        title: titles[lang as keyof typeof titles] || titles.en,
    };
}

export default async function VerifyEmailPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ email?: string }>;
}) {
    const { lang } = await params;
    const { email } = await searchParams;
    const dictionary = await getDictionary(lang);

    const t = dictionary.verifyEmail || {
        title: 'Check Your Email',
        subtitle: 'We sent a verification link to',
        instructions: 'Click the link in your email to verify your account. If you don\'t see it, check your spam folder.',
        resend: 'Resend verification email',
        resend_sending: 'Sending...',
        resend_success: 'Email sent!',
        resend_error: 'Error sending',
        back_to_login: 'Back to login',
        didnt_receive: 'Didn\'t receive the email?',
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header lang={lang} dictionary={dictionary} />

            {/* Main Content */}
            <main className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6 flex items-center justify-center">
                <div className="w-full max-w-md text-center">
                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-10">
                        {/* Email Icon */}
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#00D9FF] to-[#0EA5E9] rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-[#081F2E] mb-2">
                            {t.title}
                        </h1>

                        <p className="text-gray-600 mb-2">
                            {t.subtitle}
                        </p>

                        {email && (
                            <p className="text-[#00D9FF] font-semibold mb-6">
                                {email}
                            </p>
                        )}

                        <p className="text-gray-500 text-sm mb-8">
                            {t.instructions}
                        </p>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-6"></div>

                        {/* Resend section */}
                        <p className="text-gray-500 text-sm mb-4">
                            {t.didnt_receive}
                        </p>

                        <div className="mb-6">
                            <ResendButton
                                email={email}
                                resendText={t.resend}
                                sendingText={t.resend_sending}
                                successText={t.resend_success}
                                errorText={t.resend_error}
                            />
                        </div>

                        {/* Back to login */}
                        <div className="mt-4">
                            <Link
                                href={`/${lang}/auth/login`}
                                className="inline-flex items-center gap-2 text-gray-600 hover:text-[#00D9FF] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                {t.back_to_login}
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer lang={lang} dictionary={dictionary} />
        </div>
    );
}
