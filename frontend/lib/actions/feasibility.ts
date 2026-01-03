'use server';

import { createClient } from '@/lib/supabase/server';
import { LandDetails, LandOwner } from '../types/feasibility';
import { revalidatePath } from 'next/cache';

export async function getLandFeasibilityData(projectId: string) {
    const supabase = await createClient();

    // Fetch Land Details
    const { data: land, error: landError } = await supabase
        .from('land_details')
        .select('*')
        .eq('project_id', projectId)
        .single();

    // Fetch Project Location (for Acres) AND Project Type
    const { data: projectData } = await supabase
        .from('projects')
        .select('project_type, project_locations(lot_size_acres)')
        .eq('id', projectId)
        .single();

    if (landError && landError.code !== 'PGRST116') { // PGRST116 is "No rows returned"
        console.error('Error fetching land details:', JSON.stringify(landError, null, 2));
    }

    // Merge location data into land object
    // projectData might be nested: { project_type: '...', project_locations: { lot_size_acres: ... } }
    let lotSize = null;
    // Check if project_locations is array or object depending on relation? Usually object if 1:1, but select syntax matters
    // Actually easiest to fetch distinct

    // Let's stick to separate queries to be safe or verify Supabase return structure
    // But reducing queries is better.
    // Let's just do a separate fetch for project_type if it's on 'projects' table relative to project_locations on separate table

    const { data: project } = await supabase.from('projects').select('name, project_type').eq('id', projectId).single();
    const { data: location } = await supabase.from('project_locations').select('lot_size_acres, lot_width, lot_length, parcel_number, subdivision, zoning_code, latitude, longitude, address_full').eq('project_id', projectId).single();

    const mergedLand = {
        ...(land || {}),
        lot_size_acres: location?.lot_size_acres,
        lot_width: location?.lot_width,
        lot_length: location?.lot_length,
        parcel_number: location?.parcel_number,
        subdivision: location?.subdivision,
        zoning_code: location?.zoning_code,
        latitude: location?.latitude,
        longitude: location?.longitude,
        address_full: location?.address_full,
        project_name: project?.name,
        project_type: project?.project_type
    };

    // Fetch Land Owners
    const { data: owners, error: ownersError } = await supabase
        .from('land_owners')
        .select('*')
        .eq('project_id', projectId)
        .order('is_primary', { ascending: false });

    if (ownersError) {
        console.error('Error fetching land owners:', JSON.stringify(ownersError, null, 2));
    }

    return {
        land: mergedLand as LandDetails | null,
        owners: (owners || []) as LandOwner[]
    };
}

export async function saveLandFeasibility(
    projectId: string,
    landData: Partial<LandDetails>,
    ownersData: LandOwner[]
) {
    const supabase = await createClient();

    // Separate external fields
    const { lot_size_acres, lot_width, lot_length, parcel_number, subdivision, zoning_code, project_type, ...landDetailsPayload } = landData;

    // 1a. Update Project Locations (Acres & Dimensions)
    if (lot_size_acres !== undefined || lot_width !== undefined || lot_length !== undefined || parcel_number !== undefined || subdivision !== undefined || zoning_code !== undefined) {
        await supabase
            .from('project_locations')
            .upsert({
                project_id: projectId,
                lot_size_acres,
                lot_width,
                lot_length,
                parcel_number,
                subdivision,
                zoning_code
            });
    }

    // 1b. Update Project Type
    if (project_type !== undefined) {
        await supabase
            .from('projects')
            .update({ project_type, updated_at: new Date().toISOString() })
            .eq('id', projectId);
    }

    // Helper to sanitize numeric inputs (convert "" to null)
    const sanitizeNumeric = (val: any) => (val === '' || isNaN(Number(val))) ? null : Number(val);

    // Sanitize specific known numeric fields in landDetailsPayload
    // We shouldn't sanitize everything because some might be valid strings
    const numericFields = [
        'land_value', 'amount_cash', 'amount_seller_financing', 'amount_swap_monetary',
        'broker_commission_percent', 'broker_commission_amount', 'earnest_money_deposit',
        'due_diligence_period_days', 'closing_period_days', 'pursuit_budget',
        'far_utilization', 'demolition_cost_estimate', 'market_valuation', 'hoa_fees_monthly'
    ];

    const cleanedLandPayload = { ...landDetailsPayload };

    for (const key of numericFields) {
        if (Object.prototype.hasOwnProperty.call(cleanedLandPayload, key)) {
            const val = cleanedLandPayload[key as keyof typeof cleanedLandPayload];
            // If it's an empty string, set to null. 
            // Also handle string numbers by ensuring they are numbers.
            if (val === '' || val === undefined) {
                // Explicitly cast to any to allow null assignment if types are strict, 
                // though Partial<LandDetails> should allow undefined, DB allows null.
                (cleanedLandPayload as any)[key] = null;
            } else if (typeof val === 'string') {
                // Try parsing, if valid number use it, if empty string use null
                if (val.trim() === '') (cleanedLandPayload as any)[key] = null;
                else (cleanedLandPayload as any)[key] = Number(val);
            }
        }
    }

    // 1c. Upsert Land Details
    const { error: landError } = await supabase
        .from('land_details')
        .upsert({
            project_id: projectId,
            ...cleanedLandPayload,
            updated_at: new Date().toISOString()
        });

    if (landError) {
        console.error("SERVER ACTION ERROR (land_details):", landError);
        throw new Error(landError.message);
    }

    // 2. Handle Owners (Upsert and Delete removed)
    // Strategy: Get existing IDs, assume input list is the source of truth.
    // However, for simplicity in this MVP, we will upsert individually.
    // Ideally user might delete an owner in UI, so we should handle deletions.

    // For now, let's just upsert the provided owners.
    // If an owner has no ID, it's a create.

    for (const owner of ownersData) {
        const { error: ownerError } = await supabase
            .from('land_owners')
            .upsert({
                project_id: projectId, // Ensure project linked
                ...owner,
                updated_at: new Date().toISOString()
            });

        if (ownerError) throw new Error(`Error saving owner ${owner.name}: ${ownerError.message}`);
    }

    // 3. Auto-generate Cost Line Items (Cash Flow)
    await syncLandCostsToBudget(projectId, landData);

    revalidatePath(`/dashboard/projects/${projectId}/feasibility/land`);

    return { success: true };
}

async function syncLandCostsToBudget(projectId: string, land: Partial<LandDetails>) {
    const supabase = await createClient();

    // Get the Active Scenario ID (or create one main scenario)
    let scenarioId: string | null = null;

    const { data: scenarios } = await supabase
        .from('financial_scenarios')
        .select('id')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .limit(1);

    if (scenarios && scenarios.length > 0) {
        scenarioId = scenarios[0].id;
    } else {
        // Create default scenario if none exists
        const { data: newScenario } = await supabase
            .from('financial_scenarios')
            .insert({ project_id: projectId, name: 'Base Scenario', is_active: true })
            .select('id')
            .single();
        if (newScenario) scenarioId = newScenario.id;
    }

    if (!scenarioId) return;

    // Helper to upsert cost item by name
    const upsertCostItem = async (
        category: string,
        name: string,
        value: number | undefined,
        startMonth: number,
        distribution: string = 'linear'
    ) => {
        if (value === undefined || value === 0) return; // Skip zero values? Or maybe set to 0 to clear? 
        // For MVP, simple upsert based on name + scenario

        // Check if exists
        const { data: existing } = await supabase
            .from('cost_line_items')
            .select('id')
            .eq('scenario_id', scenarioId)
            .eq('item_name', name)
            .single();

        const payload = {
            scenario_id: scenarioId,
            category,
            item_name: name,
            input_value: value,
            total_estimated: value,
            calculation_method: 'fixed',
            start_month_offset: startMonth,
            distribution_curve: distribution,
            duration_months: 1, // Default to single month payout
            display_order: 0
        };

        if (existing) {
            await supabase.from('cost_line_items').update(payload).eq('id', existing.id);
        } else {
            await supabase.from('cost_line_items').insert(payload);
        }
    };

    // 1. Earnest Money Deposit (Month 0)
    await upsertCostItem('ACQUISITION', 'Earnest Money Deposit (EMD)', land.earnest_money_deposit, 0);

    // 2. Pursuit / Due Diligence Costs (During DD, Month 0-1)
    await upsertCostItem('SOFT_COSTS', 'Pursuit Costs (Due Diligence)', land.pursuit_budget, 0);

    // 3. Brokerage (At Closing)
    // Assume Closing is after DD Period. 
    // Logic: Month = ceil( (DD Days + Closing Days) / 30 )
    const daysToClose = (land.due_diligence_period_days || 0) + (land.closing_period_days || 0);
    const closingMonth = Math.ceil(daysToClose / 30);

    await upsertCostItem('ACQUISITION', 'Land Brokerage Fee', land.broker_commission_amount, closingMonth);

    // 4. Closing Costs (At Closing)
    await upsertCostItem('ACQUISITION', 'Closing Costs & Taxes', land.closing_costs_total, closingMonth);

    // 5. Land Acquisition (Remaining Principal)
    // This is complex. If cash, full amount at closing (minus EMD). 
    // If seller financing, down payment at closing.
    // For MVP, let's simplify: 

    let acquisitionAtClosing = 0;

    if (land.acquisition_method === 'cash') {
        acquisitionAtClosing = (land.amount_cash || 0) - (land.earnest_money_deposit || 0);
    } else if (land.acquisition_method === 'seller_financing') {
        const downPayment = land.seller_financing_terms?.down_payment || 0;
        acquisitionAtClosing = downPayment - (land.earnest_money_deposit || 0);
        // Note: Future installments logic is omitted for MVP
    } else if (land.acquisition_method === 'jv_unit_swap' || land.acquisition_method === 'jv_revenue_share') {
        // Swap usually implies no cash upfront besides maybe EMD refund or small payment
        acquisitionAtClosing = 0; // Simplified
    }

    if (acquisitionAtClosing < 0) acquisitionAtClosing = 0; // EMD covered it all?

    await upsertCostItem('ACQUISITION', 'Land Acquisition Payment', acquisitionAtClosing, closingMonth);

    // 6. Demolition Costs (if exists)
    // Assume it happens right after closing (Month = closingMonth + 1)
    if (land.has_existing_structure && land.demolition_cost_estimate && land.demolition_cost_estimate > 0) {
        await upsertCostItem('HARD_COSTS', 'Demolition & Site Prep', land.demolition_cost_estimate, closingMonth + 1);
    }
}

export async function deleteLandOwner(ownerId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('land_owners').delete().eq('id', ownerId);
    if (error) throw new Error(error.message);
    return { success: true };
}

export async function getProjectCosts(projectId: string) {
    const supabase = await createClient();

    // 1. Get Active Scenario
    const { data: scenarios } = await supabase
        .from('financial_scenarios')
        .select('id')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .single();

    if (!scenarios) return [];

    // 2. Get Costs
    const { data: costs } = await supabase
        .from('cost_line_items')
        .select('*')
        .eq('scenario_id', scenarios.id)
        .order('start_month_offset', { ascending: true }); // Order by timeline

    return costs || [];
}
