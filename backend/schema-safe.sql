-- ============================================================================
-- STURGEON AI - Safe Migration Script (won't fail on existing tables)
-- Run this to ensure all tables exist without errors
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    company_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    subscription_plan TEXT DEFAULT 'free',
    credits INT DEFAULT 100,
    total_searches INT DEFAULT 0,
    total_proposals INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    duns_number TEXT,
    cage_code TEXT,
    uei TEXT,
    sdvosb_certified BOOLEAN DEFAULT false,
    certification_expiry DATE,
    naics_codes TEXT[],
    psc_codes TEXT[],
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

-- 3. OPPORTUNITIES (SAM.gov contracts)
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    agency TEXT,
    office TEXT,
    naics_code TEXT,
    psc_code TEXT,
    set_aside TEXT,
    place_of_performance TEXT,
    posted_date TIMESTAMPTZ,
    response_deadline TIMESTAMPTZ,
    contract_value_min NUMERIC,
    contract_value_max NUMERIC,
    contract_type TEXT,
    source TEXT DEFAULT 'SAM.gov',
    url TEXT,
    attachments JSONB DEFAULT '[]',
    keywords TEXT[],
    status TEXT DEFAULT 'active',
    match_score INT,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SAVED OPPORTUNITIES
CREATE TABLE IF NOT EXISTS saved_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'reviewing',
    notes TEXT,
    priority INT DEFAULT 0,
    deadline_reminder TIMESTAMPTZ,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, opportunity_id)
);

-- 5. AI ANALYSES
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL,
    ai_provider TEXT DEFAULT 'claude',
    model_used TEXT,
    prompt_tokens INT,
    completion_tokens INT,
    result JSONB NOT NULL,
    match_score INT,
    strengths TEXT[],
    weaknesses TEXT[],
    recommendations TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROPOSALS
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    version INT DEFAULT 1,
    status TEXT DEFAULT 'draft',
    content JSONB NOT NULL,
    executive_summary TEXT,
    technical_approach TEXT,
    pricing JSONB,
    generated_by_ai BOOLEAN DEFAULT true,
    ai_provider TEXT,
    document_url TEXT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SAVED SEARCHES
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    filters JSONB NOT NULL,
    alert_enabled BOOLEAN DEFAULT false,
    alert_frequency TEXT DEFAULT 'daily',
    last_alerted_at TIMESTAMPTZ,
    result_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. USER ANALYTICS
CREATE TABLE IF NOT EXISTS user_analytics (
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

-- Enable RLS on tables (safe to run multiple times)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS user_profiles_select ON user_profiles;
DROP POLICY IF EXISTS user_profiles_insert ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update ON user_profiles;

CREATE POLICY user_profiles_select ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY user_profiles_insert ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY user_profiles_update ON user_profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS opportunities_select ON opportunities;
CREATE POLICY opportunities_select ON opportunities FOR SELECT TO authenticated USING (true);

-- Success message
SELECT 'Sturgeon AI database schema applied successfully!' as status;
