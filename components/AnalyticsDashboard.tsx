'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, Eye,
  Clock, Zap, ChevronDown, RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  totalEvents: number;
  pageViews: number;
  featureUsage: number;
  uniqueSessions: number;
  topPages: Array<{ page: string; count: number }>;
  topFeatures: Array<{ feature: string; count: number }>;
  avgDuration: number;
  timeline: Array<{ time: string; count: number }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-slate-400">Privacy-friendly usage tracking</p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <motion.button
              onClick={fetchAnalytics}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                icon={Eye}
                title="Page Views"
                value={data.pageViews}
                color="blue"
              />
              <StatsCard
                icon={Zap}
                title="Feature Usage"
                value={data.featureUsage}
                color="cyan"
              />
              <StatsCard
                icon={Users}
                title="Unique Sessions"
                value={data.uniqueSessions}
                color="green"
              />
              <StatsCard
                icon={Clock}
                title="Avg Duration"
                value={`${Math.round(data.avgDuration / 1000)}s`}
                color="purple"
              />
            </div>

            {/* Top Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  Top Pages
                </h2>
                <div className="space-y-3">
                  {data.topPages.map((page, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-slate-300">{page.page}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full"
                            style={{
                              width: `${(page.count / data.topPages[0].count) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-blue-400 w-12 text-right">
                          {page.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Features */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                  Top Features
                </h2>
                <div className="space-y-3">
                  {data.topFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-slate-300">{feature.feature}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full"
                            style={{
                              width: `${(feature.count / data.topFeatures[0].count) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-cyan-400 w-12 text-right">
                          {feature.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold mb-4">Activity Timeline</h2>
              <div className="flex items-end justify-between h-64 gap-2">
                {data.timeline.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer relative group"
                    style={{
                      height: `${(point.count / Math.max(...data.timeline.map(p => p.count))) * 100}%`,
                      minHeight: '4px',
                    }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {point.count} events
                      <br />
                      {new Date(point.time).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface StatsCardProps {
  icon: React.ComponentType<any>;
  title: string;
  value: number | string;
  color: 'blue' | 'cyan' | 'green' | 'purple';
}

function StatsCard({ icon: Icon, title, value, color }: StatsCardProps) {
  const colors = {
    blue: 'from-blue-600 to-blue-400',
    cyan: 'from-cyan-600 to-cyan-400',
    green: 'from-green-600 to-green-400',
    purple: 'from-purple-600 to-purple-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700"
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`} />
      </div>
      <p className="text-sm text-slate-400 mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}
