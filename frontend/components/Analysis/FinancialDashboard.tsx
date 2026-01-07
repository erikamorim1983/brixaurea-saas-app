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
        months: MonthData[];
    };
    lang: string;
    dictionary: any;
}

export default function FinancialDashboard({ data, lang, dictionary }: FinancialDashboardProps) {
    const [view, setView] = useState<'chart' | 'table'>('chart');
    const { months, totalGDV, totalCosts } = data;

    const totalNet = totalGDV - totalCosts;
    const margin = totalGDV > 0 ? (totalNet / totalGDV) * 100 : 0;
    const maxExposure = Math.min(...months.map(m => m.cumulative));

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: lang === 'pt' ? 'BRL' : 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gross Revenue (GDV)</p>
                    <p className="text-2xl font-extrabold text-[#081F2E]">{formatCurrency(totalGDV)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Project Costs</p>
                    <p className="text-2xl font-extrabold text-red-600">{formatCurrency(totalCosts)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Net Profit</p>
                    <p className="text-2xl font-extrabold text-green-600">{formatCurrency(totalNet)}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Profitability Margin</p>
                    <p className="text-2xl font-extrabold text-cyan-600">{margin.toFixed(1)}%</p>
                </div>
            </div>

            {/* Main Visual Section */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 flex gap-2">
                    <button
                        onClick={() => setView('chart')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'chart' ? 'bg-[#081F2E] text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        Chart View
                    </button>
                    <button
                        onClick={() => setView('table')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'table' ? 'bg-[#081F2E] text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        Table View
                    </button>
                </div>

                <div className="mb-8">
                    <h3 className="text-xl font-extrabold text-[#081F2E]">Project Cash Flow</h3>
                    <p className="text-sm text-gray-500 font-medium">Monthly visualization of incomes and expenses across the project lifecycle.</p>
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
                                    label={{ value: 'Months', position: 'insideBottom', offset: -5, fontSize: 12, fontWeight: 'bold' }}
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
                                    name="Cumulative Cash Flow"
                                    dataKey="cumulative"
                                    stroke="#081F2E"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCumulative)"
                                />
                                <Area
                                    type="monotone"
                                    name="Monthly Revenue"
                                    dataKey="revenue"
                                    stroke="#06b6d4"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                                <Area
                                    type="monotone"
                                    name="Monthly Costs"
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
                                    <th className="px-6 py-4 text-left">Month</th>
                                    <th className="px-6 py-4 text-right">Revenue (+)</th>
                                    <th className="px-6 py-4 text-right">Expenses (-)</th>
                                    <th className="px-6 py-4 text-right">Net Flow</th>
                                    <th className="px-6 py-4 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {months.map(m => (
                                    <tr key={m.month} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-400">Month {m.month}</td>
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
                    <h4 className="text-lg font-bold text-[#081F2E] mb-4">Investment Highlights</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500 font-medium">Maximum Cash Exposure</span>
                            <span className="text-sm font-bold text-red-600">{formatCurrency(Math.abs(maxExposure))}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500 font-medium">Turning Point (Breakeven)</span>
                            <span className="text-sm font-bold text-gray-900">
                                Month {months.find((m, i) => m.cumulative > 0 && (i === 0 || months[i - 1].cumulative <= 0))?.month || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500 font-medium">Sales Duration</span>
                            <span className="text-sm font-bold text-gray-900">{months.filter(m => m.revenue > 0).length} Months</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#081F2E] to-[#0F3A52] p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h4 className="text-lg font-bold mb-4">BrixAura Dynamic Insight</h4>
                    <p className="text-sm text-gray-300 leading-relaxed mb-6">
                        {margin > 20
                            ? "This project shows a very healthy profitability margin. The cumulative cash flow indicates a stable recovery period once sales initiate."
                            : "Profitability is within industry standards. Consider optimizing hard costs or accelerating the sales curve to reduce max cash exposure."}
                    </p>
                    <button className="bg-cyan-500 hover:bg-cyan-400 text-[#081F2E] font-bold px-6 py-2 rounded-xl text-xs transition-all shadow-lg">
                        Optimize Scenarios
                    </button>
                </div>
            </div>
        </div>
    );
}
