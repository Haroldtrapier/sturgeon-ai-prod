-- ============================================================================
-- STURGEON AI - Complete Database Schema
-- Government Contracting Intelligence Platform
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================================================
-- 1. USER PROFILES (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    company_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
    credits INT DEFAULT 100,
    total_searches INT DEFAULT 0,
    total_proposals INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. COMPANIES (SDVOSB, NAICS, SAM.gov data)
-- ============================================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    duns_number TEXT UNIQUE,
    cage_code TEXT,
    uei TEXT UNIQUE,
    sdvosb_certified BOOLEAN DEFAULT false,
    certification_expiry DATE,
    naics_codes TEXT[], -- Array of NAICS codes
    psc_codes TEXT[], -- Product/Service codes
    capability_statement_url TEXT,
    sam_gov_url TEXT,
    website TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. OPPORTUNITIES (SAM.gov/Grants.gov contracts)
-- ============================================================================
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_id TEXT UNIQUE NOT NULL, -- SAM.gov ID
    title TEXT NOT NULL,
    description TEXT,
    agency TEXT,
    office TEXT,
    naics_code TEXT,
    psc_code TEXT,
    set_aside TEXT, -- SDVOSB, 8(a), HUBZone, etc.
    place_of_performance TEXT,
    posted_date TIMESTAMPTZ,
    response_deadline TIMESTAMPTZ,
    contract_value_min NUMERIC,
    contract_value_max NUMERIC,
    contract_type TEXT, -- FFP, T&M, Cost Plus, etc.
    source TEXT DEFAULT 'SAM.gov', -- SAM.gov, Grants.gov, etc.
    url TEXT,
    attachments JSONB DEFAULT '[]',
    keywords TEXT[],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'awarded', 'cancelled')),
    match_score INT, -- AI calculated 0-100
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_opportunities_search ON opportunities USING GIN (
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, ''))
);

-- ============================================================================
-- 4. SAVED OPPORTUNITIES (User's bookmarked contracts)
-- ============================================================================
CREATE TABLE saved_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'reviewing' CHECK (status IN ('reviewing', 'pursuing', 'bidding', 'submitted', 'won', 'lost', 'passed')),
    notes TEXT,
    priority INT DEFAULT 0 CHECK (priority BETWEEN 0 AND 10),
    deadline_reminder TIMESTAMPTZ,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, opportunity_id)
);

-- ============================================================================
-- 5. AI ANALYSES (AI-powered contract analysis)
-- ============================================================================
CREATE TABLE ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('summary', 'requirements', 'match_score', 'strategy', 'full')),
    ai_provider TEXT DEFAULT 'claude', -- claude, openai
    model_used TEXT,
    prompt_tokens INT,
    completion_tokens INT,
    result JSONB NOT NULL, -- Structured AI analysis result
    match_score INT CHECK (match_score BETWEEN 0 AND 100),
    strengths TEXT[],
    weaknesses TEXT[],
    recommendations TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. PROPOSALS (Generated proposal documents)
-- ============================================================================
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    version INT DEFAULT 1,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'submitted', 'accepted', 'rejected')),
    content JSONB NOT NULL, -- Structured proposal sections
    executive_summary TEXT,
    technical_approach TEXT,
    pricing JSONB,
    generated_by_ai BOOLEAN DEFAULT true,
    ai_provider TEXT, -- claude, openai
    document_url TEXT, -- PDF/DOCX URL
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. SAVED SEARCHES (Saved filters with alerts)
-- ============================================================================
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filters JSONB NOT NULL, -- Search criteria
    alert_enabled BOOLEAN DEFAULT false,
    alert_frequency TEXT DEFAULT 'daily' CHECK (alert_frequency IN ('realtime', 'daily', 'weekly')),
    last_alerted_at TIMESTAMPTZ,
    result_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. OPPORTUNITY INTERACTIONS (Activity tracking)
-- ============================================================================
CREATE TABLE opportunity_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'save', 'analyze', 'generate_proposal', 'share', 'download')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. ANALYTICS EVENTS (Platform usage tracking)
-- ============================================================================
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. USER ANALYTICS (Aggregated metrics)
-- ============================================================================
CREATE TABLE user_analytics (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_views INT DEFAULT 0,
    total_searches INT DEFAULT 0,
    total_saves INT DEFAULT 0,
    total_proposals INT DEFAULT 0,
    total_ai_analyses INT DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User profiles
CREATE INDEX idx_user_profiles_subscription ON user_profiles(subscription_plan);

-- Companies
CREATE INDEX idx_companies_user ON companies(user_id);
CREATE INDEX idx_companies_naics ON companies USING GIN (naics_codes);
CREATE INDEX idx_companies_psc ON companies USING GIN (psc_codes);
CREATE INDEX idx_companies_sdvosb ON companies(sdvosb_certified) WHERE sdvosb_certified = true;

-- Opportunities
CREATE INDEX idx_opportunities_agency ON opportunities(agency);
CREATE INDEX idx_opportunities_naics ON opportunities(naics_code);
CREATE INDEX idx_opportunities_setaside ON opportunities(set_aside);
CREATE INDEX idx_opportunities_deadline ON opportunities(response_deadline);
CREATE INDEX idx_opportunities_posted ON opportunities(posted_date DESC);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_match_score ON opportunities(match_score DESC);

-- Saved opportunities
CREATE INDEX idx_saved_opps_user ON saved_opportunities(user_id);
CREATE INDEX idx_saved_opps_status ON saved_opportunities(status);
CREATE INDEX idx_saved_opps_priority ON saved_opportunities(priority DESC);

-- AI analyses
CREATE INDEX idx_ai_analyses_user ON ai_analyses(user_id);
CREATE INDEX idx_ai_analyses_opp ON ai_analyses(opportunity_id);
CREATE INDEX idx_ai_analyses_type ON ai_analyses(analysis_type);
CREATE INDEX idx_ai_analyses_score ON ai_analyses(match_score DESC);

-- Proposals
CREATE INDEX idx_proposals_user ON proposals(user_id);
CREATE INDEX idx_proposals_opp ON proposals(opportunity_id);
CREATE INDEX idx_proposals_status ON proposals(status);

-- Saved searches
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_alerts ON saved_searches(alert_enabled) WHERE alert_enabled = true;

-- Interactions
CREATE INDEX idx_interactions_user ON opportunity_interactions(user_id);
CREATE INDEX idx_interactions_opp ON opportunity_interactions(opportunity_id);
CREATE INDEX idx_interactions_type ON opportunity_interactions(interaction_type);
CREATE INDEX idx_interactions_created ON opportunity_interactions(created_at DESC);

-- Analytics
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only see/edit their own profile
CREATE POLICY user_profiles_select ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY user_profiles_insert ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY user_profiles_update ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Companies: Users can only see/edit their own companies
CREATE POLICY companies_select ON companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY companies_insert ON companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY companies_update ON companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY companies_delete ON companies FOR DELETE USING (auth.uid() = user_id);

-- Opportunities: Public read, admin write
CREATE POLICY opportunities_select ON opportunities FOR SELECT TO authenticated USING (true);

-- Saved Opportunities: Users can only see/edit their own saves
CREATE POLICY saved_opps_select ON saved_opportunities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY saved_opps_insert ON saved_opportunities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY saved_opps_update ON saved_opportunities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY saved_opps_delete ON saved_opportunities FOR DELETE USING (auth.uid() = user_id);

-- AI Analyses: Users can only see their own analyses
CREATE POLICY ai_analyses_select ON ai_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY ai_analyses_insert ON ai_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Proposals: Users can only see/edit their own proposals
CREATE POLICY proposals_select ON proposals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY proposals_insert ON proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY proposals_update ON proposals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY proposals_delete ON proposals FOR DELETE USING (auth.uid() = user_id);

-- Saved Searches: Users can only see/edit their own searches
CREATE POLICY saved_searches_select ON saved_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY saved_searches_insert ON saved_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY saved_searches_update ON saved_searches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY saved_searches_delete ON saved_searches FOR DELETE USING (auth.uid() = user_id);

-- Interactions: Users can only see/create their own interactions
CREATE POLICY interactions_select ON opportunity_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY interactions_insert ON opportunity_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics: Users can see their own events
CREATE POLICY analytics_select ON analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY analytics_insert ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Analytics: Users can only see their own analytics
CREATE POLICY user_analytics_select ON user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_analytics_insert ON user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_analytics_update ON user_analytics FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_opps_updated_at BEFORE UPDATE ON saved_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_analytics_updated_at BEFORE UPDATE ON user_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

    INSERT INTO user_analytics (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to calculate opportunity match score
CREATE OR REPLACE FUNCTION calculate_match_score(
    opp_naics TEXT,
    opp_psc TEXT,
    opp_setaside TEXT,
    user_id_param UUID
)
RETURNS INT AS $$
DECLARE
    score INT := 0;
    user_company RECORD;
BEGIN
    -- Get user's company info
    SELECT * INTO user_company 
    FROM companies 
    WHERE user_id = user_id_param 
    LIMIT 1;

    IF user_company IS NULL THEN
        RETURN 0;
    END IF;

    -- NAICS match (+40 points)
    IF opp_naics = ANY(user_company.naics_codes) THEN
        score := score + 40;
    END IF;

    -- PSC match (+30 points)
    IF opp_psc = ANY(user_company.psc_codes) THEN
        score := score + 30;
    END IF;

    -- SDVOSB set-aside match (+30 points)
    IF opp_setaside ILIKE '%SDVOSB%' AND user_company.sdvosb_certified THEN
        score := score + 30;
    END IF;

    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA & VIEWS
-- ============================================================================

-- View for opportunities with match scores
CREATE OR REPLACE VIEW opportunities_with_scores AS
SELECT 
    o.*,
    COALESCE(sa.status, 'not_saved') as user_status,
    sa.priority as user_priority,
    sa.notes as user_notes
FROM opportunities o
LEFT JOIN saved_opportunities sa ON o.id = sa.opportunity_id AND sa.user_id = auth.uid();

-- ============================================================================
-- GRANTS (Ensure proper permissions)
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE user_profiles IS 'Extended user profile information beyond Supabase auth';
COMMENT ON TABLE companies IS 'Company information for SDVOSB certification and SAM.gov integration';
COMMENT ON TABLE opportunities IS 'Government contracting opportunities from SAM.gov and Grants.gov';
COMMENT ON TABLE saved_opportunities IS 'User bookmarked opportunities with pursuit tracking';
COMMENT ON TABLE ai_analyses IS 'AI-powered analysis results for opportunities';
COMMENT ON TABLE proposals IS 'Generated proposal documents with version control';
COMMENT ON TABLE saved_searches IS 'User saved searches with alert capabilities';
COMMENT ON TABLE opportunity_interactions IS 'User interaction tracking for analytics';
COMMENT ON TABLE analytics_events IS 'Platform-wide analytics and usage tracking';
COMMENT ON TABLE user_analytics IS 'Aggregated user metrics and statistics';
