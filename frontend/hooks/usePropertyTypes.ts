'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import propertyTypesPT from '@/dictionaries/property-types-pt.json';
import propertyTypesEN from '@/dictionaries/property-types-en.json';
import propertyTypesES from '@/dictionaries/property-types-es.json';

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

export interface PropertyStandard {
    id: string;
    key: string;
    name_en: string;
    name_pt: string;
    name_es: string;
    sort_order: number;
}

export function usePropertyTypes(lang: string) {
    const supabase = createClient();
    const [categories, setCategories] = useState<PropertyCategory[]>([]);
    const [subtypes, setSubtypes] = useState<PropertySubtype[]>([]);
    const [standards, setStandards] = useState<PropertyStandard[]>([]);
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

                // Fetch standards
                const { data: standardsData, error: standardsError } = await supabase
                    .from('property_standards')
                    .select('*')
                    .order('sort_order');

                // If property_standards doesn't exist yet (migration not run), just use empty array
                if (standardsError) {
                    console.warn('Property standards table not found or error. Migration might be pending.');
                }

                setCategories(categoriesData || []);
                setSubtypes(subtypesData || []);
                setStandards(standardsData || []);
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
    const getLocalizedName = (item: PropertyCategory | PropertySubtype | PropertyStandard): string => {
        const isPt = lang?.startsWith('pt');
        const isEs = lang?.startsWith('es');
        const propDict: any = isPt ? propertyTypesPT : (isEs ? propertyTypesES : propertyTypesEN);

        // Try to find in dictionary first
        if ('category_id' in item) { // It's a subtype
            if (propDict.property_subtypes?.[item.key]) {
                return propDict.property_subtypes[item.key];
            }
        } else if ('icon' in item) { // It's a category
            if (propDict.property_categories?.[item.key]?.name) {
                return propDict.property_categories[item.key].name;
            }
        } else { // It's a standard
            if (propDict.property_standards?.[item.key]) {
                return propDict.property_standards[item.key];
            }
        }

        // Fallback to database names
        if (isPt) return item.name_pt;
        if (isEs) return item.name_es;
        return item.name_en;
    };

    // Helper to get subtypes for a category
    const getSubtypesByCategory = (categoryId: string): PropertySubtype[] => {
        return subtypes.filter(st => st.category_id === categoryId);
    };

    return {
        categories,
        subtypes,
        standards,
        loading,
        error,
        getLocalizedName,
        getSubtypesByCategory
    };
}
