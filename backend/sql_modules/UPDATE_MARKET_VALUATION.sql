-- Add market_valuation column to land_details table
ALTER TABLE land_details
ADD COLUMN IF NOT EXISTS market_valuation NUMERIC(15, 2);

COMMENT ON COLUMN land_details.market_valuation IS 'Estimated market value of the land, separate from the actual acquisition price';
