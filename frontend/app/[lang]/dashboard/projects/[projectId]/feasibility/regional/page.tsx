import { getProjectWithLocation } from '@/lib/data/project';
import { getDictionary } from '@/get-dictionary';
import RegionalTab from '@/components/Analysis/RegionalTab';

export default async function ProjectRegionalPage({ params }: { params: Promise<{ lang: string; projectId: string }> }) {
    const { lang, projectId } = await params;
    const dictionary = await getDictionary(lang);
    const data = await getProjectWithLocation(projectId);

    if (!data) return <div>Project not found</div>;
    const { location } = data;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <RegionalTab
                location={location}
                lang={lang}
                dict={dictionary}
            />
        </div>
    );
}
