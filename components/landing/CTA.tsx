// components/landing/CTA.tsx
"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-24">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:3rem_3rem]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm font-bold tracking-wider text-blue-100 uppercase mb-4">
            VETERAN BUILT • VETERAN OWNED
          </p>

          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Ready to win more contracts?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
            Join 1,000+ contractors using Sturgeon AI to win $2.3B+ in government contracts.
            Start your 14-day free trial today.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition hover:bg-gray-100 hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
            >
              Book a Demo
            </Link>
          </div>
          <p className="mt-6 text-sm text-blue-100">
            14-day free trial • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
