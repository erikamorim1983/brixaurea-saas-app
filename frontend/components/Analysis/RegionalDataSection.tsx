'use client';

import { RegionalData } from "@/services/regional-data.service";

interface RegionalDataProps {
    data: RegionalData;
    lang: string;
    dict: any;
    stateCode?: string;
    address?: string;
}

export default function RegionalDataSection({ data, lang, dict, stateCode, address }: RegionalDataProps) {
    if (!data) return null;

    const t = dict?.analysis?.regional_data || {};
    const t_metrics = t?.metrics || {};
    const t_sections = t?.sections || {};
    const t_schools = t?.schools || {};
    const t_roles = t?.leadership_roles || {};

    const getStateCode = (code?: string) => {
        if (!code) return null;
        if (code.length === 2) return code.toLowerCase();
        const states: Record<string, string> = {
            'alabama': 'al', 'alaska': 'ak', 'arizona': 'az', 'arkansas': 'ar', 'california': 'ca',
            'colorado': 'co', 'connecticut': 'ct', 'delaware': 'de', 'florida': 'fl', 'georgia': 'ga',
            'hawaii': 'hi', 'idaho': 'id', 'illinois': 'il', 'indiana': 'in', 'iowa': 'ia',
            'kansas': 'ks', 'kentucky': 'ky', 'louisiana': 'la', 'maine': 'me', 'maryland': 'md',
            'massachusetts': 'ma', 'michigan': 'mi', 'minnesota': 'mn', 'mississippi': 'ms', 'missouri': 'mo',
            'montana': 'mt', 'nebraska': 'ne', 'nevada': 'nv', 'new hampshire': 'nh', 'new jersey': 'nj',
            'new mexico': 'nm', 'new york': 'ny', 'north carolina': 'nc', 'north dakota': 'nd', 'ohio': 'oh',
            'oklahoma': 'ok', 'oregon': 'or', 'pennsylvania': 'pa', 'rhode island': 'ri', 'south carolina': 'sc',
            'south dakota': 'sd', 'tennessee': 'tn', 'texas': 'tx', 'utah': 'ut', 'vermont': 'vt',
            'virginia': 'va', 'washington': 'wa', 'west virginia': 'wv', 'wisconsin': 'wi', 'wyoming': 'wy'
        };
        return states[code.toLowerCase()] || null;
    };

    const finalStateCode = getStateCode(stateCode);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-[#081F2E] flex items-center gap-3">
                        {finalStateCode ? (
                            <img
                                src={`https://flagcdn.com/w80/us-${finalStateCode}.png`}
                                alt={stateCode}
                                className="w-8 h-auto rounded shadow-sm border border-gray-100"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const span = document.createElement('span');
                                    span.innerText = '🏙️';
                                    e.currentTarget.parentNode?.prepend(span);
                                }}
                            />
                        ) : (
                            <span className="text-2xl">🏙️</span>
                        )}
                        {t.title || 'Regional & Civic Data'}
                    </h3>
                    {address && (
                        <p className="text-sm text-gray-400 font-medium ml-11">
                            📍 {address}
                        </p>
                    )}
                </div>
                <span className="text-xs text-gray-400 italic">
                    {t.source || 'Source: Brix Aurea Demo Global Data'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* 1. LIDERANÇA */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                        {t_sections.leadership || 'Liderança'}
                    </h4>
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 min-w-[2.5rem] rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                                {data.politicians.mayor.photoUrl ? (
                                    <img
                                        src={data.politicians.mayor.photoUrl}
                                        alt="Mayor"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                            if (e.currentTarget.parentElement) e.currentTarget.parentElement.innerText = '🏛️';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg">🏛️</div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] text-gray-400 font-medium uppercase">{t_roles.mayor || 'Prefeito(a)'}</p>
                                <p className="font-bold text-[#081F2E] text-sm truncate">{data.politicians.mayor.name}</p>
                                <p className="text-xs text-[#00D9FF]">{data.politicians.mayor.party}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 min-w-[2.5rem] rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                                {data.politicians.governor.photoUrl ? (
                                    <img
                                        src={data.politicians.governor.photoUrl}
                                        alt="Governor"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                            if (e.currentTarget.parentElement) e.currentTarget.parentElement.innerText = '🇺🇸';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg">🇺🇸</div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] text-gray-400 font-medium uppercase">{t_roles.governor || 'Governador(a)'}</p>
                                <p className="font-bold text-[#081F2E] text-sm truncate">{data.politicians.governor.name}</p>
                                <p className="text-xs text-[#00D9FF]">{data.politicians.governor.party}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. DEMOGRAFIA */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                        {t_sections.demographics || 'Demografia'}
                    </h4>
                    <ul className="space-y-3 flex-1 text-sm">
                        <li className="flex justify-between items-center">
                            <span className="text-gray-600">{t_metrics.population || 'População'}</span>
                            <span className="font-bold font-mono text-gray-900">{data.demographics.population.toLocaleString()}</span>
                        </li>
                        {data.demographics.metroPopulation && (
                            <li className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs">
                                    {data.demographics.metroName || 'Região Metropolitana'}
                                </span>
                                <span className="font-bold font-mono text-blue-600 text-xs">
                                    {data.demographics.metroPopulation.toLocaleString()}
                                </span>
                            </li>
                        )}
                        <li className="flex justify-between items-center">
                            <span className="text-gray-600">{t_metrics.median_age || 'Idade Média'}</span>
                            <span className="font-bold font-mono text-gray-900">{data.demographics.medianAge}</span>
                        </li>
                        {data.demographics.foundingDate && (
                            <li className="flex justify-between items-center">
                                <span className="text-gray-600">{t_metrics.founding_date || 'Fundação'}</span>
                                <span className="font-bold font-mono text-gray-900">{data.demographics.foundingDate}</span>
                            </li>
                        )}
                    </ul>
                </div>

                {/* 3. ECONOMIA */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                        Economia
                    </h4>
                    <ul className="space-y-3 flex-1 text-sm">
                        <li className="flex justify-between items-center">
                            <span className="text-gray-600">{t_metrics.income || 'Renda Média'}</span>
                            <span className="font-bold font-mono text-green-600">${data.demographics.medianIncome.toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-gray-600">{t_metrics.unemployment || 'Taxa Desemprego'}</span>
                            <span className={`font-bold font-mono ${data.demographics.unemploymentRate < 5 ? 'text-green-600' : 'text-orange-500'}`}>
                                {data.demographics.unemploymentRate}%
                            </span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-gray-600">{t_metrics.job_growth || 'Cresc. Emprego'}</span>
                            <span className={`font-bold font-mono ${data.economics.jobGrowth > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {data.economics.jobGrowth > 0 ? '+' : ''}{data.economics.jobGrowth}%
                            </span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-gray-600">{t_metrics.interest_rate || 'Juros (ao ano)'}</span>
                            <span className="font-bold font-mono text-gray-900">
                                {data.economics.interestRate}%
                            </span>
                        </li>
                    </ul>
                </div>

                {/* 4. MERCADO (Imobiliário - Para APIs futuras) */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                        {t_sections.market || 'Mercado'}
                    </h4>
                    <ul className="space-y-3 flex-1 text-sm">
                        <li className="flex justify-between items-center">
                            <span className="text-gray-600">{t_metrics.home_value || 'Valor Médio'}</span>
                            <span className="font-bold font-mono text-gray-900">${data.economics.medianHomeValue.toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-gray-600">{t_metrics.rent_trend || 'Tend. Aluguel'}</span>
                            <span className={`font-bold font-mono ${data.economics.rentTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {data.economics.rentTrend > 0 ? '↑' : '↓'} {Math.abs(data.economics.rentTrend)}%
                            </span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-gray-600">{t_metrics.inventory || 'Meses Estoque'}</span>
                            <span className="font-bold font-mono text-gray-900">
                                {data.economics.inventoryLevel} mo
                            </span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-gray-600">{t_metrics.cap_rate || 'Cap Rate Médio'}</span>
                            <span className="font-bold font-mono text-[#00D9FF]">
                                {data.economics.capRate}%
                            </span>
                        </li>
                    </ul>
                </div>

                {/* 5. EDUCAÇÃO */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                        {t_sections.education || 'Educação'}
                    </h4>
                    <div className="space-y-3 flex-1">
                        {Object.entries(data.schools).map(([level, rating]) => (
                            <div key={level} className="flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] font-medium uppercase text-gray-500">
                                            {t_schools[level as keyof typeof t_schools] || level}
                                        </span>
                                        <span className="text-xs font-bold">{rating}/10</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${rating >= 7 ? 'bg-green-500' : rating >= 4 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                            style={{ width: `${rating * 10}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>



            {/* News Ticker Section */}
            <div className="bg-[#081F2E] text-white p-4 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-6xl">📰</span>
                </div>
                <h4 className="text-xs font-bold text-[#00D9FF] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#00D9FF] rounded-full animate-pulse"></span>
                    {t_sections.news || 'Breaking News'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {data.news.map((item, i) => (
                        <a
                            key={i}
                            href={item.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-3 items-start border-l-2 border-white/10 pl-3 hover:border-[#00D9FF] hover:bg-white/5 transition-all cursor-pointer py-1 rounded-r-lg group/news"
                        >
                            <div className="flex-1">
                                <p className="font-medium text-sm leading-snug group-hover/news:text-[#00D9FF] transition-colors line-clamp-2">{item.headline}</p>
                                <div className="flex gap-2 text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                                    <span className="text-[#00D9FF]/70">{item.source}</span>
                                    <span>•</span>
                                    <span>{item.date}</span>
                                </div>
                            </div>
                            <svg className="w-4 h-4 text-white/20 group-hover/news:text-[#00D9FF] transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    ))}
                </div>
            </div>
        </div >
    );
}
