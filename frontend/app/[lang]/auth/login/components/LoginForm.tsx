'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LoginFormProps {
    dictionary: {
        login: {
            title: string;
            subtitle: string;
            email: string;
            password: string;
            remember_me: string;
            forgot_password: string;
            submit: string;
            no_account: string;
            register: string;
            errors: {
                email_required: string;
                email_invalid: string;
                password_required: string;
                invalid_credentials: string;
            };
        };
    };
    lang: string;
}

export default function LoginForm({ dictionary, lang }: LoginFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });

    // Load saved email on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('remembered_email');
        if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
        }
    }, []);

    const t = dictionary.login;

    const updateFormData = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = t.errors.email_required;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t.errors.email_invalid;
        }

        if (!formData.password) {
            newErrors.password = t.errors.password_required;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    rememberMe: formData.rememberMe,
                }),
            });

            if (response.ok) {
                // Save or clear email for "Remember Me"
                if (formData.rememberMe) {
                    localStorage.setItem('remembered_email', formData.email);
                } else {
                    localStorage.removeItem('remembered_email');
                }
                window.location.href = `/${lang}/dashboard`;
            } else {
                const error = await response.json();
                setErrors({ submit: error.message || t.errors.invalid_credentials });
            }
        } catch {
            setErrors({ submit: 'An error occurred. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 ${errors.email ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'
                            }`}
                        placeholder="email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.password}</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => updateFormData('password', e.target.value)}
                            className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 ${errors.password ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={formData.rememberMe}
                            onChange={(e) => updateFormData('rememberMe', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[#00D9FF] focus:ring-[#00D9FF]"
                        />
                        <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                            {t.remember_me}
                        </label>
                    </div>
                    <Link
                        href={`/${lang}/auth/forgot-password`}
                        className="text-sm text-[#00D9FF] hover:underline font-medium"
                    >
                        {t.forgot_password}
                    </Link>
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

            {/* Register Link */}
            <p className="text-center mt-6 text-gray-600">
                {t.no_account}{' '}
                <Link href={`/${lang}/auth/register`} className="text-[#00D9FF] font-semibold hover:underline">
                    {t.register}
                </Link>
            </p>
        </div>
    );
}
