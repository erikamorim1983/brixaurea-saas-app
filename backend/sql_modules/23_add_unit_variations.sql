-- Migration to add per-unit variation overrides
ALTER TABLE units_mix
ADD COLUMN IF NOT EXISTS optimistic_variation numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS pessimistic_variation numeric DEFAULT NULL;
