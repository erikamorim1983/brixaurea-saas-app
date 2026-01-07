'use client';

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useMemo, useRef } from "react";
import { format, addMonths, startOfMonth, differenceInMonths, isValid, parseISO } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

interface MacroScheduleConfigProps {
    project: any;
    lang: string;
    dictionary: any;
    initialLandData: { due_diligence_period_days: number; closing_period_days: number; } | null;
}

interface FinancialScenario {
    id?: string;
    study_date: string;
    land_purchase_date: string; // Real signature date (CONTRATO ASSINADO EM)
    incorp_dd_start_offset: number;
    incorp_closing_start_offset: number;
    incorp_projects_months: number;
    incorp_projects_start_offset: number;
    incorp_permits_months: number;
    incorp_permits_start_offset: number;
    financing_months: number;
    financing_start_offset: number;
    construction_pre_months: number;
    construction_pre_start_offset: number;
    construction_main_months: number;
    construction_main_start_offset: number;
    sales_duration_months: number;
    sales_start_offset: number;
    delivery_months: number;
    delivery_start_offset: number;
}

export default function MacroScheduleConfig({ project, lang, dictionary, initialLandData }: MacroScheduleConfigProps) {
    const supabase = createClient();
    const roadmapScrollRef = useRef<HTMLDivElement>(null);
    const headerScrollRef = useRef<HTMLDivElement>(null);
    const actualProject = project?.project || project;
    const projectId = actualProject?.id;
    const [loading, setLoading] = useState(true);
    const [scenarioId, setScenarioId] = useState<string | null>(null);
    const [landData, setLandData] = useState<any>(initialLandData || { due_diligence_period_days: 0, closing_period_days: 0 });
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const [schedule, setSchedule] = useState<FinancialScenario>({
        study_date: format(new Date(), 'yyyy-MM-dd'),
        land_purchase_date: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
        incorp_dd_start_offset: 0,
        incorp_closing_start_offset: 2,
        incorp_projects_months: 4,
        incorp_projects_start_offset: 3,
        incorp_permits_months: 6,
        incorp_permits_start_offset: 0,
        financing_months: 3,
        financing_start_offset: 4,
        construction_pre_months: 2,
        construction_pre_start_offset: 6,
        construction_main_months: 16,
        construction_main_start_offset: 8,
        sales_duration_months: 24,
        sales_start_offset: 6,
        delivery_months: 2,
        delivery_start_offset: 24
    });

    const dict = dictionary.analysis?.schedule || dictionary.schedule || {};

    const dateLocale = useMemo(() => {
        if (lang === 'pt') return ptBR;
        if (lang === 'es') return es;
        return enUS;
    }, [lang]);

    const safeFormat = (dateStr: string, formatStr: string, options?: any) => {
        try {
            const date = parseISO(dateStr);
            if (!isValid(date)) return "---";
            return format(date, formatStr, options);
        } catch (e) {
            return "---";
        }
    };

    useEffect(() => {
        const header = headerScrollRef.current;
        const body = roadmapScrollRef.current;
        if (!header || !body) return;
        const syncH = () => { if (body.scrollLeft !== header.scrollLeft) body.scrollLeft = header.scrollLeft; };
        const syncB = () => { if (header.scrollLeft !== body.scrollLeft) header.scrollLeft = body.scrollLeft; };
        header.addEventListener('scroll', syncH);
        body.addEventListener('scroll', syncB);
        return () => { header.removeEventListener('scroll', syncH); body.removeEventListener('scroll', syncB); };
    }, [loading]);

    useEffect(() => {
        if (!projectId) return;
        const load = async () => {
            // Fetch all scenarios to find the base one (handle localization)
            const { data: scenarios } = await supabase
                .from('financial_scenarios')
                .select('*')
                .eq('project_id', projectId);

            // Prioritize scenario_type, fallback to name-based logic
            const scenario = scenarios?.find(s => s.scenario_type === 'base') ||
                scenarios?.find(s => s.name === (dictionary.analysis?.units?.scenarios?.base || 'Base Case')) ||
                scenarios?.find(s => s.name === 'Base Case') ||
                scenarios?.[0];

            if (scenario) {
                setScenarioId(scenario.id);
                const { data: land } = await supabase.from('land_details').select('due_diligence_period_days, closing_period_days').eq('project_id', projectId).maybeSingle();
                if (land) setLandData(land);

                const landDDMonths = land?.due_diligence_period_days ? Math.ceil(land.due_diligence_period_days / 30) : 2;
                const studyDate = scenario.study_date || format(new Date(), 'yyyy-MM-dd');
                const closingEnd = scenario.land_purchase_date
                    ? differenceInMonths(new Date(scenario.land_purchase_date), startOfMonth(new Date(studyDate)))
                    : landDDMonths + 1;

                setSchedule({
                    study_date: studyDate,
                    land_purchase_date: scenario.land_purchase_date || format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
                    incorp_dd_start_offset: scenario.incorp_dd_start_offset ?? 0,
                    incorp_closing_start_offset: scenario.incorp_closing_start_offset ?? landDDMonths,
                    incorp_projects_months: scenario.incorp_projects_months ?? 4,
                    incorp_projects_start_offset: scenario.incorp_projects_start_offset ?? Math.max(0, closingEnd),
                    incorp_permits_months: scenario.incorp_permits_months ?? 6,
                    incorp_permits_start_offset: scenario.incorp_permits_start_offset ?? 0,
                    financing_months: scenario.financing_months ?? 3,
                    financing_start_offset: scenario.financing_start_offset ?? 4,
                    construction_pre_months: scenario.construction_pre_months ?? 2,
                    construction_pre_start_offset: scenario.construction_pre_start_offset ?? 6,
                    construction_main_months: scenario.construction_main_months ?? 16,
                    construction_main_start_offset: scenario.construction_main_start_offset ?? 8,
                    sales_duration_months: scenario.sales_duration_months ?? 24,
                    sales_start_offset: scenario.sales_start_offset ?? 6,
                    delivery_months: scenario.delivery_months ?? 2,
                    delivery_start_offset: scenario.delivery_start_offset ?? 24
                });
            }
            setLoading(false);
        };
        load();
    }, [projectId, supabase]);

    const handleSave = async () => {
        if (!scenarioId) return;
        setSaving(true);
        setSaveStatus('idle');

        try {
            const payload = {
                study_date: schedule.study_date || null,
                land_purchase_date: schedule.land_purchase_date || null,
                incorp_dd_start_offset: Math.floor(Number(schedule.incorp_dd_start_offset) || 0),
                incorp_closing_start_offset: Math.floor(Number(schedule.incorp_closing_start_offset) || 0),
                incorp_projects_months: Math.floor(Number(schedule.incorp_projects_months) || 0),
                incorp_projects_start_offset: Math.floor(Number(schedule.incorp_projects_start_offset) || 0),
                incorp_permits_months: Math.floor(Number(schedule.incorp_permits_months) || 0),
                incorp_permits_start_offset: Math.floor(Number(schedule.incorp_permits_start_offset) || 0),
                financing_months: Math.floor(Number(schedule.financing_months) || 0),
                financing_start_offset: Math.floor(Number(schedule.financing_start_offset) || 0),
                construction_pre_months: Math.floor(Number(schedule.construction_pre_months) || 0),
                construction_pre_start_offset: Math.floor(Number(schedule.construction_pre_start_offset) || 0),
                construction_main_months: Math.floor(Number(schedule.construction_main_months) || 0),
                construction_main_start_offset: Math.floor(Number(schedule.construction_main_start_offset) || 0),
                sales_duration_months: Math.floor(Number(schedule.sales_duration_months) || 0),
                sales_start_offset: Math.floor(Number(schedule.sales_start_offset) || 0),
                delivery_months: Math.floor(Number(schedule.delivery_months) || 0),
                delivery_start_offset: Math.floor(Number(schedule.delivery_start_offset) || 0),
                scenario_type: 'base',
                name: dictionary.analysis?.units?.scenarios?.base || 'Base Case'
            };

            const { error: sbError } = await supabase
                .from('financial_scenarios')
                .update(payload)
                .eq('id', scenarioId);

            if (sbError) {
                console.error('Supabase Error:', sbError);
                setSaveStatus('error');
                setTimeout(() => setSaveStatus('idle'), 5000);
            } else {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            }
        } catch (e: any) {
            console.error('Fatal Save Error:', e);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 5000);
        } finally {
            setSaving(false);
        }
    };

    const getKeys = (phaseId: string) => {
        switch (phaseId) {
            case 'dd': return { offset: 'incorp_dd_start_offset' as const, duration: null };
            case 'closing': return { offset: 'incorp_closing_start_offset' as const, duration: null };
            case 'projects': return { offset: 'incorp_projects_start_offset' as const, duration: 'incorp_projects_months' as const };
            case 'permits': return { offset: 'incorp_permits_start_offset' as const, duration: 'incorp_permits_months' as const };
            case 'financing': return { offset: 'financing_start_offset' as const, duration: 'financing_months' as const };
            case 'construction_pre': return { offset: 'construction_pre_start_offset' as const, duration: 'construction_pre_months' as const };
            case 'construction_main': return { offset: 'construction_main_start_offset' as const, duration: 'construction_main_months' as const };
            case 'sales': return { offset: 'sales_start_offset' as const, duration: 'sales_duration_months' as const };
            case 'delivery': return { offset: 'delivery_start_offset' as const, duration: 'delivery_months' as const };
            default: return { offset: null, duration: null };
        }
    };

    const timelineData = useMemo(() => {
        const studyDateObj = parseISO(schedule.study_date);
        const start = isValid(studyDateObj) ? startOfMonth(studyDateObj) : startOfMonth(new Date());

        const realPurchaseDate = parseISO(schedule.land_purchase_date);
        const hasRealDate = isValid(realPurchaseDate);

        const realMonthOffset = hasRealDate ? differenceInMonths(realPurchaseDate, start) : schedule.incorp_closing_start_offset;
        const effectiveClosingMonth = hasRealDate ? realMonthOffset : schedule.incorp_closing_start_offset;

        const groups = [
            {
                id: 'land',
                name: lang === 'pt' ? "TERRENO" : "LAND",
                icon: '📍',
                color: 'from-blue-600 to-blue-400',
                headerColor: 'text-blue-600',
                phases: [
                    { id: 'dd', name: dict.phases?.dd || "DUE DILIGENCE", start: schedule.incorp_dd_start_offset, end: schedule.incorp_dd_start_offset + Math.ceil((landData?.due_diligence_period_days || 0) / 30 || 1), icon: '🔍', type: 'days' },
                    {
                        id: 'closing',
                        name: dict.phases?.closing || "ESCRITURAÇÃO / COMPRA",
                        start: schedule.incorp_closing_start_offset,
                        end: effectiveClosingMonth,
                        icon: '🖋️',
                        isMilestone: true,
                        realDate: schedule.land_purchase_date
                    }
                ]
            },
            {
                id: 'incorporation',
                name: dict.groups?.incorporation || "INCORPORAÇÃO",
                icon: '📐',
                color: 'from-cyan-600 to-cyan-400',
                headerColor: 'text-cyan-600',
                phases: [
                    { id: 'projects', name: dict.phases?.projects || "PROJETOS", start: schedule.incorp_projects_start_offset, end: schedule.incorp_projects_start_offset + schedule.incorp_projects_months, icon: '📐' },
                    { id: 'permits', name: dict.phases?.permits || "LICENÇAS", start: schedule.incorp_permits_start_offset, end: schedule.incorp_permits_start_offset + schedule.incorp_permits_months, icon: '📜' }
                ]
            },
            {
                id: 'financing',
                name: dict.groups?.financing || "FINANCIAMENTO",
                icon: '🏦',
                color: 'from-purple-600 to-purple-400',
                headerColor: 'text-purple-600',
                phases: [
                    { id: 'financing', name: dict.phases?.financing || "CONTRATAÇÃO BANCO", start: schedule.financing_start_offset, end: schedule.financing_start_offset + schedule.financing_months, icon: '🏦' }
                ]
            },
            {
                id: 'construction',
                name: dict.groups?.construction || "CONSTRUÇÃO",
                icon: '🏗️',
                color: 'from-amber-400 to-yellow-300',
                headerColor: 'text-amber-600',
                phases: [
                    { id: 'construction_pre', name: dict.phases?.pre_construction || "PRÉ-CONSTRUÇÃO", start: schedule.construction_pre_start_offset, end: schedule.construction_pre_start_offset + schedule.construction_pre_months, icon: '🚧' },
                    { id: 'construction_main', name: dict.phases?.main_construction || "OBRA PRINCIPAL", start: schedule.construction_main_start_offset, end: schedule.construction_main_start_offset + schedule.construction_main_months, icon: '🏗️' }
                ]
            },
            {
                id: 'sales',
                name: dict.groups?.sales || "VENDAS",
                icon: '💰',
                color: 'from-emerald-600 to-teal-400',
                headerColor: 'text-emerald-600',
                phases: [
                    { id: 'sales', name: dict.phases?.sales || "CICLO DE VENDAS", start: schedule.sales_start_offset, end: schedule.sales_start_offset + schedule.sales_duration_months, icon: '🏷️' }
                ]
            },
            {
                id: 'delivery',
                name: dict.groups?.delivery || "ENTREGA",
                icon: '🔑',
                color: 'from-indigo-600 to-blue-500',
                headerColor: 'text-indigo-600',
                phases: [
                    { id: 'delivery', name: dict.phases?.delivery || "ENTREGA DE CHAVES", start: schedule.delivery_start_offset, end: schedule.delivery_start_offset + schedule.delivery_months, icon: '🔑' }
                ]
            }
        ];

        const warnings: string[] = [];
        if (hasRealDate) {
            const actualStartMonth = realMonthOffset;
            const suggestedStartMonth = schedule.incorp_closing_start_offset;
            if (actualStartMonth !== suggestedStartMonth) {
                const laterPhases = groups.flatMap(g => g.phases).filter(p => p.id !== 'dd' && p.id !== 'closing');
                const hasInterference = laterPhases.some(p => p.start < actualStartMonth);
                if (hasInterference) {
                    warnings.push(lang === 'pt'
                        ? 'A data de assinatura real impacta o início de outras fases. Verifique os marcos seguintes.'
                        : 'Real signature date impacts subsequent phases. Please review the following milestones.');
                }
            }
        }

        let maxMonth = 12;
        groups.forEach(g => g.phases.forEach(p => { if (p.end > maxMonth) maxMonth = p.end; }));
        return { start, groups, maxMonth, warnings };
    }, [schedule, landData, dict, lang]);

    const monthWidth = 120;
    const timelineWidth = (timelineData.maxMonth + 2) * monthWidth;
    const leftColWidth = 300;

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>;

    return (
        <div className="space-y-12 pb-24">
            {/* STUDY ANCHOR */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-8 items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{dict.study_anchor_title || "PONTO DE ANCORAGEM"}</h3>
                        <input type="date" className="text-xl font-black text-[#081F2E] outline-none border-none p-0 focus:ring-0" value={schedule.study_date} onChange={e => setSchedule(prev => ({ ...prev, study_date: e.target.value }))} />
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`
                        min-w-[240px] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_8px_30px_rgba(0,0,0,0.12)] active:scale-95 flex items-center justify-center gap-3
                        ${saving ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-[#081F2E] text-white hover:bg-black hover:shadow-2xl hover:-translate-y-0.5'}
                    `}
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            {lang === 'pt' ? 'Salvando...' : 'Saving...'}
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            {lang === 'pt' ? 'Salvar Premissas' : 'Save Assumptions'}
                        </>
                    )}
                </button>
            </div>

            {/* MAIN ACTIVITIES SECTION */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-[#081F2E] uppercase tracking-tighter">{lang === 'pt' ? 'CRONOGRAMA MACRO DE ATIVIDADES' : 'MACRO ACTIVITY SCHEDULE'}</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{lang === 'pt' ? 'CONFIGURAÇÃO DE FASES E MARCOS' : 'PHASE & MILESTONE CONFIGURATION'}</p>
                    </div>
                </div>

                <div className="bg-slate-50/60 p-10 lg:p-14 rounded-[72px] border border-gray-100 shadow-inner">
                    <div className="space-y-10">
                        {timelineData.groups.map((group) => (
                            <div key={group.id} className="animate-fadeIn relative">
                                {/* GROUP HEADER CARD */}
                                <div className="inline-flex items-center gap-3 bg-white px-6 py-2.5 rounded-[20px] border border-gray-100 shadow-sm mb-[-18px] ml-8 relative z-20">
                                    <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-lg shadow-inner border border-gray-50`}>{group.icon}</div>
                                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${group.headerColor}`}>{group.name}</h3>
                                </div>

                                {/* GROUP CONTENT BOX */}
                                <div className="bg-white/80 p-8 lg:p-10 rounded-[48px] border border-white shadow-sm relative z-10 box-border backdrop-blur-sm">
                                    <div className="grid grid-cols-1 gap-4 mt-2">
                                        {group.phases.map((phase: any) => {
                                            const { offset: offsetKey, duration: durationKey } = getKeys(phase.id);
                                            const isClosing = phase.id === 'closing';

                                            return (
                                                <div key={phase.id} className="space-y-3">
                                                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group overflow-hidden">
                                                        <div className="flex flex-col lg:flex-row items-center gap-10">
                                                            <div className="flex items-center gap-5 w-full lg:w-64 shrink-0">
                                                                <div className="w-16 h-16 rounded-[22px] bg-slate-50 flex items-center justify-center text-3xl grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 shadow-inner group-hover:bg-white">{phase.icon}</div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-base font-black text-[#081F2E] uppercase tracking-tight leading-tight mb-1">{phase.name}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                                                                            {isClosing ? `Milestone` : `Phase`}
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                                            M{phase.start} {!isClosing && `→ M${phase.end}`}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 flex flex-col md:flex-row gap-6 w-full max-w-2xl">
                                                                <div className="flex-1 space-y-2">
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 opacity-60">INÍCIO (OFFSET)</p>
                                                                    <div className="relative group/input-container">
                                                                        <input
                                                                            type="number"
                                                                            className="w-full bg-slate-50/50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-xl px-5 py-4 text-xs font-black text-[#081F2E] outline-none transition-all appearance-none hide-spinner"
                                                                            value={phase.start}
                                                                            onChange={e => {
                                                                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                                                                if (offsetKey) {
                                                                                    setSchedule(prev => ({ ...prev, [offsetKey]: val }));
                                                                                }
                                                                            }}
                                                                        />
                                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                                                            <span className="text-[9px] font-black text-slate-300 uppercase pointer-events-none">Meses</span>
                                                                            <div className="flex flex-col border-l border-slate-200 pl-2">
                                                                                <button
                                                                                    onClick={() => offsetKey && setSchedule(prev => ({ ...prev, [offsetKey]: (Number(prev[offsetKey]) || 0) + 1 }))}
                                                                                    className="text-slate-400 hover:text-blue-500 transition-colors p-0.5"
                                                                                >
                                                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 15l7-7 7 7" /></svg>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => offsetKey && setSchedule(prev => ({ ...prev, [offsetKey]: Math.max(0, (Number(prev[offsetKey]) || 0) - 1) }))}
                                                                                    className="text-slate-400 hover:text-blue-500 transition-colors p-0.5"
                                                                                >
                                                                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" /></svg>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {!isClosing && (
                                                                    <div className="flex-1 space-y-2">
                                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 opacity-60">{phase.type === 'days' ? "DURAÇÃO (DIAS)" : "DURAÇÃO (MESES)"}</p>
                                                                        <div className="relative group/input-container">
                                                                            <input
                                                                                type="number"
                                                                                disabled={phase.id === 'dd'}
                                                                                className="w-full bg-slate-50/50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-xl px-5 py-4 text-xs font-black text-[#081F2E] outline-none disabled:opacity-50 transition-all font-sans appearance-none hide-spinner"
                                                                                value={phase.type === 'days' ? (landData?.due_diligence_period_days || 0) : (durationKey ? (schedule[durationKey] || 0) : 0)}
                                                                                onChange={e => {
                                                                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                                                                    if (durationKey) {
                                                                                        setSchedule(prev => ({ ...prev, [durationKey]: val }));
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                                                                <span className="text-[9px] font-black text-slate-300 uppercase pointer-events-none">
                                                                                    {phase.type === 'days' ? 'Dias' : 'Meses'}
                                                                                </span>
                                                                                {phase.id !== 'dd' && (
                                                                                    <div className="flex flex-col border-l border-slate-200 pl-2">
                                                                                        <button
                                                                                            onClick={() => durationKey && setSchedule(prev => ({ ...prev, [durationKey]: (Number(prev[durationKey]) || 0) + 1 }))}
                                                                                            className="text-slate-400 hover:text-blue-500 transition-colors p-0.5"
                                                                                        >
                                                                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 15l7-7 7 7" /></svg>
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => durationKey && setSchedule(prev => ({ ...prev, [durationKey]: Math.max(0, (Number(prev[durationKey]) || 0) - 1) }))}
                                                                                            className="text-slate-400 hover:text-blue-500 transition-colors p-0.5"
                                                                                        >
                                                                                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" /></svg>
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {isClosing && <div className="flex-1"></div>}
                                                            </div>

                                                            <div className="w-full lg:w-[380px] bg-slate-50/30 p-5 rounded-[28px] border border-dashed border-gray-200 flex justify-between items-center relative overflow-hidden shrink-0 group-hover:bg-white transition-colors">
                                                                <div className="text-center flex-1 z-10">
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-60">
                                                                        {isClosing ? (lang === 'pt' ? 'PREVISÃO' : 'PLANNED') : 'INÍCIO'}
                                                                    </p>
                                                                    <p className="text-sm font-black text-[#081F2E]">{safeFormat(addMonths(timelineData.start, phase.start).toISOString(), 'MMM yyyy', { locale: dateLocale }).toUpperCase()}</p>
                                                                </div>
                                                                <div className="px-4 z-10"><div className="w-8 h-px bg-gray-300"></div></div>
                                                                <div className="text-center flex-1 z-10">
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-60">
                                                                        {isClosing ? (lang === 'pt' ? 'ASSINATURA' : 'SIGNING') : 'TÉRMINO'}
                                                                    </p>
                                                                    {isClosing ? (
                                                                        <input type="date" className="bg-white text-emerald-600 border border-emerald-100 rounded-lg px-3 py-2 text-[9px] font-black outline-none w-full text-center shadow-sm focus:ring-4 focus:ring-emerald-500/10 placeholder:text-gray-300" value={schedule.land_purchase_date} onChange={e => setSchedule(prev => ({ ...prev, land_purchase_date: e.target.value }))} />
                                                                    ) : (
                                                                        <p className="text-sm font-black text-[#081F2E]">{safeFormat(addMonths(timelineData.start, phase.end).toISOString(), 'MMM yyyy', { locale: dateLocale }).toUpperCase()}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isClosing && timelineData.warnings.length > 0 && (
                                                        <div className="animate-fadeIn bg-amber-50/50 border border-amber-100 p-4 rounded-[24px] flex items-center gap-4 mx-2 backdrop-blur-sm">
                                                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shadow-sm">⚠️</div>
                                                            <p className="text-[9px] font-black text-amber-900 uppercase tracking-tight leading-relaxed">{timelineData.warnings[0]}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ROADMAP DIAGRAM (LIQUID GLASS STYLE) */}
            <div className="space-y-6 pt-12 border-t border-gray-100/50">
                <div className="flex justify-between items-end px-4">
                    <div className="flex flex-col">
                        <h4 className="text-xl font-black text-[#081F2E] uppercase tracking-tighter">{dict.timeline_visual || "VISUALIZAÇÃO DA TIMELINE"}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{dict.visuals?.roadmap_subtitle || "CRONOGRAMA MASTER • VISÃO EXECUTIVA"}</p>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[48px] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-[#081F2E] group/roadmap">
                    {/* LIQUID GLASS DECORATION */}
                    <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>



                    {/* MONTH HEADER (STATIC AT TOP OF DIAGRAM) */}
                    <div className="z-20 bg-[#081F2E] border-b border-white/5 overflow-hidden">
                        <div ref={headerScrollRef} className="overflow-x-auto no-scrollbar">
                            <div style={{ width: `${timelineWidth + leftColWidth}px` }} className="flex py-6">
                                {/* Spacer for sticky names */}
                                <div className="sticky left-0 z-20 bg-[#081F2E]/90 backdrop-blur-2xl w-[300px] shrink-0 h-full border-r border-white/5 flex items-center px-10">
                                    <span className="text-[10px] font-black text-cyan-400/80 uppercase tracking-[0.3em]">ATIVIDADES</span>
                                </div>
                                <div className="flex">
                                    {Array.from({ length: timelineData.maxMonth + 2 }).map((_, i) => (
                                        <div key={i} style={{ width: `${monthWidth}px` }} className="text-center flex-shrink-0 border-r border-white/5 last:border-none">
                                            <p className="text-[9px] font-black text-white/40 mb-1 tracking-widest">{i === 0 ? 'START' : `M${i}`}</p>
                                            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-tight">{safeFormat(addMonths(timelineData.start, i).toISOString(), 'MMM yy', { locale: dateLocale })}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ROADMAP CONTENT */}
                    <div ref={roadmapScrollRef} className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <div style={{ width: `${timelineWidth + leftColWidth}px` }} className="relative">
                            {/* Vertical Grid Lines */}
                            <div className="absolute inset-0 flex pointer-events-none z-0">
                                <div className="w-[300px] shrink-0 border-r border-white/10"></div>
                                {Array.from({ length: timelineData.maxMonth + 2 }).map((_, i) => (
                                    <div key={i} style={{ width: `${monthWidth}px` }} className="h-full border-r border-white/10 flex-shrink-0"></div>
                                ))}
                            </div>

                            {/* Phase Blocks */}
                            <div className="relative z-10 py-6">
                                {timelineData.groups.map((group) => (
                                    <div key={group.id} className="border-b border-white/[0.05] last:border-none group/grouprow">
                                        <div className="space-y-1">
                                            {group.phases.map((phase: any, pIdx: number) => {
                                                const left = phase.start * monthWidth;
                                                const width = (phase.end - phase.start) * monthWidth;
                                                const isMilestone = phase.id === 'closing';

                                                return (
                                                    <div key={pIdx} className="relative h-12 flex items-center group/row border-b border-white/[0.05] last:border-none">
                                                        {/* STICKY NAME ON THE LEFT */}
                                                        <div className="sticky left-0 z-30 flex items-center h-full px-10 bg-[#081F2E]/80 backdrop-blur-md border-r border-white/5 group-hover/row:bg-[#081F2E]/90 transition-colors w-[300px] shrink-0">
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-black text-white uppercase tracking-tight leading-none mb-1.5 group-hover/row:text-cyan-400 transition-colors truncate">{phase.name}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest leading-none">
                                                                        {phase.type === 'days' ? `${landData?.due_diligence_period_days || 0} Dias` : `${phase.end - phase.start} Meses`}
                                                                    </span>
                                                                    <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-black uppercase tracking-tighter border border-cyan-500/30">
                                                                        {group.name}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* THE LIQUID GLASS BAR CONTAINER */}
                                                        <div className="relative flex-1 h-full">
                                                            {!isMilestone ? (
                                                                <div
                                                                    className={`absolute top-1/2 -translate-y-1/2 h-5 rounded-full bg-gradient-to-br ${group.color} border-t border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-[1.02] hover:brightness-125 flex items-center px-3`}
                                                                    style={{ left: `${left}px`, width: `${width}px` }}
                                                                >
                                                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                                                                    <span className="text-[10px] text-white/80 filter drop-shadow-sm truncate">{phase.icon}</span>
                                                                </div>
                                                            ) : (
                                                                /* Milestone Marker - Centered on the line */
                                                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-20" style={{ left: `${left}px` }}>
                                                                    <div className="w-5 h-5 rounded-full bg-[#081F2E] border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] flex items-center justify-center">
                                                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                                                                    </div>
                                                                    {/* Connector Line */}
                                                                    <div className="absolute top-full w-px h-12 bg-gradient-to-b from-cyan-400/50 to-transparent"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-[#081F2E] p-10 rounded-[40px] border border-white/10 flex flex-wrap gap-16 items-center shadow-2xl">
                    <div className="flex flex-col"><span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">HORIZONTE DE INVESTIMENTO</span><div className="flex items-baseline gap-2"><span className="text-4xl font-black text-white">{timelineData.maxMonth}</span><span className="text-xs font-black text-gray-500 uppercase">Meses</span></div></div>
                    <div className="h-14 w-px bg-white/10"></div>
                    <div className="flex gap-12">
                        <div className="flex flex-col"><span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">INÍCIO DO PROJETO</span><span className="text-base font-black text-cyan-400 capitalize">{safeFormat(timelineData.start.toISOString(), 'MMMM yyyy', { locale: dateLocale })}</span></div>
                        <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">CONCLUSÃO FINAL</span><span className="text-base font-black text-emerald-400 capitalize">{safeFormat(addMonths(timelineData.start, timelineData.maxMonth).toISOString(), 'MMMM yyyy', { locale: dateLocale })}</span></div>
                    </div>
                    <div className="flex-1 min-w-[280px] flex flex-col justify-center bg-black/20 p-6 rounded-3xl border border-white/5">
                        <div className="flex justify-between items-end mb-3"><p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">MATURIDADE DO CICLO</p><p className="text-[10px] font-black text-emerald-400 uppercase">100% Finalizado</p></div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500 w-full rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div></div>
                    </div>
                </div>
            </div>

            {/* PREMIUM SAVE NOTIFICATION */}
            <AnimatePresence>
                {saveStatus !== 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[999]"
                    >
                        <div className={`
                            px-8 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border backdrop-blur-xl flex items-center gap-4
                            ${saveStatus === 'success'
                                ? 'bg-emerald-500/90 border-emerald-400/50 text-white'
                                : 'bg-rose-500/90 border-rose-400/50 text-white'}
                        `}>
                            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
                                {saveStatus === 'success' ? '✨' : '⚠️'}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black uppercase tracking-widest">
                                    {saveStatus === 'success'
                                        ? (lang === 'pt' ? 'Sucesso!' : 'Success!')
                                        : (lang === 'pt' ? 'Erro ao Salvar' : 'Save Error')}
                                </span>
                                <span className="text-[10px] font-bold opacity-80 uppercase tracking-tight">
                                    {saveStatus === 'success'
                                        ? (lang === 'pt' ? 'As alterações foram sincronizadas.' : 'Changes have been synced.')
                                        : (lang === 'pt' ? 'Tente novamente em instantes.' : 'Please try again later.')}
                                </span>
                            </div>
                            {saveStatus === 'success' && (
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 4 }}
                                    className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full"
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .scrollbar-thin::-webkit-scrollbar { height: 6px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { 
                    background: rgba(34, 211, 238, 0.3); 
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover { 
                    background: rgba(34, 211, 238, 0.6); 
                    box-shadow: 0 0 10px rgba(34, 211, 238, 0.4);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .hide-spinner::-webkit-outer-spin-button,
                .hide-spinner::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .hide-spinner {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div >
    );
}
