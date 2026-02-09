"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CMMCGuidancePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const CMMC_LEVELS = [
    { level: "Level 1", title: "Foundational", practices: 17, description: "Basic safeguarding of FCI. Annual self-assessment.", domains: ["Access Control", "Identification & Authentication", "Media Protection", "Physical Protection", "System & Communications Protection", "System & Information Integrity"] },
    { level: "Level 2", title: "Advanced", practices: 110, description: "Protection of CUI. Triennial third-party assessment.", domains: ["Access Control", "Awareness & Training", "Audit & Accountability", "Configuration Management", "Identification & Authentication", "Incident Response", "Maintenance", "Media Protection", "Personnel Security", "Physical Protection", "Risk Assessment", "Security Assessment", "System & Communications Protection", "System & Information Integrity"] },
    { level: "Level 3", title: "Expert", practices: 134, description: "Protection against APTs. Government-led assessment.", domains: ["All Level 2 domains plus enhanced requirements"] },
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

  async function runAssessment() {
    setRunning(true);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "compliance", message: "Perform a CMMC readiness assessment for my organization. Evaluate across all CMMC Level 2 domains: Access Control, Awareness & Training, Audit & Accountability, Configuration Management, Identification & Authentication, Incident Response, Maintenance, Media Protection, Personnel Security, Physical Protection, Risk Assessment, Security Assessment, System & Communications Protection, and System & Information Integrity. Provide a gap analysis and remediation recommendations." }) });
      if (res.ok) { const d = await res.json(); setAssessment(d.response || d); }
    } catch {}
    setRunning(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">CMMC Guidance</h1><p className="text-slate-400 mt-1">Cybersecurity Maturity Model Certification readiness</p></div>
        <button onClick={runAssessment} disabled={running} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{running ? "Assessing..." : "Run Assessment"}</button>
      </div>
      <div className="space-y-4 mb-8">
        {CMMC_LEVELS.map(l => (
          <div key={l.level} className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div><h2 className="text-lg font-semibold"><span className="text-emerald-400">{l.level}</span> — {l.title}</h2><p className="text-sm text-slate-400 mt-1">{l.description}</p></div>
              <div className="text-right"><p className="text-2xl font-bold text-emerald-400">{l.practices}</p><p className="text-xs text-slate-500">Practices</p></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">{l.domains.map(d => (<span key={d} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">{d}</span>))}</div>
          </div>
        ))}
      </div>
      {assessment && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">CMMC Readiness Assessment</h2>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{typeof assessment === "string" ? assessment : JSON.stringify(assessment, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
