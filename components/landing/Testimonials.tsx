// components/landing/Testimonials.tsx
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CEO, TechDefense Solutions',
    content: 'Sturgeon AI helped us increase our win rate by 40%. The AI proposal assistant is a game-changer.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Capture Manager, Federal Logistics Inc',
    content: 'We went from manually tracking 50 opportunities to monitoring 500+ with Sturgeon AI. Incredible ROI.',
    rating: 5,
  },
  {
    name: 'Jennifer Martinez',
    role: 'Principal, Government Advisory Group',
    content: "The compliance checking alone has saved us from costly mistakes. Best investment we've made.",
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="bg-white dark:bg-gray-900 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Loved by contractors nationwide
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            See what our customers have to say
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">{testimonial.content}</p>
              <div className="mt-6">
                <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
