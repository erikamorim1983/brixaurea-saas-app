import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Get Current User (The Inviter)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { email, role } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 2. Check if user is owner of an organization
        // We assume 1-1 mapping for simplicity in this MVP: User = Company
        // The `organization_invitations` table has `organization_owner_id`

        // 3. Insert Invitation
        const { error } = await supabase
            .from('organization_invitations')
            .insert({
                organization_owner_id: user.id,
                email: email,
                role: role,
                invited_by: user.id,
                status: 'pending'
            });

        if (error) {
            console.error('Invite Error:', error);
            // Duplicate key error?
            if (error.code === '23505') {
                return NextResponse.json({ error: 'User already invited' }, { status: 400 });
            }
            return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
        }

        // TODO: Send Email via Resend/SendGrid
        // For now, we just create the DB record.

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Server Invite Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
