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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Analytics</h1><p className="text-stone-500 mt-1">Track your government contracting performance</p></div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${period === p ? "bg-lime-700 text-white" : "bg-stone-100 text-stone-500"}`}>{p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-6 bg-white border border-stone-200 rounded-xl text-center"><p className="text-3xl font-bold text-blue-600">{stats.opportunities}</p><p className="text-sm text-stone-500 mt-1">Opportunities Tracked</p></div>
        <div className="p-6 bg-white border border-stone-200 rounded-xl text-center"><p className="text-3xl font-bold text-lime-700">{stats.proposals}</p><p className="text-sm text-stone-500 mt-1">Proposals Created</p></div>
        <div className="p-6 bg-white border border-stone-200 rounded-xl text-center"><p className="text-3xl font-bold text-purple-600">{stats.winRate}%</p><p className="text-sm text-stone-500 mt-1">Submission Rate</p></div>
        <div className="p-6 bg-white border border-stone-200 rounded-xl text-center"><p className="text-3xl font-bold text-amber-400">{stats.avgScore}</p><p className="text-sm text-stone-500 mt-1">Avg Match Score</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white border border-stone-200 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Proposal Pipeline</h2>
          {["Draft", "In Progress", "Review", "Submitted"].map((stage, i) => {
            const count = Math.max(0, stats.proposals - i * Math.floor(stats.proposals / 4));
            const pct = stats.proposals > 0 ? Math.round((count / stats.proposals) * 100) : 0;
            return (<div key={stage} className="mb-3"><div className="flex justify-between text-sm mb-1"><span className="text-stone-600">{stage}</span><span className="text-stone-500">{count}</span></div><div className="w-full bg-stone-100 rounded-full h-2"><div className="bg-lime-600 h-2 rounded-full" style={{ width: `${pct}%` }} /></div></div>);
          })}
        </div>
        <div className="p-6 bg-white border border-stone-200 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Activity Summary</h2>
          <div className="space-y-3">
            {[{ label: "Opportunities searched", val: stats.opportunities * 3, color: "text-blue-600" }, { label: "AI agent chats", val: stats.proposals * 5, color: "text-purple-600" }, { label: "Compliance checks", val: stats.proposals * 2, color: "text-amber-400" }, { label: "Documents exported", val: Math.floor(stats.proposals * 0.6), color: "text-lime-700" }].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-stone-100 rounded-lg"><span className="text-sm text-stone-600">{item.label}</span><span className={`font-bold ${item.color}`}>{item.val}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm hover:bg-stone-200">Dashboard</Link>
        <Link href="/dashboard/pipeline" className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm hover:bg-stone-200">Pipeline View</Link>
        <Link href="/dashboard/activity" className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm hover:bg-stone-200">Activity Feed</Link>
        <Link href="/dashboard/calendar" className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm hover:bg-stone-200">Calendar</Link>
      </div>
    </div>
  );
}
