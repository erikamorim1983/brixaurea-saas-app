'use client';

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Remove current language from pathname to get the base path
    const basePath = pathname.replace(`/${currentLang}`, '') || '/';

    // Construct query string
    const queryString = searchParams.toString();
    const query = queryString ? `?${queryString}` : '';

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
                    href={`/${lang.code}${basePath}${query}`}
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
