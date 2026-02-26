// components/landing/Comparison.tsx
"use client";

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const features = [
  { name: 'AI Proposal Generation', sturgeon: true, highgov: false, bidnet: false },
  { name: 'GPT-4 Powered', sturgeon: true, highgov: false, bidnet: false },
  { name: 'Marketplace Integrations', sturgeon: '11', highgov: '8', bidnet: '5' },
  { name: 'Real-Time Alerts', sturgeon: 'Instant', highgov: 'Daily', bidnet: 'Daily' },
  { name: 'Win Rate Analytics', sturgeon: 'Advanced', highgov: 'Basic', bidnet: false },
  { name: 'Compliance Automation', sturgeon: true, highgov: true, bidnet: false },
  { name: 'API Access', sturgeon: 'All Plans', highgov: 'Enterprise', bidnet: false },
  { name: 'Team Collaboration', sturgeon: 'Unlimited', highgov: 'Limited', bidnet: 'Limited' },
  { name: 'Free Trial', sturgeon: '14 days', highgov: '7 days', bidnet: 'Demo only' },
  { name: 'Starting Price', sturgeon: '$97/mo', highgov: '$500/yr', bidnet: 'Custom' },
];

export default function Comparison() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            Why Choose Sturgeon AI?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300"
          >
            See how we compare to HighGov and BidNet
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-16 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Sturgeon AI
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                    HighGov
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                    BidNet
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {features.map((feature, index) => (
                  <motion.tr
                    key={feature.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {feature.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.sturgeon === 'boolean' ? (
                        feature.sturgeon ? (
                          <Check className="mx-auto h-5 w-5 text-green-500" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-red-500" />
                        )
                      ) : (
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {feature.sturgeon}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.highgov === 'boolean' ? (
                        feature.highgov ? (
                          <Check className="mx-auto h-5 w-5 text-gray-400" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-gray-300" />
                        )
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.highgov}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.bidnet === 'boolean' ? (
                        feature.bidnet ? (
                          <Check className="mx-auto h-5 w-5 text-gray-400" />
                        ) : (
                          <X className="mx-auto h-5 w-5 text-gray-300" />
                        )
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.bidnet}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}