"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MatchedOpportunitiesPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      const { data } = await supabase.from("saved_opportunities").select("*").eq("user_id", session.user.id).not("match_score", "is", null).order("match_score", { ascending: false });
      setMatches(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  async function runMatch() {
    setRunning(true);
    try {
      const res = await fetch(`${API}/api/opportunities/match`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const d = await res.json();
        if (d.matches) setMatches(d.matches);
      }
    } catch {}
    setRunning(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Matched Opportunities</h1><p className="text-slate-400 mt-1">AI-matched opportunities based on your profile</p></div>
        <button onClick={runMatch} disabled={running} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-sm">{running ? "Matching..." : "Run ContractMatch"}</button>
      </div>
      {matches.length > 0 ? (
        <div className="space-y-3">{matches.map((m, i) => (
          <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer" onClick={() => m.opportunity_id && router.push(`/opportunities/${m.opportunity_id}`)}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{m.title || "Matched Opportunity"}</h3>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                  {m.agency && <span>{m.agency}</span>}
                  {m.naics_code && <span>NAICS: {m.naics_code}</span>}
                  {m.set_aside && <span className="text-amber-400">{m.set_aside}</span>}
                  {m.response_deadline && <span>Due: {new Date(m.response_deadline).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className={`text-right ml-4`}>
                <p className={`text-2xl font-bold ${(m.match_score || 0) >= 80 ? "text-emerald-400" : (m.match_score || 0) >= 60 ? "text-amber-400" : "text-red-400"}`}>{m.match_score || 0}%</p>
                <p className="text-xs text-slate-500">match</p>
              </div>
            </div>
          </div>
        ))}</div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 mb-3">No matched opportunities yet</p>
          <button onClick={runMatch} disabled={running} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">{running ? "Running..." : "Run ContractMatch Engine"}</button>
        </div>
      )}
    </div>
  );
}
