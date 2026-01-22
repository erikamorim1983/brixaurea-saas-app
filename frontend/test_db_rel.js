const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const tests = [
    'standard:property_standards(key)',
    'category:property_categories(key)',
    'subtype:property_subtypes(key)',
    'locations:project_locations(city)'
];

async function run() {
    let output = '';
    for (const t of tests) {
        const { error } = await s.from('projects').select(t).limit(0);
        output += `${t}: ${error ? error.message : 'SUCCESS'}\n`;
    }
    console.log('--- TEST RESULTS ---');
    console.log(output);
    console.log('--- END ---');
}

run();
