'use client';

import Link from 'next/link';

interface InsightCardProps {
    insight: {
        id: string;
        slug: string;
        title: string;
        summary: string;
        category: string;
        image_url?: string;
        published_at: string;
        read_time: number;
    };
    lang: string;
}

export default function InsightCard({ insight, lang }: InsightCardProps) {
    const formattedDate = new Date(insight.published_at).toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    return (
        <Link href={`/${lang}/dashboard/insights/${insight.slug}`} className="group">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-300 flex flex-col h-full active:scale-[0.98]">
                {/* Image Placeholder / Banner */}
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                    {insight.image_url ? (
                        <img
                            src={insight.image_url}
                            alt={insight.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                            <svg className="w-12 h-12 text-cyan-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 2v4a2 2 0 002 2h4" />
                            </svg>
                        </div>
                    )}
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black text-cyan-700 uppercase tracking-widest border border-cyan-100">
                            {insight.category}
                        </span>
                    </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-tighter">
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {formattedDate}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {insight.read_time} min
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                        {insight.title}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">
                        {insight.summary}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <span className="text-xs font-bold text-cyan-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            {lang === 'pt' ? 'Ler mais' : lang === 'es' ? 'Leer más' : 'Read more'}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-200"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
