-- MIGRATION: Add Soft Delete and Trash functionality to Projects
-- Author: Erik @ BrixAurea
-- Date: 2026-01-02

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Comment for clarity
COMMENT ON COLUMN projects.deleted_at IS 'Timestamp when the project was moved to trash. If NULL, project is active.';

-- Logic for auto-deletion (User can run this as a Cron job if pg_cron is enabled)
-- For now, we provide the function to manually or automatically clean up.
CREATE OR REPLACE FUNCTION public.cleanup_deleted_projects()
RETURNS void AS $$
BEGIN
    DELETE FROM public.projects
    WHERE deleted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
