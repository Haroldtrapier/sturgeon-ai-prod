// components/landing/CTA.tsx
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to win more contracts?
        </h2>
        <p className="mt-4 text-xl text-blue-100">
          Join 1,000+ contractors using AI to dominate federal procurement
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex items-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition hover:bg-gray-50"
          >
            Start Free 14-Day Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center text-lg font-semibold text-white underline-offset-4 hover:underline"
          >
            Schedule a Demo →
          </Link>
        </div>
        <p className="mt-6 text-sm text-blue-100">
          No credit card required • Cancel anytime • Setup in 5 minutes
        </p>
      </div>
    </section>
  )
}
