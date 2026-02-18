"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProposalDraftsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("proposals").select("*").eq("user_id", user.id).eq("status", "draft").order("updated_at", { ascending: false });
      setDrafts(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  async function deleteProposal(id: string) {
    const supabase = createClient();
    await supabase.from("proposals").delete().eq("id", id);
    setDrafts(prev => prev.filter(d => d.id !== id));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Drafts</h1><p className="text-slate-400 mt-1">Proposals in progress</p></div>
        <button onClick={() => router.push("/proposals/create")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm">New Proposal</button>
      </div>
      {drafts.length > 0 ? (
        <div className="space-y-3">{drafts.map(d => (
          <div key={d.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => router.push(`/proposals/${d.id}`)}>
                <h3 className="font-medium">{d.title || "Untitled Draft"}</h3>
                <div className="flex gap-3 mt-2 text-xs text-slate-400">
                  <span>Created: {new Date(d.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(d.updated_at || d.created_at).toLocaleDateString()}</span>
                  {d.sections && <span>{d.sections.length} sections</span>}
                </div>
              </div>
              <div className="flex gap-2 ml-3">
                <button onClick={() => router.push(`/proposals/${d.id}`)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Edit</button>
                <button onClick={() => deleteProposal(d.id)} className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs hover:bg-red-900 hover:text-red-400">Delete</button>
              </div>
            </div>
          </div>
        ))}</div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 mb-3">No drafts yet</p>
          <button onClick={() => router.push("/proposals/create")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Create Your First Proposal</button>
        </div>
      )}
    </div>
  );
}
