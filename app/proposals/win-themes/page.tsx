"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WinThemesPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [rfpText, setRfpText] = useState("");
  const [companyStrengths, setCompanyStrengths] = useState("");
  const [themes, setThemes] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
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

  async function generateThemes(e: React.FormEvent) {
    e.preventDefault();
    if (!rfpText.trim()) return;
    setGenerating(true); setThemes(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "proposal", message: `Based on this RFP/solicitation text, develop compelling win themes and discriminators for a proposal.\n\nRFP Text:\n${rfpText.substring(0, 3000)}\n\n${companyStrengths ? `Company Strengths:\n${companyStrengths}\n\n` : ""}Provide:\n1. 3-5 Win Themes with supporting evidence points\n2. Key discriminators vs. competitors\n3. Ghost themes (weaknesses of likely competitors)\n4. Evaluation criteria alignment\n5. Executive summary talking points\n6. Section-by-section theme integration plan` }) });
      if (res.ok) { const d = await res.json(); setThemes(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setGenerating(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Win Theme Generator</h1><p className="text-slate-400 mt-1">Develop compelling win themes and discriminators</p></div>
      <form onSubmit={generateThemes} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-2">RFP / Solicitation Text</label>
          <textarea value={rfpText} onChange={e => setRfpText(e.target.value)} rows={6} placeholder="Paste the RFP requirements, evaluation criteria, and scope of work..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-2">Your Company Strengths (optional)</label>
          <textarea value={companyStrengths} onChange={e => setCompanyStrengths(e.target.value)} rows={3} placeholder="Past performance highlights, certifications, unique capabilities, key personnel..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
        </div>
        <button type="submit" disabled={generating} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{generating ? "Generating Win Themes..." : "Generate Win Themes"}</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl"><h3 className="font-semibold text-blue-400 text-sm mb-1">Win Themes</h3><p className="text-xs text-slate-400">Core messages that resonate with evaluators</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl"><h3 className="font-semibold text-purple-400 text-sm mb-1">Discriminators</h3><p className="text-xs text-slate-400">What sets you apart from competitors</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl"><h3 className="font-semibold text-amber-400 text-sm mb-1">Ghost Themes</h3><p className="text-xs text-slate-400">Competitor weaknesses to exploit</p></div>
      </div>
      {generating && <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-3" /><p className="text-sm text-slate-400">Analyzing RFP and generating win themes...</p></div>}
      {themes && (
        <div className="p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">Win Themes & Strategy</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{themes}</pre>
        </div>
      )}
    </div>
  );
}
