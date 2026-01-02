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
    lang: string;
    onSave?: (categoryId: string, subtypeId: string) => void;
}

export default function ProjectTypeSelector({
    projectId,
    initialCategoryId,
    initialSubtypeId,
    lang,
    onSave
}: ProjectTypeSelectorProps) {
    const { categories, subtypes, loading, error, getLocalizedName, getSubtypesByCategory } = usePropertyTypes(lang);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId || null);
    const [selectedSubtypeId, setSelectedSubtypeId] = useState<string | null>(initialSubtypeId || null);
    const [saving, setSaving] = useState(false);

    // Get translation dict based on lang
    const translations = lang === 'pt' ? propertyTypesPT : lang === 'es' ? propertyTypesES : propertyTypesEN;

    // Reset subtype when category changes
    useEffect(() => {
        if (selectedCategoryId && !initialSubtypeId) {
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
            // TODO: Save to database (projects table)
            // For now, just call the callback
            if (onSave) {
                onSave(selectedCategoryId, selectedSubtypeId);
            }
        } catch (err) {
            console.error('Error saving project type:', err);
        } finally {
            setSaving(false);
        }
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
                <p className="text-red-700 text-sm">Error loading property types: {error}</p>
            </div>
        );
    }

    const getTranslatedLevel = (level: string): string => {
        return translations.market_characteristics.levels[level as keyof typeof translations.market_characteristics.levels] || level;
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-lg font-bold text-[#081F2E] mb-1">
                    {lang === 'pt' ? 'Tipo de Projeto' : lang === 'es' ? 'Tipo de Proyecto' : 'Project Type'}
                </h3>
                <p className="text-sm text-gray-500">
                    {lang === 'pt'
                        ? 'Selecione a categoria e o subtipo do projeto para configurar métricas adequadas.'
                        : lang === 'es'
                            ? 'Seleccione la categoría y el subtipo del proyecto para configurar métricas adecuadas.'
                            : 'Select the project category and subtype to configure appropriate metrics.'}
                </p>
            </div>

            {/* Category Selector */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {lang === 'pt' ? 'Categoria Principal' : lang === 'es' ? 'Categoría Principal' : 'Main Category'}
                </label>
                <select
                    value={selectedCategoryId || ''}
                    onChange={(e) => setSelectedCategoryId(e.target.value || null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
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

            {/* Market Characteristics */}
            {currentSubtype && (
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-xl border border-cyan-100 animate-fadeIn">
                    <h4 className="text-sm font-bold text-cyan-900 mb-3">
                        {lang === 'pt' ? 'Características de Mercado' : lang === 'es' ? 'Características de Mercado' : 'Market Characteristics'}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Income Level */}
                        <div className="bg-white/70 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">
                                {translations.market_characteristics.income_level}
                            </p>
                            <p className="text-sm font-bold text-gray-900 capitalize">
                                {getTranslatedLevel(currentSubtype.typical_income_level)}
                            </p>
                        </div>

                        {/* Liquidity */}
                        <div className="bg-white/70 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">
                                {translations.market_characteristics.liquidity}
                            </p>
                            <p className="text-sm font-bold text-gray-900 capitalize">
                                {getTranslatedLevel(currentSubtype.typical_liquidity)}
                            </p>
                        </div>

                        {/* Complexity */}
                        <div className="bg-white/70 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">
                                {translations.market_characteristics.complexity}
                            </p>
                            <p className="text-sm font-bold text-gray-900 capitalize">
                                {getTranslatedLevel(currentSubtype.typical_complexity)}
                            </p>
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

            {/* Save Button */}
            {selectedCategoryId && selectedSubtypeId && onSave && (
                <div className="pt-4 border-t border-gray-100">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving
                            ? (lang === 'pt' ? 'Salvando...' : lang === 'es' ? 'Guardando...' : 'Saving...')
                            : (lang === 'pt' ? 'Salvar Tipo de Projeto' : lang === 'es' ? 'Guardar Tipo de Proyecto' : 'Save Project Type')}
                    </button>
                </div>
            )}
        </div>
    );
}
