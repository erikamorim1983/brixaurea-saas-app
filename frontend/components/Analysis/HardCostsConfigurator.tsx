'use client';

import { useState, useEffect, useMemo } from 'react';
import { saveCostItem, deleteCostItem } from '@/lib/actions/feasibility';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface CostItem {
    id?: string;
    category: string;
    item_name: string;
    calculation_method?: 'fixed' | 'pct_gdv' | 'pct_hard_costs' | 'pct_tdc';
    input_value?: number;
    total_estimated: number;
    start_month_offset: number;
    duration_months: number;
    distribution_curve: 'linear' | 'single';
}

interface HardCostsConfiguratorProps {
    projectId: string;
    project: any;
    initialCosts: CostItem[];
    initialUnits: any[];
    lang: string;
    dictionary: any;
}

const HARD_COST_SUGGESTIONS: Record<string, { price: number; label: string }> = {
    'luxury': { price: 350, label: 'Luxury (High Finish)' },
    'high_market': { price: 250, label: 'High Market' },
    'mid_market': { price: 180, label: 'Mid-Market' },
    'affordable': { price: 140, label: 'Affordable / Entry' }
};

export default function HardCostsConfigurator({ projectId, project, initialCosts, initialUnits, lang, dictionary }: HardCostsConfiguratorProps) {
    const router = useRouter();
    const [costs, setCosts] = useState<CostItem[]>(initialCosts.filter(c => c.category === 'HARD_COSTS'));
    const [costPerSqft, setCostPerSqft] = useState<number>(180);
    const [infraCost, setInfraCost] = useState<number>(50000);
    const [infraDuration, setInfraDuration] = useState<number>(4);

    // Strategy logic derived from project subtype
    const subtypeKey = project?.property_subtypes?.key || 'single_family_generic';

    const isMonolithicType = [
        'condos_mid_rise',
        'condos_high_rise',
        'mid_rise_multifamily',
        'high_rise_multifamily',
        'office_low_rise',
        'medical_office_building',
        'hotel',
        'boutique_hotel',
        'warehouse_industrial',
        'self_storage',
        'data_center'
    ].includes(subtypeKey);

    const [strategy, setStrategy] = useState<'detached' | 'blocks' | 'monolithic'>(isMonolithicType ? 'monolithic' : 'detached');
    const [linkToSales, setLinkToSales] = useState<boolean>(!isMonolithicType);

    const [unitConstDuration, setUnitConstDuration] = useState<number>(isMonolithicType ? 24 : 10);
    const [staggerInterval, setStaggerInterval] = useState<number>(1);
    const [startMonth, setStartMonth] = useState<number>(12);

    const [saving, setSaving] = useState<string | null>(null);
    const dict = dictionary.analysis.costs.hard_costs;

    // Derived Data
    const totalArea = initialUnits.reduce((sum, u) => sum + (u.unit_count * (u.area_total || 0)), 0);
    const totalUnitsCount = initialUnits.reduce((sum, u) => sum + u.unit_count, 0);
    const modelUnitsDirectCount = initialUnits.filter(u => u.is_model_unit).reduce((sum, u) => sum + u.unit_count, 0);

    // Initial configuration
    useEffect(() => {
        const main = costs.find(c => c.item_name === 'Construction (Hard Cost)');
        if (main && totalArea > 0) {
            setCostPerSqft(Math.round(main.total_estimated / totalArea));
        } else {
            const supabase = createClient();
            supabase.from('projects').select('property_standards(key)').eq('id', projectId).single()
                .then(({ data }) => {
                    const key = (data?.property_standards as any)?.key || 'mid_market';
                    setCostPerSqft(HARD_COST_SUGGESTIONS[key]?.price || 180);
                });
        }
    }, [projectId, totalArea]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    // --- CONSTRUCTION WAVE CALCULATOR ---
    const waveData = useMemo(() => {
        const months: Record<number, number> = {};
        const totalAmount = totalArea * costPerSqft;
        const amountPerUnit = totalUnitsCount > 0 ? totalAmount / totalUnitsCount : 0;

        const allUnits = initialUnits.flatMap(u => Array(u.unit_count).fill({ ...u }));

        if (strategy === 'monolithic') {
            for (let i = 0; i < unitConstDuration; i++) {
                const m = startMonth + i;
                months[m] = (months[m] || 0) + (totalAmount / unitConstDuration);
            }
        } else {
            allUnits.forEach((u, index) => {
                let unitStart = startMonth;
                const isModel = u.is_model_unit;
                const fp = u.floor_plans;
                const curve = fp?.construction_curve;
                const duration = fp?.construction_duration_months || unitConstDuration;

                if (isModel) {
                    unitStart = startMonth;
                } else if (linkToSales) {
                    let saleM = startMonth;
                    if (u.sale_date) {
                        const d = new Date(u.sale_date);
                        saleM = Math.max(0, d.getMonth() + (d.getFullYear() - 2025) * 12);
                    } else {
                        saleM = startMonth + (index * 2);
                    }
                    unitStart = saleM;
                } else {
                    unitStart = startMonth + (index * staggerInterval);
                }

                if (curve?.type === 'custom' && curve.percentages?.length === duration) {
                    curve.percentages.forEach((pct: number, i: number) => {
                        const m = unitStart + i;
                        months[m] = (months[m] || 0) + (amountPerUnit * (pct / 100));
                    });
                } else {
                    for (let i = 0; i < duration; i++) {
                        const m = unitStart + i;
                        months[m] = (months[m] || 0) + (amountPerUnit / duration);
                    }
                }
            });
        }

        const infraStart = Math.max(0, startMonth - infraDuration);
        for (let i = 0; i < infraDuration; i++) {
            const m = infraStart + i;
            months[m] = (months[m] || 0) + (infraCost / infraDuration);
        }

        return Object.entries(months).sort((a, b) => Number(a[0]) - Number(b[0])).map(([m, val]) => ({ month: Number(m), value: val }));
    }, [strategy, linkToSales, totalArea, costPerSqft, totalUnitsCount, unitConstDuration, staggerInterval, startMonth, infraCost, infraDuration, initialUnits]);

    const handleApplyCalculation = async () => {
        setSaving('main');
        try {
            const minMonth = waveData.length > 0 ? waveData[0].month : 0;
            const maxMonth = waveData.length > 0 ? waveData[waveData.length - 1].month : 12;
            const fullDuration = maxMonth - minMonth + 1;

            await saveCostItem(projectId, {
                category: 'HARD_COSTS',
                item_name: 'Infrastructure & Site Prep',
                total_estimated: infraCost,
                calculation_method: 'fixed',
                start_month_offset: minMonth,
                duration_months: infraDuration,
                distribution_curve: 'linear'
            });

            await saveCostItem(projectId, {
                category: 'HARD_COSTS',
                item_name: 'Construction (Hard Cost)',
                total_estimated: totalArea * costPerSqft,
                calculation_method: 'fixed',
                start_month_offset: Math.max(minMonth + infraDuration, startMonth),
                duration_months: fullDuration - infraDuration,
                distribution_curve: 'linear'
            });

            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(null);
        }
    };

    const maxVal = Math.max(...waveData.map(d => d.value), 1);

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* Context Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Property Type</p>
                    <p className="text-sm font-black text-[#081F2E] uppercase">{subtypeKey.replace(/_/g, ' ')}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model Homes</p>
                    <p className="text-sm font-black text-cyan-600">{modelUnitsDirectCount} Units Flagged</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sync Status</p>
                    <p className="text-sm font-black text-amber-500 uppercase">{linkToSales ? 'Sales-Driven' : 'Manual Schedule'}</p>
                </div>
                <div className="bg-[#081F2E] p-4 rounded-2xl shadow-lg border border-white/10">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Hard Cost</p>
                    <p className="text-xl font-black text-cyan-400">{formatCurrency(totalArea * costPerSqft + infraCost)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Controls */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Infrastructure */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                            1. {dict.infrastructure}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Total Budget ($)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                                    value={infraCost}
                                    onChange={(e) => setInfraCost(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Duration (Months)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 outline-none"
                                    value={infraDuration}
                                    onChange={(e) => setInfraDuration(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vertical Controls */}
                    <div className="bg-[#081F2E] p-6 rounded-3xl shadow-2xl text-white relative isolate">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 blur-2xl -z-10"></div>

                        <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                            2. {dict.vertical_construction}
                        </h3>

                        <div className="space-y-6">
                            {/* Sync Control */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:border-cyan-500/50 transition-all cursor-pointer" onClick={() => setLinkToSales(!linkToSales)}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg transition-colors ${linkToSales ? 'bg-cyan-500 text-[#081F2E]' : 'bg-white/10 text-gray-500'}`}>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a1 1 0 00-2 0v12a1 1 0 002 0V4zM9 4a1 1 0 00-2 0v12a1 1 0 002 0V4zM13 4a1 1 0 00-2 0v12a1 1 0 002 0V4zM17 4a1 1 0 00-2 0v12a1 1 0 002 0V4z" /></svg>
                                    </div>
                                    <div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider block ${linkToSales ? 'text-white' : 'text-gray-500'}`}>{dict.sync_sales}</span>
                                        <span className="text-[9px] text-gray-500">{linkToSales ? 'Seguindo Tabela de Vendas' : 'Cronograma Manual'}</span>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative transition-colors ${linkToSales ? 'bg-cyan-500' : 'bg-gray-800'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all ${linkToSales ? 'left-7' : 'left-1'}`}></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">{dict.unit_duration}</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-black outline-none focus:border-cyan-500"
                                        value={unitConstDuration}
                                        onChange={(e) => setUnitConstDuration(parseInt(e.target.value) || 1)}
                                    />
                                </div>
                                {!linkToSales && (
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">{dict.stagger_interval}</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-black outline-none focus:border-cyan-500"
                                            value={staggerInterval}
                                            onChange={(e) => setStaggerInterval(parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Cost per SqFt ($)</label>
                                <input
                                    type="number"
                                    className="w-full bg-cyan-400/5 border-2 border-cyan-400/20 rounded-2xl px-4 py-4 text-3xl font-black outline-none focus:border-cyan-400 text-center text-cyan-400 shadow-inner"
                                    value={costPerSqft}
                                    onChange={(e) => setCostPerSqft(parseInt(e.target.value) || 0)}
                                />
                            </div>

                            <button
                                onClick={handleApplyCalculation}
                                disabled={saving === 'main' || totalArea <= 0}
                                className="w-full bg-cyan-400 hover:bg-cyan-300 text-[#081F2E] font-black py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-tighter text-base disabled:opacity-50"
                            >
                                {saving === 'main' ? (
                                    <div className="w-6 h-6 border-2 border-[#081F2E] border-t-transparent animate-spin rounded-full"></div>
                                ) : dict.automatic_calc}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Viz */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-sm font-black text-[#081F2E] tracking-widest uppercase mb-1">{dict.construction_wave}</h3>
                                <p className="text-[10px] font-bold text-gray-400">Monthly Hard Cost Burn Rate</p>
                            </div>
                        </div>

                        <div className="h-64 flex items-end gap-1.5 px-4 relative">
                            {waveData.map((d, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg group relative cursor-crosshair transition-all hover:scale-x-110"
                                    style={{ height: `${(d.value / maxVal) * 100}%` }}
                                >
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#081F2E] text-white text-[9px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-2xl z-50 pointer-events-none whitespace-nowrap">
                                        <p className="font-black text-cyan-400">Month {d.month}</p>
                                        <p className="font-bold">{formatCurrency(d.value)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="text-[10px] text-gray-400 uppercase font-black tracking-widest bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-5">Construction Item</th>
                                    <th className="px-4 py-5 text-center">Start</th>
                                    <th className="px-4 py-5 text-right">Total Budget</th>
                                    <th className="px-8 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {costs.map((item) => (
                                    <tr key={item.id} className="hover:bg-cyan-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-[#081F2E]">{item.item_name}</span>
                                                <span className="text-[9px] text-cyan-600 font-bold uppercase tracking-tight">{item.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 text-center text-sm font-black text-gray-400">Month {item.start_month_offset}</td>
                                        <td className="px-4 py-5 text-right font-black text-[#081F2E] text-lg">{formatCurrency(item.total_estimated)}</td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={async () => {
                                                    if (item.id) {
                                                        await deleteCostItem(projectId, item.id);
                                                        setCosts(prev => prev.filter(c => c.id !== item.id));
                                                        router.refresh();
                                                    }
                                                }}
                                                className="text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-black text-xl"
                                            >&times;</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
