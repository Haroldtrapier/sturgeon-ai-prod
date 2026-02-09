"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EBuyOpportunitiesPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [schedule, setSchedule] = useState("");
  const [results, setResults] = useState<any[]>([]);
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

  async function searchEBuy(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (schedule) params.set("schedule", schedule);
      params.set("source", "ebuy");
      const res = await fetch(`${API}/api/opportunities/search?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setResults(d.opportunities || d.results || []); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const GSA_SCHEDULES = ["MAS (Multiple Award Schedule)", "OASIS+", "STARS III", "VETS 2", "Alliant 2", "8(a) STARS III", "HCaTS"];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">GSA eBuy</h1><p className="text-slate-400 mt-1">Request for Quotes from GSA Schedule holders</p></div>
      <form onSubmit={searchEBuy} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Search eBuy RFQs..." value={keyword} onChange={e => setKeyword(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <select value={schedule} onChange={e => setSchedule(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="">All Schedules</option>
            {GSA_SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" disabled={searching} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">{searching ? "Searching..." : "Search eBuy"}</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-blue-400">RFQ</p><p className="text-xs text-slate-400 mt-1">Request for Quote</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-purple-400">RFI</p><p className="text-xs text-slate-400 mt-1">Request for Information</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-emerald-400">BPA Call</p><p className="text-xs text-slate-400 mt-1">Blanket Purchase Agreement</p></div>
      </div>
      {results.length > 0 ? (
        <div className="space-y-3">{results.map((r, i) => (
          <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="font-medium text-sm text-blue-400">{r.title || "eBuy Opportunity"}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-xs text-slate-400">
              {r.rfq_number && <div><span className="text-slate-500">RFQ:</span> {r.rfq_number}</div>}
              {r.schedule && <div><span className="text-slate-500">Schedule:</span> {r.schedule}</div>}
              {r.deadline && <div><span className="text-slate-500">Deadline:</span> {r.deadline}</div>}
            </div>
          </div>
        ))}</div>
      ) : !searching && <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">Search GSA eBuy for RFQs available to schedule holders</p></div>}
    </div>
  );
}
