'use client';

import { useState, useTransition, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LandDetails, LandOwner, AcquisitionMethod } from '@/lib/types/feasibility';
import { saveLandFeasibility } from '@/lib/actions/feasibility';
import PropertyMap from '@/components/Maps/PropertyMap';
import GoogleMapWrapper from '@/components/Maps/GoogleMapWrapper';
import CurrencyInput from '@/components/ui/CurrencyInput';
import UnitInput from '@/components/ui/UnitInput';
import PaymentSchedulePreview from './PaymentSchedulePreview';
import ListingLinksManager from './ListingLinksManager';
import OwnersForm from './OwnersForm';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// --- Zod Schema ---
// Helper para ownership_share_percent que aceita string durante digitação
const ownershipShareSchema = z.preprocess(
    (val) => {
        // Durante digitação, pode ser string vazia ou string numérica
        if (val === '' || val === null || val === undefined) return undefined;
        // Se já é número, retorna como está
        if (typeof val === 'number') return val;
        // Se é string, tenta converter apenas se não estiver vazia
        if (typeof val === 'string') {
            const num = parseFloat(val);
            return isNaN(num) ? undefined : num;
        }
        return undefined;
    },
    z.number().min(0).max(100).optional()
);

const landOwnerSchema = z.object({
    id: z.string().optional(),
    type: z.enum(['individual', 'entity']),
    name: z.string().min(1, 'Name is required'),
    tax_id: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    is_primary: z.boolean().default(false),
    ownership_share_percent: ownershipShareSchema,
});

// Helper para campos numéricos opcionais que limpa string vazia e 0 se necessário
const optionalNumber = z.preprocess(
    (val) => (val === '' || val === null || val === undefined) ? undefined : Number(val),
    z.number().optional()
);

// Helper para strings opcionais: null ou undefined vira string vazia ou undefined
const optionalString = z.preprocess(
    (val) => (val === null || val === undefined) ? undefined : String(val),
    z.string().optional()
);

const landDetailsSchema = z.object({
    lot_size_acres: optionalNumber,
    project_type: optionalString,
    has_existing_structure: z.boolean().optional(),
    existing_structure_description: optionalString,
    demolition_cost_estimate: optionalNumber,

    // --- OBRIGATÓRIOS ---
    land_value: z.coerce.number()
        .min(0.01, 'Acquisition Price is required'),

    market_valuation: optionalNumber,

    acquisition_method: z.string().min(1, 'Acquisition Method is required'),

    amount_cash: optionalNumber,
    amount_seller_financing: optionalNumber,
    amount_swap_monetary: optionalNumber,
    option_fee_amount: optionalNumber,
    option_duration_months: optionalNumber,
    lease_initial_rent: optionalNumber,
    lease_term_years: optionalNumber,
    seller_financing_rate: optionalNumber,
    seller_financing_months: optionalNumber,
    seller_financing_start_month: optionalNumber,
    seller_financing_periodicity: optionalString,
    seller_financing_amortization: optionalString,
    jv_percent: optionalNumber,
    broker_name: optionalString,
    broker_company: optionalString,
    broker_email: optionalString,
    broker_phone: optionalString,
    broker_commission_percent: optionalNumber,
    broker_commission_amount: optionalNumber,

    earnest_money_deposit: z.coerce.number().min(0, 'EMD (Earnest Money) is required'),

    due_diligence_period_days: optionalNumber,
    closing_period_days: optionalNumber,
    closing_costs_total: optionalNumber,
    pursuit_budget: optionalNumber,
    far_utilization: optionalNumber,
    notes: optionalString,
    listing_link: optionalString,
    contract_structuring_preference: z.enum(['grouped', 'individual']).optional().default('grouped'),
    lot_width: optionalNumber,
    lot_length: optionalNumber,
    parcel_number: optionalString,
    subdivision: optionalString,
    zoning_code: optionalString,
    sewer_type: optionalString,
    water_type: optionalString,
    hoa_fees_monthly: optionalNumber,
    special_conditions: optionalString,
});

const completeFormSchema = landDetailsSchema.extend({
    owners: z.array(landOwnerSchema)
});

type FormSchema = z.infer<typeof completeFormSchema>;

interface LandFormProps {
    projectId: string;
    initialData?: {
        land: LandDetails | null;
        owners: LandOwner[];
    };
    lang: string;
    dictionary: any;
}

// Componente isolado para PaymentSchedulePreview - evita re-renders do formulário principal
function PaymentSchedulePreviewMemoized({ 
    lang, 
    control 
}: { 
    lang: string; 
    control: ReturnType<typeof useForm<FormSchema>>['control'];
}) {
    // useWatch é mais eficiente que form.watch() - só re-renderiza quando valores específicos mudam
    const landValue = useWatch({ control, name: 'land_value' }) || 0;
    const emd = useWatch({ control, name: 'earnest_money_deposit' }) || 0;
    const pursuitBudget = useWatch({ control, name: 'pursuit_budget' }) || 0;
    const ddDays = useWatch({ control, name: 'due_diligence_period_days' }) || 0;
    const closingDays = useWatch({ control, name: 'closing_period_days' }) || 0;
    const acquisitionMethod = useWatch({ control, name: 'acquisition_method' }) as any;
    const sellerFinancingRate = useWatch({ control, name: 'seller_financing_rate' });
    const sellerFinancingMonths = useWatch({ control, name: 'seller_financing_months' });
    const sellerFinancingStartMonth = useWatch({ control, name: 'seller_financing_start_month' });
    const sellerFinancingPeriodicity = useWatch({ control, name: 'seller_financing_periodicity' }) as any;
    const sellerFinancingAmortization = useWatch({ control, name: 'seller_financing_amortization' }) as any;
    const brokerCommissionAmount = useWatch({ control, name: 'broker_commission_amount' }) || 0;
    const closingCosts = useWatch({ control, name: 'closing_costs_total' }) || 0;
    const demolitionCost = useWatch({ control, name: 'demolition_cost_estimate' }) || 0;

    // Memoiza o objeto sellerFinancing para evitar recriação desnecessária
    const sellerFinancing = useMemo(() => ({
        rate: sellerFinancingRate,
        months: sellerFinancingMonths,
        startMonth: sellerFinancingStartMonth,
        periodicity: sellerFinancingPeriodicity,
        amortization: sellerFinancingAmortization
    }), [sellerFinancingRate, sellerFinancingMonths, sellerFinancingStartMonth, sellerFinancingPeriodicity, sellerFinancingAmortization]);

    return (
        <PaymentSchedulePreview
            lang={lang}
            landValue={landValue}
            emd={emd}
            pursuitBudget={pursuitBudget}
            ddDays={ddDays}
            closingDays={closingDays}
            acquisitionMethod={acquisitionMethod}
            sellerFinancing={sellerFinancing}
            brokerCommissionAmount={brokerCommissionAmount}
            closingCosts={closingCosts}
            demolitionCost={demolitionCost}
        />
    );
}

export default function LandForm({ projectId, initialData, lang, dictionary }: LandFormProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [isPending, startTransition] = useTransition();
    const [showMissingParticipantsModal, setShowMissingParticipantsModal] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
    const [lastError, setLastError] = useState<string>('');

    const dict = dictionary?.feasibility?.land || {};

    // Memoizar sanitizedLandData para evitar recriação a cada render
    const sanitizedLandData = useMemo(() => {
        if (!initialData?.land) return {};
        return Object.fromEntries(
            Object.entries(initialData.land).map(([k, v]) => [k, v === null ? undefined : v])
        );
    }, [initialData?.land]);

    // Memoizar owners array para evitar recriação a cada render
    const initialOwners = useMemo(() => {
        return initialData?.owners || [];
    }, [initialData?.owners]);

    // Memoizar defaultValues para evitar recriação a cada render
    // Isso é CRÍTICO para evitar que o form reaplique valores padrão durante digitação
    const defaultValues = useMemo(() => ({
        ...sanitizedLandData,
        acquisition_method: (sanitizedLandData as any).acquisition_method || 'cash',
        owners: initialOwners,
        contract_structuring_preference: (sanitizedLandData as any).contract_structuring_preference || 'grouped'
    }), [sanitizedLandData, initialOwners]);

    // Ref para rastrear se o form já foi inicializado
    const formInitializedRef = useRef(false);

    const form = useForm<FormSchema>({
        resolver: zodResolver(completeFormSchema) as any,
        mode: 'onBlur', // Valida apenas no blur, não durante digitação
        shouldFocusError: false, // Impede o scroll automático para o erro
        defaultValues: defaultValues
    });

    // Marcar form como inicializado após primeira renderização
    useEffect(() => {
        if (!formInitializedRef.current) {
            formInitializedRef.current = true;
        }
    }, []);

    // Sincronizar initialData apenas quando mudar externamente (ex: após router.refresh())
    // IMPORTANTE: Não sincroniza durante digitação ativa - apenas quando necessário
    const prevInitialDataRef = useRef(initialData);
    useEffect(() => {
        // Só sincroniza se initialData mudou E form já foi inicializado
        // E não está em modo de edição (verifica se há mudanças não salvas)
        if (!formInitializedRef.current) {
            prevInitialDataRef.current = initialData;
            return;
        }
        
        const prevData = prevInitialDataRef.current;
        const currentData = initialData;
        
        // Verifica se initialData realmente mudou (comparação de referência)
        if (prevData !== currentData && currentData) {
            // Só atualiza se o usuário não está editando ativamente
            // Verifica se há campos "dirty" (modificados)
            const isDirty = form.formState.isDirty;
            
            // Se não está dirty, pode sincronizar com segurança
            if (!isDirty) {
                form.reset({
                    ...sanitizedLandData,
                    acquisition_method: (sanitizedLandData as any).acquisition_method || 'cash',
                    owners: initialOwners,
                    contract_structuring_preference: (sanitizedLandData as any).contract_structuring_preference || 'grouped'
                });
            }
        }
        
        prevInitialDataRef.current = currentData;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData, sanitizedLandData, initialOwners]);

    // useFieldArray - mantém campos estáveis através de IDs quando disponíveis
    // O react-hook-form usa automaticamente 'id' como key se presente no objeto
    // Removido: ownerFields, append, remove - agora no OwnersForm isolado
    // const { fields: ownerFields, append, remove } = useFieldArray({
    //     control: form.control,
    //     name: "owners"
    // });

    const onInvalid = (errors: any) => {
        // Log seguro que evita erro de estrutura circular
        console.group('Form Validation Debug');
        try {
            // Extrai apenas as chaves e mensagens, ignorando referencias DOM
            const simpleErrors: Record<string, string> = {};

            const visitError = (errObj: any, path: string = '') => {
                if (!errObj) return;
                if (errObj.message && typeof errObj.message === 'string') {
                    simpleErrors[path] = errObj.message;
                } else if (typeof errObj === 'object') {
                    Object.keys(errObj).forEach(key => {
                        // Evita navegar em propertiedades do React como 'ref'
                        if (key !== 'ref' && key !== 'types') {
                            visitError(errObj[key], path ? `${path}.${key}` : key);
                        }
                    });
                }
            };
            visitError(errors);
            console.log('Active Validation Errors:', simpleErrors);
        } catch (e) {
            console.error('Could not parse errors', e);
        }
        console.groupEnd();

        const extractMessages = (obj: any, path: string = ''): { path: string, message: string }[] => {
            let results: { path: string, message: string }[] = [];
            if (!obj || typeof obj !== 'object') return results;

            if (obj.message && typeof obj.message === 'string') {
                results.push({ path, message: obj.message });
            } else {
                Object.entries(obj).forEach(([key, val]) => {
                    const newPath = path ? `${path}.${key}` : key;
                    results.push(...extractMessages(val, newPath));
                });
            }
            return results;
        };

        const errorDetails = extractMessages(errors);

        // Usar dicionario para labels
        const fieldLabels: Record<string, string> = {
            'lot_size_acres': dict.lot_area || 'Lot Area',
            'land_value': dict.land_value || 'Acquisition Price',
            'acquisition_method': dict.method || 'Acquisition Method',
            'earnest_money_deposit': dict.emd || 'EMD (Earnest Money)'
        };

        // Filtramos apenas erros reais (que possuem mensagem)
        const activeErrors = errorDetails.filter(e => e.message);

        // Mensagens localizadas
        const msgPrefix = {
            pt: "Campos obrigatórios: ",
            en: "Required fields: ",
            es: "Campos obligatorios: "
        }[lang as string] || "Required fields: ";

        const msgDefault = {
            pt: "Por favor, preencha Preço, Método e Sinal para salvar.",
            en: "Please fill in Price, Method, and EMD to save.",
            es: "Por favor, complete Precio, Método y Señal para guardar."
        }[lang as string] || "Please fill in Price, Method, and EMD to save.";

        const finalMessage = activeErrors.length > 0
            ? msgPrefix + [...new Set(activeErrors.map(e => {
                const parts = e.path.split('.');
                const lastPart = parts[parts.length - 1];
                return fieldLabels[lastPart] || lastPart;
            }))].join(', ')
            : msgDefault;

        setLastError(finalMessage);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 5000);
    };

    const onSubmit = (data: FormSchema) => {
        const hasOwners = data.owners.length > 0;
        const hasBroker = !!data.broker_name;

        if ((!hasOwners || !hasBroker) && !showMissingParticipantsModal) {
            setShowMissingParticipantsModal(true);
            return;
        }
        performSave(data);
    };

    const performSave = (data: FormSchema) => {
        startTransition(async () => {
            try {
                const landPayload = { ...data };
                delete (landPayload as any).owners;

                await saveLandFeasibility(projectId, landPayload as any, data.owners as any);
                setShowMissingParticipantsModal(false);
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000);
                
                // Delay router.refresh() para evitar reset durante digitação
                // Aguarda 3 segundos (tempo do toast) antes de recarregar
                setTimeout(() => {
                    router.refresh();
                }, 3000);
            } catch (error) {
                console.error(error);
                setLastError((error as Error).message);
                setSaveStatus('error');
                setTimeout(() => setSaveStatus(null), 5000);
            }
        });
    };

    const blockInvalidChar = (e: React.KeyboardEvent<HTMLInputElement>) => {
        return ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();
    };

    const formatPhoneNumber = (value: string) => {
        const phone = value.replace(/[^\d]/g, '');
        if (phone.length < 4) return phone;
        if (phone.length < 7) return `(${phone.slice(0, 3)}) ${phone.slice(3)}`;
        return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
    };

    // Helper para classes de erro
    const getFieldClass = (hasError: boolean, baseClass: string = "bg-gray-50/50 border-transparent") => {
        if (hasError) return "bg-red-50 border-red-500 ring-4 ring-red-500/10 text-red-900 placeholder:text-red-300";
        return baseClass;
    }

    return (
        <div className="space-y-8 pb-40 animate-fadeIn">
            {/* 1. MAP SECTION */}
            <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md border border-gray-300 relative group">
                <GoogleMapWrapper>
                    <PropertyMap center={initialData?.land?.latitude && initialData?.land?.longitude ? { lat: initialData.land.latitude, lng: initialData.land.longitude } : undefined} />
                </GoogleMapWrapper>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8 max-w-6xl mx-auto">
                {/* 1. Land Characteristics */}
                <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                            {dict.physical_data || 'Land Characteristics'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Property & Dimensions */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-300 pb-2 inline-block">
                                    {dict.property_dimensions || 'PROPERTY & DIMENSIONS'}
                                </h3>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{dict.lot_area || 'Lot Area (Acres)'}</label>
                                        <UnitInput
                                            value={form.watch('lot_size_acres') ?? undefined}
                                            onChange={(val) => form.setValue('lot_size_acres', val)}
                                            unit="Acres"
                                            step={0.01}
                                            precision={2}
                                            min={0}
                                            className="w-full px-4 py-2 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none"
                                            placeholder="e.g. 2.48"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.width || 'Width (ft)'}</label>
                                        <UnitInput
                                            value={form.watch('lot_width') ?? undefined}
                                            onChange={(val) => form.setValue('lot_width', val)}
                                            unit="ft"
                                            min={0}
                                            precision={0}
                                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.length || 'Length (ft)'}</label>
                                        <UnitInput
                                            value={form.watch('lot_length') ?? undefined}
                                            onChange={(val) => form.setValue('lot_length', val)}
                                            unit="ft"
                                            min={0}
                                            precision={0}
                                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.parcel_number || 'Parcel Number (APN)'}</label>
                                        <input {...form.register('parcel_number')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none" placeholder="2527310000311..." />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.subdivision || 'Subdivision'}</label>
                                        <input {...form.register('subdivision')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none" placeholder="ACREAGE & UNREC" />
                                    </div>
                                </div>
                            </div>

                            {/* Zoning & Utilities */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-300 pb-2 inline-block">
                                    {dict.zoning_utilities || 'ZONING & UTILITIES'}
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.zoning_code || 'Zoning Code'}</label>
                                        <input {...form.register('zoning_code')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none" placeholder="OAC / ZM" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.sewer || 'Sewer'}</label>
                                            <select {...form.register('sewer_type')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none appearance-none cursor-pointer">
                                                <option value="">{dict.none || 'None'}</option>
                                                <option value="public">{dict.public_sewer || 'Public'}</option>
                                                <option value="septic">{dict.septic_sewer || 'Septic'}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.water || 'Water'}</label>
                                            <select {...form.register('water_type')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none appearance-none cursor-pointer">
                                                <option value="">{dict.none || 'None'}</option>
                                                <option value="public">{dict.public_water || 'Public'}</option>
                                                <option value="well">{dict.well_water || 'Well'}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.hoa_fees || 'HOA Monthly Fees ($)'}</label>
                                        <CurrencyInput value={form.watch('hoa_fees_monthly') ?? undefined} onChange={(val) => form.setValue('hoa_fees_monthly', val)} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                                        <div className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-base">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">{dict.existing_structure || 'Existing Structure on Site?'}</h4>
                                    <p className="text-xs font-normal text-gray-500">{dict.existing_structure_hint || 'Impacts demolition costs.'}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => form.setValue('has_existing_structure', !form.watch('has_existing_structure'))}
                                className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 ${form.watch('has_existing_structure') ? 'bg-cyan-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white transition-all shadow-md ${form.watch('has_existing_structure') ? 'translate-x-7' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        {form.watch('has_existing_structure') && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 pb-2 overflow-hidden">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{dict.existing_structure_desc || 'Structure Description'}</label>
                                    <input {...form.register('existing_structure_description')} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-cyan-500/20 focus:bg-white transition-all font-bold text-gray-900 outline-none" placeholder="e.g. Old warehouse" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{dict.demolition_cost || 'Demolition Cost Estimate ($)'}</label>
                                    <CurrencyInput value={form.watch('demolition_cost_estimate') ?? undefined} onChange={(val) => form.setValue('demolition_cost_estimate', val)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-cyan-500/20 focus:bg-white transition-all font-bold text-gray-900 outline-none" />
                                </div>
                            </motion.div>
                        )}

                        {/* Listing Links - Moved inside Section 1 */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <ListingLinksManager
                                projectId={projectId}
                                initialLinks={initialData?.land?.listing_link ? [initialData.land.listing_link] : []}
                                onLinksChange={(links: string[]) => form.setValue('listing_link', links[0] || '')}
                                lang={lang}
                            />
                        </div>
                    </div>
                </section>
                {/* 2. Land Acquisition & Value */}
                <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative overflow-hidden">

                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                        {dict.acquisition_value || 'Land Acquisition & Value'}
                    </h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1">
                                        <label className={`text-[10px] font-semibold uppercase tracking-wide block mb-2 ${form.formState.errors.land_value ? 'text-red-500' : 'text-gray-500'}`}>{dict.land_value || 'Acquisition Price / Ask ($)'}</label>
                                        <CurrencyInput
                                            value={form.watch('land_value') ?? undefined}
                                            onChange={(val) => form.setValue('land_value', val)}
                                            locale={lang}
                                            className={`w-full px-4 py-2.5 rounded-lg border transition-all font-normal text-base outline-none ${getFieldClass(!!form.formState.errors.land_value, "bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900")}`}
                                            placeholder="$ 0"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.market_valuation || 'Market Valuation ($)'}</label>
                                        <CurrencyInput
                                            value={form.watch('market_valuation') ?? undefined}
                                            onChange={(val) => form.setValue('market_valuation', val)}
                                            locale={lang}
                                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-base text-gray-900 outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className={`text-[10px] font-semibold uppercase tracking-wide block mb-2 ${form.formState.errors.acquisition_method ? 'text-red-500' : 'text-gray-500'}`}>{dict.method || 'Acquisition Method'}</label>
                                        <select
                                            {...form.register('acquisition_method')}
                                            className={`w-full px-4 py-2.5 rounded-lg border transition-all font-normal outline-none appearance-none cursor-pointer ${getFieldClass(!!form.formState.errors.acquisition_method, "bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900")}`}
                                        >
                                            <option value="cash">{dict.cash || 'Direct Purchase (Cash)'}</option>
                                            <option value="seller_financing">{dict.seller_financing || 'Seller Financing'}</option>
                                            <option value="option_agreement">{dict.option_agreement || 'Option Agreement'}</option>
                                            <option value="jv_unit_swap">{dict.jv_unit_swap || 'Unit Swap (JV)'}</option>
                                            <option value="jv_revenue_share">{dict.jv_revenue_share || 'Revenue Share JV (%)'}</option>
                                            <option value="ground_lease">{dict.ground_lease || 'Ground Lease'}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`text-[10px] font-semibold uppercase tracking-wide block mb-2 ${form.formState.errors.earnest_money_deposit ? 'text-red-500' : 'text-gray-500'}`}>{dict.emd || 'EMD (Earnest Money)'}</label>
                                        <CurrencyInput
                                            value={form.watch('earnest_money_deposit') ?? undefined}
                                            onChange={(val) => form.setValue('earnest_money_deposit', val, { shouldValidate: true, shouldDirty: true })}
                                            locale={lang}
                                            className={`w-full px-4 py-2.5 rounded-lg border transition-all font-normal text-base outline-none ${getFieldClass(!!form.formState.errors.earnest_money_deposit, "bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900")}`}
                                            placeholder="$ 0"
                                        />
                                        <p className="text-[10px] font-semibold uppercase tracking-wide pl-0 mt-1 text-gray-500">{dict.emd_hint || 'REFUNDABLE DEPOSIT (DAY 0)'}</p>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.closing_costs || 'Estimated Closing Costs ($)'}</label>
                                        <CurrencyInput
                                            value={form.watch('closing_costs_total') ?? undefined}
                                            onChange={(val) => form.setValue('closing_costs_total', val)}
                                            locale={lang}
                                            className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none"
                                            placeholder="0"
                                        />
                                        <p className="text-[10px] font-semibold uppercase tracking-wide pl-0 mt-1 text-gray-500">{dict.closing_costs_hint || 'TAXES, RECORDING, TITLE, ETC.'}</p>
                                    </div>
                                </div>

                                {/* Conditional: Seller Financing Details */}
                                {form.watch('acquisition_method') === 'seller_financing' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-lg bg-blue-50 border border-blue-200 space-y-6">
                                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">{dict.seller_financing_title || 'Seller Financing Terms'}</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.seller_financing_rate || 'Rate (%)'}</label>
                                                <input type="number" step="0.1" min={0} {...form.register('seller_financing_rate')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal text-gray-900 outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.seller_financing_months || 'Months'}</label>
                                                <input type="number" min={0} {...form.register('seller_financing_months')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal text-gray-900 outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.seller_financing_start_month || 'Grace (Months)'}</label>
                                                <input type="number" min={0} {...form.register('seller_financing_start_month')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal text-gray-900 outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.seller_financing_amortization || 'Amortization'}</label>
                                                <select {...form.register('seller_financing_amortization')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal text-gray-900 outline-none">
                                                    <option value="interest_only">{dict.interest_only || 'Interest Only'}</option>
                                                    <option value="amortized">{dict.amortized || 'Amortized'}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Conditional: Option / Ground Lease */}
                                {(form.watch('acquisition_method') === 'option_agreement' || form.watch('acquisition_method') === 'ground_lease') && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-lg bg-blue-50 border border-blue-200 space-y-6">
                                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">{dict.option_lease_title || 'Terms'}</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            {form.watch('acquisition_method') === 'option_agreement' && (
                                                <>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.option_fee || 'Option Fee'}</label>
                                                        <CurrencyInput value={form.watch('option_fee_amount') ?? undefined} onChange={(val) => form.setValue('option_fee_amount', val)} locale={lang} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal text-gray-900 outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.option_duration || 'Duration (Months)'}</label>
                                                        <input type="number" {...form.register('option_duration_months')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal text-gray-900 outline-none" />
                                                    </div>
                                                </>
                                            )}
                                            {form.watch('acquisition_method') === 'ground_lease' && (
                                                <>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.lease_rent || 'Initial Rent'}</label>
                                                        <CurrencyInput value={form.watch('lease_initial_rent') ?? undefined} onChange={(val) => form.setValue('lease_initial_rent', val)} locale={lang} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal text-gray-900 outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.lease_term || 'Term (Years)'}</label>
                                                        <input type="number" {...form.register('lease_term_years')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-normal text-gray-900 outline-none" />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </section>

                {/* 3. Sellers (Owners) - Isolated Component */}
                <OwnersForm
                    initialOwners={form.getValues('owners')}
                    onOwnersChange={(owners) => {
                        form.setValue('owners', owners);
                    }}
                    dict={dict}
                />

                {/* 4 & 5 Combined Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 4. Timeline & Risk */}
                    <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                            {dict.timeline_risk_title || 'Timeline & Deposits (Risk)'}
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.due_diligence_days || 'Due Diligence Period'}</label>
                                <UnitInput
                                    value={form.watch('due_diligence_period_days') ?? undefined}
                                    onChange={(val) => form.setValue('due_diligence_period_days', val)}
                                    unit="Days"
                                    min={0}
                                    precision={0}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none"
                                    placeholder="30"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.closing_period_days || 'Closing Period (Post DD)'}</label>
                                <UnitInput
                                    value={form.watch('closing_period_days') ?? undefined}
                                    onChange={(val) => form.setValue('closing_period_days', val)}
                                    unit="Days"
                                    min={0}
                                    precision={0}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none"
                                    placeholder="15"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.pursuit_budget || 'Pursuit Budget (Soft Costs)'}</label>
                                <div className="space-y-2">
                                    <CurrencyInput value={form.watch('pursuit_budget') ?? undefined} onChange={(val) => form.setValue('pursuit_budget', val)} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none" />
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide pl-0">{dict.pursuit_budget_hint || 'Budget for Due Diligence (Risky)'}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. Brokerage */}
                    <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                            {dict.brokerage_title || 'Brokerage'}
                        </h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.broker_name_label || 'Broker Name'}</label>
                                <input {...form.register('broker_name')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none" placeholder="Name" />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.broker_agency || 'Agency'}</label>
                                <input {...form.register('broker_company')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none" placeholder="Company" />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.broker_phone || 'Phone'}</label>
                                <input {...form.register('broker_phone')} onChange={(e) => form.setValue('broker_phone', formatPhoneNumber(e.target.value))} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none" placeholder="(555) 000-0000" />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.broker_commission_pct || 'Commission %'}</label>
                                <input type="number" min={0} step="0.01" {...form.register('broker_commission_percent')} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">{dict.broker_commission_amt || 'Commission Amount ($)'}</label>
                                <CurrencyInput value={form.watch('broker_commission_amount') ?? undefined} onChange={(val) => form.setValue('broker_commission_amount', val)} className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none" />
                            </div>
                        </div>
                    </section>
                </div>

                {/* 6. Notes */}
                <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                        {dict.notes_title || 'General Notes & Observations'}
                    </h2>
                    <textarea
                        {...form.register('notes')}
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal text-gray-900 outline-none resize-none"
                        placeholder={dict.notes_placeholder || "Describe details..."}
                    />
                </section>

                {/* Projected Payment Schedule - Isolado para evitar re-renders do formulário */}
                <div className="mt-8">
                    <PaymentSchedulePreviewMemoized
                        lang={lang}
                        control={form.control}
                    />
                </div>

            </form>

            {/* Premium Fixed Bottom Bar - Portaled */}
            {mounted && createPortal(
                <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200 shadow-[0_-10px_50px_rgba(0,0,0,0.05)] z-[40] animate-slideUp">
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-end">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    // Reset completo incluindo owners para evitar inconsistências
                                    form.reset({
                                        ...sanitizedLandData,
                                        acquisition_method: (sanitizedLandData as any).acquisition_method || 'cash',
                                        owners: initialOwners,
                                        contract_structuring_preference: (sanitizedLandData as any).contract_structuring_preference || 'grouped'
                                    });
                                    setSaveStatus(null);
                                }}
                                className="px-8 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-all text-sm"
                            >
                                {dict.cancel || 'Cancelar'}
                            </button>
                            <button
                                onClick={form.handleSubmit(onSubmit, onInvalid)}
                                disabled={isPending}
                                className="px-10 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-3 text-sm"
                            >
                                {isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : null}
                                {isPending ? (dict.saving || 'Salvando...') : (dict.save || 'Salvar Alterações')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Save Status Toast - Portaled */}
            {
                mounted && createPortal(
                    <AnimatePresence>
                        {saveStatus && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, x: '-50%' }}
                                animate={{ opacity: 1, y: 0, x: '-50%' }}
                                exit={{ opacity: 0, scale: 0.95, y: 50, x: '-50%' }}
                                className={`fixed bottom-10 left-1/2 z-[9999] px-6 py-4 rounded-lg shadow-lg border flex items-center gap-4 min-w-[320px] ${saveStatus === 'success'
                                    ? 'bg-gray-900 border-blue-600/30 text-white'
                                    : 'bg-red-50 border-red-200 text-red-900'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${saveStatus === 'success' ? 'bg-blue-600 text-white' : 'bg-red-200 text-red-600'}`}>
                                    {saveStatus === 'success' ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold uppercase tracking-wide text-[10px] opacity-60">{saveStatus === 'success' ? (dict.success_title || 'Success') : (dict.error_title || 'Error')}</span>
                                    <span className="font-normal text-sm">{saveStatus === 'success' ? (dict.saved_message || 'Changes saved!') : lastError}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }

            {/* Warning Modal - Portaled */}
            {
                mounted && createPortal(
                    <AnimatePresence>
                        {showMissingParticipantsModal && (
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMissingParticipantsModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-lg shadow-lg relative w-full max-w-lg p-6 overflow-hidden border border-gray-200">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{dict.missing_participants_title || 'Missing Participants'}</h3>
                                    <p className="text-gray-600 mb-6 leading-relaxed font-normal">{dict.missing_participants_desc || 'You have not added any Owner or Broker. While optional, missing this information will prevent automatic generation of Contracts and Letters of Intent (LOI).'}</p>
                                    <div className="flex gap-4">
                                        <button onClick={() => setShowMissingParticipantsModal(false)} className="flex-1 py-2.5 px-6 rounded-lg border border-gray-300 text-gray-600 font-semibold uppercase tracking-wide text-xs hover:bg-gray-50 transition-all">{dict.go_back || 'Go Back'}</button>
                                        <button onClick={() => performSave(form.getValues())} className="flex-1 py-2.5 px-6 rounded-lg bg-blue-600 text-white font-semibold uppercase tracking-wide text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">{dict.continue_anyway || 'Continue Anyway'}</button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }
        </div >
    );
}
