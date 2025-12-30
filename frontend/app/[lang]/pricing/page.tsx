import { getDictionary } from '@/get-dictionary';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PLANS, formatStorage } from '@/lib/config/plans';
import PricingCards from './components/PricingCards';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    const titles = {
        en: 'Pricing - BrixAurea',
        pt: 'Planos e Preços - BrixAurea',
        es: 'Precios - BrixAurea',
    };

    const descriptions = {
        en: 'Choose the perfect plan for your real estate analysis needs. Start with a free trial.',
        pt: 'Escolha o plano perfeito para suas necessidades de análise imobiliária. Comece com um trial grátis.',
        es: 'Elige el plan perfecto para tus necesidades de análisis inmobiliario. Comienza con una prueba gratis.',
    };

    return {
        title: titles[lang as keyof typeof titles] || titles.en,
        description: descriptions[lang as keyof typeof descriptions] || descriptions.en,
    };
}

// Content by language
const content = {
    en: {
        hero: {
            title: 'Simple, Transparent Pricing',
            subtitle: 'Choose the plan that fits your needs. All plans include a free trial.',
        },
        toggle: {
            monthly: 'Monthly',
            yearly: 'Yearly',
            savePercent: '~17% OFF',
            twoMonthsFree: '2 months free with annual billing',
        },
        plans: {
            popular: 'Most Popular',
            perMonth: '/mo',
            perYear: '/year',
            billedYearly: 'billed annually',
            trialDays: '{days} days free trial',
            startTrial: 'Start Free Trial',
            contactSales: 'Contact Sales',
            users: 'users',
            user: 'user',
            projects: 'projects',
            unlimited: 'Unlimited',
            storage: 'storage',
        },
        features: {
            title: 'Compare Plans',
            subtitle: 'Find the right plan for your team',
            basic_analysis: 'Basic feasibility analysis',
            limited_projects: 'Up to 5 projects',
            storage_2gb: '2GB storage',
            email_support: 'Email support',
            unlimited_projects: 'Unlimited projects',
            team_3_members: 'Up to 3 team members',
            team_10_members: 'Up to 10 team members',
            team_25_members: 'Up to 25 team members',
            storage_10gb: '10GB storage',
            storage_50gb: '50GB storage',
            storage_100gb: '100GB storage',
            priority_support: 'Priority support',
            team_management: 'Team management',
            advanced_reports: 'Advanced reports',
            api_access: 'API access',
            unlimited_everything: 'Unlimited everything',
            custom_integrations: 'Custom integrations',
            dedicated_support: 'Dedicated support',
            sla_guarantee: 'SLA guarantee',
            custom_branding: 'Custom branding',
        },
        comparison: {
            feature: 'Feature',
            included: 'Included',
            notIncluded: 'Not included',
        },
        enterprise: {
            title: 'Need more power?',
            subtitle: 'Enterprise plan includes unlimited everything, custom integrations, dedicated support, and SLA guarantee.',
            cta: 'Contact Sales',
        },
        faq: {
            title: 'Frequently Asked Questions',
            items: [
                {
                    q: 'Can I change my plan later?',
                    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
                },
                {
                    q: 'What happens when my trial ends?',
                    a: 'You\'ll be prompted to choose a plan. Your data will be preserved, but access will be limited until you subscribe.',
                },
                {
                    q: 'Do you offer refunds?',
                    a: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, contact support for a full refund.',
                },
                {
                    q: 'Can I add more team members?',
                    a: 'You can upgrade to a higher tier plan to add more team members, or contact us for a custom Enterprise solution.',
                },
                {
                    q: 'What payment methods do you accept?',
                    a: 'We accept all major credit cards (Visa, MasterCard, American Express) and can arrange invoicing for Enterprise customers.',
                },
            ],
        },
    },
    pt: {
        hero: {
            title: 'Preços Simples e Transparentes',
            subtitle: 'Escolha o plano que se adapta às suas necessidades. Todos os planos incluem trial grátis.',
        },
        toggle: {
            monthly: 'Mensal',
            yearly: 'Anual',
            savePercent: '~17% OFF',
            twoMonthsFree: '2 meses grátis no plano anual',
        },
        plans: {
            popular: 'Mais Popular',
            perMonth: '/mês',
            perYear: '/ano',
            billedYearly: 'cobrado anualmente',
            trialDays: 'Trial de {days} dias grátis',
            startTrial: 'Começar Trial Grátis',
            contactSales: 'Falar com Vendas',
            users: 'usuários',
            user: 'usuário',
            projects: 'projetos',
            unlimited: 'Ilimitado',
            storage: 'armazenamento',
        },
        features: {
            title: 'Compare os Planos',
            subtitle: 'Encontre o plano certo para sua equipe',
            basic_analysis: 'Análise básica de viabilidade',
            limited_projects: 'Até 5 projetos',
            storage_2gb: '2GB de armazenamento',
            email_support: 'Suporte por email',
            unlimited_projects: 'Projetos ilimitados',
            team_3_members: 'Até 3 membros',
            team_10_members: 'Até 10 membros',
            team_25_members: 'Até 25 membros',
            storage_10gb: '10GB de armazenamento',
            storage_50gb: '50GB de armazenamento',
            storage_100gb: '100GB de armazenamento',
            priority_support: 'Suporte prioritário',
            team_management: 'Gestão de equipe',
            advanced_reports: 'Relatórios avançados',
            api_access: 'Acesso à API',
            unlimited_everything: 'Tudo ilimitado',
            custom_integrations: 'Integrações personalizadas',
            dedicated_support: 'Suporte dedicado',
            sla_guarantee: 'Garantia de SLA',
            custom_branding: 'Marca personalizada',
        },
        comparison: {
            feature: 'Recurso',
            included: 'Incluído',
            notIncluded: 'Não incluído',
        },
        enterprise: {
            title: 'Precisa de mais poder?',
            subtitle: 'O plano Enterprise inclui tudo ilimitado, integrações personalizadas, suporte dedicado e garantia de SLA.',
            cta: 'Falar com Vendas',
        },
        faq: {
            title: 'Perguntas Frequentes',
            items: [
                {
                    q: 'Posso mudar de plano depois?',
                    a: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações entram em vigor imediatamente.',
                },
                {
                    q: 'O que acontece quando meu trial termina?',
                    a: 'Você será solicitado a escolher um plano. Seus dados serão preservados, mas o acesso será limitado até você assinar.',
                },
                {
                    q: 'Vocês oferecem reembolso?',
                    a: 'Sim, oferecemos garantia de devolução do dinheiro em 30 dias. Se não estiver satisfeito, entre em contato com o suporte para reembolso total.',
                },
                {
                    q: 'Posso adicionar mais membros à equipe?',
                    a: 'Você pode fazer upgrade para um plano superior para adicionar mais membros, ou entre em contato conosco para uma solução Enterprise personalizada.',
                },
                {
                    q: 'Quais métodos de pagamento vocês aceitam?',
                    a: 'Aceitamos os principais cartões de crédito (Visa, MasterCard, American Express) e podemos fazer faturamento para clientes Enterprise.',
                },
            ],
        },
    },
    es: {
        hero: {
            title: 'Precios Simples y Transparentes',
            subtitle: 'Elige el plan que se adapte a tus necesidades. Todos los planes incluyen prueba gratis.',
        },
        toggle: {
            monthly: 'Mensual',
            yearly: 'Anual',
            savePercent: '~17% OFF',
            twoMonthsFree: '2 meses gratis con facturación anual',
        },
        plans: {
            popular: 'Más Popular',
            perMonth: '/mes',
            perYear: '/año',
            billedYearly: 'facturado anualmente',
            trialDays: 'Prueba gratis de {days} días',
            startTrial: 'Comenzar Prueba Gratis',
            contactSales: 'Contactar Ventas',
            users: 'usuarios',
            user: 'usuario',
            projects: 'proyectos',
            unlimited: 'Ilimitado',
            storage: 'almacenamiento',
        },
        features: {
            title: 'Compara los Planes',
            subtitle: 'Encuentra el plan adecuado para tu equipo',
            basic_analysis: 'Análisis básico de viabilidad',
            limited_projects: 'Hasta 5 proyectos',
            storage_2gb: '2GB de almacenamiento',
            email_support: 'Soporte por email',
            unlimited_projects: 'Proyectos ilimitados',
            team_3_members: 'Hasta 3 miembros',
            team_10_members: 'Hasta 10 miembros',
            team_25_members: 'Hasta 25 miembros',
            storage_10gb: '10GB de almacenamiento',
            storage_50gb: '50GB de almacenamiento',
            storage_100gb: '100GB de almacenamiento',
            priority_support: 'Soporte prioritario',
            team_management: 'Gestión de equipo',
            advanced_reports: 'Reportes avanzados',
            api_access: 'Acceso a API',
            unlimited_everything: 'Todo ilimitado',
            custom_integrations: 'Integraciones personalizadas',
            dedicated_support: 'Soporte dedicado',
            sla_guarantee: 'Garantía de SLA',
            custom_branding: 'Marca personalizada',
        },
        comparison: {
            feature: 'Característica',
            included: 'Incluido',
            notIncluded: 'No incluido',
        },
        enterprise: {
            title: '¿Necesitas más poder?',
            subtitle: 'El plan Enterprise incluye todo ilimitado, integraciones personalizadas, soporte dedicado y garantía de SLA.',
            cta: 'Contactar Ventas',
        },
        faq: {
            title: 'Preguntas Frecuentes',
            items: [
                {
                    q: '¿Puedo cambiar mi plan después?',
                    a: 'Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios entran en vigor inmediatamente.',
                },
                {
                    q: '¿Qué pasa cuando termina mi prueba?',
                    a: 'Se te pedirá que elijas un plan. Tus datos se conservarán, pero el acceso será limitado hasta que te suscribas.',
                },
                {
                    q: '¿Ofrecen reembolsos?',
                    a: 'Sí, ofrecemos garantía de devolución de dinero de 30 días. Si no estás satisfecho, contacta al soporte para un reembolso completo.',
                },
                {
                    q: '¿Puedo agregar más miembros al equipo?',
                    a: 'Puedes actualizar a un plan superior para agregar más miembros, o contáctanos para una solución Enterprise personalizada.',
                },
                {
                    q: '¿Qué métodos de pago aceptan?',
                    a: 'Aceptamos las principales tarjetas de crédito (Visa, MasterCard, American Express) y podemos facturar a clientes Enterprise.',
                },
            ],
        },
    },
};

// Feature comparison data
const comparisonFeatures = [
    { key: 'projects', label: { en: 'Projects', pt: 'Projetos', es: 'Proyectos' } },
    { key: 'users', label: { en: 'Team Members', pt: 'Membros', es: 'Miembros' } },
    { key: 'storage', label: { en: 'Storage', pt: 'Armazenamento', es: 'Almacenamiento' } },
    { key: 'support', label: { en: 'Support', pt: 'Suporte', es: 'Soporte' } },
    { key: 'reports', label: { en: 'Advanced Reports', pt: 'Relatórios Avançados', es: 'Reportes Avanzados' } },
    { key: 'api', label: { en: 'API Access', pt: 'Acesso à API', es: 'Acceso a API' } },
    { key: 'team', label: { en: 'Team Management', pt: 'Gestão de Equipe', es: 'Gestión de Equipo' } },
];

export default async function PricingPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const c = content[lang as keyof typeof content] || content.en;

    // Filter out enterprise for main display and dev plan
    const displayPlans = PLANS.filter(p => p.id !== 'enterprise' && p.id !== 'dev');

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header lang={lang} dictionary={dict} />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-[#081F2E] via-gray-900 to-[#081F2E] text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            {c.hero.title}
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            {c.hero.subtitle}
                        </p>
                    </div>
                </section>

                {/* Pricing Cards with Billing Toggle */}
                <section className="py-20 -mt-10">
                    <div className="container mx-auto px-4">
                        <PricingCards
                            plans={displayPlans}
                            lang={lang}
                            content={{
                                toggle: c.toggle,
                                plans: c.plans,
                                features: c.features,
                            }}
                        />
                    </div>
                </section>

                {/* Enterprise CTA */}
                <section className="py-16 bg-gradient-to-r from-[#081F2E] to-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold text-white mb-4">
                                {c.enterprise.title}
                            </h2>
                            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                                {c.enterprise.subtitle}
                            </p>
                            <Link
                                href={`/${lang}/contact?plan=enterprise`}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#081F2E] font-semibold rounded-xl hover:shadow-lg hover:shadow-white/20 transition-all duration-300"
                            >
                                {c.enterprise.cta}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Feature Comparison Table */}
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-[#081F2E] mb-4">
                                {c.features.title}
                            </h2>
                            <p className="text-gray-600">
                                {c.features.subtitle}
                            </p>
                        </div>

                        <div className="max-w-5xl mx-auto overflow-x-auto">
                            <table className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-[#081F2E] text-white">
                                        <th className="py-4 px-6 text-left font-semibold">
                                            {c.comparison.feature}
                                        </th>
                                        {displayPlans.map((plan) => (
                                            <th key={plan.id} className="py-4 px-6 text-center font-semibold">
                                                {plan.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {comparisonFeatures.map((feature, index) => (
                                        <tr key={feature.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="py-4 px-6 text-gray-700 font-medium">
                                                {feature.label[lang as keyof typeof feature.label] || feature.label.en}
                                            </td>
                                            {displayPlans.map((plan) => (
                                                <td key={plan.id} className="py-4 px-6 text-center">
                                                    {feature.key === 'projects' && (
                                                        <span className="text-gray-700">
                                                            {plan.maxProjects === -1 ? '∞' : plan.maxProjects}
                                                        </span>
                                                    )}
                                                    {feature.key === 'users' && (
                                                        <span className="text-gray-700">
                                                            {plan.maxUsers === -1 ? '∞' : plan.maxUsers}
                                                        </span>
                                                    )}
                                                    {feature.key === 'storage' && (
                                                        <span className="text-gray-700">
                                                            {formatStorage(plan.maxStorageMb)}
                                                        </span>
                                                    )}
                                                    {feature.key === 'support' && (
                                                        <span className="text-gray-700">
                                                            {plan.features.includes('priority_support') ? '⭐ Priority' : '📧 Email'}
                                                        </span>
                                                    )}
                                                    {feature.key === 'reports' && (
                                                        plan.features.includes('advanced_reports') ? (
                                                            <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-6 h-6 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        )
                                                    )}
                                                    {feature.key === 'api' && (
                                                        plan.features.includes('api_access') ? (
                                                            <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-6 h-6 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        )
                                                    )}
                                                    {feature.key === 'team' && (
                                                        plan.features.includes('team_management') ? (
                                                            <svg className="w-6 h-6 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-6 h-6 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        )
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-[#081F2E] text-center mb-12">
                            {c.faq.title}
                        </h2>

                        <div className="max-w-3xl mx-auto space-y-4">
                            {c.faq.items.map((item, index) => (
                                <details
                                    key={index}
                                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                        <span className="font-semibold text-[#081F2E]">{item.q}</span>
                                        <svg
                                            className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </summary>
                                    <div className="px-6 pb-6 text-gray-600">
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-16 bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9]">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            {lang === 'pt' ? 'Pronto para começar?' : lang === 'es' ? '¿Listo para empezar?' : 'Ready to get started?'}
                        </h2>
                        <p className="text-white/90 mb-8 max-w-xl mx-auto">
                            {lang === 'pt'
                                ? 'Comece seu trial grátis hoje e transforme suas análises imobiliárias.'
                                : lang === 'es'
                                    ? 'Comienza tu prueba gratis hoy y transforma tus análisis inmobiliarios.'
                                    : 'Start your free trial today and transform your real estate analysis.'
                            }
                        </p>
                        <Link
                            href={`/${lang}/auth/register`}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#081F2E] font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                        >
                            {c.plans.startTrial}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer lang={lang} dictionary={dict} />
        </div>
    );
}
