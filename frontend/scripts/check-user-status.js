
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

async function run() {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envConfig = dotenv.parse(envFile);
    const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

    const email = 'erik.fabiano@gmail.com';
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log(`User ID: ${user.id}`);

    const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
    console.log('Profile:', profile ? 'FOUND' : 'MISSING');

    const { data: sub } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single();
    console.log('Subscription:', sub ? `FOUND (Plan: ${sub.plan_id})` : 'MISSING');

    if (sub) {
        const { data: plan } = await supabase.from('subscription_plans').select('*').eq('id', sub.plan_id).single();
        console.log('Plan Details:', plan ? `Price: ${plan.price_monthly}` : 'MISSING');
    }
}

run().catch(console.error);
