import Script from 'next/script';
import { getDictionary } from '@/get-dictionary';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default async function StripePricingPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header lang={lang} dictionary={dict} />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-[#081F2E] via-gray-900 to-[#081F2E] text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            {lang === 'pt' ? 'Escolha seu Plano' : lang === 'es' ? 'Elige tu Plan' : 'Choose Your Plan'}
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            {lang === 'pt'
                                ? 'Comece com um trial grátis, sem compromisso'
                                : lang === 'es'
                                    ? 'Comienza con una prueba gratis, sin compromiso'
                                    : 'Start with a free trial, no commitment'}
                        </p>
                    </div>
                </section>

                {/* Stripe Pricing Table */}
                <section className="py-20 -mt-10">
                    <div className="container mx-auto px-4 max-w-6xl">
                        {/* Load Stripe Pricing Table Script */}
                        <Script
                            src="https://js.stripe.com/v3/pricing-table.js"
                            strategy="lazyOnload"
                        />

                        {/* Pricing Table - Using createElement to bypass TS check for Web Component */}
                        {React.createElement('stripe-pricing-table', {
                            'pricing-table-id': "prctbl_1SfWpAGqIvEjcgEEONGu8jwy",
                            'publishable-key': "pk_live_51SfCWbGqIvEjcgEEMVM8oueG7DHK3FxF5ifodLrKcwqgJVbretT60UV0yHeIMb7U0o5MsN4Skgw6dkLrKamDsySE00sDmgQ2oA"
                        })}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            {lang === 'pt' ? 'Perguntas Frequentes' : lang === 'es' ? 'Preguntas Frecuentes' : 'FAQ'}
                        </h2>
                        <div className="space-y-4">
                            <details className="bg-white p-6 rounded-xl border">
                                <summary className="font-semibold cursor-pointer">
                                    {lang === 'pt' ? 'Posso mudar de plano depois?' : 'Can I change plans later?'}
                                </summary>
                                <p className="mt-4 text-gray-600">
                                    {lang === 'pt'
                                        ? 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento.'
                                        : 'Yes! You can upgrade or downgrade at any time.'}
                                </p>
                            </details>
                            <details className="bg-white p-6 rounded-xl border">
                                <summary className="font-semibold cursor-pointer">
                                    {lang === 'pt' ? 'O que acontece quando o trial termina?' : 'What happens when trial ends?'}
                                </summary>
                                <p className="mt-4 text-gray-600">
                                    {lang === 'pt'
                                        ? 'Você será cobrado automaticamente no plano escolhido. Pode cancelar antes do fim do trial.'
                                        : 'You will be automatically charged for your chosen plan. You can cancel before trial ends.'}
                                </p>
                            </details>
                        </div>
                    </div>
                </section>
            </main>

            <Footer lang={lang} dictionary={dict} />
        </div>
    );
}
