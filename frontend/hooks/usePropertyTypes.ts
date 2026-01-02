'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

export interface PropertyCategory {
    id: string;
    key: string;
    name_en: string;
    name_pt: string;
    name_es: string;
    description: string;
    icon: string;
    sort_order: number;
}

export interface PropertySubtype {
    id: string;
    category_id: string;
    key: string;
    name_en: string;
    name_pt: string;
    name_es: string;
    description: string;
    typical_income_level: string;
    typical_liquidity: string;
    typical_complexity: string;
    relevant_fields: any;
    sort_order: number;
}

export function usePropertyTypes(lang: string) {
    const supabase = createClient();
    const [categories, setCategories] = useState<PropertyCategory[]>([]);
    const [subtypes, setSubtypes] = useState<PropertySubtype[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchPropertyTypes() {
            try {
                setLoading(true);
                setError(null);

                // Fetch categories
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('property_categories')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order');

                if (categoriesError) throw categoriesError;

                // Fetch subtypes
                const { data: subtypesData, error: subtypesError } = await supabase
                    .from('property_subtypes')
                    .select('*')
                    .eq('is_active', true)
                    .order('sort_order');

                if (subtypesError) throw subtypesError;

                setCategories(categoriesData || []);
                setSubtypes(subtypesData || []);
            } catch (err: any) {
                console.error('Error fetching property types:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPropertyTypes();
    }, [supabase]);

    // Helper to get localized name
    const getLocalizedName = (item: PropertyCategory | PropertySubtype): string => {
        if (lang === 'pt') return item.name_pt;
        if (lang === 'es') return item.name_es;
        return item.name_en;
    };

    // Helper to get subtypes for a category
    const getSubtypesByCategory = (categoryId: string): PropertySubtype[] => {
        return subtypes.filter(st => st.category_id === categoryId);
    };

    return {
        categories,
        subtypes,
        loading,
        error,
        getLocalizedName,
        getSubtypesByCategory
    };
}
