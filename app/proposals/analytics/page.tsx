"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProposalAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("proposals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setProposals(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  const total = proposals.length;
  const statusCounts: Record<string, number> = {};
  proposals.forEach(p => { statusCounts[p.status || "draft"] = (statusCounts[p.status || "draft"] || 0) + 1; });
  const submitted = statusCounts["submitted"] || 0;
  const won = statusCounts["won"] || 0;
  const lost = statusCounts["lost"] || 0;
  const winRate = submitted + won + lost > 0 ? Math.round((won / (won + lost || 1)) * 100) : 0;
  const avgSections = proposals.length > 0 ? Math.round(proposals.reduce((a, p) => a + (p.sections?.length || 0), 0) / proposals.length) : 0;

  const monthlyData: Record<string, number> = {};
  proposals.forEach(p => { const m = new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" }); monthlyData[m] = (monthlyData[m] || 0) + 1; });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Proposal Analytics</h1><p className="text-stone-500 mt-1">Track your proposal performance and trends</p></div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Total Proposals", value: total, color: "text-blue-600" },
          { label: "Submitted", value: submitted, color: "text-lime-700" },
          { label: "Won", value: won, color: "text-green-700" },
          { label: "Lost", value: lost, color: "text-red-600" },
          { label: "Win Rate", value: `${winRate}%`, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="p-4 bg-white border border-stone-200 rounded-xl text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white border border-stone-200 rounded-xl">
          <h2 className="font-semibold mb-4">Status Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <div className="w-24 text-sm capitalize text-stone-600">{status}</div>
                <div className="flex-1 bg-stone-100 rounded-full h-4 overflow-hidden"><div className="h-full bg-lime-700 rounded-full" style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }} /></div>
                <div className="w-8 text-sm text-stone-500 text-right">{count}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-white border border-stone-200 rounded-xl">
          <h2 className="font-semibold mb-4">Monthly Activity</h2>
          {Object.keys(monthlyData).length > 0 ? (
            <div className="space-y-2">{Object.entries(monthlyData).slice(-6).map(([month, count]) => (
              <div key={month} className="flex items-center justify-between py-2 border-b border-stone-200 last:border-0">
                <span className="text-sm text-stone-600">{month}</span>
                <span className="text-sm font-medium text-lime-700">{count} proposals</span>
              </div>
            ))}</div>
          ) : (<p className="text-sm text-stone-500">No proposal data yet</p>)}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center"><p className="text-2xl font-bold text-lime-700">{avgSections}</p><p className="text-xs text-stone-500 mt-1">Avg Sections/Proposal</p></div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center"><p className="text-2xl font-bold text-lime-700">{statusCounts["draft"] || 0}</p><p className="text-xs text-stone-500 mt-1">Drafts In Progress</p></div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center"><p className="text-2xl font-bold text-lime-700">{statusCounts["review"] || 0}</p><p className="text-xs text-stone-500 mt-1">Under Review</p></div>
      </div>
    </div>
  );
}
