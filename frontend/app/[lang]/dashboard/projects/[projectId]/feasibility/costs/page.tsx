import { getProjectCosts } from '@/lib/actions/feasibility';
import { getDictionary } from '@/get-dictionary';
import CurrencyInput from '@/components/ui/CurrencyInput'; // reusing for display format if useful or just Intl
// We can display a simple table

export default async function ProjectCostsPage({ params }: { params: { lang: string; projectId: string } }) {
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
        return new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: lang === 'pt' ? 'BRL' : 'USD'
        }).format(val);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{dictionary.analysis.tabs.costs}</h1>

            <div className="space-y-8">
                {Object.keys(grouped).map(category => (
                    <div key={category} className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {grouped[category].map((item: any) => (
                                <li key={item.id} className="px-6 py-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.item_name}</p>
                                        <p className="text-sm text-gray-500">
                                            {item.distribution_curve === 'linear' ? 'Distribuição Linear' : 'Pagamento Único'}
                                            {item.duration_months > 1 ? ` (${item.duration_months} meses)` : ''}
                                        </p>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(item.total_estimated)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {costs.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">Nenhum custo registrado ainda. Complete a viabilidade do terreno.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
