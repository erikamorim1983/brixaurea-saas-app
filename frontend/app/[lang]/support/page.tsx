import { getDictionary } from "../../../get-dictionary";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default async function SupportPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header lang={lang} dictionary={dict} />

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-16 max-w-6xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-[#081F2E] mb-4">
                        {lang === 'pt' ? 'Central de Suporte' : lang === 'es' ? 'Centro de Soporte' : 'Support Center'}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {lang === 'pt'
                            ? 'Encontre ajuda, documentação e entre em contato com nossa equipe de suporte.'
                            : lang === 'es'
                                ? 'Encuentre ayuda, documentación y póngase en contacto con nuestro equipo de soporte.'
                                : 'Find help, documentation, and get in touch with our support team.'
                        }
                    </p>
                </div>

                {/* Support Options Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {/* Email Support */}
                    <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#081F2E] mb-2">
                            {lang === 'pt' ? 'Email de Suporte' : lang === 'es' ? 'Email de Soporte' : 'Email Support'}
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                            {lang === 'pt'
                                ? 'Envie suas dúvidas e receba resposta em até 24h.'
                                : lang === 'es'
                                    ? 'Envíe sus preguntas y reciba respuesta en hasta 24h.'
                                    : 'Send your questions and get a response within 24h.'
                            }
                        </p>
                        <a href="mailto:support@brixaurea.com" className="text-cyan-500 hover:text-cyan-600 font-semibold flex items-center gap-2 group">
                            support@brixaurea.com
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </a>
                    </div>

                    {/* Documentation */}
                    <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#081F2E] mb-2">
                            {lang === 'pt' ? 'Documentação' : lang === 'es' ? 'Documentación' : 'Documentation'}
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                            {lang === 'pt'
                                ? 'Guias completos sobre como usar a plataforma.'
                                : lang === 'es'
                                    ? 'Guías completas sobre cómo usar la plataforma.'
                                    : 'Complete guides on how to use the platform.'
                            }
                        </p>
                        <Link href={`/${lang}/docs`} className="text-cyan-500 hover:text-cyan-600 font-semibold flex items-center gap-2 group">
                            {lang === 'pt' ? 'Ver Documentação' : lang === 'es' ? 'Ver Documentación' : 'View Documentation'}
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* FAQ */}
                    <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#081F2E] mb-2">
                            {lang === 'pt' ? 'Perguntas Frequentes' : lang === 'es' ? 'Preguntas Frecuentes' : 'FAQ'}
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                            {lang === 'pt'
                                ? 'Respostas para as dúvidas mais comuns.'
                                : lang === 'es'
                                    ? 'Respuestas a las preguntas más comunes.'
                                    : 'Answers to the most common questions.'
                            }
                        </p>
                        <Link href={`/${lang}/faq`} className="text-cyan-500 hover:text-cyan-600 font-semibold flex items-center gap-2 group">
                            {lang === 'pt' ? 'Ver FAQ' : lang === 'es' ? 'Ver FAQ' : 'View FAQ'}
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 md:p-12 border border-cyan-200">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-[#081F2E] mb-6 text-center">
                            {lang === 'pt' ? 'Entre em Contato' : lang === 'es' ? 'Póngase en Contacto' : 'Get in Touch'}
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-800">
                                        {lang === 'pt' ? 'Email Geral' : lang === 'es' ? 'Email General' : 'General Email'}
                                    </h3>
                                </div>
                                <a href="mailto:contact@brixaurea.com" className="text-cyan-600 hover:text-cyan-700">
                                    contact@brixaurea.com
                                </a>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-800">
                                        {lang === 'pt' ? 'Suporte Técnico' : lang === 'es' ? 'Soporte Técnico' : 'Technical Support'}
                                    </h3>
                                </div>
                                <a href="mailto:support@brixaurea.com" className="text-blue-600 hover:text-blue-700">
                                    support@brixaurea.com
                                </a>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">
                                        {lang === 'pt' ? 'Endereço' : lang === 'es' ? 'Dirección' : 'Address'}
                                    </h3>
                                    <p className="text-gray-600">
                                        <strong>BrixAurea</strong><br />
                                        Miami, Florida<br />
                                        United States
                                    </p>
                                    <p className="text-sm text-gray-500 mt-3">
                                        {lang === 'pt'
                                            ? 'Uma solução da'
                                            : lang === 'es'
                                                ? 'Una solución de'
                                                : 'A solution by'
                                        } <a href="https://www.eafinancialadvisory.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-700 font-medium">EA Financial Advisory</a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600 mb-4">
                                {lang === 'pt'
                                    ? 'Horário de atendimento: Segunda a Sexta, 9h às 18h (Miami, Florida)'
                                    : lang === 'es'
                                        ? 'Horario de atención: Lunes a Viernes, 9h a 18h (Miami, Florida)'
                                        : 'Business hours: Monday to Friday, 9am to 6pm (Miami, Florida)'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer lang={lang} dictionary={dict} />
        </div>
    );
}
