// app/landing/page.tsx
"use client"

import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}
