// components/landing/Features.tsx
"use client";

import { motion } from 'framer-motion';
import { Brain, FileText, Shield, TrendingUp, Zap, Users, Code, BarChart } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Contract Matching',
    description: 'Analyze 10,000+ opportunities daily with 98.5% accuracy. Our AI understands your capabilities and finds perfect fits.',
  },
  {
    icon: FileText,
    title: 'Smart Proposal Generation',
    description: 'Generate winning proposals 3x faster with GPT-4 powered writing assistance and compliance checking.',
  },
  {
    icon: Shield,
    title: 'Automated Compliance',
    description: 'Never miss FAR/DFARS requirements. Real-time compliance validation and document generation.',
  },
  {
    icon: TrendingUp,
    title: 'Win Rate Analytics',
    description: 'Track performance, identify winning patterns, and optimize your bidding strategy with advanced analytics.',
  },
  {
    icon: Zap,
    title: '11 Marketplace Integrations',
    description: 'SAM.gov, GovWin, BidNet, FPDS, GSA eBuy, FedConnect, NASA SEWP, DIBBS, Unison, GovSpend, USAspending.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Unlimited team members with role-based permissions. Real-time collaboration on proposals and bids.',
  },
  {
    icon: Code,
    title: 'API & Integrations',
    description: 'Full REST API access. Integrate with your CRM, ERP, and project management tools seamlessly.',
  },
  {
    icon: BarChart,
    title: 'Real-Time Intelligence',
    description: 'Track competitors, monitor agency spending, forecast awards, and get instant alerts for new opportunities.',
  },
];

export default function Features() {
  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            Everything you need to win contracts
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300"
          >
            Powerful AI tools designed specifically for government contractors
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="inline-flex rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}