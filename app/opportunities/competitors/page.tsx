"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OpportunityCompetitorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oppId = searchParams?.get("id");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [competitors, setCompetitors] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [naics, setNaics] = useState("");
  const [agency, setAgency] = useState("");
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

  async function searchCompetitors() {
    setSearching(true);
    setCompetitors(null);
    try {
      const context = [
        naics && `NAICS: ${naics}`,
        agency && `Agency: ${agency}`,
        oppId && `Opportunity ID: ${oppId}`,
      ].filter(Boolean).join(", ");

      const res = await fetch(`${API}/api/agents/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          agent_type: "research",
          message: `Identify likely competitors for a government contract opportunity. ${context || "General IT services contract"}. For each competitor, provide: company name, estimated size, relevant certifications, past contract wins with this agency, and competitive strengths. Also suggest differentiation strategies.`,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setCompetitors(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2));
      }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Opportunity Competitors</h1>
        <p className="text-slate-400 mt-1">Identify likely bidders and develop competitive strategies</p>
      </div>

      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">NAICS Code</label>
            <input type="text" value={naics} onChange={e => setNaics(e.target.value)} placeholder="e.g. 541512" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Agency</label>
            <input type="text" value={agency} onChange={e => setAgency(e.target.value)} placeholder="e.g. Department of Defense" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
          </div>
        </div>
        <button onClick={searchCompetitors} disabled={searching} className="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-sm">
          {searching ? "Identifying Competitors..." : "Identify Competitors"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Incumbent Analysis", desc: "Research current contract holders and their performance history" },
          { title: "Bid History", desc: "Track which companies bid on similar contracts" },
          { title: "Teaming Opportunities", desc: "Find potential partners to strengthen your bid" },
        ].map(card => (
          <div key={card.title} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="font-semibold text-sm text-emerald-400">{card.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {competitors ? (
        <div className="p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <h2 className="font-semibold text-emerald-400 mb-3">Competitor Intelligence</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{competitors}</pre>
        </div>
      ) : !searching && (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-slate-400">Enter NAICS code and/or agency to identify competitors</p>
          <p className="text-xs text-slate-500 mt-1">AI analyzes FPDS award data to identify likely bidders</p>
        </div>
      )}
    </div>
  );
}
