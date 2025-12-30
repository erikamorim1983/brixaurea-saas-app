const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// If not found, try .env
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

// Fallback to backend .env if not found
if (!process.env.DATABASE_URL) {
    console.log("⚠️ DATABASE_URL not found in frontend/.env.local or frontend/.env. Trying backend/.env...");
    const backendEnvPath = path.resolve(__dirname, '../../backend/.env');
    console.log("   Looking for:", backendEnvPath);
    dotenv.config({ path: backendEnvPath });
}

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local OR backend/.env. Cannot run migration.");
    process.exit(1);
}

const migrationPath = path.resolve(__dirname, '../../backend/sql_modules/ADD_SELLER_SPLITS.sql');

if (!fs.existsSync(migrationPath)) {
    console.error("❌ Migration file not found:", migrationPath);
    process.exit(1);
}

const sql = fs.readFileSync(migrationPath, 'utf8');

async function runMigration() {
    console.log("🚀 Starting Migration: ADD_LISTING_LINK.sql");
    console.log("Using DATABASE_URL from .env.local");

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
    } finally {
        await client.end();
    }
}

runMigration();
