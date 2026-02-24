"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Target, TrendingUp, Shield, Zap, CheckCircle, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-2xl font-bold gradient-text">Sturgeon AI</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/login" className="text-gray-700">Login</Link>
            <Link href="/signup" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-6xl font-bold mb-6">Win More <span className="gradient-text">Government Contracts</span> with AI</h1>
            <p className="text-xl text-gray-600 mb-8">Find opportunities, analyze competitors, and win contracts 3x faster than BidNet or GovWin.</p>
            <Link href="/signup" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold">
              Get Started Free <ArrowRight className="inline ml-2" size={20} />
            </Link>
          </div>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Everything You Need to <span className="gradient-text">Win Contracts</span></h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap size={32} />, title: "AI-Powered Matching", desc: "Analyze 10,000+ opportunities daily" },
              { icon: <Shield size={32} />, title: "11 Marketplace Integration", desc: "SAM.gov, GovWin, BidNet and more" },
              { icon: <TrendingUp size={32} />, title: "Real-Time Intelligence", desc: "Track competitors and monitor spending" }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl border">
                {f.icon}
                <h3 className="text-2xl font-bold mt-4 mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}