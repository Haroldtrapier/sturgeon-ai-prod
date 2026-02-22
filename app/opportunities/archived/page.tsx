"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ArchivedOpp {
  id: string;
  title: string;
  agency: string;
  deadline: string;
  status: string;
  match_score: number;
  archived_at: string;
}

export default function ArchivedOpportunitiesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<ArchivedOpp[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase
        .from("saved_opportunities")
        .select("*, opportunities(*)")
        .eq("user_id", session.user.id)
        .eq("status", "archived")
        .order("updated_at", { ascending: false });

      if (data) {
        setOpportunities(data.map(s => ({
          id: s.opportunities?.id || s.opportunity_id || s.id,
          title: s.opportunities?.title || s.title || "Untitled",
          agency: s.opportunities?.agency || s.agency || "",
          deadline: s.opportunities?.deadline || s.deadline || "",
          status: "archived",
          match_score: s.match_score || 0,
          archived_at: s.updated_at || "",
        })));
      }
      setLoading(false);
    };
    init();
  }, [router]);

  async function restoreOpportunity(id: string) {
    const supabase = createClient();
    await supabase.from("saved_opportunities")
      .update({ status: "active" })
      .eq("opportunity_id", id);
    setOpportunities(prev => prev.filter(o => o.id !== id));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  const filtered = opportunities.filter(o =>
    !filter || o.title.toLowerCase().includes(filter.toLowerCase()) || o.agency.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Archived Opportunities</h1>
        <p className="text-stone-500 mt-1">Expired or dismissed opportunities</p>
      </div>

      <input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search archived opportunities..." className="w-full px-4 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm mb-6" />

      <p className="text-sm text-stone-500 mb-4">{filtered.length} archived opportunit{filtered.length === 1 ? "y" : "ies"}</p>

      {filtered.length === 0 ? (
        <div className="p-12 bg-white border border-stone-200 rounded-xl text-center">
          <p className="text-stone-500">No archived opportunities</p>
          <button onClick={() => router.push("/opportunities")} className="mt-4 px-4 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 text-sm">Browse Opportunities</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(o => (
            <div key={o.id} className="p-4 bg-white border border-stone-200 rounded-xl opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{o.title}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-stone-200 text-stone-500">Archived</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-stone-500">
                {o.agency && <span>{o.agency}</span>}
                {o.deadline && <span>Deadline: {new Date(o.deadline).toLocaleDateString()}</span>}
                {o.match_score > 0 && <span>Match: {o.match_score}%</span>}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => router.push(`/opportunities/${o.id}`)} className="px-3 py-1.5 bg-stone-100 border border-stone-300 rounded text-xs hover:bg-stone-200">View</button>
                <button onClick={() => restoreOpportunity(o.id)} className="px-3 py-1.5 bg-lime-700/20 border border-lime-200 text-lime-700 rounded text-xs hover:bg-lime-700/30">Restore</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
