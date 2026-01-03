export interface RegionalData {
    politicians: {
        mayor: { name: string; party: string; photoUrl?: string };
        governor: { name: string; party: string; photoUrl?: string };
    };
    demographics: {
        population: number;
        metroPopulation?: number; // Metropolitan area population
        metroName?: string; // Name of metro area (e.g., "Miami-Dade County")
        medianIncome: number;
        medianAge: number;
        unemploymentRate: number;
        foundingDate?: string; // e.g. "1886"
    };
    economics: {
        medianHomeValue: number;
        rentTrend: number; // Percentage over last year
        crimeIndex: number; // 0-100, lower is better
        jobGrowth: number; // Percent YoY
        interestRate: number; // 30-year fixed avg
        inventoryLevel: number; // Months of supply
        capRate: number; // Average Cap Rate for area
    };
    schools: {
        elementary: number; // 1-10 rating
        middle: number;
        high: number;
    };
    news: {
        headline: string;
        source: string;
        date: string;
        url?: string;
    }[];
}

export const MockRegionalData: Record<string, RegionalData> = {
    // Fort Myers, FL 33901
    '33901': {
        politicians: {
            mayor: { name: 'Kevin Anderson', party: 'Independent', photoUrl: 'https://www.cityftmyers.com/ImageRepository/Document?documentID=14498' },
            governor: { name: 'Ron DeSantis', party: 'Republican', photoUrl: 'https://www.flgov.com/wp-content/uploads/2019/01/governor-ron-desantis.jpg' }
        },
        demographics: {
            population: 86383,
            medianIncome: 50400,
            medianAge: 48,
            unemploymentRate: 3.2,
            foundingDate: '1886'
        },
        economics: {
            medianHomeValue: 345000,
            rentTrend: 5.4,
            crimeIndex: 42,
            jobGrowth: 2.8,
            interestRate: 6.85,
            inventoryLevel: 4.2,
            capRate: 5.5
        },
        schools: {
            elementary: 6,
            middle: 5,
            high: 5
        },
        news: [
            {
                headline: 'Fort Myers Downtown Revitalization Project Approved',
                source: 'News-Press',
                date: '2025-05-12',
                url: 'https://www.news-press.com/story/news/local/fort-myers/2023/05/12/fort-myers-downtown-revitalization-project-approved/702123456/'
            },
            {
                headline: 'New Waterfront Park Opens to Public',
                source: 'WINK News',
                date: '2025-05-10',
                url: 'https://www.winknews.com/2023/05/10/new-waterfront-park-opens-to-public-in-fort-myers/'
            }
        ]
    },
    'empty': {
        politicians: {
            mayor: { name: 'Loading...', party: '', photoUrl: '' },
            governor: { name: 'Loading...', party: '', photoUrl: '' }
        },
        demographics: {
            population: 0,
            medianIncome: 0,
            medianAge: 0,
            unemploymentRate: 0,
            foundingDate: undefined
        },
        economics: {
            medianHomeValue: 0,
            rentTrend: 0,
            crimeIndex: 0,
            jobGrowth: 0,
            interestRate: 0,
            inventoryLevel: 0,
            capRate: 0
        },
        schools: {
            elementary: 0,
            middle: 0,
            high: 0
        },
        news: []
    }
};

export async function getRegionalData(zipCode: string, locationName: string = 'Florida'): Promise<RegionalData | null> {
    const civicKey = process.env.NEXT_PUBLIC_GOOGLE_CIVIC_API_KEY;
    const newsKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;

    // Initialize with placeholders, NOT Fort Myers data (unless in Demo Mode)
    // If we have keys, we want to try real data. If not, we fall back to Fort Myers only if explicitly requested or strictly no keys.
    const isDemoMode = !civicKey && !newsKey;

    let politicians = isDemoMode ? MockRegionalData['33901'].politicians : {
        mayor: { name: 'Loading...', party: '', photoUrl: '' },
        governor: { name: 'Loading...', party: '', photoUrl: '' }
    };

    let news = isDemoMode ? MockRegionalData['33901'].news : [];

    // Default demographics from mock (hard to get real ones without paid API), 
    // but we reset Founding Date to try and fetch it.
    let foundingDate = isDemoMode ? MockRegionalData['33901'].demographics.foundingDate : undefined;

    // 1. Google Civic Information API
    if (civicKey) {
        try {
            const res = await fetch(`https://www.googleapis.com/civicinfo/v2/representatives?address=${zipCode}&roles=headOfGovernment&roles=administrativeArea1&key=${civicKey}`);
            if (res.ok) {
                const data = await res.json();

                // Reset to empty structure with correct typing
                const realPoliticians: RegionalData['politicians'] = {
                    mayor: { name: 'Not Found', party: 'Unknown' },
                    governor: { name: 'Not Found', party: 'Unknown' }
                };

                const officials = data.officials;
                const offices = data.offices;

                if (offices && officials) {
                    // Attempt to find Governor
                    const governorOffice = offices.find((o: any) => o.name.toLowerCase().includes('governor'));
                    if (governorOffice && governorOffice.officialIndices.length > 0) {
                        const gov = officials[governorOffice.officialIndices[0]];
                        realPoliticians.governor = {
                            name: gov.name,
                            party: gov.party || 'Unknown',
                            photoUrl: gov.photoUrl
                        };
                    }

                    // Attempt to find Mayor
                    const mayorOffice = offices.find((o: any) =>
                        o.name.toLowerCase().includes('mayor') ||
                        o.name.toLowerCase().includes('executive') ||
                        o.name.toLowerCase().includes('leader')
                    );
                    if (mayorOffice && mayorOffice.officialIndices.length > 0) {
                        const mayor = officials[mayorOffice.officialIndices[0]];
                        realPoliticians.mayor = {
                            name: mayor.name,
                            party: mayor.party || 'Nonpartisan',
                            photoUrl: mayor.photoUrl
                        };
                    }
                }
                politicians = realPoliticians;

            } else {
                console.warn(`Civic API Error: ${res.status} ${res.statusText}`);
                politicians = {
                    mayor: { name: 'Data Unavailable', party: 'API Error' },
                    governor: { name: 'Data Unavailable', party: 'API Error' }
                };
            }
        } catch (e) {
            console.error("Failed to fetch Civic Data", e);
            politicians = {
                mayor: { name: 'Connection Failed', party: 'Check Network' },
                governor: { name: 'Connection Failed', party: 'Check Network' }
            };
        }
    }

    // 2. NewsAPI
    if (newsKey) {
        try {
            const keywords = '(Real Estate OR "Economic Growth" OR "Urban Development" OR Infrastructure OR "Major Project" OR "Housing Market")';
            const query = `${locationName} AND ${keywords}`;

            const res = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${newsKey}&pageSize=4&sortBy=relevance&language=en`);

            if (res.ok) {
                const data = await res.json();
                if (data.articles && data.articles.length > 0) {
                    news = data.articles.map((a: any) => ({
                        headline: a.title,
                        source: a.source.name,
                        date: new Date(a.publishedAt).toLocaleDateString()
                    }));
                }
            }
        } catch (e) {
            console.warn("Failed to fetch News Data", e);
        }
    }

    // 3. Wikidata
    let city = locationName.split(',')[0].trim();
    // Heuristic: If city is "New York", try "New York City" for better Wikidata match
    if (city.toLowerCase() === 'new york') city = 'New York City';

    if (city && city !== 'Florida') {
        try {
            const date = await fetchFoundingDate(city);
            if (date) foundingDate = date;
        } catch (e) {
            console.warn("Wikidata fetch failed", e);
        }
    }

    // Return combined data
    return {
        ...MockRegionalData['33901'], // Keep economic base data (mocked)
        politicians,
        demographics: {
            ...MockRegionalData['33901'].demographics,
            foundingDate
        },
        news
    };
}

// Helper to fetch Founding Date via SPARQL
async function fetchFoundingDate(cityName: string): Promise<string | null> {
    const sparqlQuery = `
        SELECT ?inception WHERE {
            ?city rdfs:label "${cityName}"@en;
                  wdt:P31/wdt:P279* wd:Q515; # Is a city
                  wdt:P17 wd:Q30;          # In USA
                  wdt:P571 ?inception.     # Get inception/founding date
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        }
        LIMIT 1
    `;

    try {
        const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}&format=json`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

        if (res.ok) {
            const data = await res.json();
            if (data.results.bindings.length > 0) {
                // Returns ISO date like "1886-01-01T00:00:00Z"
                const isoDate = data.results.bindings[0].inception.value;
                return new Date(isoDate).getFullYear().toString();
            }
        }
    } catch (e) {
        // Silent fail
    }
    return null;
}
