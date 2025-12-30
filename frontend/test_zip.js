const fetch = require('node-fetch'); // Assuming standard fetch or node-fetch is available in env or using built-in in recent node

async function test(zip) {
    try {
        const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
        const data = await res.json();
        console.log(`ZIP: ${zip}`);
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await test('33180');
    await test('33130');
}

run();
