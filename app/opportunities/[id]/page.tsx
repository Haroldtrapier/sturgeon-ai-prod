"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function OpportunityDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [token, setToken] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      const { data } = await supabase.from("opportunities").select("*").eq("id", id).single();
      setOpp(data);
      setLoading(false);
    };
    init();
  }, [router, id]);

  async function runAnalysis() {
    setAnalyzing(true);
    try {
      const res = await fetch(`${API}/api/agents/analyze-opportunity`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ opportunity_id: id, opportunity_title: opp?.title, opportunity_agency: opp?.agency_name }) });
      if (res.ok) setAnalysis(await res.json());
    } catch {}
    setAnalyzing(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;
  if (!opp) return <div className="max-w-4xl mx-auto px-4 py-8"><p className="text-slate-400">Opportunity not found.</p></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/opportunities" className="text-sm text-slate-400 hover:text-emerald-400 mb-4 inline-block">&larr; Back to Opportunities</Link>
      <h1 className="text-2xl font-bold mb-2">{opp.title}</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        {opp.agency_name && <span className="px-3 py-1 bg-blue-600/10 text-blue-400 rounded-full text-xs">{opp.agency_name}</span>}
        {opp.naics_code && <span className="px-3 py-1 bg-purple-600/10 text-purple-400 rounded-full text-xs">NAICS: {opp.naics_code}</span>}
        {opp.type && <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">{opp.type}</span>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <h2 className="font-semibold">Details</h2>
          {[["Notice ID", opp.notice_id], ["Solicitation #", opp.solicitation_number], ["Posted", opp.posted_date ? new Date(opp.posted_date).toLocaleDateString() : "N/A"], ["Deadline", opp.response_deadline ? new Date(opp.response_deadline).toLocaleDateString() : "N/A"], ["PSC Code", opp.psc_code], ["Set-Aside", opp.set_aside]].map(([l, v]) => v && <div key={l as string} className="flex justify-between text-sm"><span className="text-slate-400">{l}</span><span>{v}</span></div>)}
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <h2 className="font-semibold">Actions</h2>
          <button onClick={runAnalysis} disabled={analyzing} className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium">{analyzing ? "Analyzing..." : "AI GO/NO-GO Analysis"}</button>
          <Link href={`/proposals?opp=${id}`} className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center">Create Proposal</Link>
          {opp.link_url && <a href={opp.link_url} target="_blank" rel="noopener noreferrer" className="block w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm font-medium text-center">View on SAM.gov</a>}
        </div>
      </div>
      {opp.description && <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl mb-8"><h2 className="font-semibold mb-3">Description</h2><p className="text-sm text-slate-300 whitespace-pre-wrap">{opp.description}</p></div>}
      {analysis && <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl"><h2 className="font-semibold mb-3 text-emerald-400">AI Analysis</h2><pre className="text-sm text-slate-300 whitespace-pre-wrap">{typeof analysis === "string" ? analysis : analysis.analysis || JSON.stringify(analysis, null, 2)}</pre></div>}
    </div>
  );
}
