const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load frontend env for URL
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Manually parse backend .env for Service Key
let backendServiceKey = '';
const backendEnvPath = path.resolve(__dirname, '../../backend/.env');

if (fs.existsSync(backendEnvPath)) {
    const content = fs.readFileSync(backendEnvPath, 'utf8');
    console.log('Backend env found, length:', content.length);

    const lines = content.split('\n');
    const matches = lines.filter(l => l.includes('SERVICE_ROLE_KEY'));
    console.log('Lines containing SERVICE_ROLE_KEY:', matches);

    for (const line of lines) {
        // Regex to match SUPABASE_SERVICE_ROLE_KEY = value
        // Handle optional export keyword, spaces, quotes
        const match = line.match(/^\s*(?:export\s+)?SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.+)$/);
        if (match) {
            console.log('Found Service Key via Regex!');
            backendServiceKey = match[1].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes if any
        }
    }
} else {
    console.log('Backend env NOT FOUND at:', backendEnvPath);
}

// Use SERVICE_ROLE_KEY for admin bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || backendServiceKey;
console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function upgradeUser() {
    const email = 'erik@brixprime.com';
    console.log(`Searching for user: ${email}...`);

    const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();

    if (uError) {
        console.error('Error listing users:', uError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found!');
        return;
    }

    console.log(`Found user ID: ${user.id}`);

    // 2. Check current plan
    const { data: sub } = await supabase.from('subscriptions').select('*, subscription_plans(*)').eq('user_id', user.id).single();
    if (sub) {
        console.log('Current Plan:', sub.subscription_plans?.name || 'Unknown');
        console.log('Current Status:', sub.status);
    } else {
        console.log('No subscription found.');
    }

    // 3. Find or Create "Dev Plan" (High Limits)
    const { data: devPlan } = await supabase.from('subscription_plans').select('id').eq('name', 'Dev Plan').single();

    let newPlanId = devPlan?.id;

    if (!newPlanId) {
        console.log('Dev Plan not found. Creating it...');
        const { data: newPlan, error: pError } = await supabase.from('subscription_plans').insert({
            name: 'Dev Plan',
            description: 'Unlimited access for core developers',
            price_monthly: 0,
            price_yearly: 0,
            currency: 'USD',
            max_projects: 99,
            max_users: 99,
            max_storage_mb: 102400, // 100GB
            features: ['Unlimited Projects', 'Unlimited Users', 'Advanced Analytics', 'API Access'],
            is_active: true
        }).select().single();

        if (pError) {
            console.error('Error creating plan:', pError);
            return;
        }
        newPlanId = newPlan.id;
    }

    console.log(`Upgrading to Plan ID: ${newPlanId}`);

    // 4. Update Subscription
    if (sub) {
        const { error: upError } = await supabase.from('subscriptions').update({
            plan_id: newPlanId,
            status: 'active',
            trial_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString() // 1 year trial extension
        }).eq('user_id', user.id);

        if (upError) console.error('Update failed:', upError);
        else console.log('✅ Subscription Updated successfully!');
    } else {
        const { error: inError } = await supabase.from('subscriptions').insert({
            user_id: user.id,
            plan_id: newPlanId,
            status: 'active',
            trial_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString()
        });
        if (inError) console.error('Insert failed:', inError);
        else console.log('✅ Subscription Created successfully!');
    }
}

upgradeUser();
