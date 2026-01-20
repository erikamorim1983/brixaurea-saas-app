const url = 'https://luyyxveurwfuxbjbnluy.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eXl4dmV1cndmdXhiamJubHV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgzNDA4MSwiZXhwIjoyMDgxNDEwMDgxfQ.pf8FgGOMa16Ll6y2oJ_NoE631-Va2fZPCYVTpAABJrY';

async function check() {
    const res = await fetch(`${url}/rest/v1/insights?select=slug,title_pt`, {
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
        }
    });
    const data = await res.json();
    console.log('Articles in database:');
    console.log(JSON.stringify(data, null, 2));
}

check();
