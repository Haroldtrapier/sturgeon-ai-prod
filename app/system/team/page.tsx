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
  last_active: string;
}

export default function TeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("analyst");
  const [inviting, setInviting] = useState(false);
  const [token, setToken] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);

      const { data } = await supabase
        .from("user_profiles")
        .select("id, email, full_name, role, subscription_status, updated_at")
        .order("created_at", { ascending: false });
      if (data) {
        setMembers(data.map(u => ({
          id: u.id,
          email: u.email || "",
          full_name: u.full_name || "",
          role: u.role || "viewer",
          status: u.subscription_status || "active",
          last_active: u.updated_at || "",
        })));
      }
      setLoading(false);
    };
    init();
  }, [router]);

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch(`${API}/api/system/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) { setInviteEmail(""); }
    } catch {}
    setInviting(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-slate-400 mt-1">Manage team members and access</p>
      </div>

      <form onSubmit={inviteMember} className="mb-8 p-6 bg-slate-900 border border-emerald-800 rounded-xl">
        <h2 className="text-lg font-semibold mb-3">Invite Team Member</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address" className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
          <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </select>
          <button type="submit" disabled={inviting} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium">
            {inviting ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{members.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Members</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-400">{members.filter(m => m.role === "admin").length}</p>
          <p className="text-xs text-slate-400 mt-1">Admins</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-purple-400">{members.filter(m => m.status === "active").length}</p>
          <p className="text-xs text-slate-400 mt-1">Active</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-800">
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No team members found</td></tr>
            ) : members.map(m => (
              <tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-200">{m.full_name || "—"}</p>
                  <p className="text-xs text-slate-400">{m.email}</p>
                </td>
                <td className="px-4 py-3 capitalize text-slate-300">{m.role}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${m.status === "active" ? "bg-emerald-900/50 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{m.last_active ? new Date(m.last_active).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 mt-4">Team features require Professional plan or higher. Enterprise plans support unlimited team members.</p>
    </div>
  );
}
