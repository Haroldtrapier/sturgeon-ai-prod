"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResearchPastPerformancePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [vendorName, setVendorName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setToken(session.access_token); setLoading(false); }; init(); }, [router]);

  async function searchPerformance(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorName.trim()) return;
    setSearching(true); setResult(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "research", message: `Research the past performance and contract history for "${vendorName}". Include: 1) Known federal contracts and agencies served 2) Contract types and values 3) CPARS-reportable contracts 4) Performance trends 5) Any notable awards or issues 6) How this information can be used for competitive intelligence.` }) });
      if (res.ok) { const d = await res.json(); setResult(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Past Performance Research</h1><p className="text-slate-400 mt-1">Research vendor contract history and performance</p></div>
      <form onSubmit={searchPerformance} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex gap-3">
          <input type="text" value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="Enter company or vendor name..." className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <button type="submit" disabled={searching} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{searching ? "Researching..." : "Research"}</button>
        </div>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-blue-400">CPARS</p><p className="text-xs text-slate-400 mt-1">Performance Ratings</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-purple-400">PPIRS</p><p className="text-xs text-slate-400 mt-1">Retrieval System</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-emerald-400">FAPIIS</p><p className="text-xs text-slate-400 mt-1">Integrity Info</p></div>
      </div>
      {result && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">Performance Research Results</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}
