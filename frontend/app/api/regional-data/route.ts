import { NextResponse } from 'next/server';
import { RegionalData } from '@/services/regional-data.service'; // We'll verify this import path or duplicate the interface
import { MockRegionalData } from '@/services/regional-data.service';

// Interface duplication to avoid circular dependencies if service is client-heavy
// Ideally we'd move types to a shared file, but for speed keeping it here or reusing.
// Let's assume we can reuse the Mock data for fallback values.

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const zipCode = searchParams.get('zipCode') || '';
    const locationName = searchParams.get('locationName') || '';
    // Extract state from locationName (e.g., "Miami, FL" -> "FL")
    const extractedState = locationName.split(',')[1]?.trim().toUpperCase() || 'FL';
    const stateCode = searchParams.get('stateCode') || extractedState;

    // Use full address if provided, otherwise fallback to locationName or zip
    const exactAddress = searchParams.get('address') || locationName || zipCode;

    // Server-side access to keys (prefers private versions for security)
    const civicKey = process.env.GOOGLE_CIVIC_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY;
    const newsKey = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;

    console.log(`[API Keys] Civic: ${civicKey ? 'PRESENT' : 'MISSING'}, News: ${newsKey ? 'PRESENT' : 'MISSING'}`);

    // --- Robust Extraction: 3530 Mystic Pointe Dr, Aventura, FL 33180 -> City: Aventura, State: FL ---
    const parts = locationName.split(',').map(p => p.trim());
    let cleanCity = parts[0];
    let cleanState = (stateCode || extractedState || 'FL').trim().toUpperCase();
    let countyName = ''; // Will try to fetch from other sources if needed

    if (parts.length >= 2) {
        if (parts.length >= 3) {
            cleanCity = parts[parts.length - 2];
            const statePart = parts[parts.length - 1].split(' ')[0];
            cleanState = statePart.length === 2 ? statePart : cleanState;
        } else {
            // "Miami, FL" or "Aventura, FL 33180"
            cleanCity = parts[0];
            const statePart = parts[1].split(' ')[0];
            cleanState = statePart.length === 2 ? statePart : cleanState;
        }
    }
    // Final Sanity Check for city (remove zip if it leaked in)
    cleanCity = cleanCity.replace(/\d+/g, '').trim();
    if (!cleanCity || cleanCity.length < 2) cleanCity = extractedState ? locationName.split(',')[0].trim() : cleanState;

    // Map common small cities to their major metro areas for better news results
    const metroMapping: Record<string, string> = {
        'Aventura': 'Miami',
        'Holopaw': 'Orlando',
        'Kissimmee': 'Orlando',
        'Winter Park': 'Orlando',
        'Coral Gables': 'Miami',
        'Hollywood': 'Fort Lauderdale'
    };
    const metroCity = metroMapping[cleanCity] || cleanCity;

    console.log(`[API Logic] Extracted: City='${cleanCity}' (Metro: '${metroCity}'), State='${cleanState}' for Input='${locationName}'`);

    // Default Fallback (Mock)
    // We start with the mock for the specific zip if it exists, otherwise use a generic empty template
    const baseMock = zipCode && MockRegionalData[zipCode] ? MockRegionalData[zipCode] : MockRegionalData['empty'] || MockRegionalData['33901'];

    let politicians: RegionalData['politicians'] = { ...baseMock.politicians };
    let news: RegionalData['news'] = [];
    let foundingDate = baseMock.demographics.foundingDate;


    // --- 1. Google Civic API with Cascade (Address -> Zip -> City) ---
    if (civicKey) {
        const tryFetchCivic = async (addr: string) => {
            try {
                const civicUrl = `https://www.googleapis.com/civicinfo/v2/representatives?address=${encodeURIComponent(addr)}&key=${civicKey}`;
                console.log(`[Civic] Requesting: address='${addr}'`);

                const res = await fetch(civicUrl);
                if (res.ok) {
                    const data = await res.json();
                    console.log(`[Civic] Success for '${addr}' - Found ${data.offices?.length || 0} offices`);
                    return data;
                }
                const errorText = await res.text();
                console.warn(`[Civic] Failed (${res.status}) for '${addr}': ${errorText.substring(0, 200)}`);
                return null;
            } catch (e) {
                console.error(`[Civic] Error for '${addr}':`, e);
                return null;
            }
        };

        // Strategy: 1. City, State (Most stable) -> 2. Zip Code -> 3. Exact Address
        console.log(`[API Logic] Starting Civic Cascade...`);
        let data = await tryFetchCivic(`${cleanCity}, ${cleanState}`);

        if (!data && zipCode) {
            data = await tryFetchCivic(zipCode);
        }

        if (data && data.offices && data.officials) {
            const officials = data.officials;
            const offices = data.offices;

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

            // Mayor
            const mayorOffice = offices.find((o: any) =>
                o.name.toLowerCase().includes('mayor') ||
                o.name.toLowerCase().includes('executive') ||
                o.name.toLowerCase().includes('leader')
            );
            if (mayorOffice && mayorOffice.officialIndices.length > 0) {
                const mayor = officials[mayorOffice.officialIndices[0]];
                politicians.mayor = {
                    name: mayor.name,
                    party: mayor.party || 'Nonpartisan',
                    photoUrl: mayor.photoUrl
                };
            }
        } else {
            // If API touched but failed or found nothing, don't leave it at "Loading..."
            if (politicians.mayor.name === 'Loading...') politicians.mayor.name = 'Not Found';
            if (politicians.governor.name === 'Loading...') politicians.governor.name = 'Not Found';
        }
    }

    // --- FALLBACK: Wikidata for Politicians ---
    // If Google failed us OR returned placeholders, we ask the Wiki.
    if (politicians.mayor.name === 'Not Found' || politicians.governor.name === 'Not Found' || politicians.mayor.name === 'Loading...') {
        console.log(`[API Route] Falling back to Wikidata for: ${cleanCity}, ${cleanState}`);
        const wikiData = await fetchWikidataPoliticians(cleanCity, cleanState);

        if (wikiData) {
            // Only overwrite if wiki found something better
            if (wikiData.mayor) {
                politicians.mayor = wikiData.mayor;
            }
            if (wikiData.governor) {
                politicians.governor = wikiData.governor;
            }
        }
    }

    // Final fallback: Real political data for major Florida cities
    if (politicians.mayor.name === 'Not Found' || politicians.governor.name === 'Not Found') {
        const politiciansFallback: Record<string, any> = {
            'Orlando': {
                mayor: { name: 'Buddy Dyer', party: 'Democratic', photoUrl: '' }
            },
            'Miami': {
                mayor: { name: 'Francis Suarez', party: 'Republican', photoUrl: '' }
            },
            'Tampa': {
                mayor: { name: 'Jane Castor', party: 'Democratic', photoUrl: '' }
            },
            'Jacksonville': {
                mayor: { name: 'Donna Deegan', party: 'Democratic', photoUrl: '' }
            },
            'Fort Myers': {
                mayor: { name: 'Kevin B. Anderson', party: 'Non-Partisan', photoUrl: '' }
            },
            'Fort Lauderdale': {
                mayor: { name: 'Dean Trantalis', party: 'Democratic', photoUrl: '' }
            },
            'St. Petersburg': {
                mayor: { name: 'Ken Welch', party: 'Democratic', photoUrl: '' }
            },
            'Weston': {
                mayor: { name: 'Jose Mena', party: 'Non-Partisan', photoUrl: '' }
            },
            'Aventura': {
                mayor: { name: 'Howard Weinberg', party: 'Non-Partisan', photoUrl: '' }
            },
            'Coral Gables': {
                mayor: { name: 'Vince Lago', party: 'Non-Partisan', photoUrl: '' }
            },
            'Hollywood': {
                mayor: { name: 'Josh Levy', party: 'Non-Partisan', photoUrl: '' }
            },
            'New York': {
                mayor: { name: 'Eric Adams', party: 'Democratic', photoUrl: '' }
            }
        };

        // State Governors
        const governorsByState: Record<string, any> = {
            'FL': { name: 'Ron DeSantis', party: 'Republican', photoUrl: '' },
            'Florida': { name: 'Ron DeSantis', party: 'Republican', photoUrl: '' },
            'NY': { name: 'Kathy Hochul', party: 'Democratic', photoUrl: '' },
            'New York': { name: 'Kathy Hochul', party: 'Democratic', photoUrl: '' }
        };

        const cityPoliticians = politiciansFallback[cleanCity];
        if (cityPoliticians && politicians.mayor.name === 'Not Found') {
            politicians.mayor = cityPoliticians.mayor;
            console.log(`[Fallback] Using stored mayor data for ${cleanCity}: ${cityPoliticians.mayor.name}`);
        }

        const stateGovernor = governorsByState[cleanState];
        if (politicians.governor.name === 'Not Found' && stateGovernor) {
            politicians.governor = stateGovernor;
            console.log(`[Fallback] Using ${cleanState} Governor: ${stateGovernor.name}`);
        }
    }


    // --- 2. News API (Server Side fixes CORS) ---
    if (newsKey) {
        try {
            // Ultra-focused query: ONLY real estate, EXCLUDE sports/betting/entertainment
            const includeTerms = '("real estate" OR "housing market" OR "new construction" OR "home prices" OR "property development" OR "mortgage rates" OR "rental market")';
            const excludeTerms = ' -sports -betting -bet -casino -NFL -NBA -MLB -NHL -soccer -football -basketball';
            let query = `"${metroCity}" ${includeTerms} ${excludeTerms}`;
            let newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${newsKey}&pageSize=4&sortBy=publishedAt&language=en&searchIn=title,description`;

            console.log(`[NewsAPI] Requesting REAL ESTATE news for: ${metroCity}`);
            let res = await fetch(newsUrl);

            if (res.ok) {
                const data = await res.json();
                console.log(`[NewsAPI] Response: ${data.totalResults || 0} total results, status: ${data.status}`);

                if (data.articles && data.articles.length > 0) {
                    news = data.articles.map((a: any) => ({
                        headline: a.title,
                        source: a.source.name,
                        date: new Date(a.publishedAt).toLocaleDateString(),
                        url: a.url
                    }));
                    console.log(`[NewsAPI] Mapped ${news.length} articles`);
                } else {
                    // Fallback to state-level news if city returns empty
                    console.log(`[NewsAPI] No city news, trying state-level...`);
                    query = `"${cleanState}" AND "Real Estate" OR "Housing Market"`;
                    newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${newsKey}&pageSize=4&sortBy=publishedAt&language=en`;

                    res = await fetch(newsUrl);
                    if (res.ok) {
                        const stateData = await res.json();
                        if (stateData.articles && stateData.articles.length > 0) {
                            news = stateData.articles.map((a: any) => ({
                                headline: a.title,
                                source: a.source.name,
                                date: new Date(a.publishedAt).toLocaleDateString(),
                                url: a.url
                            }));
                            console.log(`[NewsAPI] State-level: Mapped ${news.length} articles`);
                        }
                    }
                }
            } else {
                const errorText = await res.text();
                console.error(`[NewsAPI] Error ${res.status}: ${errorText.substring(0, 200)}`);
            }
        } catch (error) {
            console.error('[NewsAPI] Fetch Failed:', error);
        }
    }


    // --- 3. Economics & Demographics (DataUSA + FRED) ---
    let realDemographics = { ...baseMock.demographics };
    let realEconomics = { ...baseMock.economics };

    try {
        console.log(`[API Route] Fetching Economics for City='${cleanCity}', State='${cleanState}'`);

        // A. US Census Bureau API (PRIORITY 1 - Official Government Data)
        const censusData = await fetchCensusData(cleanCity, cleanState);
        if (censusData && censusData.population > 0) {
            console.log(`[Census] Received Census data: population=${censusData.population}`);

            // Smart check: If Census returns ZIP-level data for major cities (pop < 10k), use city-wide fallback
            const majorCities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
                'San Antonio', 'San Diego', 'Dallas', 'Miami', 'Orlando', 'Tampa'];

            if (majorCities.includes(cleanCity) && censusData.population < 10000) {
                console.log(`[Census] Detected ZIP-level data for major city ${cleanCity} (${censusData.population}). Using city-wide fallback.`);
                // Don't use this data, will fall through to fallback
            } else {
                // Use Census data
                realDemographics.population = censusData.population;
                realDemographics.medianIncome = censusData.income;
                realDemographics.medianAge = censusData.medianAge;
            }
        } else {
            // Fallback to DataUSA if Census fails
            console.log(`[API Route] Census data not available, trying DataUSA...`);

            const geoId = await findDataUSAId(cleanCity, cleanState);
            console.log(`[DataUSA] GeoID for ${cleanCity}, ${cleanState}: ${geoId || 'NOT FOUND'}`);

            if (geoId) {
                const metrics = await fetchDataUSAMetrics(geoId);
                console.log(`[DataUSA] Metrics returned:`, metrics);
                if (metrics) {
                    if (metrics.population) realDemographics.population = metrics.population;
                    if (metrics.income) realDemographics.medianIncome = metrics.income;
                    if (metrics.medianAge) realDemographics.medianAge = metrics.medianAge;
                }
            } else {
                // Fallback: Try state-level data if city not found
                console.log(`[DataUSA] City not found, trying state-level data for ${cleanState}`);
                const stateId = await findDataUSAId(cleanState, 'USA');
                if (stateId) {
                    const stateMetrics = await fetchDataUSAMetrics(stateId);
                    if (stateMetrics) {
                        console.log(`[DataUSA] Using state-level metrics as fallback`);
                        if (stateMetrics.population) realDemographics.population = stateMetrics.population;
                        if (stateMetrics.income) realDemographics.medianIncome = stateMetrics.income;
                        if (stateMetrics.medianAge) realDemographics.medianAge = stateMetrics.medianAge;
                    }
                }
            }
        }

        // B. FRED Integration (Unemployment Rate by State)
        const stateUnemployment = await fetchStateUnemployment(cleanState);
        if (stateUnemployment) {
            realDemographics.unemploymentRate = stateUnemployment;
        }

        // C. Mortgage Rates (National Average)
        const mortgageRate = await fetchNationalMortgageRate();
        if (mortgageRate) {
            realEconomics.interestRate = mortgageRate;
        }

    } catch (error) {
        console.error('[API Route] Demographics Integration Error:', error);
    }

    // Professional fallback: Use real Census data for major cities if APIs failed
    if (realDemographics.population === 0 || !realDemographics.population) {
        const cityDataFallback: Record<string, any> = {
            'Orlando': { population: 307573, medianIncome: 61078, medianAge: 34.8, metro: 2673000 },
            'Miami': { population: 442241, medianIncome: 47860, medianAge: 40.6, metro: 6139000 },
            'Tampa': { population: 399700, medianIncome: 59353, medianAge: 35.9, metro: 3175000 },
            'Jacksonville': { population: 954614, medianIncome: 59367, medianAge: 36.5, metro: 1605000 },
            'Fort Myers': { population: 92245, medianIncome: 52676, medianAge: 42.1, metro: 771000 },
            'St. Petersburg': { population: 263553, medianIncome: 58953, medianAge: 42.6, metro: 3175000 },
            'Weston': { population: 68029, medianIncome: 132832, medianAge: 41.1, metro: 6139000 },
            'Aventura': { population: 40187, medianIncome: 54886, medianAge: 47.2, metro: 6139000 },
            'Fort Lauderdale': { population: 182760, medianIncome: 56727, medianAge: 43.1, metro: 6139000 },
            'New York': { population: 8336817, medianIncome: 70663, medianAge: 36.9, metro: 20140470 },
            'Coral Gables': { population: 51095, medianIncome: 78284, medianAge: 41.5, metro: 6139000 },
            'Hollywood': { population: 153067, medianIncome: 54446, medianAge: 42.8, metro: 6139000 }
        };

        const fallbackData = cityDataFallback[cleanCity];
        if (fallbackData) {
            console.log(`[Regional Data] Using Census-based fallback data for ${cleanCity}`);
            realDemographics.population = fallbackData.population;
            realDemographics.medianIncome = fallbackData.medianIncome;
            realDemographics.medianAge = fallbackData.medianAge;
            // Add metro population if available
            if (fallbackData.metro) {
                (realDemographics as any).metroPopulation = fallbackData.metro;
            }
        } else {
            console.warn(`[Regional Data] No fallback data available for ${cleanCity}`);
        }
    }

    // Metro area mapping for cities (even if Census API worked)
    const metroAreaMapping: Record<string, { name: string, population: number }> = {
        'Aventura': { name: 'Miami-Dade County', population: 6139000 },
        'Miami': { name: 'Miami Metro Area', population: 6139000 },
        'Fort Lauderdale': { name: 'Miami-Fort Lauderdale Metro', population: 6139000 },
        'Hollywood': { name: 'Miami-Fort Lauderdale Metro', population: 6139000 },
        'Coral Gables': { name: 'Miami-Dade County', population: 6139000 },
        'Weston': { name: 'Miami-Fort Lauderdale Metro', population: 6139000 },
        'Orlando': { name: 'Orlando Metro Area', population: 2673000 },
        'Tampa': { name: 'Tampa Bay Metro Area', population: 3175000 },
        'St. Petersburg': { name: 'Tampa Bay Metro Area', population: 3175000 },
        'Jacksonville': { name: 'Jacksonville Metro Area', population: 1605000 },
        'Fort Myers': { name: 'Cape Coral-Fort Myers Metro', population: 771000 },
        'New York': { name: 'New York Metro Area', population: 20140470 }
    };

    const metroInfo = metroAreaMapping[cleanCity];
    if (metroInfo && !(realDemographics as any).metroPopulation) {
        (realDemographics as any).metroPopulation = metroInfo.population;
        (realDemographics as any).metroName = metroInfo.name;
    }

    // Assemble Response
    const responseData: RegionalData & { _debug?: any } = {
        ...baseMock,
        politicians,
        news,
        demographics: {
            ...realDemographics,
            foundingDate
        },
        economics: realEconomics,
        _debug: {
            keys: {
                civic: !!civicKey,
                news: !!newsKey,
                fred: !!process.env.FRED_API_KEY
            },
            extraction: {
                city: cleanCity,
                state: cleanState,
                zip: zipCode
            }
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
        // Optimized: Check specific variations and use case-insensitive label search
        const queryMayor = `
            SELECT ?mayorLabel ?mayorPhoto WHERE {
                VALUES ?cityString { "${cleanCity}" "${cleanCity} City" "City of ${cleanCity}" }
                ?city rdfs:label ?cityLabel;
                      wdt:P17 wd:Q30; 
                      wdt:P31/wdt:P279* wd:Q515; 
                      wdt:P6 ?mayor.
                FILTER(LCASE(STR(?cityLabel)) = LCASE("${cleanCity}"))
                ?mayor rdfs:label ?mayorLabel.
                FILTER(LANG(?mayorLabel) = "en")
                FILTER(LANG(?cityLabel) = "en")
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

// --- NEW DATA PROVIDERS (DataUSA & FRED) ---

async function findDataUSAId(city: string, state: string) {
    try {
        const query = encodeURIComponent(`${city}, ${state}`);
        const res = await fetch(`https://datausa.io/api/search/?q=${query}&limit=1`);
        if (res.ok) {
            const searchData = await res.json();
            if (searchData.results?.length > 0) {
                const result = searchData.results[0];
                console.log(`[DataUSA] Found ID: ${result.id} for '${city}, ${state}' (Title: ${result.title})`);
                // Ensure it's a place or city ID (usually starts with 160)
                if (result.id.startsWith('160')) return result.id;
            }
        }
    } catch (e) {
        console.warn('[DataUSA] Search Failed', e);
    }
    return null;
}

async function fetchDataUSAMetrics(geoId: string) {
    try {
        const url = `https://datausa.io/api/data?drilldowns=Place&measures=Population,Household Income,Median Age&Place=${geoId}&year=latest`;
        console.log(`[DataUSA] Fetching metrics from: ${url}`);
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            console.log(`[DataUSA] Raw response:`, JSON.stringify(data).substring(0, 300));
            if (data.data?.length > 0) {
                const latest = data.data[0];
                const result = {
                    population: latest['Population'],
                    income: latest['Household Income'],
                    medianAge: latest['Median Age']
                };
                console.log(`[DataUSA] Parsed metrics:`, result);
                return result;
            } else {
                console.warn(`[DataUSA] No data returned for geoId: ${geoId}`);
            }
        } else {
            console.error(`[DataUSA] HTTP Error ${res.status} for geoId: ${geoId}`);
        }
    } catch (e) {
        console.warn('[DataUSA] Metrics Failed', e);
    }
    return null;
}

async function fetchStateUnemployment(stateCode: string) {
    const fredKey = process.env.FRED_API_KEY;
    if (!fredKey) return null;

    try {
        // Code format: FLUR, NYUR, CAUR, etc.
        const seriesId = `${stateCode.toUpperCase()}UR`;
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            if (data.observations?.length > 0) {
                return parseFloat(data.observations[0].value);
            }
        }
    } catch (e) {
        console.warn('[FRED] Unemployment Failed', e);
    }
    return null;
}

async function fetchNationalMortgageRate() {
    const fredKey = process.env.FRED_API_KEY;
    if (!fredKey) return null;

    try {
        const seriesId = 'MORTGAGE30US';
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${fredKey}&file_type=json&sort_order=desc&limit=1`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            if (data.observations?.length > 0) {
                return parseFloat(data.observations[0].value);
            }
        }
    } catch (e) {
        console.warn('[FRED] Mortgage Rate Failed', e);
    }
    return null;
}

// --- US CENSUS BUREAU API (Official Government Data) ---

async function fetchCensusData(city: string, state: string) {
    const censusKey = process.env.CENSUS_API_KEY;
    if (!censusKey) {
        console.warn('[Census] API Key not found');
        return null;
    }

    try {
        // Get state FIPS code
        const stateFIPS = getStateFIPS(state);
        if (!stateFIPS) {
            console.warn(`[Census] No FIPS code for state: ${state}`);
            return null;
        }

        // ACS 5-Year Data (most comprehensive): B01003_001E (Total Population), B19013_001E (Median Household Income), B01002_001E (Median Age)
        const variables = 'B01003_001E,B19013_001E,B01002_001E';
        const url = `https://api.census.gov/data/2022/acs/acs5?get=NAME,${variables}&for=place:*&in=state:${stateFIPS}&key=${censusKey}`;

        console.log(`[Census] Fetching data for ${city}, ${state}`);
        const res = await fetch(url);

        if (res.ok) {
            const data = await res.json();
            // data[0] is headers, data[1+] are city rows
            if (data.length > 1) {
                // Find the matching city
                const cityRow = data.find((row: any[]) =>
                    row[0] && row[0].toLowerCase().includes(city.toLowerCase())
                );

                if (cityRow) {
                    const result = {
                        population: parseInt(cityRow[1]) || 0,
                        income: parseInt(cityRow[2]) || 0,
                        medianAge: parseFloat(cityRow[3]) || 0
                    };
                    console.log(`[Census] SUCCESS for ${city}:`, result);
                    return result;
                } else {
                    console.warn(`[Census] City '${city}' not found in state ${state}`);
                }
            }
        } else {
            console.error(`[Census] HTTP Error ${res.status}`);
        }
    } catch (e) {
        console.error('[Census] Fetch Failed:', e);
    }
    return null;
}

// State FIPS codes for Census API
function getStateFIPS(state: string): string | null {
    const fipsMap: Record<string, string> = {
        'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06',
        'CO': '08', 'CT': '09', 'DE': '10', 'FL': '12', 'GA': '13',
        'HI': '15', 'ID': '16', 'IL': '17', 'IN': '18', 'IA': '19',
        'KS': '20', 'KY': '21', 'LA': '22', 'ME': '23', 'MD': '24',
        'MA': '25', 'MI': '26', 'MN': '27', 'MS': '28', 'MO': '29',
        'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33', 'NJ': '34',
        'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38', 'OH': '39',
        'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44', 'SC': '45',
        'SD': '46', 'TN': '47', 'TX': '48', 'UT': '49', 'VT': '50',
        'VA': '51', 'WA': '53', 'WV': '54', 'WI': '55', 'WY': '56',
        'Florida': '12', 'California': '06', 'New York': '36', 'Texas': '48'
    };
    return fipsMap[state] || null;
}
