import { getProjectCashFlow } from '@/lib/actions/feasibility';
import { getDictionary } from '@/get-dictionary';
import FinancialDashboard from '@/components/Analysis/FinancialDashboard';

export default async function ProjectFinancialPage({ params }: { params: Promise<{ lang: string; projectId: string }> }) {
    const { lang, projectId } = await params;
    const dictionary = await getDictionary(lang);
    const flowData = await getProjectCashFlow(projectId);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#081F2E] tracking-tight">
                        {dictionary.analysis.tabs.financials}
                    </h1>
                    <p className="text-sm font-medium text-gray-500">Consolidated Project P&L and Cash Flow Statement</p>
                </div>
            </div>

            <FinancialDashboard
                data={flowData}
                lang={lang}
                dictionary={dictionary}
            />

            <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h5 className="font-bold text-gray-700 mb-2 uppercase tracking-wider">Methodology Note</h5>
                        <p>Total Revenue is calculated based on the aggregate Unit Mix GDV. Monthly distribution follows the selected Sales Strategy (Linear or Manual Absorption). Costs are distributed linearly over the duration defined in the Budget/Schedule.</p>
                    </div>
                    <div>
                        <h5 className="font-bold text-gray-700 mb-2 uppercase tracking-wider">Currency & Conversion</h5>
                        <p>All values shown reflect the project case base currency ({lang === 'pt' ? 'BRL' : 'USD'}). Indices like ROI and IRR are calculated using net monthly proceeds.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
