'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { FloorPlan } from './FloorPlanLibraryTab';

interface FloorPlanFormProps {
    plan?: FloorPlan | null;
    subtypes: any[];
    getLocalizedName: (subtype: any) => string;
    onSave: (plan: Partial<FloorPlan>) => Promise<void>;
    onCancel: () => void;
    dict: any;
}

export default function FloorPlanForm({ plan, subtypes, getLocalizedName, onSave, onCancel, dict }: FloorPlanFormProps) {
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState<Partial<FloorPlan>>({
        plan_name: plan?.plan_name || '',
        plan_code: plan?.plan_code || '',
        subtype_id: plan?.subtype_id || '',
        bedrooms: plan?.bedrooms || 0,
        bathrooms: plan?.bathrooms || 0,
        half_baths: plan?.half_baths || 0,
        suites: plan?.suites || 0,
        garages: plan?.garages || 0,
        stories: plan?.stories || 1,
        plan_width_lf: plan?.plan_width_lf || 0,
        plan_depth_lf: plan?.plan_depth_lf || 0,
        has_pool: plan?.has_pool || false,
        living_area_sqft: plan?.living_area_sqft || 0,
        entry_area_sqft: plan?.entry_area_sqft || 0,
        lanai_area_sqft: plan?.lanai_area_sqft || 0,
        garage_area_sqft: plan?.garage_area_sqft || 0,
        total_const_area_sqft: plan?.total_const_area_sqft || 0,
        area_sqft: plan?.area_sqft || 0,
        area_outdoor: plan?.area_outdoor || 0,
        area_total: plan?.area_total || 0,
        standard_cost_sqft: plan?.standard_cost_sqft || 0,
        standard_price_sqft: plan?.standard_price_sqft || 0,
        notes: plan?.notes || '',
        is_template: plan?.is_template || false,
        file_url: plan?.file_url || '',
        architect_firm: plan?.architect_firm || '',
        construction_duration_months: plan?.construction_duration_months || 10,
        construction_curve: plan?.construction_curve || { type: 'linear', percentages: [] },
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        const total = (Number(formData.living_area_sqft) || 0) +
            (Number(formData.entry_area_sqft) || 0) +
            (Number(formData.lanai_area_sqft) || 0) +
            (Number(formData.garage_area_sqft) || 0);

        setFormData(prev => ({
            ...prev,
            total_const_area_sqft: total,
            area_sqft: formData.living_area_sqft,
            area_outdoor: (Number(formData.entry_area_sqft) || 0) + (Number(formData.lanai_area_sqft) || 0),
            area_total: total
        }));
    }, [formData.living_area_sqft, formData.entry_area_sqft, formData.lanai_area_sqft, formData.garage_area_sqft]);

    const handleDurationChange = (months: number) => {
        let newCurve = { ...formData.construction_curve };
        if (newCurve.type === 'linear' || !newCurve.percentages?.length) {
            newCurve.percentages = Array(months).fill(Math.round(100 / months * 10) / 10);
            const sum = newCurve.percentages.reduce((a, b) => a + b, 0);
            if (sum !== 100 && newCurve.percentages.length > 0) {
                newCurve.percentages[newCurve.percentages.length - 1] = Math.max(0, newCurve.percentages[newCurve.percentages.length - 1] + (100 - sum));
            }
        } else {
            const current = [...(newCurve.percentages || [])];
            if (current.length < months) {
                newCurve.percentages = [...current, ...Array(months - current.length).fill(0)];
            } else {
                newCurve.percentages = current.slice(0, months);
            }
        }
        setFormData(prev => ({ ...prev, construction_duration_months: months, construction_curve: newCurve as any }));
    };

    const handleCurvePercentageChange = (index: number, val: number) => {
        const newPercentages = [...(formData.construction_curve?.percentages || [])];
        newPercentages[index] = val;
        setFormData(prev => ({
            ...prev,
            construction_curve: {
                ...(prev.construction_curve as any),
                type: 'custom',
                percentages: newPercentages
            }
        }));
    };

    const distributeRemaining = () => {
        const currentTotal = (formData.construction_curve?.percentages || []).reduce((a, b) => a + Number(b), 0);
        const remaining = Math.max(0, 100 - currentTotal);
        if (remaining <= 0) return;

        const newPercentages = [...(formData.construction_curve?.percentages || [])];
        const emptyIndices = newPercentages.map((p, i) => p === 0 ? i : -1).filter(i => i !== -1);

        if (emptyIndices.length > 0) {
            const perMonth = Math.round((remaining / emptyIndices.length) * 10) / 10;
            emptyIndices.forEach(idx => {
                newPercentages[idx] = perMonth;
            });
        } else {
            // Add to last month
            newPercentages[newPercentages.length - 1] = Math.round((newPercentages[newPercentages.length - 1] + remaining) * 10) / 10;
        }

        // Final nudge for float precision
        const finalSum = newPercentages.reduce((a, b) => a + b, 0);
        if (finalSum !== 100) {
            newPercentages[newPercentages.length - 1] = Math.round((newPercentages[newPercentages.length - 1] + (100 - finalSum)) * 10) / 10;
        }

        setFormData(prev => ({
            ...prev,
            construction_curve: { ...(prev.construction_curve as any), type: 'custom', percentages: newPercentages }
        }));
    };

    const resetToLinear = () => {
        const months = formData.construction_duration_months || 10;
        const perMonth = Math.round((100 / months) * 10) / 10;
        const newPercentages = Array(months).fill(perMonth);
        const sum = newPercentages.reduce((a, b) => a + b, 0);
        if (sum !== 100) newPercentages[newPercentages.length - 1] = Math.round((newPercentages[newPercentages.length - 1] + (100 - sum)) * 10) / 10;

        setFormData(prev => ({
            ...prev,
            construction_curve: { type: 'linear', percentages: newPercentages }
        }));
    };

    const curveTotal = (formData.construction_curve?.percentages || []).reduce((a, b) => a + Number(b), 0);
    const isValidCurve = formData.construction_curve?.type === 'linear' || Math.abs(curveTotal - 100) < 0.1;

    // Initialization fix: ensure percentages array exists on mount if missing
    useEffect(() => {
        if (formData.construction_curve?.percentages?.length === 0) {
            resetToLinear();
        }
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
        } finally {
            setSaving(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in duration-200">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                {plan ? (dict.edit_plan || 'Editar Planta') : (dict.new_plan || 'Nova Planta')}
                            </h2>
                            <p className="text-gray-500 mt-1">Configure os detalhes técnicos da planta.</p>
                        </div>
                        <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* LEFT COLUMN: THE PHYSICAL ASSET (O QUE É?) */}
                        <div className="space-y-6">
                            {/* 1. Identity & Architecture */}
                            <div className="bg-gray-50 p-6 rounded-3xl space-y-6 border border-gray-100 shadow-sm">
                                <h3 className="font-black text-xs text-cyan-800 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-cyan-600 rounded-full"></div>
                                    Identidade e Arquitetura
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nome da Planta</label>
                                        <input type="text" required value={formData.plan_name} onChange={e => setFormData({ ...formData, plan_name: e.target.value })} className="w-full px-4 py-2.5 border-2 border-transparent bg-white rounded-xl focus:border-cyan-500 outline-none font-bold text-gray-900 shadow-sm" placeholder="Ex: Victoria Model" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Escritório de Arquitetura</label>
                                        <input type="text" value={formData.architect_firm} onChange={e => setFormData({ ...formData, architect_firm: e.target.value })} className="w-full px-4 py-2.5 border-2 border-transparent bg-white rounded-xl focus:border-cyan-500 outline-none font-bold text-gray-900 shadow-sm" placeholder="Ex: Brix Prime Architects" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Código</label>
                                        <input type="text" value={formData.plan_code} onChange={e => setFormData({ ...formData, plan_code: e.target.value })} className="w-full px-4 py-2 border-b-2 border-gray-200 bg-transparent outline-none focus:border-cyan-600 font-bold" placeholder="FA-01" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Tipo de Produto</label>
                                        <select value={formData.subtype_id} onChange={e => setFormData({ ...formData, subtype_id: e.target.value })} className="w-full px-4 py-2 bg-transparent border-b-2 border-gray-200 outline-none focus:border-cyan-600 font-bold cursor-pointer">
                                            <option value="">Selecione...</option>
                                            {[
                                                'single_family_generic',
                                                'townhomes',
                                                'fourplex',
                                                'villas_patio_homes',
                                                'garden_style_apartments',
                                                'condos_low_rise'
                                            ].map(key => {
                                                const s = subtypes.find(st => st.key === key);
                                                if (!s) return null;
                                                return <option key={s.id} value={s.id}>{getLocalizedName(s)}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-3 pt-2">
                                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                        <label className="block text-[8px] font-black text-gray-400 uppercase mb-1 text-center">Dorms</label>
                                        <input type="number" min="0" value={formData.bedrooms} onChange={e => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })} className="w-full text-center font-black text-lg outline-none bg-transparent" />
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                        <label className="block text-[8px] font-black text-gray-400 uppercase mb-1 text-center">Banhos</label>
                                        <input type="number" min="0" value={formData.bathrooms} onChange={e => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })} className="w-full text-center font-black text-lg outline-none bg-transparent" />
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                        <label className="block text-[8px] font-black text-gray-400 uppercase mb-1 text-center">Suítes</label>
                                        <input type="number" min="0" value={formData.suites} onChange={e => setFormData({ ...formData, suites: parseInt(e.target.value) || 0 })} className="w-full text-center font-black text-lg outline-none bg-transparent text-cyan-600" />
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                        <label className="block text-[8px] font-black text-gray-400 uppercase mb-1 text-center">Vagas</label>
                                        <input type="number" min="0" value={formData.garages} onChange={e => setFormData({ ...formData, garages: parseInt(e.target.value) || 0 })} className="w-full text-center font-black text-lg outline-none bg-transparent" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" id="has_pool" checked={formData.has_pool} onChange={e => setFormData({ ...formData, has_pool: e.target.checked })} className="w-5 h-5 accent-cyan-600 rounded-md cursor-pointer" />
                                        <label htmlFor="has_pool" className="text-xs font-bold text-gray-600 uppercase cursor-pointer">Piscina Privativa</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase">Pavimentos:</label>
                                        <input type="number" min="1" value={formData.stories} onChange={e => setFormData({ ...formData, stories: parseInt(e.target.value) || 1 })} className="w-12 border-b border-gray-300 font-black text-sm text-center outline-none focus:border-cyan-600" />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Areas & Measurements */}
                            <div className="bg-cyan-50/50 p-6 rounded-3xl border border-cyan-100 space-y-6">
                                <h3 className="font-black text-xs text-cyan-900 uppercase tracking-widest flex justify-between items-center">
                                    <span>Levantamento de Áreas (SF)</span>
                                    <span className="bg-white/60 px-2 py-0.5 rounded text-[8px] font-black text-cyan-600 shadow-sm">AUTO-CALC</span>
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-2xl border border-cyan-100 shadow-sm">
                                        <label className="block text-[9px] font-black text-cyan-700 uppercase mb-1">Living (Climatizada)</label>
                                        <input type="number" min="0" value={formData.living_area_sqft} onChange={e => setFormData({ ...formData, living_area_sqft: parseFloat(e.target.value) || 0 })} className="w-full text-right font-black text-lg outline-none" />
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl border border-cyan-100 shadow-sm">
                                        <label className="block text-[9px] font-black text-cyan-700 uppercase mb-1">Garagem</label>
                                        <input type="number" min="0" value={formData.garage_area_sqft} onChange={e => setFormData({ ...formData, garage_area_sqft: parseFloat(e.target.value) || 0 })} className="w-full text-right font-black text-lg outline-none" />
                                    </div>
                                    <div className="bg-white/30 p-3 rounded-2xl border border-cyan-100/50">
                                        <label className="block text-[9px] font-black text-cyan-700 uppercase mb-1">Entry / Porch</label>
                                        <input type="number" min="0" value={formData.entry_area_sqft} onChange={e => setFormData({ ...formData, entry_area_sqft: parseFloat(e.target.value) || 0 })} className="w-full text-right font-bold text-sm outline-none bg-transparent" />
                                    </div>
                                    <div className="bg-white/30 p-3 rounded-2xl border border-cyan-100/50">
                                        <label className="block text-[9px] font-black text-cyan-700 uppercase mb-1">Lanai / Terraço</label>
                                        <input type="number" min="0" value={formData.lanai_area_sqft} onChange={e => setFormData({ ...formData, lanai_area_sqft: parseFloat(e.target.value) || 0 })} className="w-full text-right font-bold text-sm outline-none bg-transparent" />
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border-2 border-cyan-200 flex justify-between items-center shadow-lg">
                                    <div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter block">ÁREA TOTAL CONSTRUÍDA</span>
                                        <span className="text-2xl font-black text-gray-900">{formData.total_const_area_sqft?.toLocaleString()} <span className="text-sm text-cyan-600 font-black">SF</span></span>
                                    </div>
                                    <div className="flex gap-4 border-l border-cyan-100 pl-6 h-10 items-center">
                                        <div className="text-center">
                                            <span className="text-[8px] font-black text-gray-400 uppercase block leading-none">WIDTH</span>
                                            <input type="number" step="0.1" value={formData.plan_width_lf || ''} onChange={e => setFormData({ ...formData, plan_width_lf: parseFloat(e.target.value) || 0 })} className="w-12 font-black text-xs text-center outline-none bg-transparent border-b border-gray-200" placeholder="0'" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[8px] font-black text-gray-400 uppercase block leading-none">DEPTH</span>
                                            <input type="number" step="0.1" value={formData.plan_depth_lf || ''} onChange={e => setFormData({ ...formData, plan_depth_lf: parseFloat(e.target.value) || 0 })} className="w-12 font-black text-xs text-center outline-none bg-transparent border-b border-gray-200" placeholder="0'" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: PLANNING & PERFORMANCE (COMO EXECUTAR?) */}
                        <div className="space-y-6">
                            {/* 3. Benchmarks & Financials */}
                            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                                <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                                    Benchmarks Financeiros
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Custo de Const. $/SF</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                            <input type="number" step="0.01" value={formData.standard_cost_sqft} onChange={e => setFormData({ ...formData, standard_cost_sqft: parseFloat(e.target.value) || 0 })} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl font-black text-lg outline-none focus:ring-2 focus:ring-cyan-500/10" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Preço de Venda $/SF</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600 font-bold">$</span>
                                            <input type="number" step="0.01" value={formData.standard_price_sqft} onChange={e => setFormData({ ...formData, standard_price_sqft: parseFloat(e.target.value) || 0 })} className="w-full pl-10 pr-4 py-3 bg-cyan-50 rounded-2xl font-black text-lg text-cyan-700 outline-none focus:ring-2 focus:ring-cyan-500/10" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Timeline & Curve (O GRANDE BLOCO) */}
                            <div className="bg-[#081F2E] p-1 rounded-[2.5rem] shadow-2xl">
                                <div className="bg-white m-1 p-6 rounded-[2rem] space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-4 bg-cyan-600 rounded-full"></div>
                                            Cronograma de Execução
                                        </h3>
                                        <div className="flex bg-gray-100 p-1 rounded-xl">
                                            <button type="button" onClick={resetToLinear} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${formData.construction_curve?.type === 'linear' ? 'bg-white text-cyan-600 shadow-sm' : 'text-gray-400'}`}>Linear</button>
                                            <button type="button" onClick={() => {
                                                if (!formData.construction_curve?.percentages?.length) resetToLinear();
                                                setFormData(prev => ({ ...prev, construction_curve: { ...prev.construction_curve, type: 'custom' } as any }));
                                            }} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${formData.construction_curve?.type === 'custom' ? 'bg-[#081F2E] text-white shadow-lg' : 'text-gray-400'}`}>Custom</button>
                                        </div>
                                    </div>

                                    <div className="bg-cyan-50 p-5 rounded-3xl border border-cyan-100 space-y-6 shadow-inner">
                                        <div className="flex items-center gap-6">
                                            <input type="range" min="1" max="30" value={formData.construction_duration_months} onChange={e => handleDurationChange(parseInt(e.target.value))} className="flex-1 h-1.5 bg-cyan-200 rounded-full appearance-none cursor-pointer accent-cyan-600" />
                                            <div className="bg-white px-4 py-2 rounded-2xl border border-cyan-200 shadow-sm">
                                                <span className="text-2xl font-black text-cyan-600 leading-none">{formData.construction_duration_months}</span>
                                                <span className="text-[10px] font-black text-cyan-300 uppercase ml-1">MESES</span>
                                            </div>
                                        </div>

                                        {/* Chart Integrated */}
                                        <div className="h-24 flex items-end gap-1 px-1 bg-white/40 rounded-2xl border border-white/50">
                                            {(formData.construction_curve?.percentages || []).map((p, i) => {
                                                const maxVal = Math.max(...(formData.construction_curve?.percentages || []), 1);
                                                const height = (p / maxVal) * 100;
                                                return (
                                                    <div key={i} className={`flex-1 min-w-[4px] rounded-t-lg transition-all duration-700 ${Math.abs(curveTotal - 100) < 0.1 ? 'bg-cyan-500' : 'bg-amber-400'}`} style={{ height: `${Math.max(6, height)}%` }}></div>
                                                );
                                            })}
                                        </div>

                                        {formData.construction_curve?.type === 'custom' && (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center px-2">
                                                    <div>
                                                        <span className="text-[9px] font-black text-cyan-800 uppercase block">STATUS TOTAL</span>
                                                        <span className={`text-xl font-black ${Math.abs(curveTotal - 100) < 0.1 ? 'text-green-600' : 'text-red-500'}`}>{curveTotal.toFixed(1)}%</span>
                                                    </div>
                                                    <button type="button" onClick={distributeRemaining} className="bg-[#081F2E] text-white text-[9px] font-black px-4 py-2 rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95">DISTRIBUIR RESTANTE</button>
                                                </div>

                                                <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar bg-white/50 rounded-2xl border border-cyan-100 italic">
                                                    <table className="w-full border-collapse">
                                                        <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-cyan-100">
                                                            <tr>
                                                                <th className="px-4 py-2 text-[9px] font-black text-cyan-800 uppercase text-left italic">Mês de Obra</th>
                                                                <th className="px-4 py-2 text-[9px] font-black text-cyan-800 uppercase text-right italic">Execução (%)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-cyan-50">
                                                            {(formData.construction_curve?.percentages || []).map((p, i) => (
                                                                <tr key={i} className="hover:bg-white transition-colors">
                                                                    <td className="px-5 py-2.5 text-xs font-black text-gray-400">#{i + 1}</td>
                                                                    <td className="px-5 py-2.5 text-right">
                                                                        <div className="flex items-center justify-end gap-1">
                                                                            <input type="number" step="0.1" value={p} onChange={e => handleCurvePercentageChange(i, parseFloat(e.target.value) || 0)} className="w-16 text-right font-black text-gray-900 bg-transparent outline-none focus:text-cyan-600 focus:text-lg transition-all" />
                                                                            <span className="text-[9px] font-black text-gray-300 font-mono">%</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex gap-4">
                        <button type="button" onClick={onCancel} className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all">Cancelar</button>
                        <button type="submit" disabled={saving || !formData.plan_name || !isValidCurve} className="flex-[2] px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-2xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-xl disabled:opacity-50">
                            {saving ? 'Salvando...' : 'Salvar Planta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (!mounted) return null;

    return createPortal(modalContent, document.body);
}
