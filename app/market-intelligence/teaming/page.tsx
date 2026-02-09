"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function TeamingPartnerPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [naics, setNaics] = useState("");
  const [capability, setCapability] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState<any>(null);
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

  async function findPartners(e: React.FormEvent) {
    e.preventDefault();
    if (!naics.trim() && !capability.trim()) return;
    setSearching(true); setResults(null);
    try {
      const message = `Find potential teaming partners for a small business with the following criteria:
${naics ? `- NAICS Code: ${naics}` : ""}
${capability ? `- Capability needed: ${capability}` : ""}
${location ? `- Location preference: ${location}` : ""}

Provide: 1) Types of companies to partner with 2) Where to find teaming partners (SBA SubNet, GovWin, etc.) 3) Key considerations for teaming agreements 4) Mentor-protege program opportunities 5) Joint venture options and requirements 6) Sample teaming arrangement structure.`;
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "market", message }) });
      if (res.ok) { const d = await res.json(); setResults(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Teaming Partner Finder</h1><p className="text-slate-400 mt-1">Find strategic partners for joint ventures and teaming arrangements</p></div>
      <form onSubmit={findPartners} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><label className="block text-xs text-slate-400 mb-1">NAICS Code</label><input type="text" placeholder="e.g. 541512" value={naics} onChange={e => setNaics(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Capability Needed</label><input type="text" placeholder="e.g. Cloud Migration" value={capability} onChange={e => setCapability(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
          <div><label className="block text-xs text-slate-400 mb-1">Location</label><input type="text" placeholder="e.g. Washington DC" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
        </div>
        <button type="submit" disabled={searching} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{searching ? "Finding Partners..." : "Find Partners"}</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-blue-400">Mentor-Protege</p><p className="text-xs text-slate-400 mt-1">Large business mentorship</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-purple-400">Joint Venture</p><p className="text-xs text-slate-400 mt-1">Combined entity bidding</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-lg font-bold text-emerald-400">Subcontracting</p><p className="text-xs text-slate-400 mt-1">Team under a prime</p></div>
      </div>
      {searching && <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-3" /><p className="text-sm text-slate-400">Finding teaming partners...</p></div>}
      {results && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">Teaming Recommendations</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{results}</pre>
        </div>
      )}
    </div>
  );
}
