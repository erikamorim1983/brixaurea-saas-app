-- =====================================================
-- FIX: Enable public access to insights table
-- =====================================================

-- First, enable RLS on the insights table
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to all insights
DROP POLICY IF EXISTS "Public insights are viewable by everyone" ON public.insights;
CREATE POLICY "Public insights are viewable by everyone" 
ON public.insights
FOR SELECT 
USING (true);

-- Optional: Allow authenticated users to insert/update insights
DROP POLICY IF EXISTS "Authenticated users can manage insights" ON public.insights;
CREATE POLICY "Authenticated users can manage insights" 
ON public.insights
FOR ALL
USING (auth.role() = 'authenticated');
