"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DecisionToolsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [oppTitle, setOppTitle] = useState("");
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

  const CRITERIA = [
    { id: "alignment", label: "Strategic Alignment", desc: "How well does this opportunity align with our business strategy?", weight: 15 },
    { id: "capability", label: "Technical Capability", desc: "Do we have the skills and resources to deliver?", weight: 15 },
    { id: "past_performance", label: "Relevant Past Performance", desc: "Do we have similar past performance to reference?", weight: 10 },
    { id: "competition", label: "Competitive Position", desc: "How strong is our position vs. likely competitors?", weight: 10 },
    { id: "relationship", label: "Customer Relationship", desc: "Do we have an existing relationship with the agency?", weight: 10 },
    { id: "pricing", label: "Pricing Competitiveness", desc: "Can we offer competitive pricing and still be profitable?", weight: 10 },
    { id: "teaming", label: "Teaming Availability", desc: "Can we form a strong team for this opportunity?", weight: 5 },
    { id: "certifications", label: "Required Certifications", desc: "Do we have all required certifications and clearances?", weight: 10 },
    { id: "timeline", label: "Proposal Timeline", desc: "Do we have adequate time to prepare a quality proposal?", weight: 5 },
    { id: "profitability", label: "Profit Potential", desc: "Is the expected profit margin worth the investment?", weight: 10 },
  ];

  const totalScore = CRITERIA.reduce((sum, c) => sum + ((scores[c.id] || 0) * c.weight / 100), 0);
  const maxScore = 10;
  const percentage = Math.round((totalScore / maxScore) * 100);

  async function getAIRecommendation() {
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          agent_type: "opportunity",
          message: `Based on this Go/No-Go assessment for "${oppTitle || "a government contract opportunity"}", provide a recommendation. Scores (1-10): ${CRITERIA.map(c => `${c.label}: ${scores[c.id] || 0}/10`).join(", ")}. Overall weighted score: ${percentage}%. Provide a clear GO or NO-GO recommendation with rationale, key risks, and mitigation strategies.`,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setResult(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2));
      }
    } catch {}
    setAnalyzing(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const decision = percentage >= 70 ? "GO" : percentage >= 50 ? "CONDITIONAL GO" : "NO-GO";
  const decisionColor = percentage >= 70 ? "text-emerald-400" : percentage >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Go/No-Go Decision Tool</h1>
        <p className="text-slate-400 mt-1">Structured framework for bid/no-bid decisions</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-slate-400 mb-1">Opportunity Title</label>
        <input type="text" value={oppTitle} onChange={e => setOppTitle(e.target.value)} placeholder="Enter opportunity name..." className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
      </div>

      <div className="space-y-3 mb-6">
        {CRITERIA.map(c => (
          <div key={c.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium">{c.label} <span className="text-xs text-slate-500">({c.weight}% weight)</span></p>
                <p className="text-xs text-slate-400">{c.desc}</p>
              </div>
              <span className="text-lg font-bold text-emerald-400 w-8 text-right">{scores[c.id] || 0}</span>
            </div>
            <input type="range" min={0} max={10} value={scores[c.id] || 0} onChange={e => setScores(prev => ({ ...prev, [c.id]: parseInt(e.target.value) }))} className="w-full accent-emerald-500" />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Low</span><span>High</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`p-6 bg-slate-900 border rounded-xl mb-6 text-center ${percentage >= 70 ? "border-emerald-800" : percentage >= 50 ? "border-yellow-800" : "border-red-800"}`}>
        <p className="text-sm text-slate-400 mb-1">Weighted Score</p>
        <p className="text-4xl font-bold mb-1">{percentage}%</p>
        <p className={`text-2xl font-bold ${decisionColor}`}>{decision}</p>
        <p className="text-xs text-slate-500 mt-2">70%+ = GO | 50-69% = Conditional | Below 50% = NO-GO</p>
      </div>

      <button onClick={getAIRecommendation} disabled={analyzing || Object.keys(scores).length < 3} className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium mb-6">
        {analyzing ? "Analyzing..." : "Get AI Recommendation"}
      </button>

      {result && (
        <div className="p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <h2 className="font-semibold text-emerald-400 mb-3">AI Recommendation</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{result}</pre>
        </div>
      )}
    </div>
  );
}
