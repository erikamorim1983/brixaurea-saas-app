import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export async function getProjectWithLocation(projectId: string) {
    const supabase = await createClient();

    // 1. Fetch Project Basics
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (projectError || !project) {
        return null; // Or throw
    }

    // 2. Fetch Location
    const { data: location } = await supabase
        .from('project_locations')
        .select('*')
        .eq('project_id', projectId)
        .single();

    // 3. Fetch Subtype
    const { data: subtype } = await supabase
        .from('property_subtypes')
        .select('*')
        .eq('id', project.subtype_id)
        .single();

    return { project, location, subtype };
}
