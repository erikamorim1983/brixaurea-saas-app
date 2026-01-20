import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
    lang: string;
    dictionary: {
        nav: {
            solution: string;
            plans: string;
            about: string;
            insights: string;
            login: string;
            get_started: string;
        };
    };
    showAuthButtons?: boolean;
}

export default function Header({ lang, dictionary, showAuthButtons = true }: HeaderProps) {
    return (
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
                        {dictionary.nav.solution}
                    </Link>
                    <Link href={`/${lang}/insights`} className="hover:text-cyan-500 transition-colors">
                        {dictionary.nav.insights}
                    </Link>
                    <Link href={`/${lang}/pricing`} className="hover:text-cyan-500 transition-colors">
                        {dictionary.nav.plans}
                    </Link>
                    <Link href={`/${lang}/about`} className="hover:text-cyan-500 transition-colors">
                        {dictionary.nav.about}
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <LanguageSwitcher currentLang={lang} />
                    {showAuthButtons && (
                        <>
                            <Link
                                href={`/${lang}/auth/login`}
                                className="text-sm font-medium text-gray-700 hover:text-cyan-500 transition-colors hidden md:block"
                            >
                                {dictionary.nav.login}
                            </Link>
                            <Link
                                href={`/${lang}/auth/register`}
                                className="btn-primary text-sm !py-2 !px-4 !rounded-lg"
                            >
                                {dictionary.nav.get_started}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
