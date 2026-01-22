'use client';

import { useState } from 'react';
import { saveCostItem, deleteCostItem, getProjectCosts } from '@/lib/actions/feasibility';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface CostItem {
    id?: string;
    category: string;
    item_name: string;
    calculation_method?: 'fixed' | 'pct_gdv' | 'pct_hard_costs' | 'pct_tdc';
    input_value?: number; // Percentage or base fixed value
    total_estimated: number; // Calculated value
    start_month_offset: number;
    duration_months: number;
    distribution_curve: 'linear' | 'single';
}

interface CostConfiguratorProps {
    projectId: string;
    initialCosts: CostItem[];
    lang: string;
    dictionary: any;
}

const CATEGORIES = [
    'ACQUISITION',
    'SOFT_COSTS',
    'HARD_COSTS',
    'FINANCIAL_COSTS',
    'MARKETING_SALES',
    'OPERATIONAL_EXPENSES',
    'OTHER'
];

const STANDARD_ITEM_MAP: Record<string, string> = {
    'Architect & Engineering': 'architect',
    'Impact Fees & City Permits': 'approvals',
    'Builder\'s Risk & General Liability': 'insurance',
    'Project Legal & Title Escrow': 'legal',
    'Developer Fee': 'dev_management',
    'Owner\'s Contingency': 'contingency',
    'Marketing & Model Home': 'marketing',
    'Sales Commissions': 'marketing' // Generic commissions label
};

export default function CostConfigurator({ projectId, initialCosts, lang, dictionary }: CostConfiguratorProps) {
    const router = useRouter();
    const [costs, setCosts] = useState<CostItem[]>(initialCosts);
    const [saving, setSaving] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newItem, setNewItem] = useState<CostItem>({
        category: 'SOFT_COSTS',
        item_name: '',
        calculation_method: 'fixed',
        input_value: 0,
        total_estimated: 0,
        start_month_offset: 0,
        duration_months: 1,
        distribution_curve: 'linear'
    });

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
        isOpen: false,
        id: null
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    const handleAddItem = async () => {
        if (!newItem.item_name || newItem.total_estimated <= 0) return;
        setSaving('new');
        try {
            await saveCostItem(projectId, newItem);
            setNewItem({
                category: 'SOFT_COSTS',
                item_name: '',
                total_estimated: 0,
                start_month_offset: 0,
                duration_months: 1,
                distribution_curve: 'linear'
            });
            router.refresh();
        } catch (error) {
            console.error('Error adding cost:', error);
        } finally {
            setSaving(null);
        }
    };

    const handleUpdateItem = async (item: CostItem) => {
        if (!item.id) return;
        setSaving(item.id);
        try {
            await saveCostItem(projectId, item);
            setEditingId(null);
            router.refresh();
        } catch (error) {
            console.error('Error updating cost:', error);
        } finally {
            setSaving(null);
        }
    };

    const handleDeleteItem = (id: string) => {
        setDeleteModal({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        const id = deleteModal.id;
        if (!id) return;

        setSaving(id);
        try {
            await deleteCostItem(projectId, id);
            setCosts(prev => prev.filter(item => item.id !== id));
            router.refresh();
        } catch (error) {
            console.error('Error deleting cost:', error);
        } finally {
            setSaving(null);
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    const handleAddStandardItems = async () => {
        setSaving('standard');
        try {
            const supabase = createClient();

            // 1. Fetch project standard and schedule data
            console.log('📋 [TEMPLATE] Step 1: Fetching project and schedule data...');
            const { data: project } = await supabase
                .from('projects')
                .select('standard_id, property_standards(key)')
                .eq('id', projectId)
                .single();

            const standardKey = (project?.property_standards as any)?.key || 'mid_market';
            console.log(`🏷️ [TEMPLATE] Project Standard: ${standardKey}`);

            const { data: scenario } = await supabase
                .from('financial_scenarios')
                .select(`
                    id,
                    incorp_dd_start_offset,
                    incorp_closing_start_offset,
                    incorp_projects_start_offset,
                    incorp_projects_months,
                    incorp_permits_start_offset,
                    incorp_permits_months,
                    construction_main_start_offset,
                    construction_main_months,
                    sales_start_offset,
                    sales_duration_months
                `)
                .eq('project_id', projectId)
                .eq('scenario_type', 'base')
                .maybeSingle();

            if (!scenario) {
                console.error('❌ [TEMPLATE] No base scenario found!');
                throw new Error('Base scenario not found');
            }

            const scheduleData = scenario;

            // --- Multipliers based on US Standards ---
            const multipliers = {
                luxury: { arch: 8.0, dev: 4.5, cont: 10.0, comm: 6.0, mkt: 3.0 },
                high_end: { arch: 6.5, dev: 4.0, cont: 7.5, comm: 5.5, mkt: 2.0 },
                mid_market: { arch: 5.5, dev: 3.5, cont: 5.0, comm: 5.0, mkt: 1.5 },
                affordable: { arch: 4.0, dev: 3.0, cont: 5.0, comm: 4.0, mkt: 1.0 }
            };

            const m = (multipliers as any)[standardKey] || multipliers.mid_market;

            const standardItems = [
                {
                    category: 'SOFT_COSTS',
                    item_name: 'Architect & Engineering',
                    calculation_method: 'pct_hard_costs' as const,
                    input_value: m.arch,
                    total_estimated: 0,
                    start_month_offset: scheduleData.incorp_projects_start_offset || 0,
                    duration_months: (scheduleData.incorp_projects_months || 0) + 4,
                    distribution_curve: 'linear' as const
                },
                {
                    category: 'SOFT_COSTS',
                    item_name: 'Impact Fees & City Permits',
                    calculation_method: 'fixed' as const,
                    input_value: 0,
                    total_estimated: 0,
                    start_month_offset: scheduleData.incorp_permits_start_offset || 0,
                    duration_months: scheduleData.incorp_permits_months || 6,
                    distribution_curve: 'linear' as const
                },
                {
                    category: 'SOFT_COSTS',
                    item_name: 'Builder\'s Risk & General Liability',
                    calculation_method: 'pct_hard_costs' as const,
                    input_value: standardKey === 'luxury' ? 1.2 : 0.85,
                    total_estimated: 0,
                    start_month_offset: scheduleData.construction_main_start_offset || 12,
                    duration_months: scheduleData.construction_main_months || 16,
                    distribution_curve: 'linear' as const
                },
                {
                    category: 'SOFT_COSTS',
                    item_name: 'Project Legal & Title Escrow',
                    calculation_method: 'pct_tdc' as const,
                    input_value: standardKey === 'luxury' ? 1.5 : 1.0,
                    total_estimated: 0,
                    start_month_offset: scheduleData.incorp_closing_start_offset || 0,
                    duration_months: (scheduleData.construction_main_start_offset || 12) + (scheduleData.construction_main_months || 16),
                    distribution_curve: 'linear' as const
                },
                {
                    category: 'SOFT_COSTS',
                    item_name: 'Developer Fee',
                    calculation_method: 'pct_tdc' as const,
                    input_value: m.dev,
                    total_estimated: 0,
                    start_month_offset: 0,
                    duration_months: (scheduleData.construction_main_start_offset || 12) + (scheduleData.construction_main_months || 16),
                    distribution_curve: 'linear' as const
                },
                {
                    category: 'OTHER',
                    item_name: 'Owner\'s Contingency',
                    calculation_method: 'pct_hard_costs' as const,
                    input_value: m.cont,
                    total_estimated: 0,
                    start_month_offset: scheduleData.construction_main_start_offset || 12,
                    duration_months: scheduleData.construction_main_months || 16,
                    distribution_curve: 'linear' as const
                },
                {
                    category: 'MARKETING_SALES',
                    item_name: 'Marketing & Model Home',
                    calculation_method: 'pct_gdv' as const,
                    input_value: m.mkt,
                    total_estimated: 0,
                    start_month_offset: (scheduleData.sales_start_offset || 6) - 2,
                    duration_months: (scheduleData.sales_duration_months || 24) + 2,
                    distribution_curve: 'linear' as const
                },
                {
                    category: 'MARKETING_SALES',
                    item_name: 'Sales Commissions',
                    calculation_method: 'pct_gdv' as const,
                    input_value: m.comm,
                    total_estimated: 0,
                    start_month_offset: scheduleData.sales_start_offset || 6,
                    duration_months: scheduleData.sales_duration_months || 24,
                    distribution_curve: 'linear' as const
                },
            ];

            // Fetch current costs from database to check for existing items
            console.log('📋 [TEMPLATE] Step 2: Fetching existing costs...');
            const { data: currentCosts } = await supabase
                .from('cost_line_items')
                .select('*')
                .eq('scenario_id', scenario.id);

            console.log(`✅ [TEMPLATE] Found ${currentCosts?.length || 0} existing items in database`);

            for (const item of standardItems) {
                // Check if already exists in database (not local state)
                const existing = currentCosts?.find(c =>
                    c.item_name?.trim().toLowerCase() === item.item_name.trim().toLowerCase() &&
                    c.category === item.category
                );

                if (existing) {
                    console.log(`🔄 [TEMPLATE] Updating "${item.item_name}": Início M${item.start_month_offset}, Duração ${item.duration_months} meses`);
                    // UPDATE existing item with synchronized schedule data and new calculation methods
                    await saveCostItem(projectId, {
                        ...existing,
                        calculation_method: item.calculation_method,
                        input_value: item.input_value,
                        start_month_offset: item.start_month_offset,
                        duration_months: item.duration_months,
                        distribution_curve: item.distribution_curve
                    } as any);
                } else {
                    console.log(`➕ [TEMPLATE] Creating "${item.item_name}": Início M${item.start_month_offset}, Duração ${item.duration_months} meses`);
                    // CREATE new item
                    await saveCostItem(projectId, item as any);
                }
            }

            console.log('✅ [TEMPLATE] All items processed! Refreshing page...');

            // Fix: Re-fetch and update local state so changes appear immediately
            const updatedCosts = await getProjectCosts(projectId);
            setCosts(updatedCosts);

            router.refresh();
        } catch (error) {
            console.error('❌ [TEMPLATE] Error in handleAddStandardItems:', error);
            alert(`Failed to apply template: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSaving(null);
        }
    };

    const grouped = costs.reduce((acc: any, item: any) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{dictionary.analysis.costs.total_budget || 'Total Budget'}</p>
                    <p className="text-3xl font-extrabold text-gray-900">
                        {formatCurrency(costs.reduce((sum, c) => sum + (c.total_estimated || 0), 0))}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{dictionary.analysis.costs.soft_costs_title || 'Soft Costs'}</p>
                    <p className="text-3xl font-extrabold text-[#081F2E]">
                        {formatCurrency(costs.filter(c => c.category === 'SOFT_COSTS').reduce((sum, c) => sum + (c.total_estimated || 0), 0))}
                    </p>
                </div>
            </div>

            {/* Scoped Categories Label */}
            <div className="flex items-center gap-2 text-[#081F2E]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2" /></svg>
                <h2 className="text-lg font-bold">{dictionary.analysis.costs.title}</h2>
            </div>

            {/* Categories */}
            {CATEGORIES.filter(cat => !['ACQUISITION', 'HARD_COSTS', 'FINANCIAL_COSTS'].includes(cat)).map(cat => (
                <div key={cat} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h3 className="text-sm font-bold text-gray-700 tracking-wide uppercase">
                                {dictionary.analysis.costs.categories[cat] || cat.replace('_', ' ')}
                            </h3>
                            {cat === 'SOFT_COSTS' && (
                                <button
                                    onClick={handleAddStandardItems}
                                    disabled={saving === 'standard'}
                                    className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 hover:bg-blue-100 transition-colors font-bold uppercase tracking-wider"
                                >
                                    {saving === 'standard' ? '...' : (dictionary.analysis.costs.ui?.standard_template || '+ US Standard Template')}
                                </button>
                            )}
                        </div>
                        <span className="text-xs font-bold text-gray-400">
                            {formatCurrency(grouped[cat]?.reduce((sum: number, c: any) => sum + c.total_estimated, 0) || 0)}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] text-gray-400 uppercase font-bold tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 w-1/4">{dictionary.analysis.costs.table.item}</th>
                                    <th className="px-4 py-3 text-center">{dictionary.analysis.costs.table.method}</th>
                                    <th className="px-4 py-3 text-center">{dictionary.analysis.costs.table.amount}</th>
                                    <th className="px-4 py-3 text-center">{dictionary.analysis.costs.table.start}</th>
                                    <th className="px-4 py-3 text-center">{dictionary.analysis.costs.table.duration}</th>
                                    <th className="px-4 py-3 text-center">{dictionary.analysis.costs.table.curve}</th>
                                    <th className="px-6 py-3 text-right">{dictionary.analysis.costs.table.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {grouped[cat]?.map((item: CostItem) => {
                                    const isEditing = editingId === item.id;
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="w-full bg-transparent border-b border-cyan-500 outline-none text-sm font-medium"
                                                        value={item.item_name}
                                                        onChange={e => setCosts(prev => prev.map(c => c.id === item.id ? { ...c, item_name: e.target.value } : c))}
                                                    />
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">{item.item_name}</span>
                                                        {lang !== 'en' && STANDARD_ITEM_MAP[item.item_name] && (
                                                            <span className="text-[10px] text-gray-400 font-medium italic">
                                                                {dictionary.analysis.costs.items[STANDARD_ITEM_MAP[item.item_name]]}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {isEditing ? (
                                                    <select
                                                        className="bg-transparent border-b border-cyan-500 outline-none text-[10px] font-bold uppercase"
                                                        value={item.calculation_method || 'fixed'}
                                                        onChange={e => setCosts(prev => prev.map(c => c.id === item.id ? { ...c, calculation_method: e.target.value as any } : c))}
                                                    >
                                                        <option value="fixed">{dictionary.analysis.costs.ui.method_fixed}</option>
                                                        <option value="pct_hard_costs">{dictionary.analysis.costs.ui.method_pct_hard}</option>
                                                        <option value="pct_gdv">{dictionary.analysis.costs.ui.method_pct_gdv}</option>
                                                        <option value="pct_tdc">{dictionary.analysis.costs.ui.method_pct_tdc}</option>
                                                    </select>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                        {item.calculation_method === 'fixed' ? dictionary.analysis.costs.ui.method_fixed :
                                                            item.calculation_method === 'pct_hard_costs' ? dictionary.analysis.costs.ui.method_pct_hard :
                                                                item.calculation_method === 'pct_gdv' ? dictionary.analysis.costs.ui.method_pct_gdv :
                                                                    item.calculation_method === 'pct_tdc' ? dictionary.analysis.costs.ui.method_pct_tdc :
                                                                        dictionary.analysis.costs.ui.method_fixed}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <input
                                                            type="number"
                                                            className="w-20 bg-transparent border-b border-cyan-500 outline-none text-center text-sm font-bold"
                                                            value={item.calculation_method === 'fixed' ? item.total_estimated : item.input_value}
                                                            onChange={e => {
                                                                const val = parseFloat(e.target.value) || 0;
                                                                setCosts(prev => prev.map(c => {
                                                                    if (c.id !== item.id) return c;
                                                                    return item.calculation_method === 'fixed'
                                                                        ? { ...c, total_estimated: val, input_value: 0 }
                                                                        : { ...c, input_value: val };
                                                                }));
                                                            }}
                                                        />
                                                        {item.calculation_method !== 'fixed' && <span className="text-xs font-bold text-cyan-600">%</span>}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-bold text-gray-700">{formatCurrency(item.total_estimated)}</span>
                                                        {item.calculation_method !== 'fixed' && (
                                                            <span className="text-[10px] text-cyan-600 font-bold">{item.input_value}%</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="w-16 bg-transparent border-b border-cyan-500 outline-none text-center text-sm"
                                                        value={item.start_month_offset}
                                                        onChange={e => setCosts(prev => prev.map(c => c.id === item.id ? { ...c, start_month_offset: parseInt(e.target.value) || 0 } : c))}
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-500">{item.start_month_offset}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="w-16 bg-transparent border-b border-cyan-500 outline-none text-center text-sm"
                                                        value={item.duration_months}
                                                        onChange={e => setCosts(prev => prev.map(c => c.id === item.id ? { ...c, duration_months: parseInt(e.target.value) || 1 } : c))}
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-500">{item.duration_months}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {isEditing ? (
                                                    <select
                                                        className="bg-transparent border-b border-cyan-500 outline-none text-xs"
                                                        value={item.distribution_curve}
                                                        onChange={e => setCosts(prev => prev.map(c => c.id === item.id ? { ...c, distribution_curve: e.target.value as any } : c))}
                                                    >
                                                        <option value="linear">{dictionary.analysis.costs.ui?.curve_linear || 'Linear'}</option>
                                                        <option value="single">{dictionary.analysis.costs.ui?.curve_single || 'Single'}</option>
                                                    </select>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                        {item.distribution_curve === 'linear'
                                                            ? (dictionary.analysis.costs.ui?.curve_linear || 'Linear')
                                                            : (dictionary.analysis.costs.ui?.curve_single || 'Single')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {isEditing ? (
                                                        <button
                                                            onClick={() => handleUpdateItem(item)}
                                                            disabled={saving === item.id}
                                                            className="text-cyan-600 hover:text-cyan-800 text-xs font-bold uppercase transition-colors"
                                                        >
                                                            {saving === item.id ? '...' : (dictionary.analysis.costs.ui?.save_btn || 'Save')}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setEditingId(item.id || null)}
                                                            className="text-gray-400 hover:text-cyan-600 text-xs font-bold uppercase transition-colors"
                                                        >
                                                            {dictionary.analysis.costs.ui?.edit_btn || 'Edit'}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => item.id && handleDeleteItem(item.id)}
                                                        className="text-gray-300 hover:text-red-500 text-lg leading-none"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Add New Row Placeholder if current category matches dropdown - Only for Soft/Financial/Marketing */}
                                {newItem.category === cat && !['ACQUISITION', 'HARD_COSTS'].includes(cat) && (
                                    <tr className="bg-cyan-50/20 border-t border-cyan-100">
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                placeholder={dictionary.analysis.costs.ui?.placeholder_item || "New Item Name..."}
                                                className="w-full bg-transparent border-b border-gray-300 focus:border-cyan-500 outline-none text-sm"
                                                value={newItem.item_name}
                                                onChange={e => setNewItem({ ...newItem, item_name: e.target.value })}
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <select
                                                className="bg-transparent border-b border-gray-300 focus:border-cyan-500 outline-none text-[10px] font-bold uppercase"
                                                value={newItem.calculation_method || 'fixed'}
                                                onChange={e => setNewItem({ ...newItem, calculation_method: e.target.value as any })}
                                            >
                                                <option value="fixed">{dictionary.analysis.costs.ui.method_fixed}</option>
                                                <option value="pct_hard_costs">{dictionary.analysis.costs.ui.method_pct_hard}</option>
                                                <option value="pct_gdv">{dictionary.analysis.costs.ui.method_pct_gdv}</option>
                                                <option value="pct_tdc">{dictionary.analysis.costs.ui.method_pct_tdc}</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <input
                                                    type="number"
                                                    placeholder={newItem.calculation_method === 'fixed' ? (dictionary.analysis.costs.ui?.placeholder_amount || "Amount") : "0"}
                                                    className="w-20 bg-transparent border-b border-gray-300 focus:border-cyan-500 outline-none text-center text-sm font-bold"
                                                    value={newItem.calculation_method === 'fixed' ? (newItem.total_estimated || '') : (newItem.input_value || '')}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        setNewItem(prev => newItem.calculation_method === 'fixed'
                                                            ? { ...prev, total_estimated: val, input_value: 0 }
                                                            : { ...prev, input_value: val, total_estimated: 0 }
                                                        );
                                                    }}
                                                />
                                                {newItem.calculation_method !== 'fixed' && <span className="text-xs font-bold text-cyan-600">%</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-16 bg-transparent border-b border-gray-300 focus:border-cyan-500 outline-none text-center text-sm"
                                                value={newItem.start_month_offset}
                                                onChange={e => setNewItem({ ...newItem, start_month_offset: parseInt(e.target.value) || 0 })}
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="number"
                                                placeholder="1"
                                                className="w-16 bg-transparent border-b border-gray-300 focus:border-cyan-500 outline-none text-center text-sm"
                                                value={newItem.duration_months}
                                                onChange={e => setNewItem({ ...newItem, duration_months: parseInt(e.target.value) || 1 })}
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <select
                                                className="bg-transparent border-b border-gray-300 focus:border-cyan-500 outline-none text-xs"
                                                value={newItem.distribution_curve}
                                                onChange={e => setNewItem({ ...newItem, distribution_curve: e.target.value as any })}
                                            >
                                                <option value="linear">{dictionary.analysis.costs.ui?.curve_linear || 'Linear'}</option>
                                                <option value="single">{dictionary.analysis.costs.ui?.curve_single || 'Single'}</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={handleAddItem}
                                                disabled={saving === 'new' || !newItem.item_name}
                                                className="bg-cyan-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-cyan-700 transition-all shadow-sm"
                                            >
                                                {saving === 'new' ? '...' : (dictionary.analysis.costs.ui?.add_btn || 'Add')}
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Change Add Category Tooltip */}
                    {!['ACQUISITION', 'HARD_COSTS'].includes(cat) && (
                        <div className="px-6 py-3 bg-gray-50/20 text-right">
                            <select
                                className="text-[10px] font-bold text-gray-400 uppercase bg-transparent outline-none cursor-pointer hover:text-cyan-600 transition-colors"
                                value={newItem.category}
                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            >
                                <option value="" disabled>Add to another category...</option>
                                {CATEGORIES.filter(c => !['ACQUISITION', 'HARD_COSTS'].includes(c)).map(c => (
                                    <option key={c} value={c}>
                                        {dictionary.analysis?.costs?.categories?.[c] || c.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            ))}

            {/* Managed Categories Note */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="text-xs text-blue-700 leading-relaxed">
                    <p className="font-bold uppercase tracking-wider mb-1">
                        {dictionary.analysis.costs.ui?.automated_costs_title || 'Automated Costs'}
                    </p>
                    <p>
                        {dictionary.analysis.costs.ui?.automated_costs_desc || (lang === 'pt'
                            ? 'Os custos de AQUISIÇÃO, CUSTOS DE OBRA (Hard Costs) e CUSTOS FINANCEIROS são gerenciados em suas respectivas abas especializadas.'
                            : 'ACQUISITION, HARD COSTS, and FINANCIAL COSTS are managed in their respective specialized tabs.')}
                    </p>
                </div>
            </div>

            {/* Premium Confirm Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title={dictionary.analysis.units?.ui?.delete_msg ? (lang === 'pt' ? 'Excluir Custo' : (lang === 'es' ? 'Eliminar Costo' : 'Delete Cost')) : (lang === 'pt' ? 'Excluir Custo' : 'Delete Cost')}
                message={lang === 'pt'
                    ? 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.'
                    : (lang === 'es' ? '¿Está seguro de que desea eliminar este ítem? Esta acción no se puede deshacer.' : 'Are you sure you want to delete this item? This action cannot be undone.')}
                confirmText={dictionary.projects?.list?.delete_permanent || (lang === 'pt' ? 'Excluir' : (lang === 'es' ? 'Eliminar' : 'Delete'))}
                cancelText={dictionary.register?.buttons?.back || (lang === 'pt' ? 'Cancelar' : (lang === 'es' ? 'Cancelar' : 'Cancel'))}
                isDestructive={true}
            />
        </div>
    );
}
