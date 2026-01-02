-- =====================================================
-- FLOOR PLAN LIBRARY: UPDATE PROJECTS TABLE
-- =====================================================
-- Purpose: Add category and subtype references to projects
-- Author: Erik @ BrixAurea
-- Date: 2026-01-01
-- =====================================================

-- Add new columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES property_categories(id) ON DELETE SET NULL;

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS subtype_id UUID REFERENCES property_subtypes(id) ON DELETE SET NULL;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_subtype ON projects(subtype_id);

COMMENT ON COLUMN projects.category_id IS 'Main property category (Residential - For Sale, Commercial, etc). Defines primary analysis framework.';
COMMENT ON COLUMN projects.subtype_id IS 'Specific property subtype (Townhomes, Office, etc). Configures relevant fields and metrics.';

-- =====================================================
-- OPTIONAL: BACKFILL LOGIC
-- =====================================================
-- You can add logic here to migrate existing projects to appropriate types
-- based on their current data. For now, leaving as NULL is fine.
-- Users will select the type when they edit the project.
