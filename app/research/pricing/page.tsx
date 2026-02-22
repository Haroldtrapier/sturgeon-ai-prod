"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PricingResearchPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [naics, setNaics] = useState("");
  const [laborCategory, setLaborCategory] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setToken(session.access_token); setLoading(false); }; init(); }, [router]);

  async function researchPricing(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true); setResult(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "market", message: `Provide pricing intelligence for government contracting${naics ? ` in NAICS ${naics}` : ""}${laborCategory ? ` for labor category "${laborCategory}"` : ""}. Include: 1) Typical labor rate ranges by level 2) GSA Schedule pricing benchmarks 3) Competitive pricing strategies 4) BLS wage data references 5) SCA wage determination considerations 6) Price-to-win methodology guidance.` }) });
      if (res.ok) { const d = await res.json(); setResult(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Pricing Research</h1><p className="text-stone-500 mt-1">Market rate analysis and competitive pricing intelligence</p></div>
      <form onSubmit={researchPricing} className="mb-8 p-6 bg-white border border-stone-200 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" value={naics} onChange={e => setNaics(e.target.value)} placeholder="NAICS Code (e.g. 541512)" className="px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
          <input type="text" value={laborCategory} onChange={e => setLaborCategory(e.target.value)} placeholder="Labor Category (e.g. Senior Systems Engineer)" className="px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
        </div>
        <button type="submit" disabled={searching} className="px-6 py-3 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 font-medium">{searching ? "Researching..." : "Research Pricing"}</button>
      </form>
      {result && (
        <div className="p-6 bg-white border border-lime-200 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-lime-700">Pricing Intelligence</h2>
          <pre className="text-sm text-stone-600 whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}
