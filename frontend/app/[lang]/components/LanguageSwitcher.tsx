'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
    const pathname = usePathname();

    // Remove current language from pathname using regex to ensure exact match
    const basePath = pathname.replace(/^\/(en|pt|es)/, '') || '/';

    const languages = [
        { code: 'en', name: 'EN' },
        { code: 'pt', name: 'PT' },
        { code: 'es', name: 'ES' },
    ];

    return (
        <div className="flex items-center gap-3">
            {languages.map((lang) => (
                <Link
                    key={lang.code}
                    href={`/${lang.code}${basePath}`}
                    className={`text-sm font-medium transition-colors ${currentLang === lang.code
                        ? 'text-cyan-500'
                        : 'text-gray-600 hover:text-cyan-500'
                        }`}
                >
                    {lang.name}
                </Link>
            ))}
        </div>
    );
}

