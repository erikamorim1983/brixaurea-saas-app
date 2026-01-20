'use client';

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useMemo } from "react";
import { usePropertyTypes } from "@/hooks/usePropertyTypes";
import { format, addMonths, startOfMonth } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Bar,
    Line,
    ComposedChart
} from 'recharts';

interface SalesStrategyConfigProps {
    project: any;
    location: any;
    lang: string;
    dictionary: any;
}

export default function SalesStrategyConfig({ project, location, lang, dictionary }: SalesStrategyConfigProps) {
    const supabase = createClient();
    const { subtypes, standards, loading: typesLoading } = usePropertyTypes(lang);
    const [loading, setLoading] = useState(true);
    const [scenarioId, setScenarioId] = useState<string | null>(null);
    const [marketMetrics, setMarketMetrics] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [unitsData, setUnitsData] = useState({ totalUnits: 0, totalGDV: 0 });
    const [detailedUnits, setDetailedUnits] = useState<any[]>([]);

    // State for assumptions
    const [assumptions, setAssumptions] = useState({
        commission_rate: 6.0,
        marketing_cost_percent: 2.0,
        sales_start_offset: 0,
        sales_duration_months: 24,
        absorption_rate_monthly: 0.0, // % of units sold per month
        study_date: format(new Date(), 'yyyy-MM-dd'),
        manual_absorption_curve: null as number[] | null,
        deposit_structure: {
            initial_deposit: 10,
            second_deposit: 10,
            closing_funding: 80
        },
        // Schedule Info for Cash-In
        pre_construction_months: 6,
        construction_months: 18,
        delivery_start_offset: 24
    });

    const dict = dictionary.analysis.sales || {
        title: "Estratégia de Vendas & Recebimentos",
        subtitle: "Configure a velocidade de vendas e o fluxo de recebimentos (Tabela de Vendas).",
        velocity_title: "Velocidade de Vendas (Absorção)",
        payment_title: "Estrutura de Pagamentos (Tabela)",
        start_month: "Mês de Início das Vendas",
        units_per_month: "Unidades/Mes ou %",
        commission: "Comissões (%)",
        marketing: "Marketing (%)",
        deposit_initial: "Entrada (Down Payment)",
        deposit_construction: "Durante Obra",
        deposit_closing: "Nas Chaves / Financiamento",
        save: "Salvar Configuração",
        suggested_title: "BrixAurea Intelligence",
        suggested_desc: "Basado na tipologia, liquidez e padrão do projeto.",
        apply_suggestion: "Aplicar Sugestão",
        scenario: "Cenário",
        scenarios: {
            optimistic: "Otimista",
            balanced: "Equilibrado",
            pessimistic: "Conservador"
        },
        total_gdv: "TOTAL REVENUE (GDV)",
        total_units: "TOTAL UNIDADES",
        distribute_remaining: "DISTRIBUIR RESTANTE",
        units: "Unidades",
        absorption_config: "CONFIGURAÇÃO DE ABSORÇÃO",
        sales_costs: "CUSTOS DE VENDA",
        macro_schedule: "Macro Cronograma",
        units_sold: "Unidades Vendidas",
        predicted_duration: "Duração Prevista",
        months_label: "MESES",
        fine_tuning: "Ajuste Fino",
        offset_hint: "Deslocamento em meses",
        by_month: "VENDAS MÊS A MÊS",
        reset_linear: "RESETAR PARA LINEAR"
    };

    useEffect(() => {
        const load = async () => {
            // 1. Fetch available scenarios for this project
            const { data: scenarios } = await supabase
                .from('financial_scenarios')
                .select('*')
                .eq('project_id', project.id);

            // Prioritize scenario_type, fallback to name-based logic
            const data = scenarios?.find(s => s.scenario_type === 'base') ||
                scenarios?.find(s => s.name === (dictionary.analysis.units?.scenarios?.base || 'Base Case')) ||
                scenarios?.find(s => s.name === 'Base Case') ||
                scenarios?.[0];

            if (data) {
                setScenarioId(data.id);
                setAssumptions(prev => ({
                    ...prev,
                    commission_rate: data.commission_rate || 6.0,
                    absorption_rate_monthly: data.absorption_rate_monthly || 0.0,
                    sales_start_offset: data.sales_start_offset || 0,
                    sales_duration_months: data.sales_duration_months || 24,
                    marketing_cost_percent: data.marketing_cost_percent || 2.0,
                    deposit_structure: data.deposit_structure || prev.deposit_structure,
                    study_date: data.study_date || prev.study_date,
                    manual_absorption_curve: data.manual_absorption_curve || null,
                    pre_construction_months: data.pre_construction_months || 6,
                    construction_months: data.construction_months || 18,
                    delivery_start_offset: data.delivery_start_offset || 24
                }));

                // 2. Fetch units count and GDV from the found scenario
                const { data: units } = await supabase
                    .from('units_mix')
                    .select('*')
                    .eq('scenario_id', data.id);

                if (units && units.length > 0) {
                    setDetailedUnits(units);
                    const totalUnits = units.reduce((acc, u) => acc + (u.unit_count || 0), 0);
                    const totalGDV = units.reduce((acc, u) => acc + ((u.unit_count || 0) * (u.avg_price || 0)), 0);
                    setUnitsData({ totalUnits, totalGDV });
                }
            }

            // 2. Fetch Market Intelligence Data (Zillow Simulation)
            if (location?.city) {
                const { data: metrics } = await supabase
                    .from('market_intelligence_data')
                    .select('*')
                    .eq('city', location.city)
                    .eq('subtype_id', project.subtype_id);

                if (metrics) setMarketMetrics(metrics);
            }

            setLoading(false);
        };
        load();
    }, [project.id, project.subtype_id, location?.city, supabase]);

    // Calculate suggested absorption
    // Calculate units with specific dates to exclude from distribution
    const genericUnits = useMemo(() => {
        const fixedUnits = detailedUnits
            .filter(u => u.sale_date)
            .reduce((sum, u) => sum + (u.unit_count || 0), 0);
        return Math.max(0, (unitsData.totalUnits || 0) - fixedUnits);
    }, [detailedUnits, unitsData.totalUnits]);

    const getSuggestedAbsorption = () => {
        const total = genericUnits; // Use ONLY generic units for distribution
        if (total === 0) return null;

        // Logic requested by user:
        // Conservador: Sell everything in 8 months
        // Equilibrado: Sell everything in 4 months
        // Otimista: Sell everything in 2 months

        const calcUnitRate = (months: number) => Math.max(1, Math.round(total / months));

        return {
            pessimistic: calcUnitRate(8),
            balanced: calcUnitRate(4),
            optimistic: calcUnitRate(2),
            isFromMarketData: false // Using custom logic requested
        };
    };

    const suggestions = getSuggestedAbsorption();

    const handleApplySuggestion = (unitsPerMonth: number) => {
        const totalGeneric = genericUnits || 1;
        const percentage = (unitsPerMonth / totalGeneric) * 100;
        setAssumptions(prev => ({
            ...prev,
            absorption_rate_monthly: parseFloat(percentage.toFixed(1)),
            manual_absorption_curve: null
        }));
    };

    const handleApplyManualUnitsPerMonth = (unitsPerMonth: number) => {
        const totalGeneric = genericUnits || 1;
        const percentage = (unitsPerMonth / totalGeneric) * 100;
        setAssumptions(prev => ({
            ...prev,
            absorption_rate_monthly: parseFloat(percentage.toFixed(1)),
            manual_absorption_curve: null
        }));
    };

    // Chart & Table Data Calculation
    const fullData = useMemo(() => {
        const data = [];
        const studyStart = startOfMonth(new Date(assumptions.study_date));
        const salesStartMonth = assumptions.sales_start_offset || 0;
        const manualCurve = assumptions.manual_absorption_curve;
        const linearRate = assumptions.absorption_rate_monthly || 0;
        const totalGDV = unitsData.totalGDV || 0;
        const totalUnits = unitsData.totalUnits || 0;

        // 1. Calculate specific dated sales from Unit Mix
        const specificSalesMap = new Map<string, { units: number, revenue: number }>();
        detailedUnits.forEach(u => {
            if (u.sale_date) {
                // Ensure date is treated as local noon to avoid timezone shift to prev day
                const monthKey = format(startOfMonth(new Date(u.sale_date + 'T12:00:00')), 'yyyy-MM');
                const existing = specificSalesMap.get(monthKey) || { units: 0, revenue: 0 };
                specificSalesMap.set(monthKey, {
                    units: existing.units + (u.unit_count || 0),
                    revenue: existing.revenue + ((u.unit_count || 0) * (u.avg_price || 0))
                });
            }
        });

        const totalFixedUnits = Array.from(specificSalesMap.values()).reduce((sum, s) => sum + s.units, 0);
        const totalFixedGDV = Array.from(specificSalesMap.values()).reduce((sum, s) => sum + s.revenue, 0);
        const genericUnitsToDistribute = Math.max(0, totalUnits - totalFixedUnits);
        const genericGDVToDistribute = Math.max(0, totalGDV - totalFixedGDV);

        let cumulativeGeneric = 0;
        let cumulativeUnitsTotal = 0;
        const maxMonths = 60; // Max projection

        for (let i = 0; i < maxMonths; i++) {
            const currentMonthDate = addMonths(studyStart, i);
            const monthKey = format(currentMonthDate, 'yyyy-MM');
            const fixedData = specificSalesMap.get(monthKey) || { units: 0, revenue: 0 };

            let monthlyGenericPercent = 0;

            if (i >= salesStartMonth) {
                if (manualCurve && manualCurve[i - salesStartMonth] !== undefined) {
                    monthlyGenericPercent = manualCurve[i - salesStartMonth];
                } else if (!manualCurve) {
                    // Linear applies to GENERIC pool
                    monthlyGenericPercent = Math.min(linearRate, 100 - cumulativeGeneric);
                }
            }

            cumulativeGeneric += monthlyGenericPercent;

            // Final values for this month = Generic Component + Fixed Component
            const monthlyDistributedUnits = Math.round((monthlyGenericPercent / 100) * genericUnitsToDistribute);
            const monthlyDistributedRevenue = (monthlyGenericPercent / 100) * genericGDVToDistribute;

            const totalMonthlyUnits = monthlyDistributedUnits + fixedData.units;
            const totalMonthlyRevenue = monthlyDistributedRevenue + fixedData.revenue;

            cumulativeUnitsTotal += totalMonthlyUnits;

            data.push({
                index: i,
                monthLabel: format(currentMonthDate, 'MMM yy'),
                monthly: parseFloat(monthlyGenericPercent.toFixed(2)),
                monthlyUnits: totalMonthlyUnits,
                fixedUnits: fixedData.units,
                distributedUnits: monthlyDistributedUnits,
                monthlyRevenue: Math.round(totalMonthlyRevenue),
                cumulative: parseFloat(Math.min((cumulativeUnitsTotal / (totalUnits || 1)) * 100, 100).toFixed(1)),
                isSalesActive: i >= salesStartMonth || fixedData.units > 0
            });

            // Stop condition: all units accounted for AND we reached delivery month
            const deliveryMonth = assumptions.delivery_start_offset || 24;
            if (cumulativeGeneric >= 100 && i >= deliveryMonth) {
                // Check if any more fixed items exist later
                const hasFutureFixed = Array.from(specificSalesMap.keys()).some(k => k > monthKey);
                if (!hasFutureFixed) break;
            }
        }

        // 3. SECOND PASS: Distribute CashFlow based on Sale Timing
        // We initialize an array for Cash-In
        const cashInProjected = new Array(data.length).fill(0);
        const deliveryMonthIndex = assumptions.delivery_start_offset || 24;
        const dep = assumptions.deposit_structure;

        data.forEach((monthData, saleIndex) => {
            const saleRevenue = monthData.monthlyRevenue;
            if (saleRevenue <= 0) return;

            // a. Initial Deposit (Entrada) - Instant in sale month
            cashInProjected[saleIndex] += (saleRevenue * (dep.initial_deposit / 100));

            // b. Closing Funding (Chaves) - Happens at delivery
            const deliveryIdx = Math.min(deliveryMonthIndex, cashInProjected.length - 1);
            if (deliveryIdx >= saleIndex) {
                cashInProjected[deliveryIdx] += (saleRevenue * (dep.closing_funding / 100));
            }

            // c. During Construction (Mensais) - Distributed between sale and delivery
            // Typically starts month after sale until delivery month minus 1
            const installmentStart = saleIndex + 1;
            const installmentEnd = deliveryMonthIndex - 1;
            const installmentMonths = Math.max(0, installmentEnd - installmentStart + 1);

            if (installmentMonths > 0) {
                const monthlyInstallment = (saleRevenue * (dep.second_deposit / 100)) / installmentMonths;
                for (let k = installmentStart; k <= installmentEnd; k++) {
                    if (k < cashInProjected.length) {
                        cashInProjected[k] += monthlyInstallment;
                    }
                }
            } else if (dep.second_deposit > 0) {
                // If it's a very late sale (already at delivery), add everything to delivery
                const deliveryIdxSafe = Math.min(deliveryMonthIndex, cashInProjected.length - 1);
                cashInProjected[deliveryIdxSafe] += (saleRevenue * (dep.second_deposit / 100));
            }
        });

        // Map cashIn back to data with cumulative revenue
        let cumulativeRev = 0;
        return data.map((d, idx) => {
            const monthRev = Math.round(cashInProjected[idx]);
            cumulativeRev += monthRev;
            return {
                ...d,
                monthlyRevenue: monthRev,
                cumulativeRevenue: cumulativeRev
            };
        });
    }, [assumptions, unitsData, detailedUnits]);

    // Cropped data for visual clarity in the chart (Sales Window Only)
    const chartData: any[] = useMemo(() => {
        if (!fullData || fullData.length === 0) return [];

        // Start from first month with units sold (fixed or distributed)
        const firstActive = fullData.findIndex(d => d.monthlyUnits > 0);
        if (firstActive === -1) return fullData.slice(0, 12); // Fallback to 12 months if no sales

        // End exactly at the last month with units sold
        const lastWithUnits = fullData.findLastIndex(d => d.monthlyUnits > 0);
        const endIndex = lastWithUnits === -1 ? fullData.length : lastWithUnits + 1;

        return fullData.slice(firstActive, Math.max(firstActive + 1, endIndex)).map((d, idx) => ({
            ...d,
            relativeMonth: `Mês ${idx + 1}`,
            calendarMonth: d.monthLabel.toUpperCase()
        }));
    }, [fullData]);

    // Cash Flow data: from sales start to delivery (keys/financing)
    const cashFlowData: any[] = useMemo(() => {
        if (!fullData || fullData.length === 0) return [];

        // Start from sales start offset
        const salesStart = assumptions.sales_start_offset || 0;

        // End at delivery month + 2 (to show the final closing payment clearly)
        const deliveryEnd = (assumptions.delivery_start_offset || 24) + 2;

        return fullData.slice(salesStart, Math.min(deliveryEnd, fullData.length));
    }, [fullData, assumptions.sales_start_offset, assumptions.delivery_start_offset]);

    const handleManualChange = (index: number, value: number) => {
        const start = assumptions.sales_start_offset || 0;
        const curveIndex = index - start;
        if (curveIndex < 0) return;

        const newCurve = assumptions.manual_absorption_curve ? [...assumptions.manual_absorption_curve] : [];
        while (newCurve.length <= curveIndex) newCurve.push(0);
        newCurve[curveIndex] = value;

        setAssumptions(prev => ({ ...prev, manual_absorption_curve: newCurve }));
    };

    const handleManualUnitsChange = (index: number, unitsValue: number) => {
        const totalUnits = unitsData.totalUnits || 0;
        if (totalUnits === 0) return;

        const rowData = fullData.find(r => r.index === index);
        if (!rowData) return;

        const fixedUnitsInThisMonth = rowData.fixedUnits || 0;
        const genericUnitsToDistribute = Math.max(0, totalUnits - (fullData.reduce((sum, r) => sum + r.fixedUnits, 0)));

        if (genericUnitsToDistribute === 0) return; // All units are fixed by date

        // The user is inputting TOTAL units for the month.
        // We need to determine how many of these are 'distributed' (generic) units.
        const newDistributedUnits = Math.max(0, unitsValue - fixedUnitsInThisMonth);

        // Calculate how many generic units are already distributed in other months
        const otherMonthsDistributedUnits = fullData
            .filter(row => row.index !== index)
            .reduce((sum, row) => sum + row.distributedUnits, 0);

        const availableInPool = Math.max(0, genericUnitsToDistribute - otherMonthsDistributedUnits);

        const cappedDistributedUnits = Math.min(newDistributedUnits, availableInPool);

        const percentage = (cappedDistributedUnits / genericUnitsToDistribute) * 100;
        handleManualChange(index, percentage);
    };

    const handleDistributeRemaining = () => {
        const start = assumptions.sales_start_offset || 0;
        const currentData = fullData;
        let cumulativeBeforeLast = 0;
        const manualCurve = assumptions.manual_absorption_curve || [];

        // Calculate what's already sold manually
        const newCurve = [...manualCurve];
        let soldGenericPercent = 0;
        for (let i = 0; i < newCurve.length; i++) {
            soldGenericPercent += newCurve[i] || 0;
        }

        const remainingGenericPercent = Math.max(0, 100 - soldGenericPercent);
        if (remainingGenericPercent <= 0) return;

        // Simple linear distribution for next 12 months or until 100%
        const monthsToDistribute = 12;
        const rate = remainingGenericPercent / monthsToDistribute;

        for (let i = 0; i < monthsToDistribute; i++) {
            const idx = newCurve.length;
            newCurve.push(parseFloat(rate.toFixed(2)));
        }

        setAssumptions(prev => ({ ...prev, manual_absorption_curve: newCurve }));
    };

    const handleSave = async () => {
        if (!scenarioId) return;
        setSaving(true);
        setSaveStatus('idle');

        try {
            const scenarioData = {
                project_id: project.id,
                name: dictionary.analysis.units?.scenarios?.base || 'Base Case',
                scenario_type: 'base',
                commission_rate: Number(assumptions.commission_rate) || 0,
                absorption_rate_monthly: Number(assumptions.absorption_rate_monthly) || 0,
                sales_start_offset: Math.floor(Number(assumptions.sales_start_offset) || 0),
                marketing_cost_percent: Number(assumptions.marketing_cost_percent) || 0,
                deposit_structure: assumptions.deposit_structure,
                manual_absorption_curve: assumptions.manual_absorption_curve,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('financial_scenarios')
                .update(scenarioData)
                .eq('id', scenarioId);

            if (error) {
                console.error(error);
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 5000);
            } else {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        } catch (err) {
            console.error(err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 5000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

    const totalDeposit = assumptions.deposit_structure.initial_deposit +
        assumptions.deposit_structure.second_deposit +
        assumptions.deposit_structure.closing_funding;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 pb-8 border-b border-gray-100">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                            {dict.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">{dict.subtitle}</p>
                    </div>
                    <div className="flex flex-wrap gap-8 items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                        <div className="text-right px-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{dict.total_gdv || 'VGV TOTAL (GDV)'}</p>
                            <p className="text-xl font-black text-cyan-600">${(unitsData.totalGDV || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="text-right border-l border-gray-200 px-8">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{dict.total_units || 'TOTAL UNIDADES'}</p>
                            <p className="text-xl font-black text-gray-900">{unitsData.totalUnits}</p>
                        </div>
                        <div className="pl-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`
                                    min-w-[180px] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3
                                    ${saving ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-cyan-200 shadow-cyan-100'}
                                `}
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                        {lang === 'pt' ? 'Salvando...' : 'Saving...'}
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        {dict.save}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left Column: Configuration */}
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                                <span>{dict.absorption_config}</span>
                                <div className="h-px flex-1 bg-gray-100"></div>
                            </h4>

                            <div className="mb-8 space-y-4">
                                <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 relative overflow-hidden group">
                                    {/* Macro Schedule Info */}
                                    <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-50">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{dict.macro_schedule || 'Macro Cronograma'}</p>
                                            </div>
                                            <p className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                                                {format(addMonths(startOfMonth(new Date(assumptions.study_date)), assumptions.sales_start_offset), 'MMM yyyy', { locale: lang === 'pt' ? undefined : undefined })}
                                            </p>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            <div className={`px-4 py-2 rounded-2xl border text-right transition-all ${Math.abs(fullData.reduce((sum, r) => sum + r.monthlyUnits, 0) - unitsData.totalUnits) < 0.1 ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{dict.units_sold || 'Unidades Vendidas'}</p>
                                                <p className={`text-base font-black transition-colors ${fullData.reduce((sum, r) => sum + r.monthlyUnits, 0) > unitsData.totalUnits + 0.1 ? 'text-rose-500' : 'text-gray-800'}`}>
                                                    {~~(fullData.reduce((sum, r) => sum + r.monthlyUnits, 0))} / {unitsData.totalUnits}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 text-right">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{dict.predicted_duration || 'Duração Prevista'}</p>
                                                <p className="text-base font-black text-gray-800">{assumptions.sales_duration_months} <span className="text-[10px] text-gray-400 font-bold">{dict.months_label}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fine Tuning Input */}
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <label className="block text-[11px] font-black text-blue-600 uppercase tracking-widest mb-1">{dict.fine_tuning || 'Ajuste Fino'}</label>
                                            <p className="text-[10px] text-gray-400 font-semibold leading-tight">{dict.offset_hint || 'Deslocamento em meses'}</p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-blue-50/70 p-3 rounded-2xl border border-blue-100 shadow-inner">
                                            <input
                                                type="number"
                                                className="w-16 bg-transparent border-none outline-none text-2xl font-black text-blue-700 focus:ring-0 p-0 text-center appearance-none hide-spinner"
                                                value={assumptions.sales_start_offset}
                                                onChange={e => setAssumptions({ ...assumptions, sales_start_offset: parseInt(e.target.value) || 0 })}
                                            />
                                            <div className="flex flex-col border-l border-blue-200/50 pl-3 gap-1">
                                                <button
                                                    onClick={() => setAssumptions(prev => ({ ...prev, sales_start_offset: (prev.sales_start_offset || 0) + 1 }))}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors p-1 bg-white rounded-lg shadow-sm border border-blue-100"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 15l7-7 7 7" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => setAssumptions(prev => ({ ...prev, sales_start_offset: Math.max(0, (prev.sales_start_offset || 0) - 1) }))}
                                                    className="text-blue-500 hover:text-blue-700 transition-colors p-1 bg-white rounded-lg shadow-sm border border-blue-100"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-4 mt-8">
                                <span>{dict.sales_costs || 'CUSTOS DE VENDA'}</span>
                                <div className="h-px flex-1 bg-gray-100"></div>
                            </h4>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{dict.commission}</label>
                                    <div className="relative group/input-container">
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full bg-transparent border-none outline-none text-lg font-black text-gray-900 focus:ring-0 p-0 appearance-none hide-spinner"
                                            value={assumptions.commission_rate}
                                            onChange={e => setAssumptions({ ...assumptions, commission_rate: parseFloat(e.target.value) || 0 })}
                                        />
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-300 uppercase pointer-events-none">%</span>
                                            <div className="flex flex-col border-l border-gray-100 pl-2">
                                                <button
                                                    onClick={() => setAssumptions(prev => ({ ...prev, commission_rate: Number(((prev.commission_rate || 0) + 0.1).toFixed(1)) }))}
                                                    className="text-gray-400 hover:text-blue-500 transition-colors p-0.5"
                                                >
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 15l7-7 7 7" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => setAssumptions(prev => ({ ...prev, commission_rate: Math.max(0, Number(((prev.commission_rate || 0) - 0.1).toFixed(1))) }))}
                                                    className="text-gray-400 hover:text-blue-500 transition-colors p-0.5"
                                                >
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{dict.marketing}</label>
                                    <div className="relative group/input-container">
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full bg-transparent border-none outline-none text-lg font-black text-gray-900 focus:ring-0 p-0 appearance-none hide-spinner"
                                            value={assumptions.marketing_cost_percent}
                                            onChange={e => setAssumptions({ ...assumptions, marketing_cost_percent: parseFloat(e.target.value) || 0 })}
                                        />
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-300 uppercase pointer-events-none">%</span>
                                            <div className="flex flex-col border-l border-gray-100 pl-2">
                                                <button
                                                    onClick={() => setAssumptions(prev => ({ ...prev, marketing_cost_percent: Number(((prev.marketing_cost_percent || 0) + 0.1).toFixed(1)) }))}
                                                    className="text-gray-400 hover:text-blue-500 transition-colors p-0.5"
                                                >
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 15l7-7 7 7" /></svg>
                                                </button>
                                                <button
                                                    onClick={() => setAssumptions(prev => ({ ...prev, marketing_cost_percent: Math.max(0, Number(((prev.marketing_cost_percent || 0) - 0.1).toFixed(1))) }))}
                                                    className="text-gray-400 hover:text-blue-500 transition-colors p-0.5"
                                                >
                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Intelligence Suggestions */}
                            {suggestions && (
                                <div className={`bg-white rounded-2xl border ${suggestions.isFromMarketData ? 'border-cyan-200 shadow-cyan-100' : 'border-gray-200'} p-5 shadow-sm relative overflow-hidden group`}>
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <svg className="w-12 h-12 text-cyan-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`text-[10px] font-black ${suggestions.isFromMarketData ? 'text-amber-500' : 'text-cyan-600'} uppercase tracking-[0.2em]`}>
                                            {suggestions.isFromMarketData ? '★ REGIONAL MARKET DATA' : dict.suggested_title}
                                        </span>
                                        <div className={`h-px flex-1 ${suggestions.isFromMarketData ? 'bg-amber-100' : 'bg-cyan-50'}`}></div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { key: 'pessimistic', label: dict.scenarios.pessimistic, val: suggestions.pessimistic, color: 'red' },
                                            { key: 'balanced', label: dict.scenarios.balanced, val: suggestions.balanced, color: 'blue' },
                                            { key: 'optimistic', label: dict.scenarios.optimistic, val: suggestions.optimistic, color: 'emerald' }
                                        ].map((s) => (
                                            <button
                                                key={s.key}
                                                onClick={() => handleApplySuggestion(s.val)}
                                                className={`
                                                    p-3 rounded-xl border-2 text-center transition-all shadow-sm
                                                    ${Number((assumptions.absorption_rate_monthly * (unitsData.totalUnits || 0) / 100).toFixed(0)) === s.val && !assumptions.manual_absorption_curve
                                                        ? `border-${s.color}-200 bg-${s.color}-50/50 scale-105 shadow-md`
                                                        : 'border-transparent bg-gray-50 hover:bg-gray-100'}
                                                `}
                                            >
                                                <p className={`text-[8px] uppercase font-black text-${s.color}-500 mb-1`}>{s.label}</p>
                                                <p className="text-sm font-black text-gray-900 leading-none">{s.val} <span className="text-[7px]">UNS/mês</span></p>
                                                <p className="text-[9px] font-bold text-gray-400 mt-1">
                                                    {(s.val / (unitsData.totalUnits || 1) * 100).toFixed(1)}% <span className="text-[7px]">veloc.</span>
                                                </p>
                                            </button>
                                        ))}

                                        {/* Manual / Target Input */}
                                        <div className={`p-3 rounded-xl border-2 transition-all ${!assumptions.manual_absorption_curve && ![suggestions.pessimistic, suggestions.balanced, suggestions.optimistic].includes(assumptions.absorption_rate_monthly) ? 'border-blue-200 bg-blue-50/50' : 'border-transparent bg-gray-50'}`}>
                                            <div className="flex flex-col h-full justify-between gap-1 text-center">
                                                <p className="text-[8px] uppercase font-black text-blue-500 mb-1">Ajuste Manual</p>
                                                <div className="flex items-center justify-center gap-1">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="w-12 bg-transparent border-none outline-none text-sm font-black text-gray-900 focus:ring-0 p-0 text-center appearance-none hide-spinner"
                                                        value={Math.round((assumptions.absorption_rate_monthly * (unitsData.totalUnits || 0)) / 100)}
                                                        onChange={e => handleApplyManualUnitsPerMonth(parseInt(e.target.value) || 0)}
                                                    />
                                                    <span className="text-[9px] font-bold text-gray-400">UNS</span>
                                                </div>
                                                <p className="text-[9px] font-black text-blue-400/60 leading-none">
                                                    (~{(assumptions.absorption_rate_monthly).toFixed(1)}%)
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-gray-400 mt-4 italic text-center font-medium">
                                        {suggestions.isFromMarketData
                                            ? `Baseado em dados reais de absorção para ${location?.city || ''} (${project?.type || 'Tipo'}).`
                                            : (dict?.suggested_desc || 'Baseado na tipologia, liquidez e padrão do projeto.')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Month by Month Table */}
                        <div className="pt-8 border-t border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                                <span>{dict.by_month || 'VENDAS MÊS A MÊS'}</span>
                                <div className="flex gap-4">
                                    {assumptions.manual_absorption_curve && (
                                        <button
                                            onClick={() => setAssumptions(prev => ({ ...prev, manual_absorption_curve: null }))}
                                            className="text-[9px] text-rose-500 hover:underline font-black"
                                        >
                                            {dict.reset_linear || 'RESETAR PARA LINEAR'}
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDistributeRemaining}
                                        className="text-[9px] text-cyan-600 hover:text-cyan-700 font-black border border-cyan-200 px-2 py-1 rounded-md bg-white shadow-sm uppercase"
                                    >
                                        {dict.distribute_remaining || 'DISTRIBUIR RESTANTE'}
                                    </button>
                                </div>
                            </h4>
                            <div className="bg-gray-50 rounded-2xl border border-gray-100 max-h-[400px] overflow-y-auto custom-scrollbar shadow-inner relative">
                                {unitsData.totalUnits === 0 && !loading && (
                                    <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-8 text-center">
                                        <div className="max-w-[280px] bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4 text-xl">⚠️</div>
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Sem Unidades Definidas</p>
                                            <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                                                {lang === 'pt'
                                                    ? 'Configure o Mix de Unidades na aba anterior antes de definir a estratégia de vendas.'
                                                    : 'Configure the Unit Mix in the previous tab before defining the sales strategy.'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-gray-50 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase">Mês</th>
                                            <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase">Período</th>
                                            <th className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase text-right">Vendas (Unidades)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {fullData.map((row) => (
                                            <tr key={row.index} className={`group hover:bg-white transition-colors ${!row.isSalesActive ? 'opacity-40' : ''}`}>
                                                <td className="px-4 py-3 text-[11px] font-bold text-gray-400">#{row.index}</td>
                                                <td className="px-4 py-3 text-[11px] font-black text-gray-900 group-hover:text-cyan-600 uppercase italic">{row.monthLabel}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="relative flex items-center justify-end gap-3 group/input">
                                                        <div className="text-right opacity-0 group-hover/input:opacity-100 transition-opacity whitespace-nowrap">
                                                            <p className="text-[9px] font-bold text-blue-600 leading-none">
                                                                {row.monthly}%
                                                            </p>
                                                            <p className="text-[8px] font-black text-emerald-600 leading-none">
                                                                ${(row.monthlyRevenue / 1000).toFixed(1)}k
                                                            </p>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            disabled={!row.isSalesActive}
                                                            className={`
                                                                w-16 text-right bg-transparent border-none outline-none font-black text-sm p-0 focus:ring-0 appearance-none hide-spinner
                                                                ${row.isSalesActive ? 'text-gray-900' : 'text-gray-300'}
                                                                ${assumptions.manual_absorption_curve ? 'text-blue-600' : ''}
                                                            `}
                                                            value={row.monthlyUnits}
                                                            onChange={(e) => handleManualUnitsChange(row.index, parseFloat(e.target.value) || 0)}
                                                        />
                                                        {row.isSalesActive && (
                                                            <div className="flex flex-col">
                                                                <button
                                                                    onClick={() => handleManualUnitsChange(row.index, Math.round(row.monthlyUnits) + 1)}
                                                                    className="text-gray-300 hover:text-blue-500 transition-colors p-0.5"
                                                                    title={row.fixedUnits > 0 ? `${row.fixedUnits} unidades fixas da tabela Unit Mix` : ''}
                                                                >
                                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 15l7-7 7 7" /></svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleManualUnitsChange(row.index, Math.max(row.fixedUnits, Math.round(row.monthlyUnits) - 1))}
                                                                    className="text-gray-300 hover:text-blue-500 transition-colors p-0.5"
                                                                >
                                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" /></svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                        {row.fixedUnits > 0 && (
                                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full border border-white" title={`${row.fixedUnits} unidades travadas pelo Mix de Unidades`}></div>
                                                        )}
                                                        <span className={`text-[10px] font-bold ${row.isSalesActive ? 'text-gray-300' : 'text-gray-200'} uppercase tracking-tighter`}>UNS</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visualization */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-xl shadow-cyan-900/5 border border-cyan-50 p-6 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all"></div>
                            <h3 className="text-sm font-black text-gray-900 mb-8 flex flex-col items-center gap-2">
                                <span>CURVA DE ABSORÇÃO ACUMULADA</span>
                                <span className={`text-[9px] px-3 py-1 rounded-full font-bold tracking-widest uppercase ${assumptions.manual_absorption_curve ? 'bg-blue-50 text-blue-600' : 'bg-cyan-50 text-cyan-600'}`}>
                                    {assumptions.manual_absorption_curve ? 'Ajuste Manual' : 'Distribuição Linear'}
                                </span>
                            </h3>

                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                        <defs>
                                            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={assumptions.manual_absorption_curve ? "#2563eb" : "#0891b2"} stopOpacity={0.1} />
                                                <stop offset="95%" stopColor={assumptions.manual_absorption_curve ? "#2563eb" : "#0891b2"} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="relativeMonth"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={(props: any) => {
                                                const { x, y, payload } = props;
                                                const item = chartData[payload.index];
                                                if (!item) return null;
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text x={0} y={0} dy={14} textAnchor="middle" fill="#111827" fontSize={9} fontWeight={900}>
                                                            {item.relativeMonth}
                                                        </text>
                                                        <text x={0} y={0} dy={26} textAnchor="middle" fill="#94a3b8" fontSize={8} fontWeight={700}>
                                                            {item.calendarMonth}
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 9, fill: '#cbd5e1', fontWeight: 600 }}
                                            domain={[0, 100]}
                                            unit="%"
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            hide
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2">
                                                                {label} — {data.monthLabel}
                                                            </p>
                                                            <div className="space-y-1">
                                                                <p className="text-sm font-black text-gray-900">
                                                                    {data.monthlyUnits} <span className="text-[10px] text-gray-400">UNS VENDIDAS</span>
                                                                </p>
                                                                <p className="text-xs font-bold text-cyan-600">
                                                                    {data.cumulative}% <span className="text-[10px] opacity-70 text-cyan-400">ACUMULADO</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="monthlyUnits"
                                            fill="#e2e8f0"
                                            stroke="#94a3b8"
                                            strokeWidth={1}
                                            radius={[4, 4, 0, 0]}
                                            barSize={12}
                                            name="Vendas no Mês"
                                        />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="cumulative"
                                            name="Acumulado"
                                            stroke={assumptions.manual_absorption_curve ? "#2563eb" : "#0891b2"}
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorCumulative)"
                                            animationDuration={1500}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Revenue Flow Chart */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 border border-emerald-50 p-6 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>
                            <h3 className="text-sm font-black text-gray-900 mb-8 flex items-center justify-between">
                                <span>FLUXO DE CAIXA DE VENDAS (CASH-IN)</span>
                                <div className="flex gap-2">
                                    <span className="text-[9px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold uppercase tracking-widest">Receita Bruta</span>
                                </div>
                            </h3>

                            <div className="h-48 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={cashFlowData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenueCumulative" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#cbd5e1', fontWeight: 600 }} interval={6} />
                                        <YAxis yAxisId="left" hide />
                                        <YAxis yAxisId="right" orientation="right" hide />
                                        <Tooltip
                                            formatter={(value: any, name?: string) => {
                                                if (name === 'Mensal') return [`$${(value || 0).toLocaleString()}`, 'Receita Mensal'];
                                                return [`$${(value || 0).toLocaleString()}`, 'Acumulado'];
                                            }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                            itemStyle={{ fontSize: '11px', fontWeight: '900', color: '#065f46' }}
                                            labelStyle={{ fontSize: '10px', fontWeight: '900', color: '#64748b', marginBottom: '4px' }}
                                        />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="monthlyRevenue"
                                            fill="#d1fae5"
                                            stroke="#10b981"
                                            strokeWidth={1}
                                            radius={[4, 4, 0, 0]}
                                            name="Mensal"
                                            animationDuration={1000}
                                        />
                                        <Area
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="cumulativeRevenue"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fill="url(#colorRevenueCumulative)"
                                            name="Acumulado"
                                            animationDuration={1500}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 flex justify-between items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                <span>Pico de Recebimento</span>
                                <span>${Math.max(...(cashFlowData.length > 0 ? cashFlowData.map(d => d.monthlyRevenue) : [0])).toLocaleString()} / Mês</span>
                            </div>
                        </div>

                        {/* Payment Structure */}
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                                <span>{dict.payment_title}</span>
                                <div className="h-px flex-1 bg-gray-100"></div>
                            </h4>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                                {[
                                    { key: 'initial_deposit', label: dict.deposit_initial, color: 'emerald', val: assumptions.deposit_structure.initial_deposit, readonly: true },
                                    { key: 'second_deposit', label: dict.deposit_construction, color: 'blue', val: assumptions.deposit_structure.second_deposit, readonly: false },
                                    { key: 'closing_funding', label: dict.deposit_closing, color: 'indigo', val: assumptions.deposit_structure.closing_funding, readonly: false }
                                ].map((step) => (
                                    <div key={step.key} className={`flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl border-l-4 border-l-${step.color}-500 shadow-sm shadow-gray-200/50`}>
                                        <span className={`text-[10px] font-black text-${step.color}-600 uppercase tracking-widest`}>{step.label}</span>
                                        <div className="relative group/input-container flex items-center gap-2">
                                            <input
                                                type="number"
                                                className={`w-16 text-right outline-none font-black ${step.readonly ? 'text-gray-500 bg-gray-50' : 'text-gray-900'} border-none p-0 text-base appearance-none hide-spinner`}
                                                value={step.val}
                                                readOnly={step.readonly}
                                                onChange={e => {
                                                    if (step.readonly) return;
                                                    const newValue = parseFloat(e.target.value) || 0;
                                                    const updated = { ...assumptions.deposit_structure, [step.key]: newValue };
                                                    // Auto-calculate Down Payment
                                                    updated.initial_deposit = Math.max(0, 100 - updated.second_deposit - updated.closing_funding);
                                                    setAssumptions({
                                                        ...assumptions,
                                                        deposit_structure: updated
                                                    });
                                                }}
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 font-bold text-xs">%</span>
                                                {!step.readonly && (
                                                    <div className="flex flex-col border-l border-gray-100 pl-2">
                                                        <button
                                                            onClick={() => {
                                                                const updated = { ...assumptions.deposit_structure };
                                                                (updated as any)[step.key] = (updated as any)[step.key] + 1;
                                                                // Auto-calculate Down Payment
                                                                updated.initial_deposit = Math.max(0, 100 - updated.second_deposit - updated.closing_funding);
                                                                setAssumptions({ ...assumptions, deposit_structure: updated });
                                                            }}
                                                            className={`text-${step.color}-400 hover:text-${step.color}-600 transition-colors p-0.5`}
                                                        >
                                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 15l7-7 7 7" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const updated = { ...assumptions.deposit_structure };
                                                                (updated as any)[step.key] = Math.max(0, (updated as any)[step.key] - 1);
                                                                // Auto-calculate Down Payment
                                                                updated.initial_deposit = Math.max(0, 100 - updated.second_deposit - updated.closing_funding);
                                                                setAssumptions({ ...assumptions, deposit_structure: updated });
                                                            }}
                                                            className={`text-${step.color}-400 hover:text-${step.color}-600 transition-colors p-0.5`}
                                                        >
                                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" /></svg>
                                                        </button>
                                                    </div>
                                                )}
                                                {step.readonly && (
                                                    <div className="w-[26px]"></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className={`mt-4 p-4 rounded-xl text-xs font-black flex justify-between items-center tracking-[0.2em] transition-all ${totalDeposit === 100 ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : 'bg-red-50 text-red-600 ring-1 ring-red-200 animate-pulse'}`}>
                                    <span>TOTAL:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">{totalDeposit}%</span>
                                        <div className="w-[26px]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {saveStatus !== 'idle' && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[999]"
                        >
                            <div className={`
                            px-8 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border backdrop-blur-xl flex items-center gap-4
                            ${saveStatus === 'success'
                                    ? 'bg-emerald-500/90 border-emerald-400/50 text-white'
                                    : 'bg-rose-500/90 border-rose-400/50 text-white'}
                        `}>
                                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
                                    {saveStatus === 'success' ? '✨' : '⚠️'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black uppercase tracking-widest">
                                        {saveStatus === 'success'
                                            ? (lang === 'pt' ? 'Sucesso!' : 'Success!')
                                            : (lang === 'pt' ? 'Erro ao Salvar' : 'Save Error')}
                                    </span>
                                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-tight">
                                        {saveStatus === 'success'
                                            ? (lang === 'pt' ? 'Estratégia salva com sucesso.' : 'Strategy saved successfully.')
                                            : (lang === 'pt' ? 'Tente novamente em instantes.' : 'Please try again later.')}
                                    </span>
                                </div>
                                {saveStatus === 'success' && (
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 3 }}
                                        className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #94a3b8 #f1f5f9;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #94a3b8;
                    border-radius: 10px;
                    border: 2px solid #f1f5f9;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #64748b;
                }
                .hide-spinner::-webkit-outer-spin-button,
                .hide-spinner::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .hide-spinner {
                    -moz-appearance: textfield;
                }
            `}</style>
            </div>
        </div>
    );
}
