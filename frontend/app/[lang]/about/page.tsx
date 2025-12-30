import { getDictionary } from "../../../get-dictionary";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default async function AboutPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    const content = {
        pt: {
            title: "Sobre Nós",
            subtitle: "Transformando visões imobiliárias em ativos de alta performance",
            brixaurea: {
                title: "BrixAurea",
                description: "BrixAurea é a plataforma SaaS desenvolvida pela EA Financial Advisory Services para revolucionar a análise de viabilidade de empreendimentos imobiliários. Combinamos tecnologia de ponta com décadas de experiência de mercado para oferecer ferramentas profissionais que transformam dados complexos em decisões estratégicas inteligentes.",
            },
            ea: {
                title: "EA Financial Advisory Services",
                intro: "Na EA Financial Advisory Services, somos mais que uma consultoria financeira — somos um parceiro estratégico na gestão e no controle disciplinado de empreendimentos imobiliários. Nossa atuação se baseia em uma combinação sólida de conhecimento profundo de mercado, planejamento financeiro rigoroso e compromisso com a criação de valor sustentável para nossos clientes e parceiros.",
                global: "Com presença nos Estados Unidos e no Brasil, a EA conecta mercados internacionais, oferecendo uma abordagem abrangente para estruturação patrimonial, gestão de ativos e governança de investimentos. Unimos a visão empreendedora necessária para identificar oportunidades à disciplina operacional indispensável para proteger e potencializar o capital.",
                team: "Nossa equipe executiva é formada por profissionais de alta performance, com ampla experiência em real estate, private equity e gestão de ativos. Ao longo dos anos, nossos especialistas conduziram com sucesso operações em ambientes complexos e de alta exigência, entregando resultados consistentes alinhados aos objetivos de crescimento, segurança e legado de nossos clientes.",
                difference: "O que realmente diferencia a EA é o compromisso com precisão e governança. Cada projeto é conduzido com metas financeiras estruturadas, análise criteriosa de riscos e práticas sólidas de governança corporativa. Acreditamos que rentabilidade e segurança caminham juntas, como fruto de execução disciplinada e visão estratégica.",
            },
            philosophy: {
                title: "Nossa Filosofia",
                items: [
                    { title: "Clareza", desc: "na comunicação e nas estratégias" },
                    { title: "Consistência", desc: "na entrega e nas relações" },
                    { title: "Excelência", desc: "na execução, garantindo resultados mensuráveis e sustentáveis" },
                ],
            },
            closing: "Transformamos visões imobiliárias em ativos de alta performance. Por meio de transparência, desempenho e confiança, construímos parcerias duradouras com nossos investidores — comprometidos não apenas com o sucesso de hoje, mas também com a prosperidade das próximas gerações.",
        },
        en: {
            title: "About Us",
            subtitle: "Transforming real estate visions into high-performance assets",
            brixaurea: {
                title: "BrixAurea",
                description: "BrixAurea is the SaaS platform developed by EA Financial Advisory Services to revolutionize real estate development feasibility analysis. We combine cutting-edge technology with decades of market experience to offer professional tools that transform complex data into intelligent strategic decisions.",
            },
            ea: {
                title: "EA Financial Advisory Services",
                intro: "At EA Financial Advisory Services, we are more than a financial consultancy — we are a strategic partner in the disciplined management and control of real estate developments. Our approach is based on a solid combination of deep market knowledge, rigorous financial planning, and commitment to creating sustainable value for our clients and partners.",
                global: "With presence in the United States and Brazil, EA connects international markets, offering a comprehensive approach to wealth structuring, asset management, and investment governance. We unite the entrepreneurial vision needed to identify opportunities with the operational discipline essential to protect and enhance capital.",
                team: "Our executive team consists of high-performance professionals with extensive experience in real estate, private equity, and asset management. Over the years, our specialists have successfully conducted operations in complex and highly demanding environments, delivering consistent results aligned with our clients' growth, security, and legacy objectives.",
                difference: "What truly differentiates EA is our commitment to precision and governance. Each project is conducted with structured financial goals, rigorous risk analysis, and solid corporate governance practices. We believe that profitability and security go hand in hand, as the result of disciplined execution and strategic vision.",
            },
            philosophy: {
                title: "Our Philosophy",
                items: [
                    { title: "Clarity", desc: "in communication and strategies" },
                    { title: "Consistency", desc: "in delivery and relationships" },
                    { title: "Excellence", desc: "in execution, ensuring measurable and sustainable results" },
                ],
            },
            closing: "We transform real estate visions into high-performance assets. Through transparency, performance, and trust, we build lasting partnerships with our investors — committed not only to today's success, but also to the prosperity of future generations.",
        },
        es: {
            title: "Sobre Nosotros",
            subtitle: "Transformando visiones inmobiliarias en activos de alto rendimiento",
            brixaurea: {
                title: "BrixAurea",
                description: "BrixAurea es la plataforma SaaS desarrollada por EA Financial Advisory Services para revolucionar el análisis de viabilidad de desarrollos inmobiliarios. Combinamos tecnología de punta con décadas de experiencia de mercado para ofrecer herramientas profesionales que transforman datos complejos en decisiones estratégicas inteligentes.",
            },
            ea: {
                title: "EA Financial Advisory Services",
                intro: "En EA Financial Advisory Services, somos más que una consultoría financiera — somos un socio estratégico en la gestión y control disciplinado de desarrollos inmobiliarios. Nuestro enfoque se basa en una combinación sólida de conocimiento profundo del mercado, planificación financiera rigurosa y compromiso con la creación de valor sostenible para nuestros clientes y socios.",
                global: "Con presencia en Estados Unidos y Brasil, EA conecta mercados internacionales, ofreciendo un enfoque integral para estructuración patrimonial, gestión de activos y gobernanza de inversiones. Unimos la visión emprendedora necesaria para identificar oportunidades con la disciplina operacional indispensable para proteger y potenciar el capital.",
                team: "Nuestro equipo ejecutivo está formado por profesionales de alto rendimiento, con amplia experiencia en bienes raíces, private equity y gestión de activos. A lo largo de los años, nuestros especialistas han conducido con éxito operaciones en entornos complejos y altamente exigentes, entregando resultados consistentes alineados con los objetivos de crecimiento, seguridad y legado de nuestros clientes.",
                difference: "Lo que realmente diferencia a EA es el compromiso con la precisión y la gobernanza. Cada proyecto se conduce con metas financieras estructuradas, análisis riguroso de riesgos y prácticas sólidas de gobernanza corporativa. Creemos que rentabilidad y seguridad van de la mano, como fruto de ejecución disciplinada y visión estratégica.",
            },
            philosophy: {
                title: "Nuestra Filosofía",
                items: [
                    { title: "Claridad", desc: "en la comunicación y las estrategias" },
                    { title: "Consistencia", desc: "en la entrega y las relaciones" },
                    { title: "Excelencia", desc: "en la ejecución, garantizando resultados medibles y sostenibles" },
                ],
            },
            closing: "Transformamos visiones inmobiliarias en activos de alto rendimiento. A través de transparencia, desempeño y confianza, construimos asociaciones duraderas con nuestros inversores — comprometidos no solo con el éxito de hoy, sino también con la prosperidad de las próximas generaciones.",
        },
    };

    const c = content[lang as keyof typeof content] || content.en;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header lang={lang} dictionary={dict} />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-gray-50 to-cyan-50 py-20">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#081F2E] mb-6">
                            {c.title}
                        </h1>
                        <p className="text-xl text-gray-600">
                            {c.subtitle}
                        </p>
                    </div>
                </section>

                {/* BrixAurea Section */}
                <section className="py-16 container mx-auto px-4 max-w-4xl">
                    <div className="bg-white rounded-2xl border-2 border-cyan-500/20 p-8 md:p-12 shadow-lg shadow-cyan-500/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-[#081F2E]">{c.brixaurea.title}</h2>
                        </div>
                        <p className="text-lg text-gray-700 leading-relaxed text-justify">
                            {c.brixaurea.description}
                        </p>
                    </div>
                </section>

                {/* EA Financial Advisory Section */}
                <section className="bg-gradient-to-br from-[#081F2E] to-gray-900 text-white py-20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">{c.ea.title}</h2>

                        <div className="space-y-6 text-gray-100">
                            <p className="text-lg leading-relaxed text-justify">
                                {c.ea.intro}
                            </p>
                            <p className="text-lg leading-relaxed text-justify">
                                {c.ea.global}
                            </p>
                            <p className="text-lg leading-relaxed text-justify">
                                {c.ea.team}
                            </p>
                            <p className="text-lg leading-relaxed text-justify">
                                {c.ea.difference}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Philosophy Section */}
                <section className="py-16 container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-bold text-[#081F2E] mb-12 text-center">{c.philosophy.title}</h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {c.philosophy.items.map((item, index) => (
                            <div key={index} className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-8 border border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-white font-bold text-xl">{index + 1}</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#081F2E] mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CEO Statement Section */}
                <section className="py-20 bg-gradient-to-br from-white to-gray-50">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                            <div className="grid md:grid-cols-5 gap-0">
                                {/* Photo Column */}
                                <div className="md:col-span-2 bg-gradient-to-br from-[#081F2E] to-gray-800 flex items-center justify-center p-8 md:p-12">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl"></div>
                                        <img
                                            src="/images/erik-amorim.jpg"
                                            alt="Erik Amorim - CEO EA Financial Advisory Services"
                                            className="relative w-48 h-48 md:w-56 md:h-56 rounded-full object-cover border-4 border-cyan-500/30 shadow-xl"
                                        />
                                    </div>
                                </div>

                                {/* Quote Column */}
                                <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
                                    {/* Quote Icon */}
                                    <svg className="w-12 h-12 text-cyan-500/30 mb-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>

                                    {/* Quote Text */}
                                    <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 italic text-justify">
                                        "{c.closing}"
                                    </blockquote>

                                    {/* Signature */}
                                    <div className="border-t border-gray-200 pt-6">
                                        <p className="font-bold text-xl text-[#081F2E] mb-1">
                                            Erik Amorim
                                        </p>
                                        <p className="text-gray-600 mb-4">
                                            CEO, EA Financial Advisory Services
                                        </p>
                                        <a
                                            href="https://www.linkedin.com/in/erik-amorim/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium transition-colors group"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                            <span className="group-hover:underline">
                                                {lang === 'pt' ? 'Conecte-se no LinkedIn' : lang === 'es' ? 'Conéctese en LinkedIn' : 'Connect on LinkedIn'}
                                            </span>
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Company Info Section */}
                <section className="bg-gray-50 py-16">
                    <div className="container mx-auto px-4 max-w-3xl text-center">
                        <div className="bg-white rounded-xl p-8 shadow-md">
                            <p className="text-sm text-gray-600 mb-2">
                                <strong className="text-[#081F2E]">BrixAurea</strong>
                            </p>
                            <p className="text-gray-600">
                                {lang === 'pt' ? 'Uma solução da' : lang === 'es' ? 'Una solución de' : 'A solution by'}
                            </p>
                            <p className="text-lg font-semibold text-cyan-600 mb-4">
                                EA Financial Advisory Services
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Miami, Florida USA
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <a
                                    href="https://www.eafinancialadvisory.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                                >
                                    eafinancialadvisory.com
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                                <span className="text-gray-300">|</span>
                                <a
                                    href="https://www.linkedin.com/company/ea-financial-advisory-services/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer lang={lang} dictionary={dict} />
        </div>
    );
}
