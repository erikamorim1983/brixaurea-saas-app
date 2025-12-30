const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '../.env.local');
let apiKey = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch (e) {
    console.error("Could not read .env.local");
    process.exit(1);
}

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${apiKey}`,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log("Status Code:", res.statusCode);
        try {
            const parsed = JSON.parse(body);
            if (parsed.models) {
                fs.writeFileSync('models_list.json', JSON.stringify(parsed.models, null, 2));
                console.log("Wrote models to models_list.json");
            } else {
                console.log("Response:", JSON.stringify(parsed, null, 2));
            }
        } catch (e) {
            console.log("Raw Response:", body);
        }
    });
});

req.on('error', (error) => {
    console.error("Request Error:", error);
});

req.end();
