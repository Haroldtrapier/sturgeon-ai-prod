"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SpendingTrendsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [naics, setNaics] = useState("");
  const [agency, setAgency] = useState("");
  const [data, setData] = useState<any>(null);
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

  async function searchSpending(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true); setData(null);
    try {
      const params = new URLSearchParams();
      if (naics) params.set("naics", naics);
      if (agency) params.set("agency", agency);
      const res = await fetch(`${API}/api/market/trends?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setData(d); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Spending Trends</h1><p className="text-slate-400 mt-1">Analyze federal spending patterns over time</p></div>
      <form onSubmit={searchSpending} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="block text-xs text-slate-400 mb-1">NAICS Code</label><input type="text" placeholder="e.g. 541512" value={naics} onChange={e => setNaics(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Agency</label><input type="text" placeholder="e.g. Department of Defense" value={agency} onChange={e => setAgency(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
        </div>
        <button type="submit" disabled={searching} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{searching ? "Loading..." : "View Trends"}</button>
      </form>
      {data && (
        <div className="space-y-6">
          {data.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(data.summary).map(([key, val]: [string, any]) => (
                <div key={key} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
                  <p className="text-xl font-bold text-emerald-400">{typeof val === "number" ? (val > 1000 ? `$${(val / 1e9).toFixed(1)}B` : val.toLocaleString()) : String(val)}</p>
                  <p className="text-xs text-slate-400 mt-1">{key.replace(/_/g, " ")}</p>
                </div>
              ))}
            </div>
          )}
          {data.yearly_data && data.yearly_data.length > 0 && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h2 className="font-semibold mb-4">Yearly Breakdown</h2>
              <div className="space-y-2">{data.yearly_data.map((y: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                  <span className="text-sm font-medium">FY {y.year || y.fiscal_year}</span>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-slate-400">{y.contract_count?.toLocaleString() || "—"} contracts</span>
                    <span className="text-sm text-emerald-400 font-medium">${y.total_spending ? Number(y.total_spending).toLocaleString() : "—"}</span>
                  </div>
                </div>
              ))}</div>
            </div>
          )}
          {data.analysis && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h2 className="font-semibold mb-3 text-emerald-400">AI Analysis</h2>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap">{typeof data.analysis === "string" ? data.analysis : JSON.stringify(data.analysis, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
      {!data && !searching && <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">Enter a NAICS code or agency to view spending trends</p></div>}
    </div>
  );
}
