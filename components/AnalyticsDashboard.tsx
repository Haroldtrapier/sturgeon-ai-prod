'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_TREND_DATA = [
  { date: 'Jan', proposals: 4, submitted: 2 },
  { date: 'Feb', proposals: 7, submitted: 4 },
  { date: 'Mar', proposals: 5, submitted: 3 },
  { date: 'Apr', proposals: 10, submitted: 6 },
  { date: 'May', proposals: 8, submitted: 5 },
  { date: 'Jun', proposals: 13, submitted: 9 },
]

const MOCK_CAMPAIGN_DATA = [
  { name: 'Defense Outreach', sent: 45, opened: 32, replied: 12 },
  { name: 'Federal IT', sent: 60, opened: 41, replied: 18 },
  { name: 'Healthcare Gov', sent: 38, opened: 27, replied: 9 },
  { name: 'SBIR Round', sent: 52, opened: 35, replied: 14 },
  { name: 'Grant Push', sent: 70, opened: 55, replied: 22 },
]

const MOCK_PIPELINE_DATA = [
  { name: 'Draft', value: 6, color: '#64748b' },
  { name: 'In Review', value: 9, color: '#3b82f6' },
  { name: 'Submitted', value: 14, color: '#8b5cf6' },
  { name: 'Won', value: 7, color: '#10b981' },
  { name: 'Lost', value: 3, color: '#ef4444' },
]

const MOCK_TRAFFIC_DATA = [
  { date: 'Jan', sam: 40, grants: 25, direct: 15 },
  { date: 'Feb', sam: 55, grants: 30, direct: 20 },
  { date: 'Mar', sam: 48, grants: 35, direct: 18 },
  { date: 'Apr', sam: 70, grants: 42, direct: 25 },
  { date: 'May', sam: 63, grants: 38, direct: 22 },
  { date: 'Jun', sam: 88, grants: 55, direct: 30 },
]

const MOCK_ANALYTICS = {
  totalProposals: 39,
  activeProposals: 9,
  submittedProposals: 14,
  successRate: 37,
  totalRevenuePipeline: 2450000,
  avgProposalValue: 62820,
  winRate: 70,
  avgDaysToSubmit: 12,
  opportunitiesViewed: 142,
  savedOpportunities: 28,
  recentActivity: [
    { id: '1', type: 'proposal_submitted', description: 'Submitted "SBIR Phase II – AI Logistics"', timestamp: '2h ago' },
    { id: '2', type: 'opportunity_saved', description: 'Saved "DHS Cybersecurity BPA"', timestamp: '4h ago' },
    { id: '3', type: 'campaign_launched', description: 'Launched "Federal IT Outreach Q2"', timestamp: '1d ago' },
    { id: '4', type: 'proposal_won', description: 'Won "Army Data Analytics Contract"', timestamp: '2d ago' },
    { id: '5', type: 'proposal_submitted', description: 'Submitted "HHS Grant Application"', timestamp: '3d ago' },
  ],
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface ActivityItem {
  id: string
  type: string
  description: string
  timestamp: string
}

interface AnalyticsData {
  totalProposals: number
  activeProposals: number
  submittedProposals: number
  successRate: number
  totalRevenuePipeline: number
  avgProposalValue: number
  winRate: number
  avgDaysToSubmit: number
  opportunitiesViewed: number
  savedOpportunities: number
  recentActivity: ActivityItem[]
}

type Tab = 'overview' | 'campaigns' | 'traffic'

// ── MetricCard ────────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  delta,
  prefix = '',
  suffix = '',
}: {
  label: string
  value: string | number
  delta?: number
  prefix?: string
  suffix?: string
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
      {delta !== undefined && (
        <span
          className={`text-xs font-medium mt-1 inline-block ${
            delta >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs last period
        </span>
      )}
    </div>
  )
}

// ── Tab Config ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',   label: 'Overview' },
  { id: 'campaigns',  label: 'Campaigns' },
  { id: 'traffic',    label: 'Traffic Sources' },
]

// ── Main Component ────────────────────────────────────────────────────────────

export default function AnalyticsDashboard({ userId }: { userId?: string }) {
  const [analytics, setAnalytics]   = useState<AnalyticsData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState<Tab>('overview')
  const [timeRange, setTimeRange]   = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  const loadAnalytics = useCallback(async () => {
    try {
      const params = new URLSearchParams({ timeRange, ...(userId ? { userId } : {}) })
      const res = await fetch(`/api/analytics?${params}`)
      if (!res.ok) throw new Error('API error')
      const data: AnalyticsData = await res.json()
      setAnalytics(data)
    } catch {
      setAnalytics(MOCK_ANALYTICS)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userId, timeRange])

  useEffect(() => {
    setLoading(true)
    loadAnalytics()
  }, [loadAnalytics])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAnalytics()
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading analytics…</p>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Proposal performance &amp; outreach metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <span className={refreshing ? 'animate-spin inline-block' : 'inline-block'}>↻</span>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Tab Nav ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-slate-900 rounded-xl p-1 border border-slate-800 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          OVERVIEW TAB
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Primary metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Total Proposals"  value={analytics.totalProposals}     delta={18} />
            <MetricCard label="Active Proposals"  value={analytics.activeProposals}    delta={5}  />
            <MetricCard label="Submitted"         value={analytics.submittedProposals} delta={12} />
            <MetricCard label="Success Rate"      value={analytics.successRate}        delta={3}  suffix="%" />
          </div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Revenue Pipeline"
              value={`$${(analytics.totalRevenuePipeline / 1_000_000).toFixed(1)}M`}
              delta={22}
            />
            <MetricCard label="Avg Proposal Value" value={analytics.avgProposalValue} prefix="$" delta={8} />
            <MetricCard label="Win Rate"            value={analytics.winRate}          suffix="%" delta={-2} />
            <MetricCard label="Avg Days to Submit"  value={analytics.avgDaysToSubmit}  suffix=" d" delta={-15} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Proposal Trend — LineChart */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Proposal Trend</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={MOCK_TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="proposals" stroke="#10b981" strokeWidth={2} dot={false} name="Created"   />
                  <Line type="monotone" dataKey="submitted"  stroke="#3b82f6" strokeWidth={2} dot={false} name="Submitted" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pipeline by Status — PieChart */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-sm font-semibold text-slate-300 mb-4">Pipeline by Status</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={MOCK_PIPELINE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {MOCK_PIPELINE_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                  />
                  <Legend formatter={v => <span className="text-slate-300 text-xs">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Recent Activity</h2>
            <ul className="space-y-3">
              {analytics.recentActivity.map(item => (
                <li key={item.id} className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{item.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          CAMPAIGNS TAB
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">

          {/* Campaign Performance — BarChart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Campaign Performance</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MOCK_CAMPAIGN_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend />
                <Bar dataKey="sent"    fill="#64748b" name="Sent"    radius={[4, 4, 0, 0]} />
                <Bar dataKey="opened"  fill="#3b82f6" name="Opened"  radius={[4, 4, 0, 0]} />
                <Bar dataKey="replied" fill="#10b981" name="Replied" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Campaign details table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900">
                  <th className="text-left  px-4 py-3 text-slate-400 font-medium">Campaign</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Sent</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Opened</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Replied</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Open Rate</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CAMPAIGN_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{row.sent}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{row.opened}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{row.replied}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-emerald-400 font-semibold">
                        {Math.round((row.opened / row.sent) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TRAFFIC SOURCES TAB
      ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'traffic' && (
        <div className="space-y-6">

          {/* Traffic metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard label="SAM.gov Leads"      value={analytics.opportunitiesViewed}                        delta={31}  />
            <MetricCard label="Grants.gov Leads"   value={Math.round(analytics.opportunitiesViewed * 0.6)}      delta={14}  />
            <MetricCard label="Direct Inquiries"   value={analytics.savedOpportunities}                         delta={-5}  />
          </div>

          {/* Traffic by Source — LineChart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Traffic by Source</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={MOCK_TRAFFIC_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend />
                <Line type="monotone" dataKey="sam"    stroke="#10b981" strokeWidth={2} dot={false} name="SAM.gov"    />
                <Line type="monotone" dataKey="grants" stroke="#3b82f6" strokeWidth={2} dot={false} name="Grants.gov" />
                <Line type="monotone" dataKey="direct" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Direct"     />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Source breakdown — progress bars */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">Source Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: 'SAM.gov',    pct: 52, color: 'bg-emerald-500' },
                { label: 'Grants.gov', pct: 33, color: 'bg-blue-500'    },
                { label: 'Direct',     pct: 15, color: 'bg-violet-500'  },
              ].map(src => (
                <div key={src.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300 font-medium">{src.label}</span>
                    <span className="text-slate-400">{src.pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${src.color} rounded-full transition-all duration-700`}
                      style={{ width: `${src.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
