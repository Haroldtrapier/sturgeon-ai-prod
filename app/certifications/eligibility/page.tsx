"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EligibilityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<{ cert: string; eligible: boolean; reason: string }[] | null>(null);
  const [checking, setChecking] = useState(false);
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

  const QUESTIONS = [
    { id: "veteran", label: "Is the business owner a service-disabled veteran?", options: ["Yes", "No"] },
    { id: "ownership", label: "Does the owner hold at least 51% ownership?", options: ["Yes", "No"] },
    { id: "small_business", label: "Does the business meet SBA size standards?", options: ["Yes", "No", "Not sure"] },
    { id: "location", label: "Is the business located in a HUBZone?", options: ["Yes", "No", "Not sure"] },
    { id: "women_owned", label: "Is the business at least 51% owned by women?", options: ["Yes", "No"] },
    { id: "disadvantaged", label: "Is the owner socially and economically disadvantaged?", options: ["Yes", "No", "Not sure"] },
    { id: "revenue", label: "What is the annual revenue range?", options: ["Under $1M", "$1M-$5M", "$5M-$25M", "$25M+"] },
    { id: "employees", label: "Number of employees?", options: ["1-10", "11-50", "51-250", "250+"] },
  ];

  async function checkEligibility(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setResults(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          agent_type: "compliance",
          message: `Based on these company characteristics, determine eligibility for each certification type (SDVOSB, 8(a), HUBZone, WOSB/EDWOSB, GSA Schedule, CMMC). For each, say if they are likely eligible and why. Company info: ${JSON.stringify(answers)}. Return a structured analysis.`,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        const text = typeof d.response === "string" ? d.response : JSON.stringify(d.response || d);
        const certs = [
          { cert: "SDVOSB", eligible: answers.veteran === "Yes" && answers.ownership === "Yes", reason: "" },
          { cert: "8(a) Business Development", eligible: answers.disadvantaged === "Yes" && answers.small_business === "Yes", reason: "" },
          { cert: "HUBZone", eligible: answers.location === "Yes" && answers.small_business === "Yes", reason: "" },
          { cert: "WOSB/EDWOSB", eligible: answers.women_owned === "Yes" && answers.ownership === "Yes", reason: "" },
          { cert: "GSA Schedule", eligible: answers.small_business === "Yes", reason: "" },
          { cert: "CMMC Level 2", eligible: true, reason: "" },
        ];
        certs.forEach(c => { c.reason = text.includes(c.cert) ? "See AI analysis below" : c.eligible ? "Likely eligible based on answers" : "May not meet requirements"; });
        setResults(certs);
      }
    } catch {}
    setChecking(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Certification Eligibility Checker</h1>
        <p className="text-slate-400 mt-1">Answer questions below to see which certifications your business may qualify for</p>
      </div>

      <form onSubmit={checkEligibility} className="space-y-4 mb-8">
        {QUESTIONS.map(q => (
          <div key={q.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <p className="text-sm font-medium mb-3">{q.label}</p>
            <div className="flex flex-wrap gap-2">
              {q.options.map(o => (
                <button key={o} type="button" onClick={() => setAnswers(prev => ({ ...prev, [q.id]: o }))} className={`px-4 py-2 rounded-lg text-sm border transition-colors ${answers[q.id] === o ? "bg-emerald-600 border-emerald-600 text-white" : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"}`}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button type="submit" disabled={checking || Object.keys(answers).length < 3} className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
          {checking ? "Analyzing Eligibility..." : "Check Eligibility"}
        </button>
      </form>

      {results && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Eligibility Results</h2>
          <div className="space-y-3">
            {results.map(r => (
              <div key={r.cert} className={`p-4 rounded-xl border ${r.eligible ? "bg-emerald-900/20 border-emerald-800" : "bg-slate-900 border-slate-800"}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{r.cert}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.eligible ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400"}`}>
                    {r.eligible ? "Likely Eligible" : "May Not Qualify"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{r.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
