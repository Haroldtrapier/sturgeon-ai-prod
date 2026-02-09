"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SDVOSBPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const REQUIREMENTS = [
    { title: "Veteran Status", desc: "Owner must be a veteran with a service-connected disability rating from the VA", status: "required" },
    { title: "Ownership", desc: "51%+ unconditional ownership by one or more service-disabled veterans", status: "required" },
    { title: "Management & Control", desc: "Day-to-day management and highest officer position held by qualifying veteran", status: "required" },
    { title: "SBA Certification", desc: "Must be certified through SBA's VetCert program (formerly VA CVE)", status: "required" },
    { title: "Size Standard", desc: "Must meet SBA size standard for primary NAICS code", status: "required" },
    { title: "Good Character", desc: "No debarment, suspension, or unresolved federal debt", status: "required" },
  ];

  const BENEFITS = [
    "Sole-source contracts up to $5M (manufacturing) or $5M (other)",
    "Set-aside competitions limited to SDVOSBs",
    "Price evaluation preference in certain full & open competitions",
    "Subcontracting opportunities through large business mentor-protege programs",
    "Access to VA-specific SDVOSB set-asides (Veterans First program)",
    "Eligibility for SBA's All Small Mentor-Protege Program",
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
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "compliance", message: "Provide detailed guidance on SDVOSB certification through SBA VetCert. Include: application process, required documentation, common pitfalls, timeline, and tips for a successful application. Also explain the difference between self-certification and SBA VetCert." }) });
      if (res.ok) { const d = await res.json(); setGuidance(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setAsking(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">SDVOSB Certification</h1><p className="text-slate-400 mt-1">Service-Disabled Veteran-Owned Small Business</p></div>
        <button onClick={getGuidance} disabled={asking} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-sm">{asking ? "Loading..." : "Get AI Guidance"}</button>
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
