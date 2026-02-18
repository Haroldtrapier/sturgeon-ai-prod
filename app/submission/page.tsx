"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SubmissionPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [proposalId, setProposalId] = useState("");
  const [readiness, setReadiness] = useState<any>(null);
  const [brief, setBrief] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

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

  async function seedChecklist() {
    if (!proposalId) return;
    setSeeding(true); setMessage("");
    try {
      const res = await fetch(`${API}/submission/seed_checklist/${proposalId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setMessage("Checklist seeded successfully.");
      else setMessage("Failed to seed checklist.");
    } catch { setMessage("Error seeding checklist."); }
    setSeeding(false);
  }

  async function checkReadiness() {
    if (!proposalId) return;
    setChecking(true); setMessage("");
    try {
      const res = await fetch(`${API}/submission/readiness/${proposalId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setReadiness(data.readiness);
      } else setMessage("Failed to check readiness.");
    } catch { setMessage("Error checking readiness."); }
    setChecking(false);
  }

  async function generateBrief() {
    if (!proposalId) return;
    setGenerating(true); setMessage("");
    try {
      const res = await fetch(`${API}/submission/brief/${proposalId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setBrief(data.brief);
      } else setMessage("Failed to generate brief.");
    } catch { setMessage("Error generating brief."); }
    setGenerating(false);
  }

  function downloadPackage() {
    if (!proposalId) return;
    window.open(`${API}/submission/package/${proposalId}`, "_blank");
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const score = typeof readiness === "number" ? readiness : readiness?.score ?? null;
  const scoreColor = score !== null ? (score >= 100 ? "#34d399" : score >= 70 ? "#fbbf24" : "#f87171") : "#94a3b8";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Submission Center</h1>
        <p className="text-slate-400 mt-1">Prepare and package your proposal for submission</p>
      </div>

      {message && <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}

      {/* Proposal ID Input */}
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Select Proposal</h2>
        <input type="text" placeholder="Enter Proposal ID" value={proposalId} onChange={(e) => setProposalId(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button onClick={seedChecklist} disabled={!proposalId || seeding} className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-600 transition-colors text-left disabled:opacity-50">
          <h3 className="font-semibold text-emerald-400 mb-2">1. Seed Checklist</h3>
          <p className="text-sm text-slate-400">Generate a submission checklist from proposal requirements</p>
          {seeding && <p className="text-xs text-slate-500 mt-2">Seeding...</p>}
        </button>

        <button onClick={checkReadiness} disabled={!proposalId || checking} className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-600 transition-colors text-left disabled:opacity-50">
          <h3 className="font-semibold text-blue-400 mb-2">2. Check Readiness</h3>
          <p className="text-sm text-slate-400">Calculate your submission readiness score</p>
          {checking && <p className="text-xs text-slate-500 mt-2">Checking...</p>}
        </button>

        <button onClick={generateBrief} disabled={!proposalId || generating} className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-purple-600 transition-colors text-left disabled:opacity-50">
          <h3 className="font-semibold text-purple-400 mb-2">3. Generate Brief</h3>
          <p className="text-sm text-slate-400">AI-generated submission brief summary</p>
          {generating && <p className="text-xs text-slate-500 mt-2">Generating...</p>}
        </button>

        <button onClick={downloadPackage} disabled={!proposalId || score === null || score < 100} className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-600 transition-colors text-left disabled:opacity-50">
          <h3 className="font-semibold text-emerald-400 mb-2">4. Download Package</h3>
          <p className="text-sm text-slate-400">Download complete submission package (ZIP)</p>
          {score !== null && score < 100 && <p className="text-xs text-yellow-400 mt-2">Readiness must be 100% to package</p>}
        </button>
      </div>

      {/* Readiness Score */}
      {score !== null && (
        <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <h2 className="text-lg font-semibold mb-4">Readiness Score</h2>
          <p className="text-6xl font-bold" style={{ color: scoreColor }}>{score}%</p>
          <p className="text-sm text-slate-400 mt-2">
            {score >= 100 ? "Ready for submission!" : score >= 70 ? "Almost there. Complete remaining items." : "More work needed. Review checklist."}
          </p>
        </div>
      )}

      {/* Brief */}
      {brief && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Submission Brief</h2>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-slate-800 p-4 rounded-lg">{brief}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
