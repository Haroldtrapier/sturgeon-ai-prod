"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProposalEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams?.get("id");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<any>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      if (proposalId) {
        const { data } = await supabase.from("proposals").select("*").eq("id", proposalId).single();
        if (data) setProposal(data);
      }
      setLoading(false);
    };
    init();
  }, [router, proposalId]);

  async function saveSection() {
    if (!proposal) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("proposals").update({ sections: proposal.sections, updated_at: new Date().toISOString() }).eq("id", proposal.id);
    setSaving(false);
  }

  async function generateContent() {
    if (!proposal?.sections?.[activeSection]) return;
    setGenerating(true);
    try {
      const section = proposal.sections[activeSection];
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "proposal", message: `Write the "${section.title || section.type}" section for a government proposal titled "${proposal.title}". Make it professional, compliant with federal proposal standards, and compelling. Include specific details and metrics where possible.` }) });
      if (res.ok) {
        const d = await res.json();
        const content = typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2);
        const updated = { ...proposal };
        updated.sections[activeSection] = { ...section, content };
        setProposal(updated);
      }
    } catch {}
    setGenerating(false);
  }

  function updateSectionContent(content: string) {
    const updated = { ...proposal };
    updated.sections[activeSection] = { ...updated.sections[activeSection], content };
    setProposal(updated);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  if (!proposal) return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center">
      <p className="text-slate-400 mb-3">No proposal selected</p>
      <button onClick={() => router.push("/proposals")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Go to Proposals</button>
    </div>
  );

  const sections = proposal.sections || [];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-64 bg-slate-900 border-r border-slate-800 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-sm truncate">{proposal.title}</h2>
          <p className="text-xs text-slate-400 mt-1">{sections.length} sections</p>
        </div>
        <div className="p-2">{sections.map((s: any, i: number) => (
          <button key={i} onClick={() => setActiveSection(i)} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${activeSection === i ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}>{s.title || s.type || `Section ${i + 1}`}</button>
        ))}</div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800">
          <h3 className="font-semibold">{sections[activeSection]?.title || sections[activeSection]?.type || "Section"}</h3>
          <div className="flex gap-2">
            <button onClick={generateContent} disabled={generating} className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50">{generating ? "Generating..." : "AI Generate"}</button>
            <button onClick={saveSection} disabled={saving} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          <textarea value={sections[activeSection]?.content || ""} onChange={e => updateSectionContent(e.target.value)} className="w-full h-full min-h-[400px] px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm resize-none" placeholder="Start writing or use AI Generate to create content..." />
        </div>
      </div>
    </div>
  );
}
