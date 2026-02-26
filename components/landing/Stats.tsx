// components/landing/Stats.tsx
"use client";

import { motion } from 'framer-motion';
import { TrendingUp, Users, Award, Zap } from 'lucide-react';

const stats = [
  { icon: TrendingUp, label: 'Contracts Won', value: '$2.3B+', color: 'text-blue-600' },
  { icon: Users, label: 'Active Contractors', value: '1,000+', color: 'text-purple-600' },
  { icon: Award, label: 'Win Rate', value: '47%', color: 'text-pink-600' },
  { icon: Zap, label: 'Proposals Generated', value: '15K+', color: 'text-indigo-600' },
];

export default function Stats() {
  return (
    <section className="bg-white dark:bg-gray-900 py-16 border-y border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <Icon className={`mx-auto h-10 w-10 mb-4 ${stat.color}`} />
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}