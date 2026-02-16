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

-- ============================================================================
-- SUBMISSION CHECKLISTS (pre-submission verification)
-- ============================================================================
CREATE TABLE IF NOT EXISTS submission_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    completed BOOLEAN DEFAULT FALSE,
    completed_by UUID REFERENCES auth.users(id),
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submission_checklists_proposal ON submission_checklists(proposal_id);

ALTER TABLE submission_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage checklists for their proposals" ON submission_checklists
    FOR ALL USING (
        proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid())
    );

-- ============================================================================
-- PROPOSAL REVIEWS (human review tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS proposal_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewer_email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    notes TEXT,
    reviewer_notes TEXT,
    score INT CHECK (score >= 0 AND score <= 100),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposal_reviews_proposal ON proposal_reviews(proposal_id);
CREATE INDEX idx_proposal_reviews_user ON proposal_reviews(user_id);

ALTER TABLE proposal_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their review requests" ON proposal_reviews
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- PROPOSAL SECTIONS (generated content blocks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS proposal_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    section_name TEXT NOT NULL,
    content TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposal_sections_proposal ON proposal_sections(proposal_id);

ALTER TABLE proposal_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY proposal_sections_access ON proposal_sections
    FOR ALL USING (
        proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid())
    );

CREATE TRIGGER update_proposal_sections_updated_at BEFORE UPDATE ON proposal_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLIANCE REQUIREMENTS (SHALL/MUST statements)
-- ============================================================================
CREATE TABLE IF NOT EXISTS compliance_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    section_ref TEXT,
    status TEXT DEFAULT 'missing' CHECK (status IN ('missing', 'partial', 'addressed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_requirements_proposal ON compliance_requirements(proposal_id);
CREATE INDEX idx_compliance_requirements_status ON compliance_requirements(status);

ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_requirements_access ON compliance_requirements
    FOR ALL USING (
        proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid())
    );

CREATE TRIGGER update_compliance_requirements_updated_at BEFORE UPDATE ON compliance_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TEAMS & TEAM MEMBERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'writer', 'reviewer', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY teams_access ON teams
    FOR ALL USING (
        owner_id = auth.uid() OR id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );
CREATE POLICY team_members_access ON team_members
    FOR ALL USING (
        user_id = auth.uid() OR team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    );

-- ============================================================================
-- TEAM INVITES
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'writer', 'reviewer', 'viewer')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX idx_team_invites_team ON team_invites(team_id);
CREATE INDEX idx_team_invites_email ON team_invites(invited_email);

ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_invites_access ON team_invites
    FOR ALL USING (
        invited_by = auth.uid()
        OR invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR team_id IN (SELECT id FROM teams WHERE owner_id = auth.uid())
    );

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT,
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- CHAT SESSIONS & MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Chat',
    agent_type TEXT DEFAULT 'general',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_sessions_access ON chat_sessions
    FOR ALL USING (user_id = auth.uid());
CREATE POLICY chat_messages_access ON chat_messages
    FOR ALL USING (
        session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
    );

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'deadline', 'opportunity')),
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_access ON notifications
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- JOB RUNS & JOB EVENTS (background job observability)
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'success', 'failed')),
    attempts INT DEFAULT 0,
    last_error TEXT,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_run_id UUID NOT NULL REFERENCES job_runs(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
    message TEXT NOT NULL,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_runs_status ON job_runs(status);
CREATE INDEX idx_job_runs_created ON job_runs(created_at DESC);
CREATE INDEX idx_job_events_run ON job_events(job_run_id);

ALTER TABLE job_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_events ENABLE ROW LEVEL SECURITY;

-- Job tables: service role only (admin dashboard)
CREATE POLICY job_runs_admin ON job_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY job_events_admin ON job_events FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- CONTRACTS HISTORY (past performance tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contracts_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contract_number TEXT,
    title TEXT NOT NULL,
    agency TEXT,
    contract_type TEXT,
    value NUMERIC,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contracts_history_user ON contracts_history(user_id);
CREATE INDEX idx_contracts_history_company ON contracts_history(company_id);

ALTER TABLE contracts_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY contracts_history_access ON contracts_history
    FOR ALL USING (user_id = auth.uid());

CREATE TRIGGER update_contracts_history_updated_at BEFORE UPDATE ON contracts_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CERTIFICATION DOCUMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS certification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
    issued_date DATE,
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certification_docs_company ON certification_documents(company_id);
CREATE INDEX idx_certification_docs_expiry ON certification_documents(expiry_date);

ALTER TABLE certification_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY certification_documents_access ON certification_documents
    FOR ALL USING (
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    );

-- ============================================================================
-- SUPPORT TICKETS
-- ============================================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    closed_at TIMESTAMPTZ,
    last_updated TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY support_tickets_access ON support_tickets
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- BACKUPS
-- ============================================================================
CREATE TABLE IF NOT EXISTS backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'full' CHECK (type IN ('full', 'proposals', 'settings')),
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    size TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_backups_user ON backups(user_id);

ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY backups_access ON backups
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- COMPLIANCE CHECKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    check_type TEXT DEFAULT 'full',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed')),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_checks_proposal ON compliance_checks(proposal_id);

ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_checks_access ON compliance_checks
    FOR ALL USING (
        proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid())
    );

-- ============================================================================
-- TEAM INVITES
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'analyst' CHECK (role IN ('admin', 'manager', 'analyst', 'viewer')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_invites_email ON team_invites(email);

ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_invites_access ON team_invites
    FOR ALL USING (invited_by = auth.uid());

-- ============================================================================
-- COMPLIANCE REQUIREMENTS (per-proposal extracted requirements)
-- ============================================================================
CREATE TABLE IF NOT EXISTS compliance_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    requirement_text TEXT NOT NULL,
    requirement_type TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'addressed', 'missing', 'partial')),
    section_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_reqs_proposal ON compliance_requirements(proposal_id);

ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_requirements_access ON compliance_requirements
    FOR ALL USING (
        proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid())
    );

-- ============================================================================
-- PROPOSAL SECTIONS (individual sections of a proposal)
-- ============================================================================
CREATE TABLE IF NOT EXISTS proposal_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    section_name TEXT NOT NULL,
    section_order INT DEFAULT 0,
    content TEXT,
    word_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposal_sections_proposal ON proposal_sections(proposal_id);

ALTER TABLE proposal_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY proposal_sections_access ON proposal_sections
    FOR ALL USING (
        proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid())
    );

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
