
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
    const { data: projects } = await supabase.from('projects').select('*');
    const { data: members } = await supabase.from('organization_members').select('*');

    console.log('--- USERS ---');
    users.forEach(u => console.log(`${u.email}: ${u.id}`));

    console.log('\n--- PROJECTS ---');
    projects.forEach(p => console.log(`Project: ${p.name} | User: ${p.user_id} | OrgOwner: ${p.organization_owner_id}`));

    console.log('\n--- ORG MEMBERS ---');
    members.forEach(m => console.log(`Member: ${m.member_user_id} | OrgOwner: ${m.organization_owner_id} | Role: ${m.role} | Status: ${m.status}`));

    // Cleanup test project
    const { error: delErr } = await supabase.from('projects').delete().eq('name', 'TEST_RLS_INSERT');
    if (!delErr) console.log('\nCleaned up TEST_RLS_INSERT');
}

run().catch(console.error);
