'use client';

import { useState } from 'react';
import { saveCostItem, deleteCostItem } from '@/lib/actions/feasibility';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

    const handleDeleteItem = async (id: string) => {
        if (!confirm(lang === 'pt' ? 'Excluir este custo?' : 'Delete this cost?')) return;
        setSaving(id);
        try {
            await deleteCostItem(projectId, id);
            router.refresh();
        } catch (error) {
            console.error('Error deleting cost:', error);
        } finally {
            setSaving(null);
        }
    };

    const handleAddStandardItems = async () => {
        setSaving('standard');
        try {
            const supabase = createClient();

            // 1. Fetch schedule data from financial_scenarios
            console.log('📋 [TEMPLATE] Step 1: Fetching schedule data...');
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

            console.log('✅ [TEMPLATE] Schedule data:', scenario);
            console.log('🔍 [TEMPLATE] Detailed values:', JSON.stringify(scenario, null, 2));

            // Fallback to default values if no schedule exists
            const scheduleData = scenario || {
                incorp_dd_start_offset: 0,
                incorp_closing_start_offset: 2,
                incorp_projects_start_offset: 3,
                incorp_projects_months: 4,
                incorp_permits_start_offset: 7,
                incorp_permits_months: 6,
                construction_main_start_offset: 13,
                construction_main_months: 16,
                sales_start_offset: 6,
                sales_duration_months: 24
            };

            console.log('📊 [TEMPLATE] Using schedule:', {
                projects: `M${scheduleData.incorp_projects_start_offset} for ${scheduleData.incorp_projects_months} months`,
                permits: `M${scheduleData.incorp_permits_start_offset} for ${scheduleData.incorp_permits_months} months`,
                sales: `M${scheduleData.sales_start_offset} for ${scheduleData.sales_duration_months} months`
            });

            const standardItems = [
                {
                    category: 'SOFT_COSTS',
                    item_name: 'Architect and Consultants',
                    calculation_method: 'pct_hard_costs' as const,
                    input_value: 4.0, // 4% of Hard Costs (typical 3-5%)
                    total_estimated: 0,
                    start_month_offset: scheduleData.incorp_projects_start_offset || 0,
                    duration_months: scheduleData.incorp_projects_months || 4,
                    distribution_curve: 'linear' as const
                },
                {
                    category: 'SOFT_COSTS',
                    item_name: 'Approvals + Impact Fee',
                    calculation_method: 'fixed' as const,
                    input_value: 0, // User to fill based on city
                    total_estimated: 0,
                    start_month_offset: scheduleData.incorp_permits_start_offset || 0,
                    duration_months: scheduleData.incorp_permits_months || 6,
                    distribution_curve: 'linear' as const
                },
                {
                    category: 'SOFT_COSTS',
                    item_name: 'Legal',
                    calculation_method: 'pct_tdc' as const,
                    input_value: 0.75, // 0.75% of TDC (typical 0.5-1%)
                    total_estimated: 0,
                    start_month_offset: scheduleData.incorp_closing_start_offset || 0, // Starts at Closing (contract signature)
                    duration_months: (scheduleData.incorp_projects_start_offset || 0) + (scheduleData.incorp_projects_months || 0) - (scheduleData.incorp_closing_start_offset || 0),
                    distribution_curve: 'linear' as const
                },
                {
                    category: 'SOFT_COSTS',
                    item_name: 'Development Management',
                    calculation_method: 'pct_tdc' as const,
                    input_value: 2.5, // 2.5% of TDC (typical 2-3%)
                    total_estimated: 0,
                    start_month_offset: 0, // Starts from project beginning
                    duration_months: (scheduleData.construction_main_start_offset || 0) + (scheduleData.construction_main_months || 0),
                    distribution_curve: 'linear' as const
                },
                {
                    category: 'MARKETING_SALES',
                    item_name: 'Marketing',
                    calculation_method: 'pct_gdv' as const,
                    input_value: 2.0, // 2% of GDV (typical 1-3%)
                    total_estimated: 0,
                    start_month_offset: scheduleData.sales_start_offset || 0,
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
                                    {saving === 'standard' ? '...' : '+ US Standard Template'}
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
                                    <th className="px-6 py-3 w-1/3">{dictionary.analysis.costs.table.item}</th>
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
                                                    <span className="text-sm font-medium text-gray-900">{item.item_name}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="w-24 bg-transparent border-b border-cyan-500 outline-none text-center text-sm font-bold"
                                                        value={item.total_estimated}
                                                        onChange={e => setCosts(prev => prev.map(c => c.id === item.id ? { ...c, total_estimated: parseFloat(e.target.value) || 0 } : c))}
                                                    />
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-700">{formatCurrency(item.total_estimated)}</span>
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
                                                        <option value="linear">Linear</option>
                                                        <option value="single">Single</option>
                                                    </select>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                        {item.distribution_curve}
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
                                                            {saving === item.id ? '...' : 'Save'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setEditingId(item.id || null)}
                                                            className="text-gray-400 hover:text-cyan-600 text-xs font-bold uppercase transition-colors"
                                                        >
                                                            Edit
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
                                                placeholder="New Item Name..."
                                                className="w-full bg-transparent border-b border-gray-300 focus:border-cyan-500 outline-none text-sm"
                                                value={newItem.item_name}
                                                onChange={e => setNewItem({ ...newItem, item_name: e.target.value })}
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="number"
                                                placeholder="Amount"
                                                className="w-24 bg-transparent border-b border-gray-300 focus:border-cyan-500 outline-none text-center text-sm font-bold"
                                                value={newItem.total_estimated || ''}
                                                onChange={e => setNewItem({ ...newItem, total_estimated: parseFloat(e.target.value) || 0 })}
                                            />
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
                                                <option value="linear">Linear</option>
                                                <option value="single">Single</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={handleAddItem}
                                                disabled={saving === 'new' || !newItem.item_name}
                                                className="bg-cyan-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-cyan-700 transition-all shadow-sm"
                                            >
                                                {saving === 'new' ? '...' : (dictionary.analysis.units?.ui?.save_btn || 'Add')}
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
                        {lang === 'pt' ? 'Custos Automatizados' : 'Automated Costs'}
                    </p>
                    <p>
                        {lang === 'pt'
                            ? 'Os custos de AQUISIÇÃO, CUSTOS DE OBRA (Hard Costs) e CUSTOS FINANCEIROS são gerenciados em suas respectivas abas especializadas.'
                            : 'ACQUISITION, HARD COSTS, and FINANCIAL COSTS are managed in their respective specialized tabs.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
