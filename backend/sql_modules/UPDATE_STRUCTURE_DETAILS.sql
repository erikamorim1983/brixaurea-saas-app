-- Add description for existing structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'land_details' AND column_name = 'existing_structure_description') THEN
        ALTER TABLE public.land_details ADD COLUMN existing_structure_description TEXT;
    END IF;
END $$;
