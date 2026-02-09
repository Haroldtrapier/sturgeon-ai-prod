"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProposalLibraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("proposals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setProposals(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  const filtered = proposals.filter(p => (filter === "all" || p.status === filter) && (!search || (p.title || "").toLowerCase().includes(search.toLowerCase())));
  const statuses = ["all", ...Array.from(new Set(proposals.map(p => p.status || "draft")))];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Proposal Library</h1><p className="text-slate-400 mt-1">All proposals and reusable content</p></div>
        <button onClick={() => router.push("/proposals/create")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm">New Proposal</button>
      </div>
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search proposals..." className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
        <div className="flex gap-2">{statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{s}</button>
        ))}</div>
      </div>
      {filtered.length > 0 ? (
        <div className="space-y-3">{filtered.map(p => (
          <div key={p.id} onClick={() => router.push(`/proposals/${p.id}`)} className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div><h3 className="font-medium">{p.title || "Untitled"}</h3><p className="text-xs text-slate-400 mt-1">{new Date(p.created_at).toLocaleDateString()} · {p.sections?.length || 0} sections</p></div>
              <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${p.status === "won" ? "bg-emerald-900/30 text-emerald-400" : p.status === "submitted" ? "bg-blue-900/30 text-blue-400" : "bg-slate-800 text-slate-400"}`}>{p.status || "draft"}</span>
            </div>
          </div>
        ))}</div>
      ) : <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">No proposals found</p></div>}
    </div>
  );
}
