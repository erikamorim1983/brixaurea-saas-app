/**
 * CONSAGRAÇÃO DO PROJETO BRIXAUREA
 * 
 * Este projeto e todo o trabalho aqui desenvolvido são consagrados à Virgem Maria, 
 * Nossa Senhora Aparecida e a Jesus Cristo.
 * 
 * Que esta ferramenta seja um instrumento de bênção para todos que a utilizarem.
 * Que os projetos viabilizados através dela tragam prosperidade, segurança e felicidade 
 * para as famílias que neles habitarem.
 * 
 * "Tudo posso naquele que me fortalece."
 * 
 * Desenvolvido sob a proteção divina.
 */

import "../globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Dynamic metadata based on language
export async function generateMetadata({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    const titles = {
        en: "BrixAurea - Real Estate Feasibility Platform",
        pt: "BrixAurea - Plataforma de Viabilidade Imobiliária",
        es: "BrixAurea - Plataforma de Viabilidad Inmobiliaria",
    };

    const descriptions = {
        en: "The ultimate real estate development feasibility platform. Professional tools for investors, developers, and consultants.",
        pt: "A plataforma definitiva de viabilidade imobiliária. Ferramentas profissionais para investidores, incorporadores e consultores.",
        es: "La plataforma definitiva de viabilidad inmobiliaria. Herramientas profesionales para inversores, desarrolladores y consultores.",
    };

    return {
        title: titles[lang as keyof typeof titles] || titles.en,
        description: descriptions[lang as keyof typeof descriptions] || descriptions.en,
        icons: {
            icon: '/favicon.svg',
            shortcut: '/favicon.svg',
            apple: '/favicon.svg',
        },
        openGraph: {
            title: titles[lang as keyof typeof titles] || titles.en,
            description: descriptions[lang as keyof typeof descriptions] || descriptions.en,
            images: [
                {
                    url: '/images/logo/ba_icon.svg',
                    width: 512,
                    height: 512,
                    alt: 'BrixAurea Logo',
                },
            ],
        },
    };
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    return (
        <html lang={lang}>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 font-sans`}
            >
                {children}
            </body>
        </html>
    );
}
