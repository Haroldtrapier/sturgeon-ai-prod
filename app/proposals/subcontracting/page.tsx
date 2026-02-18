"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SubcontractingPlanPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [contractValue, setContractValue] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const SB_CATEGORIES = [
    { category: "Small Business (SB)", goal: "23%", desc: "Government-wide small business goal" },
    { category: "Small Disadvantaged Business (SDB)", goal: "5%", desc: "Including 8(a) certified firms" },
    { category: "WOSB", goal: "5%", desc: "Women-Owned Small Business" },
    { category: "HUBZone", goal: "3%", desc: "Historically Underutilized Business Zone" },
    { category: "SDVOSB", goal: "3%", desc: "Service-Disabled Veteran-Owned" },
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

  async function generatePlan() {
    setGenerating(true); setPlan(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "proposal", message: `Generate a small business subcontracting plan${contractValue ? ` for a contract valued at $${contractValue}` : ""}. Include: 1) Goals for each small business category (SB, SDB, WOSB, HUBZone, SDVOSB) with dollar amounts and percentages 2) Description of outreach methods 3) Flow-down requirements to lower-tier subcontractors 4) Monitoring and compliance procedures 5) Good faith effort documentation 6) Administrator and point of contact information. Format as a ready-to-submit FAR 52.219-9 compliant plan.` }) });
      if (res.ok) { const d = await res.json(); setPlan(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setGenerating(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Subcontracting Plan</h1><p className="text-slate-400 mt-1">Generate FAR-compliant small business subcontracting plans</p></div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        {SB_CATEGORIES.map(c => (
          <div key={c.category} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <p className="text-xl font-bold text-emerald-400">{c.goal}</p>
            <p className="text-xs text-slate-400 mt-1">{c.category}</p>
          </div>
        ))}
      </div>
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex gap-3">
          <input type="number" placeholder="Estimated Contract Value ($)" value={contractValue} onChange={e => setContractValue(e.target.value)} className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <button onClick={generatePlan} disabled={generating} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{generating ? "Generating..." : "Generate Plan"}</button>
        </div>
      </div>
      {plan && (
        <div className="p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">Generated Subcontracting Plan</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{plan}</pre>
        </div>
      )}
    </div>
  );
}
