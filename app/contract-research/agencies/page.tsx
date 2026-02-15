"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AgencySpendingPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [agencyName, setAgencyName] = useState("");
  const [agencyData, setAgencyData] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const TOP_AGENCIES = ["Department of Defense", "Department of Health and Human Services", "Department of Veterans Affairs", "Department of Homeland Security", "General Services Administration", "Department of Energy", "NASA", "Department of Justice"];

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

  async function searchAgency(name?: string) {
    const search = name || agencyName;
    if (!search.trim()) return;
    setSearching(true);
    setAgencyName(search);
    try {
      const res = await fetch(`${API}/api/market/agencies/${encodeURIComponent(search)}/spending`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setAgencyData(d); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Agency Spending</h1><p className="text-slate-400 mt-1">Analyze federal agency spending patterns and trends</p></div>
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex gap-3 mb-4">
          <input type="text" placeholder="Agency name..." value={agencyName} onChange={e => setAgencyName(e.target.value)} onKeyDown={e => e.key === "Enter" && searchAgency()} className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <button onClick={() => searchAgency()} disabled={searching} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{searching ? "Loading..." : "Analyze"}</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {TOP_AGENCIES.map(a => (
            <button key={a} onClick={() => searchAgency(a)} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 hover:border-emerald-600 hover:text-emerald-400 transition-colors">{a}</button>
          ))}
        </div>
      </div>
      {agencyData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Spending", value: agencyData.total_spending ? `$${Number(agencyData.total_spending).toLocaleString()}` : "—" },
              { label: "Contract Count", value: agencyData.contract_count?.toLocaleString() || "—" },
              { label: "Avg Award Size", value: agencyData.avg_award ? `$${Number(agencyData.avg_award).toLocaleString()}` : "—" },
              { label: "Small Biz %", value: agencyData.small_business_pct ? `${agencyData.small_business_pct}%` : "—" },
            ].map(s => (
              <div key={s.label} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
                <p className="text-2xl font-bold text-emerald-400">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          {agencyData.analysis && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h2 className="text-lg font-semibold mb-3 text-emerald-400">AI Analysis</h2>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap">{typeof agencyData.analysis === "string" ? agencyData.analysis : JSON.stringify(agencyData.analysis, null, 2)}</pre>
            </div>
          )}
          {agencyData.top_vendors && agencyData.top_vendors.length > 0 && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h2 className="text-lg font-semibold mb-3">Top Vendors</h2>
              <div className="space-y-2">{agencyData.top_vendors.map((v: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
                  <span className="text-sm">{v.name || v.recipient_name}</span>
                  <span className="text-sm text-emerald-400 font-medium">{v.total ? `$${Number(v.total).toLocaleString()}` : "—"}</span>
                </div>
              ))}</div>
            </div>
          )}
        </div>
      )}
      {!agencyData && !searching && <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">Select or search for an agency to view spending analysis</p></div>}
    </div>
  );
}
