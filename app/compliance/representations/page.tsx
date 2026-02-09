"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RepresentationsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const REPS_CERTS = [
    { clause: "52.204-3", title: "Taxpayer Identification", desc: "TIN and business type certification", category: "Required" },
    { clause: "52.204-26", title: "Covered Telecommunications Equipment", desc: "Certification regarding banned telecom equipment", category: "Required" },
    { clause: "52.209-11", title: "Representation by Corporations Regarding Delinquent Tax Liability", desc: "Tax delinquency certification", category: "Required" },
    { clause: "52.212-3", title: "Offeror Representations and Certifications - Commercial Products", desc: "Comprehensive commercial items reps & certs", category: "Commercial" },
    { clause: "52.219-1", title: "Small Business Program Representations", desc: "SB size standard, NAICS, ownership certifications", category: "Small Business" },
    { clause: "52.222-22", title: "Previous Contracts and Compliance Reports", desc: "EEO compliance history", category: "Labor" },
    { clause: "52.222-25", title: "Affirmative Action Compliance", desc: "Affirmative action program representation", category: "Labor" },
    { clause: "52.225-2", title: "Buy American Certificate", desc: "Domestic preference certification", category: "Trade" },
    { clause: "52.225-6", title: "Trade Agreements Certificate", desc: "Trade agreement compliance", category: "Trade" },
    { clause: "52.226-2", title: "Historically Black College or University and Minority Institution Representation", desc: "HBCU/MI status", category: "Socioeconomic" },
    { clause: "252.204-7008", title: "Compliance with Safeguarding Covered Defense Info Controls", desc: "DFARS cybersecurity compliance", category: "DFARS" },
    { clause: "252.225-7000", title: "Buy American - Balance of Payments Program Certificate", desc: "DoD domestic preference", category: "DFARS" },
  ];

  const categories = Array.from(new Set(REPS_CERTS.map(r => r.category)));

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setToken(session.access_token); setLoading(false); }; init(); }, [router]);

  async function explainClause(clause: string, title: string) {
    setAsking(true); setGuidance(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "compliance", message: `Explain FAR/DFARS clause ${clause} "${title}" in detail. Include: what it requires, who must complete it, how to correctly respond, common mistakes, and implications of incorrect certification.` }) });
      if (res.ok) { const d = await res.json(); setGuidance(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setAsking(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Representations &amp; Certifications</h1><p className="text-slate-400 mt-1">Guide to required reps &amp; certs for federal proposals</p></div>
      {guidance && (
        <div className="mb-6 p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <div className="flex justify-between items-start mb-3"><h2 className="text-lg font-semibold text-emerald-400">AI Explanation</h2><button onClick={() => setGuidance(null)} className="text-slate-500 hover:text-white">&times;</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{guidance}</pre>
        </div>
      )}
      {categories.map(cat => (
        <div key={cat} className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-emerald-400">{cat}</h2>
          <div className="space-y-2">{REPS_CERTS.filter(r => r.category === cat).map(r => (
            <div key={r.clause} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
              <div><span className="text-xs font-mono text-emerald-400">{r.clause}</span><h3 className="text-sm font-medium mt-0.5">{r.title}</h3><p className="text-xs text-slate-400 mt-0.5">{r.desc}</p></div>
              <button onClick={() => explainClause(r.clause, r.title)} disabled={asking} className="ml-3 px-3 py-1 bg-emerald-600/10 text-emerald-400 rounded text-xs hover:bg-emerald-600/20 disabled:opacity-50 flex-shrink-0">Explain</button>
            </div>
          ))}</div>
        </div>
      ))}
    </div>
  );
}
