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
            locations:project_locations(address_full, city, state, country),
            category:property_categories(key),
            subtype:property_subtypes(key)
        `)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
    }

    const safeProjects = projects || [];

    // Post-processing to flatten Joined objects
    const processedProjects = safeProjects.map(p => ({
        ...p,
        locations: Array.isArray(p.locations) ? p.locations[0] : p.locations,
        category_key: Array.isArray(p.category) ? p.category[0]?.key : (p.category as any)?.key,
        subtype_key: Array.isArray(p.subtype) ? p.subtype[0]?.key : (p.subtype as any)?.key
    }));

    return (
        <ProjectsListClient
            projects={processedProjects}
            lang={lang}
            dictionary={dictionary?.projects || {}}
        />
    );
}
