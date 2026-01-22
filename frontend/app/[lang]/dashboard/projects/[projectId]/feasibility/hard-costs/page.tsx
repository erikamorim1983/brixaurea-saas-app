import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/get-dictionary';
import { notFound } from 'next/navigation';
import HardCostsConfigurator from '@/components/Analysis/HardCostsConfigurator';
import { getProjectCosts, getUnitMix } from '@/lib/actions/feasibility';

export default async function HardCostsPage({
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
        .select('*, property_subtypes(key)')
        .eq('id', projectId)
        .single();

    if (error || !project) {
        notFound();
    }

    // Fetch current costs (to filter HARD_COSTS)
    const initialCosts = await getProjectCosts(projectId);
    const units = await getUnitMix(projectId);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <HardCostsConfigurator
                projectId={projectId}
                project={project}
                initialCosts={initialCosts}
                initialUnits={units}
                lang={lang}
                dictionary={dictionary}
            />
        </div>
    );
}
