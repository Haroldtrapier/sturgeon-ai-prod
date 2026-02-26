"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      const userId = session.user.id;

      const [proposalsRes, oppsRes, certsRes, notifsRes] = await Promise.all([
        supabase.from("proposals").select("id, status, title, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
        supabase.from("saved_opportunities").select("id, title, response_deadline, match_score").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
        supabase.from("certifications").select("id, type, status, expiration_date").eq("user_id", userId),
        supabase.from("notifications").select("id, title, type, created_at, read").eq("user_id", userId).eq("read", false).order("created_at", { ascending: false }).limit(5),
      ]);

      const proposals = proposalsRes.data || [];
      const opps = oppsRes.data || [];
      const certs = certsRes.data || [];
      const notifs = notifsRes.data || [];

      setStats({
        total_proposals: proposals.length,
        draft_proposals: proposals.filter(p => p.status === "draft").length,
        submitted_proposals: proposals.filter(p => p.status === "submitted").length,
        saved_opportunities: opps.length,
        active_certs: certs.filter(c => c.status === "active").length,
        unread_notifications: notifs.length,
      });

      setRecentActivity([
        ...proposals.slice(0, 3).map(p => ({ type: "proposal", title: p.title || "Untitled Proposal", status: p.status, date: p.created_at })),
        ...opps.slice(0, 3).map(o => ({ type: "opportunity", title: o.title || "Saved Opportunity", status: `${o.match_score || 0}% match`, date: o.response_deadline })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5));

      setUpcomingDeadlines(opps.filter(o => o.response_deadline && new Date(o.response_deadline) > new Date()).sort((a, b) => new Date(a.response_deadline).getTime() - new Date(b.response_deadline).getTime()).slice(0, 5));

      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const quickLinks = [
    { label: "Search Opportunities", href: "/opportunities", color: "bg-blue-600" },
    { label: "Create Proposal", href: "/proposals", color: "bg-emerald-600" },
    { label: "AI Chat", href: "/chat", color: "bg-purple-600" },
    { label: "Compliance Check", href: "/compliance", color: "bg-amber-600" },
    { label: "Market Intel", href: "/market-intelligence", color: "bg-cyan-600" },
    { label: "ContractMatch", href: "/contract-match", color: "bg-red-600" },
    { label: "Certifications", href: "/certifications", color: "bg-indigo-600" },
    { label: "Settings", href: "/settings", color: "bg-slate-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back to Sturgeon AI</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { label: "Proposals", value: stats.total_proposals || 0, color: "text-blue-400" },
          { label: "Drafts", value: stats.draft_proposals || 0, color: "text-amber-400" },
          { label: "Submitted", value: stats.submitted_proposals || 0, color: "text-emerald-400" },
          { label: "Saved Opps", value: stats.saved_opportunities || 0, color: "text-purple-400" },
          { label: "Active Certs", value: stats.active_certs || 0, color: "text-cyan-400" },
          { label: "Notifications", value: stats.unread_notifications || 0, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {quickLinks.map(link => (
          <button key={link.label} onClick={() => router.push(link.href)} className={`p-4 ${link.color} rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity`}>{link.label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Activity</h2>
            <button onClick={() => router.push("/dashboard/activity")} className="text-xs text-emerald-400 hover:underline">View All</button>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">{recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${a.type === "proposal" ? "bg-blue-500" : "bg-purple-500"}`} />
                  <div><p className="text-sm">{a.title}</p><p className="text-xs text-slate-500 capitalize">{a.type} &middot; {a.status}</p></div>
                </div>
                <span className="text-xs text-slate-500">{a.date ? new Date(a.date).toLocaleDateString() : ""}</span>
              </div>
            ))}</div>
          ) : <p className="text-sm text-slate-400">No recent activity</p>}
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Upcoming Deadlines</h2>
            <button onClick={() => router.push("/dashboard/calendar")} className="text-xs text-emerald-400 hover:underline">View Calendar</button>
          </div>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">{upcomingDeadlines.map((d, i) => {
              const daysLeft = Math.ceil((new Date(d.response_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                  <p className="text-sm flex-1 truncate mr-3">{d.title}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${daysLeft <= 3 ? "bg-red-900/30 text-red-400" : daysLeft <= 7 ? "bg-amber-900/30 text-amber-400" : "bg-emerald-900/30 text-emerald-400"}`}>{daysLeft}d left</span>
                </div>
              );
            })}</div>
          ) : <p className="text-sm text-slate-400">No upcoming deadlines</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Analytics", href: "/dashboard/analytics", desc: "Performance metrics" },
          { label: "Pipeline", href: "/dashboard/pipeline", desc: "Proposal pipeline" },
          { label: "Activity Feed", href: "/dashboard/activity", desc: "Recent actions" },
          { label: "Calendar", href: "/dashboard/calendar", desc: "Deadline tracker" },
        ].map(link => (
          <button key={link.label} onClick={() => router.push(link.href)} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-slate-700 transition-colors">
            <p className="font-medium text-sm">{link.label}</p>
            <p className="text-xs text-slate-400 mt-1">{link.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
