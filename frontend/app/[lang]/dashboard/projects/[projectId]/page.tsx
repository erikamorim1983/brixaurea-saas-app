import { getProjectWithLocation } from '@/lib/data/project';
import { getDictionary } from '@/get-dictionary';
import OverviewTab from '@/components/Analysis/OverviewTab';
import GoogleMapWrapper from '@/components/Maps/GoogleMapWrapper';
import PropertyMap from '@/components/Maps/PropertyMap';

export default async function ProjectOverviewPage({ params }: { params: Promise<{ lang: string; projectId: string }> }) {
    const { lang, projectId } = await params;
    const dictionary = await getDictionary(lang);
    const data = await getProjectWithLocation(projectId);

    if (!data) return <div>Project not found</div>;

    const { project, location: projectLocation, subtype } = data;
    const mapCenter = {
        lat: projectLocation?.latitude || -23.5505,
        lng: projectLocation?.longitude || -46.6333,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-[500px]">
                    <GoogleMapWrapper>
                        <PropertyMap center={mapCenter} />
                    </GoogleMapWrapper>
                </div>
                <div className="lg:col-span-1">
                    <OverviewTab
                        project={project}
                        location={projectLocation}
                        subtype={subtype}
                        lang={lang}
                        dict={dictionary}
                    />
                </div>
            </div>
        </div>
    );
}
