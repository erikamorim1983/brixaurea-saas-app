import { getDictionary } from "../../../get-dictionary";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    const titles = {
        en: 'Documentation - BrixAurea',
        pt: 'Documentação - BrixAurea',
        es: 'Documentación - BrixAurea',
    };

    return {
        title: titles[lang as keyof typeof titles] || titles.en,
    };
}

// Documentation content by language
const content = {
    en: {
        title: 'Documentation',
        subtitle: 'Everything you need to know to use BrixAurea',
        search: 'Search documentation...',
        gettingStarted: {
            title: 'Getting Started',
            items: [
                { title: 'Introduction to BrixAurea', desc: 'Learn about the platform and its capabilities' },
                { title: 'Creating your account', desc: 'Step by step guide to set up your account' },
                { title: 'First project', desc: 'Create your first real estate feasibility analysis' },
            ],
        },
        guides: {
            title: 'User Guides',
            categories: [
                {
                    name: 'Land Analysis',
                    icon: 'terrain',
                    items: [
                        'Adding properties and plots',
                        'Zoning and construction potential',
                        'Location and valuation analysis',
                    ],
                },
                {
                    name: 'Construction Simulation',
                    icon: 'building',
                    items: [
                        'Defining project typology',
                        'Cost estimation per m²',
                        'Physical-financial schedule',
                    ],
                },
                {
                    name: 'Sales Projection',
                    icon: 'sales',
                    items: [
                        'Unit mix definition',
                        'Monthly/quarterly sales curve',
                        'Gross and net revenue estimation',
                    ],
                },
                {
                    name: 'Cash Flow',
                    icon: 'cashflow',
                    items: [
                        'Income and expenses',
                        'ROI, IRR, NPV calculation',
                        'Payback analysis',
                    ],
                },
                {
                    name: 'Financing',
                    icon: 'finance',
                    items: [
                        'American financing models',
                        'LTV and DSCR calculation',
                        'Amortization schedules',
                    ],
                },
                {
                    name: 'Reports',
                    icon: 'reports',
                    items: [
                        'Generating analysis reports',
                        'Custom dashboards',
                        'Export and sharing options',
                    ],
                },
            ],
        },
        api: {
            title: 'API Reference',
            desc: 'Integrate BrixAurea with your systems',
            badge: 'Business Plus',
        },
        support: {
            title: 'Need help?',
            desc: 'Our support team is here to help you.',
            cta: 'Contact Support',
        },
    },
    pt: {
        title: 'Documentação',
        subtitle: 'Tudo que você precisa saber para usar o BrixAurea',
        search: 'Buscar na documentação...',
        gettingStarted: {
            title: 'Primeiros Passos',
            items: [
                { title: 'Introdução ao BrixAurea', desc: 'Conheça a plataforma e suas capacidades' },
                { title: 'Criando sua conta', desc: 'Guia passo a passo para configurar sua conta' },
                { title: 'Primeiro projeto', desc: 'Crie sua primeira análise de viabilidade imobiliária' },
            ],
        },
        guides: {
            title: 'Guias de Uso',
            categories: [
                {
                    name: 'Análise de Terreno',
                    icon: 'terrain',
                    items: [
                        'Cadastro de terrenos e lotes',
                        'Zoneamento e potencial construtivo',
                        'Análise de localização e valorização',
                    ],
                },
                {
                    name: 'Simulação de Construção',
                    icon: 'building',
                    items: [
                        'Definição de tipologia do projeto',
                        'Estimativa de custo por m²',
                        'Cronograma físico-financeiro',
                    ],
                },
                {
                    name: 'Projeção de Vendas',
                    icon: 'sales',
                    items: [
                        'Definição de mix de unidades',
                        'Curva de vendas mensal/trimestral',
                        'Estimativa de receita bruta e líquida',
                    ],
                },
                {
                    name: 'Fluxo de Caixa',
                    icon: 'cashflow',
                    items: [
                        'Entradas e saídas',
                        'Cálculo de ROI, TIR, VPL',
                        'Análise de Payback',
                    ],
                },
                {
                    name: 'Financiamento',
                    icon: 'finance',
                    items: [
                        'Modelos de financiamento americanos',
                        'Cálculo de LTV e DSCR',
                        'Cronogramas de amortização',
                    ],
                },
                {
                    name: 'Relatórios',
                    icon: 'reports',
                    items: [
                        'Geração de relatórios de análise',
                        'Dashboards personalizados',
                        'Opções de exportação e compartilhamento',
                    ],
                },
            ],
        },
        api: {
            title: 'Referência da API',
            desc: 'Integre o BrixAurea com seus sistemas',
            badge: 'Business Plus',
        },
        support: {
            title: 'Precisa de ajuda?',
            desc: 'Nossa equipe de suporte está aqui para ajudar.',
            cta: 'Contatar Suporte',
        },
    },
    es: {
        title: 'Documentación',
        subtitle: 'Todo lo que necesitas saber para usar BrixAurea',
        search: 'Buscar en la documentación...',
        gettingStarted: {
            title: 'Primeros Pasos',
            items: [
                { title: 'Introducción a BrixAurea', desc: 'Conoce la plataforma y sus capacidades' },
                { title: 'Creando tu cuenta', desc: 'Guía paso a paso para configurar tu cuenta' },
                { title: 'Primer proyecto', desc: 'Crea tu primer análisis de viabilidad inmobiliaria' },
            ],
        },
        guides: {
            title: 'Guías de Uso',
            categories: [
                {
                    name: 'Análisis de Terreno',
                    icon: 'terrain',
                    items: [
                        'Registro de terrenos y lotes',
                        'Zonificación y potencial constructivo',
                        'Análisis de ubicación y valorización',
                    ],
                },
                {
                    name: 'Simulación de Construcción',
                    icon: 'building',
                    items: [
                        'Definición de tipología del proyecto',
                        'Estimación de costo por m²',
                        'Cronograma físico-financiero',
                    ],
                },
                {
                    name: 'Proyección de Ventas',
                    icon: 'sales',
                    items: [
                        'Definición de mix de unidades',
                        'Curva de ventas mensual/trimestral',
                        'Estimación de ingresos brutos y netos',
                    ],
                },
                {
                    name: 'Flujo de Caja',
                    icon: 'cashflow',
                    items: [
                        'Ingresos y egresos',
                        'Cálculo de ROI, TIR, VPN',
                        'Análisis de Payback',
                    ],
                },
                {
                    name: 'Financiamiento',
                    icon: 'finance',
                    items: [
                        'Modelos de financiamiento americanos',
                        'Cálculo de LTV y DSCR',
                        'Cronogramas de amortización',
                    ],
                },
                {
                    name: 'Reportes',
                    icon: 'reports',
                    items: [
                        'Generación de reportes de análisis',
                        'Dashboards personalizados',
                        'Opciones de exportación y compartir',
                    ],
                },
            ],
        },
        api: {
            title: 'Referencia de API',
            desc: 'Integra BrixAurea con tus sistemas',
            badge: 'Business Plus',
        },
        support: {
            title: '¿Necesitas ayuda?',
            desc: 'Nuestro equipo de soporte está aquí para ayudarte.',
            cta: 'Contactar Soporte',
        },
    },
};

// Icon components
const icons = {
    terrain: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
    ),
    building: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    sales: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    cashflow: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    finance: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    reports: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
};

export default async function DocsPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const c = content[lang as keyof typeof content] || content.en;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header lang={lang} dictionary={dict} />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-gradient-to-br from-[#081F2E] to-gray-900 text-white py-16">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{c.title}</h1>
                        <p className="text-xl text-gray-300 mb-8">{c.subtitle}</p>

                        {/* Search Bar */}
                        <div className="relative max-w-xl">
                            <input
                                type="text"
                                placeholder={c.search}
                                className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-12 max-w-6xl">
                    {/* Getting Started */}
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </span>
                            {c.gettingStarted.title}
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            {c.gettingStarted.items.map((item, i) => (
                                <Link
                                    key={i}
                                    href="#"
                                    className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-cyan-300 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="w-8 h-8 bg-gradient-to-br from-[#00D9FF] to-[#0EA5E9] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                            {i + 1}
                                        </span>
                                        <h3 className="font-semibold text-[#081F2E] group-hover:text-[#00D9FF] transition-colors">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-600 text-sm pl-11">{item.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* User Guides */}
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-6 flex items-center gap-2">
                            <span className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </span>
                            {c.guides.title}
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {c.guides.categories.map((category, i) => (
                                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#00D9FF] to-[#0EA5E9] rounded-xl flex items-center justify-center text-white">
                                            {icons[category.icon as keyof typeof icons]}
                                        </div>
                                        <h3 className="font-bold text-[#081F2E]">{category.name}</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {category.items.map((item, j) => (
                                            <li key={j}>
                                                <Link href="#" className="flex items-center gap-2 text-gray-600 hover:text-[#00D9FF] transition-colors text-sm py-1">
                                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    {item}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* API Reference */}
                    <section className="mb-16">
                        <div className="bg-gradient-to-r from-[#081F2E] to-gray-800 rounded-2xl p-8 md:p-12 text-white">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-bold">{c.api.title}</h2>
                                        <span className="px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-full">
                                            {c.api.badge}
                                        </span>
                                    </div>
                                    <p className="text-gray-300">{c.api.desc}</p>
                                </div>
                                <Link
                                    href="#"
                                    className="flex items-center gap-2 px-6 py-3 bg-white text-[#081F2E] font-semibold rounded-xl hover:shadow-lg transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    API Docs
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Support CTA */}
                    <section>
                        <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-8 text-center">
                            <h2 className="text-2xl font-bold text-[#081F2E] mb-2">{c.support.title}</h2>
                            <p className="text-gray-600 mb-6">{c.support.desc}</p>
                            <Link
                                href={`/${lang}/support`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                            >
                                {c.support.cta}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </section>
                </div>
            </main>

            <Footer lang={lang} dictionary={dict} />
        </div>
    );
}
