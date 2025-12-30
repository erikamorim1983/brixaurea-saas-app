'use client';

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useCallback } from "react";

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
    const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
    const [baseScenarioId, setBaseScenarioId] = useState<string | null>(null);
    const [units, setUnits] = useState<any[]>([]); // Always stores BASE units

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
        suites: 0,
        garages: 0
    });

    const dict = dictionary.analysis.units; // Shortcut

    // 1. Initialize Financial Scenarios (Optimistic, Base, Pessimistic)
    const initScenarios = useCallback(async () => {
        try {
            // Check existing
            const { data: existing } = await supabase
                .from('financial_scenarios')
                .select('id, name, variation_percent')
                .eq('project_id', project.id)
                .order('created_at');

            const keys: { key: 'optimistic' | 'base' | 'pessimistic', name: string }[] = [
                { key: 'optimistic', name: 'Optimistic' },
                { key: 'base', name: 'Base Case' },
                { key: 'pessimistic', name: 'Pessimistic' }
            ];

            const finalScenarios: Scenario[] = [];

            for (const k of keys) {
                let found = existing?.find(e => e.name === k.name);
                if (!found) {
                    const { data: created } = await supabase
                        .from('financial_scenarios')
                        .insert({
                            project_id: project.id,
                            name: k.name,
                            gross_sales_projected: 0,
                            variation_percent: 0
                        })
                        .select()
                        .single();
                    if (created) found = created;
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
                // Default active to Base if not set
                if (!activeScenarioId) setActiveScenarioId(baseId);
                // ALWAYS fetch units from Base
                fetchUnits(baseId);
            }
        } catch (err) {
            console.error('Error initializing scenarios:', err);
        }
    }, [project.id, supabase, activeScenarioId]);

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
                area_total: finalTotalArea,
                avg_price: finalAvgPrice
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
                suites: 0,
                garages: 0
            });
            fetchUnits(baseScenarioId);
        } else {
            console.error(error);
            alert("Error adding unit. Ensure migration is run.");
        }
    };

    // 5. Delete Unit
    const handleDelete = async (id: string) => {
        await supabase.from('units_mix').delete().eq('id', id);
        if (baseScenarioId) fetchUnits(baseScenarioId);
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

    const InputClass = "bg-transparent outline-none w-full border-b border-transparent focus:border-cyan-500 text-center";
    const HeaderClass = "px-2 py-3 text-xs font-semibold tracking-wider text-center";
    const CellClass = "px-2 py-3 text-center text-sm";

    // --- Calculation Helper ---
    const activeScenario = scenarios.find(s => s.id === activeScenarioId);
    const variation = activeScenario?.variation_percent || 0;
    const isBase = activeScenario?.key === 'base';

    const multiplier = 1 + (variation / 100);

    const calcPrice = (unitPrice: number) => unitPrice * multiplier;
    // Price Sqft is typically calculated on Sellable Area (Under Air)
    const calcPriceSqft = (priceSqft: number) => priceSqft * multiplier;

    // Totals logic with current multiplier applied
    const totalRevenue = units.reduce((acc, u) => acc + (u.unit_count * calcPrice(u.avg_price)), 0);
    const totalAreaSellable = units.reduce((acc, u) => acc + (u.unit_count * (u.area_sqft || 0)), 0);
    const totalUnits = units.reduce((acc, u) => acc + u.unit_count, 0);
    const avgPriceSqft = totalAreaSellable > 0 ? totalRevenue / totalAreaSellable : 0;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-fadeIn">

            {/* Scenarios Tabs */}
            <div className="border-b border-gray-100 px-6 pt-4 flex space-x-6 items-end">
                {scenarios.map(s => {
                    const isActive = activeScenarioId === s.id;
                    const isBaseTab = s.key === 'base';

                    return (
                        <div key={s.id} className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${isActive ? 'border-cyan-500' : 'border-transparent'}`}>
                            <button
                                onClick={() => setActiveScenarioId(s.id)}
                                className={`text-sm font-medium ${isActive ? 'text-cyan-700' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {s.name}
                            </button>

                            {/* Percentage Input (Hidden for Base) */}
                            {isActive && !isBaseTab && (
                                <div className="flex items-center bg-gray-100 rounded px-2 py-0.5 text-xs">
                                    <input
                                        type="number"
                                        value={s.variation_percent}
                                        onChange={(e) => updateVariation(s.id, parseFloat(e.target.value) || 0)}
                                        className="w-10 bg-transparent text-right outline-none font-bold text-gray-700"
                                    />
                                    <span className="text-gray-500 ml-0.5">%</span>
                                </div>
                            )}
                            {/* Display Percentage for inactive non-base tabs */}
                            {!isActive && !isBaseTab && (
                                <span className="text-xs text-gray-300">({s.variation_percent}%)</span>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{dict.title}</h3>
                    <p className="text-sm text-gray-500">{dict.subtitle}</p>
                    {!isBase && (
                        <div className="mt-2 text-xs bg-cyan-50 text-cyan-800 px-2 py-1 rounded inline-block">
                            Values adjusted by <strong>{variation > 0 ? '+' : ''}{variation}%</strong> from Base Case.
                        </div>
                    )}
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
                <table className="w-full text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider">{dict.table.model}</th>
                            <th className={HeaderClass}>{dict.table.beds}</th>
                            <th className={HeaderClass}>{dict.table.baths}</th>

                            {/* THREE COLUMNS requested */}
                            <th className={HeaderClass}>{dict.table.area_sellable}</th>
                            <th className={HeaderClass}>{dict.table.area_outdoor}</th>
                            <th className={HeaderClass}>{dict.table.area_total}</th>

                            <th className={HeaderClass}>{dict.table.count}</th>
                            <th className={HeaderClass}>{dict.table.price_sqft}</th>
                            <th className={HeaderClass}>{dict.table.avg_price}</th>
                            <th className={HeaderClass}>{dict.table.total_vgv}</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {/* Input Row - ONLY show for Base Case */}
                        {isBase && (
                            <tr className="bg-cyan-50/30 hover:bg-cyan-50/50 transition-colors">
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Ex: Premium A"
                                        className="bg-transparent outline-none w-full border-b border-transparent focus:border-cyan-500 font-medium"
                                        value={newItem.model_name}
                                        onChange={e => setNewItem({ ...newItem, model_name: e.target.value })}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        className={InputClass}
                                        value={newItem.bedrooms || ''}
                                        placeholder="0"
                                        onChange={e => setNewItem({ ...newItem, bedrooms: parseFloat(e.target.value) })}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        className={InputClass}
                                        value={newItem.bathrooms || ''}
                                        placeholder="0"
                                        onChange={e => setNewItem({ ...newItem, bathrooms: parseFloat(e.target.value) })}
                                    />
                                </td>

                                {/* Area Under Air */}
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        className={InputClass}
                                        value={newItem.area_sqft || ''}
                                        placeholder="0"
                                        onChange={e => setNewItem({ ...newItem, area_sqft: parseFloat(e.target.value) })}
                                    />
                                </td>

                                {/* Area Outdoor (Non-Conditioned) */}
                                <td className="px-2 py-2">
                                    <input
                                        type="number"
                                        className={InputClass}
                                        value={newItem.area_outdoor || ''}
                                        placeholder="0"
                                        onChange={e => setNewItem({ ...newItem, area_outdoor: parseFloat(e.target.value) })}
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
                                        onChange={e => setNewItem({ ...newItem, unit_count: parseFloat(e.target.value) })}
                                    />
                                </td>
                                <td className="px-2 py-2 relative">
                                    <input
                                        type="number"
                                        className={InputClass}
                                        value={newItem.price_sqft || ''}
                                        placeholder="0"
                                        onChange={e => {
                                            const p = parseFloat(e.target.value);
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
                                        onChange={e => setNewItem({ ...newItem, avg_price: parseFloat(e.target.value) })}
                                    />
                                </td>
                                <td className="px-2 py-2 text-center font-bold text-cyan-700">
                                    ${(newItem.unit_count * newItem.avg_price).toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <button
                                        onClick={handleAddUnit}
                                        className="bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-cyan-700 transition-colors shadow-sm"
                                    >
                                        +
                                    </button>
                                </td>
                            </tr>
                        )}

                        {/* Existing Units */}
                        {units.map((unit) => {
                            // Apply multiplier derived from active scenario
                            const displayAvgPrice = calcPrice(unit.avg_price);
                            const displayPriceSqft = unit.area_sqft > 0 ? (displayAvgPrice / unit.area_sqft) : 0;
                            // Calculate dynamic total area for display if needed, or use stored
                            const displayTotalArea = (unit.area_sqft || 0) + (unit.area_outdoor || 0);

                            return (
                                <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">{unit.model_name}</td>
                                    <td className={CellClass}>{unit.bedrooms}</td>
                                    <td className={CellClass}>{unit.bathrooms}</td>

                                    <td className={CellClass}>{unit.area_sqft?.toLocaleString()}</td>
                                    <td className={CellClass}>{unit.area_outdoor?.toLocaleString() || '0'}</td>
                                    <td className={CellClass}>{displayTotalArea.toLocaleString()}</td>

                                    <td className={CellClass}>{unit.unit_count}</td>
                                    <td className={`${CellClass} ${!isBase ? 'text-cyan-600 font-medium' : ''}`}>
                                        ${displayPriceSqft.toFixed(0)}
                                    </td>
                                    <td className={`${CellClass} ${!isBase ? 'text-cyan-600 font-medium' : ''}`}>
                                        ${displayAvgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-2 py-3 text-center font-semibold text-gray-900">
                                        ${(unit.unit_count * displayAvgPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {isBase && (
                                            <button
                                                onClick={() => handleDelete(unit.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-50 font-semibold text-gray-700">
                        <tr>
                            <td colSpan={5} className="px-4 py-3 text-right">Totals / Avg:</td>
                            <td className={CellClass}>-</td>{/* Outdoor Total */}
                            <td className={CellClass}>{/* Total Area Total - Optional */}</td>
                            <td className={CellClass}>{totalUnits}</td>
                            <td className={CellClass}>${avgPriceSqft.toFixed(0)}</td>
                            <td className={CellClass}>-</td>
                            <td className="px-2 py-3 text-center text-cyan-700">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>* {dict.table.area_sellable} used for Revenue calculation.</span>
                <span>{dict.summary.total_area}: <strong>{totalAreaSellable.toLocaleString()} sqft</strong></span>
            </div>
        </div>
    );
}
