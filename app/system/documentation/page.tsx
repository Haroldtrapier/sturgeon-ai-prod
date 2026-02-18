"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DocumentationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("getting-started");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const SECTIONS = [
    { id: "getting-started", title: "Getting Started", items: [
      { title: "Platform Overview", desc: "Introduction to Sturgeon AI and its core features for government contractors." },
      { title: "Account Setup", desc: "Create your account, set up your company profile, and configure initial settings." },
      { title: "SAM.gov Integration", desc: "Connect your SAM.gov profile for automated opportunity matching." },
      { title: "First Proposal", desc: "Step-by-step guide to creating your first AI-assisted proposal." },
    ]},
    { id: "ai-agents", title: "AI Agents", items: [
      { title: "Research Agent", desc: "Market research, competitor analysis, and opportunity intelligence." },
      { title: "Proposal Agent", desc: "AI-powered proposal drafting, section generation, and compliance checking." },
      { title: "Compliance Agent", desc: "FAR/DFARS guidance, certification tracking, and regulatory compliance." },
      { title: "Market Agent", desc: "Pricing intelligence, set-aside analysis, and spending trends." },
      { title: "Opportunity Agent", desc: "Contract matching, scoring, and pipeline management." },
      { title: "General Agent", desc: "All-purpose GovCon assistant for any questions." },
    ]},
    { id: "opportunities", title: "Opportunities", items: [
      { title: "Contract Search", desc: "Search SAM.gov, eBuy, and FPDS for opportunities matching your capabilities." },
      { title: "ContractMatch Engine", desc: "AI-powered matching scores based on your company profile and past performance." },
      { title: "Watchlist & Alerts", desc: "Track opportunities and receive deadline notifications." },
      { title: "Forecast & Pipeline", desc: "Procurement forecasting and pipeline management tools." },
    ]},
    { id: "proposals", title: "Proposals", items: [
      { title: "Proposal Editor", desc: "Section-by-section editor with AI content generation and compliance checks." },
      { title: "Templates Library", desc: "Pre-built proposal templates for common contract types." },
      { title: "Collaboration", desc: "Team review workflows, comments, and version control." },
      { title: "Past Performance", desc: "Manage past performance records for proposal references." },
      { title: "Win Themes", desc: "AI-generated discriminators and win theme strategies." },
    ]},
    { id: "compliance", title: "Compliance", items: [
      { title: "FAR/DFARS Browser", desc: "Search and reference FAR and DFARS clauses with AI explanations." },
      { title: "CMMC Tracker", desc: "CMMC 2.0 readiness assessment and practice tracking." },
      { title: "SAM Status Tracker", desc: "Monitor SAM.gov registration status and renewal dates." },
      { title: "Representations & Certifications", desc: "Common reps and certs required for government proposals." },
    ]},
    { id: "billing", title: "Billing & Plans", items: [
      { title: "Plan Comparison", desc: "Compare Starter ($97), Professional ($197), and Enterprise ($397) plans." },
      { title: "Upgrade Process", desc: "How to upgrade your plan and manage billing through Stripe." },
      { title: "API Access", desc: "API key management and endpoint documentation for Enterprise users." },
      { title: "White Label", desc: "Resell Sturgeon AI under your own brand with Enterprise plans." },
    ]},
  ];

  const active = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Documentation</h1>
        <p className="text-slate-400 mt-1">Learn how to get the most from Sturgeon AI</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <nav className="md:w-56 shrink-0">
          <ul className="space-y-1">
            {SECTIONS.map(s => (
              <li key={s.id}>
                <button onClick={() => setActiveSection(s.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === s.id ? "bg-emerald-600/20 text-emerald-400 font-medium" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}>
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">{active.title}</h2>
          <div className="space-y-3">
            {active.items.map(item => (
              <div key={item.title} className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-800 transition-colors cursor-pointer">
                <h3 className="font-semibold text-emerald-400">{item.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
