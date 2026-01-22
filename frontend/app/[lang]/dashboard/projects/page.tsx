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

    // Fetch Projects with basic relations to avoid complex RLS join issues
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
        console.error('🔴 Error fetching projects:', JSON.stringify(error, null, 2));
    }

    const safeProjects = projects || [];

    // Post-processing to flatten Joined objects with null safety
    const processedProjects = safeProjects.map(p => ({
        ...p,
        locations: Array.isArray(p.locations) ? p.locations[0] : p.locations,
        category_key: p.category ? (Array.isArray(p.category) ? p.category[0]?.key : (p.category as any)?.key) : null,
        subtype_key: p.subtype ? (Array.isArray(p.subtype) ? p.subtype[0]?.key : (p.subtype as any)?.key) : null,
        standard_key: p.standard_id // Using direct ID for now while relationship stabilizes
    }));

    return (
        <ProjectsListClient
            projects={processedProjects}
            lang={lang}
            dictionary={dictionary?.projects || {}}
        />
    );
}
