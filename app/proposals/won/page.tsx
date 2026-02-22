"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface WonContract {
  id: string;
  title: string;
  agency: string;
  award_amount: number;
  award_date: string;
  period_of_performance: string;
  contract_number: string;
}

export default function WonContractsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<WonContract[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase
        .from("proposals")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "won")
        .order("updated_at", { ascending: false });
      if (data) setContracts(data.map(p => ({
        id: p.id,
        title: p.title || "Untitled",
        agency: p.agency || "",
        award_amount: p.award_amount || 0,
        award_date: p.updated_at || "",
        period_of_performance: p.period_of_performance || "",
        contract_number: p.contract_number || "",
      })));
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  const totalValue = contracts.reduce((sum, c) => sum + (c.award_amount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Won Contracts</h1>
        <p className="text-stone-500 mt-1">Track awarded contracts and total pipeline value</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white border border-lime-200 rounded-xl text-center">
          <p className="text-2xl font-bold text-lime-700">{contracts.length}</p>
          <p className="text-xs text-stone-500">Contracts Won</p>
        </div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
          <p className="text-2xl font-bold text-lime-700">${totalValue > 1000000 ? `${(totalValue / 1000000).toFixed(1)}M` : totalValue > 1000 ? `${(totalValue / 1000).toFixed(0)}K` : totalValue.toLocaleString()}</p>
          <p className="text-xs text-stone-500">Total Value</p>
        </div>
        <div className="p-4 bg-white border border-stone-200 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-600">${contracts.length > 0 ? (totalValue / contracts.length > 1000000 ? `${(totalValue / contracts.length / 1000000).toFixed(1)}M` : `${(totalValue / contracts.length / 1000).toFixed(0)}K`) : "0"}</p>
          <p className="text-xs text-stone-500">Avg. Award Value</p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="p-12 bg-white border border-stone-200 rounded-xl text-center">
          <p className="text-stone-500 mb-2">No won contracts yet</p>
          <p className="text-xs text-stone-8000">When your submitted proposals are awarded, they&apos;ll appear here.</p>
          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => router.push("/proposals/submitted")} className="px-4 py-2 bg-stone-100 rounded-lg text-sm hover:bg-stone-200">View Submitted</button>
            <button onClick={() => router.push("/proposals/create")} className="px-4 py-2 bg-lime-700 text-white rounded-lg text-sm hover:bg-lime-800">Create Proposal</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(c => (
            <div key={c.id} className="p-5 bg-white border border-lime-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{c.title}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-lime-50 text-lime-700">Won</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-500 mt-3">
                <div>
                  <p className="text-stone-8000">Agency</p>
                  <p className="text-stone-600">{c.agency || "—"}</p>
                </div>
                <div>
                  <p className="text-stone-8000">Award Amount</p>
                  <p className="text-lime-700 font-medium">${c.award_amount ? c.award_amount.toLocaleString() : "—"}</p>
                </div>
                <div>
                  <p className="text-stone-8000">Award Date</p>
                  <p className="text-stone-600">{c.award_date ? new Date(c.award_date).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-stone-8000">Contract #</p>
                  <p className="text-stone-600">{c.contract_number || "—"}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => router.push(`/proposals/editor?proposal_id=${c.id}`)} className="px-3 py-1.5 bg-stone-100 border border-stone-300 rounded text-xs hover:bg-stone-200">View Proposal</button>
                <button onClick={() => router.push("/proposals/past-performance")} className="px-3 py-1.5 bg-stone-100 border border-stone-300 rounded text-xs hover:bg-stone-200">Add to Past Performance</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
