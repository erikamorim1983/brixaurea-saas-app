'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordForm({ lang }: { lang: string }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const supabase = createClient();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage(lang === 'pt' ? 'Senhas não conferem' : 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage(lang === 'pt' ? 'A senha deve ter no mínimo 6 caracteres' : 'Password must be at least 6 characters');
            return;
        }

        setStatus('loading');
        setMessage('');

        const { error } = await supabase.auth.updateUser({ password: password });

        if (error) {
            setStatus('error');
            setMessage(error.message);
        } else {
            setStatus('success');
            setMessage(lang === 'pt' ? 'Senha atualizada com sucesso!' : 'Password updated successfully!');
            setPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'pt' ? 'Nova Senha' : 'New Password'}
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D9FF] outline-none transition-all"
                    placeholder="••••••••"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'pt' ? 'Confirmar Nova Senha' : 'Confirm New Password'}
                </label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00D9FF] outline-none transition-all"
                    placeholder="••••••••"
                />
            </div>

            {status === 'error' && <p className="text-red-500 text-sm">{message}</p>}
            {status === 'success' && <p className="text-green-500 text-sm">{message}</p>}

            <button
                type="submit"
                disabled={status === 'loading'}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium"
            >
                {status === 'loading' ? 'Updating...' : (lang === 'pt' ? 'Atualizar Senha' : 'Update Password')}
            </button>
        </form>
    );
}
