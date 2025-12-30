const https = require('https');

function getZip(zip) {
    https.get(`https://api.zippopotam.us/us/${zip}`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`Response for ${zip}:`);
            console.log(data);
        });
    }).on('error', (err) => {
        console.error("Error: " + err.message);
    });
}

getZip('33180');
getZip('33130');
