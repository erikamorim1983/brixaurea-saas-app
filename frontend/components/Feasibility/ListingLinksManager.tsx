'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ListingLink {
    id: string;
    url: string;
    created_at: string;
}

interface ListingLinksManagerProps {
    projectId: string;
    initialLinks?: ListingLink[];
    lang: string;
}

export default function ListingLinksManager({ projectId, initialLinks = [], lang }: ListingLinksManagerProps) {
    const supabase = createClient();
    const [links, setLinks] = useState<ListingLink[]>(initialLinks);
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [saving, setSaving] = useState(false);

    const texts = {
        pt: {
            title: 'Links de Anúncio',
            placeholder: 'Cole o link do anúncio (Zillow, Redfin, etc.)',
            addButton: 'Adicionar Link',
            delete: 'Excluir',
            openLink: 'Abrir',
            noLinks: 'Nenhum link cadastrado ainda.',
            adding: 'Adicionando...'
        },
        en: {
            title: 'Listing Links',
            placeholder: 'Paste listing link (Zillow, Redfin, etc.)',
            addButton: 'Add Link',
            delete: 'Delete',
            openLink: 'Open',
            noLinks: 'No links added yet.',
            adding: 'Adding...'
        },
        es: {
            title: 'Enlaces de Anuncios',
            placeholder: 'Pegar enlace del anuncio (Zillow, Redfin, etc.)',
            addButton: 'Agregar Enlace',
            delete: 'Eliminar',
            openLink: 'Abrir',
            noLinks: 'Aún no se han agregado enlaces.',
            adding: 'Agregando...'
        }
    };

    const t = texts[lang as keyof typeof texts] || texts.en;

    const handleAddLink = async () => {
        if (!newLinkUrl.trim()) return;

        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('listing_links')
                .insert({
                    project_id: projectId,
                    url: newLinkUrl.trim()
                })
                .select()
                .single();

            if (error) throw error;

            setLinks([...links, data]);
            setNewLinkUrl('');
        } catch (err) {
            console.error('Error adding link:', err);
            alert('Error adding link');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLink = async (linkId: string) => {
        try {
            const { error } = await supabase
                .from('listing_links')
                .delete()
                .eq('id', linkId);

            if (error) throw error;

            setLinks(links.filter(l => l.id !== linkId));
        } catch (err) {
            console.error('Error deleting link:', err);
            alert('Error deleting link');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddLink();
        }
    };

    return (
        <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">{t.title}</label>

            {/* Input para novo link */}
            <div className="flex gap-2">
                <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none placeholder:text-gray-300"
                    placeholder={t.placeholder}
                />
                <button
                    type="button"
                    onClick={handleAddLink}
                    disabled={saving || !newLinkUrl.trim()}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {saving ? t.adding : t.addButton}
                </button>
            </div>

            {/* Lista de links */}
            {links.length > 0 ? (
                <div className="space-y-2">
                    {links.map((link) => (
                        <div
                            key={link.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 group hover:border-cyan-200 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-sm text-cyan-600 hover:text-cyan-700 hover:underline truncate"
                            >
                                {link.url}
                            </a>
                            <button
                                type="button"
                                onClick={() => window.open(link.url, '_blank')}
                                className="px-3 py-1 text-xs text-cyan-600 hover:bg-cyan-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                            >
                                {t.openLink}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteLink(link.id)}
                                className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                                {t.delete}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-400 italic">{t.noLinks}</p>
            )}
        </div>
    );
}
