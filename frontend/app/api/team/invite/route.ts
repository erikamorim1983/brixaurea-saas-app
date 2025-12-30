import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

        // Get user profile to check if org
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('account_type')
            .eq('id', user.id)
            .single();

        if (profile?.account_type !== 'organization') {
            return NextResponse.json(
                { error: 'Only organization accounts can invite members' },
                { status: 403 }
            );
        }

        // Get subscription to check limits
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select(`
                *,
                subscription_plans (
                    max_users
                )
            `)
            .eq('user_id', user.id)
            .single();

        // Get current member count
        const { count: memberCount } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_owner_id', user.id)
            .eq('status', 'active');

        // Get pending invitations count
        const { count: invitationCount } = await supabase
            .from('organization_invitations')
            .select('*', { count: 'exact', head: true })
            .eq('organization_owner_id', user.id)
            .eq('status', 'pending');

        const maxUsers = subscription?.subscription_plans?.max_users || 1;
        const currentTotal = (memberCount || 0) + (invitationCount || 0) + 1; // +1 for owner

        // Check if limit reached (-1 = unlimited)
        if (maxUsers !== -1 && currentTotal >= maxUsers) {
            return NextResponse.json(
                { error: 'Member limit reached. Upgrade your plan to add more members.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { email, role } = body;

        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
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

        // Check if email is already a member or owner
        if (email === user.email) {
            return NextResponse.json(
                { error: 'You cannot invite yourself' },
                { status: 400 }
            );
        }

        // Check if already invited
        const { data: existingInvitation } = await supabase
            .from('organization_invitations')
            .select('id')
            .eq('organization_owner_id', user.id)
            .eq('email', email)
            .eq('status', 'pending')
            .single();

        if (existingInvitation) {
            return NextResponse.json(
                { error: 'This email has already been invited' },
                { status: 400 }
            );
        }

        // Create invitation
        const { data: invitation, error: insertError } = await supabase
            .from('organization_invitations')
            .insert({
                organization_owner_id: user.id,
                email,
                role,
                invited_by: user.id,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return NextResponse.json(
                { error: 'Failed to create invitation', details: insertError.message },
                { status: 500 }
            );
        }

        // TODO: Send invitation email with token
        // await sendInvitationEmail(email, invitation.token, user.email);

        return NextResponse.json({
            message: 'Invitation sent successfully',
            invitation: {
                id: invitation.id,
                email,
                role,
                expiresAt: invitation.expires_at,
            },
        });
    } catch (error) {
        console.error('Invite error:', error);
        return NextResponse.json(
            { error: 'An error occurred while sending invitation' },
            { status: 500 }
        );
    }
}

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

        // Get pending invitations
        const { data: invitations, error } = await supabase
            .from('organization_invitations')
            .select('*')
            .eq('organization_owner_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch invitations' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            invitations: invitations || [],
        });
    } catch (error) {
        console.error('Get invitations error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching invitations' },
            { status: 500 }
        );
    }
}

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
        const invitationId = searchParams.get('id');

        if (!invitationId) {
            return NextResponse.json(
                { error: 'Invitation ID required' },
                { status: 400 }
            );
        }

        // Cancel invitation
        const { error } = await supabase
            .from('organization_invitations')
            .update({ status: 'canceled' })
            .eq('id', invitationId)
            .eq('organization_owner_id', user.id);

        if (error) {
            console.error('Cancel error:', error);
            return NextResponse.json(
                { error: 'Failed to cancel invitation' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Invitation canceled',
        });
    } catch (error) {
        console.error('Cancel invitation error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}
