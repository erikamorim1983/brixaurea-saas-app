
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function run() {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envFile);
    const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

    const { data: { users } } = await supabase.auth.admin.listUsers();
    const { data: projects } = await supabase.from('projects').select('name, user_id, organization_owner_id');
    const { data: members } = await supabase.from('organization_members').select('member_user_id, organization_owner_id');

    console.log('U_FABIANO:', users.find(u => u.email === 'erik.fabiano@gmail.com')?.id);
    console.log('U_BRIX:', users.find(u => u.email === 'erik@brixprime.com')?.id);

    projects.forEach(p => console.log(`P:${p.name}|U:${p.user_id}|O:${p.organization_owner_id}`));
    members.forEach(m => console.log(`M:${m.member_user_id}|O:${m.organization_owner_id}`));
}

run().catch(console.error);
