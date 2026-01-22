import { getProjectCosts } from '@/lib/actions/feasibility';
import { getDictionary } from '@/get-dictionary';
import CostConfigurator from '@/components/Analysis/CostConfigurator';

export default async function ProjectCostsPage({ params }: { params: Promise<{ lang: string; projectId: string }> }) {
    const { lang, projectId } = await params;
    const dictionary = await getDictionary(lang);
    const costs = await getProjectCosts(projectId);

    // Group by category
    const grouped = costs.reduce((acc: any, item: any) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(val);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[#081F2E]">{dictionary.analysis.tabs.costs}</h1>
            </div>

            <CostConfigurator
                projectId={projectId}
                initialCosts={costs}
                lang={lang}
                dictionary={dictionary}
            />
        </div>
    );
}
