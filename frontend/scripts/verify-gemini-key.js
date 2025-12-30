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

if (!apiKey) {
    console.error("API Key not found in .env.local");
    process.exit(1);
}

console.log("Testing with API Key ending in...", apiKey.slice(-4));

const data = JSON.stringify({
    contents: [{
        parts: [{ text: "Hello, tell me a joke." }]
    }]
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log("Status Code:", res.statusCode);
        try {
            const parsed = JSON.parse(body);
            if (parsed.error) {
                console.error("API Error:", JSON.stringify(parsed.error, null, 2));
            } else {
                console.log("Success! Response:", parsed.candidates[0].content.parts[0].text);
            }
        } catch (e) {
            console.log("Raw Response:", body);
        }
    });
});

req.on('error', (error) => {
    console.error("Request Error:", error);
});

req.write(data);
req.end();
