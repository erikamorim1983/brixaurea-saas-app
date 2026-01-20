import { getDictionary } from '@/get-dictionary';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function InsightArticlePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
    const { lang, slug } = await params;
    const dictionary = await getDictionary(lang);
    const supabase = await createClient();

    // Fetch the specific insight from the database
    const { data: dbArticle, error } = await supabase
        .from('insights')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !dbArticle) {
        return (
            <div className="p-20 text-center">
                <h1 className="text-2xl font-bold">Insight not found</h1>
                <p className="text-gray-500 mt-4">Slug: {slug}</p>
                {error && <p className="text-red-500 mt-2">{error.message}</p>}
                <Link href={`/${lang}/dashboard/insights`} className="text-cyan-600 mt-8 inline-block">Back to list</Link>
            </div>
        );
    }

    // Context formatting for presentation
    const article = {
        title: dbArticle[`title_${lang}`] || dbArticle.title_en,
        category: dbArticle.category,
        published_at: dbArticle.published_at,
        read_time: dbArticle.read_time_minutes,
        image_url: dbArticle.image_url,
        author: dbArticle.author ? `${dbArticle.author.first_name} ${dbArticle.author.last_name}` : 'BrixAurea Team',
        content: dbArticle[`content_${lang}`] || dbArticle.content_en || '<p>Content in progress...</p>'
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href={`/${lang}/dashboard/insights`} className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-cyan-600 mb-12 transition-colors group">
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                {lang === 'pt' ? 'Voltar para Insights' : 'Back to Insights'}
            </Link>

            <article>
                <header className="mb-12">
                    {article.image_url && (
                        <div className="w-full h-[400px] rounded-[2rem] overflow-hidden mb-12 shadow-2xl shadow-cyan-900/10">
                            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-cyan-50 text-cyan-600 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-cyan-100">
                            {article.category}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {article.read_time} MIN READ
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                        {article.title}
                    </h1>

                    <div className="flex items-center gap-4 py-8 border-y border-gray-100">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#081F2E] to-[#0F3A52] flex items-center justify-center font-bold text-white italic shadow-lg shadow-cyan-500/20">
                            BA
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-widest">{article.author}</p>
                            <p className="text-xs text-gray-500 font-medium">BrixAurea Intelligence Strategy</p>
                        </div>
                    </div>
                </header>

                <div
                    className="prose prose-lg prose-cyan max-w-none text-gray-700 leading-relaxed font-medium"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                <footer className="mt-20 pt-12 border-t border-gray-100">
                    <div className="bg-gray-900 shadow-2xl shadow-cyan-900/10 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>

                        <div className="relative z-10 text-center md:text-left">
                            <h4 className="text-2xl font-bold text-white mb-2">
                                {lang === 'pt' ? 'Análise Personalizada' : 'Customized Analysis'}
                            </h4>
                            <p className="text-gray-400 text-sm">
                                {lang === 'pt' ? 'Nossa equipe de especialistas está pronta para analisar seu projeto.' : 'Our team of experts is ready to analyze your project.'}
                            </p>
                        </div>
                        <button className="relative z-10 bg-white text-gray-900 font-black uppercase tracking-widest text-[10px] px-8 py-5 rounded-2xl hover:bg-cyan-500 hover:text-white transition-all shadow-xl active:scale-95 whitespace-nowrap">
                            {lang === 'pt' ? 'Falar com Especialista' : 'Talk to an Expert'}
                        </button>
                    </div>
                </footer>
            </article>
        </div>
    );
}
