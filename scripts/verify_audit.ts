
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../frontend/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAuditLogs() {
    console.log('🔍 Checking for "audit_logs" table...');

    try {
        // Try to select 1 record, or just check count. 
        // If table doesn't exist, this will throw an error with code '42P01' (undefined_table) usually
        const { data, error, count } = await supabase
            .from('audit_logs')
            .select('*', { count: 'exact', head: true });

        if (error) {
            if (error.code === '42P01' || error.message.includes('relation "audit_logs" does not exist')) {
                console.log('❌ "audit_logs" table DOES NOT EXIST.');
                console.log('   Action Required: Run "backend/sql_modules/07_audit_logs.sql" in your Supabase SQL Editor.');
            } else if (error.code === '42501') {
                console.log('⚠️ "audit_logs" table exists but RLS prevents reading (Permission Denied).');
                console.log('   Status: Table likely exists ✅ (Security is active).');
            } else {
                console.error('❌ Error checking table:', error.message, error.code);
            }
        } else {
            console.log('✅ "audit_logs" table EXISTS.');
            console.log(`   Current record count: ${count}`);
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

verifyAuditLogs();
