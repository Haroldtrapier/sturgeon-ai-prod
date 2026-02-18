"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ContractMatchPage() {
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
      setLoading(false);
    };
    init();
  }, [router]);

  async function runMatch() {
    setRunning(true);
    try {
      const res = await fetch(`${API}/api/opportunities/match`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({}) });
      if (res.ok) { const d = await res.json(); setMatches(d.matches || d.opportunities || []); }
    } catch {}
    setRunning(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">ContractMatch</h1><p className="text-slate-400 mt-1">AI-powered opportunity matching based on your company profile</p></div>
        <button onClick={runMatch} disabled={running} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{running ? "Matching..." : "Run Match Engine"}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/contract-match/config" className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-600 transition-colors"><h3 className="font-semibold text-emerald-400">Configure Matching</h3><p className="text-xs text-slate-400 mt-1">Set your NAICS, keywords, agency preferences</p></Link>
        <Link href="/contract-match/history" className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-600 transition-colors"><h3 className="font-semibold text-blue-400">Match History</h3><p className="text-xs text-slate-400 mt-1">View past match results</p></Link>
        <Link href="/opportunities/go-no-go" className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-purple-600 transition-colors"><h3 className="font-semibold text-purple-400">GO/NO-GO</h3><p className="text-xs text-slate-400 mt-1">AI bid decision analysis</p></Link>
      </div>
      {matches.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{matches.length} Matches Found</h2>
          {matches.map((m, i) => (
            <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0"><h3 className="font-medium text-sm truncate">{m.title}</h3><p className="text-xs text-slate-400 mt-1">{m.agency_name || m.agency}</p></div>
                <div className="text-right ml-4"><p className="text-lg font-bold text-emerald-400">{m.match_score || m.score || "--"}%</p><p className="text-xs text-slate-500">Match</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {matches.length === 0 && !running && <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">Click "Run Match Engine" to find opportunities matching your profile</p></div>}
    </div>
  );
}
