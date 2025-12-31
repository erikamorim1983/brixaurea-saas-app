
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function run() {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envFile);
    const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

    // Try a direct query to see if we can get a sample row or error with columns
    const { data, error } = await supabase.from('organization_members').select('*').limit(1);
    if (error) {
        console.error('ERROR:', error);
    } else if (data && data.length > 0) {
        console.log('SAMPLE_ROW:', Object.keys(data[0]).join(', '));
    } else {
        // Table is empty, let's try to query pg_attribute if allowed (usually not via PostgREST)
        // Let's try to fetch something we know might exist from 05_subscriptions.sql
        const { error: err2 } = await supabase.from('organization_members').select('organization_owner_id').limit(1);
        console.log('HAS organization_owner_id:', !err2);

        const { error: err3 } = await supabase.from('organization_members').select('organization_id').limit(1);
        console.log('HAS organization_id:', !err3);
    }
}

run().catch(console.error);
