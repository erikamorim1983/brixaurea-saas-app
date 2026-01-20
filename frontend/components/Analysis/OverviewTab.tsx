'use client';

interface OverviewTabProps {
    project: any;
    location: any;
    subtype?: any;
    lang: string;
    dict: any;
}

export default function OverviewTab({ project, location, subtype, lang, dict }: OverviewTabProps) {
    const getLocalizedName = (item: any) => {
        if (!item) return '';
        if (lang === 'pt') return item.name_pt || item.name;
        if (lang === 'es') return item.name_es || item.name;
        return item.name_en || item.name;
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-fadeIn">
            {/* Project Header Hook */}
            <div className="bg-gradient-to-br from-[#081F2E] to-[#0F3A52] p-8 text-white relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2 relative z-10">{project.name}</h3>
                <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 relative z-10">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    {subtype ? getLocalizedName(subtype) : 'Draft Project'}
                </p>
            </div>

            <div className="p-8 space-y-8">
                {/* Location Info */}
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{dict.projects?.new?.form?.address}</p>
                            <p className="text-sm font-bold text-gray-900 leading-tight">{location?.address_full}</p>
                            <p className="text-xs text-gray-500 mt-1">{location?.city}, {location?.state_code} {location?.zip_code}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{dict.analysis?.overview?.lot_size || 'Lot Size'}</p>
                            <p className="text-sm font-bold text-gray-900">
                                {location?.lot_size_acres ? `${location.lot_size_acres} Acres` : '---'}
                                <span className="text-xs text-gray-400 font-medium ml-2">
                                    ({location?.zoning_code || 'No Zoning'})
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-100 group hover:bg-cyan-100 transition-colors">
                        <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">Target ROI</p>
                        <p className="text-xl font-black text-gray-900">22.4%</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-green-50 border border-green-100 group hover:bg-green-100 transition-colors">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Net Margin</p>
                        <p className="text-xl font-black text-gray-900">18.5%</p>
                    </div>
                </div>

                {/* Status & Timeline CTA */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Project Health</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`w-3 h-1.5 rounded-full ${i <= 4 ? 'bg-cyan-500' : 'bg-gray-100'}`} />
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 leading-relaxed italic">
                            {lang === 'pt'
                                ? "Este projeto está em fase de rascunho. Configure o orçamento e cronograma para ver indicadores reais."
                                : "This project is in draft stage. Configure budget and schedule to see actual indicators."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
