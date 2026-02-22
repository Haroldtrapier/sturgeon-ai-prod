"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DatabasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ table: string; count: number }[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const tables = [
        "user_profiles", "proposals", "proposal_sections", "opportunities",
        "saved_opportunities", "compliance_requirements", "certifications",
        "chat_sessions", "notifications", "support_tickets", "job_runs",
      ];

      const counts = await Promise.all(
        tables.map(async t => {
          try {
            const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
            return { table: t, count: count || 0 };
          } catch {
            return { table: t, count: -1 };
          }
        })
      );

      setStats(counts);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  const totalRows = stats.filter(s => s.count >= 0).reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Database Administration</h1>
        <p className="text-stone-500 mt-1">Monitor database tables and row counts</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
          <p className="text-2xl font-bold text-lime-700">{stats.length}</p>
          <p className="text-xs text-stone-500">Tables</p>
        </div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-600">{totalRows.toLocaleString()}</p>
          <p className="text-xs text-stone-500">Total Rows</p>
        </div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
          <p className="text-2xl font-bold text-lime-700">Supabase</p>
          <p className="text-xs text-stone-500">Provider</p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone-500 border-b border-stone-200">
              <th className="px-4 py-3">Table</th>
              <th className="px-4 py-3 text-right">Row Count</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <tr key={s.table} className="border-b border-stone-200 hover:bg-stone-50">
                <td className="px-4 py-3 font-mono text-xs">{s.table}</td>
                <td className="px-4 py-3 text-right">{s.count >= 0 ? s.count.toLocaleString() : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.count >= 0 ? "bg-lime-50 text-lime-700" : "bg-red-50 text-red-600"}`}>
                    {s.count >= 0 ? "OK" : "Error"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => router.push("/system/backup")} className="px-4 py-2 bg-stone-100 border border-stone-300 rounded-lg text-sm hover:bg-stone-200">Create Backup</button>
        <button onClick={() => router.push("/system/audit-log")} className="px-4 py-2 bg-stone-100 border border-stone-300 rounded-lg text-sm hover:bg-stone-200">View Audit Log</button>
      </div>

      <p className="text-xs text-stone-8000 mt-4">Database is managed by Supabase (PostgreSQL). Enterprise plans include direct SQL access and custom migrations.</p>
    </div>
  );
}
