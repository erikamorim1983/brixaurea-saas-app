'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LandDetails, LandOwner, LandOwnerType, AcquisitionMethod } from '@/lib/types/feasibility';
import { saveLandFeasibility, deleteLandOwner } from '@/lib/actions/feasibility';
import PropertyMap from '@/components/Maps/PropertyMap';
import GoogleMapWrapper from '@/components/Maps/GoogleMapWrapper';
import CurrencyInput from '@/components/ui/CurrencyInput';
import PaymentSchedulePreview from './PaymentSchedulePreview';
import ListingLinksManager from './ListingLinksManager';
import { useRouter } from 'next/navigation';

// --- Zod Schema ---
const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const landOwnerSchema = z.object({
    id: z.string().optional(),
    type: z.enum(['individual', 'entity']),
    name: z.string().min(1, 'Name is required'),
    tax_id: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(), // Map to address_street for simplicity or full address string
    is_primary: z.boolean().default(false),
    ownership_share_percent: z.coerce.number().min(0).max(100).optional().default(100),
});

const dictionary = {
    en: {
        save: "Save Changes",
        saving: "Saving...",
        configTitle: "Project Configuration",
        projectType: "Project Type",
        selectType: "Select Type",
        landArea: "Land Area (Acres)",
        existingStructure: "Existing Structure on Site?",
        existingStructureHint: "Impacts demolition costs.",
        structureDescription: "Structure Description",
        structureDescriptionPlaceholder: "Ex: Old warehouse (5000 sqft), abandoned house...",
        demoCost: "Demolition Estimate ($)",
        demoCostHint: "Will be added to Hard Costs budget.",
        acquisitionTitle: "Land Acquisition & Value",
        ownersTitle: "Sellers (Owners)",
        timelineTitle: "Timeline & Deposits (Risk)",
        brokerageTitle: "Brokerage",
        addOwner: "+ Add Owner",
        remove: "Remove",
        type: "Type",
        namePlaceholder: "Name / Company",
        taxId: "Tax ID (SSN/EIN)",
        email: "Email (Optional)",
        phone: "Phone",
        ownerIndividual: "Individual",
        ownerEntity: "Entity (LLC/Corp)",
        emd: "Earnest Money Deposit (EMD)",
        emdHint: "Refundable deposit (Day 0)",
        pursuit: "Pursuit Budget (Soft Costs)",
        pursuitHint: "Budget for Due Diligence (Risky)",
        ddPeriod: "Due Diligence Period",
        days: "Days",
        brokerName: "Broker Name",
        brokerNamePlaceholder: "Broker / Agent Name",
        brokerCompany: "Real Estate Agency",
        brokerCompanyPlaceholder: "Agency / Company",
        brokerEmail: "Email (Optional)",
        brokerPhone: "Phone",
        commission: "Commission %", commissionAmount: "Commission Amount ($)",
        generateLoi: "Generate LOI (Draft)",
        missingModalTitle: "Missing Participants",
        missingModalText: "You haven't added any Owners or Brokers. While optional, missing this information will prevent the automatic generation of Contracts and Letters of Intent (LOI).",
        goBack: "Go Back & Add",
        continueAnyway: "Continue Anyway",
        acquisitionPrice: "Acquisition Price ($)",
        marketValuation: "Market Valuation ($)",
        acquisitionMethod: "Acquisition Method",
        methodCash: "Outright Purchase (Cash)",
        methodSellerFinancing: "Seller Financing",
        methodUnitSwap: "Joint Venture (Unit Allocation)",
        methodFinancialSwap: "Joint Venture (Revenue Share)",
        methodOption: "Option Agreement",
        methodGroundLease: "Ground Lease",
        swapSharePercent: "Land Owner Share (% of VGV)",
        swapHint: "The final land value will be calculated based on the Project Revenue (VGV) defined in the 'Sales / Revenue' tab.",
        unitSwapHint: "The final land value will be determined by the market value of the units allocated to the land owner in the 'Unit Mix' tab.",
        downPayment: "Down Payment ($)",
        interestRate: "Interest Rate (% p.a.)",
        installments: "Term (Months)",
        startMonth: "Start (Month)",
        periodicity: "Periodicity",
        perMonthly: "Monthly",
        perBimonthly: "Bi-monthly",
        perQuarterly: "Quarterly",
        perAnnual: "Annual",
        amortizationType: "Amortization Type",
        amortized: "Fully Amortized",
        interestOnly: "Interest Only",
        listingLink: "Listing Link",
        listingLinkPlaceholder: "Paste URL (Zillow, Redfin, etc.)",
        ownershipShare: "Ownership Share (%)",
        shareAmount: "Proceeds Amount ($)",
        totalShareWarning: "Total ownership share does not equal 100%.",
        contractPreference: "Proposal Generation",
        prefGrouped: "Grouped (Single Doc)",
        prefIndividual: "Individual (Separate Docs)",
        mapTitle: "Land Location",
        mapHint: "",
        initialRent: "Initial Monthly Rent ($)",
        leaseTerm: "Lease Term (Years)",
        dimensions: "Dimensions (Feet)",
        parcelNumber: "Parcel Number (APN)",
        subdivisionLabel: "Subdivision",
        zoningLabel: "Zoning",
        sewerLabel: "Sewer",
        waterLabel: "Water",
        hoaFees: "HOA Monthly Fees ($)",
        specialConditions: "Special Conditions",
        widthLabel: "Width (Feet)",
        lengthLabel: "Length (Feet)",
        propertyDimensionsTitle: "Property & Dimensions",
        zoningUtilitiesTitle: "Zoning & Utilities"
    },
    pt: {
        configTitle: "Configuração do Projeto",
        projectType: "Tipo de Projeto",
        selectType: "Selecione o Tipo",
        landArea: "Área do Terreno (Acres)",
        existingStructure: "Construção Existente no Local?",
        existingStructureHint: "Impacta custos de demolição.",
        structureDescription: "Descrição da Estrutura",
        structureDescriptionPlaceholder: "Ex: Galpão antigo de 500m², casa abandonada...",
        demoCost: "Estimativa de Demolição ($)",
        demoCostHint: "Será adicionado ao orçamento de Hard Costs.",
        acquisitionTitle: "Aquisição do Terreno e Valor",
        ownersTitle: "Vendedores (Owners)",
        timelineTitle: "Prazos e Depósitos (Risco)",
        brokerageTitle: "Corretagem",
        save: "Salvar Alterações",
        saving: "Salvando...",
        addOwner: "+ Adicionar Proprietário",
        remove: "Remover",
        type: "Tipo",
        namePlaceholder: "Nome / Empresa",
        taxId: "Tax ID (SSN/EIN)",
        email: "Email (Opcional)",
        phone: "Telefone",
        ownerIndividual: "Pessoa Física",
        ownerEntity: "Pessoa Jurídica (PJ/LLC)",
        emd: "Sinal (EMD)",
        emdHint: "Depósito reembolsável (Dia 0)",
        pursuit: "Orçamento de Risco (Soft Costs)",
        pursuitHint: "Custo de Due Diligence (Risco)",
        ddPeriod: "Prazo de Due Diligence",
        days: "Dias",
        brokerName: "Nome do Corretor",
        brokerNamePlaceholder: "Nome do Corretor",
        brokerCompany: "Imobiliária",
        brokerCompanyPlaceholder: "Empresa / Imobiliária",
        brokerEmail: "Email (Opcional)",
        brokerPhone: "Telefone",
        commission: "Comissão %", commissionAmount: "Valor da Comissão ($)",
        generateLoi: "Gerar LOI (Rascunho)",
        missingModalTitle: "Participantes Ausentes",
        missingModalText: "Você não adicionou nenhum Proprietário ou Corretor. Embora opcional, a falta dessas informações impedirá a geração automática de Contratos e Cartas de Intenção (LOI).",
        goBack: "Voltar e Adicionar",
        continueAnyway: "Continuar Mesmo Assim",
        acquisitionPrice: "Preço de Aquisição / Pedida ($)",
        marketValuation: "Avaliação de Mercado ($)",
        acquisitionMethod: "Método de Aquisição",
        methodCash: "Compra Direta (À Vista)",
        methodSellerFinancing: "Parcelamento Direto com Proprietário",
        methodUnitSwap: "Permuta Física (Unidades / JV)",
        methodFinancialSwap: "Permuta Financeira (% VGV / JV)",
        methodOption: "Opção de Compra (Option Agreement)",
        methodGroundLease: "Aluguel de Solo (Ground Lease)",
        swapSharePercent: "Participação do Terreno (% do VGV)",
        swapHint: "O valor final do terreno será calculado com base no VGV (Receita Total) definido na aba de 'Vendas / Receita'.",
        unitSwapHint: "O valor final do terreno será determinado pelo valor de mercado das unidades alocadas ao proprietário na aba 'Mix de Unidades'.",
        // downPayment: "Entrada ($)", // REMOVED
        interestRate: "Juros (% a.a.)",
        installments: "Prazo (Meses)",
        startMonth: "Mês de Início",
        periodicity: "Periodicidade",
        perMonthly: "Mensal",
        perBimonthly: "Bimestral",
        perQuarterly: "Trimestral",
        perAnnual: "Anual",
        amortizationType: "Tipo de Amortização",
        amortized: "Totalmente Amortizado (Price)",
        interestOnly: "Apenas Juros (Interest Only)",
        listingLink: "Link do Anúncio",
        listingLinkPlaceholder: "Cole o link (Zillow, Redfin, etc.)",
        ownershipShare: "% de Participação",
        shareAmount: "Valor a Receber ($)",
        totalShareWarning: "A soma das participações não é 100%.",
        contractPreference: "Gerar Proposta",
        prefGrouped: "Agrupada (Um Documento)",
        prefIndividual: "Individual (Documentos Separados)",
        mapTitle: "Localização do Terreno",
        mapHint: "Arraste o pino para ajustar (Em Breve)",
        initialRent: "Aluguel Inicial Mensal (R$)",
        leaseTerm: "Prazo do Contrato (Anos)",
        dimensions: "Dimensões (Feet)",
        parcelNumber: "Número da Parcela (APN)",
        subdivisionLabel: "Loteamento / Subdivisão",
        zoningLabel: "Zoneamento",
        sewerLabel: "Esgoto (Sewer)",
        waterLabel: "Água (Water)",
        hoaFees: "Taxa Mensal HOA ($)",
        specialConditions: "Condições Especiais",
        widthLabel: "Largura (Feet)",
        lengthLabel: "Comprimento (Feet)",
        propertyDimensionsTitle: "Propriedade e Dimensões",
        zoningUtilitiesTitle: "Zoneamento e Utilidades"
    },
    es: {
        configTitle: "Configuración del Proyecto",
        projectType: "Tipo de Proyecto",
        selectType: "Seleccione el Tipo",
        landArea: "Área del Terreno (Acres)",
        existingStructure: "¿Estructura Existente?",
        existingStructureHint: "Impacta costos de demolición.",
        structureDescription: "Descripción de la Estructura",
        structureDescriptionPlaceholder: "Ej: Galpón antiguo, casa abandonada...",
        demoCost: "Estimado de Demolición ($)",
        demoCostHint: "Se agregará al presupuesto de Costos Directos.",
        acquisitionTitle: "Adquisición del Terreno y Valor",
        ownersTitle: "Vendedores (Owners)",
        timelineTitle: "Cronograma y Depósitos",
        brokerageTitle: "Corretaje",
        save: "Guardar Cambios",
        saving: "Guardando...",
        addOwner: "+ Agregar Propietario",
        remove: "Eliminar",
        type: "Tipo",
        namePlaceholder: "Nombre / Empresa",
        taxId: "Tax ID (SSN/EIN)",
        email: "Email (Opcional)",
        phone: "Teléfono",
        ownerIndividual: "Individuo",
        ownerEntity: "Entidad (LLC/Corp)",
        emd: "Depósito de Garantía (EMD)",
        emdHint: "Depósito reembolsable (Día 0)",
        pursuit: "Presupuesto de Riesgo (Soft Costs)",
        pursuitHint: "Costo de Due Diligence (Riesgo)",
        ddPeriod: "Periodo de Due Diligence",
        days: "Días",
        brokerName: "Nombre del Corredor",
        brokerNamePlaceholder: "Nombre del Agente",
        brokerCompany: "Inmobiliaria",
        brokerCompanyPlaceholder: "Empresa / Agencia",
        brokerEmail: "Email (Opcional)",
        brokerPhone: "Teléfono",
        commission: "Comisión %", commissionAmount: "Monto de Comisión ($)",
        generateLoi: "Generar LOI (Borrador)",
        missingModalTitle: "Participantes Faltantes",
        missingModalText: "No ha agregado ningún Propietario o Corredor. Aunque opcional, la falta de esta información impedirá la generación automática de Contratos y Cartas de Intención (LOI).",
        goBack: "Volver y Agregar",
        continueAnyway: "Continuar de Todos Modos",
        acquisitionPrice: "Precio de Adquisición ($)",
        marketValuation: "Valuación de Mercado ($)",
        acquisitionMethod: "Método de Adquisición",
        methodCash: "Compra Directa (Contado)",
        methodSellerFinancing: "Financiamiento del Vendedor",
        methodUnitSwap: "Permuta Física (Unidades / JV)",
        methodFinancialSwap: "Permuta Financiera (% VGV / JV)",
        methodOption: "Opción de Compra (Option Agreement)",
        methodGroundLease: "Arrendamiento de Suelo (Ground Lease)",
        swapSharePercent: "Participación del Terreno (% del VGV)",
        swapHint: "El valor final del terreno se calculará en función de los Ingresos Totales (VGV) definidos en la pestaña de 'Ventas / Ingresos'.",
        unitSwapHint: "El valor final del terreno será determinado por el valor de mercado de las unidades asignadas al propietario en la pestaña 'Mezcla de Unidades'.",
        downPayment: "Pago Inicial ($)",
        interestRate: "Interés (% A.A.)",
        installments: "Plazo (Meses)",
        startMonth: "Inicio (Mes)",
        periodicity: "Periodicidad",
        perMonthly: "Mensual",
        perBimonthly: "Bimestral",
        perQuarterly: "Trimestral",
        perAnnual: "Anual",
        amortizationType: "Tipo de Amortización",
        amortized: "Totalmente Amortizado",
        interestOnly: "Solo Interés",
        listingLink: "Enlace del Anuncio",
        listingLinkPlaceholder: "Pegar enlace (Zillow, Redfin, etc.)",
        ownershipShare: "% de Participación",
        shareAmount: "Monto a Recibir ($)",
        totalShareWarning: "La suma de participaciones no es 100%.",
        contractPreference: "Generar Propuesta",
        prefGrouped: "Agrupada (Un Documento)",
        prefIndividual: "Individual (Documentos Separados)",
        mapTitle: "Ubicación del Terreno",
        mapHint: "Arrastre el pin para ajustar (Próximamente)",
        initialRent: "Renta Inicial Mensual ($)",
        leaseTerm: "Plazo del Contrato (Años)",
        dimensions: "Dimensiones (Feet)",
        parcelNumber: "Número de Parcela",
        subdivisionLabel: "Subdivisión",
        zoningLabel: "Zonificación",
        sewerLabel: "Alcantarillado",
        waterLabel: "Agua",
        hoaFees: "Cuota Mensual HOA ($)",
        specialConditions: "Condiciones Especiales",
        widthLabel: "Ancho (Feet)",
        lengthLabel: "Largo (Feet)",
        propertyDimensionsTitle: "Propiedad y Dimensiones",
        zoningUtilitiesTitle: "Zonificación y Servicios"
    }
};

const landDetailsSchema = z.object({
    // Config & Project Data
    lot_size_acres: z.coerce.number().min(0, 'Area must be positive').optional(),
    lot_width: z.coerce.number().optional(),
    lot_length: z.coerce.number().optional(),
    parcel_number: z.string().optional(),
    subdivision: z.string().optional(),
    zoning_code: z.string().optional(),
    project_type: z.string().optional(),
    has_existing_structure: z.boolean().default(false),
    existing_structure_description: z.string().optional(),
    demolition_cost_estimate: z.coerce.number().min(0).optional(),
    sewer_type: z.string().optional(),
    water_type: z.string().optional(),
    hoa_fees_monthly: z.coerce.number().min(0).optional(),
    special_conditions: z.string().optional(),

    // Valuation
    land_value: z.coerce.number().min(0, 'Value must be positive'),
    listing_link: z.string().optional(),
    market_valuation: z.coerce.number().min(0).optional(),

    contract_structuring_preference: z.enum(['grouped', 'individual']).default('grouped'),

    // Acquisition Method
    acquisition_method: z.enum(['cash', 'seller_financing', 'jv_unit_swap', 'jv_revenue_share', 'option_agreement', 'ground_lease']).default('cash'),

    // Option & Lease
    option_fee_amount: z.coerce.number().optional(),
    option_duration_months: z.coerce.number().optional(),
    lease_initial_rent: z.coerce.number().optional(),
    lease_term_years: z.coerce.number().optional(),

    // Amounts
    amount_cash: z.coerce.number().default(0),
    amount_seller_financing: z.coerce.number().default(0),
    amount_swap_monetary: z.coerce.number().default(0),

    // Seller Financing Terms
    seller_financing_down_payment: z.coerce.number().optional(), // Kept in schema but hidden/unused if needed, or better remove usage
    seller_financing_rate: z.coerce.number().optional(),
    seller_financing_months: z.coerce.number().optional(),
    seller_financing_start_month: z.coerce.number().default(1),
    seller_financing_periodicity: z.enum(['monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual']).default('monthly'),
    seller_financing_amortization: z.enum(['amortized', 'interest_only']).default('amortized'),

    // Swap Details
    jv_percent: z.coerce.number().optional(),

    // Brokerage
    broker_name: z.string().optional(),
    broker_company: z.string().optional(),
    broker_email: z.string().email().optional().or(z.literal('')),
    broker_phone: z.string().optional(),
    broker_commission_percent: z.coerce.number().optional(),
    broker_commission_amount: z.coerce.number().optional(),

    // Closing Costs
    closing_costs_total: z.coerce.number().optional(),

    // Timeline
    earnest_money_deposit: z.coerce.number().optional(),
    due_diligence_period_days: z.coerce.number().optional(),
    closing_period_days: z.coerce.number().optional(),
    pursuit_budget: z.coerce.number().optional(),

    // Zoning
    far_utilization: z.coerce.number().optional(),
    notes: z.string().optional(),
});

const completeFormSchema = landDetailsSchema.extend({
    owners: z.array(landOwnerSchema)
});

type FormSchema = z.infer<typeof completeFormSchema>;

// --- Component ---

interface LandFormProps {
    projectId: string;
    initialData?: {
        land: LandDetails | null;
        owners: LandOwner[];
    };
    lang: string;
}

export default function LandForm({ projectId, initialData, lang }: LandFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showMissingParticipantsModal, setShowMissingParticipantsModal] = useState(false);

    const dict = dictionary[lang as keyof typeof dictionary] || dictionary.en;

    const defaultValues: Partial<FormSchema> = {
        lot_size_acres: initialData?.land?.lot_size_acres,
        project_type: initialData?.land?.project_type || '',
        has_existing_structure: initialData?.land?.has_existing_structure || false,
        existing_structure_description: initialData?.land?.existing_structure_description || '', demolition_cost_estimate: initialData?.land?.demolition_cost_estimate,

        land_value: initialData?.land?.land_value || 0,
        listing_link: initialData?.land?.listing_link || '',
        market_valuation: initialData?.land?.market_valuation,
        acquisition_method: (initialData?.land?.acquisition_method as AcquisitionMethod) || 'cash',
        amount_cash: initialData?.land?.amount_cash || 0,
        amount_seller_financing: initialData?.land?.amount_seller_financing || 0,
        amount_swap_monetary: initialData?.land?.amount_swap_monetary || 0,

        // New fields defaults
        option_fee_amount: initialData?.land?.option_fee_amount,
        option_duration_months: initialData?.land?.option_duration_months,
        lease_initial_rent: initialData?.land?.lease_initial_rent,
        lease_term_years: initialData?.land?.lease_term_years,

        // Flattened nested objects for form handling
        // seller_financing_down_payment: initialData?.land?.seller_financing_terms?.down_payment,
        seller_financing_rate: initialData?.land?.seller_financing_terms?.interest_rate,
        seller_financing_months: initialData?.land?.seller_financing_terms?.term_months,
        seller_financing_start_month: initialData?.land?.seller_financing_terms?.start_month || 1,
        seller_financing_periodicity: initialData?.land?.seller_financing_terms?.periodicity || 'monthly',

        jv_percent: initialData?.land?.swap_details?.percentage,

        broker_name: initialData?.land?.broker_name || '',
        broker_company: initialData?.land?.broker_company || '',
        broker_email: initialData?.land?.broker_email || '',
        broker_phone: initialData?.land?.broker_phone || '',
        broker_commission_percent: initialData?.land?.broker_commission_percent,
        broker_commission_amount: initialData?.land?.broker_commission_amount,

        earnest_money_deposit: initialData?.land?.earnest_money_deposit,
        due_diligence_period_days: initialData?.land?.due_diligence_period_days,
        pursuit_budget: initialData?.land?.pursuit_budget,

        owners: initialData?.owners?.length
            ? initialData.owners.map(o => ({
                ...o,
                ownership_share_percent: o.ownership_share_percent ?? 100
            }))
            : [],

        // New fields
        lot_width: initialData?.land?.lot_width,
        lot_length: initialData?.land?.lot_length,
        parcel_number: initialData?.land?.parcel_number || '',
        subdivision: initialData?.land?.subdivision || '',
        zoning_code: initialData?.land?.zoning_code || '',
        sewer_type: initialData?.land?.sewer_type || '',
        water_type: initialData?.land?.water_type || '',
        hoa_fees_monthly: initialData?.land?.hoa_fees_monthly || 0,
        special_conditions: initialData?.land?.special_conditions || '',
    };

    const form = useForm<FormSchema>({
        resolver: zodResolver(completeFormSchema) as any,
        defaultValues
    });

    const { fields: ownerFields, append, remove } = useFieldArray({
        control: form.control,
        name: "owners"
    });

    // Helper to calculate totals based on method
    const acquisitionMethod = form.watch('acquisition_method');

    // Watchers for Auto-Calculation
    const landValue = form.watch('land_value');
    const commissionPercent = form.watch('broker_commission_percent');

    useEffect(() => {
        if (landValue && commissionPercent) {
            const calculatedCommission = (landValue * commissionPercent) / 100;
            form.setValue('broker_commission_amount', Number(calculatedCommission.toFixed(2)));
        }
    }, [landValue, commissionPercent, form]);

    // Validation: EMD cannot exceed Land Value
    const emdValue = form.watch('earnest_money_deposit');
    useEffect(() => {
        if (landValue && emdValue && emdValue > landValue) {
            // Cap EMD at Land Value
            form.setValue('earnest_money_deposit', landValue);
        }
    }, [landValue, emdValue, form]);



    // Helper to block negative inputs
    const blockInvalidChar = (e: React.KeyboardEvent<HTMLInputElement>) => {
        return ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();
    };

    const formatPhoneNumber = (value: string) => {
        const phone = value.replace(/[^\d]/g, '');
        if (phone.length < 4) return phone;
        if (phone.length < 7) {
            return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
        }
        return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
    };

    const onSubmit = (data: FormSchema) => {
        // Check for missing participants (Soft Warning)
        const hasOwners = data.owners.length > 0;
        const hasBroker = !!data.broker_name;

        if ((!hasOwners || !hasBroker) && !showMissingParticipantsModal) {
            setShowMissingParticipantsModal(true);
            return;
        }

        // Proceed to save
        performSave(data);
    };

    const performSave = (data: FormSchema) => {
        startTransition(async () => {
            try {
                // Map Form Data back to DB Stucture
                const landPayload: Partial<LandDetails> = {
                    lot_size_acres: data.lot_size_acres,
                    has_existing_structure: data.has_existing_structure,
                    existing_structure_description: data.existing_structure_description,
                    demolition_cost_estimate: data.demolition_cost_estimate,
                    land_value: data.land_value,

                    market_valuation: data.market_valuation,
                    amount_cash: data.amount_cash,
                    amount_seller_financing: data.amount_seller_financing,
                    amount_swap_monetary: data.amount_swap_monetary,

                    // New Fields
                    option_fee_amount: data.option_fee_amount,
                    option_duration_months: data.option_duration_months,
                    lease_initial_rent: data.lease_initial_rent,
                    lease_term_years: data.lease_term_years,

                    seller_financing_terms: {
                        // down_payment: data.seller_financing_down_payment,
                        interest_rate: data.seller_financing_rate,
                        term_months: data.seller_financing_months,
                        start_month: data.seller_financing_start_month,
                        periodicity: data.seller_financing_periodicity
                    },
                    swap_details: {
                        type: 'financial', // Defaulting for MVP
                        percentage: data.jv_percent,
                    },
                    broker_name: data.broker_name,
                    broker_company: data.broker_company,
                    broker_email: data.broker_email,
                    broker_phone: data.broker_phone,
                    broker_commission_percent: data.broker_commission_percent,
                    broker_commission_amount: data.broker_commission_amount,
                    earnest_money_deposit: data.earnest_money_deposit,
                    due_diligence_period_days: data.due_diligence_period_days,
                    pursuit_budget: data.pursuit_budget,
                    far_utilization: data.far_utilization,
                    notes: data.notes,
                    listing_link: data.listing_link,
                    contract_structuring_preference: data.contract_structuring_preference,

                    // New Fields
                    lot_width: data.lot_width,
                    lot_length: data.lot_length,
                    parcel_number: data.parcel_number,
                    subdivision: data.subdivision,
                    zoning_code: data.zoning_code,
                    sewer_type: data.sewer_type,
                    water_type: data.water_type,
                    hoa_fees_monthly: data.hoa_fees_monthly,
                    special_conditions: data.special_conditions,
                };

                // Add explicit acquisition method
                landPayload.acquisition_method = data.acquisition_method as AcquisitionMethod;

                const ownersPayload = data.owners.map(o => ({
                    ...o,
                    ownership_share_percent: o.ownership_share_percent
                })) as LandOwner[];

                await saveLandFeasibility(projectId, landPayload, ownersPayload);
                setShowMissingParticipantsModal(false);
                router.refresh();
                alert(dict.save + " - Sucesso!");
            } catch (error) {
                console.error(error);
                alert(`Error saving data: ${(error as Error).message}`);
            }
        });
    };

    return (
        <div className="space-y-8 pb-20">
            {/* 1. MAP SECTION (Full Width) */}
            <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg border border-gray-100 relative group">
                <GoogleMapWrapper>
                    <PropertyMap center={initialData?.land?.latitude && initialData?.land?.longitude ? { lat: initialData.land.latitude, lng: initialData.land.longitude } : undefined} />

                </GoogleMapWrapper>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto">

                {/* 1. LAND CHARACTERISTICS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-cyan-500">1.</span> {lang === 'pt' ? 'Características do Terreno' : lang === 'es' ? 'Características del Terreno' : 'Land Characteristics'}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Physical Facts */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-cyan-900 border-b pb-2 uppercase tracking-wider">
                                {lang === 'pt' ? 'Propriedade e Dimensões' : lang === 'es' ? 'Propiedad y Dimensiones' : 'Property & Dimensions'}
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight block mb-1">{dict.landArea}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        onKeyDown={blockInvalidChar}
                                        {...form.register('lot_size_acres')}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none text-sm"
                                        placeholder="e.g. 2.48"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight block mb-1">
                                        {lang === 'pt' ? 'Largura (Feet)' : lang === 'es' ? 'Ancho (Feet)' : 'Width (Feet)'}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        {...form.register('lot_width')}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none text-sm"
                                        placeholder="165"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight block mb-1">
                                        {lang === 'pt' ? 'Comprimento (Feet)' : lang === 'es' ? 'Largo (Feet)' : 'Length (Feet)'}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        {...form.register('lot_length')}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none text-sm"
                                        placeholder="661"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight block mb-1">
                                        {lang === 'pt' ? 'Número da Parcela (APN)' : lang === 'es' ? 'Número de Parcela' : 'Parcel Number (APN)'}
                                    </label>
                                    <input
                                        {...form.register('parcel_number')}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none text-sm"
                                        placeholder="2527310000311..."
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight block mb-1">
                                        {lang === 'pt' ? 'Loteamento / Subdivisão' : lang === 'es' ? 'Subdivisión' : 'Subdivision'}
                                    </label>
                                    <input
                                        {...form.register('subdivision')}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none text-sm"
                                        placeholder="ACREAGE & UNREC"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Zoning & Utilities */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-cyan-900 border-b pb-2 uppercase tracking-wider">
                                {lang === 'pt' ? 'Zoneamento e Utilidades' : lang === 'es' ? 'Zonificación y Servicios' : 'Zoning & Utilities'}
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight block mb-1">
                                        {lang === 'pt' ? 'Zoneamento' : lang === 'es' ? 'Zonificación' : 'Zoning'}
                                    </label>
                                    <input
                                        {...form.register('zoning_code')}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none text-sm"
                                        placeholder="OAC / ZM"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight block mb-1">
                                        {lang === 'pt' ? 'Esgoto (Sewer)' : lang === 'es' ? 'Alcantarillado' : 'Sewer'}
                                    </label>
                                    <select
                                        {...form.register('sewer_type')}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none text-sm bg-white"
                                    >
                                        <option value="">Select</option>
                                        <option value="public">{lang === 'pt' ? 'Público' : 'Public'}</option>
                                        <option value="septic">{lang === 'pt' ? 'Fossa (Septic)' : 'Septic'}</option>
                                        <option value="none">{lang === 'pt' ? 'Nenhum' : 'None'}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight block mb-1">
                                        {lang === 'pt' ? 'Água (Water)' : lang === 'es' ? 'Agua' : 'Water'}
                                    </label>
                                    <select
                                        {...form.register('water_type')}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none text-sm bg-white"
                                    >
                                        <option value="">Select</option>
                                        <option value="public">{lang === 'pt' ? 'Público' : 'Public'}</option>
                                        <option value="well">{lang === 'pt' ? 'Poço (Well)' : 'Well'}</option>
                                        <option value="none">{lang === 'pt' ? 'Nenhum' : 'None'}</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight block mb-1">
                                        {lang === 'pt' ? 'Taxa Mensal HOA ($)' : 'HOA Monthly Fees ($)'}
                                    </label>
                                    <CurrencyInput
                                        value={form.watch('hoa_fees_monthly')}
                                        onChange={(val) => form.setValue('hoa_fees_monthly', val)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none text-sm"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight block mb-1">
                                        {lang === 'pt' ? 'Condições Especiais' : lang === 'es' ? 'Condiciones Especiales' : 'Special Conditions'}
                                    </label>
                                    <textarea
                                        {...form.register('special_conditions')}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none text-sm resize-none h-16"
                                        placeholder="None / Easements / Wetlands..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Existing Structure - Horizontal Toggle */}
                    <div className="mt-8 pt-8 border-t border-gray-100 pb-2">
                        <div className="p-4 border rounded-xl bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{dict.existingStructure}</p>
                                    <p className="text-xs text-gray-500">{dict.existingStructureHint}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...form.register('has_existing_structure')}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 transition-all"></div>
                            </label>
                        </div>

                        {/* Conditional Fields for Existing Structure */}
                        {form.watch('has_existing_structure') && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">{dict.structureDescription}</label>
                                    <textarea
                                        {...form.register('existing_structure_description')}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none resize-none h-[80px] text-sm"
                                        placeholder={dict.structureDescriptionPlaceholder}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">{dict.demoCost}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                                        <CurrencyInput
                                            value={form.watch('demolition_cost_estimate')}
                                            onChange={(val) => form.setValue('demolition_cost_estimate', val)}
                                            className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none text-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium italic mt-1">{dict.demoCostHint}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Listing Links */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <ListingLinksManager projectId={projectId} lang={lang} />
                    </div>
                </div>

                {/* 2. LAND ACQUISITION & VALUE */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-cyan-500">2.</span> {dict.acquisitionTitle}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{dict.acquisitionPrice}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <CurrencyInput
                                    value={form.watch('land_value')}
                                    onChange={(val) => form.setValue('land_value', val)}
                                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{dict.marketValuation}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <CurrencyInput
                                    value={form.watch('market_valuation')}
                                    onChange={(val) => form.setValue('market_valuation', val)}
                                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{dict.acquisitionMethod}</label>
                            <select
                                {...form.register('acquisition_method')}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none bg-white"
                            >
                                <option value="cash">{dict.methodCash}</option>
                                <option value="seller_financing">{dict.methodSellerFinancing}</option>
                                <option value="jv_unit_swap">{dict.methodUnitSwap}</option>
                                <option value="jv_revenue_share">{dict.methodFinancialSwap}</option>
                                {/* <option value="option_agreement">{dict.methodOption}</option> */}
                                <option value="ground_lease">{dict.methodGroundLease}</option>
                            </select>

                        </div>
                    </div>

                    {/* STANDARD EMD (Sinal) - Moved from Section 3 */}
                    {!['option_agreement', 'ground_lease'].includes(form.watch('acquisition_method')) && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{dict.emd} (Sinal)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                                    <CurrencyInput
                                        value={form.watch('earnest_money_deposit')}
                                        onChange={(val) => form.setValue('earnest_money_deposit', val)}
                                        className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">{dict.emdHint}</p>
                            </div>
                        </div>
                    )}

                    {/* Conditional Fields for Ground Lease */}
                    {form.watch('acquisition_method') === 'ground_lease' && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{dict.initialRent}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                                    <CurrencyInput
                                        value={form.watch('lease_initial_rent')}
                                        onChange={(val) => form.setValue('lease_initial_rent', val)}
                                        className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                        placeholder="5000.00"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{dict.leaseTerm}</label>
                                <input
                                    type="number"
                                    min="1"
                                    onKeyDown={blockInvalidChar}
                                    {...form.register('lease_term_years', { valueAsNumber: true })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                    placeholder="99"
                                />
                            </div>
                        </div>
                    )}

                    {/* Conditional Fields for Seller Financing */}
                    {form.watch('acquisition_method') === 'seller_financing' && (
                        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
                            {/* REMOVED DOWN PAYMENT INPUT */}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{dict.startMonth}</label>
                                <input
                                    type="number"
                                    {...form.register('seller_financing_start_month', { valueAsNumber: true })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                    placeholder="1"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{dict.installments}</label>
                                <input
                                    type="number"
                                    {...form.register('seller_financing_months', { valueAsNumber: true })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                    placeholder="12"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{dict.interestRate}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        {...form.register('seller_financing_rate', { valueAsNumber: true })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                        placeholder="0.0"
                                    />
                                    <span className="absolute right-4 top-2 text-gray-400">%</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{dict.periodicity}</label>
                                <select
                                    {...form.register('seller_financing_periodicity')}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none bg-white"
                                >
                                    <option value="monthly">{dict.perMonthly}</option>
                                    <option value="bimonthly">{dict.perBimonthly}</option>
                                    <option value="quarterly">{dict.perQuarterly}</option>
                                    <option value="annual">{dict.perAnnual}</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{dict.amortizationType}</label>
                                <select
                                    {...form.register('seller_financing_amortization')}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none bg-white"
                                >
                                    <option value="amortized">{dict.amortized}</option>
                                    <option value="interest_only">{dict.interestOnly}</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. OWNERS LIST */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-cyan-500">3.</span> {dict.ownersTitle}
                        </h2>

                        <div className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => form.setValue('contract_structuring_preference', 'grouped')}
                                className={`px-3 py-1 rounded-md transition-all ${form.watch('contract_structuring_preference') === 'grouped'
                                    ? 'bg-white shadow-sm text-cyan-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {dict.prefGrouped}
                            </button>
                            <button
                                type="button"
                                onClick={() => form.setValue('contract_structuring_preference', 'individual')}
                                className={`px-3 py-1 rounded-md transition-all ${form.watch('contract_structuring_preference') === 'individual'
                                    ? 'bg-white shadow-sm text-cyan-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {dict.prefIndividual}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => append({ type: 'entity', name: '', is_primary: false, ownership_share_percent: 100 })}
                            className="bg-cyan-50 text-cyan-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-100 transition-colors"
                        >
                            {dict.addOwner}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {ownerFields.map((field, index) => (
                            <div key={field.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 relative group">
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    {dict.remove}
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">{dict.type}</label>
                                        <select
                                            {...form.register(`owners.${index}.type` as const)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                        >
                                            <option value="individual">{dict.ownerIndividual}</option>
                                            <option value="entity">{dict.ownerEntity}</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-medium text-gray-500">{dict.namePlaceholder}</label>
                                        <input
                                            {...form.register(`owners.${index}.name` as const)}
                                            placeholder={dict.namePlaceholder}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                        />
                                        {form.formState.errors.owners?.[index]?.name && (
                                            <span className="text-red-500 text-xs">{form.formState.errors.owners[index]?.name?.message}</span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">
                                            {form.watch(`owners.${index}.type`) === 'entity' ? 'EIN (Employer ID)' : 'SSN (Social Security)'}
                                        </label>
                                        <input
                                            {...form.register(`owners.${index}.tax_id` as const)}
                                            placeholder={form.watch(`owners.${index}.type`) === 'entity' ? 'XX-XXXXXXX' : 'XXX-XX-XXXX'}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">{dict.email}</label>
                                        <input
                                            {...form.register(`owners.${index}.email` as const)}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">{dict.phone}</label>
                                        <input
                                            {...form.register(`owners.${index}.phone` as const)}
                                            onChange={(e) => {
                                                const formatted = formatPhoneNumber(e.target.value);
                                                form.setValue(`owners.${index}.phone` as const, formatted);
                                            }}
                                            maxLength={14}
                                            placeholder="(555) 555-5555"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">{dict.ownershipShare}</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                {...form.register(`owners.${index}.ownership_share_percent` as const, { valueAsNumber: true })}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-cyan-500 outline-none"
                                            />
                                            <span className="absolute right-3 top-2 text-gray-400 text-xs self-center">%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-500">{dict.shareAmount}</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-2 text-gray-400 text-xs">$</span>
                                            <input
                                                disabled
                                                value={((form.watch('land_value') || 0) * (form.watch(`owners.${index}.ownership_share_percent`) || 0) / 100).toFixed(2)}
                                                className="w-full pl-6 pr-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-100 text-gray-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Total Share Validation Warning */}
                        {(() => {
                            const owners = form.watch('owners') || [];
                            const totalShare = owners.reduce((sum, o) => sum + (Number(o.ownership_share_percent) || 0), 0);
                            if (owners.length > 0 && Math.abs(totalShare - 100) > 0.1) {
                                return (
                                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2 text-orange-700 text-sm animate-fadeIn">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span>
                                            {dict.totalShareWarning} <strong>(Total: {totalShare.toFixed(1)}%)</strong>
                                        </span>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                        {ownerFields.length === 0 && (
                            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                {dict.missingModalText.split('.')[0]}. {dict.addOwner}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. TIMELINE & DEPOSITS (Global Risk Analysis) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-cyan-500">4.</span> {dict.timelineTitle}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{dict.ddPeriod}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    onKeyDown={blockInvalidChar}
                                    {...form.register('due_diligence_period_days')}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                    placeholder="30"
                                />
                                <span className="absolute right-3 top-2 text-gray-400 text-sm">{dict.days}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{dict.pursuit}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <CurrencyInput
                                    value={form.watch('pursuit_budget')}
                                    onChange={(val) => form.setValue('pursuit_budget', val)}
                                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <p className="text-xs text-gray-500">{dict.pursuitHint}</p>
                        </div>
                    </div>
                </div>


                {/* 5. BROKERAGE */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="text-cyan-500">5.</span> {dict.brokerageTitle}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{dict.brokerName}</label>
                            <input
                                {...form.register('broker_name')}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                placeholder={dict.brokerNamePlaceholder}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{dict.brokerCompany}</label>
                            <input
                                {...form.register('broker_company')}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                placeholder={dict.brokerCompanyPlaceholder}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{dict.brokerEmail}</label>
                            <input
                                {...form.register('broker_email')}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                placeholder="email@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{dict.brokerPhone}</label>
                            <input
                                {...form.register('broker_phone')}
                                onChange={(e) => {
                                    const formatted = formatPhoneNumber(e.target.value);
                                    form.setValue('broker_phone', formatted);
                                }}
                                maxLength={14}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                placeholder="(555) 555-5555"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{dict.commission}</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    onKeyDown={blockInvalidChar}
                                    {...form.register('broker_commission_percent', { valueAsNumber: true })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                    placeholder="e.g. 5.0"
                                />
                                <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{dict.commissionAmount}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <CurrencyInput
                                    value={form.watch('broker_commission_amount')}
                                    onChange={(val) => form.setValue('broker_commission_amount', val)}
                                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:border-cyan-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. PAYMENT SCHEDULE PREVIEW */}
                <PaymentSchedulePreview
                    lang={lang}
                    landValue={form.watch('land_value')}
                    emd={form.watch('earnest_money_deposit') || 0}
                    pursuitBudget={form.watch('pursuit_budget') || 0}
                    ddDays={form.watch('due_diligence_period_days') || 0}
                    closingDays={form.watch('closing_period_days') || 0}
                    acquisitionMethod={form.watch('acquisition_method')}
                    sellerFinancing={{
                        // downPayment: form.watch('seller_financing_down_payment'),
                        rate: form.watch('seller_financing_rate'),
                        months: form.watch('seller_financing_months'),
                        startMonth: form.watch('seller_financing_start_month'),
                        periodicity: form.watch('seller_financing_periodicity'),
                        amortization: form.watch('seller_financing_amortization')
                    }}
                    brokerCommissionAmount={form.watch('broker_commission_amount') || 0}
                    closingCosts={form.watch('closing_costs_total') || 0}
                    demolitionCost={form.watch('demolition_cost_estimate') || 0}
                />

                {/* ACTION BAR */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <button
                        type="button"
                        className="px-6 py-2 text-gray-600 font-medium hover:text-gray-900"
                    >
                        {dict.generateLoi}
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-8 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50"
                    >
                        {isPending ? dict.saving : dict.save}
                    </button>
                </div>

                {/* MISSING PARTICIPANTS MODAL */}
                {
                    showMissingParticipantsModal && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{dict.missingModalTitle}</h3>
                                <p className="text-gray-600 text-sm mb-6">
                                    {dict.missingModalText}
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowMissingParticipantsModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                                    >
                                        {dict.goBack}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Trigger submit again skipping check
                                            performSave(form.getValues());
                                        }}
                                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium"
                                    >
                                        {dict.continueAnyway}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </form >
        </div >
    );
}
