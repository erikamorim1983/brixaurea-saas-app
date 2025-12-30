const { loadEnvConfig } = require('@next/env');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment using dotenv
const projectDir = process.cwd();
try {
    require('dotenv').config({ path: path.join(projectDir, '.env.local') });
} catch (e) { console.log('Dotenv error:', e.message); }

console.log('Final Check - DATABASE_URL present:', !!process.env.DATABASE_URL);

const migrationPath = path.resolve(__dirname, '../../backend/sql_modules/ADD_UNITS_MIX_DETAILS.sql');
if (!fs.existsSync(migrationPath)) {
    console.error("❌ Migration file not found:", migrationPath);
    process.exit(1);
}

const sql = fs.readFileSync(migrationPath, 'utf8');

async function runMigration() {
    console.log("🚀 Starting Migration...");

    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is missing!");
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query(sql);
        console.log("✅ Migration applied successfully!");
    } catch (err) {
        console.error("❌ Migration Failed:", err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
