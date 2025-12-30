import { getDictionary } from '@/get-dictionary';
import { createClient } from '@/lib/supabase/server';
import ProjectsListClient from '@/components/Projects/ProjectsListClient';

export default async function ProjectsPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang);
    const supabase = await createClient();

    // Fetch Projects + Locations
    // Note: This requires a Foreign Key setup between projects and project_locations.
    // If we didn't set explicit FK reference in schema for 'project_locations.project_id', Supabase join might fail.
    // Let's assume standard join: projects(id) <- project_locations(project_id)

    const { data: projects, error } = await supabase
        .from('projects')
        .select(`
            *,
            locations:project_locations(address_full, city, state)
        `)
        .order('updated_at', { ascending: false });

    // Fallback if join fails or empty - handle gracefully
    // Note: Supabase 'locations:project_locations(...)' syntax relies on foreign key detection.

    // If the Join fails (because maybe I didn't define the constraint explicitly in the migration file I can't see),
    // we might need to fetch separately. But let's try the relation first as it's cleaner.
    // Actually, looking at previous schema files, project_locations references projects(id). So it should work.

    // BUT 'locations' is an array in 1:M, or single object in 1:1. 
    // project_locations is 1:1 usually. But our code allows multiple? No, unique project_id.
    // The query returns an array 'locations' by default unless we specify single.

    // Post-processing to flatten if needed
    const processedProjects = projects?.map(p => ({
        ...p,
        // If 1-1, locations might be an object or single array item
        locations: Array.isArray(p.locations) ? p.locations[0] : p.locations
    })) || [];

    return (
        <ProjectsListClient
            projects={processedProjects}
            lang={lang}
            dictionary={dictionary}
        />
    );
}
