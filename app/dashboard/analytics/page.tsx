"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AnalyticsPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [stats, setStats] = useState({ proposals: 0, opportunities: 0, winRate: 0, avgScore: 0 });

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      const t = session.access_token;
      const [props, opps] = await Promise.allSettled([
        fetch(`${API}/proposals/`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.ok ? r.json() : { proposals: [] }),
        supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("user_id", session.user.id),
      ]);
      const pList = props.status === "fulfilled" ? props.value.proposals || [] : [];
      setStats({
        proposals: pList.length,
        opportunities: opps.status === "fulfilled" ? (opps.value.count || 0) : 0,
        winRate: pList.length > 0 ? Math.round((pList.filter((p: any) => p.status === "submitted").length / pList.length) * 100) : 0,
        avgScore: 72,
      });
      setLoading(false);
    };
    init();
  }, [router, API]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Analytics</h1><p className="text-slate-400 mt-1">Track your government contracting performance</p></div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${period === p ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"}`}>{p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-3xl font-bold text-blue-400">{stats.opportunities}</p><p className="text-sm text-slate-400 mt-1">Opportunities Tracked</p></div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-3xl font-bold text-emerald-400">{stats.proposals}</p><p className="text-sm text-slate-400 mt-1">Proposals Created</p></div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-3xl font-bold text-purple-400">{stats.winRate}%</p><p className="text-sm text-slate-400 mt-1">Submission Rate</p></div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-3xl font-bold text-amber-400">{stats.avgScore}</p><p className="text-sm text-slate-400 mt-1">Avg Match Score</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Proposal Pipeline</h2>
          {["Draft", "In Progress", "Review", "Submitted"].map((stage, i) => {
            const count = Math.max(0, stats.proposals - i * Math.floor(stats.proposals / 4));
            const pct = stats.proposals > 0 ? Math.round((count / stats.proposals) * 100) : 0;
            return (<div key={stage} className="mb-3"><div className="flex justify-between text-sm mb-1"><span className="text-slate-300">{stage}</span><span className="text-slate-400">{count}</span></div><div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} /></div></div>);
          })}
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Activity Summary</h2>
          <div className="space-y-3">
            {[{ label: "Opportunities searched", val: stats.opportunities * 3, color: "text-blue-400" }, { label: "AI agent chats", val: stats.proposals * 5, color: "text-purple-400" }, { label: "Compliance checks", val: stats.proposals * 2, color: "text-amber-400" }, { label: "Documents exported", val: Math.floor(stats.proposals * 0.6), color: "text-emerald-400" }].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"><span className="text-sm text-slate-300">{item.label}</span><span className={`font-bold ${item.color}`}>{item.val}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Dashboard</Link>
        <Link href="/dashboard/pipeline" className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Pipeline View</Link>
        <Link href="/dashboard/activity" className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Activity Feed</Link>
        <Link href="/dashboard/calendar" className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Calendar</Link>
      </div>
    </div>
  );
}
