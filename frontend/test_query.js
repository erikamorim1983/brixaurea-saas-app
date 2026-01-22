const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testQuery() {
    const { data, error } = await s.from('projects').select('*, locations:project_locations(*)');
    console.log('--- TEST QUERY (Partial) ---');
    console.log('Error:', error ? error.message : 'none');
    console.log('Data Length:', data ? data.length : 0);
}

testQuery();
