-- Add listing_link to land_details for saving Zillow/Redfin URLs
ALTER TABLE public.land_details 
ADD COLUMN IF NOT EXISTS listing_link TEXT;
