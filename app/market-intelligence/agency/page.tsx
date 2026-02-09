"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AgencyDeepDivePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [agency, setAgency] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const AGENCIES = [
    { name: "Department of Defense", abbr: "DoD", budget: "$886B" },
    { name: "Department of Health and Human Services", abbr: "HHS", budget: "$127B" },
    { name: "Department of Veterans Affairs", abbr: "VA", budget: "$325B" },
    { name: "Department of Homeland Security", abbr: "DHS", budget: "$103B" },
    { name: "General Services Administration", abbr: "GSA", budget: "$42B" },
    { name: "Department of Energy", abbr: "DOE", budget: "$52B" },
    { name: "NASA", abbr: "NASA", budget: "$25B" },
    { name: "Department of Justice", abbr: "DOJ", budget: "$39B" },
    { name: "Department of the Treasury", abbr: "Treasury", budget: "$16B" },
    { name: "Department of Commerce", abbr: "DOC", budget: "$12B" },
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

  async function analyzeAgency(name: string) {
    setAgency(name);
    setAnalyzing(true); setAnalysis(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "market", message: `Provide a deep dive analysis of ${name} for small business government contractors. Include: 1) Contracting trends and priorities 2) Key offices and buying activities 3) Small business goals and achievement 4) Common contract vehicles 5) Best entry points for new contractors 6) Recent notable awards 7) Strategic recommendations.` }) });
      if (res.ok) { const d = await res.json(); setAnalysis(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setAnalyzing(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Agency Deep Dive</h1><p className="text-slate-400 mt-1">In-depth analysis of federal agency contracting patterns</p></div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {AGENCIES.map(a => (
          <button key={a.name} onClick={() => analyzeAgency(a.name)} disabled={analyzing} className={`p-4 bg-slate-900 border rounded-xl text-center hover:border-emerald-600 transition-colors ${agency === a.name ? "border-emerald-600" : "border-slate-800"}`}>
            <p className="font-bold text-emerald-400 text-lg">{a.abbr}</p>
            <p className="text-xs text-slate-400 mt-1">{a.budget}</p>
          </button>
        ))}
      </div>
      {analyzing && <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-3" /><p className="text-sm text-slate-400">Analyzing {agency}...</p></div>}
      {analysis && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">{agency} Analysis</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysis}</pre>
        </div>
      )}
    </div>
  );
}
