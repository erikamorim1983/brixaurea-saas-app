const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase URL or Key");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn() {
    console.log("🔍 Checking 'organization_types' column via API...");

    // Try to select the specific column.
    // Even if RLS returns 0 rows, if the column doesn't exist, PostgREST should throw an error.
    const { data, error } = await supabase
        .from('user_profiles')
        .select('organization_types')
        .limit(1);

    if (error) {
        console.log("❌ API Error:", error.message);
        console.log("   Code:", error.code);

        // PostgREST error for missing column usually mentions "Could not find the field"
        if (error.message.includes('Could not find') || error.code === 'PGRST204') {
            console.log("👉 CONCLUSION: Column 'organization_types' likely DOES NOT exist.");
        } else {
            console.log("👉 CONCLUSION: Unknown error. Could be RLS or connection.");
        }
    } else {
        console.log("✅ API Success: Query executed without error.");
        console.log("👉 CONCLUSION: Column 'organization_types' EXISTS.");
    }
}

checkColumn();
