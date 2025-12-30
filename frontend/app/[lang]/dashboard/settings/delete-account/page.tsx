import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/get-dictionary';
import DeleteAccountForm from './components/DeleteAccountForm';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    const titles = {
        en: 'Delete Account - BrixAurea',
        pt: 'Excluir Conta - BrixAurea',
        es: 'Eliminar Cuenta - BrixAurea',
    };

    return {
        title: titles[lang as keyof typeof titles] || titles.en,
    };
}

export default async function DeleteAccountPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);
    const supabase = await createClient();

    // Get user data
    const { data: { user } } = await supabase.auth.getUser();

    const t = dictionary.deleteAccount || {
        title: 'Delete Account',
        subtitle: 'We\'re sorry to see you go',
        warning: 'This action cannot be undone. All your data will be permanently deleted.',
        survey_title: 'Before you go, please tell us why',
        survey_subtitle: 'Your feedback helps us improve BrixAurea',
        reasons: {
            not_useful: 'The platform is not useful for my needs',
            too_expensive: 'Too expensive',
            found_alternative: 'Found a better alternative',
            missing_features: 'Missing features I need',
            too_complicated: 'Too complicated to use',
            technical_issues: 'Technical issues or bugs',
            not_using: 'Not using it anymore',
            other: 'Other reason',
        },
        other_placeholder: 'Please tell us more...',
        confirm_delete: 'Delete My Account',
        cancel: 'Cancel',
        confirm_email: 'Type your email to confirm:',
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <a
                    href={`/${lang}/dashboard/settings`}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t.cancel || 'Back to Settings'}
                </a>
                <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
                <p className="text-gray-500 mt-1">{t.subtitle}</p>
            </div>

            {/* Cancel Subscription Option (Recommended) */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {lang === 'pt' ? 'Apenas Cancelar Assinatura?' : 'Just Cancel Subscription?'}
                        </h3>
                        <p className="text-gray-600 mt-1 mb-4">
                            {lang === 'pt'
                                ? 'Você pode parar as cobranças automáticas e manter seu acesso até o fim do período atual. Seus dados serão mantidos.'
                                : 'You can stop automatic billing and keep your access until the end of the current period. Your data will be kept safe.'}
                        </p>
                        <a
                            href={`/${lang}/dashboard/settings/billing`}
                            className="inline-flex items-center px-4 py-2 border border-blue-200 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            {lang === 'pt' ? 'Gerenciar Assinatura' : 'Manage Subscription'}
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* Warning Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                    <svg className="w-6 h-6 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-amber-700 text-sm">{t.warning}</p>
                </div>
            </div>

            {/* Survey Form */}
            <DeleteAccountForm
                lang={lang}
                dictionary={dictionary}
                userEmail={user?.email || ''}
            />
        </div>
    );
}
