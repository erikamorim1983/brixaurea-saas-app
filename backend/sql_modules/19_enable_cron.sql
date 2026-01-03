-- MIGRATION: Enable pg_cron and schedule trash cleanup
-- Author: Erik @ BrixAurea
-- Date: 2026-01-02

-- 1. Enable the pg_cron extension (requires superuser/dashboard permissions)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule the cleanup function (from ADD_PROJECTS_SOFT_DELETE.sql)
-- This runs every day at midnight (00:00)
SELECT cron.schedule(
  'cleanup-trash-daily', 
  '0 0 * * *', 
  'SELECT public.cleanup_deleted_projects()'
);

-- Note: In Supabase, you might need to enable pg_cron via the Dashboard (Database -> Extensions) 
-- if this SQL fails with a "permission denied" or "schema cron does not exist" error.
