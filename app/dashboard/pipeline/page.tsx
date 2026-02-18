"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function PipelinePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<any[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      try {
        const res = await fetch(`${API}/proposals/`, { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (res.ok) { const d = await res.json(); setProposals(d.proposals || []); }
      } catch {}
      setLoading(false);
    };
    init();
  }, [router, API]);

  const stages = [
    { key: "draft", label: "Draft", color: "border-yellow-500", bg: "bg-yellow-500/10" },
    { key: "in_progress", label: "In Progress", color: "border-blue-500", bg: "bg-blue-500/10" },
    { key: "review", label: "Review", color: "border-purple-500", bg: "bg-purple-500/10" },
    { key: "submitted", label: "Submitted", color: "border-emerald-500", bg: "bg-emerald-500/10" },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Pipeline View</h1><p className="text-slate-400 mt-1">Track proposals through each stage</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map(stage => {
          const items = proposals.filter(p => p.status === stage.key);
          return (
            <div key={stage.key} className={`border-t-2 ${stage.color} rounded-xl`}>
              <div className={`p-4 ${stage.bg} rounded-t-xl`}>
                <div className="flex items-center justify-between"><h3 className="font-semibold text-sm">{stage.label}</h3><span className="text-xs bg-slate-800 px-2 py-1 rounded-full">{items.length}</span></div>
              </div>
              <div className="p-2 space-y-2 min-h-[200px]">
                {items.length === 0 ? <p className="text-xs text-slate-500 text-center py-8">No proposals</p> : items.map(p => (
                  <Link key={p.id} href={`/proposals/${p.id}`} className="block p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-600 transition-colors">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{p.opportunities?.agency || "No agency"}</p>
                    <p className="text-xs text-slate-600 mt-1">{new Date(p.created_at).toLocaleDateString()}</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
