"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OpportunityAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oppId = searchParams?.get("id");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [keyword, setKeyword] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      setLoading(false);

      if (oppId) runAnalysis(oppId, session.access_token);
    };
    init();
  }, [router, oppId]);

  async function runAnalysis(id: string, tkn?: string) {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch(`${API}/api/agents/analyze-opportunity`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tkn || token}` },
        body: JSON.stringify({ opportunity_id: id }),
      });
      if (res.ok) {
        const d = await res.json();
        setAnalysis(typeof d.analysis === "string" ? d.analysis : typeof d.response === "string" ? d.response : JSON.stringify(d, null, 2));
      }
    } catch {}
    setAnalyzing(false);
  }

  async function analyzeByKeyword() {
    if (!keyword.trim()) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          agent_type: "opportunity",
          message: `Perform a deep analysis of government contracting opportunities related to "${keyword}". Include: market size, competition level, typical set-asides, key agencies, average contract values, win strategies, and risks. Provide actionable recommendations.`,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setAnalysis(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2));
      }
    } catch {}
    setAnalyzing(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const QUICK_ANALYSES = [
    "IT Services & Cybersecurity",
    "Professional Consulting",
    "Cloud Migration & Infrastructure",
    "Data Analytics & AI/ML",
    "Healthcare IT",
    "Defense & Intelligence",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Opportunity Analysis</h1>
        <p className="text-slate-400 mt-1">AI-powered deep analysis of contracting opportunities</p>
      </div>

      <div className="flex gap-3 mb-6">
        <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === "Enter" && analyzeByKeyword()} placeholder="Enter opportunity keyword or NAICS code..." className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
        <button onClick={analyzeByKeyword} disabled={analyzing} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-sm">
          {analyzing ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      <div className="mb-6">
        <p className="text-xs text-slate-400 mb-2">Quick Analysis:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_ANALYSES.map(q => (
            <button key={q} onClick={() => { setKeyword(q); analyzeByKeyword(); }} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs hover:border-emerald-600 transition-colors">{q}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Competition Level", desc: "Analyze typical bidder counts and competitive landscape", icon: "📊" },
          { title: "Win Probability", desc: "Estimate win rates based on your profile match", icon: "🎯" },
          { title: "Pricing Intelligence", desc: "Market rates and pricing benchmarks", icon: "💰" },
        ].map(card => (
          <div key={card.title} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="text-2xl mb-2">{card.icon}</div>
            <h3 className="font-semibold text-sm">{card.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {analysis ? (
        <div className="p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <h2 className="font-semibold text-emerald-400 mb-3">Analysis Results</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{analysis}</pre>
        </div>
      ) : !analyzing && (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-slate-400">Enter a keyword or select a quick analysis to get started</p>
          <p className="text-xs text-slate-500 mt-1">Our AI analyzes market data, competition, and your profile to provide actionable insights</p>
        </div>
      )}
    </div>
  );
}
