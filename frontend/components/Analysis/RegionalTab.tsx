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
            if (location?.zip_code) {
                // Construct a location string if available, e.g. "Orlando, FL"
                const locationString = location.city && location.state_code
                    ? `${location.city}, ${location.state_code}`
                    : (location.address_full || 'Florida');

                const addressParam = location.address_full ? encodeURIComponent(location.address_full) : location.zip_code;

                try {
                    // Call our new Server-Side API Route
                    // We pass 'address' for Civic API precision
                    const res = await fetch(`/api/regional-data?zipCode=${location.zip_code}&locationName=${encodeURIComponent(locationString)}&address=${addressParam}`);
                    if (res.ok) {
                        const data = await res.json();
                        setRegionalData(data);
                    }
                } catch (e) {
                    console.error("Failed to load regional data", e);
                }
            } else {
                // Fallback for demo
                fetch(`/api/regional-data?zipCode=33901&locationName=Fort%20Myers,%20FL`)
                    .then(res => res.json())
                    .then(setRegionalData);
            }
        };
        fetchData();
    }, [location]);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <RegionalDataSection data={regionalData!} lang={lang} dict={dict} />
        </div>
    );
}
