const url = 'https://luyyxveurwfuxbjbnluy.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eXl4dmV1cndmdXhiamJubHV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgzNDA4MSwiZXhwIjoyMDgxNDEwMDgxfQ.pf8FgGOMa16Ll6y2oJ_NoE631-Va2fZPCYVTpAABJrY';

const fs = require('fs');
const sql = fs.readFileSync('backend/sql_modules/28_insights_public_access.sql', 'utf8');

async function run() {
    console.log('Executing SQL to enable public access...');

    // Execute the SQL using Supabase REST API
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
    });

    if (res.ok) {
        console.log('✅ RLS policy created successfully!');
    } else {
        const error = await res.text();
        console.log('Note: exec_sql is not available. Applying via direct SQL...');

        // Try alternative: set RLS via UPDATE (this won't work but let's see the error)
        console.log('\nSQL to execute in Supabase Dashboard:');
        console.log('=====================================');
        console.log(sql);
        console.log('=====================================');
    }
}

run();
