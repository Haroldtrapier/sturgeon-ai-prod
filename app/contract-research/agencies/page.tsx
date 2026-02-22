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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Agency Spending</h1><p className="text-stone-500 mt-1">Analyze federal agency spending patterns and trends</p></div>
      <div className="mb-8 p-6 bg-white border border-stone-200 rounded-xl">
        <div className="flex gap-3 mb-4">
          <input type="text" placeholder="Agency name..." value={agencyName} onChange={e => setAgencyName(e.target.value)} onKeyDown={e => e.key === "Enter" && searchAgency()} className="flex-1 px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
          <button onClick={() => searchAgency()} disabled={searching} className="px-6 py-3 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 font-medium">{searching ? "Loading..." : "Analyze"}</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {TOP_AGENCIES.map(a => (
            <button key={a} onClick={() => searchAgency(a)} className="px-3 py-1 bg-stone-100 border border-stone-300 rounded-full text-xs text-stone-600 hover:border-lime-600 hover:text-lime-700 transition-colors">{a}</button>
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
              <div key={s.label} className="p-4 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-2xl font-bold text-lime-700">{s.value}</p>
                <p className="text-xs text-stone-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          {agencyData.analysis && (
            <div className="p-6 bg-white border border-stone-200 rounded-xl">
              <h2 className="text-lg font-semibold mb-3 text-lime-700">AI Analysis</h2>
              <pre className="text-sm text-stone-600 whitespace-pre-wrap">{typeof agencyData.analysis === "string" ? agencyData.analysis : JSON.stringify(agencyData.analysis, null, 2)}</pre>
            </div>
          )}
          {agencyData.top_vendors && agencyData.top_vendors.length > 0 && (
            <div className="p-6 bg-white border border-stone-200 rounded-xl">
              <h2 className="text-lg font-semibold mb-3">Top Vendors</h2>
              <div className="space-y-2">{agencyData.top_vendors.map((v: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-stone-200 last:border-0">
                  <span className="text-sm">{v.name || v.recipient_name}</span>
                  <span className="text-sm text-lime-700 font-medium">{v.total ? `$${Number(v.total).toLocaleString()}` : "—"}</span>
                </div>
              ))}</div>
            </div>
          )}
        </div>
      )}
      {!agencyData && !searching && <div className="text-center py-16 bg-white border border-stone-200 rounded-xl"><p className="text-stone-500">Select or search for an agency to view spending analysis</p></div>}
    </div>
  );
}
