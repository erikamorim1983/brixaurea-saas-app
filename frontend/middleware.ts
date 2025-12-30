import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // IMPORTANT: Do not write any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make your app
    // very slow as it will call getUser() on every request.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Extract language from URL
    const pathname = request.nextUrl.pathname;
    const langMatch = pathname.match(/^\/(en|pt|es)/);
    const lang = langMatch ? langMatch[1] : 'en';

    // Redirect legacy /register to /auth/register
    if (pathname.match(/^\/(en|pt|es)\/register$/) || pathname === '/register') {
        const url = request.nextUrl.clone();
        url.pathname = `/${lang}/auth/register`;
        return NextResponse.redirect(url);
    }

    // Redirect legacy /login to /auth/login
    if (pathname.match(/^\/(en|pt|es)\/login$/) || pathname === '/login') {
        const url = request.nextUrl.clone();
        url.pathname = `/${lang}/auth/login`;
        return NextResponse.redirect(url);
    }

    // Protected routes - redirect to login if not authenticated
    if (pathname.includes('/dashboard')) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = `/${lang}/auth/login`;
            url.searchParams.set('redirect', pathname);
            return NextResponse.redirect(url);
        }
    }

    // Auth routes - redirect to dashboard if already authenticated
    if (pathname.includes('/auth/login') || pathname.includes('/auth/register')) {
        if (user) {
            const url = request.nextUrl.clone();
            url.pathname = `/${lang}/dashboard`;
            return NextResponse.redirect(url);
        }
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
