'use client';

import { useState, useEffect } from "react";
import RegionalDataSection from "./RegionalDataSection";
import { getRegionalData, RegionalData } from "@/services/regional-data.service";

interface RegionalTabProps {
    location: any;
    lang: string;
    dict: any;
}

export default function RegionalTab({ location, lang, dict }: RegionalTabProps) {
    const [regionalData, setRegionalData] = useState<RegionalData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const hasLocationInfo = location?.zip_code || location?.city || location?.address_full;

            if (hasLocationInfo) {
                // Construct a location string if available, e.g. "Orlando, FL"
                const locationString = location.city && (location.state_code || location.state)
                    ? `${location.city}, ${location.state_code || location.state}`
                    : (location.address_full || location.zip_code || 'Florida');

                const params = new URLSearchParams();
                if (location.zip_code) params.append('zipCode', location.zip_code);
                params.append('locationName', locationString);
                if (location.address_full) params.append('address', location.address_full);
                if (location.state_code || location.state) params.append('stateCode', location.state_code || location.state);

                try {
                    const res = await fetch(`/api/regional-data?${params.toString()}`);
                    if (res.ok) {
                        const data = await res.json();
                        setRegionalData(data);
                    }
                } catch (e) {
                    console.error("Failed to load regional data", e);
                }
            } else {
                // Last resort fallback (only if absolutely no info)
                fetch(`/api/regional-data?zipCode=33901&locationName=Fort%20Myers,%20FL`)
                    .then(res => res.json())
                    .then(setRegionalData);
            }
        };
        fetchData();
    }, [location]);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <RegionalDataSection
                data={regionalData!}
                lang={lang}
                dict={dict}
                stateCode={location?.state || location?.state_code || (regionalData ? 'FL' : undefined)}
                address={location?.address_full || (location?.city && (location?.state || location?.state_code) ? `${location.city}, ${location.state || location.state_code}` : (regionalData ? 'Fort Myers, FL' : undefined))}
            />
        </div>
    );
}
