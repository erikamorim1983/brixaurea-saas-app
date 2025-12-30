import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Resend verification email using Supabase
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/en/auth/callback`,
            },
        });

        if (error) {
            console.error('Resend verification error:', error);
            // Don't expose specific errors to prevent email enumeration
            return NextResponse.json(
                { message: 'If an account exists with this email, a new verification link has been sent.' },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { message: 'Verification email sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json(
            { error: 'An error occurred while resending verification email' },
            { status: 500 }
        );
    }
}
