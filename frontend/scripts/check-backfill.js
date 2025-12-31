
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function run() {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envFile);
    const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

    const { data: projects } = await supabase.from('projects').select('name, user_id, organization_owner_id');

    console.log('--- PROJECTS COLUMNS CHECK ---');
    projects.forEach(p => {
        console.log(`N: ${p.name}`);
        console.log(`  U: ${p.user_id}`);
        console.log(`  O: ${p.organization_owner_id}`);
    });
}

run().catch(console.error);
