-- Add project_type column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS project_type VARCHAR(50);

COMMENT ON COLUMN projects.project_type IS 'Type of the project: multifamily, commercial, mixed_use, single_family';
