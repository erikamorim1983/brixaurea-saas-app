'use client';

import { useState } from 'react';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: string;
    onSuccess: () => void;
}

export default function InviteMemberModal({ isOpen, onClose, lang, onSuccess }: InviteMemberModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/organization/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(lang === 'pt' ? 'Convite enviado com sucesso!' : 'Invitation sent successfully!');
                setTimeout(() => {
                    onClose();
                    onSuccess();
                    setStatus('idle');
                    setEmail('');
                    setMessage('');
                }, 1500);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to invite user');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">
                        {lang === 'pt' ? 'Convidar Membro' : 'Invite Team Member'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleInvite} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#081F2E] focus:border-[#081F2E] outline-none transition-all"
                            placeholder="colleague@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {lang === 'pt' ? 'Função' : 'Role'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setRole('member')}
                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${role === 'member'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Member
                                <span className="block text-xs font-normal opacity-75 mt-1">Can edit projects</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('admin')}
                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${role === 'admin'
                                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Admin
                                <span className="block text-xs font-normal opacity-75 mt-1">Full access</span>
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${status === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {message}
                        </div>
                    )}

                    <div className="flex gap-3 mt-6 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                        >
                            {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="flex-1 px-4 py-2 bg-[#081F2E] text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {status === 'loading' && (
                                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                            )}
                            {lang === 'pt' ? 'Enviar Convite' : 'Send Invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
