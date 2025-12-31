
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function run() {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envFile);

    const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Use ANON key, NO session
    const supabase = createClient(supabaseUrl, anonKey);

    console.log('--- TESTING RLS WITH ANON (NO AUTH) ---');
    const { data: projects, error } = await supabase.from('projects').select('name');

    if (error) {
        console.log('RLS_IS_WORKING (Error):', error.message);
    } else if (projects && projects.length > 0) {
        console.log('RLS_IS_ENABLED: NO (Fetched projects without auth!)');
        console.log('Projects count:', projects.length);
    } else {
        console.log('RLS_IS_WORKING: Likely YES (Zero projects found for anon)');
    }
}

run().catch(console.error);
