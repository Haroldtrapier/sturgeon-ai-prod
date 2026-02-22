"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AuditEntry {
  id: string;
  user_email: string;
  action: string;
  resource: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export default function AuditLogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) setLogs(data as AuditEntry[]);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  const ACTION_TYPES = ["all", "login", "create", "update", "delete", "export", "api_call"];

  const filtered = logs.filter(l => {
    const matchesAction = actionFilter === "all" || l.action === actionFilter;
    const matchesSearch = !filter || l.user_email?.toLowerCase().includes(filter.toLowerCase()) || l.resource?.toLowerCase().includes(filter.toLowerCase()) || l.details?.toLowerCase().includes(filter.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-stone-500 mt-1">Track all system activity and user actions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search logs..." className="flex-1 px-4 py-2 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm" />
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="px-4 py-2 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm">
          {ACTION_TYPES.map(a => <option key={a} value={a}>{a === "all" ? "All Actions" : a.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
        </select>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone-500 border-b border-stone-200">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-8000">No audit log entries found</td></tr>
              ) : filtered.map(log => (
                <tr key={log.id} className="border-b border-stone-200 hover:bg-stone-50">
                  <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-stone-600">{log.user_email || "System"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      log.action === "delete" ? "bg-red-50 text-red-600" :
                      log.action === "create" ? "bg-lime-50 text-lime-700" :
                      log.action === "login" ? "bg-blue-50 text-blue-600" :
                      "bg-stone-200 text-stone-600"
                    }`}>{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{log.resource}</td>
                  <td className="px-4 py-3 text-stone-500 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-stone-8000 mt-4">Showing {filtered.length} of {logs.length} entries. Logs are retained for 90 days.</p>
    </div>
  );
}
