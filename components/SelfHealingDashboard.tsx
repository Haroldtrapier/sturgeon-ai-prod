'use client';

import { useState, useEffect, useCallback } from 'react';

interface ServiceHealth {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down' | 'recovering';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastChecked: string;
  endpoint: string;
}

interface RecoveryEvent {
  id: string;
  service: string;
  trigger: string;
  action: string;
  status: 'success' | 'failed' | 'in_progress';
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
}

interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  service: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface PerformanceMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  delta: string;
  good: boolean;
}

const INITIAL_SERVICES: ServiceHealth[] = [
  { id: 'api', name: 'API Gateway', status: 'healthy', uptime: 99.97, responseTime: 142, errorRate: 0.02, lastChecked: '2s ago', endpoint: '/api/health' },
  { id: 'db', name: 'Database', status: 'healthy', uptime: 99.99, responseTime: 18, errorRate: 0.00, lastChecked: '5s ago', endpoint: 'supabase://pool' },
  { id: 'ai', name: 'AI Engine', status: 'degraded', uptime: 98.41, responseTime: 1840, errorRate: 1.2, lastChecked: '3s ago', endpoint: '/api/ai' },
  { id: 'sam', name: 'SAM.gov Connector', status: 'healthy', uptime: 99.12, responseTime: 380, errorRate: 0.18, lastChecked: '8s ago', endpoint: 'api.sam.gov' },
  { id: 'grants', name: 'Grants.gov Connector', status: 'healthy', uptime: 97.88, responseTime: 510, errorRate: 0.44, lastChecked: '12s ago', endpoint: 'api.grants.gov' },
  { id: 'auth', name: 'Auth Service', status: 'healthy', uptime: 100.0, responseTime: 55, errorRate: 0.00, lastChecked: '1s ago', endpoint: 'supabase://auth' },
  { id: 'queue', name: 'Job Queue', status: 'recovering', uptime: 96.30, responseTime: 220, errorRate: 3.1, lastChecked: '7s ago', endpoint: 'redis://queue' },
  { id: 'cdn', name: 'CDN / Edge', status: 'healthy', uptime: 99.95, responseTime: 28, errorRate: 0.01, lastChecked: '4s ago', endpoint: 'vercel-edge' },
];

const INITIAL_RECOVERY_EVENTS: RecoveryEvent[] = [
  { id: 'r1', service: 'AI Engine', trigger: 'Response time > 1500ms threshold', action: 'Scaled inference workers 2→4', status: 'in_progress', startedAt: '2 min ago', completedAt: null, duration: null },
  { id: 'r2', service: 'Job Queue', trigger: 'Error rate spike 8.2%', action: 'Restarted worker pool, flushed dead-letter queue', status: 'success', startedAt: '18 min ago', completedAt: '15 min ago', duration: 180 },
  { id: 'r3', service: 'API Gateway', trigger: 'Memory usage > 85%', action: 'Cleared response cache, triggered GC', status: 'success', startedAt: '2h ago', completedAt: '2h ago', duration: 22 },
  { id: 'r4', service: 'Grants.gov Connector', trigger: 'Connection timeout x3', action: 'Rotated connection pool, increased timeout', status: 'success', startedAt: '6h ago', completedAt: '6h ago', duration: 45 },
  { id: 'r5', service: 'Database', trigger: 'Slow query alert (>500ms)', action: 'Analyzed query plan, rebuilt index', status: 'failed', startedAt: 'Yesterday', completedAt: 'Yesterday', duration: 0 },
];

const INITIAL_ALERTS: SystemAlert[] = [
  { id: 'a1', severity: 'warning', service: 'AI Engine', message: 'Response latency elevated — P95 at 1840ms (threshold: 1500ms)', timestamp: '2 min ago', acknowledged: false },
  { id: 'a2', severity: 'warning', service: 'Job Queue', message: 'Recovery in progress — error rate was 8.2%, now 3.1%', timestamp: '18 min ago', acknowledged: true },
  { id: 'a3', severity: 'info', service: 'SAM.gov Connector', message: 'Rate limit approaching — 78% of hourly quota consumed', timestamp: '32 min ago', acknowledged: false },
  { id: 'a4', severity: 'info', service: 'System', message: 'Auto-heal triggered 3 events today — all resolved within SLA', timestamp: '1h ago', acknowledged: true },
];

const PERF_METRICS: PerformanceMetric[] = [
  { label: 'Overall Uptime', value: '99.41%', trend: 'stable', delta: '+0.02%', good: true },
  { label: 'Avg Response Time', value: '399ms', trend: 'up', delta: '+112ms', good: false },
  { label: 'System Error Rate', value: '0.64%', trend: 'down', delta: '-0.18%', good: true },
  { label: 'Auto-Heals Today', value: '3', trend: 'stable', delta: '0 vs yesterday', good: true },
];

function statusColor(status: ServiceHealth['status']) {
  switch (status) {
    case 'healthy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    case 'degraded': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'recovering': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case 'down': return 'text-red-400 bg-red-400/10 border-red-400/30';
  }
}

function statusDot(status: ServiceHealth['status']) {
  switch (status) {
    case 'healthy': return 'bg-emerald-400';
    case 'degraded': return 'bg-yellow-400';
    case 'recovering': return 'bg-blue-400 animate-pulse';
    case 'down': return 'bg-red-400 animate-pulse';
  }
}

function severityColor(severity: SystemAlert['severity']) {
  switch (severity) {
    case 'critical': return 'border-l-red-500 bg-red-500/5';
    case 'warning': return 'border-l-yellow-500 bg-yellow-500/5';
    case 'info': return 'border-l-blue-500 bg-blue-500/5';
  }
}

function recoveryStatusBadge(status: RecoveryEvent['status']) {
  switch (status) {
    case 'success': return 'text-emerald-400 bg-emerald-400/10';
    case 'failed': return 'text-red-400 bg-red-400/10';
    case 'in_progress': return 'text-blue-400 bg-blue-400/10 animate-pulse';
  }
}

export default function SelfHealingDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'recovery' | 'alerts' | 'config'>('overview');
  const [services, setServices] = useState<ServiceHealth[]>(INITIAL_SERVICES);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);
  const [lastRefresh, setLastRefresh] = useState('just now');
  const [autoHeal, setAutoHeal] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const simulateRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setServices(prev => prev.map(s => ({
        ...s,
        responseTime: Math.max(10, s.responseTime + Math.floor((Math.random() - 0.5) * 40)),
        lastChecked: 'just now',
      })));
      setLastRefresh('just now');
      setRefreshing(false);
    }, 800);
  }, []);

  useEffect(() => {
    const interval = setInterval(simulateRefresh, 15000);
    return () => clearInterval(interval);
  }, [simulateRefresh]);

  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const degradedCount = services.filter(s => s.status === 'degraded').length;
  const recoveringCount = services.filter(s => s.status === 'recovering').length;
  const downCount = services.filter(s => s.status === 'down').length;
  const unacknowledged = alerts.filter(a => !a.acknowledged).length;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'Services' },
    { id: 'recovery', label: 'Recovery Log' },
    { id: 'alerts', label: `Alerts${unacknowledged > 0 ? ` (${unacknowledged})` : ''}` },
    { id: 'config', label: 'Config' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Self-Healing System</h1>
            <p className="text-slate-400 mt-1">Real-time health monitoring and autonomous recovery</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-sm text-slate-400">
              <span className={`w-2 h-2 rounded-full ${downCount > 0 ? 'bg-red-400 animate-pulse' : degradedCount > 0 ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
              Last refresh: {lastRefresh}
            </div>
            <button
              onClick={simulateRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors text-sm disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Now'}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-sm text-slate-400">Auto-Heal</span>
              <button
                onClick={() => setAutoHeal(p => !p)}
                className={`relative w-10 h-5 rounded-full transition-colors ${autoHeal ? 'bg-emerald-600' : 'bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${autoHeal ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* System Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {PERF_METRICS.map(m => (
            <div key={m.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <p className="text-slate-400 text-xs mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-white">{m.value}</p>
              <p className={`text-xs mt-1 ${m.good ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'} {m.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Service summary badges */}
        <div className="flex flex-wrap gap-3 mb-6">
          <span className="px-3 py-1 bg-emerald-400/10 text-emerald-400 rounded-full text-sm border border-emerald-400/20">
            ✓ {healthyCount} Healthy
          </span>
          {degradedCount > 0 && (
            <span className="px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded-full text-sm border border-yellow-400/20">
              ⚠ {degradedCount} Degraded
            </span>
          )}
          {recoveringCount > 0 && (
            <span className="px-3 py-1 bg-blue-400/10 text-blue-400 rounded-full text-sm border border-blue-400/20">
              ↻ {recoveringCount} Recovering
            </span>
          )}
          {downCount > 0 && (
            <span className="px-3 py-1 bg-red-400/10 text-red-400 rounded-full text-sm border border-red-400/20">
              ✗ {downCount} Down
            </span>
          )}
          {unacknowledged > 0 && (
            <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm border border-slate-600">
              🔔 {unacknowledged} Unacknowledged Alert{unacknowledged > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Health Grid */}
            <div>
              <h2 className="text-white font-semibold mb-3">Service Health Grid</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {services.map(s => (
                  <div key={s.id} className={`rounded-xl p-4 border ${statusColor(s.status)} bg-opacity-5`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${statusDot(s.status)}`} />
                      <span className="text-white text-sm font-medium">{s.name}</span>
                    </div>
                    <p className="text-xs text-slate-400">{s.responseTime}ms · {s.uptime}% up</p>
                    <p className={`text-xs mt-1 capitalize font-medium ${statusColor(s.status).split(' ')[0]}`}>{s.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                <h3 className="text-white font-semibold mb-4">Recent Recovery Events</h3>
                <div className="space-y-3">
                  {INITIAL_RECOVERY_EVENTS.slice(0, 3).map(e => (
                    <div key={e.id} className="flex items-start gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${recoveryStatusBadge(e.status)}`}>
                        {e.status === 'in_progress' ? 'Active' : e.status === 'success' ? 'Healed' : 'Failed'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm">{e.service}</p>
                        <p className="text-slate-400 text-xs truncate">{e.action}</p>
                        <p className="text-slate-500 text-xs">{e.startedAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                <h3 className="text-white font-semibold mb-4">Active Alerts</h3>
                <div className="space-y-3">
                  {alerts.filter(a => !a.acknowledged).map(a => (
                    <div key={a.id} className={`pl-3 border-l-2 rounded p-2 ${severityColor(a.severity)}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-white text-sm">{a.service}</p>
                          <p className="text-slate-400 text-xs">{a.message}</p>
                        </div>
                        <button
                          onClick={() => acknowledgeAlert(a.id)}
                          className="text-slate-500 hover:text-slate-300 text-xs whitespace-nowrap"
                        >
                          Ack
                        </button>
                      </div>
                    </div>
                  ))}
                  {alerts.filter(a => !a.acknowledged).length === 0 && (
                    <p className="text-slate-500 text-sm">No unacknowledged alerts.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-400 font-medium px-5 py-3">Service</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Status</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Uptime</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Response</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Error Rate</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Endpoint</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Checked</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr key={s.id} className={`border-b border-slate-800/50 ${i % 2 === 0 ? '' : 'bg-slate-800/20'}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusDot(s.status)}`} />
                        <span className="text-white font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${statusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={s.uptime >= 99.5 ? 'text-emerald-400' : s.uptime >= 98 ? 'text-yellow-400' : 'text-red-400'}>
                        {s.uptime.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={s.responseTime < 200 ? 'text-emerald-400' : s.responseTime < 800 ? 'text-yellow-400' : 'text-red-400'}>
                        {s.responseTime}ms
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={s.errorRate < 0.5 ? 'text-emerald-400' : s.errorRate < 2 ? 'text-yellow-400' : 'text-red-400'}>
                        {s.errorRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">{s.endpoint}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{s.lastChecked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recovery Log Tab */}
        {activeTab === 'recovery' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">Auto-Recovery History</h2>
              <span className="text-slate-400 text-sm">3 events today · 12 this week · 94.2% success rate</span>
            </div>
            {INITIAL_RECOVERY_EVENTS.map(e => (
              <div key={e.id} className="bg-slate-900 rounded-xl p-5 border border-slate-800">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${recoveryStatusBadge(e.status)}`}>
                      {e.status === 'in_progress' ? '↻ In Progress' : e.status === 'success' ? '✓ Healed' : '✗ Failed'}
                    </span>
                    <span className="text-white font-medium">{e.service}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">{e.startedAt}</p>
                    {e.duration !== null && (
                      <p className="text-slate-500 text-xs">
                        {e.status === 'failed' ? 'Action failed' : `Resolved in ${e.duration}s`}
                      </p>
                    )}
                    {e.status === 'in_progress' && (
                      <p className="text-blue-400 text-xs">Healing now...</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <span className="text-slate-500 text-xs w-16 shrink-0">Trigger:</span>
                    <span className="text-slate-300 text-xs">{e.trigger}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-500 text-xs w-16 shrink-0">Action:</span>
                    <span className="text-slate-300 text-xs">{e.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">System Alerts</h2>
              <button
                onClick={() => setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))}
                className="text-sm text-slate-400 hover:text-white"
              >
                Acknowledge All
              </button>
            </div>
            {alerts.map(a => (
              <div key={a.id} className={`pl-4 border-l-4 rounded-xl p-4 border border-slate-800 ${severityColor(a.severity)}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs uppercase font-bold ${
                        a.severity === 'critical' ? 'text-red-400' :
                        a.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                      }`}>{a.severity}</span>
                      <span className="text-white text-sm font-medium">{a.service}</span>
                      {a.acknowledged && (
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Acknowledged</span>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm">{a.message}</p>
                    <p className="text-slate-500 text-xs mt-1">{a.timestamp}</p>
                  </div>
                  {!a.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(a.id)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors shrink-0"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">Auto-Heal Thresholds</h3>
              <div className="space-y-4">
                {[
                  { label: 'Response Time Threshold', value: '1500ms', hint: 'Trigger heal above this latency' },
                  { label: 'Error Rate Threshold', value: '2.0%', hint: 'Trigger heal above this error rate' },
                  { label: 'Memory Usage Threshold', value: '85%', hint: 'Trigger GC / cache clear' },
                  { label: 'Health Check Interval', value: '15s', hint: 'How often to poll service health' },
                  { label: 'Max Heal Attempts', value: '3', hint: 'Before escalating to alert' },
                ].map(c => (
                  <div key={c.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm">{c.label}</p>
                      <p className="text-slate-500 text-xs">{c.hint}</p>
                    </div>
                    <div className="px-3 py-1 bg-slate-800 rounded text-emerald-400 text-sm font-mono border border-slate-700">
                      {c.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">Recovery Playbooks</h3>
              <div className="space-y-3">
                {[
                  { trigger: 'High Latency', actions: ['Scale workers', 'Clear cache', 'Restart pool'], enabled: true },
                  { trigger: 'High Error Rate', actions: ['Restart service', 'Flush queue', 'Alert on-call'], enabled: true },
                  { trigger: 'Memory Pressure', actions: ['Trigger GC', 'Clear caches', 'Log heap dump'], enabled: true },
                  { trigger: 'External API Down', actions: ['Switch to backup', 'Cache last response', 'Alert team'], enabled: false },
                  { trigger: 'DB Connection Lost', actions: ['Reconnect pool', 'Retry x3', 'Failover to replica'], enabled: true },
                ].map(p => (
                  <div key={p.trigger} className="flex items-start justify-between gap-3 p-3 bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-slate-300 text-sm font-medium">{p.trigger}</p>
                      <p className="text-slate-500 text-xs">{p.actions.join(' → ')}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${p.enabled ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 bg-slate-700'}`}>
                      {p.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-900 rounded-xl p-5 border border-slate-800">
              <h3 className="text-white font-semibold mb-4">Notification Routing</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { channel: 'Email', target: 'ops@sturgeon.ai', severity: 'Critical', active: true },
                  { channel: 'Slack', target: '#system-alerts', severity: 'Warning+', active: true },
                  { channel: 'PagerDuty', target: 'On-call rotation', severity: 'Critical only', active: false },
                  { channel: 'Dashboard', target: 'All engineers', severity: 'All events', active: true },
                ].map(n => (
                  <div key={n.channel} className="p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium">{n.channel}</span>
                      <span className={`text-xs ${n.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {n.active ? '● On' : '○ Off'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{n.target}</p>
                    <p className="text-slate-500 text-xs">{n.severity}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
