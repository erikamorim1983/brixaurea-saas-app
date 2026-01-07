import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 1. Handle root redirect separately and early
    if (pathname === '/') {
        const url = request.nextUrl.clone();
        url.pathname = '/en'; // Default locale
        return NextResponse.redirect(url);
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    // 2. Safe Supabase Initialization
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return supabaseResponse;
    }

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        // This refresh session logic is essential for auth stability
        const {
            data: { user },
        } = await supabase.auth.getUser();

        // 3. Extraction of language and path normalization
        const segments = pathname.split('/').filter(Boolean);
        const supportedLocales = ['en', 'pt', 'es'];
        const firstSegment = segments[0];

        const isSupportedLocale = supportedLocales.includes(firstSegment);
        const lang = isSupportedLocale ? firstSegment : 'en';

        // Fix for the 'onboarding' path issue
        // If the path starts with /onboarding or contains it incorrectly, redirect to dashboard
        if (pathname.includes('/onboarding')) {
            const newPath = pathname.replace('/onboarding', '');
            const finalPath = isSupportedLocale ? newPath : `/${lang}${newPath}`;
            const url = request.nextUrl.clone();
            url.pathname = finalPath || `/${lang}/dashboard`;
            return NextResponse.redirect(url);
        }

        // If the URL doesn't start with a supported locale and isn't a public asset, redirect
        if (!isSupportedLocale) {
            const url = request.nextUrl.clone();
            url.pathname = `/${lang}${pathname}`;
            return NextResponse.redirect(url);
        }

        // 4. Auth redirects
        if (pathname.includes('/dashboard')) {
            if (!user) {
                const url = request.nextUrl.clone();
                url.pathname = `/${lang}/auth/login`;
                url.searchParams.set('redirect', pathname);
                return NextResponse.redirect(url);
            }
        }

    } catch (error) {
        console.error('Middleware Supabase error:', error);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
    ],
};
