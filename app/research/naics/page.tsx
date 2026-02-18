"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NAICSLookupPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const COMMON_NAICS = [
    { code: "541512", title: "Computer Systems Design Services", size: "$34M" },
    { code: "541511", title: "Custom Computer Programming Services", size: "$34M" },
    { code: "541519", title: "Other Computer Related Services", size: "$34M" },
    { code: "541611", title: "Administrative Management Consulting", size: "$19M" },
    { code: "541613", title: "Marketing Consulting Services", size: "$19M" },
    { code: "541330", title: "Engineering Services", size: "$25.5M" },
    { code: "541990", title: "All Other Professional Services", size: "$19M" },
    { code: "518210", title: "Computing Infrastructure Providers/Data Processing", size: "$40M" },
    { code: "561210", title: "Facilities Support Services", size: "$47M" },
    { code: "561110", title: "Office Administrative Services", size: "$12.5M" },
    { code: "611430", title: "Professional Development Training", size: "$15M" },
    { code: "517110", title: "Wired Telecommunications Carriers", size: "1500 employees" },
  ];

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setToken(session.access_token); setLoading(false); }; init(); }, [router]);

  async function searchNAICS(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true); setResult(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "research", message: `Look up NAICS code information for "${query}". If it's a code, provide: full title, description, size standard, related codes, and common government uses. If it's a description, suggest the best matching NAICS codes with explanations. Also note any special set-aside considerations for small businesses.` }) });
      if (res.ok) { const d = await res.json(); setResult(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">NAICS Code Lookup</h1><p className="text-slate-400 mt-1">Search and analyze NAICS codes for government contracting</p></div>
      <form onSubmit={searchNAICS} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex gap-3">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter NAICS code or describe your services..." className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <button type="submit" disabled={searching} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{searching ? "Searching..." : "Look Up"}</button>
        </div>
      </form>
      {result && (
        <div className="mb-8 p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-3 text-emerald-400">NAICS Analysis</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{result}</pre>
        </div>
      )}
      <h2 className="text-lg font-semibold mb-3">Common IT &amp; Professional Services NAICS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {COMMON_NAICS.map(n => (
          <button key={n.code} onClick={() => setQuery(n.code)} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-emerald-600 transition-colors">
            <span className="text-emerald-400 font-mono text-sm">{n.code}</span>
            <p className="text-sm mt-0.5">{n.title}</p>
            <p className="text-xs text-slate-500">Size: {n.size}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
