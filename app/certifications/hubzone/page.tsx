"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function HUBZonePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const REQUIREMENTS = [
    { title: "Principal Office", desc: "Must be located in a Historically Underutilized Business Zone" },
    { title: "Employee Residency", desc: "At least 35% of employees must reside in a HUBZone" },
    { title: "Size Standard", desc: "Must qualify as small under SBA size standard for primary NAICS" },
    { title: "Ownership", desc: "51%+ owned by U.S. citizens, CDI, Indian Tribe, ANC, NHO, or small agricultural cooperative" },
    { title: "Certification", desc: "Must be certified by SBA (not self-certified)" },
  ];

  const BENEFITS = [
    "Sole-source contracts up to $7M (manufacturing) or $4.5M (other)",
    "Set-aside competitions limited to HUBZone firms",
    "10% price evaluation preference in full & open competitions",
    "Subcontracting credit for large business prime contractors",
    "3% government-wide HUBZone contracting goal",
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
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "compliance", message: "Provide detailed guidance on HUBZone certification. Include: how to check if an address is in a HUBZone, employee residency requirements, application process, required documentation, maintaining certification, and common audit findings. Also explain the HUBZone map tool and redesignation/qualified disaster areas." }) });
      if (res.ok) { const d = await res.json(); setGuidance(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setAsking(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">HUBZone Certification</h1><p className="text-slate-400 mt-1">Historically Underutilized Business Zone program</p></div>
        <button onClick={getGuidance} disabled={asking} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-sm">{asking ? "Loading..." : "Get AI Guidance"}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-400">35%</p><p className="text-xs text-slate-400 mt-1">Min Employee Residency</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-400">10%</p><p className="text-xs text-slate-400 mt-1">Price Eval Preference</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-400">3%</p><p className="text-xs text-slate-400 mt-1">Gov-Wide Goal</p></div>
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
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl mb-6">
        <h2 className="font-semibold mb-4">Benefits</h2>
        <ul className="space-y-2">{BENEFITS.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300"><span className="text-emerald-400 mt-0.5">+</span>{b}</li>
        ))}</ul>
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
