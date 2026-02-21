-- Call campaigns and call logs for bulk calling
CREATE TABLE IF NOT EXISTS call_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    script TEXT DEFAULT '',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    total_contacts INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES call_campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    outcome TEXT DEFAULT 'pending' CHECK (outcome IN (
        'pending', 'connected', 'voicemail', 'no_answer', 'busy',
        'wrong_number', 'callback', 'interested', 'not_interested', 'closed'
    )),
    duration_seconds INT,
    notes TEXT,
    callback_at TIMESTAMPTZ,
    called_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_call_campaigns_user_id ON call_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_campaign_id ON call_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_contact_id ON call_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_outcome ON call_logs(outcome);
CREATE INDEX IF NOT EXISTS idx_call_logs_callback_at ON call_logs(callback_at) WHERE callback_at IS NOT NULL;

-- RLS policies for call_campaigns
ALTER TABLE call_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaigns"
    ON call_campaigns FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns"
    ON call_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
    ON call_campaigns FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
    ON call_campaigns FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for call_logs
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own call logs"
    ON call_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own call logs"
    ON call_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own call logs"
    ON call_logs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own call logs"
    ON call_logs FOR DELETE USING (auth.uid() = user_id);
