'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ShareProjectModalProps {
    project: any;
    isOpen: boolean;
    onClose: () => void;
    lang: string;
}

export default function ShareProjectModal({ project, isOpen, onClose, lang }: ShareProjectModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('viewer');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const supabase = createClient();

    if (!isOpen) return null;

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        // This endpoint will handle keying the user by email (if exists) or creating an invite
        const response = await fetch('/api/projects/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: project.id,
                email,
                role
            })
        });

        if (response.ok) {
            setStatus('success');
            setMessage(lang === 'pt' ? 'Convite enviado!' : 'Invitation sent!');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setEmail('');
                setMessage('');
            }, 2000);
        } else {
            const data = await response.json();
            setStatus('error');
            setMessage(data.error || 'Failed to share project');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold mb-4">
                    {lang === 'pt' ? `Compartilhar ${project.name}` : `Share ${project.name}`}
                </h3>

                <form onSubmit={handleShare} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                            placeholder="investor@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {lang === 'pt' ? 'Função' : 'Role'}
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                        >
                            <option value="viewer">{lang === 'pt' ? 'Visualizador (Apenas Leitura)' : 'Viewer (Read Only)'}</option>
                            <option value="editor">{lang === 'pt' ? 'Editor' : 'Editor'}</option>
                        </select>
                    </div>

                    {message && (
                        <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                            {message}
                        </p>
                    )}

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Sharing...' : (lang === 'pt' ? 'Compartilhar' : 'Share')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
