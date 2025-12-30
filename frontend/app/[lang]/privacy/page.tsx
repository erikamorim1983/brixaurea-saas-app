import { getDictionary } from "../../../get-dictionary";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default async function PrivacyPage({
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
                    {lang === 'pt' ? 'Política de Privacidade' : lang === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
                </h1>
                <p className="text-gray-500 mb-12">
                    {lang === 'pt' ? 'Última atualização: Dezembro 2025' : lang === 'es' ? 'Última actualización: Diciembre 2025' : 'Last updated: December 2025'}
                </p>

                <div className="prose prose-lg max-w-none">
                    {/* Introduction */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '1. Introdução' : lang === 'es' ? '1. Introducción' : '1. Introduction'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'A BrixAurea ("nós", "nosso" ou "nos") está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você usa nossa plataforma de análise de viabilidade imobiliária.'
                                : lang === 'es'
                                    ? 'BrixAurea ("nosotros", "nuestro" o "nos") está comprometida a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestra plataforma de análisis de viabilidad inmobiliaria.'
                                    : 'BrixAurea ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our real estate feasibility analysis platform.'
                            }
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '2. Informações que Coletamos' : lang === 'es' ? '2. Información que Recopilamos' : '2. Information We Collect'}
                        </h2>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            {lang === 'pt' ? '2.1 Informações Pessoais' : lang === 'es' ? '2.1 Información Personal' : '2.1 Personal Information'}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Quando você se registra em nossa plataforma, podemos coletar: nome, endereço de e-mail, informações de pagamento, dados da empresa, e outras informações fornecidas voluntariamente.'
                                : lang === 'es'
                                    ? 'Cuando se registra en nuestra plataforma, podemos recopilar: nombre, dirección de correo electrónico, información de pago, datos de la empresa y otra información proporcionada voluntariamente.'
                                    : 'When you register on our platform, we may collect: name, email address, payment information, company data, and other information voluntarily provided.'
                            }
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                            {lang === 'pt' ? '2.2 Dados de Uso' : lang === 'es' ? '2.2 Datos de Uso' : '2.2 Usage Data'}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Coletamos automaticamente informações sobre como você interage com nossa plataforma, incluindo endereço IP, tipo de navegador, páginas visitadas e tempo de acesso.'
                                : lang === 'es'
                                    ? 'Recopilamos automáticamente información sobre cómo interactúa con nuestra plataforma, incluyendo dirección IP, tipo de navegador, páginas visitadas y tiempo de acceso.'
                                    : 'We automatically collect information about how you interact with our platform, including IP address, browser type, pages visited, and access times.'
                            }
                        </p>
                    </section>

                    {/* How We Use Your Information */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '3. Como Usamos Suas Informações' : lang === 'es' ? '3. Cómo Usamos Su Información' : '3. How We Use Your Information'}
                        </h2>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>
                                {lang === 'pt'
                                    ? 'Fornecer e manter nossa plataforma'
                                    : lang === 'es'
                                        ? 'Proporcionar y mantener nuestra plataforma'
                                        : 'Provide and maintain our platform'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Processar transações e gerenciar sua conta'
                                    : lang === 'es'
                                        ? 'Procesar transacciones y gestionar su cuenta'
                                        : 'Process transactions and manage your account'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Melhorar e personalizar sua experiência'
                                    : lang === 'es'
                                        ? 'Mejorar y personalizar su experiencia'
                                        : 'Improve and personalize your experience'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Comunicar atualizações, ofertas e informações relacionadas'
                                    : lang === 'es'
                                        ? 'Comunicar actualizaciones, ofertas e información relacionada'
                                        : 'Communicate updates, offers, and related information'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Garantir a segurança e prevenir fraudes'
                                    : lang === 'es'
                                        ? 'Garantizar la seguridad y prevenir fraudes'
                                        : 'Ensure security and prevent fraud'
                                }
                            </li>
                        </ul>
                    </section>

                    {/* Data Security */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '4. Segurança de Dados' : lang === 'es' ? '4. Seguridad de Datos' : '4. Data Security'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.'
                                : lang === 'es'
                                    ? 'Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.'
                                    : 'We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
                            }
                        </p>
                    </section>

                    {/* Cookies and Sessions */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '4.1 Cookies e Sessões' : lang === 'es' ? '4.1 Cookies y Sesiones' : '4.1 Cookies and Sessions'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Utilizamos cookies seguros para autenticação e gerenciamento de sessão. Suas sessões expiram após 24 horas de inatividade. Todos os cookies são transmitidos via HTTPS com flags HttpOnly e SameSite para máxima segurança.'
                                : lang === 'es'
                                    ? 'Utilizamos cookies seguros para autenticación y gestión de sesiones. Sus sesiones expiran después de 24 horas de inactividad. Todas las cookies se transmiten a través de HTTPS con flags HttpOnly y SameSite para máxima seguridad.'
                                    : 'We use secure cookies for authentication and session management. Your sessions expire after 24 hours of inactivity. All cookies are transmitted via HTTPS with HttpOnly and SameSite flags for maximum security.'
                            }
                        </p>
                    </section>

                    {/* Security Audit Logging */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '4.2 Registro de Auditoria de Segurança' : lang === 'es' ? '4.2 Registro de Auditoría de Seguridad' : '4.2 Security Audit Logging'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Para sua segurança e conformidade com ISO 27001, registramos eventos de segurança incluindo: tentativas de login (bem-sucedidas e falhadas), alterações de senha, criação/exclusão de contas, e alterações de permissões. Esses logs incluem endereços IP com hash (não armazenamos IPs em texto simples) e user agents.'
                                : lang === 'es'
                                    ? 'Para su seguridad y cumplimiento con ISO 27001, registramos eventos de seguridad incluyendo: intentos de inicio de sesión (exitosos y fallidos), cambios de contraseña, creación/eliminación de cuentas y cambios de permisos. Estos registros incluyen direcciones IP con hash (no almacenamos IPs en texto plano) y user agents.'
                                    : 'For your security and ISO 27001 compliance, we log security events including: login attempts (successful and failed), password changes, account creation/deletion, and permission changes. These logs include hashed IP addresses (we do not store raw IPs) and user agents.'
                            }
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '4.3 Retenção de Dados' : lang === 'es' ? '4.3 Retención de Datos' : '4.3 Data Retention'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Mantemos seus dados pessoais apenas pelo tempo necessário:'
                                : lang === 'es'
                                    ? 'Mantenemos sus datos personales solo durante el tiempo necesario:'
                                    : 'We retain your personal data only as long as necessary:'
                            }
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>
                                {lang === 'pt'
                                    ? 'Logs de auditoria de segurança: 90 dias (eventos críticos: 365 dias)'
                                    : lang === 'es'
                                        ? 'Registros de auditoría de seguridad: 90 días (eventos críticos: 365 días)'
                                        : 'Security audit logs: 90 days (critical events: 365 days)'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Dados de conta ativa: enquanto sua conta estiver ativa'
                                    : lang === 'es'
                                        ? 'Datos de cuenta activa: mientras su cuenta esté activa'
                                        : 'Active account data: while your account is active'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Dados de conta inativa: 90 dias após a última atividade, então excluídos permanentemente'
                                    : lang === 'es'
                                        ? 'Datos de cuenta inactiva: 90 días después de la última actividad, luego eliminados permanentemente'
                                        : 'Inactive account data: 90 days after last activity, then permanently deleted'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Dados financeiros: conforme exigido por lei (geralmente 7 anos)'
                                    : lang === 'es'
                                        ? 'Datos financieros: según lo requerido por la ley (generalmente 7 años)'
                                        : 'Financial records: as required by law (typically 7 years)'
                                }
                            </li>
                        </ul>
                    </section>

                    {/* Rate Limiting and Security */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '4.4 Proteção contra Abuso' : lang === 'es' ? '4.4 Protección contra Abuso' : '4.4 Abuse Protection'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Implementamos rate limiting (limitação de taxa) para proteger contra ataques de força bruta e abuso. Isso significa que há limites no número de tentativas de login e outras ações sensíveis dentro de um período de tempo. Esses limites ajudam a manter sua conta segura.'
                                : lang === 'es'
                                    ? 'Implementamos limitación de velocidad (rate limiting) para proteger contra ataques de fuerza bruta y abuso. Esto significa que hay límites en el número de intentos de inicio de sesión y otras acciones sensibles dentro de un período de tiempo. Estos límites ayudan a mantener su cuenta segura.'
                                    : 'We implement rate limiting to protect against brute force attacks and abuse. This means there are limits on the number of login attempts and other sensitive actions within a time period. These limits help keep your account secure.'
                            }
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '5. Seus Direitos' : lang === 'es' ? '5. Sus Derechos' : '5. Your Rights'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Você tem o direito de acessar, corrigir, excluir ou portar seus dados pessoais. Para exercer esses direitos, entre em contato conosco através de support@brixaurea.com.'
                                : lang === 'es'
                                    ? 'Tiene derecho a acceder, corregir, eliminar o portar sus datos personales. Para ejercer estos derechos, contáctenos a través de support@brixaurea.com.'
                                    : 'You have the right to access, correct, delete, or port your personal data. To exercise these rights, contact us at support@brixaurea.com.'
                            }
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="mb-12 bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '6. Contato' : lang === 'es' ? '6. Contacto' : '6. Contact'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco:'
                                : lang === 'es'
                                    ? 'Si tiene preguntas sobre esta Política de Privacidad, contáctenos:'
                                    : 'If you have questions about this Privacy Policy, contact us:'
                            }
                        </p>
                        <div className="space-y-2 text-gray-700">
                            <p className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <strong>Email:</strong> <a href="mailto:support@brixaurea.com" className="text-cyan-500 hover:text-cyan-600">support@brixaurea.com</a>
                            </p>
                            <p><strong>BrixAurea</strong></p>
                            <p className="text-sm">Miami, Florida 33180, USA</p>
                        </div>
                    </section>
                </div>
            </main>

            <Footer lang={lang} dictionary={dict} />
        </div>
    );
}
