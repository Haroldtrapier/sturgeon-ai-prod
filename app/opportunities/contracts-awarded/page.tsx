"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ContractsAwardedPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [agency, setAgency] = useState("");
  const [awards, setAwards] = useState<any[]>([]);
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

  async function searchAwards(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (agency) params.set("agency", agency);
      params.set("limit", "25");
      const res = await fetch(`${API}/api/market/contracts/search?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setAwards(d.results || d.awards || []); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Contracts Awarded</h1><p className="text-slate-400 mt-1">Browse recently awarded federal contracts</p></div>
      <form onSubmit={searchAwards} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Keyword" value={keyword} onChange={e => setKeyword(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <input type="text" placeholder="Agency" value={agency} onChange={e => setAgency(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <button type="submit" disabled={searching} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">{searching ? "Searching..." : "Search Awards"}</button>
      </form>
      {awards.length > 0 ? (
        <div className="space-y-3">{awards.map((a, i) => (
          <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="font-medium text-sm">{a.description || a.Award?.description || "Contract Award"}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-xs text-slate-400">
              <div><span className="text-slate-500">Agency:</span> {a.agency || a.Award?.awarding_agency || "—"}</div>
              <div><span className="text-slate-500">Vendor:</span> {a.vendor || a.Award?.recipient_name || "—"}</div>
              <div><span className="text-slate-500">Value:</span> <span className="text-emerald-400">${Number(a.total_obligation || a.Award?.total_obligation || 0).toLocaleString()}</span></div>
              <div><span className="text-slate-500">Date:</span> {a.date || a.Award?.date_signed || "—"}</div>
            </div>
          </div>
        ))}</div>
      ) : !searching && <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">Search for awarded contracts to analyze competition</p></div>}
    </div>
  );
}
