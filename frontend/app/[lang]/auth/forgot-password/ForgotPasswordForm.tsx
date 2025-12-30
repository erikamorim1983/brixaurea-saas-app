'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ForgotPasswordFormProps {
    dictionary: {
        forgotPassword: {
            title: string;
            subtitle: string;
            email: string;
            submit: string;
            back_to_login: string;
            success_title: string;
            success_message: string;
            errors: {
                email_required: string;
                email_invalid: string;
                generic_error: string;
            };
        };
    };
    lang: string;
}

export default function ForgotPasswordForm({ dictionary, lang }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const t = dictionary.forgotPassword;

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError(t.errors.email_required);
            return;
        }

        if (!validateEmail(email)) {
            setError(t.errors.email_invalid);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setIsSuccess(true);
            } else {
                const data = await response.json();
                setError(data.message || t.errors.generic_error);
            }
        } catch {
            setError(t.errors.generic_error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success state
    if (isSuccess) {
        return (
            <div className="w-full text-center">
                {/* Email Icon */}
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#00D9FF] to-[#0EA5E9] rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-[#081F2E] mb-2">{t.success_title}</h2>
                <p className="text-gray-600 mb-6">{t.success_message}</p>
                <p className="text-[#00D9FF] font-semibold mb-8">{email}</p>

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
        );
    }

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#081F2E]">{t.title}</h2>
                <p className="text-gray-600 mt-2">{t.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                        }}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 ${error ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'
                            }`}
                        placeholder="email@example.com"
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? '...' : t.submit}
                </button>
            </form>

            {/* Back to login */}
            <div className="mt-6 text-center">
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
    );
}
