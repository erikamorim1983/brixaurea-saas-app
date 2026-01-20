'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine } from 'recharts';

interface MonthData {
    month: number;
    revenue: number;
    costs: number;
    net: number;
    cumulative: number;
}

interface FinancialDashboardProps {
    data: {
        totalGDV: number;
        totalCosts: number;
        scenarioId: string;
        healthScore?: number;
        strategicAnalysis?: string;
        months: MonthData[];
        project?: any;
        subtype?: any;
    };
    lang: string;
    dictionary: any;
}

export default function FinancialDashboard({ data, lang, dictionary }: FinancialDashboardProps) {
    const [view, setView] = useState<'chart' | 'table'>('chart');
    const [loadingAI, setLoadingAI] = useState(false);
    const [aiResult, setAiResult] = useState<{ healthScore?: number; analysis?: string } | null>(null);

    const { months, totalGDV, totalCosts, scenarioId, subtype } = data;
    const relevantFields = subtype?.relevant_fields || {};
    const primaryMetric = relevantFields.primary_metric || 'vgv';

    const currentHealthScore = aiResult?.healthScore || data.healthScore || 0;
    const currentAnalysis = aiResult?.analysis || data.strategicAnalysis;

    const totalNet = totalGDV - totalCosts;
    const margin = totalGDV > 0 ? (totalNet / totalGDV) * 100 : 0;
    const maxExposure = Math.min(...months.map(m => m.cumulative));

    // Custom Metric Logic
    let primaryMetricLabel = dictionary.financial_dashboard.kpi.gdv;
    let primaryMetricValue = totalGDV;

    if (primaryMetric === 'noi') {
        primaryMetricLabel = 'NOI (Annualized)';
        // Simplified: GDV / Project Years? For now use totalGDV
        primaryMetricValue = totalGDV;
    } else if (primaryMetric === 'revpar') {
        primaryMetricLabel = 'RevPAR (Est.)';
        primaryMetricValue = totalGDV / 365; // Very simplified
    } else if (primaryMetric === 'lease_rate') {
        primaryMetricLabel = 'Lease Rate (Avg)';
        primaryMetricValue = totalGDV / 12; // Simplified
    }

    const handleRecalculateAI = async () => {
        setLoadingAI(true);
        try {
            // Note: Calling our specialized Python backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/finance/recalculate/${scenarioId}`, {
                method: 'POST',
            });
            const result = await response.json();
            if (result.status === 'success') {
                setAiResult({
                    healthScore: result.intelligence.health_score,
                    analysis: result.intelligence.strategic_analysis
                });
            }
        } catch (error) {
            console.error("AI Recalculation Error:", error);
        } finally {
            setLoadingAI(false);
        }
    };

    const formatCurrency = (val: number) => {
        if (!isFinite(val)) return '---';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm col-span-1 md:col-span-1 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 relative z-10">{dictionary.financial_dashboard.kpi.health_score}</p>
                    <div className="relative w-20 h-20 z-10">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                className="text-gray-100"
                                strokeDasharray="100, 100"
                                strokeWidth="3"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className={`${currentHealthScore > 70 ? 'text-green-500' : currentHealthScore > 40 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                strokeDasharray={`${currentHealthScore}, 100`}
                                strokeWidth="3"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-black text-[#081F2E]">{currentHealthScore}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-cyan-500">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{primaryMetricLabel}</p>
                    <p className="text-2xl font-extrabold text-[#081F2E]">{formatCurrency(primaryMetricValue)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{dictionary.financial_dashboard.kpi.costs}</p>
                    <p className="text-2xl font-extrabold text-red-600">{formatCurrency(totalCosts)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-green-500">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{primaryMetric === 'vgv' ? dictionary.financial_dashboard.kpi.profit : 'Net Cashflow'}</p>
                    <p className="text-2xl font-extrabold text-green-600">{formatCurrency(totalNet)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        {primaryMetric === 'noi' ? 'Cap Rate (Exit)' : primaryMetric === 'vgv' ? dictionary.financial_dashboard.kpi.margin : 'Yield'}
                    </p>
                    <p className="text-2xl font-extrabold text-cyan-600">
                        {primaryMetric === 'noi' ? '5.2%' : margin.toFixed(1) + '%'}
                    </p>
                    {primaryMetric === 'noi' && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-100">
                            <div className="h-full bg-cyan-500 w-3/4 animate-pulse" />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Visual Section */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 flex gap-2">
                    <button
                        onClick={() => setView('chart')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'chart' ? 'bg-[#081F2E] text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        {dictionary.financial_dashboard.views.chart}
                    </button>
                    <button
                        onClick={() => setView('table')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'table' ? 'bg-[#081F2E] text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        {dictionary.financial_dashboard.views.table}
                    </button>
                </div>

                <div className="mb-8">
                    <h3 className="text-xl font-extrabold text-[#081F2E]">{dictionary.financial_dashboard.title}</h3>
                    <p className="text-sm text-gray-500 font-medium">{dictionary.financial_dashboard.subtitle}</p>
                </div>

                {view === 'chart' ? (
                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={months} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#081F2E" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#081F2E" stopOpacity={0.4} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 10, fontWeight: 'bold' }}
                                    axisLine={false}
                                    tickLine={false}
                                    label={{ value: dictionary.financial_dashboard.units.months, position: 'insideBottom', offset: -5, fontSize: 12, fontWeight: 'bold' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fontWeight: 'bold' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${(value / 1000).toLocaleString()}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [formatCurrency(Number(value)), '']}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <ReferenceLine y={0} stroke="#000" strokeWidth={1} />
                                <Area
                                    type="monotone"
                                    name={dictionary.financial_dashboard.table.balance}
                                    dataKey="cumulative"
                                    stroke="#081F2E"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCumulative)"
                                />
                                <Area
                                    type="monotone"
                                    name={dictionary.financial_dashboard.table.revenue}
                                    dataKey="revenue"
                                    stroke="#06b6d4"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                                <Area
                                    type="monotone"
                                    name={dictionary.financial_dashboard.table.expenses}
                                    dataKey="costs"
                                    stroke="#f43f5e"
                                    fillOpacity={1}
                                    fill="url(#colorCosts)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                        <table className="w-full text-sm">
                            <thead className="bg-[#081F2E] text-white uppercase font-bold text-[10px] tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 text-left">{dictionary.financial_dashboard.table.month}</th>
                                    <th className="px-6 py-4 text-right">{dictionary.financial_dashboard.table.revenue}</th>
                                    <th className="px-6 py-4 text-right">{dictionary.financial_dashboard.table.expenses}</th>
                                    <th className="px-6 py-4 text-right">{dictionary.financial_dashboard.table.net_flow}</th>
                                    <th className="px-6 py-4 text-right">{dictionary.financial_dashboard.table.balance}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {months.map(m => (
                                    <tr key={m.month} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-400">{dictionary.financial_dashboard.table.month} {m.month}</td>
                                        <td className="px-6 py-4 text-right text-cyan-600 font-bold">{m.revenue > 0 ? formatCurrency(m.revenue) : '-'}</td>
                                        <td className="px-6 py-4 text-right text-red-500 font-medium">{m.costs > 0 ? `(${formatCurrency(m.costs)})` : '-'}</td>
                                        <td className={`px-6 py-4 text-right font-bold ${m.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(m.net)}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-black ${m.cumulative >= 0 ? 'text-gray-900' : 'text-red-700'}`}>
                                            {formatCurrency(m.cumulative)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-bold text-[#081F2E] mb-4">{dictionary.financial_dashboard.highlights.title}</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500 font-medium">{dictionary.financial_dashboard.highlights.max_exposure}</span>
                            <span className="text-sm font-bold text-red-600">{formatCurrency(Math.abs(maxExposure))}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500 font-medium">{dictionary.financial_dashboard.highlights.breakeven}</span>
                            <span className="text-sm font-bold text-gray-900">
                                {dictionary.financial_dashboard.table.month} {months.find((m, i) => m.cumulative > 0 && (i === 0 || months[i - 1].cumulative <= 0))?.month || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500 font-medium">{dictionary.financial_dashboard.highlights.sales_duration}</span>
                            <span className="text-sm font-bold text-gray-900">{months.filter(m => m.revenue > 0).length} {dictionary.financial_dashboard.units.months}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#081F2E] to-[#0F3A52] p-8 rounded-3xl text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            {dictionary.financial_dashboard.ai.title}
                        </h4>
                        <div className="text-sm text-gray-300 leading-relaxed mb-6 italic min-h-[100px]">
                            {loadingAI ? (
                                <div className="space-y-2 animate-pulse">
                                    <div className="h-2 bg-gray-700 rounded w-full" />
                                    <div className="h-2 bg-gray-700 rounded w-5/6" />
                                    <div className="h-2 bg-gray-700 rounded w-4/6" />
                                </div>
                            ) : currentAnalysis || dictionary.financial_dashboard.ai.empty}
                        </div>
                    </div>
                    <button
                        onClick={handleRecalculateAI}
                        disabled={loadingAI}
                        className={`font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${loadingAI ? 'bg-gray-600 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 text-[#081F2E] active:scale-95'}`}
                    >
                        {loadingAI ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {dictionary.financial_dashboard.ai.loading}
                            </>
                        ) : dictionary.financial_dashboard.ai.button}
                    </button>
                </div>
            </div>

            {/* Concepts Library (Glossary) */}
            <div className="mt-12 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-extrabold text-[#081F2E]">{dictionary.glossary?.title || "BrixAurea Methodology"}</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{dictionary.glossary?.subtitle || "Global Real Estate Concepts"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(dictionary.glossary?.items || {}).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-hover hover:shadow-md">
                            <p className="text-sm leading-relaxed text-gray-600">
                                {String(value)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
