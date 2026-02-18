"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OpportunityForecastPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [agency, setAgency] = useState("");
  const [naics, setNaics] = useState("");
  const [forecast, setForecast] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      setLoading(false);
    };
    init();
  }, [router]);

  async function runForecast(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true); setForecast(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "market", message: `Provide a procurement forecast analysis${agency ? ` for ${agency}` : ""}${naics ? ` in NAICS ${naics}` : ""}. Include: 1) Expected contracting activity for the next 6 months 2) Budget cycle impact (continuing resolutions, new appropriations) 3) Set-aside projections 4) Seasonal spending patterns 5) Key upcoming recompetes 6) Strategic recommendations for positioning.` }) });
      if (res.ok) { const d = await res.json(); setForecast(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Opportunity Forecast</h1><p className="text-slate-400 mt-1">AI-powered procurement forecasting and trend predictions</p></div>
      <form onSubmit={runForecast} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Agency (optional)" value={agency} onChange={e => setAgency(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <input type="text" placeholder="NAICS Code (optional)" value={naics} onChange={e => setNaics(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        </div>
        <button type="submit" disabled={searching} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{searching ? "Forecasting..." : "Generate Forecast"}</button>
      </form>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-blue-400">Q1-Q2</p><p className="text-xs text-slate-400 mt-1">Peak New Awards</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-amber-400">Q3</p><p className="text-xs text-slate-400 mt-1">Use-or-Lose Spending</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-red-400">Q4</p><p className="text-xs text-slate-400 mt-1">Year-End Surge</p></div>
      </div>
      {searching && <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-3" /><p className="text-sm text-slate-400">Generating procurement forecast...</p></div>}
      {forecast && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">Procurement Forecast</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{forecast}</pre>
        </div>
      )}
    </div>
  );
}
