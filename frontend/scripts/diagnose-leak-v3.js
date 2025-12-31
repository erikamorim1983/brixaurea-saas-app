
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
    const fabianoId = users.find(u => u.email === 'erik.fabiano@gmail.com')?.id;
    const brixId = users.find(u => u.email === 'erik@brixprime.com')?.id;

    const { data: projects } = await supabase.from('projects').select('*');
    const { data: members } = await supabase.from('organization_members').select('*');

    console.log(`Fabiano: ${fabianoId}`);
    console.log(`Brix: ${brixId}`);

    projects.forEach(p => {
        if (p.user_id === brixId && p.organization_owner_id === brixId) {
            console.log(`Proj ${p.name} owned by Brix`);
        } else {
            console.log(`Proj ${p.name} owned by ${p.user_id}`);
        }
    });

    members.forEach(m => {
        console.log(`Member ${m.member_user_id} in Org of ${m.organization_owner_id}`);
    });
}

run().catch(console.error);
