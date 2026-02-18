"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetAsideAnalysisPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [naics, setNaics] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const SET_ASIDES = [
    { type: "Total Small Business", code: "SBA", goal: "23%", desc: "Open to all small businesses meeting size standard", threshold: "$250K+" },
    { type: "8(a) Sole Source", code: "8A", goal: "5%", desc: "Direct awards to 8(a) certified firms", threshold: "Up to $4.5M" },
    { type: "8(a) Competitive", code: "8AN", goal: "", desc: "Competition among 8(a) firms", threshold: "Above $4.5M" },
    { type: "HUBZone Sole Source", code: "HZS", goal: "3%", desc: "Direct awards to HUBZone firms", threshold: "Up to $4.5M" },
    { type: "HUBZone Competitive", code: "HZC", goal: "", desc: "Competition among HUBZone firms", threshold: "Above $4.5M" },
    { type: "SDVOSB Sole Source", code: "SDVOSBS", goal: "3%", desc: "Direct awards to SDVOSBs", threshold: "Up to $5M" },
    { type: "SDVOSB Competitive", code: "SDVOSBC", goal: "", desc: "Competition among SDVOSBs", threshold: "Above $5M" },
    { type: "WOSB", code: "WOSB", goal: "5%", desc: "Women-Owned in underrepresented industries", threshold: "Up to $4.5M sole source" },
    { type: "EDWOSB", code: "EDWOSB", goal: "", desc: "Economically disadvantaged women-owned", threshold: "Up to $4.5M sole source" },
  ];

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setToken(session.access_token); setLoading(false); }; init(); }, [router]);

  async function analyzeSetAsides() {
    setAnalyzing(true); setAnalysis(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "market", message: `Analyze the set-aside contracting landscape${naics ? ` for NAICS ${naics}` : ""}. Include: 1) Percentage of contracts by set-aside type 2) Average award sizes 3) Which agencies use set-asides most 4) Trends in set-aside utilization 5) Strategic recommendations for positioning 6) Rule of Two considerations.` }) });
      if (res.ok) { const d = await res.json(); setAnalysis(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setAnalyzing(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Set-Aside Analysis</h1><p className="text-slate-400 mt-1">Understand small business set-aside programs and opportunities</p></div>
      <div className="mb-6 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex gap-3">
          <input type="text" value={naics} onChange={e => setNaics(e.target.value)} placeholder="NAICS code (optional)" className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <button onClick={analyzeSetAsides} disabled={analyzing} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{analyzing ? "Analyzing..." : "Analyze Set-Asides"}</button>
        </div>
      </div>
      {analysis && (
        <div className="mb-6 p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-3 text-emerald-400">Set-Aside Market Analysis</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysis}</pre>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-400 border-b border-slate-800">
            <th className="pb-3 pr-3">Set-Aside Type</th><th className="pb-3 pr-3">Code</th><th className="pb-3 pr-3">Gov Goal</th><th className="pb-3 pr-3">Threshold</th><th className="pb-3">Description</th>
          </tr></thead>
          <tbody>{SET_ASIDES.map(s => (
            <tr key={s.type} className="border-b border-slate-800/50">
              <td className="py-3 pr-3 font-medium text-emerald-400">{s.type}</td>
              <td className="py-3 pr-3 font-mono text-xs">{s.code}</td>
              <td className="py-3 pr-3">{s.goal || "—"}</td>
              <td className="py-3 pr-3 text-slate-400">{s.threshold}</td>
              <td className="py-3 text-slate-400">{s.desc}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
