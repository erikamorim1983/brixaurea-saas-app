import { useState, useEffect } from 'react';

interface Scenario {
    id: string;
    name: string;
    key: 'optimistic' | 'base' | 'pessimistic';
    variation_percent: number;
}

interface UnitUpdate {
    id: string;
    optimistic_variation: number | null;
    pessimistic_variation: number | null;
}

interface UnitMixScenariosProps {
    units: any[];
    scenarios: Scenario[];
    onUpdateScenario: (id: string, percent: number) => void;
    onSaveVariations: (updates: UnitUpdate[]) => Promise<void>;
    lang: string;
    dict: any;
}

export default function UnitMixScenarios({ units, scenarios, onUpdateScenario, onSaveVariations, lang, dict }: UnitMixScenariosProps) {
    const optimistic = scenarios.find(s => s.key === 'optimistic');
    const pessimistic = scenarios.find(s => s.key === 'pessimistic');

    const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    const formatNumber = (val: number) => val.toLocaleString();

    // Local Draft State
    const [overrides, setOverrides] = useState<Record<string, { opt: number | null, pess: number | null }>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Helpers
    const getMultiplier = (globalPercent: number, override: number | null | undefined) => {
        const percent = override !== null && override !== undefined ? override : globalPercent;
        return 1 + (percent / 100);
    };

    const optPercent = optimistic?.variation_percent || 0;
    const pessPercent = pessimistic?.variation_percent || 0;

    const handleLocalChange = (unitId: string, field: 'opt' | 'pess', value: number | null) => {
        setOverrides(prev => {
            // Get current effective value (or what's in local state)
            const currentOpt = prev[unitId]?.opt !== undefined ? prev[unitId].opt : (units.find(u => u.id === unitId)?.optimistic_variation ?? null);
            const currentPess = prev[unitId]?.pess !== undefined ? prev[unitId].pess : (units.find(u => u.id === unitId)?.pessimistic_variation ?? null);

            const newItem = {
                opt: field === 'opt' ? value : currentOpt,
                pess: field === 'pess' ? value : currentPess
            };

            return { ...prev, [unitId]: newItem };
        });
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updates: UnitUpdate[] = Object.entries(overrides).map(([id, ov]) => ({
                id,
                optimistic_variation: ov.opt,
                pessimistic_variation: ov.pess
            }));

            await onSaveVariations(updates);

            // On success
            setOverrides({});
            setHasChanges(false);
        } catch (e) {
            console.error("Failed to save", e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setOverrides({});
        setHasChanges(false);
    };

    // Derived Calculation with Overrides
    const getUnitVariation = (u: any) => {
        const override = overrides[u.id];
        // If we have a local override, use it. Otherwise use the prop.
        // Careful: override.opt could be 'null', which IS a valid override (meaning "use default"). 
        // We need to know if the key exists in overrides.

        const opt = override && override.opt !== undefined ? override.opt : u.optimistic_variation;
        const pess = override && override.pess !== undefined ? override.pess : u.pessimistic_variation;

        return { opt, pess };
    };

    const { baseRevenue, optRevenue, pessRevenue, totalUnits } = (() => {
        let b = 0, o = 0, p = 0, t = 0;
        units.forEach(u => {
            t += u.unit_count;
            const baseVal = u.unit_count * u.avg_price;
            b += baseVal;

            const { opt, pess } = getUnitVariation(u);

            o += baseVal * getMultiplier(optPercent, opt);
            p += baseVal * getMultiplier(pessPercent, pess);
        });
        return { baseRevenue: b, optRevenue: o, pessRevenue: p, totalUnits: t };
    })();


    const inputsClass = "bg-white border border-gray-200 rounded px-2 py-1 text-xs w-16 text-center font-bold focus:ring-2 focus:ring-cyan-500 outline-none";
    const cellInputClass = "bg-transparent border-b border-gray-300 w-12 text-center text-xs focus:border-cyan-500 outline-none p-1 font-medium transition-colors";

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-fadeIn overflow-hidden relative">
            {/* Save Bar Overlay or Top Section */}
            <div className={`border-b p-3 flex justify-between items-center px-6 transition-colors ${hasChanges ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-2">
                    {hasChanges ? (
                        <>
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className="text-sm font-medium text-amber-800">You have unsaved changes.</span>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-green-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            <span className="text-sm font-medium">Synced</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    {hasChanges && (
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded border border-transparent transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className={`px-4 py-1.5 text-xs font-bold rounded shadow-sm transition-colors flex items-center gap-2 ${hasChanges
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isSaving && <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        Save Comparison
                    </button>
                </div>
            </div>

            {/* BrixAurea Intelligence Branding */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-80">BrixAurea Intelligence</span>
                    <div className="h-4 w-px bg-white/20"></div>
                    <span className="text-[10px] text-cyan-100 font-medium">Scenario Modeling Patterns</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-white/40"></div>
                    <div className="w-1 h-1 rounded-full bg-white/60"></div>
                    <div className="w-1 h-1 rounded-full bg-white/80"></div>
                </div>
            </div>

            {/* Scenarios Header/Controls */}
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-col sm:flex-row gap-6 justify-between items-center text-sm">
                <div className="flex gap-8">
                    {/* Optimistic Control */}
                    <div>
                        <p className="font-bold text-gray-700 mb-1">{optimistic?.name || 'Optimistic'}</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            <span className="text-gray-500 text-xs">Variation:</span>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={optimistic?.variation_percent || 0}
                                    onChange={(e) => optimistic && onUpdateScenario(optimistic.id, parseFloat(e.target.value) || 0)}
                                    className={`${inputsClass} text-green-700`}
                                />
                                <span className="absolute right-1 top-1 text-xs text-gray-400 font-normal">%</span>
                            </div>
                        </div>
                    </div>

                    {/* Pessimistic Control */}
                    <div>
                        <p className="font-bold text-gray-700 mb-1">{pessimistic?.name || 'Pessimistic'}</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <span className="text-gray-500 text-xs">Variation:</span>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={pessimistic?.variation_percent || 0}
                                    onChange={(e) => pessimistic && onUpdateScenario(pessimistic.id, parseFloat(e.target.value) || 0)}
                                    className={`${inputsClass} text-red-700`}
                                />
                                <span className="absolute right-1 top-1 text-xs text-gray-400 font-normal">%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Total GDV Delta</p>
                    <div className="flex gap-4 text-xs font-bold">
                        <span className="text-green-600">
                            +{(optRevenue - baseRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-red-600">
                            {(pessRevenue - baseRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto relative">
                <table className="w-full text-left text-xs">
                    <thead>
                        {/* Top Header Grouping */}
                        <tr className="bg-gray-100 border-b border-gray-200 uppercase text-[10px] tracking-wider font-bold text-gray-500">
                            <th colSpan={5} className="px-4 py-2 text-center border-r border-gray-200">
                                {lang === 'pt' ? 'Caso Base' : 'Base Case'}
                            </th>
                            <th colSpan={5} className="px-4 py-2 text-center border-r border-gray-200 bg-green-50 text-green-800">
                                {optimistic?.name || 'Optimistic'} ({optimistic?.variation_percent}%)
                            </th>
                            <th colSpan={5} className="px-4 py-2 text-center bg-red-50 text-red-800">
                                {pessimistic?.name || 'Pessimistic'} ({pessimistic?.variation_percent}%)
                            </th>
                        </tr>
                        {/* Columns */}
                        <tr className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
                            {/* Base Cols */}
                            <th className="px-4 py-3 min-w-[120px]">{dict.table.model}</th>
                            <th className="px-2 py-3 text-center">{dict.table.count}</th>
                            <th className="px-2 py-3 text-center">$/ft²</th>
                            <th className="px-2 py-3 text-center">{dict.table.avg_price}</th>
                            <th className="px-2 py-3 text-center border-r border-gray-200 font-bold text-gray-800">{dict.table.total_vgv}</th>

                            {/* Optimistic Cols */}
                            <th className="px-2 py-3 text-center bg-green-50/50 w-16">Variation</th>
                            <th className="px-2 py-3 text-center bg-green-50/50">$/ft²</th>
                            <th className="px-2 py-3 text-center bg-green-50/50">{dict.table.avg_price}</th>
                            <th className="px-2 py-3 text-center font-bold text-green-700 bg-green-50/50">{dict.table.total_vgv}</th>
                            <th className="px-2 py-3 text-center border-r border-gray-200 font-bold text-green-800 bg-green-50/50 w-24">Delta</th>

                            {/* Pessimistic Cols */}
                            <th className="px-2 py-3 text-center bg-red-50/50 w-16">Variation</th>
                            <th className="px-2 py-3 text-center bg-red-50/50">$/ft²</th>
                            <th className="px-2 py-3 text-center bg-red-50/50">{dict.table.avg_price}</th>
                            <th className="px-2 py-3 text-center font-bold text-red-700 bg-red-50/50">{dict.table.total_vgv}</th>
                            <th className="px-2 py-3 text-center font-bold text-red-800 bg-red-50/50 w-24">Delta</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {units.map((unit) => {
                            const basePriceSqft = unit.area_sqft > 0 ? (unit.avg_price / unit.area_sqft) : 0;
                            const baseGDV = unit.unit_count * unit.avg_price;

                            const { opt, pess } = getUnitVariation(unit);

                            // Optimistic Logic
                            const optMult = getMultiplier(optPercent, opt);
                            const optPrice = unit.avg_price * optMult;
                            const optPriceSqft = basePriceSqft * optMult;
                            const optGDV = unit.unit_count * optPrice;
                            const optDelta = optGDV - baseGDV;

                            // Pessimistic Logic
                            const pessMult = getMultiplier(pessPercent, pess);
                            const pessPrice = unit.avg_price * pessMult;
                            const pessPriceSqft = basePriceSqft * pessMult;
                            const pessGDV = unit.unit_count * pessPrice;
                            const pessDelta = pessGDV - baseGDV;

                            return (
                                <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                                    {/* Base */}
                                    <td className="px-4 py-3 font-medium text-gray-800 truncate max-w-[150px]" title={unit.model_name}>{unit.model_name}</td>
                                    <td className="px-2 py-3 text-center">{unit.unit_count}</td>
                                    <td className="px-2 py-3 text-center text-gray-500">${basePriceSqft.toFixed(0)}</td>
                                    <td className="px-2 py-3 text-center text-gray-500">{formatNumber(unit.avg_price)}</td>
                                    <td className="px-2 py-3 text-center border-r border-gray-200 font-medium bg-gray-50/30">
                                        {formatCurrency(baseGDV)}
                                    </td>

                                    {/* Optimistic */}
                                    <td className="px-2 py-3 text-center bg-green-50/10">
                                        <div className="relative inline-block w-full">
                                            <input
                                                type="number"
                                                className={`${cellInputClass} ${opt !== null ? 'text-green-700 font-bold border-green-300 bg-white shadow-sm' : 'text-gray-400 border-transparent hover:border-gray-200'}`}
                                                placeholder={`${optPercent}%`}
                                                value={opt ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                                    handleLocalChange(unit.id, 'opt', val);
                                                }}
                                            />
                                            <span className="text-[9px] text-gray-400 absolute right-0 top-1.5 pointer-events-none pr-1">%</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 text-center text-green-600 bg-green-50/10">${optPriceSqft.toFixed(0)}</td>
                                    <td className="px-2 py-3 text-center text-green-600 bg-green-50/10">{formatNumber(optPrice)}</td>
                                    <td className="px-2 py-3 text-center font-medium bg-green-50/20 text-green-800">
                                        {formatCurrency(optGDV)}
                                    </td>
                                    <td className="px-2 py-3 text-center border-r border-gray-200 font-bold text-xs bg-green-100/50 text-green-900 border-green-200">
                                        +{formatNumber(optDelta)}
                                    </td>

                                    {/* Pessimistic */}
                                    <td className="px-2 py-3 text-center bg-red-50/10">
                                        <div className="relative inline-block w-full">
                                            <input
                                                type="number"
                                                className={`${cellInputClass} ${pess !== null ? 'text-red-700 font-bold border-red-300 bg-white shadow-sm' : 'text-gray-400 border-transparent hover:border-gray-200'}`}
                                                placeholder={`${pessPercent}%`}
                                                value={pess ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                                    handleLocalChange(unit.id, 'pess', val);
                                                }}
                                            />
                                            <span className="text-[9px] text-gray-400 absolute right-0 top-1.5 pointer-events-none pr-1">%</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 text-center text-red-600 bg-red-50/10">${pessPriceSqft.toFixed(0)}</td>
                                    <td className="px-2 py-3 text-center text-red-600 bg-red-50/10">{formatNumber(pessPrice)}</td>
                                    <td className="px-2 py-3 text-center font-medium bg-red-50/20 text-red-800">
                                        {formatCurrency(pessGDV)}
                                    </td>
                                    <td className="px-2 py-3 text-center font-bold text-xs bg-red-100/50 text-red-900 border-red-200">
                                        {formatNumber(pessDelta)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-gray-100 border-t-2 border-gray-200 font-bold text-gray-800">
                        <tr>
                            <td className="px-4 py-3 text-right text-[10px] uppercase text-gray-500">Totals</td>
                            <td className="px-2 py-3 text-center">{totalUnits}</td>
                            <td className="px-2 py-3 text-center">-</td>
                            <td className="px-2 py-3 text-center">-</td>
                            <td className="px-2 py-3 text-center border-r border-gray-300 text-gray-900 text-sm">
                                {formatCurrency(baseRevenue)}
                            </td>

                            {/* Opt Totals */}
                            <td className="bg-green-50/30"></td>
                            <td colSpan={2} className="bg-green-50/30"></td>
                            <td className="px-2 py-3 text-center text-green-700 text-sm bg-green-50/30">
                                {formatCurrency(optRevenue)}
                            </td>
                            <td className="px-2 py-3 text-center border-r border-gray-300 text-green-900 text-xs bg-green-100/50">
                                +{formatNumber(optRevenue - baseRevenue)}
                            </td>

                            {/* Pess Totals */}
                            <td className="bg-red-50/30"></td>
                            <td colSpan={2} className="bg-red-50/30"></td>
                            <td className="px-2 py-3 text-center text-red-700 text-sm bg-red-50/30">
                                {formatCurrency(pessRevenue)}
                            </td>
                            <td className="px-2 py-3 text-center text-red-900 text-xs bg-red-100/50">
                                {formatNumber(pessRevenue - baseRevenue)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
