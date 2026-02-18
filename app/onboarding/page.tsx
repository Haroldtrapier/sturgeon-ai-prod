"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAICS_OPTIONS = [
  { code: "541512", name: "Computer Systems Design Services" },
  { code: "541511", name: "Custom Computer Programming Services" },
  { code: "541519", name: "Other Computer Related Services" },
  { code: "541330", name: "Engineering Services" },
  { code: "541611", name: "Administrative Management Consulting" },
  { code: "541612", name: "Human Resources Consulting" },
  { code: "541613", name: "Marketing Consulting" },
  { code: "541690", name: "Other Scientific and Technical Consulting" },
  { code: "541715", name: "R&D in Physical, Engineering, and Life Sciences" },
  { code: "561210", name: "Facilities Support Services" },
  { code: "561320", name: "Temporary Staffing Services" },
  { code: "561612", name: "Security Guards and Patrol Services" },
  { code: "236220", name: "Commercial and Institutional Building Construction" },
  { code: "238210", name: "Electrical Contractors" },
  { code: "334111", name: "Electronic Computer Manufacturing" },
  { code: "511210", name: "Software Publishers" },
  { code: "517311", name: "Wired Telecommunications Carriers" },
  { code: "518210", name: "Data Processing, Hosting, and Related Services" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [step, setStep] = useState(1);
  const [selectedNaics, setSelectedNaics] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      // Check if already onboarded
      try {
        const res = await fetch(`${API}/onboarding/status`, { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (res.ok) {
          const data = await res.json();
          if (data.onboarding_completed) { router.push("/dashboard"); return; }
          if (data.naics?.length) setSelectedNaics(data.naics);
          if (data.keywords?.length) setKeywords(data.keywords);
        }
      } catch { /* empty */ }
    };
    init();
  }, [router]);

  function toggleNaics(code: string) {
    setSelectedNaics((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
  }

  function addKeyword() {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      setKeywordInput("");
    }
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  async function saveProfile() {
    setSaving(true); setMessage("");
    try {
      const res = await fetch(`${API}/onboarding/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ naics: selectedNaics, keywords }),
      });
      if (res.ok) { setStep(3); }
      else { setMessage("Failed to save profile."); }
    } catch { setMessage("Error saving profile."); }
    setSaving(false);
  }

  async function completeOnboarding() {
    setSaving(true);
    try {
      await fetch(`${API}/onboarding/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/dashboard");
    } catch { setMessage("Error completing onboarding."); }
    setSaving(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-500"}`}>{s}</div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-emerald-600" : "bg-slate-800"}`} />}
            </div>
          ))}
        </div>

        {message && <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}

        {/* Step 1: NAICS Selection */}
        {step === 1 && (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl">
            <h1 className="text-2xl font-bold mb-2">Welcome to Sturgeon AI</h1>
            <p className="text-slate-400 mb-6">Select the NAICS codes that match your business capabilities.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto mb-6">
              {NAICS_OPTIONS.map((n) => (
                <button key={n.code} onClick={() => toggleNaics(n.code)} className={`p-3 text-left rounded-lg border text-sm ${selectedNaics.includes(n.code) ? "bg-emerald-600/10 border-emerald-600 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"}`}>
                  <span className="font-mono text-xs">{n.code}</span> - {n.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mb-4">{selectedNaics.length} selected</p>
            <button onClick={() => setStep(2)} disabled={selectedNaics.length === 0} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">Continue</button>
          </div>
        )}

        {/* Step 2: Keywords */}
        {step === 2 && (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl">
            <h1 className="text-2xl font-bold mb-2">Your Focus Areas</h1>
            <p className="text-slate-400 mb-6">Add keywords to help us match you with relevant opportunities.</p>
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="e.g., cybersecurity, cloud migration, IT support" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())} className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              <button type="button" onClick={addKeyword} className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {keywords.map((kw) => (
                <span key={kw} className="px-3 py-1 bg-emerald-600/10 text-emerald-400 rounded-full text-sm flex items-center gap-2">
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="text-emerald-400/60 hover:text-emerald-400">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700">Back</button>
              <button onClick={saveProfile} disabled={saving} className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{saving ? "Saving..." : "Save & Continue"}</button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-center">
            <div className="text-6xl mb-4">&#127881;</div>
            <h1 className="text-2xl font-bold mb-2">You're All Set!</h1>
            <p className="text-slate-400 mb-6">Your profile is configured. We'll start matching you with relevant government contracting opportunities.</p>
            <div className="text-left bg-slate-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-300"><span className="text-emerald-400 font-medium">{selectedNaics.length}</span> NAICS codes selected</p>
              <p className="text-sm text-slate-300 mt-1"><span className="text-emerald-400 font-medium">{keywords.length}</span> keywords added</p>
            </div>
            <button onClick={completeOnboarding} disabled={saving} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{saving ? "Completing..." : "Go to Dashboard"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
