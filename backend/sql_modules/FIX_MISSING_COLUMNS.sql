-- Ensure all new columns exist (Safe to run multiple times)

-- 1. Listing Link
ALTER TABLE public.land_details 
ADD COLUMN IF NOT EXISTS listing_link TEXT;

-- 2. Seller ownership share
ALTER TABLE public.land_owners 
ADD COLUMN IF NOT EXISTS ownership_share_percent DECIMAL(5,2) DEFAULT 100.00;

-- 3. Contract Structuring Preference
ALTER TABLE public.land_details 
ADD COLUMN IF NOT EXISTS contract_structuring_preference VARCHAR(50) DEFAULT 'grouped';

-- 4. Existing Structure Details
ALTER TABLE public.land_details 
ADD COLUMN IF NOT EXISTS existing_structure_description TEXT,
ADD COLUMN IF NOT EXISTS demolition_cost_estimate DECIMAL(15,2);

-- 5. Market Valuation
ALTER TABLE public.land_details 
ADD COLUMN IF NOT EXISTS market_valuation DECIMAL(15,2);

-- 6. Acquisition Method
ALTER TABLE public.land_details 
ADD COLUMN IF NOT EXISTS acquisition_method VARCHAR(50) DEFAULT 'cash';

-- 7. Project Type
ALTER TABLE public.land_details 
ADD COLUMN IF NOT EXISTS project_type VARCHAR(50);

-- 8. Existing Structure Boolean
ALTER TABLE public.land_details 
ADD COLUMN IF NOT EXISTS has_existing_structure BOOLEAN DEFAULT FALSE;

-- 9. Lot Size Acres
ALTER TABLE public.land_details 
ADD COLUMN IF NOT EXISTS lot_size_acres DECIMAL(10,4);



