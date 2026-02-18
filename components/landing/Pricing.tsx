// components/landing/Pricing.tsx
"use client"

import { Check } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const plans = [
  {
    name: 'Starter',
    price: { monthly: 97, annual: 970 },
    description: 'Perfect for small contractors getting started',
    features: [
      '100 opportunity alerts per month',
      'Basic AI proposal assistance',
      'Email support',
      '1 user seat',
      'Dashboard access',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=starter',
  },
  {
    name: 'Professional',
    price: { monthly: 297, annual: 2970 },
    description: 'For growing contractors winning more bids',
    features: [
      '500 opportunity alerts per month',
      'Advanced AI proposal generation',
      'Priority support',
      '5 user seats',
      'Advanced analytics',
      'API access',
      'Custom integrations',
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=professional',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: 997, annual: 9970 },
    description: 'For large teams and agencies',
    features: [
      'Unlimited opportunity alerts',
      'White-glove AI assistance',
      'Dedicated account manager',
      'Unlimited users',
      'Custom training',
      'SLA guarantee',
      'Advanced security',
      'Custom development',
    ],
    cta: 'Contact Sales',
    href: '/contact?plan=enterprise',
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Choose the plan that's right for your business
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={annual ? 'text-gray-500' : 'font-semibold text-gray-900 dark:text-white'}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  annual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={!annual ? 'text-gray-500' : 'font-semibold text-gray-900 dark:text-white'}>
              Annual <span className="text-green-600">(Save 17%)</span>
            </span>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? 'border-blue-600 shadow-xl ring-2 ring-blue-600 dark:border-blue-500'
                  : 'border-gray-200 shadow-sm dark:border-gray-700'
              } bg-white p-8 dark:bg-gray-900`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-blue-600 px-3 py-1 text-center text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
                <p className="mt-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">/{annual ? 'year' : 'month'}</span>
                </p>
              </div>

              <Link
                href={plan.href}
                className={`mt-8 block w-full rounded-lg py-3 text-center font-semibold transition ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
