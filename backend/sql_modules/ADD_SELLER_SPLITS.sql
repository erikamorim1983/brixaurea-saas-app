-- Add ownership_share_percent to land_owners
ALTER TABLE public.land_owners 
ADD COLUMN IF NOT EXISTS ownership_share_percent DECIMAL(5,2) DEFAULT 100.00;

-- Add contract_structuring_preference to land_details
-- 'grouped' (default) or 'individual'
ALTER TABLE public.land_details 
ADD COLUMN IF NOT EXISTS contract_structuring_preference VARCHAR(50) DEFAULT 'grouped';
