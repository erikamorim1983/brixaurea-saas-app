-- =====================================================
-- EXECUTE ESTE SQL NO SUPABASE
-- =====================================================
-- Cria a tabela listing_links se ainda não existir
-- =====================================================

CREATE TABLE IF NOT EXISTS listing_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_links_project ON listing_links(project_id);

ALTER TABLE listing_links ENABLE ROW LEVEL SECURITY;

-- Users can only manage links for their own projects
DROP POLICY IF EXISTS "Users can view own project listing links" ON listing_links;
CREATE POLICY "Users can view own project listing links"
    ON listing_links FOR SELECT TO authenticated
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own project listing links" ON listing_links;
CREATE POLICY "Users can insert own project listing links"
    ON listing_links FOR INSERT TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete own project listing links" ON listing_links;
CREATE POLICY "Users can delete own project listing links"
    ON listing_links FOR DELETE TO authenticated
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

COMMENT ON TABLE listing_links IS 'Stores multiple listing URLs per project (Zillow, Redfin, etc.)';

-- Verify table was created
SELECT 'listing_links table created successfully!' as message;
