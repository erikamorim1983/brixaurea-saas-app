-- 12_land_owners.sql
-- Support for multiple owners/sellers (Aquisição - Vendedores)
-- Updated: Optional fields, Type (Individual/Entity), Tax ID

CREATE TABLE IF NOT EXISTS public.land_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    
    type VARCHAR(20) DEFAULT 'individual', -- 'individual' or 'entity'
    name VARCHAR(255) NOT NULL, -- Name or Company Name
    tax_id VARCHAR(50), -- SSN or EIN (US Only)
    
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Address
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_zip VARCHAR(20),
    
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.land_owners ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own land owners" ON public.land_owners
    FOR SELECT USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own land owners" ON public.land_owners
    FOR INSERT WITH CHECK (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update own land owners" ON public.land_owners
    FOR UPDATE USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete own land owners" ON public.land_owners
    FOR DELETE USING (
        project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
    );
