import { getDictionary } from "../../get-dictionary";
import Link from "next/link";

export default async function NotFound({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full glass border-b border-gray-200">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-2xl tracking-tight block w-40 h-10 relative mb-8">
                        <img
                            src="/images/logo/BrixAurea_full_transparent.png"
                            alt="BrixAurea"
                            className="w-full h-full object-contain"
                        />
                    </Link>
                </div>
            </header>

            {/* 404 Content */}
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="text-center max-w-2xl">
                    <div className="mb-8">
                        <svg className="w-32 h-32 mx-auto text-cyan-500/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h1 className="text-6xl font-bold text-[#081F2E] mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        {lang === 'pt' ? 'Página não encontrada' : lang === 'es' ? 'Página no encontrada' : 'Page not found'}
                    </h2>
                    <p className="text-gray-600 mb-8">
                        {lang === 'pt'
                            ? 'Desculpe, a página que você está procurando não existe ou foi movida.'
                            : lang === 'es'
                                ? 'Lo sentimos, la página que está buscando no existe o ha sido movida.'
                                : 'Sorry, the page you are looking for does not exist or has been moved.'
                        }
                    </p>

                    <Link
                        href={`/${lang}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {lang === 'pt' ? 'Voltar ao Início' : lang === 'es' ? 'Volver al Inicio' : 'Back to Home'}
                    </Link>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-8">
                <div className="container mx-auto px-4 text-center text-sm text-gray-600">
                    <p>{dict.sections.footer.copyright}</p>
                </div>
            </footer>
        </div>
    );
}
