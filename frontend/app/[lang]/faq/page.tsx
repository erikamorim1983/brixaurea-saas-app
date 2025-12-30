import { getDictionary } from "../../../get-dictionary";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default async function FAQPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header lang={lang} dictionary={dict} />

            <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-bold text-[#081F2E] mb-4">
                    {lang === 'pt' ? 'Perguntas Frequentes' : lang === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions'}
                </h1>
                <p className="text-gray-500 mb-12">
                    {lang === 'pt' ? 'Em breve...' : lang === 'es' ? 'Próximamente...' : 'Coming soon...'}
                </p>

                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-8 text-center">
                    <p className="text-gray-700 mb-4">
                        {lang === 'pt'
                            ? 'As perguntas frequentes estarão disponíveis em breve.'
                            : lang === 'es'
                                ? 'Las preguntas frecuentes estarán disponibles pronto.'
                                : 'FAQ section will be available soon.'
                        }
                    </p>
                    <Link href={`/${lang}/support`} className="text-cyan-600 hover:text-cyan-700 font-semibold">
                        {lang === 'pt' ? 'Entre em contato com o suporte' : lang === 'es' ? 'Contacte con soporte' : 'Contact support'}
                    </Link>
                </div>
            </main>

            <Footer lang={lang} dictionary={dict} />
        </div>
    );
}
