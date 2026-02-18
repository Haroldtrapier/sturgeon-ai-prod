"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EightAPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const PROGRAM_PHASES = [
    { phase: "Developmental (Years 1-4)", desc: "Business development assistance, training, counseling, mentoring, contract support" },
    { phase: "Transitional (Years 5-9)", desc: "Decreased assistance, emphasis on competitive contracts, preparing for graduation" },
  ];

  const REQUIREMENTS = [
    { title: "Social Disadvantage", desc: "Owner must be a socially disadvantaged individual (racial/ethnic minority or documented individual disadvantage)" },
    { title: "Economic Disadvantage", desc: "Personal net worth under $850K (excluding primary residence and business), adjusted gross income under $400K" },
    { title: "Ownership & Control", desc: "51%+ unconditional ownership by disadvantaged individual(s), full management and daily operations control" },
    { title: "Good Character", desc: "No criminal record that would reflect poorly on business integrity" },
    { title: "Size Standard", desc: "Must qualify as small under SBA size standard for primary NAICS" },
    { title: "Potential for Success", desc: "2+ years in business (or waiver), demonstrate capability to perform contracts" },
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

  async function getGuidance() {
    setAsking(true);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "compliance", message: "Provide detailed guidance on the SBA 8(a) Business Development Program application. Include: eligibility criteria, required documentation, application process, common mistakes, timeline expectations, and strategies for a successful application. Also explain sole-source contract thresholds and the mentor-protege program." }) });
      if (res.ok) { const d = await res.json(); setGuidance(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setAsking(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">8(a) Business Development</h1><p className="text-slate-400 mt-1">SBA 8(a) certification and program guidance</p></div>
        <button onClick={getGuidance} disabled={asking} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-sm">{asking ? "Loading..." : "Get AI Guidance"}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {PROGRAM_PHASES.map(p => (
          <div key={p.phase} className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="font-semibold text-emerald-400 text-sm">{p.phase}</h3>
            <p className="text-xs text-slate-400 mt-2">{p.desc}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-400">$4.5M</p><p className="text-xs text-slate-400 mt-1">Sole-Source Limit (Non-Mfg)</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-400">9 Years</p><p className="text-xs text-slate-400 mt-1">Program Duration</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-400">$850K</p><p className="text-xs text-slate-400 mt-1">Net Worth Limit</p></div>
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl mb-6">
        <h2 className="font-semibold mb-4">Eligibility Requirements</h2>
        <div className="space-y-3">{REQUIREMENTS.map(r => (
          <div key={r.title} className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
            <div><p className="text-sm font-medium">{r.title}</p><p className="text-xs text-slate-400 mt-0.5">{r.desc}</p></div>
          </div>
        ))}</div>
      </div>
      {guidance && (
        <div className="p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-3 text-emerald-400">AI Certification Guidance</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{guidance}</pre>
        </div>
      )}
    </div>
  );
}
