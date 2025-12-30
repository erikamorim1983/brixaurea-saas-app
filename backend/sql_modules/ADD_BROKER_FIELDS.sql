-- Add detailed broker fields to land_details table
ALTER TABLE land_details
ADD COLUMN IF NOT EXISTS broker_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS broker_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS broker_phone VARCHAR(50);

COMMENT ON COLUMN land_details.broker_company IS 'Name of the Real Estate Agency or Company';
COMMENT ON COLUMN land_details.broker_email IS 'Contact email of the broker';
COMMENT ON COLUMN land_details.broker_phone IS 'Contact phone of the broker';
