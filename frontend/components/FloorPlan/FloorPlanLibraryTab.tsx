'use client';

import FloorPlanForm from './FloorPlanForm';
import FloorPlanCard from './FloorPlanCard';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePropertyTypes } from '@/hooks/usePropertyTypes';

export interface FloorPlan {
    id: string;
    plan_name: string;
    plan_code?: string;
    subtype_id?: string;
    bedrooms?: number;
    bathrooms?: number;
    half_baths?: number;
    suites?: number;
    garages?: number;
    stories?: number;
    plan_width_lf?: number;
    plan_depth_lf?: number;
    has_pool?: boolean;
    living_area_sqft?: number;
    entry_area_sqft?: number;
    lanai_area_sqft?: number;
    garage_area_sqft?: number;
    total_const_area_sqft?: number;
    area_sqft?: number;
    area_outdoor?: number;
    area_total?: number;
    standard_cost_sqft?: number;
    standard_price_sqft?: number;
    notes?: string;
    is_template: boolean;
    file_url?: string;
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

    useEffect(() => {
        if (filterSubtype === 'all') {
            setFilteredPlans(plans);
        } else {
            setFilteredPlans(plans.filter(p => p.subtype_id === filterSubtype));
        }
    }, [filterSubtype, plans]);

    const handleSavePlan = async (planData: Partial<FloorPlan>) => {
        try {
            if (editingPlan) {
                const { error } = await supabase
                    .from('floor_plan_library')
                    .update(planData)
                    .eq('id', editingPlan.id);
                if (error) throw error;
                setPlans(plans.map(p => p.id === editingPlan.id ? { ...p, ...planData } as FloorPlan : p));
            } else {
                const { data, error } = await supabase
                    .from('floor_plan_library')
                    .insert({ ...planData, user_id: userId })
                    .select()
                    .single();
                if (error) throw error;
                setPlans([data, ...plans]);
            }
            setShowForm(false);
            setEditingPlan(null);
        } catch (err) {
            console.error('Error saving plan:', err);
            alert('Error saving floor plan.');
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
                </div>
                <button
                    onClick={() => { setEditingPlan(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {t.new_plan}
                </button>
            </div>

            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t.filter_by_type}:</label>
                <select
                    value={filterSubtype}
                    onChange={(e) => setFilterSubtype(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-50 text-sm"
                >
                    <option value="all">{t.all_types}</option>
                    {subtypes.map((subtype) => (
                        <option key={subtype.id} value={subtype.id}>{getLocalizedName(subtype)}</option>
                    ))}
                </select>
            </div>

            {filteredPlans.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.no_plans}</h3>
                    <button onClick={() => setShowForm(true)} className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">{t.new_plan}</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlans.map((plan) => (
                        <FloorPlanCard
                            key={plan.id}
                            plan={plan}
                            subtypes={subtypes}
                            getLocalizedName={getLocalizedName}
                            onEdit={() => { setEditingPlan(plan); setShowForm(true); }}
                            onDelete={() => { }}
                            dict={t}
                        />
                    ))}
                </div>
            )}

            {showForm && (
                <FloorPlanForm
                    plan={editingPlan}
                    subtypes={subtypes}
                    getLocalizedName={getLocalizedName}
                    onSave={handleSavePlan}
                    onCancel={() => setShowForm(false)}
                    dict={t}
                    userId={userId}
                />
            )}
        </div>
    );
}
