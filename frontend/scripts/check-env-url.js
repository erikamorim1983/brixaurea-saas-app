
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envConfig = dotenv.parse(envFile);

console.log('SUPABASE_URL:', envConfig.NEXT_PUBLIC_SUPABASE_URL);
