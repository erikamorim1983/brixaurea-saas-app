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
    revalidatePath(`/dashboard/projects/${projectId}/feasibility/schedule`);

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

    // 0. Get Project Organization ID
    const { data: project } = await supabase
        .from('projects')
        .select('organization_id')
        .eq('id', projectId)
        .single();

    if (!project?.organization_id) {
        console.warn(`Project ${projectId} has no organization ID. Skipping cost sync.`);
        return;
    }

    // Helper to upsert cost item by name
    const upsertCostItem = async (
        category: string,
        name: string,
        value: number | undefined,
        startMonth: number,
        distribution: string = 'linear'
    ) => {
        if (value === undefined || value === 0) return;

        // Check if exists
        const { data: existing } = await supabase
            .from('cost_line_items')
            .select('id')
            .eq('scenario_id', scenarioId)
            .eq('item_name', name)
            .single();

        const payload = {
            scenario_id: scenarioId,
            organization_id: project.organization_id, // Ensure organization_id is set for RLS bypass prevention
            category,
            item_name: name,
            input_value: value,
            total_estimated: value,
            calculation_method: 'fixed',
            start_month_offset: startMonth,
            distribution_curve: distribution,
            duration_months: 1,
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


export async function getUnitMix(projectId: string) {
    const supabase = await createClient();

    // 1. Get Scenario Data
    const { data: scenarios } = await supabase
        .from('financial_scenarios')
        .select('id, scenario_type, is_active')
        .eq('project_id', projectId);

    const scenario = scenarios?.find(s => s.scenario_type === 'base') ||
        scenarios?.find(s => s.is_active === true) ||
        scenarios?.[0];

    if (!scenario) return [];

    // 2. Get Units
    const { data: units } = await supabase
        .from('units_mix')
        .select(`
            *,
            floor_plans:floor_plan_library (
                construction_duration_months,
                construction_curve
            )
        `)
        .eq('scenario_id', scenario.id)
        .order('created_at', { ascending: true });

    return units || [];
}

export async function getProjectCosts(projectId: string) {
    const supabase = await createClient();

    // 1. Get Scenario Data (Robust selection)
    const { data: scenarios } = await supabase
        .from('financial_scenarios')
        .select('id, scenario_type, is_active, organization_id')
        .eq('project_id', projectId);

    const scenario = scenarios?.find(s => s.scenario_type === 'base') ||
        scenarios?.find(s => s.is_active === true) ||
        scenarios?.[0];

    if (!scenario) return [];

    // 2. Get Costs
    const { data: costs } = await supabase
        .from('cost_line_items')
        .select('*')
        .eq('scenario_id', scenario.id)
        .order('category', { ascending: true })
        .order('start_month_offset', { ascending: true });

    return costs || [];
}

export async function saveCostItem(projectId: string, item: any) {
    const supabase = await createClient();

    // 1. Get Project with Organization ID first
    const { data: project } = await supabase
        .from('projects')
        .select('id, organization_id')
        .eq('id', projectId)
        .single();

    if (!project) throw new Error("Project not found");
    if (!project.organization_id) throw new Error("Project is not linked to an organization");

    // 2. Get or Create Financial Scenario
    let { data: scenarios } = await supabase
        .from('financial_scenarios')
        .select('id, scenario_type, is_active, organization_id')
        .eq('project_id', projectId);

    let scenario = scenarios?.find(s => s.scenario_type === 'base') ||
        scenarios?.find(s => s.is_active === true) ||
        scenarios?.[0];

    // Auto-create scenario if missing
    if (!scenario) {
        console.log(`Creating base scenario for project ${projectId} with org ${project.organization_id}`);
        const { data: newScenario, error: createError } = await supabase
            .from('financial_scenarios')
            .insert({
                project_id: projectId,
                organization_id: project.organization_id,
                name: 'Base Case',
                scenario_type: 'base',
                is_active: true,
                base_date: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

        if (createError) {
            console.error('Failed to create scenario:', createError);
            throw new Error(`Failed to initialize financial scenario: ${createError.message || JSON.stringify(createError)}`);
        }
        scenario = newScenario;
    }

    // Ensure scenario has org ID (for old records)
    const scenarioOrgId = (scenario as any).organization_id || project.organization_id;

    // Final safety check (TypeScript)
    if (!scenario) throw new Error("Failed to initialize scenario");

    const payload: any = {
        scenario_id: scenario.id,
        organization_id: scenarioOrgId,
        category: item.category,
        item_name: item.item_name,
        input_value: item.total_estimated, // For now simple
        total_estimated: item.total_estimated,
        calculation_method: item.calculation_method || 'fixed',
        start_month_offset: item.start_month_offset || 0,
        duration_months: item.duration_months || 1,
        distribution_curve: item.distribution_curve || 'linear'
    };

    if (item.id) {
        const { error } = await supabase.from('cost_line_items').update(payload).eq('id', item.id);
        if (error) {
            console.error('Supabase update error:', error);
            throw new Error(`Failed to update cost item: ${error.message || JSON.stringify(error)}`);
        }
    } else {
        const { error } = await supabase.from('cost_line_items').insert(payload);
        if (error) {
            console.error('Supabase insert error:', error);
            throw new Error(`Failed to create cost item: ${error.message || JSON.stringify(error)}`);
        }
    }

    revalidatePath(`/dashboard/projects/${projectId}/feasibility/costs`);
    return { success: true };
}

export async function deleteCostItem(projectId: string, itemId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('cost_line_items').delete().eq('id', itemId);
    if (error) throw error;

    revalidatePath(`/dashboard/projects/${projectId}/feasibility/costs`);
    return { success: true };
}

export async function getProjectCashFlow(projectId: string) {
    const supabase = await createClient();

    // 1. Get Scenario Data (Robust selection)
    const { data: scenarios } = await supabase
        .from('financial_scenarios')
        .select('*')
        .eq('project_id', projectId);

    const scenario = scenarios?.find(s => s.scenario_type === 'base') ||
        scenarios?.find(s => s.is_active === true) ||
        scenarios?.[0];

    if (!scenario) return { totalGDV: 0, totalCosts: 0, months: [], scenarioId: '' };

    // Fetch Project metadata
    const { data: project } = await supabase
        .from('projects')
        .select('id, name, category_id, subtype_id')
        .eq('id', projectId)
        .single();

    if (!project) return { totalGDV: 0, totalCosts: 0, months: [], scenarioId: '' };

    // Fetch Subtype details
    const { data: subtype } = await supabase
        .from('property_subtypes')
        .select('*')
        .eq('id', project.subtype_id)
        .single();

    // 2. Get All Costs
    const { data: costs } = await supabase
        .from('cost_line_items')
        .select('*')
        .eq('scenario_id', scenario.id);

    // 3. Get Revenue (Units)
    const { data: units } = await supabase
        .from('units_mix')
        .select('unit_count, avg_price')
        .eq('scenario_id', scenario.id);

    const totalGDV = (units || []).reduce((sum, u) => sum + (u.unit_count * u.avg_price), 0);

    // 4. Calculate Timeline
    // Determine max month from costs and sales
    let maxMonth = 12; // Minimum view

    // Check costs max month
    (costs || []).forEach(c => {
        const end = (c.start_month_offset || 0) + (c.duration_months || 1);
        if (end > maxMonth) maxMonth = end;
    });

    // Check sales max month (start_offset_months + duration)
    // For now assume sales duration is 24 months if not specified
    const salesStart = scenario.sales_start_offset_months || 0;
    const salesDuration = scenario.manual_absorption_curve ? scenario.manual_absorption_curve.length : 24;
    if (salesStart + salesDuration > maxMonth) maxMonth = salesStart + salesDuration;

    // 5. Build Monthly Data (Distribution Logic)
    const depositStructure = scenario.deposit_structure || {
        initial_deposit: 10,
        second_deposit: 10,
        closing_funding: 80
    };

    const deliveryMonthIndex = scenario.delivery_start_offset || 24;

    // We first calculate when the SALES happen
    const salesData = Array.from({ length: maxMonth + 1 }, (_, monthIndex) => {
        let monthGenericPercent = 0;
        if (scenario.manual_absorption_curve && monthIndex >= salesStart && monthIndex < salesStart + scenario.manual_absorption_curve.length) {
            const curveIndex = monthIndex - salesStart;
            monthGenericPercent = (scenario.manual_absorption_curve[curveIndex] || 0) / 100;
        } else if (!scenario.manual_absorption_curve && monthIndex >= salesStart) {
            const rate = scenario.absorption_rate_monthly || 5; // 5% default
            const alreadySold = (monthIndex - salesStart) * (rate / 100);
            if (alreadySold < 1) {
                monthGenericPercent = Math.min(rate / 100, 1 - alreadySold);
            }
        }
        return totalGDV * monthGenericPercent;
    });

    // We then distribute that SALE into actual CASH-IN (Receivables)
    const cashInByMonth = new Array(maxMonth + 1).fill(0);

    salesData.forEach((saleRevenue, saleIndex) => {
        if (saleRevenue <= 0) return;

        // a. Initial Deposit - Month of Sale
        cashInByMonth[saleIndex] += (saleRevenue * (depositStructure.initial_deposit / 100));

        // b. Closing Funding - At Delivery
        const deliveryIdx = Math.min(deliveryMonthIndex, maxMonth);
        cashInByMonth[deliveryIdx] += (saleRevenue * (depositStructure.closing_funding / 100));

        // c. During Construction Installments
        const installmentStart = saleIndex + 1;
        const installmentEnd = Math.max(saleIndex, deliveryMonthIndex - 1);
        const installmentMonths = Math.max(0, installmentEnd - installmentStart + 1);

        if (installmentMonths > 0) {
            const monthlyInst = (saleRevenue * (depositStructure.second_deposit / 100)) / installmentMonths;
            for (let k = installmentStart; k <= installmentEnd; k++) {
                if (k <= maxMonth) cashInByMonth[k] += monthlyInst;
            }
        } else if (depositStructure.second_deposit > 0) {
            // Late sale: add to delivery
            const deliveryIdxSafe = Math.min(deliveryMonthIndex, maxMonth);
            cashInByMonth[deliveryIdxSafe] += (saleRevenue * (depositStructure.second_deposit / 100));
        }
    });

    const monthsData = Array.from({ length: maxMonth + 1 }, (_, i) => {
        const monthIndex = i;
        const monthRevenue = cashInByMonth[monthIndex] || 0;

        // Calculate Costs for this month
        const monthCosts = (costs || []).reduce((sum, item) => {
            if (monthIndex < item.start_month_offset) return sum;
            if (monthIndex >= item.start_month_offset + (item.duration_months || 1)) return sum;

            // Linear distribution
            return sum + (item.total_estimated / (item.duration_months || 1));
        }, 0);

        return {
            month: monthIndex,
            revenue: monthRevenue,
            costs: monthCosts,
            net: monthRevenue - monthCosts
        };
    });

    // Calculate Cumulative
    let cumulative = 0;
    const monthsWithCumulative = monthsData.map(m => {
        cumulative += m.net;
        return { ...m, cumulative };
    });

    return {
        totalGDV,
        totalCosts: (costs || []).reduce((sum, c) => sum + (c.total_estimated || 0), 0),
        scenarioId: scenario.id,
        healthScore: (scenario as any).health_score,
        strategicAnalysis: (scenario as any).strategic_analysis,
        months: monthsWithCumulative,
        project: {
            id: project.id,
            name: project.name,
            category_id: project.category_id,
            subtype_id: project.subtype_id
        },
        subtype: subtype || null
    };
}
