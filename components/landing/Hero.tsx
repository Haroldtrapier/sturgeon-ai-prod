// components/landing/Hero.tsx
"use client"

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:3rem_3rem]" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <Sparkles className="mr-2 h-4 w-4" />
            AI-Powered Government Contract Intelligence
          </div>

          {/* Headline */}
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Win More{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Government Contracts
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
            Sturgeon AI analyzes thousands of federal opportunities daily, matches them to your capabilities, 
            and helps you craft winning proposals with AI-powered insights.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              href="/demo"
              className="inline-flex items-center rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Watch Demo
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
            Trusted by 1,000+ government contractors
          </div>
        </div>

        {/* Hero Image/Demo */}
        <div className="mt-16 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600">
            {/* Screenshot or video demo would go here */}
            <div className="flex h-full items-center justify-center text-gray-400">
              Dashboard Preview
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
