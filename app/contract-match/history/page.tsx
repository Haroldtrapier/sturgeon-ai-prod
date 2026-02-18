"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MatchHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("opportunity_interactions").select("*, opportunities(title, agency_name)").eq("user_id", user.id).eq("interaction_type", "match").order("created_at", { ascending: false }).limit(50);
      setHistory(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Match History</h1><p className="text-slate-400 mt-1">Past ContractMatch results</p></div>
      {history.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">No match history yet. Run the ContractMatch engine to see results here.</p></div>
      ) : (
        <div className="space-y-3">{history.map((h, i) => (
          <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium text-sm">{h.opportunities?.title || "Opportunity"}</h3><p className="text-xs text-slate-400 mt-1">{h.opportunities?.agency_name}</p></div>
              <div className="text-right"><p className="text-sm font-bold text-emerald-400">{h.match_score || "--"}%</p><p className="text-xs text-slate-500">{new Date(h.created_at).toLocaleDateString()}</p></div>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
