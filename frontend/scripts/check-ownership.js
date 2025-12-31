
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

    projects.forEach(p => {
        console.log(`P:${p.name}`);
        console.log(`OWNER:${p.user_id}`);
        console.log(`ORG_OWNER:${p.organization_owner_id}`);
    });

    users.forEach(u => {
        console.log(`USER:${u.email}`);
        console.log(`ID:${u.id}`);
    });
}

run().catch(console.error);
