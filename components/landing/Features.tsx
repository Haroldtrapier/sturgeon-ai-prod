// components/landing/Features.tsx
import { Brain, Search, FileText, TrendingUp, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: Search,
    title: 'Smart Opportunity Matching',
    description: 'AI analyzes your past performance and capabilities to find the perfect contract opportunities.',
  },
  {
    icon: Brain,
    title: 'AI Proposal Assistant',
    description: 'Generate winning proposals with AI-powered writing assistance and compliance checking.',
  },
  {
    icon: FileText,
    title: 'Automated Compliance',
    description: 'Never miss a requirement. Our AI ensures your proposals meet all federal regulations.',
  },
  {
    icon: TrendingUp,
    title: 'Win Rate Analytics',
    description: 'Track your performance, identify winning patterns, and optimize your bidding strategy.',
  },
  {
    icon: Shield,
    title: 'Real-Time Monitoring',
    description: 'Get instant alerts for new opportunities, amendments, and award decisions.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process thousands of opportunities in seconds. Stay ahead of the competition.',
  },
]

export default function Features() {
  return (
    <section className="bg-white dark:bg-gray-900 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to win
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Powerful AI tools designed specifically for government contractors
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
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
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
