// components/landing/Marketplaces.tsx
"use client";

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const marketplaces = [
  { name: 'SAM.gov', status: 'Real-time sync' },
  { name: 'GovWin IQ', status: 'Full integration' },
  { name: 'BidNet', status: 'Auto-import' },
  { name: 'FPDS', status: 'Connected' },
  { name: 'GSA eBuy', status: 'Live feed' },
  { name: 'FedConnect', status: 'Integrated' },
  { name: 'NASA SEWP', status: 'Active' },
  { name: 'DIBBS', status: 'Connected' },
  { name: 'Unison', status: 'Synced' },
  { name: 'GovSpend', status: 'Integrated' },
  { name: 'USAspending', status: 'Real-time' },
];

export default function Marketplaces() {
  return (
    <section className="bg-white dark:bg-gray-900 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            11 Marketplace Integrations
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300"
          >
            Access every major government contracting platform in one place
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {marketplaces.map((marketplace, index) => (
            <motion.div
              key={marketplace.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-xl border-2 border-gray-200 bg-white p-6 text-center transition hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-3 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {marketplace.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {marketplace.status}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}