"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CompetitorResearchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [results, setResults] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [savedCompetitors, setSavedCompetitors] = useState<string[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);

      const { data } = await supabase
        .from("user_profiles")
        .select("settings")
        .eq("id", session.user.id)
        .single();
      if (data?.settings?.competitors) setSavedCompetitors(data.settings.competitors);
      setLoading(false);
    };
    init();
  }, [router]);

  async function searchCompetitor(name?: string) {
    const q = name || companyName;
    if (!q.trim()) return;
    setSearching(true);
    setResults(null);
    try {
      const res = await fetch(`${API}/api/market/vendors/search?name=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        if (d.vendors?.length > 0) {
          setResults(JSON.stringify(d.vendors.slice(0, 5), null, 2));
          return;
        }
      }
      const res2 = await fetch(`${API}/api/agents/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agent_type: "research", message: `Research this government contractor as a competitor: "${q}". Include their contract history, key agencies, NAICS codes, certifications, estimated revenue, and competitive strengths/weaknesses.` }),
      });
      if (res2.ok) {
        const d2 = await res2.json();
        setResults(typeof d2.response === "string" ? d2.response : JSON.stringify(d2.response || d2, null, 2));
      }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Competitor Analysis</h1>
        <p className="text-slate-400 mt-1">Research competitors and their government contracting history</p>
      </div>

      <div className="flex gap-3 mb-6">
        <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} onKeyDown={e => e.key === "Enter" && searchCompetitor()} placeholder="Enter competitor company name..." className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
        <button onClick={() => searchCompetitor()} disabled={searching} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-sm">
          {searching ? "Researching..." : "Research"}
        </button>
      </div>

      {savedCompetitors.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-slate-400 mb-2">Saved Competitors:</p>
          <div className="flex flex-wrap gap-2">
            {savedCompetitors.map(c => (
              <button key={c} onClick={() => { setCompanyName(c); searchCompetitor(c); }} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs hover:border-emerald-600 transition-colors">{c}</button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Contract Awards", desc: "Search FPDS for competitor contract history", action: () => router.push("/research/past-performance") },
          { title: "Agency Spending", desc: "See which agencies they work with", action: () => router.push("/research/agency-spending") },
          { title: "Market Position", desc: "Analyze market share and positioning", action: () => router.push("/research/market-research") },
        ].map(card => (
          <button key={card.title} onClick={card.action} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-emerald-600 transition-colors">
            <h3 className="font-semibold text-sm text-emerald-400">{card.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
          </button>
        ))}
      </div>

      {results ? (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold text-emerald-400 mb-3">Analysis: {companyName}</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{results}</pre>
        </div>
      ) : (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-slate-400">Enter a company name to research their government contracting activity</p>
          <p className="text-xs text-slate-500 mt-1">Data sourced from FPDS, USASpending.gov, and SAM.gov</p>
        </div>
      )}
    </div>
  );
}
