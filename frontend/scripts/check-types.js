
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function run() {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envFile);
    const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

    const { data: projects, error } = await supabase.from('projects').select('*').limit(1);
    if (error) {
        console.error('ERROR:', error);
    } else {
        console.log('PROJECT_ID_TYPE:', typeof projects[0].id);
        console.log('USER_ID_TYPE:', typeof projects[0].user_id);
    }
}

run().catch(console.error);
