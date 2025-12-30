import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProjectForm from '@/components/Projects/ProjectForm';
import { getDictionary } from '../../../../../get-dictionary'; // Adjust import path if needed, confirming next step

interface Props {
    params: Promise<{
        lang: string;
    }>;
}

export default async function NewProjectPage({ params }: Props) {
    // 1. Verify Authentication & Get User
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const { lang } = await params;
        redirect(`/${lang}/auth/login`);
    }

    const { lang } = await params;
    const dictionary = await getDictionary(lang);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{dictionary.projects?.new?.title}</h1>
                <p className="text-gray-500 mt-2">{dictionary.projects?.new?.subtitle}</p>
            </div>

            <div className="flex justify-center">
                <ProjectForm userId={user.id} lang={lang} dictionary={dictionary} />
            </div>
        </div>
    );
}
