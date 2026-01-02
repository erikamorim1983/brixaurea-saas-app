'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { FloorPlan } from './FloorPlanLibraryTab';

interface FloorPlanFormProps {
    plan?: FloorPlan | null;
    subtypes: any[];
    getLocalizedName: (subtype: any) => string;
    onSave: (plan: Partial<FloorPlan>) => Promise<void>;
    onCancel: () => void;
    dict: any;
    userId: string;
}

export default function FloorPlanForm({ plan, subtypes, getLocalizedName, onSave, onCancel, dict, userId }: FloorPlanFormProps) {
    const supabase = createClient();
    const [mounted, setMounted] = useState(false);

    const [formData, setFormData] = useState<Partial<FloorPlan>>({
        plan_name: plan?.plan_name || '',
        plan_code: plan?.plan_code || '',
        subtype_id: plan?.subtype_id || '',
        bedrooms: plan?.bedrooms || 0,
        bathrooms: plan?.bathrooms || 0,
        half_baths: plan?.half_baths || 0,
        suites: plan?.suites || 0,
        garages: plan?.garages || 0,
        stories: plan?.stories || 1,
        plan_width_lf: plan?.plan_width_lf || 0,
        plan_depth_lf: plan?.plan_depth_lf || 0,
        has_pool: plan?.has_pool || false,
        living_area_sqft: plan?.living_area_sqft || 0,
        entry_area_sqft: plan?.entry_area_sqft || 0,
        lanai_area_sqft: plan?.lanai_area_sqft || 0,
        garage_area_sqft: plan?.garage_area_sqft || 0,
        total_const_area_sqft: plan?.total_const_area_sqft || 0,
        area_sqft: plan?.area_sqft || 0,
        area_outdoor: plan?.area_outdoor || 0,
        area_total: plan?.area_total || 0,
        standard_cost_sqft: plan?.standard_cost_sqft || 0,
        standard_price_sqft: plan?.standard_price_sqft || 0,
        notes: plan?.notes || '',
        is_template: plan?.is_template || false,
        file_url: plan?.file_url || '',
    });

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        const total = (formData.living_area_sqft || 0) +
            (formData.entry_area_sqft || 0) +
            (formData.lanai_area_sqft || 0) +
            (formData.garage_area_sqft || 0);

        setFormData(prev => ({
            ...prev,
            total_const_area_sqft: total,
            area_sqft: formData.living_area_sqft,
            area_outdoor: (formData.entry_area_sqft || 0) + (formData.lanai_area_sqft || 0),
            area_total: total
        }));
    }, [formData.living_area_sqft, formData.entry_area_sqft, formData.lanai_area_sqft, formData.garage_area_sqft]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;
            const filePath = `floor-plans/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('project-assets').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('project-assets').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, file_url: publicUrl }));
        } catch (err) {
            console.error('Error uploading:', err);
            alert('Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
        } finally {
            setSaving(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in duration-200">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                {plan ? (dict.edit_plan || 'Editar Planta') : (dict.new_plan || 'Nova Planta')}
                            </h2>
                            <p className="text-gray-500 mt-1">Configure os detalhes técnicos da planta.</p>
                        </div>
                        <button type="button" onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                                <h3 className="font-bold text-lg text-cyan-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                                    Informações Básicas
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{dict.plan_name || 'Nome da Planta'}</label>
                                        <input type="text" required value={formData.plan_name} onChange={e => setFormData({ ...formData, plan_name: e.target.value })} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Ex: Victoria Model" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{dict.plan_code || 'Código'}</label>
                                        <input type="text" value={formData.plan_code} onChange={e => setFormData({ ...formData, plan_code: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none" placeholder="FA-01" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                                        <select value={formData.subtype_id} onChange={e => setFormData({ ...formData, subtype_id: e.target.value })} className="w-full px-4 py-2 border rounded-xl outline-none">
                                            <option value="">Selecione...</option>
                                            {subtypes.map((s: any) => <option key={s.id} value={s.id}>{getLocalizedName(s)}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                                <h3 className="font-bold text-lg text-cyan-800 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                                    Configuração Comôdos
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{dict.bedrooms || 'Quartos'}</label>
                                        <input type="number" min="0" value={formData.bedrooms} onChange={e => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{dict.bathrooms || 'Banheiros'}</label>
                                        <input type="number" min="0" value={formData.bathrooms} onChange={e => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{dict.half_baths || 'Lavabos'}</label>
                                        <input type="number" min="0" value={formData.half_baths} onChange={e => setFormData({ ...formData, half_baths: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg outline-none text-cyan-600 font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{dict.garages || 'Garagem'}</label>
                                        <input type="number" min="0" value={formData.garages} onChange={e => setFormData({ ...formData, garages: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg outline-none" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 pt-2">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="has_pool" checked={formData.has_pool} onChange={e => setFormData({ ...formData, has_pool: e.target.checked })} className="w-5 h-5 text-cyan-600" />
                                        <label htmlFor="has_pool" className="text-sm font-medium">Com Piscina</label>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase mr-2">Stories:</label>
                                        <input type="number" min="1" value={formData.stories} onChange={e => setFormData({ ...formData, stories: parseInt(e.target.value) || 1 })} className="w-12 border-b border-gray-300 focus:border-cyan-500 text-center outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl space-y-4 shadow-inner border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-lg text-cyan-800 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                                        Benchmarks Referência
                                    </h3>
                                    <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-black uppercase">⚠️ REG. VAR</span>
                                </div>
                                <p className="text-[11px] text-amber-600/80 leading-relaxed italic border-l-2 border-amber-200 pl-3">
                                    Os valores abaixo são referências de mercado para auxiliar no cálculo rápido. Lembre-se que custos de construção e preços de venda variam drasticamente por região.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{dict.standard_cost_sqft || 'Custo/sqft'} (Const.)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                                            <input type="number" min="0" step="0.01" value={formData.standard_cost_sqft} onChange={e => setFormData({ ...formData, standard_cost_sqft: parseFloat(e.target.value) || 0 })} className="w-full pl-7 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">{dict.standard_price_sqft || 'Venda/sqft'} (Venda)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                                            <input type="number" min="0" step="0.01" value={formData.standard_price_sqft} onChange={e => setFormData({ ...formData, standard_price_sqft: parseFloat(e.target.value) || 0 })} className="w-full pl-7 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-cyan-600 font-bold text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-cyan-50/50 p-6 rounded-2xl space-y-4 border border-cyan-100">
                                <h3 className="font-bold text-lg text-cyan-900 flex justify-between">
                                    <span>Cálculo Áreas</span>
                                    <span className="text-xs bg-cyan-100 px-2 py-1 rounded-full text-cyan-600">Auto-calc</span>
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-cyan-700 uppercase mb-1">Living</label>
                                        <input type="number" min="0" value={formData.living_area_sqft} onChange={e => setFormData({ ...formData, living_area_sqft: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-cyan-200 rounded-lg text-right font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-cyan-700 uppercase mb-1">Entry</label>
                                        <input type="number" min="0" value={formData.entry_area_sqft} onChange={e => setFormData({ ...formData, entry_area_sqft: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-cyan-200 rounded-lg text-right font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-cyan-700 uppercase mb-1">Lanai</label>
                                        <input type="number" min="0" value={formData.lanai_area_sqft} onChange={e => setFormData({ ...formData, lanai_area_sqft: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-cyan-200 rounded-lg text-right font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-cyan-700 uppercase mb-1">Garage</label>
                                        <input type="number" min="0" value={formData.garage_area_sqft} onChange={e => setFormData({ ...formData, garage_area_sqft: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-cyan-200 rounded-lg text-right font-bold" />
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-cyan-200 flex justify-between items-center font-black">
                                        <span className="text-cyan-900">TOTAL CONST.</span>
                                        <span className="text-cyan-600">{formData.total_const_area_sqft?.toLocaleString()} SF</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                                <h3 className="font-bold text-lg text-gray-800">Dimensões Plan</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" step="0.1" value={formData.plan_width_lf || ''} onChange={e => setFormData({ ...formData, plan_width_lf: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" placeholder="Width" />
                                    <input type="number" step="0.1" value={formData.plan_depth_lf || ''} onChange={e => setFormData({ ...formData, plan_depth_lf: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" placeholder="Depth" />
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl space-y-4 border-2 border-dashed border-gray-200 hover:border-cyan-300 transition-colors">
                                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    Arquivos do Projeto
                                </h3>
                                <div>
                                    <label className="block w-full border-2 border-dashed border-cyan-100 rounded-xl p-4 text-center cursor-pointer hover:bg-cyan-50 transition-all">
                                        <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                                        {uploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent animate-spin rounded-full"></div>
                                                <span className="text-xs font-bold text-cyan-600">Enviando...</span>
                                            </div>
                                        ) : formData.file_url ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-xs font-bold text-green-600">Arquivo Carregado! ✅</span>
                                                <span className="text-[10px] text-gray-400 truncate max-w-[200px]">{formData.file_url}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-xs font-bold text-gray-600">Clique para enviar Memorial/PDF</span>
                                                <span className="text-[10px] text-gray-400">PDF, Word ou Imagem (Máx 10MB)</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex gap-4">
                        <button type="button" onClick={onCancel} className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all">Cancelar</button>
                        <button type="submit" disabled={saving || !formData.plan_name || uploading} className="flex-[2] px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-2xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-xl disabled:opacity-50">
                            {saving ? 'Salvando...' : 'Salvar Planta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    if (!mounted) return null;

    return createPortal(modalContent, document.body);
}
