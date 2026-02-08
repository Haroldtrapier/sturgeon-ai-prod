"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Section { id: string; section_name: string; content: string; created_at: string }
interface Requirement { id: string; requirement: string; section_ref: string; status: string }

export default function ProposalDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [proposal, setProposal] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sectionName, setSectionName] = useState("Executive Summary");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      await fetchProposal(session.access_token);
    };
    init();
  }, [router, id]);

  async function fetchProposal(t: string) {
    try {
      const res = await fetch(`${API}/proposals/${id}`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setProposal(data.proposal);
        setSections(data.sections || []);
        setRequirements(data.compliance_matrix || []);
        setStats(data.stats || {});
      }
    } catch { /* empty */ }
    setLoading(false);
  }

  async function generateSection(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/proposals/${id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ section_name: sectionName }),
      });
      if (res.ok) {
        setMessage(`Section "${sectionName}" generated successfully.`);
        await fetchProposal(token);
      } else { setMessage("Failed to generate section."); }
    } catch { setMessage("Error generating section."); }
    setGenerating(false);
  }

  async function requestReview() {
    try {
      await fetch(`${API}/reviews/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ proposal_id: id }),
      });
      setMessage("Human review requested. A reviewer will contact you.");
    } catch { setMessage("Failed to request review."); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;
  if (!proposal) return <div className="max-w-4xl mx-auto px-4 py-8"><p className="text-slate-400">Proposal not found.</p></div>;

  const compliancePct = stats.total_requirements > 0 ? Math.round((stats.addressed / stats.total_requirements) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{proposal.title}</h1>
          <p className="text-slate-400 mt-1">{proposal.opportunities?.title || "No linked opportunity"}</p>
        </div>
        <div className="flex gap-3">
          <a href={`${API}/submission/package/${id}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm">Export Package</a>
          <button onClick={requestReview} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium text-sm">Request Review ($99)</button>
        </div>
      </div>

      {message && <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.sections_count || 0}</p>
          <p className="text-sm text-slate-400">Sections</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.total_requirements || 0}</p>
          <p className="text-sm text-slate-400">Requirements</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.addressed || 0}</p>
          <p className="text-sm text-slate-400">Addressed</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold" style={{ color: compliancePct >= 80 ? "#34d399" : compliancePct >= 50 ? "#fbbf24" : "#f87171" }}>{compliancePct}%</p>
          <p className="text-sm text-slate-400">Compliance</p>
        </div>
      </div>

      {/* Generate Section */}
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Generate Section with AI</h2>
        <form onSubmit={generateSection} className="flex gap-3">
          <select value={sectionName} onChange={(e) => setSectionName(e.target.value)} className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none">
            <option>Executive Summary</option>
            <option>Technical Approach</option>
            <option>Management Approach</option>
            <option>Past Performance</option>
            <option>Staffing Plan</option>
            <option>Quality Assurance</option>
            <option>Risk Mitigation</option>
            <option>Cost Narrative</option>
          </select>
          <button type="submit" disabled={generating} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
            {generating ? "Generating..." : "Generate"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sections */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Proposal Sections</h2>
          {sections.length === 0 ? (
            <p className="text-slate-500 p-4 bg-slate-900 border border-slate-800 rounded-xl">No sections generated yet. Use the form above to generate your first section.</p>
          ) : (
            <div className="space-y-4">
              {sections.map((s) => (
                <div key={s.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <h3 className="font-semibold text-emerald-400 mb-2">{s.section_name}</h3>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap line-clamp-6">{s.content}</p>
                  <p className="text-xs text-slate-500 mt-2">{new Date(s.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compliance Matrix */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Compliance Matrix</h2>
          {requirements.length === 0 ? (
            <p className="text-slate-500 p-4 bg-slate-900 border border-slate-800 rounded-xl">No compliance requirements extracted.</p>
          ) : (
            <div className="space-y-2">
              {requirements.map((r) => (
                <div key={r.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-start gap-3">
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${r.status === "addressed" ? "bg-emerald-400" : "bg-red-400"}`} />
                  <div>
                    <p className="text-sm">{r.requirement}</p>
                    {r.section_ref && <p className="text-xs text-slate-500 mt-1">Ref: {r.section_ref}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
