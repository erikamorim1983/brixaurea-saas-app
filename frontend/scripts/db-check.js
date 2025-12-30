
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Ideally we need SERVICE_ROLE_KEY for full introspection if RLS is on for schema tables.
// However, 'information_schema' is often public or accessible. Let's try with ANON first.
// If it fails, we might need the user to provide the service key or run directly in Supabase.

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("🔍 Checking Database Schema...");

    // Query information_schema
    // Note: Supabase JS client might wrap this. If we can't run raw SQL, we use .rpc() if a function exists, 
    // or we try to assume we have access to a view. 
    // But typically standard Supabase client doesn't support raw SQL query without a function.
    // Wait, the user ran raw SQL in the dashboard. 
    // FROM THE APP/SCRIPT, we can't run raw SQL unless we use a Postgres client (pg) or have an RPC function.

    // ALTERNATIVE: Use the REST API to query a view if we created one.
    // BUT we don't have a view. 

    // SOLUTION: Since we cannot run raw SQL from the client easily without an RPC, 
    // I will prompt the user to create a text file with the query, or simply output the query 
    // for them to copy.
    // OR considering this is a dev script, we can try to use 'pg' library if I can find the connection string.
    // The connection string is usually in .env DATABASE_URL.

    // Let's check if we have DATABASE_URL.

    if (process.env.DATABASE_URL) {
        console.log("✅ DATABASE_URL found. Using direct Postgres connection.");
        const { Client } = require('pg');
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await client.connect();
            const res = await client.query(`
                SELECT table_name, column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            `);
            console.table(res.rows);
            await client.end();
            console.log("✅ Schema Check Complete.");
        } catch (err) {
            console.error("❌ Postgres Connection Error:", err.message);
        }
    } else {
        console.log("⚠️ DATABASE_URL not found in .env.local.");
        console.log("👉 Please run this SQL in your Supabase Dashboard SQL Editor:");
        console.log(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
    }
}

checkSchema();
