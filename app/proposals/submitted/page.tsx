"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Proposal {
  id: string;
  title: string;
  opportunity_id: string;
  status: string;
  submitted_at: string;
  deadline: string;
  agency: string;
}

export default function SubmittedProposalsPage() {
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
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "submitted")
        .order("updated_at", { ascending: false });
      if (data) setProposals(data.map(p => ({
        id: p.id,
        title: p.title || "Untitled Proposal",
        opportunity_id: p.opportunity_id || "",
        status: p.status,
        submitted_at: p.updated_at,
        deadline: p.deadline || "",
        agency: p.agency || "",
      })));
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Submitted Proposals</h1>
        <p className="text-slate-400 mt-1">Track proposals that have been submitted for evaluation</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{proposals.length}</p>
          <p className="text-xs text-slate-400">Total Submitted</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-400">{proposals.filter(p => !p.deadline || new Date(p.deadline) > new Date()).length}</p>
          <p className="text-xs text-slate-400">Pending Decision</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-purple-400">
            {proposals.length > 0 ? new Date(proposals[0].submitted_at).toLocaleDateString() : "—"}
          </p>
          <p className="text-xs text-slate-400">Last Submission</p>
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-slate-400">No proposals have been submitted yet</p>
          <button onClick={() => router.push("/proposals/active")} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">View Active Proposals</button>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map(p => (
            <div key={p.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-800 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{p.title}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-900/50 text-blue-400">Submitted</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                {p.agency && <span>Agency: {p.agency}</span>}
                {p.opportunity_id && <span>Opp: {p.opportunity_id}</span>}
                <span>Submitted: {new Date(p.submitted_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => router.push(`/proposals/editor?proposal_id=${p.id}`)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs hover:bg-slate-700">View Proposal</button>
                <button onClick={() => router.push(`/compliance/checklist?proposal_id=${p.id}`)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs hover:bg-slate-700">Compliance Check</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
