import { getDictionary } from '@/get-dictionary';

export default async function ReportsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="relative group">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/30 transition-all duration-700 animate-pulse"></div>
                <div className="relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl flex flex-col items-center text-center max-w-md">
                    {/* BrixAurea Logo */}
                    <div className="w-20 h-20 bg-gradient-to-br from-[#081F2E] to-[#0F3A52] rounded-3xl flex items-center justify-center shadow-xl shadow-cyan-900/20 mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                        <svg className="w-10 h-10 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                        BrixAurea <span className="text-cyan-600">Reports</span>
                    </h1>

                    <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mb-6"></div>

                    <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                        {lang === 'pt'
                            ? 'Estamos preparando relatórios analíticos avançados e ferramentas de exportação personalizada para você.'
                            : 'We are preparing advanced analytical reports and customized export tools for you.'
                        }
                    </p>

                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 text-cyan-600 rounded-2xl text-sm font-black uppercase tracking-widest border border-cyan-100 animate-bounce">
                        {lang === 'pt' ? 'Em Breve' : 'Coming Soon'}
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-50 w-full grid grid-cols-2 gap-4">
                        <div className="text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xs font-bold text-gray-900">BrixAurea</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Version</p>
                            <p className="text-xs font-bold text-gray-900">v0.9.4</p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
                Automated Intelligence by BrixAurea
            </p>
        </div>
    );
}
