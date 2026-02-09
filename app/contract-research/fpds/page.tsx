"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FPDSExplorerPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [agency, setAgency] = useState("");
  const [naics, setNaics] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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

  async function searchFPDS(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (agency) params.set("agency", agency);
      if (naics) params.set("naics", naics);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      params.set("limit", "30");
      const res = await fetch(`${API}/api/market/fpds?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setResults(d.results || d.contracts || []); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">FPDS Explorer</h1><p className="text-slate-400 mt-1">Search the Federal Procurement Data System for contract records</p></div>
      <form onSubmit={searchFPDS} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input type="text" placeholder="Keyword" value={keyword} onChange={e => setKeyword(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          <input type="text" placeholder="Contracting Agency" value={agency} onChange={e => setAgency(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
          <input type="text" placeholder="NAICS Code" value={naics} onChange={e => setNaics(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="block text-xs text-slate-400 mb-1">Date From</label><input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Date To</label><input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" /></div>
        </div>
        <button type="submit" disabled={searching} className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium">{searching ? "Searching..." : "Search FPDS"}</button>
      </form>
      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{results.length} Records Found</h2>
          {results.map((r, i) => (
            <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="font-medium text-sm">{r.description || r.contract_description || "FPDS Record"}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-xs text-slate-400">
                {r.contracting_agency && <div><span className="text-slate-500">Agency:</span> {r.contracting_agency}</div>}
                {r.vendor_name && <div><span className="text-slate-500">Vendor:</span> {r.vendor_name}</div>}
                {r.obligated_amount && <div><span className="text-slate-500">Value:</span> ${Number(r.obligated_amount).toLocaleString()}</div>}
                {r.date_signed && <div><span className="text-slate-500">Signed:</span> {r.date_signed}</div>}
                {r.naics_code && <div><span className="text-slate-500">NAICS:</span> {r.naics_code}</div>}
                {r.contract_type && <div><span className="text-slate-500">Type:</span> {r.contract_type}</div>}
                {r.set_aside && <div><span className="text-slate-500">Set-Aside:</span> {r.set_aside}</div>}
                {r.piid && <div><span className="text-slate-500">PIID:</span> {r.piid}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {results.length === 0 && !searching && <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">Search the FPDS database for historical contract data</p></div>}
    </div>
  );
}
