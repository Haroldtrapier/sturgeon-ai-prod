"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProposalTemplatesPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedTemplate, setGeneratedTemplate] = useState<string | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const TEMPLATES = [
    { id: "technical_approach", name: "Technical Approach", desc: "Detailed technical solution, methodology, and approach to meeting requirements", sections: ["Understanding of Requirements", "Technical Solution", "Methodology", "Tools & Technologies", "Risk Mitigation"] },
    { id: "management_approach", name: "Management Approach", desc: "Project management plan, staffing, quality control, and organizational structure", sections: ["Management Plan", "Organizational Chart", "Key Personnel", "Quality Assurance", "Communication Plan"] },
    { id: "past_performance", name: "Past Performance", desc: "Relevant experience, contract references, and performance history", sections: ["Contract References", "Relevance Summary", "Performance Metrics", "Lessons Learned", "Client Testimonials"] },
    { id: "staffing_plan", name: "Staffing Plan", desc: "Personnel qualifications, labor categories, and recruitment strategy", sections: ["Labor Categories", "Key Personnel Resumes", "Staffing Approach", "Retention Strategy", "Surge Capability"] },
    { id: "cost_volume", name: "Cost/Price Volume", desc: "Pricing strategy, cost breakdown, and basis of estimate", sections: ["Cost Summary", "Labor Rates", "ODCs", "Subcontractor Costs", "Basis of Estimate"] },
    { id: "executive_summary", name: "Executive Summary", desc: "High-level overview of solution, qualifications, and value proposition", sections: ["Company Overview", "Solution Summary", "Key Differentiators", "Value Proposition", "Conclusion"] },
    { id: "transition_plan", name: "Transition Plan", desc: "Phase-in/phase-out approach for contract transition", sections: ["Transition Timeline", "Knowledge Transfer", "Staffing Ramp-Up", "Risk Mitigation", "Continuity of Operations"] },
    { id: "small_business_plan", name: "Small Business Subcontracting Plan", desc: "Small business utilization goals and outreach strategy", sections: ["Goals by Category", "Outreach Methods", "Monitoring & Compliance", "Good Faith Efforts", "Point of Contact"] },
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

  async function generateTemplate(template: typeof TEMPLATES[0]) {
    setGenerating(template.id); setGeneratedTemplate(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "proposal", message: `Generate a detailed proposal template for a "${template.name}" volume. Include the following sections: ${template.sections.join(", ")}. For each section, provide: section header, instructions on what to write, sample content outline, page length guidance, and common evaluation criteria. Make it specific to federal government contracting proposals.` }) });
      if (res.ok) { const d = await res.json(); setGeneratedTemplate(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setGenerating(null);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Proposal Templates</h1><p className="text-slate-400 mt-1">AI-powered templates for every proposal volume</p></div>
      {generatedTemplate && (
        <div className="mb-8 p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <div className="flex justify-between items-start mb-3"><h2 className="text-lg font-semibold text-emerald-400">Generated Template</h2><button onClick={() => setGeneratedTemplate(null)} className="text-slate-500 hover:text-white">&times;</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{generatedTemplate}</pre>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map(t => (
          <div key={t.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
            <h3 className="font-semibold mb-1">{t.name}</h3>
            <p className="text-xs text-slate-400 mb-3">{t.desc}</p>
            <div className="flex flex-wrap gap-1 mb-3">{t.sections.map(s => (<span key={s} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300">{s}</span>))}</div>
            <button onClick={() => generateTemplate(t)} disabled={generating !== null} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">{generating === t.id ? "Generating..." : "Generate Template"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
