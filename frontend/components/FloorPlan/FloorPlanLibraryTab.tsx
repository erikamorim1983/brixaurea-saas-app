'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePropertyTypes } from '@/hooks/usePropertyTypes';

interface FloorPlan {
    id: string;
    plan_name: string;
    plan_code?: string;
    subtype_id?: string;
    bedrooms?: number;
    bathrooms?: number;
    suites?: number;
    garages?: number;
    area_sqft?: number;
    area_outdoor?: number;
    area_total?: number;
    standard_cost_sqft?: number;
    standard_price_sqft?: number;
    notes?: string;
    is_template: boolean;
    created_at: string;
}

interface FloorPlanLibraryTabProps {
    userId: string;
    lang: string;
    dict: any;
}

export default function FloorPlanLibraryTab({ userId, lang, dict }: FloorPlanLibraryTabProps) {
    const supabase = createClient();
    const { subtypes, loading: typesLoading, getLocalizedName } = usePropertyTypes(lang);

    const [plans, setPlans] = useState<FloorPlan[]>([]);
    const [filteredPlans, setFilteredPlans] = useState<FloorPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState<FloorPlan | null>(null);
    const [filterSubtype, setFilterSubtype] = useState<string>('all');

    const t = dict.floor_plan_library;

    // Fetch floor plans
    useEffect(() => {
        async function fetchPlans() {
            try {
                const { data, error } = await supabase
                    .from('floor_plan_library')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                setPlans(data || []);
                setFilteredPlans(data || []);
            } catch (err) {
                console.error('Error fetching floor plans:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchPlans();
    }, [supabase]);

    // Filter plans by subtype
    useEffect(() => {
        if (filterSubtype === 'all') {
            setFilteredPlans(plans);
        } else {
            setFilteredPlans(plans.filter(p => p.subtype_id === filterSubtype));
        }
    }, [filterSubtype, plans]);

    const handleNewPlan = () => {
        setEditingPlan(null);
        setShowForm(true);
    };

    const handleEditPlan = (plan: FloorPlan) => {
        setEditingPlan(plan);
        setShowForm(true);
    };

    const handleDeletePlan = async (planId: string) => {
        if (!confirm(t.delete_confirm + '\n' + t.delete_warning)) return;

        try {
            const { error } = await supabase
                .from('floor_plan_library')
                .delete()
                .eq('id', planId);

            if (error) throw error;

            setPlans(plans.filter(p => p.id !== planId));
        } catch (err) {
            console.error('Error deleting plan:', err);
            alert('Error deleting floor plan');
        }
    };

    const handleSavePlan = async (planData: Partial<FloorPlan>) => {
        try {
            if (editingPlan) {
                // Update
                const { error } = await supabase
                    .from('floor_plan_library')
                    .update(planData)
                    .eq('id', editingPlan.id);

                if (error) throw error;

                setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...planData } as FloorPlan : p));
            } else {
                // Insert
                const { data, error } = await supabase
                    .from('floor_plan_library')
                    .insert(planData)
                    .select()
                    .single();

                if (error) throw error;

                setPlans([data, ...plans]);
            }

            setShowForm(false);
            setEditingPlan(null);
        } catch (err) {
            console.error('Error saving plan:', err);
            alert('Error saving floor plan');
        }
    };

    if (loading || typesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">{dict.loading || 'Loading...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
                </div>
                <button
                    onClick={handleNewPlan}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {t.new_plan}
                </button>
            </div>

            {/* Filter */}
            {subtypes.length > 0 && (
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">{t.filter_by_type}:</label>
                    <select
                        value={filterSubtype}
                        onChange={(e) => setFilterSubtype(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="all">{t.all_types}</option>
                        {subtypes.map((subtype) => (
                            <option key={subtype.id} value={subtype.id}>
                                {getLocalizedName(subtype)}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-500">
                        {filteredPlans.length} {t.plans_count}
                    </span>
                </div>
            )}

            {/* Plans Grid */}
            {filteredPlans.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.no_plans}</h3>
                    <p className="text-sm text-gray-500 mb-4">{t.no_plans_hint}</p>
                    <button
                        onClick={handleNewPlan}
                        className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                        {t.new_plan}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlans.map((plan) => (
                        <FloorPlanCard
                            key={plan.id}
                            plan={plan}
                            subtypes={subtypes}
                            getLocalizedName={getLocalizedName}
                            onEdit={() => handleEditPlan(plan)}
                            onDelete={() => handleDeletePlan(plan.id)}
                            dict={t}
                        />
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <FloorPlanForm
                    plan={editingPlan}
                    subtypes={subtypes}
                    getLocalizedName={getLocalizedName}
                    onSave={handleSavePlan}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingPlan(null);
                    }}
                    dict={t}
                />
            )}
        </div>
    );
}

// Floor Plan Card Component
function FloorPlanCard({ plan, subtypes, getLocalizedName, onEdit, onDelete, dict }: any) {
    const subtype = subtypes.find((st: any) => st.id === plan.subtype_id);

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.plan_name}</h3>
                        {plan.plan_code && (
                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">{plan.plan_code}</span>
                        )}
                    </div>
                    {plan.is_template && (
                        <span className="bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded-full font-semibold">Template</span>
                    )}
                </div>

                {subtype && (
                    <p className="text-sm text-gray-600 mb-3">{getLocalizedName(subtype)}</p>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    {plan.bedrooms !== undefined && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">🛏️</span>
                            <span className="font-medium">{plan.bedrooms} {dict.bedrooms}</span>
                        </div>
                    )}
                    {plan.bathrooms !== undefined && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">🚿</span>
                            <span className="font-medium">{plan.bathrooms} {dict.bathrooms}</span>
                        </div>
                    )}
                    {plan.area_total && (
                        <div className="col-span-2 text-cyan-700 font-bold">
                            📐 {plan.area_total.toLocaleString()} sqft
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                        onClick={onEdit}
                        className="flex-1 px-3 py-2 text-sm text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors border border-cyan-200"
                    >
                        {dict.edit_plan}
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Floor Plan Form Component (simplified - will be expanded)
function FloorPlanForm({ plan, subtypes, getLocalizedName, onSave, onCancel, dict }: any) {
    const [formData, setFormData] = useState({
        plan_name: plan?.plan_name || '',
        plan_code: plan?.plan_code || '',
        subtype_id: plan?.subtype_id || '',
        bedrooms: plan?.bedrooms || 0,
        bathrooms: plan?.bathrooms || 0,
        suites: plan?.suites || 0,
        garages: plan?.garages || 0,
        area_sqft: plan?.area_sqft || 0,
        area_outdoor: plan?.area_outdoor || 0,
        area_total: plan?.area_total || 0,
        standard_cost_sqft: plan?.standard_cost_sqft || 0,
        standard_price_sqft: plan?.standard_price_sqft || 0,
        notes: plan?.notes || '',
        is_template: plan?.is_template || false,
    });

    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await onSave(formData);
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {plan ? dict.edit_plan : dict.new_plan}
                        </h2>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{dict.plan_name}</label>
                            <input
                                type="text"
                                required
                                value={formData.plan_name}
                                onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Ex: Studio Moderno"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{dict.plan_code}</label>
                            <input
                                type="text"
                                value={formData.plan_code}
                                onChange={(e) => setFormData({ ...formData, plan_code: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="Ex: STD-01"
                            />
                        </div>
                    </div>

                    {/* Subtype */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Planta</label>
                        <select
                            value={formData.subtype_id}
                            onChange={(e) => setFormData({ ...formData, subtype_id: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">Selecione...</option>
                            {subtypes.map((subtype: any) => (
                                <option key={subtype.id} value={subtype.id}>
                                    {getLocalizedName(subtype)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Characteristics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{dict.bedrooms}</label>
                            <input
                                type="number"
                                step="0.5"
                                value={formData.bedrooms}
                                onChange={(e) => setFormData({ ...formData, bedrooms: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{dict.bathrooms}</label>
                            <input
                                type="number"
                                step="0.5"
                                value={formData.bathrooms}
                                onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{dict.suites}</label>
                            <input
                                type="number"
                                value={formData.suites}
                                onChange={(e) => setFormData({ ...formData, suites: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{dict.garages}</label>
                            <input
                                type="number"
                                value={formData.garages}
                                onChange={(e) => setFormData({ ...formData, garages: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                    </div>

                    {/* Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{dict.area_sqft}</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.area_sqft}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setFormData({
                                        ...formData,
                                        area_sqft: val,
                                        area_total: val + (formData.area_outdoor || 0)
                                    });
                                }}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{dict.area_outdoor}</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.area_outdoor}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setFormData({
                                        ...formData,
                                        area_outdoor: val,
                                        area_total: (formData.area_sqft || 0) + val
                                    });
                                }}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{dict.area_total}</label>
                            <input
                                type="number"
                                disabled
                                value={formData.area_total}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{dict.standard_cost_sqft}</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.standard_cost_sqft}
                                onChange={(e) => setFormData({ ...formData, standard_cost_sqft: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{dict.standard_price_sqft}</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.standard_price_sqft}
                                onChange={(e) => setFormData({ ...formData, standard_price_sqft: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{dict.notes}</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                            placeholder="Observações adicionais..."
                        />
                    </div>

                    {/* Template Toggle */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_template"
                            checked={formData.is_template}
                            onChange={(e) => setFormData({ ...formData, is_template: e.target.checked })}
                            className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <label htmlFor="is_template" className="text-sm font-medium text-gray-700">
                            {dict.is_template}
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            {dict.cancel}
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !formData.plan_name}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? dict.saving : dict.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
