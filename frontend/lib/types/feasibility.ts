export type LandOwnerType = 'individual' | 'entity';
export type AcquisitionMethod = 'cash' | 'seller_financing' | 'jv_unit_swap' | 'jv_revenue_share' | 'option_agreement' | 'ground_lease';

export interface LandOwner {
    id?: string;
    project_id?: string;
    type: LandOwnerType;
    name: string;
    tax_id?: string; // SSN or EIN
    email?: string;
    phone?: string;
    address_street?: string;
    address_city?: string;
    address_state?: string;
    address_zip?: string;
    is_primary: boolean;
    ownership_share_percent?: number; // 0-100
}

export interface LandDetails {
    project_id: string;

    // Valuation
    land_value: number; // Acquisition Price / Asking Price
    listing_link?: string; // URL to the listing (Zillow, etc.)
    market_valuation?: number; // Estimated Market Value (Appraisal)

    contract_structuring_preference?: 'grouped' | 'individual';

    // Existing Structure
    existing_structure_description?: string;

    // Acquisition Method
    acquisition_method: AcquisitionMethod;

    // Option & Ground Lease Specifics
    option_fee_amount?: number;
    option_duration_months?: number;
    lease_initial_rent?: number;
    lease_term_years?: number;

    // Hybrid Payment Structure
    amount_cash: number;
    amount_seller_financing: number;
    amount_swap_monetary: number;

    // Complex Objects (JSONB)
    seller_financing_terms?: {
        down_payment?: number; // Deprecated/Legacy
        interest_rate?: number;
        term_months?: number;
        start_month?: number; // Months after closing (0 = immediate, 1 = next month)
        periodicity?: 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual';
        amortization?: 'interest_only' | 'amortized';
        notes?: string;
    };

    swap_details?: {
        type: 'physical' | 'financial';
        percentage?: number; // % of VGV or units
        units?: string[]; // List of unit numbers
        notes?: string;
    };

    // Brokerage
    broker_name?: string;
    broker_company?: string;
    broker_email?: string;
    broker_phone?: string;
    broker_commission_percent?: number;
    broker_commission_amount?: number;
    broker_payment_terms?: {
        at_closing_percent?: number;
        installments_count?: number;
        notes?: string;
    };

    // Closing Costs
    closing_costs_total?: number;
    closing_costs_breakdown?: {
        transfer_tax?: number;
        notary?: number;
        legal?: number;
        title_insurance?: number;
        recording_fees?: number;
        other?: number;
    };

    // Timeline & Deposits
    earnest_money_deposit?: number;
    due_diligence_period_days?: number;
    closing_period_days?: number;
    pursuit_budget?: number; // Soft costs pre-closing

    // Zoning & Condition
    far_utilization?: number;
    project_type?: string;
    has_existing_structure?: boolean;
    demolition_cost_estimate?: number;

    // Linked from project_locations (Read/Write)
    lot_size_acres?: number;
    latitude?: number;
    longitude?: number;
    address_full?: string;

    notes?: string;
    project_name?: string;

    created_at?: string;
    updated_at?: string;
}

export interface FeasibilityData {
    land: LandDetails | null;
    owners: LandOwner[];
}
