
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
    const { data: projects } = await supabase.from('projects').select('name, user_id');

    console.log('--- DETAILED ALIGNMENT ---');
    projects.forEach(p => {
        const user = users.find(u => u.id === p.user_id);
        console.log(`- Project: ${p.name}`);
        console.log(`  Project user_id: [${p.user_id}]`);
        if (user) {
            console.log(`  Matches user: ${user.email} [${user.id}]`);
        } else {
            console.log(`  NO MATCHING USER IN AUTH.USERS`);
        }
    });

    console.log('\n--- ALL AUTH USERS ---');
    users.forEach(u => {
        console.log(`User: ${u.email} [${u.id}]`);
    });
}

run().catch(console.error);
