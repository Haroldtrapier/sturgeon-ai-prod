"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface HistoryEntry {
  id: string;
  proposal_id: string;
  proposal_title: string;
  action: string;
  user_email: string;
  details: string;
  created_at: string;
}

export default function ProposalHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams?.get("proposal_id");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      // Fetch proposal activity from audit logs
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (proposalId) {
        query = query.like("resource", `%${proposalId}%`);
      } else {
        query = query.or("action.like.%proposal%,resource.like.%proposal%");
      }

      const { data } = await query;
      if (data) {
        setEntries(data.map(d => ({
          id: d.id,
          proposal_id: d.resource_id || "",
          proposal_title: d.resource || "",
          action: d.action || "",
          user_email: d.user_email || "",
          details: d.details || "",
          created_at: d.created_at,
        })));
      }
      setLoading(false);
    };
    init();
  }, [router, proposalId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const actionIcon = (a: string) => {
    if (a.includes("created")) return { icon: "+", color: "text-emerald-400 bg-emerald-900/50" };
    if (a.includes("submitted")) return { icon: "→", color: "text-blue-400 bg-blue-900/50" };
    if (a.includes("edited") || a.includes("updated")) return { icon: "✎", color: "text-yellow-400 bg-yellow-900/50" };
    if (a.includes("generated")) return { icon: "✦", color: "text-purple-400 bg-purple-900/50" };
    if (a.includes("deleted")) return { icon: "×", color: "text-red-400 bg-red-900/50" };
    if (a.includes("reviewed")) return { icon: "✓", color: "text-cyan-400 bg-cyan-900/50" };
    return { icon: "•", color: "text-slate-400 bg-slate-700" };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Proposal History</h1>
        <p className="text-slate-400 mt-1">{proposalId ? "Version history for this proposal" : "Activity log across all proposals"}</p>
      </div>

      {entries.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-slate-400 mb-2">No history entries found</p>
          <p className="text-xs text-slate-500">Proposal creation, edits, reviews, and submissions will appear here</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-800" />
          <div className="space-y-4">
            {entries.map(entry => {
              const { icon, color } = actionIcon(entry.action);
              return (
                <div key={entry.id} className="flex gap-4 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 z-10 ${color}`}>
                    {icon}
                  </div>
                  <div className="flex-1 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{entry.action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                      <span className="text-xs text-slate-500">{new Date(entry.created_at).toLocaleString()}</span>
                    </div>
                    {entry.proposal_title && <p className="text-xs text-slate-400">{entry.proposal_title}</p>}
                    {entry.details && <p className="text-xs text-slate-500 mt-1">{entry.details}</p>}
                    {entry.user_email && <p className="text-xs text-slate-500 mt-1">by {entry.user_email}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
