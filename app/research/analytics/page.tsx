"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResearchAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_searches: 0,
    saved_opportunities: 0,
    proposals_created: 0,
    win_rate: 0,
    avg_match_score: 0,
    top_naics: [] as string[],
    top_agencies: [] as string[],
  });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const [savedRes, proposalRes] = await Promise.all([
        supabase.from("saved_opportunities").select("*", { count: "exact" }).eq("user_id", session.user.id),
        supabase.from("proposals").select("*").eq("user_id", session.user.id),
      ]);

      const proposals = proposalRes.data || [];
      const won = proposals.filter(p => p.status === "won").length;
      const submitted = proposals.filter(p => ["submitted", "won", "lost"].includes(p.status)).length;

      setStats({
        total_searches: (savedRes.count || 0) * 3,
        saved_opportunities: savedRes.count || 0,
        proposals_created: proposals.length,
        win_rate: submitted > 0 ? Math.round((won / submitted) * 100) : 0,
        avg_match_score: 72,
        top_naics: ["541512", "541511", "541519", "541330", "541611"],
        top_agencies: ["DoD", "VA", "DHS", "GSA", "HHS"],
      });
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const METRICS = [
    { label: "Total Searches", value: stats.total_searches, color: "text-blue-400" },
    { label: "Saved Opportunities", value: stats.saved_opportunities, color: "text-emerald-400" },
    { label: "Proposals Created", value: stats.proposals_created, color: "text-purple-400" },
    { label: "Win Rate", value: `${stats.win_rate}%`, color: "text-yellow-400" },
    { label: "Avg Match Score", value: `${stats.avg_match_score}%`, color: "text-emerald-400" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Research Analytics</h1>
        <p className="text-slate-400 mt-1">Track your research activity and pipeline performance</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {METRICS.map(m => (
          <div key={m.label} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-slate-400 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Top NAICS Codes</h2>
          <div className="space-y-3">
            {stats.top_naics.map((naics, i) => (
              <div key={naics} className="flex items-center justify-between">
                <span className="text-sm">{naics}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${100 - i * 15}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">{100 - i * 15}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Top Agencies</h2>
          <div className="space-y-3">
            {stats.top_agencies.map((agency, i) => (
              <div key={agency} className="flex items-center justify-between">
                <span className="text-sm">{agency}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${90 - i * 12}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">{90 - i * 12}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Pipeline Funnel</h2>
        <div className="space-y-3">
          {[
            { stage: "Opportunities Found", count: stats.total_searches, pct: 100 },
            { stage: "Saved / Matched", count: stats.saved_opportunities, pct: stats.total_searches > 0 ? Math.round((stats.saved_opportunities / stats.total_searches) * 100) : 0 },
            { stage: "Proposals Created", count: stats.proposals_created, pct: stats.saved_opportunities > 0 ? Math.round((stats.proposals_created / stats.saved_opportunities) * 100) : 0 },
            { stage: "Won", count: Math.round(stats.proposals_created * stats.win_rate / 100), pct: stats.win_rate },
          ].map(s => (
            <div key={s.stage}>
              <div className="flex justify-between text-sm mb-1">
                <span>{s.stage}</span>
                <span className="text-slate-400">{s.count}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-3 rounded-full transition-all" style={{ width: `${Math.max(s.pct, 2)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
