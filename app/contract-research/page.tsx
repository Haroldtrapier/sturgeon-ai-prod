"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ContractResearchPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [agency, setAgency] = useState("");
  const [naics, setNaics] = useState("");
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

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      if (agency) params.set("agency", agency);
      if (naics) params.set("naics", naics);
      params.set("limit", "25");
      const res = await fetch(`${API}/api/market/contracts/search?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setResults(d.results || []); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Contract Research</h1><p className="text-stone-500 mt-1">Search and analyze historical federal contracts</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Link href="/contract-research/vendors" className="p-4 bg-white border border-stone-200 rounded-xl hover:border-blue-600 transition-colors text-center"><p className="font-semibold text-blue-600 text-sm">Vendor Profiles</p></Link>
        <Link href="/contract-research/awards" className="p-4 bg-white border border-stone-200 rounded-xl hover:border-purple-600 transition-colors text-center"><p className="font-semibold text-purple-600 text-sm">Award History</p></Link>
        <Link href="/contract-research/agencies" className="p-4 bg-white border border-stone-200 rounded-xl hover:border-lime-600 transition-colors text-center"><p className="font-semibold text-lime-700 text-sm">Agency Spending</p></Link>
        <Link href="/contract-research/fpds" className="p-4 bg-white border border-stone-200 rounded-xl hover:border-amber-600 transition-colors text-center"><p className="font-semibold text-amber-400 text-sm">FPDS Explorer</p></Link>
      </div>
      <form onSubmit={search} className="mb-8 p-6 bg-white border border-stone-200 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input type="text" placeholder="Keyword" value={keyword} onChange={e => setKeyword(e.target.value)} className="px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
          <input type="text" placeholder="Agency" value={agency} onChange={e => setAgency(e.target.value)} className="px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
          <input type="text" placeholder="NAICS Code" value={naics} onChange={e => setNaics(e.target.value)} className="px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
        </div>
        <button type="submit" disabled={searching} className="px-6 py-3 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 font-medium">{searching ? "Searching..." : "Search Contracts"}</button>
      </form>
      {results.length > 0 && (
        <div className="space-y-3">{results.map((r, i) => (
          <div key={i} className="p-4 bg-white border border-stone-200 rounded-xl">
            <h3 className="font-medium text-sm">{r.Award?.description || r.description || "Contract"}</h3>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-stone-500">
              {r.Award?.total_obligation && <span>Value: ${Number(r.Award.total_obligation).toLocaleString()}</span>}
              {r.Award?.awarding_agency && <span>Agency: {r.Award.awarding_agency}</span>}
              {r.Award?.recipient_name && <span>Vendor: {r.Award.recipient_name}</span>}
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
