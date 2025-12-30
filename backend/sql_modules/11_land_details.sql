-- 11_land_details.sql
-- Create table for specific Land/Terreno details
-- Updated for US Real Estate Terminology & Hybrid Payment Methods
-- Updated for Brokerage & Closing Costs
-- Updated for Timeline & Deposits (EMD, Due Diligence)
-- Updated for Project Config (Existing Structure)

CREATE TABLE IF NOT EXISTS public.land_details (
    project_id UUID PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Valuation
    land_value DECIMAL(15,2), -- Valuation / Asking Price
    
    -- Hybrid Payment Structure (Mix & Match)
    -- 1. Cash (Outright)
    amount_cash DECIMAL(15,2) DEFAULT 0,
    
    -- 2. Seller Financing
    amount_seller_financing DECIMAL(15,2) DEFAULT 0,
    seller_financing_terms JSONB, -- { "down_payment": 0, "interest_rate": 0, "term_months": 0, "amortization": "interest_only" }
    
    -- 3. Swap / JV (Permuta)
    amount_swap_monetary DECIMAL(15,2) DEFAULT 0, -- Estimated value of the swap
    swap_details JSONB, -- { "type": "physical", "percentage": 0, "units": [], "notes": "" }
    
    -- Brokerage (Corretagem)
    broker_name VARCHAR(255),
    broker_commission_percent DECIMAL(5,2),
    broker_commission_amount DECIMAL(15,2),
    broker_payment_terms JSONB, -- { "at_closing": 100%, "installments": ... } or text description
    
    -- Closing Costs (Taxas e Impostos)
    closing_costs_total DECIMAL(15,2),
    closing_costs_breakdown JSONB, -- { "transfer_tax": 0, "notary": 0, "legal": 0 }
    
    -- Timeline & Deposits (Prazos e Depósitos)
    earnest_money_deposit DECIMAL(15,2), -- EMD (Sinal)
    due_diligence_period_days INTEGER, -- Prazo de análise
    closing_period_days INTEGER, -- Prazo para fechar após DD
    pursuit_budget DECIMAL(15,2), -- Orçamento de estudos (Soft Costs pré-compra)
    
    -- Zoning & Condition
    far_utilization DECIMAL(5,2), -- Aproveitamento
    has_existing_structure BOOLEAN DEFAULT FALSE, -- Construção Existente?
    demolition_cost_estimate DECIMAL(15,2), -- Custo estimado de demolição (Auto-add to budget)
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.land_details ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own land details" ON public.land_details
    FOR SELECT USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own land details" ON public.land_details
    FOR INSERT WITH CHECK (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update own land details" ON public.land_details
    FOR UPDATE USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

-- Add Validation Constraint for Project Locations (Acres must be positive)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_locations') THEN
        BEGIN
            ALTER TABLE public.project_locations 
            ADD CONSTRAINT check_positive_acres CHECK (lot_size_acres >= 0);
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;
