'use client';

import { FloorPlan } from "./FloorPlanLibraryTab";

interface FloorPlanCardProps {
    plan: FloorPlan;
    subtypes: any[];
    getLocalizedName: (subtype: any) => string;
    onEdit: () => void;
    onDelete: () => void;
    dict: any;
}

export default function FloorPlanCard({ plan, subtypes, getLocalizedName, onEdit, onDelete, dict }: FloorPlanCardProps) {
    const subtype = subtypes.find((st: any) => st.id === plan.subtype_id);

    return (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
            {/* Top Bar with Code & Subtype */}
            <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest bg-cyan-50 px-2 py-0.5 rounded">
                    {plan.plan_code || 'NO-CODE'}
                </span>
                {subtype && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {getLocalizedName(subtype)}
                    </span>
                )}
            </div>

            {/* Image Preview */}
            {plan.file_url && (
                <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative group-hover:bg-gray-200 transition-colors">
                    <img
                        src={plan.file_url}
                        alt={plan.plan_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90"
                        onError={(e) => {
                            // If it's a PDF or failed, hide image
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )}

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-gray-900 text-xl leading-tight group-hover:text-cyan-600 transition-colors">
                        {plan.plan_name}
                    </h3>
                    {plan.is_template && (
                        <div className="bg-gradient-to-tr from-cyan-500 to-blue-500 text-white text-[8px] px-2 py-1 rounded-full font-black uppercase">
                            Template
                        </div>
                    )}
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                    <div className="bg-gray-50 rounded-2xl p-3">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{dict.bedrooms}</p>
                        <p className="font-black text-gray-900">{plan.bedrooms || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Bath</p>
                        <p className="font-black text-gray-900">
                            {plan.bathrooms || 0}<span className="text-cyan-500 text-sm">.{plan.half_baths || 0}</span>
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-3">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{dict.garages}</p>
                        <p className="font-black text-gray-900">{plan.garages || 0}</p>
                    </div>
                </div>

                {/* Technical Details List */}
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-medium">Living Area</span>
                        <span className="font-bold text-gray-900">{plan.living_area_sqft?.toLocaleString() || 0} SF</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">{dict.total_const_area}</span>
                        <span className="font-black text-cyan-600 tracking-tighter">{plan.total_const_area_sqft?.toLocaleString() || 0} SF</span>
                    </div>
                    {plan.plan_width_lf && (
                        <div className="flex justify-between items-center text-[10px] pt-2 border-t border-gray-50">
                            <span className="text-gray-400 font-bold uppercase">{dict.dimensions}</span>
                            <span className="text-gray-700 font-black">{plan.plan_width_lf}LF x {plan.plan_depth_lf}LF</span>
                        </div>
                    )}
                </div>

                {/* Actions & File Link */}
                <div className="flex gap-2">
                    <button
                        onClick={onEdit}
                        className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-cyan-600 transition-all shadow-lg active:scale-95"
                    >
                        {dict.edit_plan}
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-3 py-2.5 bg-white border border-red-100 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center shadow-sm active:scale-95"
                        title={dict.delete_plan}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    {plan.file_url && (
                        <button
                            onClick={() => window.open(plan.file_url, '_blank')}
                            className="p-2.5 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-all border border-teal-100"
                            title="Ver Planta"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
