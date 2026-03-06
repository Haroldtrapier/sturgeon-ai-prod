'use client';

import { useState } from 'react';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  type: 'email' | 'social' | 'content' | 'paid';
  budget: number;
  spent: number;
  leads: number;
  conversions: number;
  startDate: string;
  endDate: string;
}

interface ContentItem {
  id: string;
  type: string;
  title: string;
  status: 'draft' | 'published' | 'scheduled';
  performance: number;
  createdAt: string;
}

interface MarketingInsight {
  id: string;
  category: 'trend' | 'competitor' | 'opportunity' | 'risk';
  title: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  actionable: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Q1 Federal Contractors Outreach',
    status: 'active',
    type: 'email',
    budget: 5000,
    spent: 2340,
    leads: 48,
    conversions: 12,
    startDate: '2026-01-15',
    endDate: '2026-03-31',
  },
  {
    id: '2',
    name: 'SAM.gov Decision Makers Social',
    status: 'active',
    type: 'social',
    budget: 3500,
    spent: 1890,
    leads: 31,
    conversions: 7,
    startDate: '2026-02-01',
    endDate: '2026-04-30',
  },
  {
    id: '3',
    name: 'AI Proposal Automation Content Series',
    status: 'completed',
    type: 'content',
    budget: 2000,
    spent: 2000,
    leads: 89,
    conversions: 22,
    startDate: '2025-11-01',
    endDate: '2026-01-31',
  },
  {
    id: '4',
    name: 'GovCon Paid Search — Spring',
    status: 'draft',
    type: 'paid',
    budget: 8000,
    spent: 0,
    leads: 0,
    conversions: 0,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
  },
];

const mockInsights: MarketingInsight[] = [
  {
    id: '1',
    category: 'opportunity',
    title: 'Defense IT Spending Up 18% YoY',
    summary: 'DoD and DHS are dramatically increasing IT modernization budgets. Opportunity for targeted proposals.',
    impact: 'high',
    actionable: 'Launch targeted campaign to defense IT decision makers on LinkedIn + USASpending outreach',
  },
  {
    id: '2',
    category: 'trend',
    title: 'AI Procurement Mandates Accelerating',
    summary: 'Executive orders on AI acquisition are pushing agencies to adopt AI tools faster than ever.',
    impact: 'high',
    actionable: 'Publish thought leadership content positioning Sturgeon AI as the compliance-ready solution',
  },
  {
    id: '3',
    category: 'competitor',
    title: 'GovWin IQ Adding AI Features',
    summary: 'Deltek GovWin announced AI-assisted opportunity matching in Q2 2026.',
    impact: 'medium',
    actionable: 'Accelerate differentiation messaging around real-time AI analysis and proposal automation speed',
  },
  {
    id: '4',
    category: 'risk',
    title: 'SBIR Deadline Cluster in April',
    summary: '14 major SBIR/STTR solicitations closing April 15–30. High competition expected.',
    impact: 'medium',
    actionable: 'Pre-position content and outreach 3 weeks before deadlines to capture early-movers',
  },
];

const mockContent: ContentItem[] = [
  { id: '1', type: 'Blog Post', title: 'How AI Doubles Your Win Rate on Federal Proposals', status: 'published', performance: 94, createdAt: '2026-02-20' },
  { id: '2', type: 'Email', title: 'Q1 GovCon Opportunity Digest', status: 'published', performance: 78, createdAt: '2026-03-01' },
  { id: '3', type: 'LinkedIn', title: 'SAM.gov Automation: 5 Things Contractors Miss', status: 'scheduled', performance: 0, createdAt: '2026-03-05' },
  { id: '4', type: 'Case Study', title: 'How TechFirm Inc Won 3 IDIQ Contracts with Sturgeon AI', status: 'draft', performance: 0, createdAt: '2026-03-04' },
];

const KPI_CARDS = [
  { label: 'Total Leads (30d)', value: '247', delta: '+18%', positive: true },
  { label: 'Campaign ROI', value: '4.2x', delta: '+0.6x', positive: true },
  { label: 'Content Engagement', value: '68%', delta: '+9%', positive: true },
  { label: 'Cost Per Lead', value: '$24', delta: '-$4', positive: true },
];

const CONTENT_TYPES = [
  'Email Campaign',
  'LinkedIn Post',
  'Blog Post',
  'Case Study',
  'Proposal Summary',
  'Executive Brief',
  'Press Release',
  'Social Media Thread',
];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-900/50 text-emerald-400 border border-emerald-800',
  paused: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
  completed: 'bg-slate-700 text-slate-300 border border-slate-600',
  draft: 'bg-slate-800 text-slate-400 border border-slate-700',
  published: 'bg-emerald-900/50 text-emerald-400 border border-emerald-800',
  scheduled: 'bg-blue-900/50 text-blue-400 border border-blue-800',
};

const IMPACT_COLORS: Record<string, string> = {
  high: 'text-red-400 bg-red-900/30 border border-red-800',
  medium: 'text-yellow-400 bg-yellow-900/30 border border-yellow-800',
  low: 'text-slate-400 bg-slate-800 border border-slate-700',
};

const CATEGORY_ICONS: Record<string, string> = {
  opportunity: '🚀',
  trend: '📈',
  competitor: '⚔️',
  risk: '⚠️',
};

const TYPE_ICONS: Record<string, string> = {
  email: '✉️',
  social: '📱',
  content: '📝',
  paid: '💰',
};

export default function ExecutiveMarketingDirector() {
  const [activeTab, setActiveTab] = useState<'overview' | 'studio' | 'campaigns' | 'intelligence' | 'brand'>('overview');
  const [contentType, setContentType] = useState(CONTENT_TYPES[0]);
  const [contentTopic, setContentTopic] = useState('');
  const [contentAudience, setContentAudience] = useState('Federal contracting officers');
  const [contentTone, setContentTone] = useState('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!contentTopic.trim()) return;
    setGenerating(true);
    setGeneratedContent('');
    try {
      const res = await fetch('/api/marketing/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: contentType, topic: contentTopic, audience: contentAudience, tone: contentTone }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedContent(data.content || '');
      } else {
        setGeneratedContent(getFallbackContent(contentType, contentTopic, contentAudience));
      }
    } catch {
      setGeneratedContent(getFallbackContent(contentType, contentTopic, contentAudience));
    } finally {
      setGenerating(false);
    }
  };

  const getFallbackContent = (type: string, topic: string, audience: string) => {
    return `[${type}] — "${topic}" for ${audience}\n\nSubject: Transform Your Proposal Process with AI\n\nDear Federal Contracting Professional,\n\nIn today's competitive government contracting landscape, winning proposals require more than experience — they require speed, precision, and intelligence.\n\nSturgeon AI delivers all three.\n\nOur AI-powered platform analyzes ${topic.toLowerCase()} in real time, helping your team:\n• Identify high-probability opportunities before competitors\n• Generate compliant, compelling proposal content in minutes\n• Track submission timelines and compliance requirements automatically\n\nJoin 500+ contractors who've increased their win rates by an average of 34%.\n\n[Schedule a Demo] [View Case Studies]\n\nBest regards,\nSturgeon AI Marketing Team`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalBudget = mockCampaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = mockCampaigns.reduce((s, c) => s + c.spent, 0);
  const totalLeads = mockCampaigns.reduce((s, c) => s + c.leads, 0);
  const totalConversions = mockCampaigns.reduce((s, c) => s + c.conversions, 0);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'studio', label: 'AI Content Studio' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'intelligence', label: 'Market Intelligence' },
    { id: 'brand', label: 'Brand HQ' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-2xl">🎯</span> Executive Marketing Director
            </h1>
            <p className="text-slate-400 mt-1">AI-powered campaigns, content generation, and market intelligence</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-400 text-sm border border-emerald-800">
              ● AI Active
            </span>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-6 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {KPI_CARDS.map((kpi) => (
                <div key={kpi.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">{kpi.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                  <p className={`text-sm mt-1 font-medium ${kpi.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {kpi.delta} vs last period
                  </p>
                </div>
              ))}
            </div>

            {/* Campaign Summary Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Campaign Portfolio</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-slate-400 text-sm">Total Budget</p>
                  <p className="text-white text-xl font-bold">${totalBudget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Spent</p>
                  <p className="text-white text-xl font-bold">${totalSpent.toLocaleString()}</p>
                  <div className="mt-2 bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Leads</p>
                  <p className="text-white text-xl font-bold">{totalLeads}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Conversions</p>
                  <p className="text-white text-xl font-bold">{totalConversions}</p>
                  <p className="text-emerald-400 text-xs">{((totalConversions / totalLeads) * 100).toFixed(1)}% rate</p>
                </div>
              </div>
            </div>

            {/* AI Market Insights */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span>🤖</span> AI Market Insights
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {mockInsights.map((insight) => (
                  <div key={insight.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{CATEGORY_ICONS[insight.category]}</span>
                        <span className="text-white font-medium text-sm">{insight.title}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${IMPACT_COLORS[insight.impact]}`}>
                        {insight.impact}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{insight.summary}</p>
                    <div className="bg-emerald-900/20 border border-emerald-800/50 rounded p-2">
                      <p className="text-emerald-400 text-xs font-medium">💡 Action: {insight.actionable}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Content Studio Tab */}
        {activeTab === 'studio' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Generation Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span>✨</span> AI Content Generator
              </h3>
              <div>
                <label className="text-slate-400 text-sm block mb-1">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1">Topic / Subject</label>
                <input
                  type="text"
                  value={contentTopic}
                  onChange={(e) => setContentTopic(e.target.value)}
                  placeholder="e.g. AI-powered SAM.gov proposal automation"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-600"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1">Target Audience</label>
                <input
                  type="text"
                  value={contentAudience}
                  onChange={(e) => setContentAudience(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm block mb-1">Tone</label>
                <select
                  value={contentTone}
                  onChange={(e) => setContentTone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="professional">Professional</option>
                  <option value="conversational">Conversational</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="urgent">Urgent / Action-Oriented</option>
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!contentTopic.trim() || generating}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg py-2.5 font-medium text-sm transition-colors"
              >
                {generating ? '⟳ Generating...' : '✨ Generate Content'}
              </button>

              {/* Content Library */}
              <div className="mt-4">
                <h4 className="text-slate-400 text-sm font-medium mb-2">Recent Content</h4>
                <div className="space-y-2">
                  {mockContent.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{item.title}</p>
                        <p className="text-slate-500 text-xs">{item.type}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        {item.performance > 0 && (
                          <span className="text-emerald-400 text-xs">{item.performance}%</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status]}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <span>📄</span> Generated Content
                </h3>
                {generatedContent && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                    <button className="text-xs px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition-colors">
                      Save to Library
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg p-4 min-h-64">
                {generating ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                      <p className="text-slate-400 text-sm">Generating with AI...</p>
                    </div>
                  </div>
                ) : generatedContent ? (
                  <pre className="text-slate-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">{generatedContent}</pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-600 text-sm text-center">
                    Fill in the form and click<br />Generate Content to create AI-powered marketing copy
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Active Campaigns</h3>
              <button className="text-sm px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors">
                + New Campaign
              </button>
            </div>
            {mockCampaigns.map((campaign) => (
              <div key={campaign.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{TYPE_ICONS[campaign.type]}</span>
                    <div>
                      <h4 className="text-white font-medium">{campaign.name}</h4>
                      <p className="text-slate-500 text-sm capitalize">{campaign.type} · {campaign.startDate} → {campaign.endDate}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${STATUS_COLORS[campaign.status]}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-slate-500 text-xs">Budget</p>
                    <p className="text-white font-medium">${campaign.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Spent</p>
                    <p className="text-white font-medium">${campaign.spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Leads</p>
                    <p className="text-white font-medium">{campaign.leads}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Conversions</p>
                    <p className="text-white font-medium">{campaign.conversions}</p>
                  </div>
                </div>
                {campaign.budget > 0 && (
                  <div className="bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Market Intelligence Tab */}
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm">Market Opportunities</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">142</p>
                <p className="text-slate-500 text-xs mt-1">Identified this month</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm">Competitive Alerts</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">7</p>
                <p className="text-slate-500 text-xs mt-1">Requiring attention</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm">Market Growth (YoY)</p>
                <p className="text-3xl font-bold text-white mt-1">+22%</p>
                <p className="text-slate-500 text-xs mt-1">GovCon AI sector</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {mockInsights.map((insight) => (
                <div key={insight.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{CATEGORY_ICONS[insight.category]}</span>
                      <div>
                        <p className="text-white font-medium text-sm">{insight.title}</p>
                        <p className="text-slate-500 text-xs capitalize">{insight.category}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${IMPACT_COLORS[insight.impact]}`}>
                      {insight.impact} impact
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">{insight.summary}</p>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <p className="text-slate-400 text-xs font-medium mb-1">Recommended Action</p>
                    <p className="text-emerald-400 text-sm">{insight.actionable}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand HQ Tab */}
        {activeTab === 'brand' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-white font-semibold">Brand Voice Guidelines</h3>
              {[
                { label: 'Tone', value: 'Authoritative yet approachable — expert without being exclusionary' },
                { label: 'Mission', value: 'Empowering federal contractors to win more with AI-powered intelligence' },
                { label: 'Audience', value: 'Small-to-mid size government contractors, BD professionals, executives' },
                { label: 'Keywords', value: 'AI, compliance, proposals, SAM.gov, Grants.gov, win rate, automation' },
                { label: 'Avoid', value: 'Jargon-heavy, overly casual, vague promises, political statements' },
              ].map((item) => (
                <div key={item.label} className="border-b border-slate-800 pb-3">
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="text-white text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Brand Colors</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Emerald', hex: '#10b981', cls: 'bg-emerald-500' },
                    { name: 'Slate Dark', hex: '#0f172a', cls: 'bg-slate-950 border border-slate-700' },
                    { name: 'Slate Mid', hex: '#1e293b', cls: 'bg-slate-800' },
                    { name: 'White', hex: '#f8fafc', cls: 'bg-slate-50' },
                    { name: 'Amber', hex: '#f59e0b', cls: 'bg-amber-500' },
                    { name: 'Blue', hex: '#3b82f6', cls: 'bg-blue-500' },
                  ].map((color) => (
                    <div key={color.name} className="text-center">
                      <div className={`h-10 rounded-lg mb-1 ${color.cls}`} />
                      <p className="text-white text-xs font-medium">{color.name}</p>
                      <p className="text-slate-500 text-xs">{color.hex}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3">Asset Library</h3>
                <div className="space-y-2">
                  {['Logo (SVG, PNG)', 'Email Templates', 'Proposal Cover Templates', 'Social Media Templates', 'Press Kit'].map((asset) => (
                    <div key={asset} className="flex items-center justify-between py-2 border-b border-slate-800">
                      <p className="text-slate-300 text-sm">📁 {asset}</p>
                      <button className="text-emerald-400 text-xs hover:text-emerald-300">Download</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
