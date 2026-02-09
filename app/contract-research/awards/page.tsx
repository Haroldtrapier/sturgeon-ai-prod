"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AwardHistoryPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [year, setYear] = useState("");
  const [minValue, setMinValue] = useState("");
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
      if (year) params.set("year", year);
      if (minValue) params.set("min_value", minValue);
      params.set("limit", "25");
      const res = await fetch(`${API}/api/market/contracts/search?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setAwards(d.results || []); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Award History</h1><p className="text-slate-400 mt-1">Search and analyze federal contract awards</p></div>
      <form onSubmit={searchAwards} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input type="text" placeholder="Keyword (e.g. cybersecurity)" value={keyword} onChange={e => setKeyword(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
          <input type="text" placeholder="Fiscal Year (e.g. 2024)" value={year} onChange={e => setYear(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
          <input type="text" placeholder="Min Value ($)" value={minValue} onChange={e => setMinValue(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
        </div>
        <button type="submit" disabled={searching} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">{searching ? "Searching..." : "Search Awards"}</button>
      </form>
      {awards.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-400 border-b border-slate-800">
              <th className="pb-3 pr-4">Description</th><th className="pb-3 pr-4">Agency</th><th className="pb-3 pr-4">Vendor</th><th className="pb-3 pr-4 text-right">Value</th><th className="pb-3 text-right">Date</th>
            </tr></thead>
            <tbody>{awards.map((a, i) => (
              <tr key={i} className="border-b border-slate-800/50">
                <td className="py-3 pr-4 max-w-xs truncate">{a.Award?.description || a.description || "—"}</td>
                <td className="py-3 pr-4 text-slate-400">{a.Award?.awarding_agency || a.agency || "—"}</td>
                <td className="py-3 pr-4 text-slate-400">{a.Award?.recipient_name || a.vendor || "—"}</td>
                <td className="py-3 pr-4 text-right text-emerald-400 font-medium">{a.Award?.total_obligation ? `$${Number(a.Award.total_obligation).toLocaleString()}` : "—"}</td>
                <td className="py-3 text-right text-slate-500">{a.Award?.date_signed || a.date || "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {awards.length === 0 && !searching && <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">Search for contract awards by keyword, year, or minimum value</p></div>}
    </div>
  );
}
