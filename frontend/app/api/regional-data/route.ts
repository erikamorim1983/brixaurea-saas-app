import { NextResponse } from 'next/server';
import { RegionalData } from '@/services/regional-data.service'; // We'll verify this import path or duplicate the interface
import { MockRegionalData } from '@/services/regional-data.service';

// Interface duplication to avoid circular dependencies if service is client-heavy
// Ideally we'd move types to a shared file, but for speed keeping it here or reusing.
// Let's assume we can reuse the Mock data for fallback values.

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zipCode') || '33901';
    const locationName = searchParams.get('locationName') || 'Fort Myers, FL';
    // Use full address if provided, otherwise fallback to locationName or zip
    const exactAddress = searchParams.get('address') || locationName || zipCode;

    // Server-side access to keys (no NEXT_PUBLIC needed strictly, but they work)
    const civicKey = process.env.NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY;
    const newsKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

    // Default Fallback (Mock)
    // We start with a base structure, but we will CLEAR the specific fields to avoid "Fort Myers" showing up
    // for NY unless we really fail hard.
    const baseMock = MockRegionalData['33901'];

    let politicians: RegionalData['politicians'] = {
        mayor: { name: 'Not Found', party: 'Unknown' },
        governor: { name: 'Not Found', party: 'Unknown' }
    };

    let news: RegionalData['news'] = [];

    // We try to keep the mock demographics as a baseline for "unavailable" metrics 
    // (since we don't have a Census API key configured yet), 
    // BUT we must try to overwrite Founding Date.
    let foundingDate = undefined;


    // --- 1. Google Civic API with Cascade (Address -> Zip -> City) ---
    if (civicKey) {
        const tryFetchCivic = async (addr: string) => {
            try {
                const civicUrl = `https://www.googleapis.com/civicinfo/v2/representatives?address=${encodeURIComponent(addr)}&key=${civicKey}`;
                console.log(`[Civic] Requesting: address='${addr}'`); // Log what we ask

                const res = await fetch(civicUrl, {
                    headers: { 'Referer': 'http://localhost:3000', 'Origin': 'http://localhost:3000' }
                });

                if (res.ok) {
                    console.log(`[Civic] Success (200) for '${addr}'`);
                    return await res.json();
                }

                const errText = await res.text();
                console.warn(`[Civic] Failed (${res.status}) for '${addr}'. Response: ${errText.substring(0, 100)}...`);
                return null;
            } catch (e) {
                console.error(`[Civic] Network Error for '${addr}':`, e);
                return null;
            }
        };

        // Strategy: 1. Exact Address -> 2. Zip Code -> 3. City, State
        console.log(`[API Logic] Starting Civic Cascade...`);
        let data = await tryFetchCivic(exactAddress);

        if (!data && zipCode && zipCode !== exactAddress) {
            console.log("[API Logic] Fallback to Zip Code...");
            data = await tryFetchCivic(zipCode);
        }
        if (!data && locationName && locationName !== exactAddress) {
            console.log("[API Logic] Fallback to City/State...");
            data = await tryFetchCivic(locationName);
        }

        if (data && data.offices && data.officials) {
            const officials = data.officials;
            const offices = data.offices;

            console.log(`[API Route] Civic Data Found: ${offices?.length} offices`);

            // Governor
            const govOffice = offices.find((o: any) => o.name.toLowerCase().includes('governor') && !o.name.toLowerCase().includes('lieutenant'));
            if (govOffice && govOffice.officialIndices.length > 0) {
                const gov = officials[govOffice.officialIndices[0]];
                politicians.governor = {
                    name: gov.name,
                    party: gov.party || 'Unknown',
                    photoUrl: gov.photoUrl
                };
            }

            // Mayor (Broad search)
            const mayorOffice = offices.find((o: any) =>
                o.name.toLowerCase().includes('mayor') ||
                o.name.toLowerCase().includes('executive') ||
                o.name.toLowerCase().includes('leader') ||
                o.name.toLowerCase().includes('manager') // City Manager
            );
            if (mayorOffice && mayorOffice.officialIndices.length > 0) {
                const mayor = officials[mayorOffice.officialIndices[0]];
                politicians.mayor = {
                    name: mayor.name,
                    party: mayor.party || 'Nonpartisan',
                    photoUrl: mayor.photoUrl
                };
            }
        }
    }

    // --- FALLBACK: Wikidata for Politicians ---
    // If Google failed us, we asks the Wiki.
    if (politicians.mayor.name === 'Not Found' || politicians.governor.name === 'Not Found') {
        const cleanCity = locationName.split(',')[0].trim();
        const cleanState = locationName.split(',')[1]?.trim() || 'FL';

        console.log(`[API Route] Falling back to Wikidata for: ${cleanCity}, ${cleanState}`);
        const wikiData = await fetchWikidataPoliticians(cleanCity, cleanState);

        if (wikiData) {
            if (politicians.mayor.name === 'Not Found' && wikiData.mayor) {
                politicians.mayor = wikiData.mayor;
            }
            if (politicians.governor.name === 'Not Found' && wikiData.governor) {
                politicians.governor = wikiData.governor;
            }
        }
    }


    // --- 2. News API (Server Side fixes CORS) ---
    if (newsKey) {
        try {
            const keywords = '(Real Estate OR "Economic Growth" OR "Urban Development" OR Infrastructure OR "Housing Market")';
            // Use quotes for multi-word cities in query to be precise? actually locationName is usually "New York, NY"
            const query = `${locationName} AND ${keywords}`;
            const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${newsKey}&pageSize=4&sortBy=relevance&language=en`;

            const res = await fetch(newsUrl);
            if (res.ok) {
                const data = await res.json();
                if (data.articles) {
                    news = data.articles.map((a: any) => ({
                        headline: a.title,
                        source: a.source.name,
                        date: new Date(a.publishedAt).toLocaleDateString()
                    }));
                }
            } else {
                console.error(`[API Route] NewsAPI Error: ${res.status}`);
            }
        } catch (error) {
            console.error('[API Route] News Fetch Failed:', error);
        }
    }


    // --- 3. Wikidata ---
    // Clean city name logic
    let city = locationName.split(',')[0].trim();
    if (city.toLowerCase() === 'new york') city = 'New York City';

    if (city && city !== 'Florida') {
        try {
            const date = await fetchWikidataFounding(city);
            if (date) foundingDate = date;
        } catch (error) {
            console.error('[API Route] Wikidata Failed:', error);
        }
    }


    // Assemble Response
    const responseData: RegionalData = {
        ...baseMock,
        politicians,
        news,
        demographics: {
            ...baseMock.demographics,
            foundingDate
        }
    };

    return NextResponse.json(responseData);
}

// Helper to fetch Founding Date via SPARQL
async function fetchWikidataFounding(cityName: string): Promise<string | null> {
    const cleanName = cityName.replace(/"/g, '');
    const sparqlQuery = `
        SELECT ?inception WHERE {
            VALUES ?label { "${cleanName}" "${cleanName} City" }
            ?city rdfs:label ?label@en;
                  wdt:P17 wd:Q30;
                  wdt:P571 ?inception.
            FILTER EXISTS { ?city wdt:P31/wdt:P279* wd:Q515 }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        ORDER BY DESC(?inception) 
        LIMIT 1
    `;

    try {
        const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

        if (res.ok) {
            const data = await res.json();
            if (data.results.bindings.length > 0) {
                const isoDate = data.results.bindings[0].inception.value;
                return new Date(isoDate).getFullYear().toString();
            }
        }
    } catch (e) { }
    return null;
}

// Map of US States to Wikidata QIDs
const USA_STATES: Record<string, string> = {
    'AL': 'Q633', 'AK': 'Q797', 'AZ': 'Q816', 'AR': 'Q1612', 'CA': 'Q99',
    'CO': 'Q1261', 'CT': 'Q779', 'DE': 'Q1393', 'FL': 'Q812', 'GA': 'Q1428',
    'HI': 'Q782', 'ID': 'Q1221', 'IL': 'Q1204', 'IN': 'Q1415', 'IA': 'Q1546',
    'KS': 'Q1558', 'KY': 'Q1562', 'LA': 'Q1588', 'ME': 'Q724', 'MD': 'Q1391',
    'MA': 'Q771', 'MI': 'Q1166', 'MN': 'Q1527', 'MS': 'Q1494', 'MO': 'Q1581',
    'MT': 'Q1212', 'NE': 'Q1553', 'NV': 'Q1227', 'NH': 'Q759', 'NJ': 'Q1408',
    'NM': 'Q1522', 'NY': 'Q1384', 'NC': 'Q1454', 'ND': 'Q1207', 'OH': 'Q1397',
    'OK': 'Q1490', 'OR': 'Q824', 'PA': 'Q1400', 'RI': 'Q773', 'SC': 'Q1456',
    'SD': 'Q1211', 'TN': 'Q1509', 'TX': 'Q1439', 'UT': 'Q829', 'VT': 'Q1655',
    'VA': 'Q1370', 'WA': 'Q1223', 'WV': 'Q1371', 'WI': 'Q1537', 'WY': 'Q1214'
};

// New: Fetch Politicians via Wikidata (Split for stability)
async function fetchWikidataPoliticians(cityName: string, stateCode: string) {
    const cleanCity = cityName.replace(/"/g, '');
    // Ensure stateCode is 2 chars (e.g. "Florida" -> "FL" mapping would be needed if full name passed, 
    // but usually we pass "FL" or "NY" from the frontend location string).
    // If full name is passed, we default to FL QID (Q812) to be safe/lazy or could map names too.
    // For now assuming stateCode is 2 chars or we fallback.
    const stateQID = USA_STATES[stateCode] || (stateCode === 'Florida' ? 'Q812' : null);

    // 1. Fetch Mayor
    let mayor = null;
    try {
        // Optimized: Check specific variations instead of expensive Regex
        const queryMayor = `
            SELECT ?mayorLabel ?mayorPhoto WHERE {
                VALUES ?cityLabel { "${cleanCity}" "${cleanCity} City" "City of ${cleanCity}" "${cleanCity}, ${stateCode}" "${cleanCity}, Florida" }
                ?city rdfs:label ?cityLabel@en;
                      wdt:P17 wd:Q30; 
                      wdt:P31/wdt:P279* wd:Q515; 
                      wdt:P6 ?mayor.
                ?mayor rdfs:label ?mayorLabel@en.
                OPTIONAL { ?mayor wdt:P18 ?mayorPhoto. }
            } LIMIT 1
        `;
        const urlM = `https://query.wikidata.org/sparql?query=${encodeURIComponent(queryMayor)}&format=json`;
        const resM = await fetch(urlM, { headers: { 'Accept': 'application/json' } });
        if (resM.ok) {
            const dataM = await resM.json();
            if (dataM.results.bindings.length > 0) {
                mayor = {
                    name: dataM.results.bindings[0].mayorLabel.value,
                    party: 'Nonpartisan',
                    photoUrl: dataM.results.bindings[0].mayorPhoto?.value
                };
            }
        }
    } catch (e) { console.error('Wiki Mayor Error:', e); }

    // 2. Fetch Governor
    let governor = null;
    if (stateQID) {
        try {
            // Super fast: Look up directly by State QID
            const queryGov = `
                SELECT ?govLabel ?govPhoto WHERE {
                    wd:${stateQID} wdt:P6 ?gov.
                    ?gov rdfs:label ?govLabel@en.
                    OPTIONAL { ?gov wdt:P18 ?govPhoto. }
                } LIMIT 1
            `;
            const urlG = `https://query.wikidata.org/sparql?query=${encodeURIComponent(queryGov)}&format=json`;
            const resG = await fetch(urlG, { headers: { 'Accept': 'application/json' } });
            if (resG.ok) {
                const dataG = await resG.json();
                if (dataG.results.bindings.length > 0) {
                    governor = {
                        name: dataG.results.bindings[0].govLabel.value,
                        party: 'Unknown',
                        photoUrl: dataG.results.bindings[0].govPhoto?.value
                    };
                }
            }
        } catch (e) { console.error('Wiki Gov Error:', e); }
    }

    return { mayor, governor };
}
