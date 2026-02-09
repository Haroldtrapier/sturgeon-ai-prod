"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardReportsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const REPORT_TYPES = [
    { id: "pipeline", name: "Pipeline Summary", desc: "Overview of all active proposals, stages, and estimated values", icon: "P" },
    { id: "win_loss", name: "Win/Loss Analysis", desc: "Historical win rates by agency, NAICS, set-aside type", icon: "W" },
    { id: "compliance", name: "Compliance Status", desc: "Certification statuses, expiration dates, and required actions", icon: "C" },
    { id: "opportunity", name: "Opportunity Scorecard", desc: "Saved opportunities ranked by match score and deadline", icon: "O" },
    { id: "market", name: "Market Intelligence", desc: "Spending trends, competitor activity, and industry insights", icon: "M" },
    { id: "activity", name: "Activity Report", desc: "Team actions, proposal edits, and platform usage metrics", icon: "A" },
  ];

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

  async function generateReport(type: string) {
    setGenerating(type); setReport(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "general", message: `Generate a comprehensive ${type.replace(/_/g, " ")} report for my government contracting business. Include key metrics, trends, actionable recommendations, and areas requiring attention. Format as a professional executive briefing.` }) });
      if (res.ok) { const d = await res.json(); setReport(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setGenerating(null);
  }

  async function exportReport(format: "pdf" | "csv") {
    if (!report) return;
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `report-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Reports</h1><p className="text-slate-400 mt-1">Generate and export business intelligence reports</p></div>
      {report && (
        <div className="mb-8 p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-emerald-400">Generated Report</h2>
            <div className="flex gap-2">
              <button onClick={() => exportReport("pdf")} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Export</button>
              <button onClick={() => setReport(null)} className="text-slate-500 hover:text-white text-lg">&times;</button>
            </div>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{report}</pre>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map(r => (
          <div key={r.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-lg">{r.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{r.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
              </div>
            </div>
            <button onClick={() => generateReport(r.id)} disabled={generating !== null} className="mt-4 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50 font-medium">{generating === r.id ? "Generating..." : "Generate Report"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
