const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });
}

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found.");
    process.exit(1);
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function applyFix() {
    console.log("🔧 Applying fix to 'user_profiles'...");

    try {
        await client.connect();

        console.log("Adding 'organization_types' column...");
        await client.query(`
            ALTER TABLE public.user_profiles 
            ADD COLUMN IF NOT EXISTS organization_types TEXT[];
        `);

        console.log("✅ Fix applied successfully.");

    } catch (err) {
        console.error("❌ Error applying fix:", err.message);
    } finally {
        await client.end();
    }
}

applyFix();
