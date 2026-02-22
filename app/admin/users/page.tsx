"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminUsersPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      try {
        const res = await fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (res.ok) { const d = await res.json(); setUsers(d.users || []); }
      } catch {}
      setLoading(false);
    };
    init();
  }, [router, API]);

  const filtered = users.filter(u => !search || (u.email || "").toLowerCase().includes(search.toLowerCase()) || (u.company_name || "").toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">User Management</h1><p className="text-stone-500 mt-1">Manage platform users and subscriptions</p></div>
        <button onClick={() => router.push("/admin")} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm hover:bg-stone-200">Back to Admin</button>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center"><p className="text-2xl font-bold text-lime-700">{users.length}</p><p className="text-xs text-stone-500 mt-1">Total Users</p></div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center"><p className="text-2xl font-bold text-blue-600">{users.filter(u => u.subscription_tier === "pro").length}</p><p className="text-xs text-stone-500 mt-1">Pro Users</p></div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center"><p className="text-2xl font-bold text-purple-600">{users.filter(u => u.subscription_tier === "enterprise").length}</p><p className="text-xs text-stone-500 mt-1">Enterprise</p></div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center"><p className="text-2xl font-bold text-stone-500">{users.filter(u => !u.subscription_tier || u.subscription_tier === "free").length}</p><p className="text-xs text-stone-500 mt-1">Free Tier</p></div>
      </div>
      <div className="mb-4">
        <input type="text" placeholder="Search by email or company..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-4 py-2 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm" />
      </div>
      {filtered.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-stone-500 border-b border-stone-200">
              <th className="pb-3 pr-4">Email</th><th className="pb-3 pr-4">Company</th><th className="pb-3 pr-4">Plan</th><th className="pb-3 pr-4">NAICS</th><th className="pb-3 text-right">Joined</th>
            </tr></thead>
            <tbody>{filtered.map((u, i) => (
              <tr key={i} className="border-b border-stone-200">
                <td className="py-3 pr-4">{u.email || "—"}</td>
                <td className="py-3 pr-4 text-stone-500">{u.company_name || "—"}</td>
                <td className="py-3 pr-4"><span className={`px-2 py-0.5 rounded text-xs font-medium ${u.subscription_tier === "pro" ? "bg-blue-50 text-blue-600" : u.subscription_tier === "enterprise" ? "bg-purple-50 text-purple-600" : "bg-stone-100 text-stone-500"}`}>{u.subscription_tier || "free"}</span></td>
                <td className="py-3 pr-4 text-stone-500 text-xs">{(u.naics_codes || []).join(", ") || "—"}</td>
                <td className="py-3 text-right text-stone-8000">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-stone-200 rounded-xl"><p className="text-stone-500">{users.length === 0 ? "No users found" : "No matching users"}</p></div>
      )}
    </div>
  );
}
