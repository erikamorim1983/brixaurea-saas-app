import 'server-only'

type Locale = 'en' | 'pt' | 'es';

// Dictionary type matches the structure of en.json, pt.json, es.json
// Using 'any' here because the dictionary structure is complex and imported from JSON
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dictionary = any;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    pt: () => import('@/dictionaries/pt.json').then((module) => module.default),
    es: () => import('@/dictionaries/es.json').then((module) => module.default),
}

const supportedLocales = Object.keys(dictionaries) as Locale[];

export const getDictionary = async (locale: string): Promise<Dictionary> => {
    const validLocale = supportedLocales.includes(locale as Locale)
        ? locale as Locale
        : 'en';
    return dictionaries[validLocale]();
}
