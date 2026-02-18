"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ActiveProposalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("proposals").select("*").eq("user_id", user.id).in("status", ["in_progress", "review", "submitted"]).order("updated_at", { ascending: false });
      setProposals(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const statusColors: Record<string, string> = { in_progress: "bg-blue-900/30 text-blue-400", review: "bg-amber-900/30 text-amber-400", submitted: "bg-emerald-900/30 text-emerald-400" };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Active Proposals</h1><p className="text-slate-400 mt-1">Proposals currently in progress, review, or submitted</p></div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-blue-400">{proposals.filter(p => p.status === "in_progress").length}</p><p className="text-xs text-slate-400 mt-1">In Progress</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-amber-400">{proposals.filter(p => p.status === "review").length}</p><p className="text-xs text-slate-400 mt-1">Under Review</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-400">{proposals.filter(p => p.status === "submitted").length}</p><p className="text-xs text-slate-400 mt-1">Submitted</p></div>
      </div>
      {proposals.length > 0 ? (
        <div className="space-y-3">{proposals.map(p => (
          <div key={p.id} onClick={() => router.push(`/proposals/${p.id}`)} className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium">{p.title || "Untitled"}</h3><p className="text-xs text-slate-400 mt-1">Updated {new Date(p.updated_at || p.created_at).toLocaleDateString()}{p.sections ? ` · ${p.sections.length} sections` : ""}</p></div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[p.status] || "bg-slate-800 text-slate-400"}`}>{p.status?.replace(/_/g, " ")}</span>
            </div>
          </div>
        ))}</div>
      ) : <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">No active proposals</p></div>}
    </div>
  );
}
