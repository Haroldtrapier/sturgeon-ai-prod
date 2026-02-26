// components/landing/Hero.tsx
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Play, Check } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
            🚀 Join 1,000+ Contractors Winning $2.3B+ in Contracts
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-8 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Win More{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              Government Contracts
            </span>
            <br />
            with AI Intelligence
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-3xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl"
          >
            Sturgeon AI analyzes <strong>10,000+ federal opportunities daily</strong>, matches them to your capabilities,
            and helps you craft <strong>winning proposals 3x faster</strong> than HighGov or BidNet.
          </motion.p>

          {/* Trust Badges Inline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
          >
            <span className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> No credit card required</span>
            <span className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> 14-day free trial</span>
            <span className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Cancel anytime</span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-105"
            >
              Start Winning Today - Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="#demo"
              className="inline-flex items-center rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch 2-Min Demo
            </Link>
          </motion.div>

          {/* Social Proof Numbers */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-8 text-center"
          >
            <div>
              <div className="text-3xl font-bold text-blue-600">$2.3B+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Contracts Won</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">98.5%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Match Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600">3x</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Faster Proposals</div>
            </div>
          </motion.div>
        </div>

        {/* Hero Image/Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-16 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 relative overflow-hidden">
            {/* Placeholder for demo video or screenshot */}
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Play className="mx-auto h-20 w-20 text-blue-600 dark:text-blue-400 mb-4" />
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                  Interactive Dashboard Preview
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  See how Sturgeon AI finds your perfect contracts
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}