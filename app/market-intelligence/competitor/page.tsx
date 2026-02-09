"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CompetitorAnalysisPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [vendorName, setVendorName] = useState("");
  const [naics, setNaics] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
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

  async function runAnalysis(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorName.trim() && !naics.trim()) return;
    setAnalyzing(true); setAnalysis(null);
    try {
      const message = vendorName
        ? `Analyze ${vendorName} as a competitor in federal contracting. Include: 1) Known contract wins and agencies served 2) Estimated revenue and employee count 3) Core capabilities and NAICS codes 4) Set-aside certifications 5) Strengths and weaknesses 6) How to compete against them.`
        : `Analyze the competitive landscape for NAICS ${naics}. Include: 1) Top contractors in this space 2) Average contract sizes 3) Key agencies buying in this NAICS 4) Set-aside trends 5) Barriers to entry 6) Strategic recommendations for new entrants.`;
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "market", message }) });
      if (res.ok) { const d = await res.json(); setAnalysis(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setAnalyzing(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Competitor Analysis</h1><p className="text-slate-400 mt-1">Research competitors and competitive landscapes</p></div>
      <form onSubmit={runAnalysis} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <p className="text-sm text-slate-400 mb-4">Analyze a specific competitor or the competitive landscape for a NAICS code</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Competitor Name</label>
            <input type="text" placeholder="e.g. Booz Allen Hamilton" value={vendorName} onChange={e => setVendorName(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Or NAICS Code</label>
            <input type="text" placeholder="e.g. 541512" value={naics} onChange={e => setNaics(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
        </div>
        <button type="submit" disabled={analyzing} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{analyzing ? "Analyzing..." : "Run Analysis"}</button>
      </form>
      {analyzing && <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-3" /><p className="text-sm text-slate-400">Running competitive analysis...</p></div>}
      {analysis && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">Competitive Analysis</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysis}</pre>
        </div>
      )}
    </div>
  );
}
