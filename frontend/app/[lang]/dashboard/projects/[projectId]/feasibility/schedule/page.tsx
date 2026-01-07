import { getProjectWithLocation } from '@/lib/data/project';
import { getDictionary } from '@/get-dictionary';
import MacroScheduleConfig from '@/components/Analysis/MacroScheduleConfig';
import { notFound } from 'next/navigation';

export default async function ProjectSchedulePage({ params }: { params: Promise<{ lang: string; projectId: string }> }) {
    const { lang, projectId } = await params;
    const project = await getProjectWithLocation(projectId);
    const dictionary = await getDictionary(lang);

    if (!project) notFound();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <MacroScheduleConfig
                project={project}
                lang={lang}
                dictionary={dictionary}
                initialLandData={null}
            />
        </div>
    );
}
