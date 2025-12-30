import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';
import Link from 'next/link';

export default async function CheckoutSuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: Locale }>;
    searchParams: Promise<{ session_id?: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const { session_id } = await searchParams;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Success Icon */}
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {dict.checkout?.success?.title || 'Subscription Successful!'}
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                    {dict.checkout?.success?.description ||
                        'Thank you for subscribing! Your account has been activated and you can now enjoy all the features of your plan.'}
                </p>

                {/* Trial Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                        {dict.checkout?.success?.trial ||
                            'Your trial period has started. You will not be charged until the trial ends.'}
                    </p>
                </div>

                {/* Session ID (for debugging) */}
                {session_id && (
                    <p className="text-xs text-gray-400 mb-6">
                        Session ID: {session_id}
                    </p>
                )}

                {/* CTA Button */}
                <Link
                    href={`/${lang}/dashboard`}
                    className="inline-block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                >
                    {dict.checkout?.success?.cta || 'Go to Dashboard'}
                </Link>

                {/* Additional Info */}
                <p className="mt-6 text-sm text-gray-500">
                    {dict.checkout?.success?.email ||
                        'A confirmation email has been sent to your inbox.'}
                </p>
            </div>
        </div>
    );
}
