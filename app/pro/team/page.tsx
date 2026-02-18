"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  proposals_count: number;
  last_active: string;
}

export default function ProTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState<"members" | "activity" | "settings">("members");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        setMembers(data.map(u => ({
          id: u.id,
          email: u.email || "",
          full_name: u.full_name || "",
          role: u.role || "member",
          status: u.subscription_status || "active",
          proposals_count: 0,
          last_active: u.updated_at || "",
        })));
      }
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const TABS = [
    { id: "members" as const, label: "Team Members" },
    { id: "activity" as const, label: "Activity" },
    { id: "settings" as const, label: "Team Settings" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-slate-400 mt-1">Manage your capture team and collaboration settings</p>
        </div>
        <button onClick={() => router.push("/system/team")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">Invite Member</button>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "members" && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <p className="text-2xl font-bold text-emerald-400">{members.length}</p>
              <p className="text-xs text-slate-400">Team Members</p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-400">{members.filter(m => m.status === "active").length}</p>
              <p className="text-xs text-slate-400">Active</p>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <p className="text-2xl font-bold text-purple-400">{members.filter(m => m.role === "admin").length}</p>
              <p className="text-xs text-slate-400">Admins</p>
            </div>
          </div>

          <div className="space-y-3">
            {members.map(m => (
              <div key={m.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {(m.full_name || m.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{m.full_name || "—"}</p>
                    <p className="text-xs text-slate-400">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium capitalize bg-slate-800 text-slate-300">{m.role}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${m.status === "active" ? "bg-emerald-900/50 text-emerald-400" : "bg-slate-700 text-slate-500"}`}>{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "activity" && (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-slate-400 mb-2">Team activity feed</p>
          <p className="text-xs text-slate-500">See proposal edits, reviews, and collaboration activity from your team members</p>
          <button onClick={() => router.push("/pro/audit-trail")} className="mt-4 px-4 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700">View Audit Trail</button>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-4">
          {[
            { label: "Require review before submission", desc: "All proposals must be reviewed by a manager before they can be submitted" },
            { label: "Auto-assign proposals", desc: "Automatically assign new proposals to team members based on workload" },
            { label: "Share opportunity watchlist", desc: "All team members can see the shared opportunity watchlist" },
            { label: "Enable real-time collaboration", desc: "Allow multiple team members to edit proposals simultaneously" },
          ].map(setting => (
            <div key={setting.label} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div>
                <p className="text-sm font-medium">{setting.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{setting.desc}</p>
              </div>
              <div className="w-11 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500 mt-6">Team features require Professional plan. Enterprise plans support unlimited team members with custom roles.</p>
    </div>
  );
}
