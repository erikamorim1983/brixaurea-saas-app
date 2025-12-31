
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function run() {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envFile);
    const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

    const { data: projects } = await supabase.from('projects').select('name, status');

    console.log('--- PROJECTS STATUS CHECK ---');
    projects.forEach(p => {
        console.log(`N: ${p.name} | S: ${p.status}`);
    });
}

run().catch(console.error);
