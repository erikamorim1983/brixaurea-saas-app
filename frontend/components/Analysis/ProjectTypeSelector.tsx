'use client';

import { usePropertyTypes } from '@/hooks/usePropertyTypes';
import { useState, useEffect } from 'react';
import propertyTypesPT from '@/dictionaries/property-types-pt.json';
import propertyTypesEN from '@/dictionaries/property-types-en.json';
import propertyTypesES from '@/dictionaries/property-types-es.json';

interface ProjectTypeSelectorProps {
    projectId: string;
    initialCategoryId?: string | null;
    initialSubtypeId?: string | null;
    initialStandardId?: string | null;
    lang: string;
    onSave?: (categoryId: string, subtypeId: string, standardId?: string | null) => Promise<void>;
}

export default function ProjectTypeSelector({
    projectId,
    initialCategoryId,
    initialSubtypeId,
    initialStandardId,
    lang,
    onSave
}: ProjectTypeSelectorProps) {
    const { categories, subtypes, standards, loading, error, getLocalizedName, getSubtypesByCategory } = usePropertyTypes(lang);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId || null);
    const [selectedSubtypeId, setSelectedSubtypeId] = useState<string | null>(initialSubtypeId || null);
    const [selectedStandardId, setSelectedStandardId] = useState<string | null>(initialStandardId || null);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(!initialCategoryId || !initialSubtypeId);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    // Get translation dict based on lang
    const translations = lang === 'pt' ? propertyTypesPT : lang === 'es' ? propertyTypesES : propertyTypesEN;

    // Reset subtype when category changes
    useEffect(() => {
        if (selectedCategoryId && !initialSubtypeId && isEditing) {
            setSelectedSubtypeId(null);
        }
    }, [selectedCategoryId]);

    // Get current category and subtype
    const currentCategory = categories.find(c => c.id === selectedCategoryId);
    const currentSubtype = subtypes.find(st => st.id === selectedSubtypeId);
    const availableSubtypes = selectedCategoryId ? getSubtypesByCategory(selectedCategoryId) : [];

    // Handle save
    const handleSave = async () => {
        if (!selectedCategoryId || !selectedSubtypeId) return;

        setSaving(true);
        try {
            if (onSave) {
                await onSave(selectedCategoryId, selectedSubtypeId, selectedStandardId);
            }

            // Show success toast
            setShowSuccessToast(true);
            setIsEditing(false);

            // Hide toast after 3 seconds
            setTimeout(() => {
                setShowSuccessToast(false);
            }, 3000);
        } catch (err) {
            console.error('Error saving project type:', err);
            alert(lang === 'pt' ? 'Erro ao salvar tipo de projeto' : 'Error saving project type');
        } finally {
            setSaving(false);
        }
    };

    // Handle edit
    const handleEdit = () => {
        setIsEditing(true);
    };

    // Handle cancel
    const handleCancel = () => {
        setSelectedCategoryId(initialCategoryId || null);
        setSelectedSubtypeId(initialSubtypeId || null);
        setSelectedStandardId(initialStandardId || null);
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-12 bg-gray-100 rounded mb-3"></div>
                <div className="h-12 bg-gray-100 rounded mb-3"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <p className="text-red-700 text-sm">
                    {lang === 'pt' ? 'Erro ao carregar tipos de projeto' : 'Error loading property types'}: {error}
                </p>
            </div>
        );
    }

    const getTranslatedLevel = (level: string): string => {
        return translations.market_characteristics.levels[level as keyof typeof translations.market_characteristics.levels] || level;
    };

    // Dynamic Logic for Market Characteristics
    const getRefinedCharacteristics = () => {
        if (!currentSubtype) return null;

        let income = currentSubtype.typical_income_level;
        let liquidity = currentSubtype.typical_liquidity;
        let complexity = currentSubtype.typical_complexity;

        const standard = standards.find(s => s.id === selectedStandardId);
        const standardKey = standard?.key;

        // 1. Refine based on Standard
        if (standardKey === 'luxury') {
            income = 'very_high';
            liquidity = ['high_rise_multifamily', 'condos_high_rise'].includes(currentSubtype.key) ? 'low' : 'medium';
            complexity = 'very_high';
        } else if (standardKey === 'high_end') {
            income = 'high';
            liquidity = 'medium';
            complexity = complexity === 'very_high' ? 'very_high' : 'high';
        } else if (standardKey === 'entry_level' || standardKey === 'affordable') {
            income = standardKey === 'affordable' ? 'low' : 'medium';
            liquidity = 'very_high';
            complexity = complexity === 'low' ? 'low' : 'medium';
        }

        // 2. Refine based on Building Type (Subtype Specifics)
        if (currentSubtype.key.includes('high_rise') || currentSubtype.key.includes('master_planned')) {
            complexity = 'very_high';
        }

        return { income, liquidity, complexity };
    };

    const refined = getRefinedCharacteristics();

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 relative">
            {/* Success Toast */}
            {showSuccessToast && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-fadeIn flex items-center gap-2 z-10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold">
                        {lang === 'pt' ? 'Projeto salvo com sucesso!' : lang === 'es' ? '¡Proyecto guardado!' : 'Project saved successfully!'}
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-[#081F2E] mb-1">
                        {lang === 'pt' ? 'Tipo de Projeto' : lang === 'es' ? 'Tipo de Proyecto' : 'Project Type'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {lang === 'pt'
                            ? 'Define o tipo de empreendimento e configura as métricas adequadas.'
                            : lang === 'es'
                                ? 'Define el tipo de desarrollo y configura las métricas adecuadas.'
                                : 'Define the development type and configure appropriate metrics.'}
                    </p>
                </div>

                {/* Edit Button (when saved) */}
                {!isEditing && selectedCategoryId && selectedSubtypeId && (
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors border border-cyan-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {lang === 'pt' ? 'Editar' : lang === 'es' ? 'Editar' : 'Edit'}
                    </button>
                )}
            </div>

            {/* Category Selector */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {lang === 'pt' ? 'Categoria Principal' : lang === 'es' ? 'Categoría Principal' : 'Main Category'}
                </label>
                <select
                    value={selectedCategoryId || ''}
                    onChange={(e) => setSelectedCategoryId(e.target.value || null)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                >
                    <option value="">
                        {lang === 'pt' ? 'Selecione a Categoria' : lang === 'es' ? 'Seleccione la Categoría' : 'Select Category'}
                    </option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.icon} {getLocalizedName(category)}
                        </option>
                    ))}
                </select>
                {currentCategory && (
                    <p className="mt-2 text-xs text-gray-500 italic">
                        {lang === 'pt' ? currentCategory.description : lang === 'es' ? currentCategory.description : currentCategory.description}
                    </p>
                )}
            </div>

            {/* Subtype Selector */}
            {selectedCategoryId && (
                <div className="animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {lang === 'pt' ? 'Subtipo' : lang === 'es' ? 'Subtipo' : 'Subtype'}
                    </label>
                    <select
                        value={selectedSubtypeId || ''}
                        onChange={(e) => setSelectedSubtypeId(e.target.value || null)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <option value="">
                            {lang === 'pt' ? 'Selecione o Subtipo' : lang === 'es' ? 'Seleccione el Subtipo' : 'Select Subtype'}
                        </option>
                        {availableSubtypes.map((subtype) => (
                            <option key={subtype.id} value={subtype.id}>
                                {getLocalizedName(subtype)}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Standard (Tier) Selector */}
            {selectedSubtypeId && (
                <div className="animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {lang === 'pt' ? 'Padrão / Classificação' : lang === 'es' ? 'Nivel / Estándar' : 'Standard / Market Tier'}
                    </label>
                    <select
                        value={selectedStandardId || ''}
                        onChange={(e) => setSelectedStandardId(e.target.value || null)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <option value="">
                            {lang === 'pt' ? 'Selecione o Padrão' : lang === 'es' ? 'Seleccione el Nivel' : 'Select Standard'}
                        </option>
                        {standards.map((standard) => (
                            <option key={standard.id} value={standard.id}>
                                {getLocalizedName(standard)}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Market Characteristics */}
            {refined && (
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-xl border border-cyan-100 animate-fadeIn">
                    <h4 className="text-sm font-bold text-cyan-900 mb-3">
                        {lang === 'pt' ? 'Características de Mercado (Perfil Sugerido)' : lang === 'es' ? 'Características de Mercado' : 'Market Characteristics (Suggested Profile)'}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Income Level */}
                        <div className="bg-white/70 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">
                                {translations.market_characteristics.income_level}
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-900 capitalize">
                                    {getTranslatedLevel(refined.income)}
                                </p>
                                {refined.income !== currentSubtype.typical_income_level && (
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                )}
                            </div>
                        </div>

                        {/* Liquidity */}
                        <div className="bg-white/70 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">
                                {translations.market_characteristics.liquidity}
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-900 capitalize">
                                    {getTranslatedLevel(refined.liquidity)}
                                </p>
                                {refined.liquidity !== currentSubtype.typical_liquidity && (
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                )}
                            </div>
                        </div>

                        {/* Complexity */}
                        <div className="bg-white/70 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">
                                {translations.market_characteristics.complexity}
                            </p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-900 capitalize">
                                    {getTranslatedLevel(refined.complexity)}
                                </p>
                                {refined.complexity !== currentSubtype.typical_complexity && (
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Primary Metric */}
                    <div className="mt-4 bg-white/70 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">
                            {translations.market_characteristics.primary_metric}
                        </p>
                        <p className="text-sm font-bold text-cyan-700 uppercase">
                            {currentSubtype.relevant_fields?.primary_metric ?
                                translations.market_characteristics.metrics[currentSubtype.relevant_fields.primary_metric as keyof typeof translations.market_characteristics.metrics]
                                : 'N/A'}
                        </p>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {isEditing && selectedCategoryId && selectedSubtypeId && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    {initialCategoryId && initialSubtypeId && (
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {lang === 'pt' ? 'Cancelar' : lang === 'es' ? 'Cancelar' : 'Cancel'}
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {lang === 'pt' ? 'Salvando...' : lang === 'es' ? 'Guardando...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                {lang === 'pt' ? 'Salvar Tipo de Projeto' : lang === 'es' ? 'Guardar Tipo de Proyecto' : 'Save Project Type'}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Saved State Indicator */}
            {!isEditing && selectedCategoryId && selectedSubtypeId && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold">
                        {lang === 'pt' ? 'Tipo de projeto salvo' : lang === 'es' ? 'Tipo de proyecto guardado' : 'Project type saved'}
                    </span>
                </div>
            )}
        </div>
    );
}
