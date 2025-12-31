
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function run() {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envFile);
    const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

    // Check Projects
    const { data: pData } = await supabase.from('projects').select('*').limit(1);
    if (pData?.[0]) {
        console.log('P_COLS:', Object.keys(pData[0]).join(','));
    }

    // Check Organization Members
    const { data: omData } = await supabase.from('organization_members').select('*').limit(1);
    if (omData?.[0]) {
        console.log('OM_COLS:', Object.keys(omData[0]).join(','));
    }
}

run().catch(console.error);
