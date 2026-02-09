"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProposalCollaborationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const [propRes, revRes] = await Promise.all([
        supabase.from("proposals").select("*").eq("user_id", user.id).in("status", ["review", "in_progress"]).order("updated_at", { ascending: false }),
        supabase.from("proposal_reviews").select("*").eq("reviewer_id", user.id).order("created_at", { ascending: false }).limit(20),
      ]);
      setProposals(propRes.data || []);
      setReviews(revRes.data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Collaboration</h1><p className="text-slate-400 mt-1">Manage proposal reviews and team collaboration</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Proposals Awaiting Review</h2>
          {proposals.filter(p => p.status === "review").length > 0 ? (
            <div className="space-y-3">{proposals.filter(p => p.status === "review").map(p => (
              <div key={p.id} onClick={() => router.push(`/proposals/${p.id}`)} className="p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                <h3 className="text-sm font-medium">{p.title || "Untitled"}</h3>
                <p className="text-xs text-slate-400 mt-1">Updated {new Date(p.updated_at || p.created_at).toLocaleDateString()}</p>
              </div>
            ))}</div>
          ) : <p className="text-sm text-slate-400">No proposals in review</p>}
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Your Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-3">{reviews.map(r => (
              <div key={r.id} className="p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Proposal #{r.proposal_id?.slice(0, 8)}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${r.status === "approved" ? "bg-emerald-900/30 text-emerald-400" : r.status === "rejected" ? "bg-red-900/30 text-red-400" : "bg-amber-900/30 text-amber-400"}`}>{r.status || "pending"}</span>
                </div>
                {r.comments && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.comments}</p>}
              </div>
            ))}</div>
          ) : <p className="text-sm text-slate-400">No reviews yet</p>}
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Active Proposals</h2>
          {proposals.filter(p => p.status === "in_progress").length > 0 ? (
            <div className="space-y-3">{proposals.filter(p => p.status === "in_progress").map(p => (
              <div key={p.id} onClick={() => router.push(`/proposals/${p.id}`)} className="p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                <h3 className="text-sm font-medium">{p.title || "Untitled"}</h3>
                <p className="text-xs text-slate-400 mt-1">{p.sections?.length || 0} sections</p>
              </div>
            ))}</div>
          ) : <p className="text-sm text-slate-400">No active proposals</p>}
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button onClick={() => router.push("/proposals/create")} className="w-full p-3 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Create New Proposal</button>
            <button onClick={() => router.push("/proposals/templates")} className="w-full p-3 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Browse Templates</button>
            <button onClick={() => router.push("/proposals/win-themes")} className="w-full p-3 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Generate Win Themes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
