"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function GoNoGoPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [oppId, setOppId] = useState("");
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

  async function runGoNoGo(e: React.FormEvent) {
    e.preventDefault();
    setAnalyzing(true); setAnalysis(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "opportunity", message: `Perform a GO/NO-GO analysis for opportunity ID: ${oppId}. Evaluate: 1) Technical capability alignment 2) Past performance relevance 3) Competition level 4) Resource requirements 5) Win probability. Provide a clear GO, NO-GO, or CONDITIONAL-GO recommendation with detailed reasoning.` }) });
      if (res.ok) { const d = await res.json(); setAnalysis(d.response || d); }
    } catch {}
    setAnalyzing(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">GO / NO-GO Analysis</h1><p className="text-slate-400 mt-1">AI-powered bid decision analysis</p></div>
      <form onSubmit={runGoNoGo} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <p className="text-sm text-slate-400">Enter an opportunity ID to get an AI-powered GO/NO-GO recommendation based on your company profile.</p>
        <div className="flex gap-3">
          <input type="text" placeholder="Opportunity ID" value={oppId} onChange={e => setOppId(e.target.value)} required className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <button type="submit" disabled={analyzing} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{analyzing ? "Analyzing..." : "Run Analysis"}</button>
        </div>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
        {["Technical Fit", "Past Performance", "Competition", "Resources", "Win Probability"].map((c, i) => (
          <div key={c} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className="text-2xl font-bold text-emerald-400">{analysis ? "--" : "--"}</p>
            <p className="text-xs text-slate-400 mt-1">{c}</p>
          </div>
        ))}
      </div>
      {analysis && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">Analysis Results</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{typeof analysis === "string" ? analysis : JSON.stringify(analysis, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
