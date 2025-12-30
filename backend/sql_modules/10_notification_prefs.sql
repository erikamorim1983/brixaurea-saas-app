-- 10_notification_prefs.sql
-- Add notification preferences to user_profiles

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"marketing": true, "security": true, "updates": true, "billing": true}';

-- Comment explaining the structure
COMMENT ON COLUMN public.user_profiles.notification_preferences IS 'Stores user email preferences. Keys: marketing, security, updates, billing';
