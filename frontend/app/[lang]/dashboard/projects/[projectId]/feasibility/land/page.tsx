import { getLandFeasibilityData } from '@/lib/actions/feasibility';
import LandForm from '@/components/Feasibility/LandForm';
import { Suspense } from 'react';

import { getDictionary } from '@/get-dictionary';

// Using server component to fetch initial data
export default async function LandFeasibilityPage({ params }: { params: Promise<{ lang: string; projectId: string }> }) {
    const { lang, projectId } = await params;
    const dict = await getDictionary(lang);

    // Fetch data
    const data = await getLandFeasibilityData(projectId);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b border-gray-200 px-8 py-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{dict.analysis.land.header}</h1>

                <div className="space-y-1">
                    {data?.land?.project_name && (
                        <p className="text-lg font-semibold text-cyan-900 uppercase tracking-wide">
                            {data.land.project_name}
                        </p>
                    )}

                    {data?.land?.address_full && (
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {data.land.address_full}
                        </p>
                    )}
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-8">
                <Suspense fallback={<div>Loading Land Details...</div>}>
                    <LandForm
                        projectId={projectId}
                        initialData={data}
                        lang={lang}
                    />
                </Suspense>
            </div>
        </div>
    );
}
