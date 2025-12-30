'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteAccountFormProps {
    lang: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any;
    userEmail: string;
}

const DELETION_REASONS = [
    { value: 'not_useful', icon: '😕' },
    { value: 'too_expensive', icon: '💰' },
    { value: 'found_alternative', icon: '🔄' },
    { value: 'missing_features', icon: '🧩' },
    { value: 'too_complicated', icon: '😵' },
    { value: 'technical_issues', icon: '🐛' },
    { value: 'not_using', icon: '💤' },
    { value: 'other', icon: '✏️' },
];

export default function DeleteAccountForm({ lang, dictionary, userEmail }: DeleteAccountFormProps) {
    const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
    const [otherReason, setOtherReason] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'deleting' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();

    const t = dictionary.deleteAccount || {
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
        confirm_email: 'Type your email to confirm:',
        confirm_delete: 'Delete My Account',
        cancel: 'Cancel',
        deleting: 'Deleting...',
    };

    const toggleReason = (reason: string) => {
        if (selectedReasons.includes(reason)) {
            setSelectedReasons(selectedReasons.filter(r => r !== reason));
        } else {
            setSelectedReasons([...selectedReasons, reason]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (confirmEmail !== userEmail) {
            setErrorMessage('Email does not match');
            return;
        }

        setStatus('deleting');
        setErrorMessage('');

        try {
            const response = await fetch('/api/user/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reasons: selectedReasons,
                    otherReason: selectedReasons.includes('other') ? otherReason : null,
                }),
            });

            if (response.ok) {
                // Redirect to goodbye page or home
                router.push(`/${lang}/auth/login?deleted=true`);
            } else {
                const data = await response.json();
                setErrorMessage(data.error || 'Failed to delete account');
                setStatus('error');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            setErrorMessage('An error occurred');
            setStatus('error');
        }
    };

    const canSubmit = selectedReasons.length > 0 && confirmEmail === userEmail;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Survey Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    {t.survey_title}
                </h2>
                <p className="text-gray-500 text-sm mb-4">{t.survey_subtitle}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {DELETION_REASONS.map((reason) => (
                        <button
                            key={reason.value}
                            type="button"
                            onClick={() => toggleReason(reason.value)}
                            className={`p-4 rounded-xl text-left transition-all border-2 ${selectedReasons.includes(reason.value)
                                    ? 'border-red-400 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{reason.icon}</span>
                                <span className={`text-sm font-medium ${selectedReasons.includes(reason.value) ? 'text-red-700' : 'text-gray-700'
                                    }`}>
                                    {t.reasons?.[reason.value as keyof typeof t.reasons] || reason.value}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Other reason text input */}
                {selectedReasons.includes('other') && (
                    <div className="mt-4">
                        <textarea
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            placeholder={t.other_placeholder}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all resize-none"
                            rows={3}
                        />
                    </div>
                )}
            </div>

            {/* Confirm Email Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.confirm_email}
                </label>
                <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder={userEmail}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 transition-all"
                />
                {confirmEmail && confirmEmail !== userEmail && (
                    <p className="text-red-500 text-sm mt-2">Email does not match</p>
                )}
                {confirmEmail === userEmail && confirmEmail !== '' && (
                    <p className="text-green-500 text-sm mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Email confirmed
                    </p>
                )}
            </div>

            {/* Error Message */}
            {status === 'error' && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {errorMessage}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
                <a
                    href={`/${lang}/dashboard/settings`}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-center"
                >
                    {t.cancel}
                </a>
                <button
                    type="submit"
                    disabled={!canSubmit || status === 'deleting'}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {status === 'deleting' ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            {t.deleting}
                        </span>
                    ) : t.confirm_delete}
                </button>
            </div>
        </form>
    );
}
