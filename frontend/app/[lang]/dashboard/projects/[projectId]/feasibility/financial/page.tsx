import { getProjectCosts } from '@/lib/actions/feasibility';
import { getDictionary } from '@/get-dictionary';

export default async function ProjectFinancialPage({ params }: { params: Promise<{ lang: string; projectId: string }> }) {
    const { lang, projectId } = await params;
    const dictionary = await getDictionary(lang);
    const costs = await getProjectCosts(projectId);

    // Determine timeline range
    let maxMonth = 12; // Min view
    costs.forEach((c: any) => {
        const end = (c.start_month_offset || 0) + (c.duration_months || 1);
        if (end > maxMonth) maxMonth = end;
    });

    // Create array of months
    const months = Array.from({ length: maxMonth + 1 }, (_, i) => i);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: lang === 'pt' ? 'BRL' : 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    // Helper to get cost for a month
    const getCostForMonth = (item: any, month: number) => {
        if (month < item.start_month_offset) return 0;
        if (month >= item.start_month_offset + (item.duration_months || 1)) return 0;

        // Simple linear distribution
        return item.total_estimated / (item.duration_months || 1);
    };

    // Calculate totals per month
    const monthlyTotals = months.map(m => {
        return costs.reduce((sum: number, item: any) => sum + getCostForMonth(item, m), 0);
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{dictionary.analysis.tabs.financials}</h1>

            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <div className="min-w-max">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 shadow-r">
                                    Item / Mês
                                </th>
                                {months.map(m => (
                                    <th key={m} scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mês {m}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {costs.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white shadow-r">
                                        {item.item_name}
                                    </td>
                                    {months.map(m => {
                                        const val = getCostForMonth(item, m);
                                        return (
                                            <td key={m} className={`px-4 py-4 whitespace-nowrap text-sm text-center ${val > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                                {val > 0 ? formatCurrency(val) : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {/* Totals Row */}
                            <tr className="bg-gray-50 font-bold">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 sticky left-0 bg-gray-50 shadow-r">
                                    Total Mensal
                                </td>
                                {monthlyTotals.map((total, idx) => (
                                    <td key={idx} className="px-4 py-4 whitespace-nowrap text-sm text-center text-cyan-700">
                                        {total > 0 ? formatCurrency(total) : '-'}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
                <p>* Mês 0 representa o momento da assinatura / sinal (EMD).</p>
                <p>* A distribuição dos custos assume uma curva linear para itens com duração maior que 1 mês.</p>
            </div>
        </div>
    );
}
