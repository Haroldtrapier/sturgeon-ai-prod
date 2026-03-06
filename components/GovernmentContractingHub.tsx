'use client';

import { useState, useEffect, useCallback } from 'react';

interface Opportunity {
  id: string;
  title: string;
  agency: string;
  type: 'contract' | 'grant';
  value: string;
  deadline: string;
  naicsCode: string;
  setAside: string;
  matchScore: number;
  status: 'open' | 'closing_soon' | 'closed';
  source: 'SAM.gov' | 'Grants.gov';
  description: string;
  saved: boolean;
}

interface PipelineItem {
  id: string;
  title: string;
  agency: string;
  stage: 'identified' | 'pursuing' | 'proposal_submitted' | 'awarded' | 'lost';
  value: string;
  deadline: string;
  probability: number;
  lastAction: string;
}

interface AIAnalysis {
  opportunityId: string;
  winProbability: number;
  competitionLevel: 'low' | 'medium' | 'high';
  keyRequirements: string[];
  risks: string[];
  recommendations: string[];
  estimatedEffort: string;
}

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-001',
    title: 'AI-Powered Logistics Optimization for DoD Supply Chain',
    agency: 'Department of Defense',
    type: 'contract',
    value: '$4,200,000',
    deadline: '2026-03-28',
    naicsCode: '541511',
    setAside: 'Small Business',
    matchScore: 94,
    status: 'closing_soon',
    source: 'SAM.gov',
    description: 'Seeking AI solutions to optimize DoD supply chain logistics, reduce costs, and improve delivery times across multiple bases.',
    saved: true,
  },
  {
    id: 'opp-002',
    title: 'Federal Cybersecurity Posture Assessment — DHS',
    agency: 'Dept. of Homeland Security',
    type: 'contract',
    value: '$1,850,000',
    deadline: '2026-04-15',
    naicsCode: '541519',
    setAside: '8(a)',
    matchScore: 88,
    status: 'open',
    source: 'SAM.gov',
    description: 'Comprehensive cybersecurity posture assessment and zero-trust architecture advisory for DHS enterprise network.',
    saved: false,
  },
  {
    id: 'opp-003',
    title: 'SBIR Phase II: Machine Learning for Climate Data',
    agency: 'NASA',
    type: 'grant',
    value: '$750,000',
    deadline: '2026-04-01',
    naicsCode: '541712',
    setAside: 'SBIR',
    matchScore: 81,
    status: 'open',
    source: 'Grants.gov',
    description: 'Phase II SBIR grant for ML-based climate data analysis and prediction modeling for Earth science missions.',
    saved: false,
  },
  {
    id: 'opp-004',
    title: 'Healthcare IT Modernization — VA Systems',
    agency: 'Dept. of Veterans Affairs',
    type: 'contract',
    value: '$6,500,000',
    deadline: '2026-05-10',
    naicsCode: '541512',
    setAside: 'SDVOSB',
    matchScore: 76,
    status: 'open',
    source: 'SAM.gov',
    description: 'Modernization of legacy healthcare IT systems for VA facilities, including EHR integration and telehealth capabilities.',
    saved: true,
  },
  {
    id: 'opp-005',
    title: 'Rural Broadband Infrastructure Grant',
    agency: 'USDA',
    type: 'grant',
    value: '$2,100,000',
    deadline: '2026-03-31',
    naicsCode: '517110',
    setAside: 'None',
    matchScore: 62,
    status: 'closing_soon',
    source: 'Grants.gov',
    description: 'Grant funding for expanding broadband internet access in rural and underserved communities across 12 states.',
    saved: false,
  },
  {
    id: 'opp-006',
    title: 'GSA Schedule IT Professional Services BPA',
    agency: 'General Services Administration',
    type: 'contract',
    value: '$900,000',
    deadline: '2026-06-01',
    naicsCode: '541511',
    setAside: 'HUBZone',
    matchScore: 71,
    status: 'open',
    source: 'SAM.gov',
    description: 'Blanket Purchase Agreement for IT professional services under GSA Multiple Award Schedule.',
    saved: false,
  },
];

const MOCK_PIPELINE: PipelineItem[] = [
  {
    id: 'pip-001',
    title: 'AI-Powered Logistics Optimization for DoD',
    agency: 'Department of Defense',
    stage: 'pursuing',
    value: '$4,200,000',
    deadline: '2026-03-28',
    probability: 72,
    lastAction: 'Capability statement submitted 2 days ago',
  },
  {
    id: 'pip-002',
    title: 'Healthcare IT Modernization — VA',
    agency: 'Dept. of Veterans Affairs',
    stage: 'proposal_submitted',
    value: '$6,500,000',
    deadline: '2026-05-10',
    probability: 45,
    lastAction: 'Technical proposal submitted',
  },
  {
    id: 'pip-003',
    title: 'EPA Environmental Monitoring Network',
    agency: 'Environmental Protection Agency',
    stage: 'awarded',
    value: '$1,200,000',
    deadline: '2025-12-15',
    probability: 100,
    lastAction: 'Contract awarded — kickoff scheduled',
  },
  {
    id: 'pip-004',
    title: 'NIH Data Analytics Platform',
    agency: 'National Institutes of Health',
    stage: 'lost',
    value: '$3,100,000',
    deadline: '2025-11-30',
    probability: 0,
    lastAction: 'Award went to competitor — debrief requested',
  },
];

const MOCK_AI_ANALYSIS: AIAnalysis = {
  opportunityId: 'opp-001',
  winProbability: 72,
  competitionLevel: 'medium',
  keyRequirements: [
    'Demonstrated AI/ML implementation experience',
    'DoD clearance or ability to obtain',
    'Supply chain domain expertise',
    'Past performance on logistics contracts >$1M',
  ],
  risks: [
    'Tight 24-day deadline for proposal prep',
    'Incumbent advantage — existing vendor relationships',
    'Technical evaluation criteria heavily weighted (60%)',
  ],
  recommendations: [
    'Lead with case studies from commercial logistics AI deployments',
    'Partner with a cleared facility if needed',
    'Emphasize cost reduction metrics from prior work',
    'Request bidders conference attendance ASAP',
  ],
  estimatedEffort: '80-120 hours for full proposal',
};

const STAGE_COLORS: Record<PipelineItem['stage'], string> = {
  identified: 'bg-slate-700 text-slate-300',
  pursuing: 'bg-blue-900 text-blue-300',
  proposal_submitted: 'bg-amber-900 text-amber-300',
  awarded: 'bg-emerald-900 text-emerald-300',
  lost: 'bg-red-900 text-red-300',
};

const STAGE_LABELS: Record<PipelineItem['stage'], string> = {
  identified: 'Identified',
  pursuing: 'Pursuing',
  proposal_submitted: 'Proposal Submitted',
  awarded: 'Awarded',
  lost: 'Lost',
};

export default function GovernmentContractingHub() {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'pipeline' | 'analysis' | 'saved'>('opportunities');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'SAM.gov' | 'Grants.gov'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'contract' | 'grant'>('all');
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [searching, setSearching] = useState(false);

  const filteredOpps = opportunities.filter((o) => {
    if (sourceFilter !== 'all' && o.source !== sourceFilter) return false;
    if (typeFilter !== 'all' && o.type !== typeFilter) return false;
    if (searchQuery && !o.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !o.agency.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const savedOpps = opportunities.filter((o) => o.saved);

  const toggleSave = (id: string) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, saved: !o.saved } : o))
    );
  };

  const runAnalysis = useCallback(async (opp: Opportunity) => {
    setSelectedOpp(opp);
    setAnalyzing(true);
    setActiveTab('analysis');
    await new Promise((r) => setTimeout(r, 1800));
    setAiAnalysis({ ...MOCK_AI_ANALYSIS, opportunityId: opp.id });
    setAnalyzing(false);
  }, []);

  const handleSearch = async () => {
    setSearching(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSearching(false);
  };

  const matchColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-slate-400';
  };

  const statusBadge = (status: Opportunity['status']) => {
    if (status === 'open') return 'bg-emerald-900 text-emerald-300';
    if (status === 'closing_soon') return 'bg-amber-900 text-amber-300';
    return 'bg-red-900 text-red-300';
  };

  const tabs = [
    { key: 'opportunities', label: 'Opportunities', count: filteredOpps.length },
    { key: 'pipeline', label: 'Pipeline', count: MOCK_PIPELINE.length },
    { key: 'analysis', label: 'AI Analysis', count: null },
    { key: 'saved', label: 'Saved', count: savedOpps.length },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Government Contracting Hub</h1>
          <p className="text-slate-400 mt-1">SAM.gov + Grants.gov search, AI opportunity matching, and contract pipeline</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Opportunities', value: '6', sub: 'matching your profile' },
            { label: 'Pipeline Value', value: '$15.9M', sub: 'across 4 pursuits' },
            { label: 'Avg Match Score', value: '79%', sub: 'across filtered results' },
            { label: 'Win Rate (LTM)', value: '34%', sub: '4 of 12 pursued' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-emerald-400">{kpi.value}</p>
              <p className="text-slate-500 text-xs mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 text-xs bg-slate-700 px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* OPPORTUNITIES TAB */}
        {activeTab === 'opportunities' && (
          <div>
            {/* Search Bar */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <input
                type="text"
                placeholder="Search by title, agency, NAICS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-48 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Sources</option>
                <option value="SAM.gov">SAM.gov</option>
                <option value="Grants.gov">Grants.gov</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Types</option>
                <option value="contract">Contracts</option>
                <option value="grant">Grants</option>
              </select>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Opportunities List */}
            <div className="space-y-4">
              {filteredOpps.map((opp) => (
                <div key={opp.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{opp.source}</span>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full capitalize">{opp.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(opp.status)}`}>
                          {opp.status === 'closing_soon' ? 'Closing Soon' : opp.status === 'open' ? 'Open' : 'Closed'}
                        </span>
                        {opp.setAside !== 'None' && (
                          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">{opp.setAside}</span>
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-base">{opp.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">{opp.agency}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-400 font-bold text-lg">{opp.value}</p>
                      <p className={`text-sm font-semibold ${matchColor(opp.matchScore)}`}>{opp.matchScore}% match</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{opp.description}</p>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>NAICS: {opp.naicsCode}</span>
                      <span>Deadline: {opp.deadline}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSave(opp.id)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          opp.saved
                            ? 'border-emerald-600 text-emerald-400 bg-emerald-900/30 hover:bg-emerald-900/50'
                            : 'border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {opp.saved ? '★ Saved' : '☆ Save'}
                      </button>
                      <button
                        onClick={() => runAnalysis(opp)}
                        className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                      >
                        AI Analysis
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredOpps.length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  <p className="text-lg">No opportunities match your filters.</p>
                  <p className="text-sm mt-1">Try adjusting the source or type filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PIPELINE TAB */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            {MOCK_PIPELINE.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    <p className="text-slate-400 text-sm mt-0.5">{item.agency}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-emerald-400 font-bold">{item.value}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STAGE_COLORS[item.stage]}`}>
                      {STAGE_LABELS[item.stage]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs text-slate-500">{item.lastAction}</div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Deadline: {item.deadline}</span>
                    <span>Win Probability:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500"
                          style={{ width: `${item.probability}%` }}
                        />
                      </div>
                      <span className={item.probability === 100 ? 'text-emerald-400' : item.probability === 0 ? 'text-red-400' : 'text-white'}>
                        {item.probability}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI ANALYSIS TAB */}
        {activeTab === 'analysis' && (
          <div>
            {analyzing && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Running AI analysis...</p>
                {selectedOpp && <p className="text-white text-xs max-w-xs text-center">{selectedOpp.title}</p>}
              </div>
            )}
            {!analyzing && !aiAnalysis && (
              <div className="text-center py-24 text-slate-500">
                <p className="text-lg">No analysis loaded.</p>
                <p className="text-sm mt-1">Click "AI Analysis" on any opportunity to analyze it.</p>
              </div>
            )}
            {!analyzing && aiAnalysis && selectedOpp && (
              <div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 mb-6">
                  <h3 className="text-white font-semibold text-lg">{selectedOpp.title}</h3>
                  <p className="text-slate-400 text-sm">{selectedOpp.agency} · {selectedOpp.value} · {selectedOpp.deadline}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 text-center">
                    <p className="text-slate-400 text-xs mb-2">Win Probability</p>
                    <p className="text-4xl font-bold text-emerald-400">{aiAnalysis.winProbability}%</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 text-center">
                    <p className="text-slate-400 text-xs mb-2">Competition Level</p>
                    <p className={`text-2xl font-bold capitalize ${
                      aiAnalysis.competitionLevel === 'low' ? 'text-emerald-400' :
                      aiAnalysis.competitionLevel === 'medium' ? 'text-amber-400' : 'text-red-400'
                    }`}>{aiAnalysis.competitionLevel}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 text-center">
                    <p className="text-slate-400 text-xs mb-2">Estimated Effort</p>
                    <p className="text-xl font-bold text-white">{aiAnalysis.estimatedEffort}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                    <h4 className="text-emerald-400 font-semibold text-sm mb-3">Key Requirements</h4>
                    <ul className="space-y-2">
                      {aiAnalysis.keyRequirements.map((r, i) => (
                        <li key={i} className="text-slate-300 text-sm flex gap-2">
                          <span className="text-emerald-500 mt-0.5">✓</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                    <h4 className="text-amber-400 font-semibold text-sm mb-3">Risk Factors</h4>
                    <ul className="space-y-2">
                      {aiAnalysis.risks.map((r, i) => (
                        <li key={i} className="text-slate-300 text-sm flex gap-2">
                          <span className="text-amber-500 mt-0.5">⚠</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                    <h4 className="text-blue-400 font-semibold text-sm mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {aiAnalysis.recommendations.map((r, i) => (
                        <li key={i} className="text-slate-300 text-sm flex gap-2">
                          <span className="text-blue-400 mt-0.5">→</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SAVED TAB */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedOpps.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <p className="text-lg">No saved opportunities.</p>
                <p className="text-sm mt-1">Save opportunities from the Opportunities tab.</p>
              </div>
            )}
            {savedOpps.map((opp) => (
              <div key={opp.id} className="bg-slate-900 border border-emerald-800 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex gap-2 mb-1 flex-wrap">
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{opp.source}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(opp.status)}`}>
                        {opp.status === 'closing_soon' ? 'Closing Soon' : 'Open'}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold">{opp.title}</h3>
                    <p className="text-slate-400 text-sm">{opp.agency}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-emerald-400 font-bold">{opp.value}</p>
                    <p className={`text-sm font-semibold ${matchColor(opp.matchScore)}`}>{opp.matchScore}% match</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <span className="text-xs text-slate-500">Deadline: {opp.deadline}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleSave(opp.id)}
                      className="px-3 py-1.5 text-xs border border-red-800 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => runAnalysis(opp)}
                      className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                    >
                      AI Analysis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
