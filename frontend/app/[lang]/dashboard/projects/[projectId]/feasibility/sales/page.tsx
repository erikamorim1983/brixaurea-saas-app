import { getProjectWithLocation } from '@/lib/data/project';
import SalesStrategyConfig from '@/components/Analysis/SalesStrategyConfig';
import { getDictionary } from '@/get-dictionary';

export default async function ProjectSalesPage({ params }: { params: Promise<{ lang: string; projectId: string }> }) {
    const { lang, projectId } = await params;
    const data = await getProjectWithLocation(projectId);
    const dictionary = await getDictionary(lang);

    if (!data) return <div>Project not found</div>;
    const { project, location } = data;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="w-full">
                <SalesStrategyConfig
                    project={project}
                    location={location}
                    lang={lang}
                    dictionary={dictionary}
                />
            </div>
        </div>
    );
}
