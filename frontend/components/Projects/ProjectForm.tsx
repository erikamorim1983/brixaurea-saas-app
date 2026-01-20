'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Autocomplete from 'react-google-autocomplete';
import { usePropertyTypes } from '@/hooks/usePropertyTypes';

// --- Schema Definition ---
const projectSchema = z.object({
    name: z.string().min(3, "min_3_chars"),
    address_full: z.string().min(5, "required"),
    city: z.string().optional(),
    state: z.string().optional(),
    state_code: z.string().optional(), // 2-letter state code
    zip_code: z.string().optional(),
    lot_size_sqft: z.number().optional(),
    zoning_code: z.string().optional(),
    // Hidden fields for precise location
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    google_place_id: z.string().optional(),
    category_id: z.string().min(1, "required"),
    subtype_id: z.string().min(1, "required"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
    userId: string;
    lang: string;
    dictionary: any;
}

export default function ProjectForm({ userId, lang, dictionary }: ProjectFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const { categories, subtypes, getLocalizedName } = usePropertyTypes(lang);

    const t = dictionary.projects?.new?.form || {};
    const tErrors = dictionary.projects?.new?.errors || {};

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        formState: { errors }
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
    });

    // We still keep the Zip Code watcher as a fallback/secondary method
    // if the user types Zip first instead of using Autocomplete
    const zipCode = watch('zip_code');

    // Debug: Log validation errors
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.warn("Project Form Validation Errors:", errors);
        }
    }, [errors]);


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPlaceSelected = (place: any) => {
        if (!place) return;

        // 1. Address Full
        const address = place.formatted_address || place.name;
        setValue('address_full', address, { shouldValidate: true });

        // 2. Parse Components
        let city = '';
        let stateFullName = '';
        let stateCode = ''; // 2-letter abbreviation
        let zip = '';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (place.address_components) {
            place.address_components.forEach((comp: any) => {
                if (comp.types.includes('locality')) city = comp.long_name;
                if (!city && comp.types.includes('sublocality')) city = comp.long_name; // Fallback

                if (comp.types.includes('administrative_area_level_1')) {
                    stateFullName = comp.long_name; // "Florida"
                    stateCode = comp.short_name;   // "FL"
                }

                if (comp.types.includes('postal_code')) zip = comp.long_name;
            });
        }

        // Save all extracted data
        if (city) setValue('city', city, { shouldValidate: true });
        if (stateFullName) setValue('state', stateFullName, { shouldValidate: true });
        if (stateCode) setValue('state_code', stateCode, { shouldValidate: true });
        if (zip) setValue('zip_code', zip, { shouldValidate: true });

        // Log for debugging
        console.log('[ProjectForm] Extracted Address Data:', {
            address_full: address,
            city,
            state: stateFullName,
            state_code: stateCode,
            zip_code: zip,
            place_id: place.place_id
        });

        // 3. Coordinates & Place ID
        if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setValue('latitude', lat);
            setValue('longitude', lng);
        }

        if (place.place_id) {
            setValue('google_place_id', place.place_id);
        }

        clearErrors();
    };


    const onSubmit = async (data: ProjectFormData) => {
        setIsSubmitting(true);
        setErrorMsg(null);

        const supabase = createClient();

        try {
            // 1. Create Project
            const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .insert({
                    user_id: userId,
                    name: data.name,
                    status: 'draft',
                    category_id: data.category_id,
                    subtype_id: data.subtype_id
                })
                .select()
                .single();

            if (projectError) throw projectError;

            // 2. Create Location
            const { error: locationError } = await supabase
                .from('project_locations')
                .insert({
                    project_id: projectData.id,
                    address_full: data.address_full,
                    city: data.city,
                    state: data.state,
                    state_code: data.state_code, // 2-letter code for API queries
                    zip_code: data.zip_code,
                    country: 'USA',
                    zoning_code: data.zoning_code,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    google_place_id: data.google_place_id,
                });

            if (locationError) throw locationError;

            // Success! Redirect
            router.push(`/${lang}/dashboard/analysis?projectId=${projectData.id}`);
            router.refresh();

        } catch (err: any) {
            console.error("Error creating project:", err);
            setErrorMsg(err.message || tErrors.creation_failed || "Error creating project");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to get error message
    const getErrorMessage = (errorKey: string | undefined) => {
        if (!errorKey) return null;
        // Map schema codes to dictionary
        if (errorKey === "min_3_chars") return tErrors.name_min;
        if (errorKey === "required") return tErrors.address_required; // Generic required fallback
        if (errorKey === "state_len") return tErrors.state_len;
        if (errorKey === "zip_invalid") return tErrors.zip_invalid;
        return errorKey; // Fallback to raw message
    };

    return (
        <div className="w-full max-w-2xl bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#081F2E]">{dictionary.projects?.new?.title || 'Novo Projeto'}</h2>
                <p className="text-gray-600 mt-2">{dictionary.projects?.new?.subtitle || 'Inicie um estudo.'}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* 1. Project Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.name || 'Nome do Projeto'}</label>
                    <input
                        {...register('name')}
                        type="text"
                        placeholder={t.name_placeholder}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.name ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'} focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.name.message)}</p>}
                </div>

                {/* 2. Full Address (Autocomplete) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.address || 'Endereço'}</label>
                    <Autocomplete
                        apiKey={apiKey}
                        onPlaceSelected={onPlaceSelected}
                        options={{
                            types: ["address"],
                            fields: ["formatted_address", "address_components", "geometry", "place_id", "name"],
                            componentRestrictions: { country: "us" }
                        }}
                        defaultValue={watch('address_full')}
                        placeholder={t.address_placeholder}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.address_full ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'} focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50`}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue('address_full', e.target.value, { shouldValidate: true })}
                    />
                    {/* Invisible register for address_full since Autocomplete doesn't use the ref easily */}
                    <input type="hidden" {...register('address_full')} />
                    {errors.address_full && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.address_full.message)}</p>}
                </div>

                {/* 3. Category & Subtype */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{dictionary.analysis?.overview?.project_type || 'Tipo de Projeto'}</label>
                        <select
                            {...register('category_id')}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.category_id ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'} focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 bg-white`}
                        >
                            <option value="">{dictionary.analysis?.overview?.select_type || 'Seleccione...'}</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{getLocalizedName(cat)}</option>
                            ))}
                        </select>
                        {errors.category_id && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.category_id.message)}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{dictionary.projects?.list?.typology_label || 'Tipologia'}</label>
                        <select
                            {...register('subtype_id')}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.subtype_id ? 'border-red-400' : 'border-gray-200 focus:border-[#00D9FF]'} focus:outline-none focus:ring-2 focus:ring-[#00D9FF]/50 bg-white`}
                            disabled={!watch('category_id')}
                        >
                            <option value="">{dictionary.analysis?.overview?.select_type || 'Seleccione...'}</option>
                            {subtypes
                                .filter(st => st.category_id === watch('category_id'))
                                .map((st) => (
                                    <option key={st.id} value={st.id}>{getLocalizedName(st)}</option>
                                ))}
                        </select>
                        {errors.subtype_id && <p className="text-red-500 text-sm mt-1">{getErrorMessage(errors.subtype_id.message)}</p>}
                    </div>
                </div>

                {/* 3. Hidden Location Details (Auto-filled) */}
                <div className="hidden">
                    <input {...register('zip_code')} type="hidden" />
                    <input {...register('city')} type="hidden" />
                    <input {...register('state')} type="hidden" />
                    <input {...register('zoning_code')} type="hidden" />
                </div>


                {errorMsg && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {errorMsg}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gradient-to-r from-[#00D9FF] to-[#0EA5E9] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                {t.saving || 'Salvando...'}
                            </>
                        ) : (
                            <>{t.submit || 'Criar Projeto'}</>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
