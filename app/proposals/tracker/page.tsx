"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Proposal {
  id: string;
  title: string;
  status: string;
  agency: string;
  deadline: string;
  updated_at: string;
}

export default function ProposalTrackerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase
        .from("proposals")
        .select("*, opportunities(title, agency, deadline)")
        .eq("user_id", session.user.id)
        .order("updated_at", { ascending: false });

      if (data) {
        setProposals(data.map(p => ({
          id: p.id,
          title: p.title || "Untitled",
          status: p.status || "draft",
          agency: p.opportunities?.agency || "",
          deadline: p.opportunities?.deadline || p.deadline || "",
          updated_at: p.updated_at || "",
        })));
      }
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const COLUMNS = [
    { id: "draft", label: "Draft", color: "border-slate-600" },
    { id: "in_progress", label: "In Progress", color: "border-blue-600" },
    { id: "review", label: "In Review", color: "border-yellow-600" },
    { id: "submitted", label: "Submitted", color: "border-emerald-600" },
    { id: "won", label: "Won", color: "border-purple-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Proposal Tracker</h1>
          <p className="text-slate-400 mt-1">Kanban view of your proposal pipeline</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push("/proposals/library")} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm hover:bg-slate-700">List View</button>
          <button onClick={() => router.push("/proposals/create")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">+ New Proposal</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{proposals.length}</p>
          <p className="text-xs text-slate-400">Total Proposals</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-400">{proposals.filter(p => ["draft", "in_progress", "review"].includes(p.status)).length}</p>
          <p className="text-xs text-slate-400">Active</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {proposals.filter(p => p.deadline && new Date(p.deadline) > new Date() && new Date(p.deadline) < new Date(Date.now() + 7 * 86400000)).length}
          </p>
          <p className="text-xs text-slate-400">Due This Week</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colProposals = proposals.filter(p => p.status === col.id);
          return (
            <div key={col.id} className={`min-w-[250px] flex-1 border-t-2 ${col.color}`}>
              <div className="flex items-center justify-between px-2 py-3">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{colProposals.length}</span>
              </div>
              <div className="space-y-2">
                {colProposals.length === 0 ? (
                  <div className="p-4 bg-slate-900/50 border border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-500">
                    No proposals
                  </div>
                ) : colProposals.map(p => (
                  <button key={p.id} onClick={() => router.push(`/proposals/editor?proposal_id=${p.id}`)} className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-left hover:border-emerald-800 transition-colors">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    {p.agency && <p className="text-xs text-slate-400 mt-1">{p.agency}</p>}
                    {p.deadline && (
                      <p className={`text-xs mt-1 ${new Date(p.deadline) < new Date() ? "text-red-400" : new Date(p.deadline) < new Date(Date.now() + 3 * 86400000) ? "text-yellow-400" : "text-slate-500"}`}>
                        Due: {new Date(p.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
