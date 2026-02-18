"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface TeamingPartner {
  id: string;
  company_name: string;
  role: "prime" | "sub" | "mentor" | "protege";
  capabilities: string;
  certifications: string[];
  status: "active" | "proposed" | "expired";
  created_at: string;
}

export default function TeamingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [partners, setPartners] = useState<TeamingPartner[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newPartner, setNewPartner] = useState({ company_name: "", role: "sub" as const, capabilities: "", certifications: "" });
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);

      const { data } = await supabase
        .from("teaming_partners")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setPartners(data as TeamingPartner[]);
      setLoading(false);
    };
    init();
  }, [router]);

  async function addPartner(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase.from("teaming_partners").insert({
      user_id: session.user.id,
      company_name: newPartner.company_name,
      role: newPartner.role,
      capabilities: newPartner.capabilities,
      certifications: newPartner.certifications.split(",").map(c => c.trim()).filter(Boolean),
      status: "proposed",
    }).select().single();

    if (data) setPartners(prev => [data as TeamingPartner, ...prev]);
    setNewPartner({ company_name: "", role: "sub", capabilities: "", certifications: "" });
    setShowAdd(false);
  }

  async function searchPartners() {
    setSearching(true);
    try {
      const res = await fetch(`${API}/api/agents/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          agent_type: "research",
          message: "Search for potential teaming partners for a small business government contractor. Focus on companies with complementary certifications (8(a), HUBZone, SDVOSB, WOSB) and technical capabilities in IT services, cybersecurity, and consulting. Suggest partnership strategies.",
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setSearchResults(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2));
      }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const roleColor = (r: string) => r === "prime" ? "bg-emerald-900/50 text-emerald-400" : r === "sub" ? "bg-blue-900/50 text-blue-400" : r === "mentor" ? "bg-purple-900/50 text-purple-400" : "bg-yellow-900/50 text-yellow-400";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Teaming Agreements</h1>
          <p className="text-slate-400 mt-1">Manage teaming partners for joint proposals</p>
        </div>
        <div className="flex gap-2">
          <button onClick={searchPartners} disabled={searching} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-sm">
            {searching ? "Searching..." : "AI Partner Search"}
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">+ Add Partner</button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={addPartner} className="mb-6 p-6 bg-slate-900 border border-emerald-800 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold">Add Teaming Partner</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Company Name</label>
              <input type="text" value={newPartner.company_name} onChange={e => setNewPartner(p => ({ ...p, company_name: e.target.value }))} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Role</label>
              <select value={newPartner.role} onChange={e => setNewPartner(p => ({ ...p, role: e.target.value as "sub" }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <option value="prime">Prime</option>
                <option value="sub">Subcontractor</option>
                <option value="mentor">Mentor</option>
                <option value="protege">Protege</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Capabilities</label>
            <input type="text" value={newPartner.capabilities} onChange={e => setNewPartner(p => ({ ...p, capabilities: e.target.value }))} placeholder="IT services, cybersecurity, consulting..." className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Certifications (comma-separated)</label>
            <input type="text" value={newPartner.certifications} onChange={e => setNewPartner(p => ({ ...p, certifications: e.target.value }))} placeholder="SDVOSB, 8(a), HUBZone..." className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">Add Partner</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {searchResults && (
        <div className="mb-6 p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-sm text-emerald-400">AI Partner Search Results</h2>
            <button onClick={() => setSearchResults(null)} className="text-xs text-slate-400 hover:text-white">Dismiss</button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{searchResults}</pre>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{partners.length}</p>
          <p className="text-xs text-slate-400">Total Partners</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-400">{partners.filter(p => p.status === "active").length}</p>
          <p className="text-xs text-slate-400">Active Agreements</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-yellow-400">{partners.filter(p => p.status === "proposed").length}</p>
          <p className="text-xs text-slate-400">Proposed</p>
        </div>
      </div>

      {partners.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-slate-400">No teaming partners yet</p>
          <p className="text-xs text-slate-500 mt-1">Add partners or use AI search to find potential teaming opportunities</p>
        </div>
      ) : (
        <div className="space-y-3">
          {partners.map(p => (
            <div key={p.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{p.company_name}</h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${roleColor(p.role)}`}>{p.role}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.status === "active" ? "bg-emerald-900/50 text-emerald-400" : p.status === "expired" ? "bg-red-900/50 text-red-400" : "bg-yellow-900/50 text-yellow-400"}`}>{p.status}</span>
                </div>
              </div>
              {p.capabilities && <p className="text-xs text-slate-400">{p.capabilities}</p>}
              {p.certifications?.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {p.certifications.map(c => <span key={c} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300">{c}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
