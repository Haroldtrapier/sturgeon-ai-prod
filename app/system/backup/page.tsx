"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BackupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [backups, setBackups] = useState<{ id: string; type: string; status: string; size: string; created_at: string }[]>([]);
  const [creating, setCreating] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);

      const { data } = await supabase
        .from("backups")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setBackups(data);
      setLoading(false);
    };
    init();
  }, [router]);

  async function createBackup(type: string) {
    setCreating(true);
    try {
      const res = await fetch(`${API}/api/system/backup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const supabase = createClient();
        const { data } = await supabase.from("backups").select("*").order("created_at", { ascending: false }).limit(20);
        if (data) setBackups(data);
      }
    } catch {}
    setCreating(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  const BACKUP_TYPES = [
    { type: "full", title: "Full Backup", desc: "Complete database and file backup", icon: "💾" },
    { type: "proposals", title: "Proposals Only", desc: "All proposal documents and drafts", icon: "📄" },
    { type: "settings", title: "Settings & Config", desc: "User settings, filters, and preferences", icon: "⚙️" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Backup</h1>
        <p className="text-stone-500 mt-1">Manage and create backups of your data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {BACKUP_TYPES.map(b => (
          <div key={b.type} className="p-5 bg-white border border-stone-200 rounded-xl">
            <div className="text-2xl mb-2">{b.icon}</div>
            <h3 className="font-semibold text-sm">{b.title}</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">{b.desc}</p>
            <button onClick={() => createBackup(b.type)} disabled={creating} className="w-full px-4 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 text-sm font-medium">
              {creating ? "Creating..." : "Create Backup"}
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Backup History</h2>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone-500 border-b border-stone-200">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {backups.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-stone-8000">No backups yet. Create your first backup above.</td></tr>
            ) : backups.map(b => (
              <tr key={b.id} className="border-b border-stone-200">
                <td className="px-4 py-3 text-stone-600">{new Date(b.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{b.type}</td>
                <td className="px-4 py-3 text-stone-500">{b.size || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    b.status === "completed" ? "bg-lime-50 text-lime-700" :
                    b.status === "failed" ? "bg-red-50 text-red-600" :
                    "bg-yellow-50 text-yellow-600"
                  }`}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-white border border-stone-200 rounded-xl">
        <h3 className="text-sm font-semibold mb-2">Automatic Backups</h3>
        <p className="text-xs text-stone-500">Your data is automatically backed up daily. Enterprise plans include point-in-time recovery and 30-day retention.</p>
      </div>
    </div>
  );
}
