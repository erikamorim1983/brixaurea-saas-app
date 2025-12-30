import Link from "next/link";

interface FooterProps {
    lang: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary: any;
    simplified?: boolean;
}

export default function Footer({ lang, dictionary: dict, simplified = false }: FooterProps) {
    // Simplified footer for legal pages (terms, privacy, etc.)
    if (simplified) {
        return (
            <footer className="bg-[#081F2E] text-gray-300 border-t border-cyan-500/20">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Logo */}
                        <Link href={`/${lang}`} className="font-bold text-lg text-white block w-32 h-8 relative">
                            <img
                                src="/images/logo/BrixAurea_full_transparent.png"
                                alt="BrixAurea"
                                className="w-full h-full object-contain object-left"
                            />
                        </Link>

                        {/* Quick Links */}
                        <nav className="flex flex-wrap justify-center gap-4 text-sm">
                            <Link href={`/${lang}/privacy`} className="hover:text-cyan-400 transition-colors">
                                {dict.sections?.footer?.legal?.privacy || 'Política de Privacidade'}
                            </Link>
                            <span className="text-gray-600">|</span>
                            <Link href={`/${lang}/terms`} className="hover:text-cyan-400 transition-colors">
                                {dict.sections?.footer?.legal?.terms || 'Termos de Uso'}
                            </Link>
                            <span className="text-gray-600">|</span>
                            <Link href={`/${lang}/faq`} className="hover:text-cyan-400 transition-colors">
                                {dict.sections?.footer?.support?.faq || 'FAQ'}
                            </Link>
                        </nav>

                        {/* Copyright */}
                        <p className="text-xs text-gray-500">
                            {dict.sections?.footer?.copyright || '© 2025 BrixAurea'}
                        </p>
                    </div>
                </div>
            </footer>
        );
    }

    // Full footer
    return (
        <footer className="bg-[#081F2E] text-gray-300 border-t border-cyan-500/20">
            <div className="container mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div>
                        <div className="mb-4 w-40 h-10 relative">
                            <img
                                src="/images/logo/BrixAurea_full_transparent.png"
                                alt="BrixAurea"
                                className="w-full h-full object-contain object-left"
                            />
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            {dict.sections?.footer?.company?.description || 'A plataforma definitiva de viabilidade imobiliária.'}
                        </p>
                        {/* Social Media */}
                        <div className="flex gap-4">
                            <a
                                href="https://instagram.com/brixaurea"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-700 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                                aria-label="Instagram"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a
                                href="https://linkedin.com/company/brixaurea"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-700 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                                aria-label="LinkedIn"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">{dict.sections?.footer?.legal?.title || 'Legal'}</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href={`/${lang}/privacy`} className="hover:text-cyan-400 transition-colors">
                                    {dict.sections?.footer?.legal?.privacy || 'Política de Privacidade'}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${lang}/terms`} className="hover:text-cyan-400 transition-colors">
                                    {dict.sections?.footer?.legal?.terms || 'Termos de Uso'}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${lang}/support-policy`} className="hover:text-cyan-400 transition-colors">
                                    {dict.sections?.footer?.legal?.support_policy || 'Política de Suporte e Disponibilidade'}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">{dict.sections?.footer?.support?.title || 'Suporte'}</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href={`/${lang}/support`} className="hover:text-cyan-400 transition-colors">
                                    {dict.sections?.footer?.support?.center || 'Central de Suporte'}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${lang}/docs`} className="hover:text-cyan-400 transition-colors">
                                    {dict.sections?.footer?.support?.documentation || 'Documentação'}
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${lang}/faq`} className="hover:text-cyan-400 transition-colors">
                                    {dict.sections?.footer?.support?.faq || 'Perguntas Frequentes'}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">{dict.sections?.footer?.contact?.title || 'Contato'}</h4>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href={`mailto:${dict.sections?.footer?.contact?.general || 'contact@brixaurea.com'}`} className="hover:text-cyan-400 transition-colors">
                                    {dict.sections?.footer?.contact?.general || 'contact@brixaurea.com'}
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <a href={`mailto:${dict.sections?.footer?.contact?.support_email || 'support@brixaurea.com'}`} className="hover:text-cyan-400 transition-colors">
                                    {dict.sections?.footer?.contact?.support_email || 'support@brixaurea.com'}
                                </a>
                            </li>
                            <li>
                                <Link href={`/${lang}/about`} className="hover:text-cyan-400 transition-colors">
                                    {dict.sections?.footer?.contact?.about || 'Sobre Nós'}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 pt-8 mt-8 text-center">
                    <p className="text-sm text-gray-400">{dict.sections?.footer?.copyright || '© 2025 BrixAurea. Todos os direitos reservados.'}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        {dict.sections?.footer?.company_attribution || 'Uma solução da EA Financial Advisory'} • <a href="https://www.eafinancialadvisory.com/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">eafinancialadvisory.com</a>
                        <span className="mx-2 text-gray-700">|</span>
                        <Link href={`/${lang}/test-aura`} className="text-gray-600 hover:text-[#00D9FF] transition-colors text-[10px] uppercase tracking-wider">
                            ✨
                        </Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}
