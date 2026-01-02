import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getDictionary } from '@/get-dictionary';
import FloorPlanLibraryTab from '@/components/FloorPlan/FloorPlanLibraryTab';

export default async function FloorPlanLibraryPage({
    params: { projectId, lang }
}: {
    params: { projectId: string; lang: string }
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const dictionary = await getDictionary(lang);

    return (
        <div className="min-h-screen bg-gray-50">
            <FloorPlanLibraryTab
                userId={user.id}
                lang={lang}
                dict={dictionary.analysis}
            />
        </div>
    );
}
