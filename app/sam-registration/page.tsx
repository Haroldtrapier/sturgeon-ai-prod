"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SAMRegistrationPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [guidance, setGuidance] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const STEPS = [
    { step: 1, title: "Get a UEI (Unique Entity ID)", desc: "Request your UEI through SAM.gov. This replaced the DUNS number. Processing takes 1-2 business days.", tips: ["Have your legal business name and address ready", "Ensure your business is registered with your state"] },
    { step: 2, title: "Gather Required Information", desc: "Collect all required data before starting registration.", tips: ["EIN (Employer Identification Number)", "CAGE Code (will be assigned if you don't have one)", "Banking information for EFT", "NAICS codes for your business"] },
    { step: 3, title: "Create SAM.gov Account", desc: "Create an individual account at SAM.gov using Login.gov credentials.", tips: ["Use your official business email", "Set up Login.gov with 2-factor authentication"] },
    { step: 4, title: "Complete Core Data", desc: "Enter your legal business name, DBA, physical address, and mailing address.", tips: ["Must match IRS records exactly", "Include all business start dates and fiscal year info"] },
    { step: 5, title: "Enter Assertions", desc: "Declare your NAICS codes, product/service codes (PSC), and SBA size standards.", tips: ["Select all relevant NAICS codes", "Identify your primary NAICS code", "Update socioeconomic certifications"] },
    { step: 6, title: "Complete Reps & Certs", desc: "Answer all Representations and Certifications (FAR and DFARS provisions).", tips: ["Review each certification carefully", "Annual update is required", "Some certs require supporting documentation"] },
    { step: 7, title: "Add Points of Contact", desc: "Designate your government, electronic, and past performance POCs.", tips: ["POCs receive important notifications", "Keep contact info current"] },
    { step: 8, title: "Submit and Validate", desc: "Review all information and submit. Initial registration takes 7-10 business days. IRS TIN validation can take longer.", tips: ["Check status daily at SAM.gov", "Respond promptly to any validation issues", "Registration must be renewed annually"] },
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

  async function getGuidance(topic: string) {
    setAsking(true);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "compliance", message: `Provide detailed guidance on SAM.gov registration: ${topic}. Include common mistakes, best practices, and troubleshooting tips.` }) });
      if (res.ok) { const d = await res.json(); setGuidance(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setAsking(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">SAM.gov Registration Guide</h1><p className="text-slate-400 mt-1">Step-by-step guide to registering in the System for Award Management</p></div>
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-400">Free</p><p className="text-xs text-slate-400 mt-1">Registration Cost</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-400">7-10 Days</p><p className="text-xs text-slate-400 mt-1">Processing Time</p></div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center"><p className="text-2xl font-bold text-emerald-400">Annual</p><p className="text-xs text-slate-400 mt-1">Renewal Required</p></div>
      </div>
      {guidance && (
        <div className="mb-6 p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <div className="flex justify-between items-start mb-3"><h2 className="text-lg font-semibold text-emerald-400">AI Guidance</h2><button onClick={() => setGuidance(null)} className="text-slate-500 hover:text-white">&times;</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{guidance}</pre>
        </div>
      )}
      <div className="space-y-4">
        {STEPS.map(s => (
          <div key={s.step} className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-lg">{s.step}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between"><h3 className="font-semibold">{s.title}</h3><button onClick={() => getGuidance(s.title)} disabled={asking} className="px-3 py-1 bg-emerald-600/10 text-emerald-400 rounded text-xs hover:bg-emerald-600/20 disabled:opacity-50">Get Help</button></div>
                <p className="text-sm text-slate-400 mt-1">{s.desc}</p>
                <ul className="mt-2 space-y-1">{s.tips.map((t, i) => (<li key={i} className="text-xs text-slate-500 flex items-start gap-1"><span className="text-emerald-500 mt-0.5">&bull;</span>{t}</li>))}</ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
