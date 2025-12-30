const https = require('https');

function getZip(zip) {
    https.get(`https://api.zippopotam.us/us/${zip}`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log(`ZIP ${zip} places:`, json.places.map(p => p['place name']));
            } catch (e) {
                console.log(`ZIP ${zip}: Error parsing JSON or invalid response`);
            }
        });
    });
}

getZip('33180');
getZip('33130');
