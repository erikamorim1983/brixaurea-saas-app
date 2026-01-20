import { getDictionary } from "../../../get-dictionary";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";

// Hardcoded articles data
const articles = [
    {
        slug: "ia-nao-e-oraculo-parceiro",
        titlePt: "IA não é oráculo. É parceiro. E parceiro precisa de limites.",
        titleEn: "AI is not an Oracle. It is a Partner. And partners need limits.",
        titleEs: "La IA no es un Oráculo. Es un Socio. Y los socios necesitan límites.",
        summaryPt: "Por que a IA generativa é uma ferramenta poderosa, mas exige responsabilidade e contexto humano.",
        summaryEn: "Why generative AI is a powerful tool but requires human responsibility and context.",
        summaryEs: "Por qué la IA generativa es una herramienta poderosa, pero exige responsabilidad y contexto humano.",
        category: "Tech",
        date: "14 Jan. 2026",
        readTime: 5,
        image: "/images/blog/ai_partner_insight.png"
    },
    {
        slug: "estruturacao-financeira-real-estate",
        titlePt: "Estruturação Financeira: O Diferencial entre Lucro e Prejuízo",
        titleEn: "Financial Structuring: The Gap Between Profit and Loss",
        titleEs: "Estructuración Financiera: La Diferencia entre Lucro y Pérdida",
        summaryPt: "Como a estruturação profissional de capital pode salvar um projeto imobiliário de juros altos e margens baixas.",
        summaryEn: "How professional capital structuring can save a real estate project from high interest and low margins.",
        summaryEs: "Cómo la estructuración profesional de capital puede salvar un proyecto inmobiliario de intereses altos.",
        category: "Investment",
        date: "14 Jan. 2026",
        readTime: 7,
        image: "/images/blog/blog_finance_insight.png"
    },
    {
        slug: "maximizar-gdv-mix-unidades",
        titlePt: "Maximizar o GDV: A Ciência do Mix de Unidades",
        titleEn: "Maximizing GDV: The Science of Unit Mix",
        titleEs: "Maximizar el GDV: La Ciencia del Mix de Unidades",
        summaryPt: "Por que escolher a tipologia certa é a decisão mais crítica na fase inicial da viabilidade.",
        summaryEn: "Why choosing the right typology (beds/baths) is the most critical decision in early feasibility.",
        summaryEs: "Por qué elegir la tipología correcta es la decisión más crítica en la fase inicial de viabilidad.",
        category: "Market",
        date: "14 Jan. 2026",
        readTime: 6,
        image: "/images/blog/blog_real_estate_insight.png"
    }
];

export default async function InsightsPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Header lang={lang} dictionary={dictionary} />

            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <header className="mb-16 text-center">
                        <span className="inline-block px-4 py-1.5 bg-cyan-100 text-cyan-700 text-sm font-black uppercase tracking-[0.2em] rounded-full mb-4">
                            BrixAurea Intelligence
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                            {lang === 'pt' ? 'Publicações & Insights' : lang === 'es' ? 'Publicaciones e Insights' : 'Publications & Insights'}
                        </h1>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                            {lang === 'pt'
                                ? 'Análises aprofundadas sobre o mercado imobiliário, tendências de construção e tecnologia.'
                                : lang === 'es'
                                    ? 'Análisis profundos sobre el mercado inmobiliario, tendencias de construcción y tecnología.'
                                    : 'Deep dives into real estate market trends, construction, and technology.'}
                        </p>
                    </header>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Link
                                key={article.slug}
                                href={`/${lang}/insights/${article.slug}`}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-300 flex flex-col active:scale-[0.98]"
                            >
                                {/* Image */}
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    <Image
                                        src={article.image}
                                        alt={lang === 'pt' ? article.titlePt : lang === 'es' ? article.titleEs : article.titleEn}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black text-cyan-700 uppercase tracking-widest border border-cyan-100">
                                            {article.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-tighter">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {article.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {article.readTime} min
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                                        {lang === 'pt' ? article.titlePt : lang === 'es' ? article.titleEs : article.titleEn}
                                    </h3>

                                    <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">
                                        {lang === 'pt' ? article.summaryPt : lang === 'es' ? article.summaryEs : article.summaryEn}
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
                            </Link>
                        ))}
                    </div>
                </div>
            </main>

            <Footer lang={lang} dictionary={dictionary} />
        </div>
    );
}
