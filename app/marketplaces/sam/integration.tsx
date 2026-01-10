'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Opportunity = {
  id: string
  title: string
  type: string
  department: string
  posted_date: string
  response_deadline: string
  naics_code: string
  set_aside: string
  description: string
}

export default function SAMIntegrationPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [setAsideFilter, setSetAsideFilter] = useState('')
  const [error, setError] = useState('')

  const searchOpportunities = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('query', searchQuery)
      if (setAsideFilter) params.append('setaside', setAsideFilter)
      params.append('limit', '20')

      const response = await fetch(`/api/marketplaces/sam?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities')
      }

      const data = await response.json()
      setOpportunities(data.opportunities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const loadSDVOSBOpportunities = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/marketplaces/sam/sdvosb')
      const data = await response.json()
      setOpportunities(data.opportunities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/marketplaces" className="text-emerald-400 hover:text-emerald-300 mb-4 inline-block">
            ← Back to Marketplaces
          </Link>
          <h1 className="text-4xl font-bold mb-2">SAM.gov Integration</h1>
          <p className="text-slate-300">
            Live federal contract opportunities from SAM.gov
          </p>
        </div>

        {/* Search Controls */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Keywords</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., IT services, janitorial"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                onKeyDown={(e) => e.key === 'Enter' && searchOpportunities()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Set-Aside Type</label>
              <select
                value={setAsideFilter}
                onChange={(e) => setSetAsideFilter(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="">All Types</option>
                <option value="SDVOSBC">SDVOSB</option>
                <option value="8A">8(a)</option>
                <option value="HZC">HUBZone</option>
                <option value="WOSB">WOSB</option>
                <option value="SBA">Small Business</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={searchOpportunities}
                disabled={loading}
                className="flex-1 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 rounded-lg font-semibold transition"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button
                onClick={loadSDVOSBOpportunities}
                disabled={loading}
                className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-lg font-semibold transition"
              >
                SDVOSB
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-12 text-slate-400">
              Loading opportunities...
            </div>
          )}

          {!loading && opportunities.length === 0 && (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center">
              <p className="text-slate-400 mb-4">No opportunities found. Try searching above.</p>
            </div>
          )}

          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 hover:border-emerald-500/50 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-emerald-400">
                    {opp.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="text-slate-500">📍</span>
                      {opp.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-slate-500">🏷️</span>
                      {opp.naics_code}
                    </span>
                    {opp.set_aside && (
                      <span className="px-2 py-1 bg-blue-900/40 border border-blue-700 rounded text-blue-300">
                        {opp.set_aside}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="text-slate-500">📅</span>
                      Posted: {new Date(opp.posted_date).toLocaleDateString()}
                    </span>
                    {opp.response_deadline && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <span>⏰</span>
                        Due: {new Date(opp.response_deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-slate-300 mb-4 line-clamp-3">
                {opp.description}
              </p>

              <div className="flex gap-3">
                <a
                  href={`https://sam.gov/opp/${opp.id}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition"
                >
                  View on SAM.gov →
                </a>
                <button className="px-4 py-2 bg-emerald-900/40 hover:bg-emerald-900/60 border border-emerald-700 rounded-lg text-sm font-medium text-emerald-300 transition">
                  Analyze with AI
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-300">💡 How to Use</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>• Search by keywords or filter by set-aside type</li>
            <li>• Click "SDVOSB" for Service-Disabled Veteran-Owned opportunities</li>
            <li>• Click "Analyze with AI" to get Sturgeon AI insights on any opportunity</li>
            <li>• View full details on SAM.gov to access attachments and solicitation documents</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
