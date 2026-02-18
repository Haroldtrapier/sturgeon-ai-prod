"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Proposal {
  id: string;
  title: string;
  status: string;
  created_at: string;
  opportunities?: { title?: string; agency?: string };
}

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [rfpText, setRfpText] = useState("");
  const [oppId, setOppId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setToken(session.access_token);
        await fetchProposals(session.access_token);
      }
    };
    init();
  }, [router]);

  async function fetchProposals(t: string) {
    try {
      const res = await fetch(`${API}/proposals/`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals || []);
      }
    } catch { /* empty */ }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/proposals/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ opportunity_id: oppId, rfp_text: rfpText, title: newTitle }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(`Proposal created with ${data.requirements_extracted} requirements extracted.`);
        setShowCreate(false);
        setNewTitle(""); setRfpText(""); setOppId("");
        await fetchProposals(token);
      } else {
        const err = await res.text();
        setMessage(`Error: ${err}`);
      }
    } catch { setMessage("Failed to create proposal."); }
    setCreating(false);
  }

  const statusColor: Record<string, string> = {
    draft: "bg-yellow-600", in_progress: "bg-blue-600", submitted: "bg-emerald-600", review: "bg-purple-600",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Proposals</h1>
          <p className="text-slate-400 mt-1">Manage your government contract proposals</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
          + New Proposal
        </button>
      </div>

      {message && <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold">Create New Proposal</h2>
          <input type="text" placeholder="Proposal Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <input type="text" placeholder="Opportunity ID" value={oppId} onChange={(e) => setOppId(e.target.value)} required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <textarea placeholder="Paste RFP text here for compliance extraction..." value={rfpText} onChange={(e) => setRfpText(e.target.value)} required rows={6} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
              {creating ? "Creating..." : "Create & Extract Requirements"}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Cancel</button>
          </div>
        </form>
      )}

      {proposals.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400 text-lg">No proposals yet</p>
          <p className="text-slate-500 mt-2">Create your first proposal from a saved opportunity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => (
            <Link key={p.id} href={`/proposals/${p.id}`} className="block p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-600 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  {p.opportunities && <p className="text-sm text-slate-400 mt-1">{p.opportunities.agency} - {p.opportunities.title}</p>}
                  <p className="text-xs text-slate-500 mt-2">Created {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor[p.status] || "bg-slate-700"}`}>{p.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
