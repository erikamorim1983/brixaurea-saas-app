'use client';

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import { createClient } from "@/lib/supabase/client";
import ShareProjectModal from './ShareProjectModal';
import propertyTypesPT from '@/dictionaries/property-types-pt.json';
import propertyTypesEN from '@/dictionaries/property-types-en.json';
import propertyTypesES from '@/dictionaries/property-types-es.json';

interface Project {
    id: string;
    name: string;
    status: string;
    project_type?: string;
    category_id?: string | null;
    subtype_id?: string | null;
    category_key?: string | null;
    subtype_key?: string | null;
    updated_at: string;
    locations?: {
        address_full: string;
        city?: string;
        state?: string;
        country?: string;
    } | null;
    deleted_at?: string | null;
}

interface ProjectsListClientProps {
    projects: Project[];
    lang: string;
    dictionary: any;
}

export default function ProjectsListClient({ projects: initialProjects, lang, dictionary }: ProjectsListClientProps) {
    const supabase = createClient();
    const [projects, setProjects] = useState(initialProjects);
    const [searchTerm, setSearchTerm] = useState('');
    const [projectToShare, setProjectToShare] = useState<any>(null);

    // Filter States
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [stateFilter, setStateFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');

    // Menu State
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [showTrash, setShowTrash] = useState(false);

    // Sync state when server data changes
    useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

    // Filter Logic Helper
    const getFilteredProjects = (excludeKey?: string) => {
        return projects.filter(p => {
            const isDeleted = !!p.deleted_at;
            if (showTrash && !isDeleted) return false;
            if (!showTrash && isDeleted) return false;

            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.locations?.address_full || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = excludeKey === 'status' || statusFilter === 'all' || p.status === statusFilter;
            const matchesType = excludeKey === 'type' || typeFilter === 'all' || p.project_type === typeFilter;
            const matchesState = excludeKey === 'state' || stateFilter === 'all' || p.locations?.state === stateFilter;
            const matchesCity = excludeKey === 'city' || cityFilter === 'all' || p.locations?.city === cityFilter;

            return matchesSearch && matchesStatus && matchesType && matchesState && matchesCity;
        });
    };

    const statusOptions = useMemo(() => {
        const relevantProjects = getFilteredProjects('status');
        return Array.from(new Set(relevantProjects.map(p => p.status).filter(Boolean)));
    }, [projects, searchTerm, typeFilter, stateFilter, cityFilter, showTrash]);

    const typeOptions = useMemo(() => {
        const relevantProjects = getFilteredProjects('type');
        return Array.from(new Set(relevantProjects.map(p => p.project_type).filter(Boolean)));
    }, [projects, searchTerm, statusFilter, stateFilter, cityFilter, showTrash]);

    const stateOptions = useMemo(() => {
        const relevantProjects = getFilteredProjects('state');
        return Array.from(new Set(relevantProjects.map(p => p.locations?.state).filter(Boolean)));
    }, [projects, searchTerm, statusFilter, typeFilter, cityFilter, showTrash]);

    const cityOptions = useMemo(() => {
        const relevantProjects = getFilteredProjects('city');
        return Array.from(new Set(relevantProjects.map(p => p.locations?.city).filter(Boolean)));
    }, [projects, searchTerm, statusFilter, typeFilter, stateFilter, showTrash]);

    const filteredProjects = getFilteredProjects();

    const handleMoveToTrash = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const now = new Date().toISOString();
        const { error } = await supabase.from('projects').update({ deleted_at: now }).eq('id', id);
        if (!error) {
            setProjects(prev => prev.map(p => p.id === id ? { ...p, deleted_at: now } : p));
        }
        setActiveMenuId(null);
    };

    const handleRestore = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const { error } = await supabase.from('projects').update({ deleted_at: null }).eq('id', id);
        if (!error) {
            setProjects(prev => prev.map(p => p.id === id ? { ...p, deleted_at: null } : p));
        }
        setActiveMenuId(null);
    };

    const handlePermanentDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const isPt = lang?.startsWith('pt') || dictionary?.list?.typology_label === 'Tipologia';
        if (!confirm(dictionary?.list?.confirm_permanent || (isPt ? 'Tem certeza que deseja excluir permanentemente?' : 'Are you sure you want to permanently delete?'))) return;

        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) {
            setProjects(prev => prev.filter(p => p.id !== id));
        }
        setActiveMenuId(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'feasibility': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'execution': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            case 'draft': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'completed': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'archived': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const getCardGradient = (status: string) => {
        switch (status) {
            case 'approved': return 'from-[#059669] to-[#047857]';
            case 'feasibility': return 'from-[#2563eb] to-[#1d4ed8]';
            case 'execution': return 'from-[#06b6d4] to-[#0891b2]';
            case 'rejected': return 'from-red-900/80 to-slate-900';
            case 'draft': return 'from-slate-600 to-slate-800';
            default: return 'from-[#081F2E] to-[#113a52]';
        }
    };

    const translateStatus = (status: string, currentLang: string) => {
        const isPt = currentLang?.startsWith('pt') || dictionary?.list?.typology_label === 'Tipologia';
        const isEs = currentLang?.startsWith('es') || dictionary?.list?.typology_label === 'Tipología';
        const targetLang = isPt ? 'pt' : (isEs ? 'es' : 'en');

        const map: Record<string, any> = {
            draft: { pt: 'Rascunho', es: 'Borrador', en: 'Draft' },
            feasibility: { pt: 'Estudo de Viabilidade', es: 'Estudio de Viabilidad', en: 'Feasibility Study' },
            approved: { pt: 'Aprovado', es: 'Aprovado', en: 'Approved' },
            execution: { pt: 'Acompanhamento', es: 'Ejecución', en: 'Execution' },
            rejected: { pt: 'Não Viável', es: 'No Viable', en: 'Not Viable' },
            completed: { pt: 'Concluído', es: 'Completado', en: 'Completed' },
            archived: { pt: 'Arquivado', es: 'Archivado', en: 'Archived' },
        };
        return map[status]?.[targetLang] || status;
    };

    const getTypologyName = (project: Project) => {
        const isPt = lang?.startsWith('pt') || dictionary?.list?.typology_label === 'Tipologia';
        const isEs = lang?.startsWith('es') || dictionary?.list?.typology_label === 'Tipología';
        const propDict: any = isPt ? propertyTypesPT : (isEs ? propertyTypesES : propertyTypesEN);

        const key = project.subtype_key || project.subtype_id;
        if (key && propDict.property_subtypes[key]) {
            return propDict.property_subtypes[key];
        }
        return project.project_type?.replace('_', ' ') || '-';
    };


    return (
        <div className="space-y-8" onClick={() => setActiveMenuId(null)}>
            {/* Header + Controls */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {dictionary?.list?.title || (lang?.startsWith('pt') ? 'Meus Projetos' : 'My Projects')}
                        </h1>
                        <p className="text-gray-500">
                            {dictionary?.list?.subtitle || (lang?.startsWith('pt') ? 'Gerencie seu portfolio imobiliário' : 'Manage your real estate portfolio')}
                        </p>
                    </div>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setShowTrash(false)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!showTrash ? 'bg-white text-cyan-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {dictionary?.list?.active || (lang?.startsWith('pt') ? 'Ativos' : 'Active')}
                        </button>
                        <button
                            onClick={() => setShowTrash(true)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${showTrash ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {dictionary?.list?.trash || (lang?.startsWith('pt') ? 'Lixeira' : 'Trash')}
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <motion.div
                    layout
                    className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden"
                >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {/* Search Input */}
                        <div className="md:col-span-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                {dictionary?.list?.search_label || (lang?.startsWith('pt') ? 'Buscar' : 'Search')}
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder={dictionary?.list?.search_placeholder || (lang?.startsWith('pt') ? 'Nome ou endereço...' : 'Name or address...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-[#00D9FF] outline-none transition-all"
                                />
                                <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400 group-focus-within:text-[#00D9FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                {dictionary?.list?.status_label || (lang?.startsWith('pt') ? 'Status' : 'Status')}
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#00D9FF] outline-none cursor-pointer hover:border-gray-300 transition-colors"
                            >
                                <option value="all">{dictionary?.list?.all_option || (lang?.startsWith('pt') ? 'Todos' : 'All')}</option>
                                {statusOptions.map(opt => (
                                    <option key={opt} value={opt}>{translateStatus(opt, lang)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                {dictionary?.list?.type_label || (lang?.startsWith('pt') ? 'Tipo' : 'Type')}
                            </label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#00D9FF] outline-none cursor-pointer hover:border-gray-300 transition-colors"
                            >
                                <option value="all">{dictionary?.list?.all_option || (lang?.startsWith('pt') ? 'Todos' : 'All')}</option>
                                {typeOptions.map(t => (
                                    <option key={t as string} value={t as string}>{t as string}</option>
                                ))}
                            </select>
                        </div>

                        {/* State Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                {dictionary?.list?.state_label || (lang?.startsWith('pt') ? 'Estado' : 'State')}
                            </label>
                            <select
                                value={stateFilter}
                                onChange={(e) => setStateFilter(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#00D9FF] outline-none cursor-pointer hover:border-gray-300 transition-colors"
                            >
                                <option value="all">{dictionary?.list?.all_option || (lang?.startsWith('pt') ? 'Todos' : 'All')}</option>
                                {stateOptions.map(s => (
                                    <option key={s as string} value={s as string}>{s as string}</option>
                                ))}
                            </select>
                        </div>

                        {/* City Filter */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                {dictionary?.list?.city_label || (lang?.startsWith('pt') ? 'Cidade' : 'City')}
                            </label>
                            <select
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#00D9FF] outline-none cursor-pointer hover:border-gray-300 transition-colors"
                            >
                                <option value="all">{dictionary?.list?.all_option || (lang?.startsWith('pt') ? 'Todos' : 'All')}</option>
                                {cityOptions.map(c => (
                                    <option key={c as string} value={c as string}>{c as string}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {filteredProjects.length > 0 ? (
                    <motion.div
                        key={showTrash ? 'trash' : 'active'}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                    >
                        {filteredProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full"
                            >
                                {/* Quick Menu */}
                                <div className="absolute top-5 right-5 z-20">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setActiveMenuId(activeMenuId === project.id ? null : project.id);
                                        }}
                                        className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full transition-all border border-white/20"
                                    >
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                        </svg>
                                    </button>

                                    <AnimatePresence>
                                        {activeMenuId === project.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 py-2 z-30"
                                            >
                                                {showTrash ? (
                                                    <>
                                                        <button
                                                            onClick={(e) => handleRestore(project.id, e)}
                                                            className="block w-full text-left px-5 py-3 text-sm text-green-600 hover:bg-green-50 flex items-center gap-3 transition-colors font-bold"
                                                        >
                                                            <span>♻️</span>
                                                            {dictionary?.list?.restore || (lang?.startsWith('pt') ? 'Restaurar Projeto' : 'Restore Project')}
                                                        </button>
                                                        <button
                                                            onClick={(e) => handlePermanentDelete(project.id, e)}
                                                            className="block w-full text-left px-5 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-bold border-t border-gray-50"
                                                        >
                                                            <span>🔥</span>
                                                            {dictionary?.list?.delete_permanent || (lang?.startsWith('pt') ? 'Excluir Permanente' : 'Delete Permanent')}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link
                                                            href={`/${lang}/dashboard/projects/${project.id}/feasibility/land`}
                                                            className="block px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors font-bold"
                                                        >
                                                            <span>✏️</span>
                                                            {dictionary?.list?.edit_analyze || (lang?.startsWith('pt') ? 'Editar / Analisar' : 'Edit / Analyze')}
                                                        </Link>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveMenuId(null);
                                                                setProjectToShare(project);
                                                            }}
                                                            className="block w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors font-bold"
                                                        >
                                                            <span>🔗</span>
                                                            {dictionary?.list?.share || (lang?.startsWith('pt') ? 'Compartilhar' : 'Share')}
                                                        </button>
                                                        <div className="h-px bg-gray-50 my-1 mx-2" />
                                                        <button
                                                            onClick={(e) => handleMoveToTrash(project.id, e)}
                                                            className="block w-full text-left px-5 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors font-bold"
                                                        >
                                                            <span>🗑️</span>
                                                            {dictionary?.list?.move_to_trash || (lang?.startsWith('pt') ? 'Mover para Lixeira' : 'Move to Trash')}
                                                        </button>
                                                    </>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <Link href={`/${lang}/dashboard/projects/${project.id}/feasibility/land`} className="flex-1 flex flex-col no-underline group shadow-none">
                                    <div className={`h-44 bg-gradient-to-br ${getCardGradient(project.status)} relative p-8 flex flex-col justify-end group-hover:brightness-110 transition-all duration-700`}>
                                        <div className="absolute inset-0 bg-black/5 mix-blend-overlay group-hover:opacity-0 transition-opacity" />

                                        <div className="absolute top-5 left-8 flex items-center gap-3">
                                            {project.deleted_at ? (
                                                <span className="px-4 py-1.5 bg-red-600/90 text-white text-[11px] font-black uppercase rounded-full shadow-2xl border border-white/20 backdrop-blur-sm animate-pulse flex items-center gap-1.5">
                                                    <span className="w-2 h-2 bg-white rounded-full" />
                                                    {dictionary?.list?.trash_full || (lang?.startsWith('pt') ? 'Lixeira (30 dias)' : 'Trash (30 days)')}
                                                </span>
                                            ) : (
                                                <span className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${getStatusColor(project.status)} bg-white/95 shadow-lg`}>
                                                    {translateStatus(project.status, lang)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="relative z-10">
                                            <h3 className="text-2xl font-black text-white mb-2 leading-tight tracking-tight group-hover:translate-x-1 transition-transform duration-500">
                                                {project.name}
                                            </h3>
                                            <div className="flex items-center text-white/70 text-sm font-medium">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                <span className="truncate opacity-90">
                                                    {project.locations?.address_full || (lang?.startsWith('pt') ? 'Localização Pendente' : 'Location Pending')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-gray-50/50">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center group/row">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                    {dictionary?.list?.typology_label || (lang?.startsWith('pt') ? 'Tipologia' : 'Typology')}
                                                </span>
                                                <span className="text-sm font-bold text-gray-800 capitalize bg-gray-100/50 px-3 py-1 rounded-lg">
                                                    {getTypologyName(project)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center group/row">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                    {dictionary?.list?.market_area_label || (lang?.startsWith('pt') ? 'Área de Mercado' : 'Market Area')}
                                                </span>
                                                <span className="text-sm font-bold text-gray-800">
                                                    {(project.locations?.city || project.locations?.state) ? `${project.locations?.city || ''}, ${project.locations?.state || ''}` : '-'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-300 uppercase">
                                                    {dictionary?.list?.last_activity_label || (lang?.startsWith('pt') ? 'Última Atividade' : 'Last Activity')}
                                                </span>
                                                <span className="text-xs font-bold text-gray-500">
                                                    {new Date(project.updated_at).toLocaleDateString(lang?.startsWith('pt') ? 'pt-BR' : 'en-US')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[#00D9FF] font-black text-xs uppercase tracking-tighter group-hover:gap-4 transition-all duration-500">
                                                {dictionary?.list?.access_feasibility || (lang?.startsWith('pt') ? 'Acessar Viabilidade' : 'Access Feasibility')}
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-gray-50"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="text-2xl font-black text-gray-300 tracking-tight text-center px-4">
                            {showTrash ? dictionary?.list?.empty_trash : dictionary?.list?.empty_projects}
                        </p>
                        <p className="text-sm font-bold text-gray-400/60 mt-2 uppercase tracking-[0.2em] text-center px-4">
                            {showTrash ? dictionary?.list?.clear_trash : dictionary?.list?.click_to_create}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <ShareProjectModal
                project={projectToShare}
                isOpen={!!projectToShare}
                onClose={() => setProjectToShare(null)}
                lang={lang}
            />
        </div>
    );
}
