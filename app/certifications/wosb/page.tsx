"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WOSBPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const REQUIREMENTS_WOSB = [
    { title: "Ownership", desc: "51%+ unconditionally owned by one or more women who are U.S. citizens" },
    { title: "Management", desc: "One or more women must manage daily operations and make long-term decisions" },
    { title: "Size Standard", desc: "Must meet SBA size standard for primary NAICS code" },
    { title: "SBA Certification", desc: "Must be certified through SBA or an approved third-party certifier" },
  ];

  const EDWOSB_ADDITIONAL = [
    { title: "Economic Disadvantage", desc: "Personal net worth under $850K (excluding primary residence and business ownership)" },
    { title: "Income Limitation", desc: "Adjusted gross income averaged over 3 years must not exceed $400K" },
    { title: "Asset Limitation", desc: "Total assets (including personal and business) subject to review" },
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
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "compliance", message: "Provide detailed guidance on WOSB and EDWOSB certification. Include: differences between WOSB and EDWOSB, eligible NAICS codes, certification process, required documents, SBA vs third-party certification, sole-source thresholds, and tips for maintaining certification." }) });
      if (res.ok) { const d = await res.json(); setGuidance(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setAsking(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">WOSB / EDWOSB Certification</h1><p className="text-slate-400 mt-1">Women-Owned Small Business programs</p></div>
        <button onClick={getGuidance} disabled={asking} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-sm">{asking ? "Loading..." : "Get AI Guidance"}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-5 bg-slate-900 border border-blue-800 rounded-xl">
          <h3 className="font-semibold text-blue-400 mb-1">WOSB</h3>
          <p className="text-xs text-slate-400">Set-asides in industries where women are underrepresented</p>
          <p className="text-lg font-bold text-emerald-400 mt-2">Sole-source up to $4.5M</p>
        </div>
        <div className="p-5 bg-slate-900 border border-purple-800 rounded-xl">
          <h3 className="font-semibold text-purple-400 mb-1">EDWOSB</h3>
          <p className="text-xs text-slate-400">Set-asides in industries where women are substantially underrepresented</p>
          <p className="text-lg font-bold text-emerald-400 mt-2">Sole-source up to $4.5M</p>
        </div>
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl mb-6">
        <h2 className="font-semibold mb-4">WOSB Requirements</h2>
        <div className="space-y-3">{REQUIREMENTS_WOSB.map(r => (
          <div key={r.title} className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            <div><p className="text-sm font-medium">{r.title}</p><p className="text-xs text-slate-400 mt-0.5">{r.desc}</p></div>
          </div>
        ))}</div>
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl mb-6">
        <h2 className="font-semibold mb-4">Additional EDWOSB Requirements</h2>
        <div className="space-y-3">{EDWOSB_ADDITIONAL.map(r => (
          <div key={r.title} className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
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
