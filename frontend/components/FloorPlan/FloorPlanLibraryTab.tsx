'use client';

import FloorPlanForm from './FloorPlanForm';
import FloorPlanCard from './FloorPlanCard';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePropertyTypes } from '@/hooks/usePropertyTypes';
import { AnimatePresence, motion } from 'framer-motion';

export interface FloorPlan {
    id: string;
    plan_name: string;
    plan_code?: string;
    subtype_id?: string;
    organization_id?: string;
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
    architect_firm?: string;
    construction_duration_months?: number;
    construction_curve?: {
        type: 'linear' | 'custom';
        percentages: number[];
    };
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
    const [showSuccess, setShowSuccess] = useState(false);
    const [filterSubtype, setFilterSubtype] = useState<string>('all');
    const [orgId, setOrgId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            // 1. Try to find organization membership
            const { data: member } = await supabase
                .from('organization_members')
                .select('organization_id')
                .eq('member_user_id', userId)
                .maybeSingle();

            if (member?.organization_id) {
                setOrgId(member.organization_id);
            } else {
                // 2. Fallback: Check if they own an organization
                const { data: ownedOrg } = await supabase
                    .from('organizations')
                    .select('id')
                    .eq('owner_id', userId)
                    .maybeSingle();

                if (ownedOrg?.id) {
                    setOrgId(ownedOrg.id);
                }
            }
        };
        fetchUserData();
    }, [userId, supabase]);

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
                    .insert({ ...planData, user_id: userId, organization_id: orgId })
                    .select()
                    .single();
                if (error) throw error;
                setPlans([data, ...plans]);
            }
            setShowForm(false);
            setEditingPlan(null);

            // Show success message
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving plan:', err);
            alert('Error saving floor plan.');
        }
    };

    const handleDeletePlan = async (id: string) => {
        if (!confirm(dict.floor_plan_library?.delete_confirm || 'Are you sure you want to delete this plan?')) return;

        try {
            const { error } = await supabase
                .from('floor_plan_library')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setPlans(plans.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting plan:', err);
            alert('Error deleting floor plan.');
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t.title}</h2>
                    <p className="text-sm text-gray-500 font-medium">{t.subtitle}</p>
                </div>

                <div className="flex items-center gap-3">
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 flex items-center gap-2 border border-emerald-400"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                {t.save_success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => {
                            setEditingPlan(null);
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-cyan-100 hover:bg-cyan-700 transition-all active:scale-95"
                    >
                        <span className="text-xl leading-none">+</span>
                        {t.new_plan}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t.filter_by_type}:</label>
                <select
                    value={filterSubtype}
                    onChange={(e) => setFilterSubtype(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-50 text-sm"
                >
                    <option value="all">{t.all_types}</option>
                    {[
                        'single_family_generic',
                        'townhomes',
                        'fourplex',
                        'villas_patio_homes',
                        'garden_style_apartments',
                        'condos_low_rise'
                    ].map(key => {
                        const subtype = subtypes.find(s => s.key === key);
                        if (!subtype) return null;
                        return <option key={subtype.id} value={subtype.id}>{getLocalizedName(subtype)}</option>;
                    })}
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
                            onDelete={() => handleDeletePlan(plan.id)}
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
                />
            )}
        </div>
    );
}
