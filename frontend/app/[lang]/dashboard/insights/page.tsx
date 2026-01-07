import InsightCard from '@/components/Intelligence/InsightCard';
import { getDictionary } from '@/get-dictionary';
import { createClient } from '@/lib/supabase/server';

export default async function InsightsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);
    const supabase = await createClient();

    // Fetch insights from the database
    const { data: dbInsights } = await supabase
        .from('insights')
        .select('*')
        .order('published_at', { ascending: false });

    // Map database insights to the expected format for InsightCard
    const insights = (dbInsights || []).map(item => ({
        id: item.id,
        slug: item.slug,
        title: item[`title_${lang}`] || item.title_en,
        summary: item[`summary_${lang}`] || item.summary_en,
        category: item.category,
        published_at: item.published_at,
        read_time: item.read_time_minutes,
        image_url: item.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'
    }));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-cyan-500 text-white p-2 rounded-xl shadow-lg shadow-cyan-500/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </span>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight font-display">
                        BrixAurea <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Intelligence</span>
                    </h1>
                </div>
                <p className="text-lg text-gray-500 max-w-2xl">
                    {lang === 'pt'
                        ? 'Análises profundas sobre o mercado imobiliário, tendências financeiras e inteligência estratégica para o seu sucesso.'
                        : 'Deep analysis of the real estate market, financial trends, and strategic intelligence for your success.'
                    }
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {insights.length > 0 ? (
                    insights.map((insight) => (
                        <InsightCard key={insight.id} insight={insight} lang={lang} />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-gray-400 font-bold uppercase tracking-widest italic">
                            {lang === 'pt' ? 'Nenhuma inteligência disponível no momento.' : 'No intelligence available at the moment.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Newsletter / CTA Section */}
            <div className="mt-20 bg-gray-900 rounded-[2rem] p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] group-hover:bg-cyan-500/20 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-all duration-700"></div>

                <div className="relative z-10 text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        {lang === 'pt' ? 'Fique à frente do mercado' : 'Stay ahead of the market'}
                    </h2>
                    <p className="text-gray-400 mb-8">
                        {lang === 'pt'
                            ? 'Receba análises exclusivas e tendências do BrixAurea Intelligence diretamente no seu e-mail.'
                            : 'Receive exclusive analysis and trends from BrixAurea Intelligence directly in your email.'
                        }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="email"
                            placeholder={lang === 'pt' ? 'Seu melhor e-mail' : 'Your best email'}
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        />
                        <button className="bg-cyan-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20 active:scale-95">
                            {lang === 'pt' ? 'Inscrever-se' : 'Subscribe'}
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-6 uppercase tracking-widest font-bold">
                        {lang === 'pt' ? 'Sem SPAM. Apenas inteligência pura.' : 'No SPAM. Just pure intelligence.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
