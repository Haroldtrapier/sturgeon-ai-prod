"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ComplianceCheck {
  id: string;
  proposal_id: string;
  score: number;
  issues: Array<{ section: string; issue: string; severity: string; suggestion: string }>;
  checked_at: string;
}

export default function CompliancePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [proposalId, setProposalId] = useState("");
  const [rfpText, setRfpText] = useState("");
  const [results, setResults] = useState<ComplianceCheck | null>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"check" | "extract">("check");

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

  async function runCheck(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true); setMessage("");
    try {
      const res = await fetch(`${API}/api/compliance/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ proposal_id: proposalId }),
      });
      if (res.ok) { setResults(await res.json()); }
      else { setMessage("Compliance check failed."); }
    } catch { setMessage("Error running compliance check."); }
    setChecking(false);
  }

  async function extractRequirements(e: React.FormEvent) {
    e.preventDefault();
    setExtracting(true); setMessage("");
    try {
      const res = await fetch(`${API}/api/compliance/extract-requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rfp_text: rfpText }),
      });
      if (res.ok) {
        const data = await res.json();
        setRequirements(data.requirements || []);
      } else { setMessage("Extraction failed."); }
    } catch { setMessage("Error extracting requirements."); }
    setExtracting(false);
  }

  const severityColor: Record<string, string> = { high: "text-red-400", medium: "text-yellow-400", low: "text-blue-400" };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Compliance Center</h1>
        <p className="text-slate-400 mt-1">AI-powered compliance checking and requirement extraction</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button onClick={() => setActiveTab("check")} className={`px-4 py-2 rounded-lg font-medium text-sm ${activeTab === "check" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>Compliance Check</button>
        <button onClick={() => setActiveTab("extract")} className={`px-4 py-2 rounded-lg font-medium text-sm ${activeTab === "extract" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>Extract Requirements</button>
      </div>

      {message && <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}

      {activeTab === "check" && (
        <div className="space-y-6">
          <form onSubmit={runCheck} className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold">Run Compliance Check</h2>
            <p className="text-sm text-slate-400">Enter a proposal ID to check it against all extracted compliance requirements.</p>
            <div className="flex gap-3">
              <input type="text" placeholder="Proposal ID" value={proposalId} onChange={(e) => setProposalId(e.target.value)} required className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
              <button type="submit" disabled={checking} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
                {checking ? "Checking..." : "Run Check"}
              </button>
            </div>
          </form>

          {results && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Results</h2>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: results.score >= 80 ? "#34d399" : results.score >= 50 ? "#fbbf24" : "#f87171" }}>{results.score}%</p>
                  <p className="text-xs text-slate-400">Compliance Score</p>
                </div>
              </div>
              {results.issues && results.issues.length > 0 ? (
                <div className="space-y-3">
                  {results.issues.map((issue, i) => (
                    <div key={i} className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{issue.section}</span>
                        <span className={`text-xs font-medium ${severityColor[issue.severity] || "text-slate-400"}`}>{issue.severity?.toUpperCase()}</span>
                      </div>
                      <p className="text-sm text-slate-300">{issue.issue}</p>
                      {issue.suggestion && <p className="text-sm text-emerald-400 mt-2">Suggestion: {issue.suggestion}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-400">All compliance requirements met.</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "extract" && (
        <div className="space-y-6">
          <form onSubmit={extractRequirements} className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h2 className="text-lg font-semibold">Extract Requirements from RFP</h2>
            <p className="text-sm text-slate-400">Paste your RFP text and the AI will extract all SHALL/MUST requirements.</p>
            <textarea placeholder="Paste RFP text here..." value={rfpText} onChange={(e) => setRfpText(e.target.value)} required rows={10} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            <button type="submit" disabled={extracting} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
              {extracting ? "Extracting..." : "Extract Requirements"}
            </button>
          </form>

          {requirements.length > 0 && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">{requirements.length} Requirements Extracted</h2>
              <div className="space-y-2">
                {requirements.map((r, i) => (
                  <div key={i} className="p-3 bg-slate-800 border border-slate-700 rounded-lg flex items-start gap-3">
                    <span className="text-xs font-mono text-emerald-400 mt-0.5 flex-shrink-0">#{i + 1}</span>
                    <div>
                      <p className="text-sm">{r.requirement || r}</p>
                      {r.section_ref && <p className="text-xs text-slate-500 mt-1">Section: {r.section_ref}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
