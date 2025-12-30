import { getDictionary } from "../../get-dictionary";
import Link from "next/link";
import LanguageSwitcher from "./components/LanguageSwitcher";

export default async function Page({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Modern Navbar with Glassmorphism */}
            <header className="sticky top-0 z-50 w-full glass border-b border-gray-200">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href={`/${lang}`} className="font-bold text-2xl tracking-tight block w-40 h-10 relative">
                        <img
                            src="/images/logo/BrixAurea_full_transparent.png"
                            alt="BrixAurea"
                            className="w-full h-full object-contain object-left"
                        />
                    </Link>

                    <nav className="hidden md:flex gap-6 items-center text-sm font-medium text-gray-600">
                        <Link href={`/${lang}#solution`} className="hover:text-cyan-500 transition-colors">
                            {dict.nav.solution}
                        </Link>
                        <Link href={`/${lang}/pricing`} className="hover:text-cyan-500 transition-colors">
                            {dict.nav.plans}
                        </Link>
                        <Link href={`/${lang}/about`} className="hover:text-cyan-500 transition-colors">
                            {dict.nav.about}
                        </Link>
                    </nav>


                    <div className="flex items-center gap-4">
                        <LanguageSwitcher currentLang={lang} />

                        <Link href={`/${lang}/dashboard`} className="px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-md hover:bg-yellow-200 transition-colors border-2 border-yellow-300" title="Dev: Skip to Dashboard">🚀 DEV</Link>

                        <Link
                            href={`/${lang}/auth/login`}
                            className="text-sm font-medium text-gray-700 hover:text-cyan-500 transition-colors"
                        >
                            {dict.nav.login}
                        </Link>

                        {/* Access MyValuation Link */}
                        <a
                            href="https://brixaurea-saas-app.vercel.app"
                            target="_blank"
                            className="btn-primary text-sm !py-2 !px-4 !rounded-lg"
                        >
                            Acessar MyValuation
                        </a>

                        <Link
                            href={`/${lang}/auth/register`}
                            className="px-4 py-2 bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105"
                        >
                            {dict.nav.get_started}
                        </Link>
                    </div>

                </div>
            </header>

            {/* Hero Section with Light Theme */}
            <section className="relative px-4 py-20 md:py-32 bg-gradient-to-br from-white via-gray-50 to-cyan-50 overflow-hidden">
                {/* Floating Elements */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite]"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-300/5 rounded-full blur-3xl"></div>

                {/* TEMPORARY: Investor Access Link */}
                <div className="absolute top-4 right-4 z-50">
                    <Link href={`/${lang}/investor-relations`} className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 backdrop-blur-sm border border-black/10 rounded-full text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-black/10 hover:text-black transition-all">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        Investor Access
                    </Link>
                </div>

                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 rounded-full text-xs font-bold uppercase tracking-wider border border-cyan-200 backdrop-blur-sm">
                        <span className="inline-flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            SaaS v1.8
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-[#081F2E] mb-6 tracking-tight leading-tight">
                        {dict.hero.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {dict.hero.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={`/${lang}/auth/register`}
                            className="group px-8 py-4 bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white text-base font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 relative overflow-hidden"
                        >
                            <span className="relative z-10">{dict.hero.cta_primary}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                        <button className="px-8 py-4 bg-white text-gray-700 text-base font-semibold rounded-xl border-2 border-gray-200 hover:border-cyan-300 hover:bg-gray-50 transition-all duration-300">
                            {dict.hero.cta_secondary}
                        </button>
                    </div>
                </div>
            </section>

            {/* What is BrixAurea */}
            <section id="solution" className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h2 className="text-4xl font-bold text-[#081F2E] mb-6">
                        {dict.sections.what_is.title}
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        {dict.sections.what_is.description}
                    </p>
                </div>
            </section>

            {/* For Whom with Modern Icons */}
            <section className="py-20 bg-gray-50 border-y border-gray-200">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h2 className="text-4xl font-bold text-[#081F2E] mb-12 text-center">
                        {dict.sections.for_whom.title}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {dict.sections.for_whom.items.map((item: string, i: number) => (
                            <div
                                key={i}
                                className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-cyan-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                                    {/* SVG Icons based on index */}
                                    {i === 0 && (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    )}
                                    {i === 1 && (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    )}
                                    {i === 2 && (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    {i === 3 && (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                                <p className="text-gray-700 font-medium">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section - Modern Clean Design */}
            <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-cyan-100 text-cyan-700 text-sm font-semibold rounded-full mb-4">
                            Recursos
                        </span>
                        <h2 className="text-4xl font-bold text-[#081F2E] mb-4">
                            {dict.sections.features.title}
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Recursos poderosos para transformar seu negócio imobiliário
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dict.sections.features.items.map((feature: { title: string, desc: string }, i: number) => (
                            <div
                                key={i}
                                className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-cyan-200 overflow-hidden"
                            >
                                {/* Gradient accent on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Feature Icon */}
                                    <div className="mb-6 w-14 h-14 bg-gradient-to-br from-[#00D9FF] to-[#0EA5E9] rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 group-hover:shadow-cyan-500/40 transition-all duration-300">
                                        {i % 6 === 0 && (
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        )}
                                        {i % 6 === 1 && (
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        )}
                                        {i % 6 === 2 && (
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        )}
                                        {i % 6 === 3 && (
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        )}
                                        {i % 6 === 4 && (
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        )}
                                        {i % 6 === 5 && (
                                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-[#081F2E] mb-3 group-hover:text-[#00D9FF] transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {feature.desc}
                                    </p>

                                    {/* Decorative arrow */}
                                    <div className="mt-6 flex items-center text-[#00D9FF] opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                        <span className="text-sm font-medium">Saiba mais</span>
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>

                                    {/* Full Card Link overlay */}
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(feature as any).slug && (
                                        <Link
                                            href={`/${lang}/features/${(feature as any).slug}`}
                                            className="absolute inset-0 z-20"
                                            aria-label={`View details for ${feature.title}`}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA with Gradient */}
            <section className="py-24 bg-gradient-to-r from-[#081F2E] via-[#0F3A52] to-[#081F2E] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwRDlGRiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        {dict.sections.action.title}
                    </h2>
                    <p className="text-gray-300 mb-8 text-lg">
                        Comece agora e transforme seu negócio imobiliário
                    </p>
                    <Link
                        href={`/${lang}/auth/register`}
                        className="inline-block px-10 py-5 bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white font-bold rounded-xl shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-105 transition-all duration-300 text-lg"
                    >
                        {dict.sections.action.cta}
                    </Link>
                </div>
            </section>

            {/* Footer Completo e Profissional */}
            <footer id="about" className="bg-[#081F2E] text-gray-300 border-t border-cyan-500/20">
                <div className="container mx-auto px-4 py-12">
                    {/* Main Footer Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        {/* Company Info */}
                        <div>
                            <h3 className="font-bold text-xl mb-4 text-white">
                                Brix<span className="text-cyan-400">Aurea</span>
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                {dict.sections.footer.company.description}
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
                            <h4 className="font-semibold text-white mb-4">{dict.sections.footer.legal.title}</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href={`/${lang}/privacy`} className="hover:text-cyan-400 transition-colors">
                                        {dict.sections.footer.legal.privacy}
                                    </Link>
                                </li>
                                <li>
                                    <Link href={`/${lang}/terms`} className="hover:text-cyan-400 transition-colors">
                                        {dict.sections.footer.legal.terms}
                                    </Link>
                                </li>
                                <li>
                                    <Link href={`/${lang}/support-policy`} className="hover:text-cyan-400 transition-colors">
                                        {dict.sections.footer.legal.support_policy}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="font-semibold text-white mb-4">{dict.sections.footer.support.title}</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href={`/${lang}/support`} className="hover:text-cyan-400 transition-colors">
                                        {dict.sections.footer.support.center}
                                    </Link>
                                </li>
                                <li>
                                    <Link href={`/${lang}/docs`} className="hover:text-cyan-400 transition-colors">
                                        {dict.sections.footer.support.documentation}
                                    </Link>
                                </li>
                                <li>
                                    <Link href={`/${lang}/faq`} className="hover:text-cyan-400 transition-colors">
                                        {dict.sections.footer.support.faq}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-semibold text-white mb-4">{dict.sections.footer.contact.title}</h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <a href={`mailto:${dict.sections.footer.contact.general}`} className="hover:text-cyan-400 transition-colors">
                                        {dict.sections.footer.contact.general}
                                    </a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <a href={`mailto:${dict.sections.footer.contact.support_email}`} className="hover:text-cyan-400 transition-colors">
                                        {dict.sections.footer.contact.support_email}
                                    </a>
                                </li>
                                <li>
                                    <Link href={`/${lang}/about`} className="hover:text-cyan-400 transition-colors">
                                        {dict.sections.footer.contact.about}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-700 pt-8 mt-8 text-center">
                        <p className="text-sm text-gray-400">{dict.sections.footer.copyright}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {dict.sections.footer.company_attribution} • <a href="https://www.eafinancialadvisory.com/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">eafinancialadvisory.com</a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
