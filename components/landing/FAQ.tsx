// components/landing/FAQ.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How does the 14-day free trial work?',
    answer: 'No credit card required. Full access to all features. Cancel anytime with zero commitment.',
  },
  {
    question: 'Can I switch plans later?',
    answer: 'Yes! Upgrade or downgrade anytime. Changes take effect immediately and we prorate billing.',
  },
  {
    question: 'What marketplaces do you integrate with?',
    answer: 'All 11 major platforms: SAM.gov, GovWin, BidNet, FPDS, GSA eBuy, FedConnect, NASA SEWP, DIBBS, Unison, GovSpend, and USAspending.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. SOC 2 certified, CMMC Level 2 compliant, enterprise-grade encryption, and regular security audits.',
  },
  {
    question: 'Do you offer training?',
    answer: 'Yes! All plans include onboarding. Professional and Enterprise plans get custom training and dedicated support.',
  },
  {
    question: 'What makes Sturgeon AI better than HighGov or BidNet?',
    answer: 'GPT-4 powered AI proposal generation, 11 marketplace integrations (vs 5-8), real-time alerts, advanced analytics, and better pricing.',
  },
  {
    question: 'Can I integrate with my existing CRM?',
    answer: 'Yes. Full REST API access on Professional and Enterprise plans. We support Salesforce, HubSpot, and custom integrations.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'Credit cards (Visa, MC, Amex), ACH transfers, and purchase orders for Enterprise customers.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white dark:bg-gray-900 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        <div className="mt-16 space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}