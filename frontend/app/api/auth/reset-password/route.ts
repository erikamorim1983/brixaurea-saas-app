import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json(
                { message: 'Password is required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            console.error('Password update error:', error);
            return NextResponse.json(
                { message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: 'Password updated successfully',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { message: 'An error occurred' },
            { status: 500 }
        );
    }
}
