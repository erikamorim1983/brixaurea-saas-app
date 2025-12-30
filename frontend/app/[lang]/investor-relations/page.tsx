'use client';

import React from 'react';
import Link from 'next/link';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    ComposedChart
} from 'recharts';

// Simulation Data: Costs remain flat while Revenue scales exponentially
const scalabilityData = [
    { clients: 0, revenue: 0, cost: 500, margin: 0 },
    { clients: 20, revenue: 5980, cost: 520, margin: 91 },
    { clients: 50, revenue: 14950, cost: 550, margin: 96 },
    { clients: 100, revenue: 29900, cost: 600, margin: 98 },
    { clients: 500, revenue: 149500, cost: 1000, margin: 99 },
    { clients: 1000, revenue: 299000, cost: 1500, margin: 99.6 },
];

const usMarketData = [
    { name: 'TAM (Total US)', value: 12000, label: '$12B (Software Construção)' },
    { name: 'SAM (Sunbelt)', value: 4500, label: '$4.5B (Flórida/Texas/Etc)' },
    { name: 'SOM (Meta Inicial)', value: 50, label: '$50M (5 Anos)' },
];

const valuationData = [
    { method: 'Receita (ARR)', min: 28, max: 43, avg: 35.5, label: '$28M - $43M' },
    { method: 'EBITDA (15x)', min: 35, max: 52, avg: 43.5, label: '$35M - $52M' },
    { method: 'DCF (3 anos)', min: 50, max: 100, avg: 75, label: '$50M - $100M+' },
];

export default function InvestorRelationsPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* HEROS SECTION */}
            <div className="relative bg-[#081F2E] text-white">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-900/30 to-transparent"></div>
                </div>

                <div className="relative container mx-auto px-4 py-24 max-w-6xl">
                    <div className="inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                        Confidential • Investor Briefing
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        <span className="block text-2xl md:text-3xl font-medium text-cyan-400 mb-2">BrixAurea</span>
                        Technical Asset <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            & Valuation Packet
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                        Uma análise detalhada dos ativos de propriedade intelectual, unit economics auditados e metodologia de valuation para a Série A.
                    </p>
                </div>
            </div>

            {/* 1. THE VALUATION THESIS (WHY?) */}
            <section className="py-20 bg-gray-50 border-b border-gray-200">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-sm font-bold text-cyan-600 uppercase tracking-widest mb-2">Unit Economics & Escalabilidade</h2>
                            <h3 className="text-3xl font-bold text-[#081F2E] mb-6">Por que um Valuation de SaaS Premium?</h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                Operamos com métricas financeiras raras mesmo para o Vale do Silício. Diferente de consultorias (Modelo Linear), nosso custo marginal tende a zero.
                            </p>
                            <ul className="space-y-6">
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 mr-4 font-bold text-xl">99%</div>
                                    <div>
                                        <strong className="block text-gray-900 text-lg">Margem Bruta (Gross Margin)</strong>
                                        <span className="text-gray-600 text-sm">Estrutura 100% serverless. A cada $100 de receita, $99.60 é lucro bruto para reinvestimento.</span>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mr-4 font-bold text-xl">$299</div>
                                    <div>
                                        <strong className="block text-gray-900 text-lg">ARPU (Receita Média por Usuário)</strong>
                                        <span className="text-gray-600 text-sm">Bem acima da média de mercado ($30-$100), pois entregamos valor financeiro direto (ROI).</span>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mr-4 font-bold text-xl">IP</div>
                                    <div>
                                        <strong className="block text-gray-900 text-lg">Defensibilidade Tecnológica</strong>
                                        <span className="text-gray-600 text-sm">Algoritmos proprietários e não apenas um "wrapper" de IA. Isso cria um "Moat" defensável.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* CHART: SCALABILITY */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-[450px]">
                            <h4 className="text-center text-gray-500 text-sm font-semibold mb-2">Simulação: A "Boca de Jacaré" (Receita vs Custo)</h4>
                            <p className="text-center text-xs text-gray-400 mb-6">Margem de 99.6% em escala</p>
                            <ResponsiveContainer width="100%" height="90%">
                                <AreaChart data={scalabilityData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="clients" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${value / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px' }}
                                        formatter={(value: number | undefined) => [value ? `$${value.toLocaleString()}` : '', '']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#06b6d4" fill="url(#colorRevenue)" name="Receita" />
                                    <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} dot={false} name="Custo Infra" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW SECTION: VALUATION ANALYSIS */}
            <section className="py-20 bg-[#081F2E] text-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="text-cyan-400 font-bold tracking-widest text-sm uppercase">Análise Financeira</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2">Cenários de Valuation</h2>
                        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                            Com base em múltiplos de SaaS High-Growth (8x-12x ARR) e projeção de fluxo de caixa descontado.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* CHART: VALUATION RANGES */}
                        <div className="h-[350px] w-full bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={valuationData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#ffffff20" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="method" type="category" stroke="#fff" width={120} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                                        labelStyle={{ color: '#94a3b8' }}
                                    />
                                    <Bar dataKey="min" stackId="a" fill="transparent" barSize={30} />
                                    <Bar dataKey="max" stackId="a" fill="#22d3ee" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#fff', fontSize: 12, formatter: (val: any) => `$${val}M` }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* KEY METRICS CARDS */}
                        <div className="grid gap-6">
                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700">
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="text-gray-400 text-sm font-medium">Valuation Estimado (Atual)</h4>
                                    <span className="text-cyan-400 font-bold">Base: MVP + Tração</span>
                                </div>
                                <div className="text-4xl font-bold text-white mb-2">$25M - $40M</div>
                                <p className="text-xs text-gray-500">Considerando múltiplos de 8x-12x ARR projetado para 1k tenants.</p>
                            </div>

                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                </div>
                                <div className="flex justify-between items-end mb-2">
                                    <h4 className="text-gray-400 text-sm font-medium">Valuation Potencial (36 Meses)</h4>
                                    <span className="text-purple-400 font-bold">Base: Scale + AI + Network</span>
                                </div>
                                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">$100M+</div>
                                <p className="text-xs text-gray-500">Cenário com 5k tenants e camadas de AI Preditiva ativas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. ASSET INVENTORY (WHAT WE BUILT) */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#081F2E]">Base de Ativos (IP Diferenciado)</h2>
                        <p className="text-gray-500 mt-4">Tecnologia proprietária que sustenta o múltiplo de valuation.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Asset 1 */}
                        <div className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all border border-gray-100 group">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3">Serverless Architecture</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Next.js 15, Supabase c/ Row Level Security e Vercel Edge Functions. <strong>Sem dívida técnica</strong> e pronto para escalar globalmente (Multi-region).
                            </p>
                        </div>

                        {/* Asset 2 */}
                        <div className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all border border-gray-100 group">
                            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600 mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3">"Magic Analysis" Engine</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Reduz o ciclo de análise de viabilidade de 15 dias para 2 minutos. Integração profunda com APIs de Zoneamento e Dados de Mercado.
                            </p>
                        </div>

                        {/* Asset 3 */}
                        <div className="p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all border border-gray-100 group">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3">Enterprise Security</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                ISO 27001 Readiness. Logs de auditoria completos, criptografia em repouso e trânsito, e RBAC (Role-Based Access Control) nativo.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. ROADMAP TIMELINE */}
            <section className="py-20 bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#081F2E]">Roadmap de Valor</h2>
                        <p className="text-gray-500 mt-2">Como vamos destravar valor e criar efeito de rede.</p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex relative pb-12 border-l-2 border-cyan-500 pl-8">
                            <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-cyan-500 ring-4 ring-gray-100"></span>
                            <div>
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded mb-2">Q1 2026 (MVP)</span>
                                <h3 className="text-xl font-bold text-gray-900">Fundação Validada</h3>
                                <p className="text-gray-600 mt-2">
                                    Produto estável, billing automático e primeiros clientes pagantes validando a hipótese de resolução de dor.
                                </p>
                            </div>
                        </div>

                        <div className="flex relative pb-12 border-l-2 border-gray-200 pl-8">
                            <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-300 ring-4 ring-gray-100"></span>
                            <div>
                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded mb-2">Q2 2026 (GROWTH)</span>
                                <h3 className="text-xl font-bold text-gray-900">The Network Effect</h3>
                                <p className="text-gray-600 mt-2">
                                    Lançamento do Portal do Investidor e Marketplace. Cria viralidade onde cada desenvolvedor traz seus investidores para dentro da plataforma.
                                </p>
                            </div>
                        </div>

                        <div className="flex relative pl-8">
                            <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-300 ring-4 ring-gray-100"></span>
                            <div>
                                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded mb-2">Q3 2026 (SCALE)</span>
                                <h3 className="text-xl font-bold text-gray-900">AI & Predictive Analytics</h3>
                                <p className="text-gray-600 mt-2">
                                    Machine Learning para prever tendências de mercado e custos. Aumento drástico da barreira de entrada competitiva.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <Link href="/" className="text-gray-500 hover:text-cyan-600 font-medium text-sm">
                            ← Voltar para a Home
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
