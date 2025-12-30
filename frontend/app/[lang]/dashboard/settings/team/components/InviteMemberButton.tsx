'use client';

import { useState } from 'react';

interface InviteMemberButtonProps {
    lang: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any;
}

export default function InviteMemberButton({ lang, dictionary }: InviteMemberButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const t = dictionary.settings?.team || {
        invite: 'Invite Member',
        invite_title: 'Invite a Team Member',
        invite_subtitle: 'Send an invitation to join your organization',
        email_label: 'Email Address',
        email_placeholder: 'colleague@company.com',
        role_label: 'Role',
        roles: {
            admin: 'Admin',
            member: 'Member',
            viewer: 'Viewer',
        },
        role_descriptions: {
            admin: 'Can manage team members and all projects',
            member: 'Can create and edit projects',
            viewer: 'Can only view projects and reports',
        },
        send_invite: 'Send Invitation',
        sending: 'Sending...',
        invite_sent: 'Invitation sent!',
        cancel: 'Cancel',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMessage('');

        try {
            const response = await fetch('/api/team/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role }),
            });

            if (response.ok) {
                setStatus('sent');
                setTimeout(() => {
                    setIsModalOpen(false);
                    setStatus('idle');
                    setEmail('');
                    setRole('member');
                }, 2000);
            } else {
                const data = await response.json();
                setErrorMessage(data.error || 'Failed to send invitation');
                setStatus('error');
            }
        } catch (error) {
            console.error('Invite error:', error);
            setErrorMessage('Failed to send invitation');
            setStatus('error');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {t.invite}
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">{t.invite_title}</h2>
                                    <p className="text-sm text-gray-500">{t.invite_subtitle}</p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t.email_label}
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t.email_placeholder}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                    required
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t.role_label}
                                </label>
                                <div className="space-y-2">
                                    {(['admin', 'member', 'viewer'] as const).map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={`w-full p-3 rounded-xl border-2 text-left transition-all ${role === r
                                                    ? 'border-cyan-500 bg-cyan-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className={`font-medium ${role === r ? 'text-cyan-700' : 'text-gray-700'}`}>
                                                        {t.roles?.[r] || r}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {t.role_descriptions?.[r]}
                                                    </p>
                                                </div>
                                                {role === r && (
                                                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {status === 'error' && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                                    {errorMessage}
                                </div>
                            )}

                            {/* Success */}
                            {status === 'sent' && (
                                <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {t.invite_sent}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={status === 'sending' || status === 'sent' || !email}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {status === 'sending' ? t.sending : t.send_invite}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
