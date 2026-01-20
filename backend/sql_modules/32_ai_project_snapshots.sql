-- =====================================================
-- BRIXAUREA AI BRAIN: HISTORICAL INTELLIGENCE
-- =====================================================
-- Purpose: Store historical "Snapshots" of project health and AI verdicts.
-- This allows the AI to "see" the evolution of the project.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.project_ai_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID REFERENCES public.financial_scenarios(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    
    -- Mathematical State
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    irr_at_snapshot DECIMAL(10,4),
    roi_at_snapshot DECIMAL(10,2),
    
    -- AI Insight State
    strategic_verdict TEXT,
    
    -- Metadata
    snapshot_type VARCHAR(20) DEFAULT 'manual', -- 'manual', 'recalculation', 'milestone'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for timeline analysis
CREATE INDEX IF NOT EXISTS idx_ai_snapshots_scenario ON public.project_ai_snapshots(scenario_id);
CREATE INDEX IF NOT EXISTS idx_ai_snapshots_org ON public.project_ai_snapshots(organization_id);

-- Enable RLS
ALTER TABLE public.project_ai_snapshots ENABLE ROW LEVEL SECURITY;

-- Dynamic RLS (using our modern security function)
DROP POLICY IF EXISTS "AI_SNAPSHOTS_ISOLATION" ON public.project_ai_snapshots;
CREATE POLICY "AI_SNAPSHOTS_ISOLATION" ON public.project_ai_snapshots
FOR ALL USING (organization_id IN (SELECT public.get_my_organizations()));

COMMENT ON TABLE public.project_ai_snapshots IS 'Stores the historical evolution of a projects financial health and AI insights for behavioral learning.';
