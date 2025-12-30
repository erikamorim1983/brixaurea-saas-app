import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AuthCallbackPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ code?: string; error?: string; error_description?: string }>;
}) {
    const { lang } = await params;
    const { code, error, error_description } = await searchParams;

    // If there's an error from Supabase, redirect to login with error
    if (error) {
        redirect(`/${lang}/auth/login?error=${encodeURIComponent(error_description || error)}`);
    }

    // If there's a code, exchange it for a session
    if (code) {
        const supabase = await createClient();

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            // If exchange fails, redirect to login with error
            redirect(`/${lang}/auth/login?error=${encodeURIComponent(exchangeError.message)}`);
        }

        // Success! Redirect to dashboard or login
        // For now, redirect to login with success message
        redirect(`/${lang}/auth/login?verified=true`);
    }

    // No code provided, redirect to login
    redirect(`/${lang}/auth/login`);
}
