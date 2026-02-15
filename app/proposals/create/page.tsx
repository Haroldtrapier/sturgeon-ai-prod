"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateProposalPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [rfpText, setRfpText] = useState("");
  const [opportunityId, setOpportunityId] = useState("");
  const [creating, setCreating] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      setLoading(false);
    };
    init();
  }, [router]);

  async function createProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API}/proposals/create`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ title, rfp_text: rfpText, opportunity_id: opportunityId || undefined }) });
      if (res.ok) { const d = await res.json(); router.push(`/proposals/${d.id || d.proposal_id || ""}`); }
    } catch {}
    setCreating(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Create Proposal</h1><p className="text-slate-400 mt-1">Start a new proposal from scratch or from an RFP</p></div>
      <form onSubmit={createProposal} className="space-y-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div><label className="block text-sm text-slate-300 mb-1">Proposal Title *</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. IT Modernization Support Services" required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
          <div><label className="block text-sm text-slate-300 mb-1">Linked Opportunity ID (optional)</label><input type="text" value={opportunityId} onChange={e => setOpportunityId(e.target.value)} placeholder="SAM.gov Notice ID" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" /></div>
          <div><label className="block text-sm text-slate-300 mb-1">RFP / Solicitation Text (optional)</label><textarea value={rfpText} onChange={e => setRfpText(e.target.value)} rows={8} placeholder="Paste the full RFP text here. Our AI will extract requirements, compliance items, and evaluation criteria automatically..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-3">What happens next</h2>
          <div className="space-y-2 text-sm text-slate-400">
            <p>1. AI extracts compliance requirements from your RFP text</p>
            <p>2. A compliance matrix is auto-generated</p>
            <p>3. Proposal sections are created based on standard structure</p>
            <p>4. You can use AI to draft each section individually</p>
          </div>
        </div>
        <button type="submit" disabled={creating || !title.trim()} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-lg">{creating ? "Creating..." : "Create Proposal"}</button>
      </form>
    </div>
  );
}
