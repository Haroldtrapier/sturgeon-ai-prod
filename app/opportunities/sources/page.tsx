"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OpportunitySourcesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const SOURCES = [
    { name: "SAM.gov", desc: "Official government-wide procurement portal. All federal opportunities over $25K.", url: "https://sam.gov", status: "active", count: "500K+", type: "Primary" },
    { name: "GSA eBuy", desc: "Quotes and proposals for GSA Schedule holders.", url: "https://www.ebuy.gsa.gov", status: "active", count: "10K+", type: "Primary" },
    { name: "FPDS-NG", desc: "Federal Procurement Data System for contract award data.", url: "https://www.fpds.gov", status: "active", count: "Historical", type: "Research" },
    { name: "USASpending.gov", desc: "Track federal spending data and award information.", url: "https://usaspending.gov", status: "active", count: "$6T+", type: "Research" },
    { name: "GovWin IQ", desc: "Pre-RFP intelligence and competitor tracking.", url: "https://govwin.com", status: "available", count: "Premium", type: "Intelligence" },
    { name: "GovSpend", desc: "Real-time purchase order and micro-purchase data.", url: "https://govspend.com", status: "available", count: "Premium", type: "Intelligence" },
    { name: "FedConnect", desc: "Document distribution and response portal.", url: "https://www.fedconnect.net", status: "active", count: "Docs", type: "Primary" },
    { name: "Unison Marketplace", desc: "State and local government procurement.", url: "https://www.unisonglobal.com", status: "available", count: "State/Local", type: "Supplementary" },
    { name: "DLA DIBBS", desc: "Defense Logistics Agency procurement portal.", url: "https://www.dibbs.bsm.dla.mil", status: "active", count: "DoD", type: "Primary" },
    { name: "NASA SEWP", desc: "IT products and services for federal agencies.", url: "https://sewp.nasa.gov", status: "active", count: "IT Focus", type: "Primary" },
    { name: "Beta.SAM.gov", desc: "Entity management and exclusions data.", url: "https://beta.sam.gov", status: "active", count: "Entities", type: "Registration" },
    { name: "Grants.gov", desc: "Federal grant opportunities (non-contract).", url: "https://grants.gov", status: "available", count: "Grants", type: "Supplementary" },
  ];

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const types = Array.from(new Set(SOURCES.map(s => s.type)));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Opportunity Sources</h1><p className="text-slate-400 mt-1">Federal procurement data sources integrated with Sturgeon AI</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-400">{SOURCES.filter(s => s.status === "active").length}</p><p className="text-xs text-slate-400 mt-1">Active Sources</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-blue-400">{SOURCES.length}</p><p className="text-xs text-slate-400 mt-1">Total Sources</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-purple-400">500K+</p><p className="text-xs text-slate-400 mt-1">Opportunities</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-amber-400">Real-time</p><p className="text-xs text-slate-400 mt-1">Data Refresh</p></div>
      </div>
      {types.map(type => (
        <div key={type} className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-emerald-400">{type}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SOURCES.filter(s => s.type === type).map(s => (
              <div key={s.name} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-start justify-between">
                  <div><h3 className="font-semibold text-sm">{s.name}</h3><p className="text-xs text-slate-400 mt-1">{s.desc}</p></div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.status === "active" ? "bg-emerald-900/30 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>{s.status}</span>
                </div>
                <div className="flex items-center justify-between mt-3"><span className="text-xs text-slate-500">{s.count}</span>
                  <button onClick={() => router.push(`/marketplaces`)} className="text-xs text-blue-400 hover:underline">View &rarr;</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
