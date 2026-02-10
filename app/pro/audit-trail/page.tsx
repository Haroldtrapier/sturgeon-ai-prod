"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AuditEntry {
  id: string;
  action: string;
  resource: string;
  user_email: string;
  details: string;
  created_at: string;
}

export default function ProAuditTrailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (data) setEntries(data as AuditEntry[]);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const ACTIONS = ["all", "proposal_created", "proposal_submitted", "opportunity_saved", "profile_updated", "export", "login", "settings_changed"];

  const filtered = entries.filter(e => filter === "all" || e.action === filter);

  const actionColor = (a: string) => {
    if (a.includes("created") || a.includes("login")) return "bg-emerald-900/50 text-emerald-400";
    if (a.includes("submitted") || a.includes("export")) return "bg-blue-900/50 text-blue-400";
    if (a.includes("updated") || a.includes("changed")) return "bg-yellow-900/50 text-yellow-400";
    if (a.includes("deleted")) return "bg-red-900/50 text-red-400";
    return "bg-slate-700 text-slate-400";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audit Trail</h1>
        <p className="text-slate-400 mt-1">Complete activity log for compliance and accountability</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {ACTIONS.map(a => (
          <button key={a} onClick={() => setFilter(a)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === a ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
            {a === "all" ? "All" : a.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No audit entries found</div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {filtered.map(entry => (
              <div key={entry.id} className="px-4 py-3 flex items-center gap-4">
                <div className="text-xs text-slate-500 w-36 shrink-0">{new Date(entry.created_at).toLocaleString()}</div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${actionColor(entry.action)}`}>
                  {entry.action?.replace(/_/g, " ")}
                </span>
                <div className="flex-1 text-sm text-slate-300 truncate">{entry.resource || entry.details || "—"}</div>
                <div className="text-xs text-slate-500 shrink-0">{entry.user_email || "System"}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-4">Showing {filtered.length} entries. Audit trail is available on Professional and Enterprise plans.</p>
    </div>
  );
}
