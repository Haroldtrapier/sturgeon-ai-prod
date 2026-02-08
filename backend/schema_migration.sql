-- ============================================================================
-- STURGEON AI - Extended Schema Migration
-- Run AFTER the base schema.sql to add missing tables
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CHAT SESSIONS (Multi-agent chat support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL DEFAULT 'general',
    title VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent ON chat_sessions(agent_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- ============================================================================
-- CERTIFICATION DOCUMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS certification_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cert_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    file_url TEXT,
    expiration_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_docs_user ON certification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_docs_type ON certification_documents(cert_type);

-- ============================================================================
-- CONTRACTS HISTORY (FPDS/USASpending data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contracts_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id VARCHAR(255) UNIQUE NOT NULL,
    agency VARCHAR(255),
    department VARCHAR(255),
    vendor_name VARCHAR(255),
    vendor_duns VARCHAR(20),
    vendor_cage VARCHAR(20),
    award_amount NUMERIC,
    award_date DATE,
    naics_code VARCHAR(20),
    psc_code VARCHAR(50),
    description TEXT,
    source VARCHAR(50) DEFAULT 'FPDS',
    raw_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_naics ON contracts_history(naics_code);
CREATE INDEX IF NOT EXISTS idx_contracts_agency ON contracts_history(agency);
CREATE INDEX IF NOT EXISTS idx_contracts_vendor ON contracts_history(vendor_name);
CREATE INDEX IF NOT EXISTS idx_contracts_award_date ON contracts_history(award_date DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_amount ON contracts_history(award_amount DESC);

-- ============================================================================
-- COMPLIANCE CHECKS (linked to proposals)
-- ============================================================================
CREATE TABLE IF NOT EXISTS compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    check_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    details JSONB DEFAULT '{}',
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_checks_proposal ON compliance_checks(proposal_id);

-- ============================================================================
-- COMPLIANCE REQUIREMENTS (extracted from solicitations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS compliance_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    section_ref VARCHAR(100) DEFAULT '',
    keyword VARCHAR(20) DEFAULT 'SHALL',
    status VARCHAR(50) DEFAULT 'missing',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_reqs_proposal ON compliance_requirements(proposal_id);

-- ============================================================================
-- PROPOSAL SECTIONS (individual sections of a proposal)
-- ============================================================================
CREATE TABLE IF NOT EXISTS proposal_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    section_name VARCHAR(255) NOT NULL,
    content TEXT DEFAULT '',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposal_sections_proposal ON proposal_sections(proposal_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    link_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================================================
-- RLS POLICIES for new tables
-- ============================================================================

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Contracts history is public read
ALTER TABLE contracts_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY contracts_history_select ON contracts_history FOR SELECT TO authenticated USING (true);

-- Chat sessions: users see their own
CREATE POLICY chat_sessions_select ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY chat_sessions_insert ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY chat_sessions_delete ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Chat messages: accessible via session ownership
CREATE POLICY chat_messages_select ON chat_messages FOR SELECT
    USING (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));
CREATE POLICY chat_messages_insert ON chat_messages FOR INSERT
    WITH CHECK (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));

-- Certification documents: users see their own
CREATE POLICY cert_docs_select ON certification_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cert_docs_insert ON certification_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cert_docs_update ON certification_documents FOR UPDATE USING (auth.uid() = user_id);

-- Compliance checks: accessible via proposal ownership
CREATE POLICY compliance_checks_select ON compliance_checks FOR SELECT
    USING (proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid()));
CREATE POLICY compliance_checks_insert ON compliance_checks FOR INSERT
    WITH CHECK (proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid()));

-- Compliance requirements: accessible via proposal ownership
CREATE POLICY compliance_reqs_select ON compliance_requirements FOR SELECT
    USING (proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid()));
CREATE POLICY compliance_reqs_insert ON compliance_requirements FOR INSERT
    WITH CHECK (proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid()));
CREATE POLICY compliance_reqs_update ON compliance_requirements FOR UPDATE
    USING (proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid()));

-- Proposal sections: accessible via proposal ownership
CREATE POLICY proposal_sections_select ON proposal_sections FOR SELECT
    USING (proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid()));
CREATE POLICY proposal_sections_insert ON proposal_sections FOR INSERT
    WITH CHECK (proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid()));
CREATE POLICY proposal_sections_update ON proposal_sections FOR UPDATE
    USING (proposal_id IN (SELECT id FROM proposals WHERE user_id = auth.uid()));

-- Notifications: users see their own
CREATE POLICY notifications_select ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_insert ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY notifications_delete ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS for updated_at
-- ============================================================================

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cert_docs_updated_at BEFORE UPDATE ON certification_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_sections_updated_at BEFORE UPDATE ON proposal_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
