'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ResetPasswordFormProps {
    dictionary: {
        resetPassword: {
            title: string;
            subtitle: string;
            new_password: string;
            confirm_password: string;
            password_requirements: string;
            submit: string;
            success_title: string;
            success_message: string;
            go_to_login: string;
            errors: {
                password_required: string;
                password_weak: string;
                passwords_mismatch: string;
                generic_error: string;
                invalid_token: string;
            };
        };
    };
    lang: string;
}

export default function ResetPasswordForm({ dictionary, lang }: ResetPasswordFormProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSuccess, setIsSuccess] = useState(false);

    const t = dictionary.resetPassword;

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!password) {
            newErrors.password = t.errors.password_required;
        } else if (password.length < 8) {
            newErrors.password = t.errors.password_weak;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = t.errors.passwords_mismatch;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (response.ok) {
                setIsSuccess(true);
            } else {
                const data = await response.json();
                setErrors({ submit: data.message || t.errors.generic_error });
            }
        } catch {
            setErrors({ submit: t.errors.generic_error });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success state
    if (isSuccess) {
        return (
            <div className="w-full text-center">
                {/* Success Icon */}
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-[#081F2E] mb-2">{t.success_title}</h2>
                <p className="text-gray-600 mb-8">{t.success_message}</p>

                <Link
                    href={`/${lang}/auth/login`}
                    className="btn-primary px-8 py-3 rounded-xl font-semibold inline-block"
                >
                    {t.go_to_login}
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
                {/* New Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.new_password}</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) {
                                setErrors(prev => { delete prev.password; return { ...prev }; });
                            }
                        }}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 ${errors.password ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'
                            }`}
                    />
                    <p className="text-gray-500 text-xs mt-1">{t.password_requirements}</p>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.confirm_password}</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) {
                                setErrors(prev => { delete prev.confirmPassword; return { ...prev }; });
                            }
                        }}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'
                            }`}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                {/* Error Message */}
                {errors.submit && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                        {errors.submit}
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
        </div>
    );
}
