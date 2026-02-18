"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FeaturesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const FEATURES = [
    { category: "AI Agents", items: [{ name: "Research Agent", desc: "Deep-dive contract and market research" }, { name: "Opportunity Analyst", desc: "AI-powered GO/NO-GO bid decisions" }, { name: "Compliance Specialist", desc: "FAR/DFARS regulation guidance" }, { name: "Proposal Assistant", desc: "AI-generated proposal sections" }, { name: "Market Intelligence", desc: "Spending trends and competitor analysis" }, { name: "General Assistant", desc: "All-purpose GovCon advisor" }] },
    { category: "Opportunity Intelligence", items: [{ name: "SAM.gov Integration", desc: "Real-time access to 500K+ opportunities" }, { name: "ContractMatch Engine", desc: "AI-matched opportunities based on your profile" }, { name: "Alert System", desc: "Instant notifications for matching opportunities" }, { name: "Advanced Filters", desc: "NAICS, set-aside, agency, value filters" }] },
    { category: "Proposal Tools", items: [{ name: "AI Proposal Writer", desc: "Generate complete proposal sections" }, { name: "Win Theme Generator", desc: "Develop compelling discriminators" }, { name: "Compliance Matrix", desc: "Auto-extract requirements from RFPs" }, { name: "Template Library", desc: "Professional proposal volume templates" }] },
    { category: "Market Intelligence", items: [{ name: "Agency Spending Analysis", desc: "Track $500B+ in annual federal spending" }, { name: "Competitor Research", desc: "Analyze competitor contract wins" }, { name: "Teaming Partner Finder", desc: "Find strategic JV and sub partners" }, { name: "FPDS Data Explorer", desc: "Historical procurement data access" }] },
    { category: "Compliance & Certs", items: [{ name: "FAR/DFARS Reference", desc: "AI-powered regulation lookup" }, { name: "CMMC Readiness", desc: "Cybersecurity maturity assessment" }, { name: "Certification Tracker", desc: "Manage SDVOSB, 8(a), HUBZone, WOSB" }, { name: "SAM.gov Registration Guide", desc: "Step-by-step registration assistance" }] },
  ];

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setLoading(false); }; init(); }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12"><h1 className="text-3xl font-bold">Platform Features</h1><p className="text-slate-400 mt-2">Everything you need to win government contracts</p></div>
      {FEATURES.map(f => (
        <div key={f.category} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">{f.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{f.items.map(item => (
            <div key={item.name} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="font-medium text-sm">{item.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
            </div>
          ))}</div>
        </div>
      ))}
      <div className="text-center mt-8">
        <button onClick={() => router.push("/pro/pricing")} className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">View Pricing</button>
      </div>
    </div>
  );
}
