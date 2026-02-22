'use client'

import { useEffect, useState } from 'react'

type AnalyticsData = {
  totalProposals: number
  activeProposals: number
  submittedProposals: number
  successRate: number
  opportunitiesViewed: number
  savedOpportunities: number
  avgResponseTime: number
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

export default function AnalyticsDashboard({ userId }: { userId: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?userId=${userId}&range=${timeRange}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-stone-100 rounded-lg"></div>
        <div className="h-32 bg-stone-100 rounded-lg"></div>
      </div>
    )
  }

  if (!analytics) {
    return <div className="text-stone-500">No analytics data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          aria-label="Select time range"
          className="px-4 py-2 bg-stone-100 border border-stone-300 rounded-lg text-stone-700"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Proposals"
          value={analytics.totalProposals}
          icon="📄"
          color="blue"
        />
        <MetricCard
          title="Active Proposals"
          value={analytics.activeProposals}
          icon="⚡"
          color="emerald"
        />
        <MetricCard
          title="Submitted"
          value={analytics.submittedProposals}
          icon="✅"
          color="purple"
        />
        <MetricCard
          title="Success Rate"
          value={`${analytics.successRate}%`}
          icon="🎯"
          color="amber"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Opportunities Viewed"
          value={analytics.opportunitiesViewed}
          icon="👁️"
          color="slate"
          small
        />
        <MetricCard
          title="Saved Opportunities"
          value={analytics.savedOpportunities}
          icon="⭐"
          color="slate"
          small
        />
        <MetricCard
          title="Avg Response Time"
          value={`${analytics.avgResponseTime}h`}
          icon="⏱️"
          color="slate"
          small
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white/60 rounded-2xl border border-stone-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {analytics.recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-stone-100 rounded-lg"
            >
              <div className="w-2 h-2 mt-2 rounded-full bg-lime-600"></div>
              <div className="flex-1">
                <p className="text-stone-600">{activity.description}</p>
                <p className="text-sm text-stone-8000 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/60 rounded-2xl border border-stone-200 p-6">
          <h3 className="text-xl font-semibold mb-4">Proposal Pipeline</h3>
          <div className="h-64 flex items-center justify-center text-stone-8000">
            Chart: Proposals by Status
          </div>
        </div>
        
        <div className="bg-white/60 rounded-2xl border border-stone-200 p-6">
          <h3 className="text-xl font-semibold mb-4">Activity Trend</h3>
          <div className="h-64 flex items-center justify-center text-stone-8000">
            Chart: Activity Over Time
          </div>
        </div>
      </div>
    </div>
  )
}

type MetricCardProps = {
  title: string
  value: string | number
  icon: string
  color: string
  small?: boolean
}

function MetricCard({ title, value, icon, color, small }: MetricCardProps) {
  const colorClasses = {
    blue: 'border-blue-700 bg-blue-50',
    emerald: 'border-lime-300 bg-lime-50',
    purple: 'border-purple-700 bg-purple-900/20',
    amber: 'border-amber-700 bg-amber-900/20',
    slate: 'border-stone-300 bg-stone-100/60',
  }

  return (
    <div className={`rounded-xl border ${colorClasses[color as keyof typeof colorClasses] || colorClasses.slate} ${small ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <div className={`${small ? 'text-2xl' : 'text-3xl'} font-bold`}>
          {value}
        </div>
      </div>
      <div className="text-sm text-stone-500">{title}</div>
    </div>
  )
}
