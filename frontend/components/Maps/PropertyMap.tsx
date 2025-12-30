'use client';

import { GoogleMap, Marker } from '@react-google-maps/api';
import { CSSProperties, useMemo } from 'react';

const containerStyle: CSSProperties = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem',
};

// Default center (São Paulo)
const defaultCenter = {
    lat: -23.5505,
    lng: -46.6333,
};

interface PropertyMapProps {
    center?: {
        lat: number;
        lng: number;
    };
}

export default function PropertyMap({ center }: PropertyMapProps) {
    const mapCenter = useMemo(() => center || defaultCenter, [center]);

    return (
        <div className="w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden shadow-inner">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={15}
                options={{
                    disableDefaultUI: false,
                    streetViewControl: true,
                    mapTypeControl: true,
                }}
            >
                <Marker position={mapCenter} />
            </GoogleMap>
        </div>
    );
}
