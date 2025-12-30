'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NotificationSettingsProps {
    lang: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialPreferences?: any;
    userId: string;
}

export default function NotificationSettings({ lang, initialPreferences, userId }: NotificationSettingsProps) {
    const [preferences, setPreferences] = useState(initialPreferences || {
        marketing: true,
        security: true,
        updates: true,
        billing: true
    });
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    const t = {
        pt: {
            title: 'Preferências de Email',
            desc: 'Escolha quais tipos de email você deseja receber.',
            marketing: 'Marketing e Ofertas',
            marketing_desc: 'Novidades sobre produtos e promoções especiais.',
            security: 'Alertas de Segurança',
            security_desc: 'Avisos importantes sobre sua conta e segurança.',
            updates: 'Atualizações do Produto',
            updates_desc: 'Novas funcionalidades e melhorias no sistema.',
            billing: 'Faturamento',
            billing_desc: 'Recibos, faturas e avisos de renovação.',
            save: 'Salvar Preferências',
            saved: 'Salvo!'
        },
        en: {
            title: 'Email Preferences',
            desc: 'Choose which types of emails you want to receive.',
            marketing: 'Marketing & Offers',
            marketing_desc: 'News about products and special promotions.',
            security: 'Security Alerts',
            security_desc: 'Important warnings about your account security.',
            updates: 'Product Updates',
            updates_desc: 'New features and system improvements.',
            billing: 'Billing',
            billing_desc: 'Receipts, invoices, and renewal notices.',
            save: 'Save Preferences',
            saved: 'Saved!'
        }
    };

    const text = lang === 'pt' ? t.pt : t.en;

    const toggle = (key: string) => {
        setPreferences({ ...preferences, [key]: !preferences[key] });
    };

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('user_profiles')
            .update({ notification_preferences: preferences })
            .eq('id', userId);

        if (!error) {
            setTimeout(() => setSaving(false), 1000);
        } else {
            setSaving(false);
            alert('Error saving preferences');
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium text-gray-900">{text.title}</h3>
                <p className="text-sm text-gray-500">{text.desc}</p>
            </div>

            <div className="space-y-4">
                {[
                    { key: 'marketing', label: text.marketing, desc: text.marketing_desc },
                    { key: 'updates', label: text.updates, desc: text.updates_desc },
                    { key: 'billing', label: text.billing, desc: text.billing_desc },
                    { key: 'security', label: text.security, desc: text.security_desc },
                ].map((item) => (
                    <div key={item.key} className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id={item.key}
                                name={item.key}
                                type="checkbox"
                                checked={preferences[item.key]}
                                onChange={() => toggle(item.key)}
                                className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor={item.key} className="font-medium text-gray-700 cursor-pointer">
                                {item.label}
                            </label>
                            <p className="text-gray-500">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-2">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#081F2E] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-cyan-500 disabled:opacity-50 transition-all"
                >
                    {saving ? text.saved : text.save}
                </button>
            </div>
        </div>
    );
}
