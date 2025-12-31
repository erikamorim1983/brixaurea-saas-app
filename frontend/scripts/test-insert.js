
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function run() {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envFile);
    const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

    // Get table info using a trick or just checking metadata if possible?
    // Supabase doesn't expose internal pg_catalog easily.
    // Let's just try to insert a project with a valid UUID.
    const testId = '71237314-ff6f-4a12-9f83-40ebb55a62bc'; // Erik's ID
    const { data, error } = await supabase.from('projects').insert({
        name: 'TEST_RLS_INSERT',
        user_id: testId,
        organization_owner_id: testId,
        status: 'draft'
    }).select();

    if (error) console.error('INSERT_ERROR:', error);
    else console.log('INSERT_SUCCESS:', data[0].id);
}

run().catch(console.error);
