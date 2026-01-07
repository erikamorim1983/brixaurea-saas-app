'use client';

import { useState } from 'react';
import { saveCostItem, deleteCostItem } from '@/lib/actions/feasibility';
import { useRouter } from 'next/navigation';

interface CostItem {
    id?: string;
    category: string;
    item_name: string;
    total_estimated: number;
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
        total_estimated: 0,
        start_month_offset: 0,
        duration_months: 1,
        distribution_curve: 'linear'
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: lang === 'pt' ? 'BRL' : 'USD',
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

    const grouped = costs.reduce((acc: any, item: any) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Budget</p>
                    <p className="text-3xl font-extrabold text-gray-900">
                        {formatCurrency(costs.reduce((sum, c) => sum + c.total_estimated, 0))}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Hard Costs</p>
                    <p className="text-3xl font-extrabold text-cyan-600">
                        {formatCurrency(costs.filter(c => c.category === 'HARD_COSTS').reduce((sum, c) => sum + c.total_estimated, 0))}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Soft Costs & Other</p>
                    <p className="text-3xl font-extrabold text-[#081F2E]">
                        {formatCurrency(costs.filter(c => c.category !== 'HARD_COSTS' && c.category !== 'ACQUISITION').reduce((sum, c) => sum + c.total_estimated, 0))}
                    </p>
                </div>
            </div>

            {/* Categories */}
            {CATEGORIES.map(cat => (
                <div key={cat} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-700 tracking-wide uppercase">{cat.replace('_', ' ')}</h3>
                        <span className="text-xs font-bold text-gray-400">
                            {formatCurrency(grouped[cat]?.reduce((sum: number, c: any) => sum + c.total_estimated, 0) || 0)}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[10px] text-gray-400 uppercase font-bold tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 w-1/3">Item Name</th>
                                    <th className="px-4 py-3 text-center">Amount</th>
                                    <th className="px-4 py-3 text-center">Start (M)</th>
                                    <th className="px-4 py-3 text-center">Duration (M)</th>
                                    <th className="px-4 py-3 text-center">Curve</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
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

                                {/* Add New Row Placeholder if current category matches dropdown */}
                                {newItem.category === cat && (
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
                                                {saving === 'new' ? '...' : 'Add'}
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Change Add Category Tooltip */}
                    <div className="px-6 py-3 bg-gray-50/20 text-right">
                        <select
                            className="text-[10px] font-bold text-gray-400 uppercase bg-transparent outline-none cursor-pointer hover:text-cyan-600 transition-colors"
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        >
                            <option value="" disabled>Add to another category...</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                </div>
            ))}
        </div>
    );
}
