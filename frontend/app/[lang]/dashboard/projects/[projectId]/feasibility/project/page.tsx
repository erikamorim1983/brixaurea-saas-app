import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/get-dictionary';
import { notFound } from 'next/navigation';
import ProjectConfigTab from '@/components/Analysis/ProjectConfigTab';

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ lang: string; projectId: string }>;
}) {
    const { lang, projectId } = await params;
    const dictionary = await getDictionary(lang);
    const supabase = await createClient();

    // Fetch project
    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (error || !project) {
        notFound();
    }

    return (
        <ProjectConfigTab
            project={project}
            lang={lang}
            dict={dictionary}
        />
    );
}
