import { getDictionary } from "../../../get-dictionary";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default async function TermsPage({
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
                    {lang === 'pt' ? 'Termos de Uso' : lang === 'es' ? 'Términos de Uso' : 'Terms of Use'}
                </h1>
                <p className="text-gray-500 mb-12">
                    {lang === 'pt' ? 'Última atualização: Dezembro 2025' : lang === 'es' ? 'Última actualización: Diciembre 2025' : 'Last updated: December 2025'}
                </p>

                <div className="prose prose-lg max-w-none">
                    {/* Introduction */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '1. Aceitação dos Termos' : lang === 'es' ? '1. Aceptación de los Términos' : '1. Acceptance of Terms'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Ao acessar e usar a plataforma BrixAurea, você concorda em estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.'
                                : lang === 'es'
                                    ? 'Al acceder y usar la plataforma BrixAurea, acepta estar vinculado a estos Términos de Uso. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.'
                                    : 'By accessing and using the BrixAurea platform, you agree to be bound by these Terms of Use. If you disagree with any part of these terms, you may not access the service.'
                            }
                        </p>
                    </section>

                    {/* License */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '2. Licença de Uso' : lang === 'es' ? '2. Licencia de Uso' : '2. License to Use'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Concedemos a você uma licença limitada, não exclusiva, intransferível e revogável para acessar e usar a plataforma BrixAurea de acordo com estes termos.'
                                : lang === 'es'
                                    ? 'Le otorgamos una licencia limitada, no exclusiva, intransferible y revocable para acceder y usar la plataforma BrixAurea de acuerdo con estos términos.'
                                    : 'We grant you a limited, non-exclusive, non-transferable, and revocable license to access and use the BrixAurea platform in accordance with these terms.'
                            }
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                            {lang === 'pt' ? 'Restrições de Uso' : lang === 'es' ? 'Restricciones de Uso' : 'Usage Restrictions'}
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Você concorda em não:'
                                : lang === 'es'
                                    ? 'Usted acepta no:'
                                    : 'You agree not to:'
                            }
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>
                                {lang === 'pt'
                                    ? 'Copiar, modificar ou distribuir o conteúdo da plataforma sem autorização'
                                    : lang === 'es'
                                        ? 'Copiar, modificar o distribuir el contenido de la plataforma sin autorización'
                                        : 'Copy, modify, or distribute platform content without authorization'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Tentar obter acesso não autorizado a sistemas ou dados'
                                    : lang === 'es'
                                        ? 'Intentar obtener acceso no autorizado a sistemas o datos'
                                        : 'Attempt to gain unauthorized access to systems or data'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Usar a plataforma para fins ilegais ou não autorizados'
                                    : lang === 'es'
                                        ? 'Usar la plataforma para fines ilegales o no autorizados'
                                        : 'Use the platform for illegal or unauthorized purposes'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Interferir ou interromper a integridade ou desempenho da plataforma'
                                    : lang === 'es'
                                        ? 'Interferir o interrumpir la integridad o el rendimiento de la plataforma'
                                        : 'Interfere with or disrupt the integrity or performance of the platform'
                                }
                            </li>
                        </ul>
                    </section>

                    {/* Account */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '3. Conta de Usuário' : lang === 'es' ? '3. Cuenta de Usuario' : '3. User Account'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Você é responsável por manter a confidencialidade de suas credenciais de conta e por todas as atividades que ocorram sob sua conta. Você deve notificar-nos imediatamente sobre qualquer uso não autorizado.'
                                : lang === 'es'
                                    ? 'Usted es responsable de mantener la confidencialidad de sus credenciales de cuenta y de todas las actividades que ocurran bajo su cuenta. Debe notificarnos inmediatamente sobre cualquier uso no autorizado.'
                                    : 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.'
                            }
                        </p>
                    </section>

                    {/* Account Security Requirements */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '3.1 Requisitos de Segurança da Conta' : lang === 'es' ? '3.1 Requisitos de Seguridad de la Cuenta' : '3.1 Account Security Requirements'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Para manter a segurança da plataforma e proteger todos os usuários, você concorda em:'
                                : lang === 'es'
                                    ? 'Para mantener la seguridad de la plataforma y proteger a todos los usuarios, acepta:'
                                    : 'To maintain platform security and protect all users, you agree to:'
                            }
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>
                                {lang === 'pt'
                                    ? 'Usar senhas fortes (mínimo 8 caracteres com letras maiúsculas, minúsculas, números e caracteres especiais)'
                                    : lang === 'es'
                                        ? 'Usar contraseñas seguras (mínimo 8 caracteres con mayúsculas, minúsculas, números y caracteres especiales)'
                                        : 'Use strong passwords (minimum 8 characters with uppercase, lowercase, numbers, and special characters)'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Nunca compartilhar suas credenciais de login com terceiros'
                                    : lang === 'es'
                                        ? 'Nunca compartir sus credenciales de inicio de sesión con terceros'
                                        : 'Never share your login credentials with third parties'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Notificar-nos imediatamente se suspeitar de acesso não autorizado'
                                    : lang === 'es'
                                        ? 'Notificarnos inmediatamente si sospecha de acceso no autorizado'
                                        : 'Notify us immediately if you suspect unauthorized access'
                                }
                            </li>
                            <li>
                                {lang === 'pt'
                                    ? 'Aceitar limites de taxa (rate limiting) em ações de login e outras ações sensíveis para prevenir abuso'
                                    : lang === 'es'
                                        ? 'Aceptar límites de velocidad en acciones de inicio de sesión y otras acciones sensibles para prevenir abuso'
                                        : 'Accept rate limits on login and other sensitive actions to prevent abuse'
                                }
                            </li>
                        </ul>
                    </section>

                    {/* Security Monitoring */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '3.2 Monitoramento de Segurança' : lang === 'es' ? '3.2 Monitoreo de Seguridad' : '3.2 Security Monitoring'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Para proteger a plataforma e todos os usuários, monitoramos atividades de segurança e registramos eventos como tentativas de login, alterações de conta e ações suspeitas. Reservamo-nos o direito de suspender ou encerrar contas que exibam comportamento suspeito ou violem nossas políticas de segurança.'
                                : lang === 'es'
                                    ? 'Para proteger la plataforma y a todos los usuarios, monitoreamos actividades de seguridad y registramos eventos como intentos de inicio de sesión, cambios de cuenta y acciones sospechosas. Nos reservamos el derecho de suspender o terminar cuentas que exhiban comportamiento sospechoso o violen nuestras políticas de seguridad.'
                                    : 'To protect the platform and all users, we monitor security activities and log events such as login attempts, account changes, and suspicious actions. We reserve the right to suspend or terminate accounts that exhibit suspicious behavior or violate our security policies.'
                            }
                        </p>
                    </section>

                    {/* Payment */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '4. Pagamento e Assinaturas' : lang === 'es' ? '4. Pago y Suscripciones' : '4. Payment and Subscriptions'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Ao se inscrever em um plano pago, você concorda em pagar todas as taxas aplicáveis. Os pagamentos são processados através de provedores terceirizados seguros. As assinaturas são renovadas automaticamente, a menos que canceladas.'
                                : lang === 'es'
                                    ? 'Al suscribirse a un plan de pago, acepta pagar todas las tarifas aplicables. Los pagos se procesan a través de proveedores externos seguros. Las suscripciones se renuevan automáticamente a menos que se cancelen.'
                                    : 'By subscribing to a paid plan, you agree to pay all applicable fees. Payments are processed through secure third-party providers. Subscriptions renew automatically unless canceled.'
                            }
                        </p>
                    </section>

                    {/* Intellectual Property */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '5. Propriedade Intelectual' : lang === 'es' ? '5. Propiedad Intelectual' : '5. Intellectual Property'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Todo o conteúdo, recursos e funcionalidades da plataforma BrixAurea são propriedade exclusiva da BrixAurea e são protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.'
                                : lang === 'es'
                                    ? 'Todo el contenido, recursos y funcionalidades de la plataforma BrixAurea son propiedad exclusiva de BrixAurea y están protegidos por leyes de derechos de autor, marcas registradas y otras leyes de propiedad intelectual.'
                                    : 'All content, features, and functionality of the BrixAurea platform are the exclusive property of BrixAurea and are protected by copyright, trademark, and other intellectual property laws.'
                            }
                        </p>
                    </section>

                    {/* Limitation */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '6. Limitação de Responsabilidade' : lang === 'es' ? '6. Limitación de Responsabilidad' : '6. Limitation of Liability'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'A BrixAurea não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos resultantes do seu acesso ou uso da plataforma.'
                                : lang === 'es'
                                    ? 'BrixAurea no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo que resulte de su acceso o uso de la plataforma.'
                                    : 'BrixAurea shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the platform.'
                            }
                        </p>
                    </section>

                    {/* Termination */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '7. Rescisão' : lang === 'es' ? '7. Terminación' : '7. Termination'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Podemos rescindir ou suspender seu acesso à plataforma imediatamente, sem aviso prévio, por qualquer motivo, incluindo violação destes Termos de Uso.'
                                : lang === 'es'
                                    ? 'Podemos rescindir o suspender su acceso a la plataforma inmediatamente, sin previo aviso, por cualquier motivo, incluida la violación de estos Términos de Uso.'
                                    : 'We may terminate or suspend your access to the platform immediately, without prior notice, for any reason, including breach of these Terms of Use.'
                            }
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="mb-12 bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h2 className="text-2xl font-bold text-[#081F2E] mb-4">
                            {lang === 'pt' ? '8. Contato' : lang === 'es' ? '8. Contacto' : '8. Contact'}
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {lang === 'pt'
                                ? 'Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco:'
                                : lang === 'es'
                                    ? 'Si tiene preguntas sobre estos Términos de Uso, contáctenos:'
                                    : 'If you have questions about these Terms of Use, contact us:'
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
