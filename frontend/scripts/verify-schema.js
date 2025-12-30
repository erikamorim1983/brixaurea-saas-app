const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Fallback to backend .env if not found
if (!process.env.DATABASE_URL) {
    console.log("⚠️ DATABASE_URL not found in frontend/.env.local. Trying backend/.env...");
    dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
}

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found. Cannot connect to database.");
    console.log("👉 Please make sure DATABASE_URL is set in frontend/.env.local or backend/.env");
    process.exit(1);
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    console.log("🔍 Checking 'user_profiles' table schema...");

    try {
        await client.connect();

        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles'
            AND column_name = 'organization_types';
        `);

        if (res.rows.length > 0) {
            console.log("✅ PASS: Column 'organization_types' found.");
            console.log(`   Type: ${res.rows[0].data_type}`);
        } else {
            console.error("❌ FAIL: Column 'organization_types' NOT FOUND in 'user_profiles'.");
            console.log("   This is required for the Business Plan registration.");
        }

        const resAll = await client.query(`
             SELECT column_name 
             FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'user_profiles';
        `);
        console.log("   Existing columns:", resAll.rows.map(r => r.column_name).join(', '));

    } catch (err) {
        console.error("❌ Error checking schema:", err.message);
    } finally {
        await client.end();
    }
}

checkSchema();
