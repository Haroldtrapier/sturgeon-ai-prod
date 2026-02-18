"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function IntegrationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const INTEGRATIONS = [
    { name: "SAM.gov", desc: "Official federal procurement portal", status: "active", category: "Government" },
    { name: "FPDS-NG", desc: "Federal procurement data system", status: "active", category: "Government" },
    { name: "USASpending.gov", desc: "Federal spending data and analytics", status: "active", category: "Government" },
    { name: "Beta.SAM.gov", desc: "Entity management and exclusions", status: "active", category: "Government" },
    { name: "Stripe", desc: "Payment processing and subscriptions", status: "active", category: "Payments" },
    { name: "Supabase", desc: "Database and real-time data", status: "active", category: "Infrastructure" },
    { name: "Anthropic Claude", desc: "AI agent intelligence engine", status: "active", category: "AI" },
    { name: "Salesforce", desc: "CRM integration for pipeline management", status: "coming_soon", category: "CRM" },
    { name: "HubSpot", desc: "Marketing and sales automation", status: "coming_soon", category: "CRM" },
    { name: "Slack", desc: "Team notifications and alerts", status: "coming_soon", category: "Communication" },
    { name: "Microsoft Teams", desc: "Enterprise collaboration", status: "coming_soon", category: "Communication" },
    { name: "GovWin IQ", desc: "Pre-RFP intelligence data", status: "coming_soon", category: "Intelligence" },
  ];

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setLoading(false); }; init(); }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const categories = Array.from(new Set(INTEGRATIONS.map(i => i.category)));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Integrations</h1><p className="text-slate-400 mt-1">Connect Sturgeon AI with your existing tools</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-400">{INTEGRATIONS.filter(i => i.status === "active").length}</p><p className="text-xs text-slate-400 mt-1">Active</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-amber-400">{INTEGRATIONS.filter(i => i.status === "coming_soon").length}</p><p className="text-xs text-slate-400 mt-1">Coming Soon</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-blue-400">{categories.length}</p><p className="text-xs text-slate-400 mt-1">Categories</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-purple-400">API</p><p className="text-xs text-slate-400 mt-1">REST API Available</p></div>
      </div>
      {categories.map(cat => (
        <div key={cat} className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-emerald-400">{cat}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{INTEGRATIONS.filter(i => i.category === cat).map(i => (
            <div key={i.name} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
              <div><h3 className="font-medium text-sm">{i.name}</h3><p className="text-xs text-slate-400 mt-0.5">{i.desc}</p></div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${i.status === "active" ? "bg-emerald-900/30 text-emerald-400" : "bg-amber-900/30 text-amber-400"}`}>{i.status === "active" ? "Active" : "Coming Soon"}</span>
            </div>
          ))}</div>
        </div>
      ))}
    </div>
  );
}
