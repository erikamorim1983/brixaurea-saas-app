'use client';

import { GoogleMap, Marker } from '@react-google-maps/api';
import { CSSProperties, useMemo } from 'react';

const containerStyle: CSSProperties = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem',
};

// Default center (Aventura, FL - 33180)
const defaultCenter = {
    lat: 25.9545,
    lng: -80.1418,
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
