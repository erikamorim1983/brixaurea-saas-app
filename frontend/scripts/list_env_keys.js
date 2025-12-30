const { loadEnvConfig } = require('@next/env');
const projectDir = process.cwd();
const combinedEnv = loadEnvConfig(projectDir).combinedEnv;
const keys = Object.keys(combinedEnv).filter(k => k.includes('URL') || k.includes('DB') || k.includes('POSTGRES'));
console.log('Relevant Keys:', keys);
