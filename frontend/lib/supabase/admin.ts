import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export const createAdminClient = () => {
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

    // Fallback for development if environment variables aren't loaded correctly
    if ((!supabaseUrl || !serviceRoleKey) && process.env.NODE_ENV === 'development') {
        try {
            const envPath = path.join(process.cwd(), '.env.local');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
                const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

                if (urlMatch && !supabaseUrl) supabaseUrl = urlMatch[1].trim().replace(/^["']|["']$/g, '');
                if (keyMatch && !serviceRoleKey) serviceRoleKey = keyMatch[1].trim().replace(/^["']|["']$/g, '');
            }
        } catch (e) {
            console.error('Failed to manually load .env.local:', e);
        }
    }

    if (!supabaseUrl || !serviceRoleKey) {
        if (typeof window === 'undefined') {
            console.error('❌ Missing Supabase URL or Service Role Key');
            console.log('URL found:', !!supabaseUrl);
            console.log('Service Role Key found:', !!serviceRoleKey);
        }
        return null;
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};
