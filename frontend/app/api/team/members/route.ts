import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - List team members
export async function GET() {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is org owner or member
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('account_type, first_name, last_name')
            .eq('id', user.id)
            .single();

        // Get organization user belongs to (modern way)
        const { data: membership } = await supabase
            .from('organization_members')
            .select('organization_id, role')
            .eq('member_user_id', user.id)
            .eq('status', 'active')
            .single();

        const orgId = membership?.organization_id;

        if (!orgId) {
            // Fallback: check if they own an org
            const { data: ownedOrg } = await supabase
                .from('organizations')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (!ownedOrg) return NextResponse.json({ members: [] });
        }

        // Get all members of the organization
        const { data: members } = await supabase
            .from('organization_members')
            .select(`
                *,
                member:member_user_id (
                    id,
                    email
                ),
                member_profile:member_user_id (
                    first_name,
                    last_name
                )
            `)
            .eq('organization_id', orgId || user.id) // Fallback support
            .eq('status', 'active');

        return NextResponse.json({
            isOwner: profile?.account_type === 'organization' || membership?.role === 'owner',
            team: {
                members: (members || []).map(m => ({
                    id: m.id,
                    userId: m.member_user_id,
                    email: m.member?.email,
                    name: m.member_profile?.first_name
                        ? `${m.member_profile.first_name} ${m.member_profile.last_name || ''}`.trim()
                        : m.member?.email?.split('@')[0],
                    role: m.role,
                    joinedAt: m.joined_at,
                })),
            }
        });
    } catch (error) {
        console.error('Get members error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}

// PUT - Update member role
export async function PUT(request: Request) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { memberId, role } = body;

        if (!memberId || !role) {
            return NextResponse.json(
                { error: 'Member ID and role are required' },
                { status: 400 }
            );
        }

        // Validate role
        if (!['admin', 'member', 'viewer'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        // Get user's org
        const { data: membership } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('member_user_id', user.id)
            .eq('status', 'active')
            .single();

        const orgId = membership?.organization_id;

        // Update member role (must belong to the same org)
        const { error } = await supabase
            .from('organization_members')
            .update({ role, updated_at: new Date().toISOString() })
            .eq('id', memberId)
            .eq('organization_id', orgId);

        if (error) {
            console.error('Update error:', error);
            return NextResponse.json(
                { error: 'Failed to update member' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Member role updated',
        });
    } catch (error) {
        console.error('Update member error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}

// DELETE - Remove member
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get('id');

        if (!memberId) {
            return NextResponse.json(
                { error: 'Member ID required' },
                { status: 400 }
            );
        }

        // Get user's org
        const { data: membership } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('member_user_id', user.id)
            .eq('status', 'active')
            .single();

        const orgId = membership?.organization_id;

        // Remove member
        const { error } = await supabase
            .from('organization_members')
            .update({ status: 'removed', updated_at: new Date().toISOString() })
            .eq('id', memberId)
            .eq('organization_id', orgId);

        if (error) {
            console.error('Remove error:', error);
            return NextResponse.json(
                { error: 'Failed to remove member' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Member removed',
        });
    } catch (error) {
        console.error('Remove member error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}
