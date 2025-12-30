import React, { useMemo } from 'react';
import { AcquisitionMethod } from '@/lib/types/feasibility';

interface PaymentSchedulePreviewProps {
    landValue: number;
    emd: number;
    pursuitBudget: number;
    ddDays: number;
    closingDays: number;
    acquisitionMethod: AcquisitionMethod;
    sellerFinancing: {
        downPayment?: number;
        rate?: number;
        months?: number;
        startMonth?: number;
        periodicity?: 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual';
        amortization?: 'amortized' | 'interest_only';
    };
    brokerCommissionAmount: number;
    closingCosts: number;
    demolitionCost: number;
    lang: string;
}

const PaymentSchedulePreview: React.FC<PaymentSchedulePreviewProps> = ({
    landValue,
    emd,
    pursuitBudget,
    ddDays,
    closingDays,
    acquisitionMethod,
    sellerFinancing,
    brokerCommissionAmount,
    closingCosts,
    demolitionCost,
    lang
}) => {
    const dictionary = {
        en: {
            title: "Projected Payment Schedule",
            subtitle: "Estimated cash flow based on current terms",
            month: "Month",
            description: "Description",
            amount: "Amount",
            total: "Total Land Cost",
            items: {
                emd: "Earnest Money Deposit (EMD)",
                pursuit: "Pursuit Costs (Due Diligence)",
                closing: "Closing Payment (Principal)",
                brokerage: "Brokerage Fee",
                closingCosts: "Closing Costs & Taxes",
                installment: "Seller Financing Installment",
                demolition: "Demolition & Site Prep"
            }
        },
        pt: {
            title: "Cronograma de Pagamentos Projetado",
            subtitle: "Fluxo de caixa estimado com base nos termos atuais",
            month: "Mês",
            description: "Descrição",
            amount: "Valor",
            total: "Custo Total do Terreno",
            items: {
                emd: "Sinal (EMD)",
                pursuit: "Custos de Due Diligence",
                closing: "Pagamento no Fechamento (Principal)",
                brokerage: "Comissão de Corretagem",
                closingCosts: "Custos de Fechamento e Impostos",
                installment: "Parcela Financiamento Vendedor",
                demolition: "Demolição e Preparação"
            }
        },
        es: {
            title: "Cronograma de Pagos Proyectado",
            subtitle: "Flujo de caja estimado basado en términos actuales",
            month: "Mes",
            description: "Descripción",
            amount: "Monto",
            total: "Costo Total del Terreno",
            items: {
                emd: "Depósito de Garantía (EMD)",
                pursuit: "Costos de Due Diligence",
                closing: "Pago al Cierre (Principal)",
                brokerage: "Comisión de Corretaje",
                closingCosts: "Costos de Cierre e Impuestos",
                installment: "Cuota Financiamiento Vendedor",
                demolition: "Demolición y Preparación"
            }
        }
    };

    const dict = dictionary[lang as keyof typeof dictionary] || dictionary.en;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: lang === 'pt' ? 'BRL' : 'USD'
        }).format(val);
    };

    const [isExpanded, setIsExpanded] = React.useState(false);

    const schedule = useMemo(() => {
        const items: { month: number; description: string; amount: number; type: string; breakdown?: { principal: number; interest: number } }[] = [];

        // Month 0
        if (emd > 0) items.push({ month: 0, description: dict.items.emd, amount: emd, type: 'deposit' });
        if (pursuitBudget > 0) items.push({ month: 0, description: dict.items.pursuit, amount: pursuitBudget, type: 'soft' });

        // Closing Month
        const ddDaysNum = Number(ddDays) || 0;
        const closingDaysNum = Number(closingDays) || 0;
        const daysToClose = ddDaysNum + closingDaysNum;
        const closingMonth = Math.ceil(daysToClose / 30);

        // Brokerage
        if (brokerCommissionAmount > 0) {
            items.push({ month: closingMonth, description: dict.items.brokerage, amount: brokerCommissionAmount, type: 'soft' });
        }

        // Closing Costs
        if (closingCosts > 0) {
            items.push({ month: closingMonth, description: dict.items.closingCosts, amount: closingCosts, type: 'soft' });
        }

        // Acquisition Principal Calculation
        // New Logic: Principal is Land Value - EMD (since Down Payment is removed)
        let acquisitionPrincipal = (landValue || 0) - (emd || 0);
        let acquisitionAtClosing = 0;

        if (acquisitionMethod === 'cash') {
            acquisitionAtClosing = acquisitionPrincipal;
        } else if (acquisitionMethod === 'seller_financing') {
            // In Seller Financing, looking for "Down Payment" is now removed.
            // The user puts EMD (Sinal). The rest is financed.
            // So Acquisition At Closing is 0 (unless we re-introduce a specific cash-at-closing input, but user said "Entrada não precisa").
            acquisitionAtClosing = 0;
        }

        if (acquisitionAtClosing > 0) {
            items.push({ month: closingMonth, description: dict.items.closing, amount: acquisitionAtClosing, type: 'capital' });
        } else if (acquisitionMethod === 'jv_unit_swap') {
            items.push({ month: closingMonth, description: "Permuta Física: Pagamento em Unidades (Sem desembolso inicial)", amount: 0, type: 'note' });
        } else if (acquisitionMethod === 'jv_revenue_share') {
            items.push({ month: closingMonth, description: "Permuta Financeira: % do VGV (Fluxo futuro)", amount: 0, type: 'note' });
        }

        // Seller Financing Installments
        if (acquisitionMethod === 'seller_financing' && sellerFinancing.months && sellerFinancing.months > 0) {
            let principalBalance = acquisitionPrincipal;

            if (principalBalance > 0) {
                const termMonths = sellerFinancing.months;
                const rate = sellerFinancing.rate || 0;
                const startMonthOffset = sellerFinancing.startMonth || 1;
                const specificStartMonth = startMonthOffset;

                // Periodicity multiplier
                let periodMonths = 1;
                if (sellerFinancing.periodicity === 'bimonthly') periodMonths = 2;
                else if (sellerFinancing.periodicity === 'quarterly') periodMonths = 3;
                else if (sellerFinancing.periodicity === 'semiannual') periodMonths = 6;
                else if (sellerFinancing.periodicity === 'annual') periodMonths = 12;

                const annualRate = rate / 100;
                const periods = Math.ceil(termMonths / periodMonths);
                const periodRate = annualRate * (periodMonths / 12);
                const isInterestOnly = sellerFinancing.amortization === 'interest_only';

                let periodPayment = 0;

                if (rate === 0) {
                    periodPayment = principalBalance / periods;
                } else {
                    if (isInterestOnly) {
                        // Interest Only Payment (Just Interest)
                        periodPayment = principalBalance * periodRate;
                    } else {
                        // Amortized Payment (Price Table)
                        if (periodRate > 0) {
                            periodPayment = principalBalance * (periodRate * Math.pow(1 + periodRate, periods)) / (Math.pow(1 + periodRate, periods) - 1);
                        } else {
                            periodPayment = principalBalance / periods;
                        }
                    }
                }

                if (isExpanded) {
                    // Generate ALL rows with amortization calculation
                    for (let i = 0; i < periods; i++) {
                        const currentMonth = specificStartMonth + (i * periodMonths);

                        let interestPart = 0;
                        let principalPart = 0;
                        let paymentAmount = periodPayment;
                        let isBalloon = false;

                        if (rate > 0) {
                            if (isInterestOnly) {
                                interestPart = paymentAmount; // All is interest
                                principalPart = 0;

                                // BALLOON PAYMENT Check (Last Installment)
                                if (i === periods - 1) {
                                    principalPart = principalBalance; // Pay full balance
                                    paymentAmount += principalPart; // Add to this payment
                                    isBalloon = true;
                                }
                            } else {
                                // Amortized
                                interestPart = principalBalance * periodRate;
                                principalPart = paymentAmount - interestPart;
                            }
                        } else {
                            principalPart = paymentAmount;
                        }

                        // Decrease balance
                        principalBalance -= principalPart;

                        const descText = isBalloon
                            ? `${dict.items.installment} (${i + 1}/${periods}) - Balloon (Final)`
                            : `${dict.items.installment} (${i + 1}/${periods})`;

                        items.push({
                            month: currentMonth,
                            description: descText,
                            amount: paymentAmount,
                            type: 'debt',
                            breakdown: {
                                principal: principalPart,
                                interest: interestPart
                            }
                        });
                    }
                } else {
                    // Summary Row
                    // SHOW TOTALS IN SUMMARY
                    let totalAmount = 0;
                    let totalPrincipal = 0;
                    let totalInterest = 0;

                    if (isInterestOnly) {
                        // Total Interest = Monthly Interest * Periods
                        // Total Principal = Original Principal (paid at end)
                        const regularInterestTotal = periodPayment * periods; // periodPayment is purely interest here
                        totalPrincipal = principalBalance; // Original
                        totalInterest = regularInterestTotal;
                        totalAmount = regularInterestTotal + totalPrincipal; // Interest + Balloon
                    } else {
                        totalAmount = periodPayment * periods;
                        totalPrincipal = principalBalance;
                        totalInterest = totalAmount - totalPrincipal;
                    }

                    items.push({
                        month: specificStartMonth,
                        description: `${dict.items.installment} (${periods}x ${sellerFinancing.periodicity || 'monthly'}) - Total`,
                        amount: totalAmount,
                        type: 'debt',
                        breakdown: {
                            principal: totalPrincipal,
                            interest: totalInterest
                        }
                    });
                }
            }
        }

        // Demolition
        if (demolitionCost > 0) {
            items.push({ month: closingMonth + 1, description: dict.items.demolition, amount: demolitionCost, type: 'hard' });
        }

        return items.sort((a, b) => a.month - b.month);
    }, [landValue, emd, pursuitBudget, ddDays, closingDays, acquisitionMethod, sellerFinancing, brokerCommissionAmount, closingCosts, demolitionCost, dict, isExpanded]);

    const totalCost = schedule.reduce((sum, item) => sum + item.amount, 0);

    if (schedule.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-cyan-50/80 to-blue-50/80 p-6 rounded-2xl shadow-sm border border-cyan-100 overflow-hidden">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-cyan-600 bg-white w-8 h-8 flex items-center justify-center rounded-full shadow-sm text-sm">5</span> {dict.title}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">{dict.subtitle}</p>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs font-semibold text-cyan-600 bg-white border border-cyan-200 px-3 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors shadow-sm"
                >
                    {isExpanded ? (lang === 'pt' ? 'Ocultar Detalhes' : 'Hide Details') : (lang === 'pt' ? 'Ver Detalhes (Expandir)' : 'See Details')}
                </button>
            </div>

            <div className={`overflow-x-auto transition-all duration-500 ${isExpanded ? 'max-h-[800px] overflow-y-auto' : ''}`}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {isExpanded ? dict.month : (lang === 'pt' ? 'Mês de Início' : 'Start Month')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {dict.description}
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {dict.amount}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {schedule.map((item, idx) => (
                            <tr key={idx} className={item.type === 'capital' ? 'bg-cyan-50/30' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.month}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    <div>{item.description}</div>
                                    {item.breakdown && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            Principal: {formatCurrency(item.breakdown.principal)} | Juros: {formatCurrency(item.breakdown.interest)}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                                    {formatCurrency(item.amount)}
                                </td>
                            </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={2}>
                                {dict.total}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                                {formatCurrency(totalCost)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-right">
                * Estimativa baseada nos inputs acima. O fluxo real consolidado pode variar.
            </p>
        </div>
    );
};

export default PaymentSchedulePreview;
