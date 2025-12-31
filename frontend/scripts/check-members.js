
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function run() {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envFile);
    const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

    const { data: members } = await supabase.from('organization_members').select('*');
    console.log('MEMBERS_LIST:');
    members.forEach(m => {
        console.log(`M:${m.member_user_id.slice(0, 8)}|O:${m.organization_owner_id.slice(0, 8)}`);
    });
}

run().catch(console.error);
