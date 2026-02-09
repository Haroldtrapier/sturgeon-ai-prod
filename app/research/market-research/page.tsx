"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MarketResearchPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const RESEARCH_TOPICS = [
    "Federal IT modernization trends", "Cybersecurity contract opportunities", "DoD cloud computing market", "Healthcare IT spending", "AI/ML in government", "Zero trust architecture requirements", "Supply chain management contracts", "Professional services market analysis"
  ];

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setToken(session.access_token); setLoading(false); }; init(); }, [router]);

  async function runResearch(query: string) {
    setSearching(true); setResult(null); setTopic(query);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "market", message: `Conduct market research on "${query}" in the federal government contracting space. Include: 1) Market size and growth trends 2) Key agencies and programs 3) Major contract vehicles 4) Competition landscape 5) Entry barriers and opportunities for small business 6) Upcoming procurements 7) Strategic recommendations.` }) });
      if (res.ok) { const d = await res.json(); setResult(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Market Research</h1><p className="text-slate-400 mt-1">AI-powered federal market research and analysis</p></div>
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex gap-3 mb-4">
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && runResearch(topic)} placeholder="Enter a market research topic..." className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <button onClick={() => runResearch(topic)} disabled={searching || !topic.trim()} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{searching ? "Researching..." : "Research"}</button>
        </div>
        <div className="flex flex-wrap gap-2">{RESEARCH_TOPICS.map(t => (
          <button key={t} onClick={() => runResearch(t)} disabled={searching} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 hover:border-emerald-600 hover:text-emerald-400 transition-colors disabled:opacity-50">{t}</button>
        ))}</div>
      </div>
      {searching && <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-3" /><p className="text-sm text-slate-400">Conducting market research...</p></div>}
      {result && (
        <div className="p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">Market Research: {topic}</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}
