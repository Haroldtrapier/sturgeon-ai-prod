"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ChecklistItem {
  id: string;
  section: string;
  requirement: string;
  status: "complete" | "incomplete" | "na";
  notes: string;
}

export default function ComplianceChecklistPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams?.get("proposal_id");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);

      if (proposalId) {
        const { data } = await supabase
          .from("compliance_requirements")
          .select("*")
          .eq("proposal_id", proposalId)
          .order("created_at");
        if (data && data.length > 0) {
          setItems(data.map((d: Record<string, string>) => ({
            id: d.id,
            section: d.section || d.requirement_type || "General",
            requirement: d.requirement || d.description || "",
            status: (d.status as "complete" | "incomplete" | "na") || "incomplete",
            notes: d.notes || "",
          })));
        }
      }
      setLoading(false);
    };
    init();
  }, [router, proposalId]);

  async function generateChecklist() {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/api/compliance/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ proposal_id: proposalId }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.requirements) setItems(d.requirements.map((r: Record<string, string>, i: number) => ({
          id: `gen-${i}`,
          section: r.section || "General",
          requirement: r.requirement || r.description || "",
          status: "incomplete" as const,
          notes: "",
        })));
      }
    } catch {}
    setGenerating(false);
  }

  function toggleStatus(id: string) {
    setItems(prev => prev.map(item => item.id === id ? {
      ...item,
      status: item.status === "incomplete" ? "complete" : item.status === "complete" ? "na" : "incomplete"
    } : item));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const TEMPLATE_ITEMS: ChecklistItem[] = [
    { id: "t1", section: "Administrative", requirement: "Cover letter included and properly addressed", status: "incomplete", notes: "" },
    { id: "t2", section: "Administrative", requirement: "All volumes/sections labeled per RFP instructions", status: "incomplete", notes: "" },
    { id: "t3", section: "Administrative", requirement: "Page limits met for each volume", status: "incomplete", notes: "" },
    { id: "t4", section: "Administrative", requirement: "Correct font size and margins used", status: "incomplete", notes: "" },
    { id: "t5", section: "Technical", requirement: "All evaluation criteria addressed", status: "incomplete", notes: "" },
    { id: "t6", section: "Technical", requirement: "Technical approach aligns with SOW/PWS", status: "incomplete", notes: "" },
    { id: "t7", section: "Technical", requirement: "Key personnel resumes included", status: "incomplete", notes: "" },
    { id: "t8", section: "Past Performance", requirement: "Required number of references provided", status: "incomplete", notes: "" },
    { id: "t9", section: "Past Performance", requirement: "Contract values and periods of performance included", status: "incomplete", notes: "" },
    { id: "t10", section: "Pricing", requirement: "Pricing format matches RFP template", status: "incomplete", notes: "" },
    { id: "t11", section: "Pricing", requirement: "All CLINs priced", status: "incomplete", notes: "" },
    { id: "t12", section: "Compliance", requirement: "Representations and certifications completed", status: "incomplete", notes: "" },
    { id: "t13", section: "Compliance", requirement: "Required FAR/DFARS clauses acknowledged", status: "incomplete", notes: "" },
    { id: "t14", section: "Compliance", requirement: "Small business subcontracting plan (if required)", status: "incomplete", notes: "" },
    { id: "t15", section: "Submission", requirement: "Correct submission method identified", status: "incomplete", notes: "" },
    { id: "t16", section: "Submission", requirement: "Submission deadline confirmed and calendar reminder set", status: "incomplete", notes: "" },
  ];

  const displayItems = items.length > 0 ? items : TEMPLATE_ITEMS;
  const sections = Array.from(new Set(displayItems.map(i => i.section)));
  const complete = displayItems.filter(i => i.status === "complete").length;

  const statusIcon = (s: string) => s === "complete" ? "text-emerald-400" : s === "na" ? "text-slate-500 line-through" : "text-slate-400";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Compliance Checklist</h1>
          <p className="text-slate-400 mt-1">{proposalId ? "Proposal-specific compliance checklist" : "General proposal compliance checklist"}</p>
        </div>
        {proposalId && (
          <button onClick={generateChecklist} disabled={generating} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium">
            {generating ? "Generating..." : "Generate from RFP"}
          </button>
        )}
      </div>

      <div className="mb-6 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-emerald-400">{complete} / {displayItems.length} complete</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${displayItems.length > 0 ? (complete / displayItems.length) * 100 : 0}%` }} />
        </div>
      </div>

      {sections.map(section => (
        <div key={section} className="mb-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-2">{section}</h2>
          <div className="space-y-2">
            {displayItems.filter(i => i.section === section).map(item => (
              <button key={item.id} onClick={() => toggleStatus(item.id)} className="w-full flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg text-left hover:bg-slate-800/50 transition-colors">
                <span className={`text-lg ${item.status === "complete" ? "text-emerald-400" : item.status === "na" ? "text-slate-600" : "text-slate-600"}`}>
                  {item.status === "complete" ? "\u2611" : item.status === "na" ? "\u2013" : "\u2610"}
                </span>
                <span className={`text-sm flex-1 ${statusIcon(item.status)}`}>{item.requirement}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <p className="text-xs text-slate-500 mt-4">Click items to cycle through: incomplete → complete → N/A</p>
    </div>
  );
}
