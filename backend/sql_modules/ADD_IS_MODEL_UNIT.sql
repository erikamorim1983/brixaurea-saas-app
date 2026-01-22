-- Add is_model_unit column to units_mix
ALTER TABLE units_mix ADD COLUMN IF NOT EXISTS is_model_unit BOOLEAN DEFAULT FALSE;

-- Update existing records if any (optional, but good for consistency)
UPDATE units_mix SET is_model_unit = FALSE WHERE is_model_unit IS NULL;
