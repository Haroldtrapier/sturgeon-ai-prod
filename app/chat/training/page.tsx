"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AITrainingPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const MODULES = [
    { id: "govcon_101", name: "GovCon 101", desc: "Introduction to government contracting for beginners", topics: ["Federal acquisition process", "Types of contracts", "Small business programs", "How to find opportunities"] },
    { id: "proposal_writing", name: "Proposal Writing", desc: "Learn to write winning government proposals", topics: ["Proposal structure", "Evaluation criteria", "Compliance matrix", "Win themes and discriminators"] },
    { id: "pricing_strategy", name: "Pricing Strategy", desc: "Government contract pricing and cost volumes", topics: ["FFP vs T&M vs CPFF", "Labor rate development", "Indirect rate structures", "Price-to-win analysis"] },
    { id: "compliance_deep", name: "Compliance Deep Dive", desc: "FAR/DFARS regulations and compliance requirements", topics: ["Key FAR parts", "DFARS cybersecurity", "CMMC requirements", "Reps and certs"] },
    { id: "capture_management", name: "Capture Management", desc: "Pre-RFP positioning and opportunity capture", topics: ["Capture lifecycle", "Customer engagement", "Competitive intelligence", "Black hat reviews"] },
    { id: "past_performance", name: "Past Performance", desc: "Building and leveraging your track record", topics: ["CPARS ratings", "Relevance criteria", "Writing narratives", "Using subcontractor experience"] },
  ];

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setToken(session.access_token); setLoading(false); }; init(); }, [router]);

  async function startModule(moduleId: string) {
    setActiveModule(moduleId); setResult(null); setRunning(true);
    const mod = MODULES.find(m => m.id === moduleId);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "general", message: `Provide a comprehensive training lesson on "${mod?.name}": ${mod?.desc}. Cover these topics in detail: ${mod?.topics.join(", ")}. Include practical examples, key terminology, common mistakes to avoid, and actionable takeaways. Format as a structured training module with sections and bullet points.` }) });
      if (res.ok) { const d = await res.json(); setResult(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setRunning(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">AI Training Center</h1><p className="text-slate-400 mt-1">Learn government contracting with AI-powered training modules</p></div>
      {result && (
        <div className="mb-8 p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <div className="flex justify-between items-start mb-4"><h2 className="text-lg font-semibold text-emerald-400">{MODULES.find(m => m.id === activeModule)?.name}</h2><button onClick={() => { setResult(null); setActiveModule(null); }} className="text-slate-500 hover:text-white">&times;</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{result}</pre>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map(m => (
          <div key={m.id} className={`p-5 bg-slate-900 border rounded-xl transition-colors ${activeModule === m.id ? "border-emerald-600" : "border-slate-800 hover:border-slate-700"}`}>
            <h3 className="font-semibold mb-1">{m.name}</h3>
            <p className="text-xs text-slate-400 mb-3">{m.desc}</p>
            <div className="flex flex-wrap gap-1 mb-3">{m.topics.map(t => (<span key={t} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300">{t}</span>))}</div>
            <button onClick={() => startModule(m.id)} disabled={running} className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">{running && activeModule === m.id ? "Loading..." : "Start Module"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
