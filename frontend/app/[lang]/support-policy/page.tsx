import { getDictionary } from "../../../get-dictionary";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default async function SupportPolicyPage({
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
            <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold text-[#081F2E] mb-4">
                    {lang === 'pt' ? 'Política de Suporte e Disponibilidade' : lang === 'es' ? 'Política de Soporte y Disponibilidad' : 'Support and Availability Policy'}
                </h1>
                <p className="text-gray-500 mb-12">
                    {lang === 'pt' ? 'Última atualização: Dezembro 2025' : lang === 'es' ? 'Última actualización: Diciembre 2025' : 'Last updated: December 2025'}
                </p>

                <div className="prose prose-lg max-w-none">
                    {/* Introduction */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '1. Visão Geral' : lang === 'es' ? '1. Descripción General' : '1. Overview'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Esta Política de Suporte e Disponibilidade descreve os níveis de serviço, disponibilidade da plataforma e o suporte técnico que a BrixAurea fornece aos seus usuários.'
                                : lang === 'es'
                                    ? 'Esta Política de Soporte y Disponibilidad describe los niveles de servicio, disponibilidad de la plataforma y el soporte técnico que BrixAurea proporciona a sus usuarios.'
                                    : 'This Support and Availability Policy describes the service levels, platform availability, and technical support that BrixAurea provides to its users.'
                            }
                        </p>
                    </section>

                    {/* Service Availability */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '2. Disponibilidade da Plataforma' : lang === 'es' ? '2. Disponibilidad de la Plataforma' : '2. Platform Availability'}
                        </h2>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            {lang === 'pt' ? '2.1 Garantia de Disponibilidade' : lang === 'es' ? '2.1 Garantía de Disponibilidad' : '2.1 Uptime Guarantee'}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'A BrixAurea se compromete a manter a plataforma disponível 99.5% do tempo durante cada mês calendário, excluindo períodos de manutenção programada.'
                                : lang === 'es'
                                    ? 'BrixAurea se compromete a mantener la plataforma disponible el 99.5% del tiempo durante cada mes calendario, excluyendo períodos de mantenimiento programado.'
                                    : 'BrixAurea commits to maintaining platform availability of 99.5% during each calendar month, excluding scheduled maintenance periods.'
                            }
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                            {lang === 'pt' ? '2.2 Manutenção Programada' : lang === 'es' ? '2.2 Mantenimiento Programado' : '2.2 Scheduled Maintenance'}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Podemos realizar manutenção programada com notificação prévia de pelo menos 48 horas. Janelas de manutenção ocorrerão preferencialmente fora do horário comercial.'
                                : lang === 'es'
                                    ? 'Podemos realizar mantenimiento programado con notificación previa de al menos 48 horas. Las ventanas de mantenimiento ocurrirán preferentemente fuera del horario laboral.'
                                    : 'We may perform scheduled maintenance with at least 48 hours advance notice. Maintenance windows will preferably occur outside business hours.'
                            }
                        </p>
                    </section>

                    {/* Support Channels */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '3. Canais de Suporte' : lang === 'es' ? '3. Canales de Soporte' : '3. Support Channels'}
                        </h2>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                {lang === 'pt' ? 'Suporte por Email' : lang === 'es' ? 'Soporte por Correo Electrónico' : 'Email Support'}
                            </h3>
                            <p className="text-gray-600 mb-3">
                                <strong>Email:</strong> <a href="mailto:support@brixaurea.com" className="text-cyan-500 hover:text-cyan-600">support@brixaurea.com</a>
                            </p>
                            <p className="text-gray-600">
                                {lang === 'pt'
                                    ? 'Tempo de resposta: até 24 horas em dias úteis'
                                    : lang === 'es'
                                        ? 'Tiempo de respuesta: hasta 24 horas en días hábiles'
                                        : 'Response time: up to 24 hours on business days'
                                }
                            </p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                {lang === 'pt' ? 'Central de Ajuda' : lang === 'es' ? 'Centro de Ayuda' : 'Help Center'}
                            </h3>
                            <p className="text-gray-600">
                                {lang === 'pt'
                                    ? 'Acesso 24/7 a documentação, guias e perguntas frequentes através de nossa central de ajuda online.'
                                    : lang === 'es'
                                        ? 'Acceso 24/7 a documentación, guías y preguntas frecuentes a través de nuestro centro de ayuda en línea.'
                                        : '24/7 access to documentation, guides, and FAQs through our online help center.'
                                }
                            </p>
                        </div>
                    </section>

                    {/* Response Times */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '4. Tempos de Resposta' : lang === 'es' ? '4. Tiempos de Respuesta' : '4. Response Times'}
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-200 p-3 text-left text-gray-800">
                                            {lang === 'pt' ? 'Prioridade' : lang === 'es' ? 'Prioridad' : 'Priority'}
                                        </th>
                                        <th className="border border-gray-200 p-3 text-left text-gray-800">
                                            {lang === 'pt' ? 'Descrição' : lang === 'es' ? 'Descripción' : 'Description'}
                                        </th>
                                        <th className="border border-gray-200 p-3 text-left text-gray-800">
                                            {lang === 'pt' ? 'Resposta' : lang === 'es' ? 'Respuesta' : 'Response'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600">
                                    <tr>
                                        <td className="border border-gray-200 p-3">
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                                                {lang === 'pt' ? 'Crítica' : lang === 'es' ? 'Crítica' : 'Critical'}
                                            </span>
                                        </td>
                                        <td className="border border-gray-200 p-3">
                                            {lang === 'pt'
                                                ? 'Plataforma indisponível'
                                                : lang === 'es'
                                                    ? 'Plataforma no disponible'
                                                    : 'Platform unavailable'
                                            }
                                        </td>
                                        <td className="border border-gray-200 p-3">
                                            {lang === 'pt' ? '2 horas' : lang === 'es' ? '2 horas' : '2 hours'}
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-200 p-3">
                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm font-medium">
                                                {lang === 'pt' ? 'Alta' : lang === 'es' ? 'Alta' : 'High'}
                                            </span>
                                        </td>
                                        <td className="border border-gray-200 p-3">
                                            {lang === 'pt'
                                                ? 'Funcionalidade importante afetada'
                                                : lang === 'es'
                                                    ? 'Funcionalidad importante afectada'
                                                    : 'Important functionality affected'
                                            }
                                        </td>
                                        <td className="border border-gray-200 p-3">
                                            {lang === 'pt' ? '8 horas' : lang === 'es' ? '8 horas' : '8 hours'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-200 p-3">
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium">
                                                {lang === 'pt' ? 'Média' : lang === 'es' ? 'Media' : 'Medium'}
                                            </span>
                                        </td>
                                        <td className="border border-gray-200 p-3">
                                            {lang === 'pt'
                                                ? 'Problema geral ou dúvida'
                                                : lang === 'es'
                                                    ? 'Problema general o consulta'
                                                    : 'General issue or question'
                                            }
                                        </td>
                                        <td className="border border-gray-200 p-3">
                                            {lang === 'pt' ? '24 horas' : lang === 'es' ? '24 horas' : '24 hours'}
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="border border-gray-200 p-3">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                                                {lang === 'pt' ? 'Baixa' : lang === 'es' ? 'Baja' : 'Low'}
                                            </span>
                                        </td>
                                        <td className="border border-gray-200 p-3">
                                            {lang === 'pt'
                                                ? 'Solicitação de recurso ou melhoria'
                                                : lang === 'es'
                                                    ? 'Solicitud de función o mejora'
                                                    : 'Feature request or enhancement'
                                            }
                                        </td>
                                        <td className="border border-gray-200 p-3">
                                            {lang === 'pt' ? '48 horas' : lang === 'es' ? '48 horas' : '48 hours'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Service Hours */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '5. Horário de Atendimento' : lang === 'es' ? '5. Horario de Atención' : '5. Service Hours'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Nossa equipe de suporte está disponível durante horário comercial (Segunda a Sexta, 9h às 18h, horário de Miami, Florida). Problemas críticos são monitorados 24/7 através de sistemas automatizados.'
                                : lang === 'es'
                                    ? 'Nuestro equipo de soporte está disponible durante el horario laboral (Lunes a Viernes, 9h a 18h, hora de Miami, Florida). Los problemas críticos se monitorean 24/7 a través de sistemas automatizados.'
                                    : 'Our support team is available during business hours (Monday to Friday, 9am to 6pm, Miami, Florida time). Critical issues are monitored 24/7 through automated systems.'
                            }
                        </p>
                    </section>

                    {/* Data Backup */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '6. Backup de Dados' : lang === 'es' ? '6. Copia de Seguridad de Datos' : '6. Data Backup'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Realizamos backups automáticos diários de todos os dados dos usuários. Os backups são armazenados de forma segura e criptografada, mantidos por 30 dias.'
                                : lang === 'es'
                                    ? 'Realizamos copias de seguridad automáticas diarias de todos los datos de los usuarios. Las copias de seguridad se almacenan de forma segura y encriptada, mantenidas durante 30 días.'
                                    : 'We perform automatic daily backups of all user data. Backups are stored securely and encrypted, retained for 30 days.'
                            }
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="mb-12 bg-cyan-50 p-6 rounded-xl border border-cyan-200">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '7. Entre em Contato' : lang === 'es' ? '7. Póngase en Contacto' : '7. Get in Touch'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Para suporte técnico ou dúvidas sobre esta política:'
                                : lang === 'es'
                                    ? 'Para soporte técnico o preguntas sobre esta política:'
                                    : 'For technical support or questions about this policy:'
                            }
                        </p>
                        <div className="space-y-3 text-gray-700">
                            <p className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <strong>
                                    {lang === 'pt' ? 'Suporte:' : lang === 'es' ? 'Soporte:' : 'Support:'}
                                </strong>
                                <a href="mailto:support@brixaurea.com" className="text-cyan-600 hover:text-cyan-700 font-medium">
                                    support@brixaurea.com
                                </a>
                            </p>
                            <p className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <strong>
                                    {lang === 'pt' ? 'Horário:' : lang === 'es' ? 'Horario:' : 'Hours:'}
                                </strong>
                                {lang === 'pt'
                                    ? 'Seg-Sex, 9h-18h (Miami, Florida)'
                                    : lang === 'es'
                                        ? 'Lun-Vie, 9h-18h (Miami, Florida)'
                                        : 'Mon-Fri, 9am-6pm (Miami, Florida)'
                                }
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                <strong>BrixAurea</strong> • Miami, Florida 33180, USA
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            <Footer lang={lang} dictionary={dict} />
        </div>
    );
}
