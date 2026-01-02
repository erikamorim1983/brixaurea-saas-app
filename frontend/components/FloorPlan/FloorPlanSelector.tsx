'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import FloorPlanForm from './FloorPlanForm';
import { usePropertyTypes } from '@/hooks/usePropertyTypes';

export interface FloorPlan {
    id: string;
    plan_name: string;
    plan_code?: string;
    bedrooms?: number;
    bathrooms?: number;
    half_baths?: number;
    suites?: number;
    garages?: number;
    area_sqft?: number;
    area_outdoor?: number;
    area_total?: number;
    living_area_sqft?: number;
    entry_area_sqft?: number;
    lanai_area_sqft?: number;
    total_const_area_sqft?: number;
    standard_cost_sqft?: number;
    standard_price_sqft?: number;
    subtype_id?: string;
    file_url?: string;
}

export interface FloorPlanSelectorProps {
    onSelect: (plan: FloorPlan) => void;
    lang: string;
    userId: string;
}

export default function FloorPlanSelector({ onSelect, lang, userId }: FloorPlanSelectorProps) {
    const supabase = createClient();
    const { subtypes, getLocalizedName } = usePropertyTypes(lang);
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [plans, setPlans] = useState<FloorPlan[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showNewForm, setShowNewForm] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const t = {
        pt: {
            button: 'Usar Biblioteca',
            title: 'Selecionar da Biblioteca',
            search: 'Buscar planta...',
            no_plans: 'Nenhuma planta encontrada.',
            select: 'Selecionar',
            new_plan: '+ Nova Planta'
        },
        en: {
            button: 'Use Library',
            title: 'Select from Library',
            search: 'Search floor plan...',
            no_plans: 'No floor plans found.',
            select: 'Select',
            new_plan: '+ New Plan'
        },
        es: {
            button: 'Usar Biblioteca',
            title: 'Seleccionar de Biblioteca',
            search: 'Buscar planta...',
            no_plans: 'No se encontraron plantas.',
            select: 'Seleccionar',
            new_plan: '+ Nueva Planta'
        }
    }[lang as 'pt' | 'en' | 'es'] || {
        button: 'Use Library',
        title: 'Select from Library',
        search: 'Search floor plan...',
        no_plans: 'No floor plans found.',
        select: 'Select',
        new_plan: '+ New Plan'
    };

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('floor_plan_library')
                .select('*')
                .ilike('plan_name', `%${search}%`)
                .order('plan_name');

            if (error) throw error;
            setPlans(data || []);
        } catch (err) {
            console.error('Error fetching plans:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchPlans();
    }, [isOpen, search]);

    const handleSaveNewPlan = async (planData: Partial<FloorPlan>) => {
        try {
            const { data, error } = await supabase
                .from('floor_plan_library')
                .insert({ ...planData, user_id: userId })
                .select()
                .single();
            if (error) throw error;

            onSelect(data);
            setShowNewForm(false);
            setIsOpen(false);
        } catch (err) {
            console.error('Error saving plan:', err);
            alert('Erro ao salvar nova planta.');
        }
    };

    const selectorModal = (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowNewForm(true)}
                            className="px-4 py-1.5 bg-cyan-600 text-white text-xs font-bold rounded-lg hover:bg-cyan-700 transition-all"
                        >
                            {t.new_plan}
                        </button>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t.search}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
                        </div>
                    ) : plans.length === 0 ? (
                        <p className="text-center py-8 text-gray-500 italic">{t.no_plans}</p>
                    ) : (
                        plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-cyan-200 hover:bg-cyan-50 transition-all group"
                            >
                                <div>
                                    <h3 className="font-bold text-gray-900">{plan.plan_name}</h3>
                                    <p className="text-xs text-gray-500">
                                        {plan.bedrooms}bds | {plan.bathrooms}ba | {plan.area_total?.toLocaleString()} sqft
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        onSelect(plan);
                                        setIsOpen(false);
                                    }}
                                    className="px-4 py-1.5 bg-white border border-cyan-600 text-cyan-600 text-sm font-bold rounded-lg group-hover:bg-cyan-600 group-hover:text-white transition-all"
                                >
                                    {t.select}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-600 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {t.button}
            </button>

            {mounted && isOpen && createPortal(selectorModal, document.body)}

            {showNewForm && (
                <FloorPlanForm
                    plan={null}
                    subtypes={subtypes}
                    getLocalizedName={getLocalizedName}
                    onSave={handleSaveNewPlan}
                    onCancel={() => setShowNewForm(false)}
                    dict={{}}
                    userId={userId}
                />
            )}
        </>
    );
}
