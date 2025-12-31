
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function run() {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envFile);
    const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

    const { data: { users }, error: uErr } = await supabase.auth.admin.listUsers();
    const { data: projects } = await supabase.from('projects').select('name, user_id');
    const { data: profiles } = await supabase.from('user_profiles').select('first_name, id');

    if (uErr) console.error('AUTH_USERS_ERROR:', uErr);

    console.log('--- AUTH USERS ---');
    if (users) users.forEach(u => console.log(`${u.email}|${u.id}`));

    const { data: members } = await supabase.from('project_members').select('*');
    const { data: guests } = await supabase.from('project_guests').select('*');

    console.log('--- PROJECT_MEMBERS ---');
    console.log('Count:', members ? members.length : 'error/null');
    if (members) members.forEach(m => console.log(JSON.stringify(m)));

    console.log('--- PROJECT_GUESTS ---');
    console.log('Count:', guests ? guests.length : 'error/null');
    if (guests) guests.forEach(g => console.log(JSON.stringify(g)));

    console.log('--- PROFILES ---');
    if (profiles) profiles.forEach(p => console.log(`${p.first_name}|${p.id}`));

    console.log('--- PROJECTS ---');
    if (projects) projects.forEach(p => console.log(`${p.name}|${p.user_id}`));
}

run().catch(console.error);
