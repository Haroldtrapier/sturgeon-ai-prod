"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EModPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
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

  async function searchMods(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      params.set("type", "modification");
      params.set("limit", "25");
      const res = await fetch(`${API}/api/opportunities/search?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setResults(d.opportunities || d.results || []); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Contract Modifications</h1><p className="text-slate-400 mt-1">Track contract modifications, options, and extensions</p></div>
      <form onSubmit={searchMods} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex gap-3">
          <input type="text" placeholder="Search modifications by keyword or contract number..." value={keyword} onChange={e => setKeyword(e.target.value)} className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <button type="submit" disabled={searching} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">{searching ? "Searching..." : "Search"}</button>
        </div>
      </form>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-blue-400">Options</p><p className="text-xs text-slate-400 mt-1">Option year exercises</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-purple-400">Modifications</p><p className="text-xs text-slate-400 mt-1">Scope & funding changes</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-amber-400">Extensions</p><p className="text-xs text-slate-400 mt-1">Period of performance</p></div>
      </div>
      {results.length > 0 ? (
        <div className="space-y-3">{results.map((r, i) => (
          <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="font-medium text-sm">{r.title || "Modification"}</h3>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
              {r.agency && <span>{r.agency}</span>}
              {r.solicitationNumber && <span>Sol: {r.solicitationNumber}</span>}
              {r.type && <span className="text-purple-400">{r.type}</span>}
              {r.postedDate && <span>Posted: {new Date(r.postedDate).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}</div>
      ) : !searching && <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">Search for contract modifications, option exercises, and extensions</p></div>}
    </div>
  );
}
