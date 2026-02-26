// app/dashboard/page.tsx
"use client";

import { motion } from 'framer-motion';
import { 
  TrendingUp, DollarSign, Target, Award, Calendar, 
  ArrowRight, Clock, CheckCircle, AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

// Mock data - replace with real data from API
const stats = [
  { 
    label: 'Active Opportunities', 
    value: '47', 
    change: '+12%', 
    trend: 'up',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  { 
    label: 'Proposals in Progress', 
    value: '8', 
    change: '+3', 
    trend: 'up',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  { 
    label: 'Win Rate (30d)', 
    value: '47%', 
    change: '+5%', 
    trend: 'up',
    icon: Award,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  { 
    label: 'Pipeline Value', 
    value: '$2.3M', 
    change: '+18%', 
    trend: 'up',
    icon: DollarSign,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const recentOpportunities = [
  {
    id: 1,
    title: 'IT Infrastructure Modernization',
    agency: 'Department of Defense',
    value: '$450K',
    deadline: '2026-03-15',
    match: 94,
    status: 'new',
  },
  {
    id: 2,
    title: 'Cybersecurity Assessment Services',
    agency: 'Department of Homeland Security',
    value: '$280K',
    deadline: '2026-03-20',
    match: 89,
    status: 'reviewing',
  },
  {
    id: 3,
    title: 'Cloud Migration Services',
    agency: 'General Services Administration',
    value: '$620K',
    deadline: '2026-03-25',
    match: 92,
    status: 'new',
  },
];

const upcomingDeadlines = [
  { title: 'Proposal: Network Security Upgrade', date: '2026-03-01', daysLeft: 3 },
  { title: 'Certification Renewal: 8(a)', date: '2026-03-05', daysLeft: 7 },
  { title: 'Proposal: Data Analytics Platform', date: '2026-03-08', daysLeft: 10 },
];

const quickActions = [
  { label: 'Search Opportunities', href: '/opportunities', icon: Target, color: 'blue' },
  { label: 'Create Proposal', href: '/proposals/create', icon: CheckCircle, color: 'green' },
  { label: 'AI Chat Assistant', href: '/chat', icon: TrendingUp, color: 'purple' },
  { label: 'Compliance Check', href: '/compliance', icon: AlertCircle, color: 'orange' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            Welcome back! 👋
          </motion.h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here's what's happening with your contracts today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg ${stat.bgColor} p-3`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className={`text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const colorMap = {
                    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
                    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
                  };
                  return (
                    <Link
                      key={index}
                      href={action.href}
                      className={`group flex items-center justify-between rounded-xl bg-gradient-to-r ${colorMap[action.color]} p-6 text-white shadow-lg transition hover:shadow-xl`}
                    >
                      <div>
                        <p className="font-semibold">{action.label}</p>
                      </div>
                      <Icon className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Opportunities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Top Matched Opportunities
                </h2>
                <Link
                  href="/opportunities"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {recentOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="flex items-start justify-between rounded-lg border border-gray-200 p-4 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-blue-600"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {opp.title}
                        </h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          opp.status === 'new' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {opp.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {opp.agency}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          💰 {opp.value}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          📅 {opp.deadline}
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {opp.match}% Match
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Upcoming Deadlines
                </h2>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, index) => (
                  <div
                    key={index}
                    className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 dark:bg-blue-900/20"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {deadline.title}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{deadline.date}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {deadline.daysLeft} days left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/calendar"
                className="mt-4 block text-center text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View Calendar →
              </Link>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6 dark:border-purple-800 dark:from-purple-900/20 dark:to-blue-900/20"
            >
              <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                🤖 AI Insights
              </h2>
              <div className="space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  • 3 new opportunities match your capabilities
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  • Your win rate is 12% above industry average
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  • Competitor "TechDefense" won 2 similar contracts
                </p>
              </div>
              <Link
                href="/chat"
                className="mt-4 inline-flex items-center text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Ask AI for more insights <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}