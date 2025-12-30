import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const {
            firstName,
            lastName,
            phone,
            accountType,
            companyName,
            ein,
            website,
            logoUrl,
            addressStreet,
            addressSuite,
            addressCity,
            addressState,
            addressZip,
            organizationTypes
        } = body;

        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Prepare profile data
        const profileData = {
            first_name: firstName || 'User',
            last_name: lastName || '',
            phone: phone || null,
            account_type: accountType || 'individual',
            company_name: companyName || null,
            ein: ein || null,
            website: website || null,
            logo_url: logoUrl || null,
            address_street: addressStreet || null,
            address_suite: addressSuite || null,
            address_city: addressCity || null,
            address_state: addressState || null,
            address_zip: addressZip || null,
            organization_types: organizationTypes || [],
            updated_at: new Date().toISOString(),
        };

        // Check if profile exists
        const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (existingProfile) {
            // Update existing profile
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update(profileData)
                .eq('id', user.id);

            // Sync with Auth Metadata
            await supabase.auth.updateUser({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    avatar_url: logoUrl,
                    company_name: companyName
                }
            });

            if (updateError) {
                console.error('Profile update error:', updateError);
                return NextResponse.json(
                    { error: 'Failed to update profile', details: updateError.message },
                    { status: 500 }
                );
            }
        } else {
            // Create new profile
            const { error: insertError } = await supabase
                .from('user_profiles')
                .insert({
                    id: user.id,
                    ...profileData,
                });

            if (insertError) {
                console.error('Profile insert error:', insertError);
                return NextResponse.json(
                    { error: 'Failed to create profile', details: insertError.message },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(
            { message: 'Profile updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'An error occurred while updating profile' },
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

        // Get profile
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError);
            return NextResponse.json(
                { error: 'Failed to fetch profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            profile: profile || null,
            email: user.email,
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching profile' },
            { status: 500 }
        );
    }
}
