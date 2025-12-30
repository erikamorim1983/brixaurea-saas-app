import { redirect } from "next/navigation";

export default async function AnalysisPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ projectId?: string }>;
}) {
    const { lang } = await params;
    const { projectId } = await searchParams;

    if (projectId) {
        redirect(`/${lang}/dashboard/projects/${projectId}/feasibility/land`);
    } else {
        redirect(`/${lang}/dashboard/projects`);
    }
}
