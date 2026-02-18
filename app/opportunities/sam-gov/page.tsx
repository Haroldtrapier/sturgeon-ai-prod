"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SAMGovSearchPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [naics, setNaics] = useState("");
  const [setAside, setSetAside] = useState("");
  const [agency, setAgency] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [total, setTotal] = useState(0);
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

  async function searchSAM(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (naics) params.set("naics", naics);
      if (setAside) params.set("set_aside", setAside);
      if (agency) params.set("agency", agency);
      params.set("limit", "25");
      const res = await fetch(`${API}/api/opportunities/search?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setResults(d.opportunities || d.results || []); setTotal(d.total || d.totalRecords || 0); }
    } catch {}
    setSearching(false);
  }

  async function saveOpp(opp: any) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("saved_opportunities").upsert({ user_id: user.id, opportunity_id: opp.noticeId || opp.id, title: opp.title, agency: opp.fullParentPathName || opp.agency, naics_code: opp.naicsCode || opp.naics, response_deadline: opp.responseDeadLine || opp.deadline, notice_id: opp.solicitationNumber || opp.noticeId });
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">SAM.gov Search</h1><p className="text-slate-400 mt-1">Search federal opportunities directly from SAM.gov</p></div>
      <form onSubmit={searchSAM} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" placeholder="Keyword" value={keyword} onChange={e => setKeyword(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <input type="text" placeholder="NAICS Code" value={naics} onChange={e => setNaics(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <select value={setAside} onChange={e => setSetAside(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="">All Set-Asides</option><option value="SBA">Total Small Business</option><option value="8A">8(a)</option><option value="HZC">HUBZone</option><option value="SDVOSBC">SDVOSB</option><option value="WOSB">WOSB</option>
          </select>
          <input type="text" placeholder="Agency" value={agency} onChange={e => setAgency(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <button type="submit" disabled={searching} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">{searching ? "Searching SAM.gov..." : "Search SAM.gov"}</button>
      </form>
      {total > 0 && <p className="text-sm text-slate-400 mb-4">{total.toLocaleString()} opportunities found</p>}
      {results.length > 0 ? (
        <div className="space-y-3">{results.map((r, i) => (
          <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-sm text-blue-400 cursor-pointer hover:underline" onClick={() => r.noticeId && router.push(`/opportunities/${r.noticeId}`)}>{r.title || "Opportunity"}</h3>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                  <span>{r.fullParentPathName || r.agency || "—"}</span>
                  {r.solicitationNumber && <span>Sol: {r.solicitationNumber}</span>}
                  {r.naicsCode && <span>NAICS: {r.naicsCode}</span>}
                  {r.typeOfSetAside && <span className="text-amber-400">{r.typeOfSetAside}</span>}
                  {r.responseDeadLine && <span>Due: {new Date(r.responseDeadLine).toLocaleDateString()}</span>}
                </div>
              </div>
              <button onClick={() => saveOpp(r)} className="ml-3 px-3 py-1 bg-emerald-600/10 text-emerald-400 rounded text-xs hover:bg-emerald-600/20">Save</button>
            </div>
          </div>
        ))}</div>
      ) : !searching && <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">Search SAM.gov for federal contract opportunities</p></div>}
    </div>
  );
}
