"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AgencySpendingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [agency, setAgency] = useState("");
  const [results, setResults] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
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

  async function searchSpending(agencyName: string) {
    const q = agencyName || agency;
    if (!q.trim()) return;
    setSearching(true);
    setResults(null);
    try {
      const res = await fetch(`${API}/api/market/agencies/${encodeURIComponent(q)}/spending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setResults(typeof d === "string" ? d : JSON.stringify(d, null, 2));
      } else {
        const res2 = await fetch(`${API}/api/agents/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ agent_type: "market", message: `Analyze federal spending data for ${q}. Include total obligations, top contract categories, small business set-aside spending, and year-over-year trends.` }),
        });
        if (res2.ok) {
          const d2 = await res2.json();
          setResults(typeof d2.response === "string" ? d2.response : JSON.stringify(d2.response || d2, null, 2));
        }
      }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const TOP_AGENCIES = [
    { name: "Department of Defense", abbr: "DoD" },
    { name: "Department of Veterans Affairs", abbr: "VA" },
    { name: "Department of Health and Human Services", abbr: "HHS" },
    { name: "General Services Administration", abbr: "GSA" },
    { name: "Department of Homeland Security", abbr: "DHS" },
    { name: "Department of Energy", abbr: "DOE" },
    { name: "National Aeronautics and Space Administration", abbr: "NASA" },
    { name: "Department of the Treasury", abbr: "Treasury" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Agency Spending Analysis</h1>
        <p className="text-slate-400 mt-1">Research federal agency procurement budgets and spending patterns</p>
      </div>

      <div className="flex gap-3 mb-6">
        <input type="text" value={agency} onChange={e => setAgency(e.target.value)} onKeyDown={e => e.key === "Enter" && searchSpending("")} placeholder="Enter agency name..." className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
        <button onClick={() => searchSpending("")} disabled={searching} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-sm">
          {searching ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      <div className="mb-6">
        <p className="text-xs text-slate-400 mb-2">Quick Select:</p>
        <div className="flex flex-wrap gap-2">
          {TOP_AGENCIES.map(a => (
            <button key={a.abbr} onClick={() => { setAgency(a.name); searchSpending(a.name); }} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs hover:border-emerald-600 transition-colors">
              {a.abbr}
            </button>
          ))}
        </div>
      </div>

      {results ? (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold text-emerald-400 mb-3">Spending Analysis: {agency}</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{results}</pre>
        </div>
      ) : (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-slate-400">Enter an agency name to analyze spending data</p>
          <p className="text-xs text-slate-500 mt-1">Data sourced from USASpending.gov and FPDS</p>
        </div>
      )}
    </div>
  );
}
