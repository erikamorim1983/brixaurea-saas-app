import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';
import Link from 'next/link';

export default async function CheckoutCancelPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Cancel Icon */}
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                        className="w-8 h-8 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {dict.checkout?.cancel?.title || 'Checkout Cancelled'}
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                    {dict.checkout?.cancel?.description ||
                        'Your checkout was cancelled. No charges have been made to your account.'}
                </p>

                {/* CTA Buttons */}
                <div className="space-y-3">
                    <Link
                        href={`/${lang}/pricing`}
                        className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                    >
                        {dict.checkout?.cancel?.viewPlans || 'View Plans Again'}
                    </Link>

                    <Link
                        href={`/${lang}`}
                        className="block w-full bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
                        {dict.checkout?.cancel?.backHome || 'Back to Home'}
                    </Link>
                </div>

                {/* Support Link */}
                <p className="mt-6 text-sm text-gray-500">
                    {dict.checkout?.cancel?.support || 'Need help?'}{' '}
                    <Link
                        href={`/${lang}/support`}
                        className="text-blue-600 hover:text-blue-700 underline"
                    >
                        {dict.checkout?.cancel?.contactSupport || 'Contact Support'}
                    </Link>
                </p>
            </div>
        </div>
    );
}
