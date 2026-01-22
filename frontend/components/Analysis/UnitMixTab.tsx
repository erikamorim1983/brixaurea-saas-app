'use client';

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import FloorPlanSelector, { FloorPlan } from "../FloorPlan/FloorPlanSelector";
import ConfirmModal from "../ui/ConfirmModal";
import UnitMixScenarios from "./UnitMixScenarios";

interface UnitMixTabProps {
    project: any;
    location: any;
    lang: string;
    dictionary: any;
}

interface Scenario {
    id: string;
    name: string;
    key: 'optimistic' | 'base' | 'pessimistic';
    variation_percent: number;
}

export default function UnitMixTab({ project, lang, dictionary }: UnitMixTabProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [baseScenarioId, setBaseScenarioId] = useState<string | null>(null);
    const [units, setUnits] = useState<any[]>([]); // Always stores BASE units

    // View State
    const [viewMode, setViewMode] = useState<'editor' | 'scenarios'>('editor');

    // Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<string | null>(null);

    // Form Input State
    const [newItem, setNewItem] = useState({
        model_name: '',
        unit_count: 1,
        area_sqft: 0, // Sellable / Under Air
        area_outdoor: 0, // Non-Conditioned
        area_total: 0,
        price_sqft: 0,
        avg_price: 0,
        bedrooms: 0,
        bathrooms: 0,
        half_baths: 0,
        suites: 0,
        garages: 0,
        sale_date: '',
        construction_start_date: '',
        is_model_unit: false,
        construction_duration_months: 10,
        subtype_id: ''
    });

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editItem, setEditItem] = useState<any>(null);

    const dict = dictionary.analysis.units; // Shortcut

    // 1. Initialize Financial Scenarios (Optimistic, Base, Pessimistic)
    const initScenarios = useCallback(async () => {
        try {
            // Check existing
            const { data: existing } = await supabase
                .from('financial_scenarios')
                .select('id, name, variation_percent, scenario_type')
                .eq('project_id', project.id)
                .order('created_at');

            const keys: { key: 'optimistic' | 'base' | 'pessimistic', name: string }[] = [
                { key: 'optimistic', name: dict.scenarios?.optimistic || 'Optimistic' },
                { key: 'base', name: dict.scenarios?.base || 'Base Case' },
                { key: 'pessimistic', name: dict.scenarios?.pessimistic || 'Pessimistic' }
            ];

            const finalScenarios: Scenario[] = [];

            for (const k of keys) {
                // Try to find by scenario_type first, then fallback to localized name
                let found = existing?.find(e => e.scenario_type === k.key);
                if (!found) {
                    found = existing?.find(e => e.name === k.name);
                }
                // Global fallback for "Base Case" if it was created in another language
                if (!found && k.key === 'base') {
                    found = existing?.find(e => ['Base Case', 'Caso Base', 'Base Scenario'].includes(e.name));
                }

                if (!found) {
                    const { data: created } = await supabase
                        .from('financial_scenarios')
                        .insert({
                            project_id: project.id,
                            name: k.name,
                            scenario_type: k.key,
                            gross_sales_projected: 0,
                            variation_percent: 0
                        })
                        .select()
                        .single();
                    if (created) found = created;
                } else if (!found.scenario_type) {
                    // Backfill the type if it was found by name
                    await supabase
                        .from('financial_scenarios')
                        .update({ scenario_type: k.key })
                        .eq('id', found.id);
                }

                if (found) {
                    finalScenarios.push({
                        id: found.id,
                        name: found.name,
                        key: k.key,
                        variation_percent: found.variation_percent || 0
                    });
                }
            }

            setScenarios(finalScenarios);

            // Identify Base Scenario ID
            const base = finalScenarios.find(s => s.key === 'base');
            const baseId = base ? base.id : finalScenarios[0]?.id;

            if (baseId) {
                setBaseScenarioId(baseId);
                // ALWAYS fetch units from Base
                fetchUnits(baseId);
            }
        } catch (err) {
            console.error('Error initializing scenarios:', err);
        }
    }, [project.id, supabase, dict]);

    // 2. Fetch Units (Always from Base)
    const fetchUnits = async (baseId: string) => {
        const { data } = await supabase
            .from('units_mix')
            .select('*')
            .eq('scenario_id', baseId)
            .order('created_at', { ascending: true });

        if (data) setUnits(data);
        setLoading(false);
    };

    useEffect(() => {
        initScenarios();
    }, [initScenarios]);

    // 3. Update Scenario Variation
    const updateVariation = async (id: string, percent: number) => {
        // Update local state first for responsiveness
        setScenarios(prev => prev.map(s => s.id === id ? { ...s, variation_percent: percent } : s));

        // Update DB
        const { error } = await supabase
            .from('financial_scenarios')
            .update({ variation_percent: percent })
            .eq('id', id);

        if (error) console.error('Error updating variation:', error);
    };

    // 4. Add Unit (To Base Only)
    const handleAddUnit = async () => {
        if (!baseScenarioId || !newItem.model_name) return;

        // Auto-calc avg_price if 0 but price_sqft exists
        let finalAvgPrice = newItem.avg_price;
        if (finalAvgPrice === 0 && newItem.price_sqft > 0 && newItem.area_sqft > 0) {
            finalAvgPrice = newItem.price_sqft * newItem.area_sqft;
        }

        // Auto-calc Total Area = Under Air + Outdoor
        const finalTotalArea = (newItem.area_sqft || 0) + (newItem.area_outdoor || 0);

        const { error } = await supabase
            .from('units_mix')
            .insert({
                scenario_id: baseScenarioId,
                ...newItem,
                sale_date: newItem.sale_date ? (newItem.sale_date.length === 7 ? `${newItem.sale_date}-01` : newItem.sale_date) : null,
                construction_start_date: newItem.construction_start_date ? (newItem.construction_start_date.length === 7 ? `${newItem.construction_start_date}-01` : newItem.construction_start_date) : null,
                area_total: finalTotalArea,
                avg_price: finalAvgPrice,
                is_model_unit: newItem.is_model_unit
            });

        if (!error) {
            setNewItem({
                model_name: '',
                unit_count: 1,
                area_sqft: 0,
                area_outdoor: 0,
                area_total: 0,
                price_sqft: 0,
                avg_price: 0,
                bedrooms: 0,
                bathrooms: 0,
                half_baths: 0,
                suites: 0,
                garages: 0,
                sale_date: '',
                construction_start_date: '',
                is_model_unit: false,
                construction_duration_months: 10,
                subtype_id: ''
            });
            fetchUnits(baseScenarioId);
        } else {
            console.error(error);
            alert(`Error adding unit: ${error.message}. Ensure migration is run.`);
        }
    };

    // 5. Delete Unit Logic
    const confirmDelete = (id: string) => {
        setUnitToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!unitToDelete) return;

        await supabase.from('units_mix').delete().eq('id', unitToDelete);

        if (baseScenarioId) fetchUnits(baseScenarioId);
        setUnitToDelete(null);
    };

    // 6. Update Unit
    const handleUpdateUnit = async () => {
        const finalTotalArea = (editItem.area_sqft || 0) + (editItem.area_outdoor || 0);

        // Destructure to remove fields that shouldn't be updated or cause policy issues
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, created_at, scenario_id, ...updatePayload } = editItem as any;

        const { error } = await supabase
            .from('units_mix')
            .update({
                ...updatePayload,
                sale_date: editItem.sale_date && editItem.sale_date.trim() !== ''
                    ? (editItem.sale_date.length === 7 ? `${editItem.sale_date}-01` : editItem.sale_date)
                    : null,
                construction_start_date: editItem.construction_start_date && editItem.construction_start_date.trim() !== ''
                    ? (editItem.construction_start_date.length === 7 ? `${editItem.construction_start_date}-01` : editItem.construction_start_date)
                    : null,
                area_total: finalTotalArea,
                is_model_unit: editItem.is_model_unit
            })
            .eq('id', editingId);

        if (!error) {
            setEditingId(null);
            setEditItem(null);
            if (baseScenarioId) fetchUnits(baseScenarioId);
        } else {
            console.error(error);
            alert("Error updating unit.");
        }
    };

    // 7. Batch Save Unit Variations
    const handleSaveVariations = async (updates: any[]) => {
        // Optimistic update locally
        setUnits(prev => {
            const newUnits = [...prev];
            updates.forEach(up => {
                const idx = newUnits.findIndex(u => u.id === up.id);
                if (idx !== -1) {
                    newUnits[idx] = {
                        ...newUnits[idx],
                        optimistic_variation: up.optimistic_variation,
                        pessimistic_variation: up.pessimistic_variation
                    };
                }
            });
            return newUnits;
        });

        // Batch update to Supabase
        const promises = updates.map(up =>
            supabase
                .from('units_mix')
                .update({
                    optimistic_variation: up.optimistic_variation,
                    pessimistic_variation: up.pessimistic_variation
                })
                .eq('id', up.id)
        );

        await Promise.all(promises);
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

    const InputClass = "bg-transparent outline-none w-full border-b border-transparent focus:border-cyan-500 text-center text-xs";
    const HeaderClass = "px-1 py-2 text-[10px] font-black tracking-widest text-center uppercase";
    const CellClass = "px-1 py-1.5 text-center text-xs";

    // --- Calculation Helper ---
    // Editor is ALWAYS Base Case (multiplier 1)
    const multiplier = 1;

    // Totals logic 
    const unitsToSum = [...units];
    const hasValidNewItem = viewMode === 'editor' && newItem.model_name && newItem.unit_count > 0 && (newItem.avg_price > 0 || (newItem.price_sqft > 0 && newItem.area_sqft > 0));

    if (hasValidNewItem) {
        const pendingAvgPrice = newItem.avg_price || (newItem.price_sqft * newItem.area_sqft);
        unitsToSum.push({
            ...newItem,
            id: 'pending',
            avg_price: pendingAvgPrice
        });
    }

    const totalRevenue = unitsToSum.reduce((acc, u) => acc + (u.unit_count * u.avg_price), 0);
    const totalAreaSellable = unitsToSum.reduce((acc, u) => acc + (u.unit_count * (u.area_sqft || 0)), 0);
    const totalUnits = unitsToSum.reduce((acc, u) => acc + u.unit_count, 0);
    const avgPriceSqft = totalAreaSellable > 0 ? totalRevenue / totalAreaSellable : 0;

    return (
        <div className="space-y-6">

            {/* Main Tabs (View Switcher) */}
            <div className="flex items-center gap-6 border-b border-gray-200">
                <button
                    onClick={() => setViewMode('editor')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${viewMode === 'editor'
                        ? 'border-cyan-500 text-cyan-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    {dict.ui?.editor_title || dict.scenarios?.base || 'Base Case (Editor)'}
                </button>
                <button
                    onClick={() => setViewMode('scenarios')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${viewMode === 'scenarios'
                        ? 'border-cyan-500 text-cyan-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    {dict.ui?.comparison || 'Scenarios & Comparison'}
                </button>
            </div>

            {/* View Content */}
            {viewMode === 'scenarios' ? (
                <UnitMixScenarios
                    units={units}
                    scenarios={scenarios}
                    onUpdateScenario={updateVariation}
                    onSaveVariations={handleSaveVariations}
                    lang={lang}
                    dict={dict}
                />
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-fadeIn">

                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{dict.title}</h3>
                            <p className="text-sm text-gray-500">{dict.subtitle}</p>
                        </div>
                        <div className="flex gap-6 text-right">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">{dict.summary.total_units}</p>
                                <p className="text-lg font-bold text-gray-700">{totalUnits}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold">{dict.summary.gross_revenue}</p>
                                <p className="text-2xl font-bold text-cyan-600">
                                    ${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-600 table-fixed">
                            <colgroup>
                                <col style={{ width: '180px' }} />
                                <col style={{ width: '45px' }} />
                                <col style={{ width: '45px' }} />
                                <col style={{ width: '45px' }} />
                                <col style={{ width: '85px' }} />
                                <col style={{ width: '85px' }} />
                                <col style={{ width: '85px' }} />
                                <col style={{ width: '55px' }} />
                                <col style={{ width: '75px' }} />
                                <col style={{ width: '95px' }} />
                                <col style={{ width: '100px' }} />
                                <col style={{ width: '90px' }} />
                                <col style={{ width: '90px' }} />
                                <col style={{ width: '80px' }} />
                            </colgroup>
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-2 py-2 text-left text-[10px] font-black tracking-widest uppercase">{dict.table.model}</th>
                                    <th className={HeaderClass} title={dict.table.beds}>🛏️</th>
                                    <th className={HeaderClass} title={dict.table.baths}>🚿</th>
                                    <th className={HeaderClass} title={dict.ui?.half_baths}>🚽</th>

                                    <th className={HeaderClass} title={dict.table.area_sellable}>{dict.ui?.living_area}</th>
                                    <th className={HeaderClass} title={dict.table.area_outdoor}>{dict.ui?.outdoor}</th>
                                    <th className={HeaderClass} title={dict.table.area_total}>Total</th>

                                    <th className={HeaderClass}>{dict.table.count}</th>
                                    <th className={HeaderClass}>$/sqft</th>
                                    <th className={HeaderClass}>{dict.table.avg_price}</th>
                                    <th className={HeaderClass}>Total GDV</th>
                                    <th className={HeaderClass} title={dict.ui?.sale_label}>{dict.ui?.sale_label}</th>
                                    <th className={HeaderClass} title={dict.ui?.const_label}>{dict.ui?.const_label}</th>
                                    <th className={HeaderClass} title={dict.model_unit}>M</th>
                                    <th className="px-2 py-2"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {/* Input Row - Always visible in Editor mode */}
                                <tr className="bg-cyan-50/30 hover:bg-cyan-50/50 transition-colors">
                                    <td className="px-2 py-2">
                                        <div className="flex flex-col gap-1">
                                            <input
                                                type="text"
                                                placeholder="Ex: Premium A"
                                                className="bg-transparent outline-none w-full border-b border-transparent focus:border-cyan-500 font-bold text-xs"
                                                value={newItem.model_name}
                                                onChange={e => setNewItem({ ...newItem, model_name: e.target.value })}
                                            />
                                            <FloorPlanSelector
                                                lang={lang}
                                                userId={project.user_id}
                                                onSelect={(plan: FloorPlan) => {
                                                    setNewItem({
                                                        ...newItem,
                                                        model_name: plan.plan_name,
                                                        area_sqft: plan.living_area_sqft || plan.area_sqft || 0,
                                                        area_outdoor: (plan.entry_area_sqft || 0) + (plan.lanai_area_sqft || 0) || plan.area_outdoor || 0,
                                                        area_total: plan.total_const_area_sqft || plan.area_total || 0,
                                                        bedrooms: plan.bedrooms || 0,
                                                        bathrooms: plan.bathrooms || 0,
                                                        half_baths: plan.half_baths || 0,
                                                        suites: plan.suites || 0,
                                                        garages: plan.garages || 0,
                                                        price_sqft: plan.standard_price_sqft || 0,
                                                        avg_price: (plan.standard_price_sqft || 0) * (plan.living_area_sqft || plan.area_sqft || 0),
                                                        construction_duration_months: plan.construction_duration_months || 10,
                                                        subtype_id: plan.subtype_id || ''
                                                    });
                                                }}
                                            />
                                            {newItem.subtype_id && project.subtype_id !== newItem.subtype_id && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[9px] text-amber-700 font-bold animate-pulse mt-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    TIPO DIVERGENTE DO PROJETO
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            className={InputClass}
                                            value={newItem.bedrooms || ''}
                                            placeholder="0"
                                            onChange={e => setNewItem({ ...newItem, bedrooms: parseFloat(e.target.value) || 0 })}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            className={InputClass}
                                            value={newItem.bathrooms || ''}
                                            placeholder="0"
                                            onChange={e => setNewItem({ ...newItem, bathrooms: parseFloat(e.target.value) || 0 })}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            className={InputClass}
                                            value={newItem.half_baths || ''}
                                            placeholder="0"
                                            onChange={e => setNewItem({ ...newItem, half_baths: parseFloat(e.target.value) || 0 })}
                                        />
                                    </td>

                                    {/* Area Under Air */}
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            className={InputClass}
                                            value={newItem.area_sqft || ''}
                                            placeholder="0"
                                            onChange={e => setNewItem({ ...newItem, area_sqft: parseFloat(e.target.value) || 0 })}
                                        />
                                    </td>

                                    {/* Area Outdoor (Non-Conditioned) */}
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            className={InputClass}
                                            value={newItem.area_outdoor || ''}
                                            placeholder="0"
                                            onChange={e => setNewItem({ ...newItem, area_outdoor: parseFloat(e.target.value) || 0 })}
                                        />
                                    </td>

                                    {/* Total Area (Auto-Calc Display) */}
                                    <td className="px-2 py-2 text-center text-gray-500 font-medium">
                                        {((newItem.area_sqft || 0) + (newItem.area_outdoor || 0)).toLocaleString()}
                                    </td>

                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            className={InputClass}
                                            value={newItem.unit_count}
                                            onChange={e => setNewItem({ ...newItem, unit_count: parseFloat(e.target.value) || 1 })}
                                        />
                                    </td>
                                    <td className="px-2 py-2 relative">
                                        <input
                                            type="number"
                                            className={InputClass}
                                            value={newItem.price_sqft || ''}
                                            placeholder="0"
                                            onChange={e => {
                                                const p = parseFloat(e.target.value) || 0;
                                                setNewItem({
                                                    ...newItem,
                                                    price_sqft: p,
                                                    // Auto-calc avg price if area exists
                                                    avg_price: p * (newItem.area_sqft || 0)
                                                })
                                            }}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            className={InputClass}
                                            value={newItem.avg_price || ''}
                                            placeholder="0"
                                            onChange={e => setNewItem({ ...newItem, avg_price: parseFloat(e.target.value) || 0 })}
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center font-bold text-cyan-700">
                                        ${(newItem.unit_count * newItem.avg_price).toLocaleString()}
                                    </td>
                                    <td className="px-1 py-2">
                                        <input
                                            type="month"
                                            className="bg-transparent outline-none w-full border-b border-transparent focus:border-cyan-500 text-[9px] font-bold text-gray-400 uppercase"
                                            placeholder="--/--"
                                            value={newItem.sale_date ? newItem.sale_date.slice(0, 7) : ''}
                                            onChange={e => setNewItem({ ...newItem, sale_date: e.target.value })}
                                        />
                                    </td>
                                    <td className="px-1 py-2">
                                        <input
                                            type="month"
                                            className="bg-transparent outline-none w-full border-b border-transparent focus:border-cyan-500 text-[9px] font-bold text-gray-400 uppercase"
                                            placeholder="--/--"
                                            value={newItem.construction_start_date ? newItem.construction_start_date.slice(0, 7) : ''}
                                            onChange={e => setNewItem({ ...newItem, construction_start_date: e.target.value })}
                                        />
                                    </td>
                                    <td className="px-1 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-cyan-600"
                                            checked={newItem.is_model_unit}
                                            onChange={e => setNewItem({ ...newItem, is_model_unit: e.target.checked })}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <button
                                            onClick={handleAddUnit}
                                            className="bg-cyan-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 hover:bg-cyan-700 transition-all shadow-sm font-bold text-xs"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                            {dict.ui?.save_btn || 'Save'}
                                        </button>
                                    </td>
                                </tr>

                                {/* Existing Units */}
                                {units.map((unit) => {
                                    const isEditing = editingId === unit.id;
                                    const item = isEditing ? editItem : unit;

                                    // Base Case View (No multipliers)
                                    const displayAvgPrice = item.avg_price;
                                    const displayPriceSqft = item.area_sqft > 0 ? (displayAvgPrice / item.area_sqft) : 0;
                                    const displayTotalArea = (item.area_sqft || 0) + (item.area_outdoor || 0);

                                    if (isEditing) {
                                        return (
                                            <tr key={unit.id} className="bg-amber-50/50">
                                                <td className="px-4 py-2">
                                                    <input type="text" className={InputClass} value={editItem.model_name} onChange={e => setEditItem({ ...editItem, model_name: e.target.value })} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="number" className={InputClass} value={editItem.bedrooms} onChange={e => setEditItem({ ...editItem, bedrooms: parseFloat(e.target.value) })} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="number" className={InputClass} value={editItem.bathrooms} onChange={e => setEditItem({ ...editItem, bathrooms: parseFloat(e.target.value) || 0 })} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="number" className={InputClass} value={editItem.half_baths || 0} onChange={e => setEditItem({ ...editItem, half_baths: parseFloat(e.target.value) || 0 })} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="number" className={InputClass} value={editItem.area_sqft} onChange={e => setEditItem({ ...editItem, area_sqft: parseFloat(e.target.value), avg_price: (editItem.price_sqft || 0) * parseFloat(e.target.value) })} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="number" className={InputClass} value={editItem.area_outdoor} onChange={e => setEditItem({ ...editItem, area_outdoor: parseFloat(e.target.value) })} />
                                                </td>
                                                <td className="px-2 py-2 text-center text-gray-500">{displayTotalArea}</td>
                                                <td className="px-2 py-2">
                                                    <input type="number" className={InputClass} value={editItem.unit_count} onChange={e => setEditItem({ ...editItem, unit_count: parseFloat(e.target.value) })} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="number" className={InputClass} value={editItem.price_sqft} onChange={e => setEditItem({ ...editItem, price_sqft: parseFloat(e.target.value), avg_price: parseFloat(e.target.value) * (editItem.area_sqft || 0) })} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="number" className={InputClass} value={editItem.avg_price} onChange={e => setEditItem({ ...editItem, avg_price: parseFloat(e.target.value) })} />
                                                </td>
                                                <td className="px-2 py-2 text-center font-bold text-amber-700">${(editItem.unit_count * editItem.avg_price).toLocaleString()}</td>
                                                <td className="px-2 py-2">
                                                    <input type="month" className="bg-transparent outline-none w-full text-[10px] font-bold text-gray-600 uppercase border-b border-amber-500" value={editItem.sale_date ? editItem.sale_date.slice(0, 7) : ''} onChange={e => setEditItem({ ...editItem, sale_date: e.target.value })} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="month" className="bg-transparent outline-none w-full text-[10px] font-bold text-gray-600 uppercase border-b border-amber-500" value={editItem.construction_start_date ? editItem.construction_start_date.slice(0, 7) : ''} onChange={e => setEditItem({ ...editItem, construction_start_date: e.target.value })} />
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <input type="checkbox" checked={editItem.is_model_unit} onChange={e => setEditItem({ ...editItem, is_model_unit: e.target.checked })} />
                                                </td>
                                                <td className="px-4 py-2 flex gap-2 justify-end">
                                                    <button onClick={handleUpdateUnit} className="text-green-600 font-bold text-xs uppercase">OK</button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-400 font-bold text-xs uppercase">X</button>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <tr key={unit.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-2 py-3 font-bold text-gray-900 text-xs">{unit.model_name}</td>
                                            <td className={CellClass}>{unit.bedrooms}</td>
                                            <td className={CellClass}>{unit.bathrooms}</td>
                                            <td className={CellClass}>{unit.half_baths || 0}</td>

                                            <td className={CellClass}>{unit.area_sqft?.toLocaleString()}</td>
                                            <td className={CellClass}>{unit.area_outdoor?.toLocaleString() || '0'}</td>
                                            <td className={CellClass}>{displayTotalArea.toLocaleString()}</td>

                                            <td className={CellClass}>{unit.unit_count}</td>
                                            <td className={CellClass}>
                                                ${displayPriceSqft.toFixed(0)}
                                            </td>
                                            <td className={CellClass}>
                                                ${displayAvgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </td>
                                            <td className="px-2 py-3 text-center font-semibold text-gray-900">
                                                ${(unit.unit_count * displayAvgPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </td>
                                            <td className="px-2 py-3 text-center text-[10px] font-bold text-gray-400 uppercase">
                                                {unit.sale_date ? format(new Date(unit.sale_date + 'T12:00:00'), 'MMM yy') : '-'}
                                            </td>
                                            <td className="px-2 py-3 text-center text-[10px] font-bold text-gray-400 uppercase">
                                                {unit.construction_start_date ? format(new Date(unit.construction_start_date + 'T12:00:00'), 'MMM yy') : '-'}
                                            </td>
                                            <td className="px-2 py-3 text-center text-[10px] font-bold text-gray-400">
                                                {unit.is_model_unit ? '⭐' : ''}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(unit.id);
                                                            setEditItem({ ...unit });
                                                        }}
                                                        className="text-cyan-600 hover:text-cyan-800 text-xs font-bold uppercase transition-colors"
                                                    >
                                                        {dict.ui?.edit_btn || 'Edit'}
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(unit.id)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gray-50 font-bold text-gray-800 border-t-2 border-gray-100">
                                <tr>
                                    <td colSpan={4} className="px-4 py-4 text-right text-gray-400 font-bold uppercase tracking-wider text-[10px]">Totals / Avg:</td>
                                    <td className={CellClass}>{totalAreaSellable.toLocaleString()}</td>
                                    <td className={CellClass}>-</td>
                                    <td className={CellClass}>-</td>

                                    <td className={CellClass}>{totalUnits}</td>
                                    <td className={CellClass}>${avgPriceSqft.toFixed(0)}</td>
                                    <td className={CellClass}>-</td>
                                    <td className="px-2 py-3 text-center text-cyan-700 font-extrabold text-base">
                                        ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-100 flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        <div className="flex gap-4">
                            <span>* {dict.table.area_sellable} {dict.table.revenue_calc_note}.</span>
                            <span className="text-cyan-600 italic">** {dict.table.sale_dates_note}</span>
                        </div>
                        <span>{dict.summary.total_area}: <strong>{totalAreaSellable.toLocaleString()} sqft</strong></span>
                    </div>

                    <ConfirmModal
                        isOpen={deleteModalOpen}
                        onClose={() => setDeleteModalOpen(false)}
                        onConfirm={handleDelete}
                        title="BrixAurea"
                        message={dict.ui?.delete_msg || 'Are you sure?'}
                        confirmText={dict.ui?.save_btn || 'Delete'}
                        cancelText={dict.ui?.cancel_btn || 'Cancel'}
                        isDestructive={true}
                    />
                </div>
            )}
        </div>
    );
}
