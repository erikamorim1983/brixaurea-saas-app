'use client';

import { ReactNode } from 'react';
import { useJsApiLoader, Library } from '@react-google-maps/api';

const LIBRARIES: Library[] = ["places"];

interface GoogleMapWrapperProps {
    children: ReactNode;
}

export default function GoogleMapWrapper({ children }: GoogleMapWrapperProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: LIBRARIES,
        language: "pt-BR",
    });

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <p className="font-bold">Erro de Configuração</p>
                <p className="text-sm">API Key do Google Maps não encontrada. Verifique o arquivo .env.local.</p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <p className="font-bold">Erro ao carregar o Google Maps</p>
                <p className="text-sm">Verifique se a API "Maps JavaScript API" está ativada no Google Cloud e se há uma conta de faturamento associada.</p>
                <p className="text-xs mt-2 text-gray-600">{loadError.message}</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return <>{children}</>;
}
