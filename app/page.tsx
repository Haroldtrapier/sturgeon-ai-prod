"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { router.push("/dashboard"); return; }
      setChecking(false);
    };
    check();
  }, [router]);

  if (checking) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const FEATURES = [
    { title: "AI-Powered Proposals", desc: "Generate compliant, winning proposals in minutes with 6 specialized AI agents trained on government contracting." },
    { title: "Smart Contract Matching", desc: "ContractMatch engine scans SAM.gov, eBuy, and FPDS daily to find opportunities tailored to your capabilities." },
    { title: "Compliance Automation", desc: "FAR/DFARS guidance, CMMC tracking, SAM.gov monitoring, and certification management in one place." },
    { title: "Market Intelligence", desc: "Competitor analysis, pricing research, agency spending trends, and set-aside analytics powered by AI." },
    { title: "Research Tools", desc: "NAICS lookup, past performance research, vendor analysis, and pricing intelligence at your fingertips." },
    { title: "Team Collaboration", desc: "Multi-user proposal editing, review workflows, and role-based permissions for your capture team." },
  ];

  const PLANS = [
    { name: "Starter", price: "$97", period: "/month", features: ["5 AI queries/day", "Basic opportunity search", "1 proposal/month", "Email support"] },
    { name: "Professional", price: "$197", period: "/month", features: ["Unlimited AI queries", "ContractMatch engine", "Unlimited proposals", "All research tools", "Team collaboration", "Priority support"], popular: true },
    { name: "Enterprise", price: "$397", period: "/month", features: ["Everything in Pro", "White label option", "API access", "Custom integrations", "Dedicated support", "Custom AI training"] },
  ];

  const STATS = [
    { value: "10,000+", label: "Contracts Analyzed Daily" },
    { value: "6", label: "Specialized AI Agents" },
    { value: "85%", label: "Time Saved on Proposals" },
    { value: "24/7", label: "Opportunity Monitoring" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-emerald-400">Sturgeon AI</h1>
          <div className="flex gap-3">
            <button onClick={() => router.push("/login")} className="px-4 py-2 text-sm text-slate-300 hover:text-white">Log In</button>
            <button onClick={() => router.push("/login")} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Get Started</button>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold leading-tight">Win Government Contracts with <span className="text-emerald-400">AI Intelligence</span></h2>
        <p className="text-lg text-slate-400 mt-4 max-w-2xl mx-auto">The all-in-one platform for small businesses competing in federal contracting. AI-powered proposals, smart contract matching, and compliance automation.</p>
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={() => router.push("/login")} className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-lg">Start Free Trial</button>
          <button onClick={() => router.push("/pro/features")} className="px-8 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-lg">See Features</button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-emerald-400">{s.value}</p>
              <p className="text-sm text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl font-bold text-center mb-10">Everything You Need to Win</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h4 className="font-semibold text-emerald-400 mb-2">{f.title}</h4>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-2xl font-bold text-center mb-10">Simple, Transparent Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(p => (
            <div key={p.name} className={`p-6 bg-slate-900 border rounded-xl ${p.popular ? "border-emerald-600 ring-1 ring-emerald-600" : "border-slate-800"}`}>
              {p.popular && <p className="text-xs font-medium text-emerald-400 mb-2">MOST POPULAR</p>}
              <h4 className="text-lg font-bold">{p.name}</h4>
              <p className="mt-2"><span className="text-3xl font-bold">{p.price}</span><span className="text-slate-400">{p.period}</span></p>
              <ul className="mt-4 space-y-2">
                {p.features.map(f => (
                  <li key={f} className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="text-emerald-400">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => router.push("/login")} className={`w-full mt-6 px-4 py-2 rounded-lg font-medium text-sm ${p.popular ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h3 className="text-2xl font-bold mb-3">Ready to Win More Contracts?</h3>
        <p className="text-slate-400 mb-6">Join hundreds of small businesses using Sturgeon AI to compete and win in federal contracting.</p>
        <button onClick={() => router.push("/login")} className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-lg">Start Your Free Trial</button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">&copy; 2025 Sturgeon AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <button onClick={() => router.push("/system/documentation")} className="hover:text-white">Docs</button>
            <button onClick={() => router.push("/support")} className="hover:text-white">Support</button>
            <button onClick={() => router.push("/pro/pricing")} className="hover:text-white">Pricing</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
