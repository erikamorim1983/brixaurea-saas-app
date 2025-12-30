import { getDictionary } from "../../../../get-dictionary";
import Link from "next/link";
import { notFound } from "next/navigation";
import GoogleMapWrapper from "@/components/Maps/GoogleMapWrapper";
import PropertyMap from "@/components/Maps/PropertyMap";

export default async function FeaturePage({
    params,
}: {
    params: Promise<{ lang: string; slug: string }>;
}) {
    const { lang, slug } = await params;
    const dict = await getDictionary(lang);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const feature = (dict as any).feature_details?.[slug];

    if (!feature) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header / Nav Placeholder (Simplified for Minimalist request or could import Navbar) */}
            <header className="w-full py-6 px-4 border-b border-gray-100">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href={`/${lang}`} className="font-bold text-2xl text-[#081F2E]">
                        Brix<span className="text-cyan-400">Aurea</span>
                    </Link>
                    <Link href={`/${lang}/#features`} className="text-sm font-medium text-gray-500 hover:text-cyan-600">
                        ← {lang === 'en' ? 'Back to Features' : (lang === 'pt' ? 'Voltar' : 'Volver')}
                    </Link>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-cyan-50/50 skew-x-12 transform translate-x-20"></div>

                    <div className="container mx-auto px-4 max-w-5xl relative z-10">
                        <div className="inline-block mb-6 px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-widest rounded-full">
                            {lang === 'en' ? 'Feature' : (lang === 'pt' ? 'Funcionalidade' : 'Funcionalidad')}
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-[#081F2E] mb-6 leading-tight">
                            {feature.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-500 font-light max-w-3xl leading-relaxed">
                            {feature.subtitle}
                        </p>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="grid md:grid-cols-2 gap-16 items-start">

                            {/* Description Column */}
                            <div className="space-y-8">
                                <h3 className="text-2xl font-bold text-gray-900 border-l-4 border-cyan-400 pl-4">
                                    {lang === 'en' ? 'Overview' : (lang === 'pt' ? 'Visão Geral' : 'Descripción General')}
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>

                                {slug === 'magic-analysis' && (
                                    <div className="mt-8">
                                        <GoogleMapWrapper>
                                            <PropertyMap />
                                        </GoogleMapWrapper>
                                    </div>
                                )}

                                <div className="pt-8">
                                    <Link
                                        href={`/${lang}/auth/register`}
                                        className="inline-flex items-center justify-center px-8 py-4 bg-[#081F2E] text-white font-bold rounded-lg hover:bg-cyan-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/30"
                                    >
                                        {lang === 'en' ? 'Start Now' : (lang === 'pt' ? 'Começar Agora' : 'Empezar Ahora')}
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                    </Link>
                                </div>
                            </div>

                            {/* Benefits Column */}
                            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {lang === 'en' ? 'Key Benefits' : (lang === 'pt' ? 'Principais Benefícios' : 'Beneficios Clave')}
                                </h3>
                                <ul className="space-y-4">
                                    {feature.benefits?.map((benefit: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-bold mt-0.5">
                                                {i + 1}
                                            </span>
                                            <span className="text-gray-700 font-medium">
                                                {benefit}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="bg-gray-50 py-12 border-t border-gray-200 mt-auto">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-gray-500">
                        © 2025 BrixAurea. {lang === 'en' ? 'All rights reserved.' : (lang === 'pt' ? 'Todos os direitos reservados.' : 'Todos los derechos reservados.')}
                    </p>
                </div>
            </footer>
        </div>
    );
}

// Generate static params if needed (optional for dynamic but good for build)
export async function generateStaticParams() {
    const slugs = [
        'magic-analysis',
        'construction-simulation',
        'sales-projection',
        'cash-flow',
        'financing',
        'dashboards'
    ];

    const locales = ['en', 'pt', 'es'];

    const params = [];
    for (const lang of locales) {
        for (const slug of slugs) {
            params.push({ lang, slug });
        }
    }

    return params;
}
