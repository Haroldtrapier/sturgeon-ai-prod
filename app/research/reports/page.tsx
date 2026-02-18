"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResearchReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState("");
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

  async function generateReport(type: string, title: string) {
    setGenerating(type);
    setReport(null);
    setReportTitle(title);

    const prompts: Record<string, string> = {
      market_overview: "Generate a comprehensive market overview report for government IT contracting. Include market size, growth trends, top agencies by spend, key NAICS codes, and emerging opportunities.",
      competitive_landscape: "Generate a competitive landscape report for small business government contractors in IT services. Include market leaders, niche players, common teaming arrangements, and competitive strategies.",
      agency_analysis: "Generate an agency analysis report covering the top 10 federal agencies by IT spending. For each, include: total budget, key programs, procurement preferences, set-aside goals, and upcoming opportunities.",
      pricing_benchmark: "Generate a pricing benchmark report for government IT services contracts. Include labor category rates (GSA Schedule rates), comparison by agency, trends in pricing, and recommendations for competitive pricing strategies.",
      set_aside_analysis: "Generate a set-aside analysis report covering all federal small business set-aside categories. Include utilization rates, spending by category, top agencies for each set-aside, and strategic recommendations.",
      forecast: "Generate a procurement forecast report for the next 12 months. Include anticipated large IT procurements, recompete timelines, new program starts, and budget outlook by agency.",
    };

    try {
      const res = await fetch(`${API}/api/agents/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agent_type: "market", message: prompts[type] || prompts.market_overview }),
      });
      if (res.ok) {
        const d = await res.json();
        setReport(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2));
      }
    } catch {}
    setGenerating(null);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const REPORT_TYPES = [
    { id: "market_overview", title: "Market Overview", desc: "Comprehensive overview of the GovCon IT market", icon: "📈" },
    { id: "competitive_landscape", title: "Competitive Landscape", desc: "Analysis of competitors and market positioning", icon: "🏆" },
    { id: "agency_analysis", title: "Agency Analysis", desc: "Deep dive into top federal agencies by spending", icon: "🏛️" },
    { id: "pricing_benchmark", title: "Pricing Benchmark", desc: "Labor rates and pricing intelligence", icon: "💰" },
    { id: "set_aside_analysis", title: "Set-Aside Analysis", desc: "Utilization and opportunities by set-aside type", icon: "📋" },
    { id: "forecast", title: "Procurement Forecast", desc: "12-month outlook for upcoming procurements", icon: "🔮" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Research Reports</h1>
        <p className="text-slate-400 mt-1">Generate AI-powered market research reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {REPORT_TYPES.map(rt => (
          <button key={rt.id} onClick={() => generateReport(rt.id, rt.title)} disabled={generating !== null} className="p-5 bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-emerald-600 transition-colors disabled:opacity-50">
            <div className="text-2xl mb-2">{rt.icon}</div>
            <h3 className="font-semibold text-sm">{rt.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{rt.desc}</p>
            {generating === rt.id && <p className="text-xs text-emerald-400 mt-2">Generating...</p>}
          </button>
        ))}
      </div>

      {report && (
        <div className="p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-emerald-400">{reportTitle}</h2>
            <button onClick={() => navigator.clipboard.writeText(report)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs hover:bg-slate-700">Copy</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{report}</pre>
        </div>
      )}
    </div>
  );
}
