-- Add construction_duration_months to floor_plan_library
ALTER TABLE floor_plan_library ADD COLUMN IF NOT EXISTS construction_duration_months INTEGER DEFAULT 10;

-- Optional: Add comments to justify the scale logic
COMMENT ON COLUMN floor_plan_library.construction_duration_months IS 'Standard time in months to build this specific model/plan.';
