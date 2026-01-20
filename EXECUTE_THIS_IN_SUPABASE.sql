-- =====================================================
-- ENABLE PUBLIC READ ACCESS TO INSIGHTS (BLOG)
-- =====================================================
-- Execute this in Supabase Dashboard > SQL Editor
-- https://supabase.com/dashboard/project/luyyxveurwfuxbjbnluy/editor
-- =====================================================

-- 1. Enable RLS (if not already enabled)
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- 2. Allow PUBLIC read access (no login required for blog)
DROP POLICY IF EXISTS "Public insights are viewable by everyone" ON public.insights;
CREATE POLICY "Public insights are viewable by everyone" 
ON public.insights
FOR SELECT 
USING (true);

-- 3. Allow authenticated users to manage insights (optional)
DROP POLICY IF EXISTS "Authenticated users can manage insights" ON public.insights;
CREATE POLICY "Authenticated users can manage insights" 
ON public.insights
FOR ALL
USING (auth.role() = 'authenticated');

-- =====================================================
-- DONE! Now /insights will work WITHOUT login
-- =====================================================
