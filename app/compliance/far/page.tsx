"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FARReferencePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const FAR_PARTS = [
    { part: "Part 1", title: "Federal Acquisition Regulations System", desc: "Policies and procedures for acquisition" },
    { part: "Part 2", title: "Definitions of Words and Terms", desc: "Standard definitions used in FAR" },
    { part: "Part 4", title: "Administrative and Information Matters", desc: "SAM registration, reporting requirements" },
    { part: "Part 5", title: "Publicizing Contract Actions", desc: "Synopsis requirements, posting thresholds" },
    { part: "Part 8", title: "Required Sources of Supplies and Services", desc: "Federal supply schedules, GSA" },
    { part: "Part 9", title: "Contractor Qualifications", desc: "Responsibility, debarment, organizational conflicts" },
    { part: "Part 12", title: "Acquisition of Commercial Products", desc: "Commercial item procedures" },
    { part: "Part 13", title: "Simplified Acquisition Procedures", desc: "Micro-purchase, simplified methods" },
    { part: "Part 15", title: "Contracting by Negotiation", desc: "Competitive proposals, source selection" },
    { part: "Part 19", title: "Small Business Programs", desc: "Set-asides, subcontracting plans, certifications" },
    { part: "Part 22", title: "Application of Labor Laws", desc: "Service Contract Labor Standards, wages" },
    { part: "Part 31", title: "Contract Cost Principles", desc: "Allowable/unallowable costs, CAS" },
    { part: "Part 32", title: "Contract Financing", desc: "Progress payments, performance-based payments" },
    { part: "Part 42", title: "Contract Administration", desc: "Government oversight, modifications" },
    { part: "Part 49", title: "Termination of Contracts", desc: "Termination for convenience/default" },
    { part: "Part 52", title: "Solicitation Provisions and Contract Clauses", desc: "Standard clauses matrix" },
  ];

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

  async function searchFAR(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "compliance", message: `Explain the following FAR/DFARS regulation or clause: ${query}. Include the exact citation, applicability, key requirements, and compliance tips for small businesses.` }) });
      if (res.ok) { const d = await res.json(); setResult(d.response || d); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">FAR / DFARS Reference</h1><p className="text-stone-500 mt-1">Browse and search Federal Acquisition Regulations</p></div>
      <form onSubmit={searchFAR} className="mb-8 p-6 bg-white border border-stone-200 rounded-xl">
        <p className="text-sm text-stone-500 mb-3">Ask about any FAR part, clause, or compliance requirement</p>
        <div className="flex gap-3">
          <input type="text" placeholder="e.g. FAR 52.219-8, DFARS 252.204-7012, small business subcontracting" value={query} onChange={e => setQuery(e.target.value)} className="flex-1 px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
          <button type="submit" disabled={searching} className="px-6 py-3 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 font-medium">{searching ? "Searching..." : "Look Up"}</button>
        </div>
      </form>
      {result && (
        <div className="mb-8 p-6 bg-white border border-stone-200 rounded-xl">
          <h2 className="text-lg font-semibold mb-3 text-lime-700">AI Analysis</h2>
          <pre className="text-sm text-stone-600 whitespace-pre-wrap">{typeof result === "string" ? result : JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold mb-2">Key FAR Parts</h2>
        {FAR_PARTS.map(f => (
          <button key={f.part} onClick={() => { setQuery(f.part + " - " + f.title); }} className="w-full text-left p-4 bg-white border border-stone-200 rounded-xl hover:border-lime-600 transition-colors">
            <div className="flex items-center justify-between">
              <div><span className="font-semibold text-lime-700 text-sm">{f.part}</span><span className="text-sm ml-2">{f.title}</span><p className="text-xs text-stone-500 mt-1">{f.desc}</p></div>
              <span className="text-stone-500 text-lg">&rarr;</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
