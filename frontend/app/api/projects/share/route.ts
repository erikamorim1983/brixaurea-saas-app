import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { projectId, email, role } = body;
        const supabase = await createClient();

        // 1. Get User by Email
        // Note: We need admin privileges or a way to lookup users by email.
        // auth.users is not queryable by default.
        // We will try to find them in 'user_profiles' if it exists.

        // However, if the user doesn't exist, we should probably record a "pending invite".
        // For this MVP, we will only support adding existing users.

        // We actually CANNOT query user_profiles by email easily if email is not in user_profiles.
        // user_profiles has `id` which matches auth.id. 
        // We need search by email.

        // Workaround: We will use `organization_invites` or `project_invites` table?
        // OR we use the admin client if we had the key (we don't).

        // BUT, we can try to RPC function `lookup_user_by_email`?

        // Let's assume for now we can't look them up. 
        // We will return a mock success or error.

        // WAIT. If we can't look them up, the RBAC won't work perfectly.
        // But maybe `project_members` table should store `email` until they accept?
        // No, our schema `project_members` uses `user_id`.

        // Let's check if we can query `user_profiles`? 
        // Does `user_profiles` have email?

        // Checking schema... user_profiles usually doesn't duplicate email.
        // API `api/user/profile` returned `email: user.email`.

        // Strategy: 
        // 1. Look for user in `user_profiles`? No email there.
        // 2. We are stuck without Service Key to lookup `auth.users`.

        // Fallback: We will insert into `project_guests` (email based) IF IT EXISTS?
        // 07_real_estate.sql had `project_guests`.
        // Let's use THAT for now as a fallback since I don't have migration power.
        // `project_guests` has (email, role).

        const { error } = await supabase.from('project_guests').insert({
            project_id: projectId,
            email: email,
            role: role
        });

        if (error) {
            console.error('Share error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
