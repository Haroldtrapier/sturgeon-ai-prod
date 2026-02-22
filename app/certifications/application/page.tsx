"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CertApplicationGuidePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState("");
  const [guide, setGuide] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const CERTS = [
    { id: "sdvosb", name: "SDVOSB (VetCert)", timeline: "60-90 days", fee: "Free", portal: "SBA VetCert" },
    { id: "8a", name: "8(a) Business Development", timeline: "90-180 days", fee: "Free", portal: "Certify.SBA.gov" },
    { id: "hubzone", name: "HUBZone", timeline: "60-90 days", fee: "Free", portal: "Certify.SBA.gov" },
    { id: "wosb", name: "WOSB / EDWOSB", timeline: "30-90 days", fee: "Free (SBA) / Varies (3rd party)", portal: "Certify.SBA.gov or third-party" },
    { id: "gsa", name: "GSA Schedule (MAS)", timeline: "6-12 months", fee: "Free", portal: "GSA eOffer" },
    { id: "cmmc", name: "CMMC Level 2", timeline: "3-6 months", fee: "$50K-200K", portal: "CMMC-AB certified C3PAO" },
  ];

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setToken(session.access_token); setLoading(false); }; init(); }, [router]);

  async function generateGuide(certId: string) {
    setSelectedCert(certId); setGuide(null); setGenerating(true);
    const cert = CERTS.find(c => c.id === certId);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "compliance", message: `Provide a complete step-by-step application guide for ${cert?.name} certification. Include: 1) Pre-application checklist 2) Required documents with specifics 3) Step-by-step application process 4) Common rejection reasons 5) Tips for first-time applicants 6) What to expect after submission 7) Annual maintenance requirements.` }) });
      if (res.ok) { const d = await res.json(); setGuide(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setGenerating(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Application Guide</h1><p className="text-stone-500 mt-1">Step-by-step guides for certification applications</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {CERTS.map(c => (
          <div key={c.id} onClick={() => generateGuide(c.id)} className={`p-4 bg-white border rounded-xl cursor-pointer transition-colors ${selectedCert === c.id ? "border-lime-600" : "border-stone-200 hover:border-stone-300"}`}>
            <h3 className="font-semibold text-sm">{c.name}</h3>
            <div className="mt-2 space-y-1 text-xs text-stone-500">
              <p>Timeline: <span className="text-stone-600">{c.timeline}</span></p>
              <p>Fee: <span className="text-stone-600">{c.fee}</span></p>
              <p>Portal: <span className="text-stone-600">{c.portal}</span></p>
            </div>
          </div>
        ))}
      </div>
      {generating && <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500 mx-auto mb-3" /><p className="text-sm text-stone-500">Generating application guide...</p></div>}
      {guide && (
        <div className="p-6 bg-white border border-lime-200 rounded-xl">
          <h2 className="text-lg font-semibold mb-4 text-lime-700">{CERTS.find(c => c.id === selectedCert)?.name} Application Guide</h2>
          <pre className="text-sm text-stone-600 whitespace-pre-wrap">{guide}</pre>
        </div>
      )}
    </div>
  );
}
