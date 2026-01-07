import ProjectTabs from '@/components/Project/ProjectTabs';
import { getDictionary } from '@/get-dictionary';

export default async function ProjectLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string; projectId: string }>;
}) {
    const { lang, projectId } = await params;
    const dictionary = await getDictionary(lang);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Project Header could go here if global for project */}

            {/* Navigation Tabs */}
            <div className="bg-white shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <ProjectTabs lang={lang} projectId={projectId} dictionary={dictionary} />
                </div>
            </div>

            {/* Page Content */}
            <main>
                {children}
            </main>
        </div>
    );
}
