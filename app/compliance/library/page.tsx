"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegulationLibraryPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const REGULATIONS = [
    { category: "FAR", title: "Federal Acquisition Regulation", citations: "48 CFR Chapter 1", desc: "Primary regulation for all federal executive agency acquisitions", link: "https://www.acquisition.gov/far" },
    { category: "DFARS", title: "Defense FAR Supplement", citations: "48 CFR Chapter 2", desc: "DoD-specific acquisition regulations supplementing FAR", link: "https://www.acquisition.gov/dfars" },
    { category: "DFARS", title: "DFARS 252.204-7012", citations: "Safeguarding Covered Defense Information", desc: "Cyber incident reporting, NIST SP 800-171 compliance", link: "" },
    { category: "DFARS", title: "DFARS 252.204-7021", citations: "CMMC Requirements", desc: "Contractor CMMC level assessment requirements", link: "" },
    { category: "SBA", title: "13 CFR Part 121", citations: "Small Business Size Regulations", desc: "Size standards for small business programs", link: "" },
    { category: "SBA", title: "13 CFR Part 124", citations: "8(a) Business Development", desc: "8(a) program eligibility and procedures", link: "" },
    { category: "SBA", title: "13 CFR Part 125", citations: "Government Contracting Programs", desc: "HUBZone, SDVOSB, WOSB program rules", link: "" },
    { category: "SBA", title: "13 CFR Part 126", citations: "HUBZone Program", desc: "HUBZone certification and contracting", link: "" },
    { category: "CAS", title: "Cost Accounting Standards", citations: "48 CFR Chapter 99", desc: "Standards for cost accounting by government contractors", link: "" },
    { category: "TINA", title: "Truth in Negotiations Act", citations: "10 U.S.C. 3702", desc: "Cost or pricing data requirements for negotiated contracts", link: "" },
    { category: "Cyber", title: "NIST SP 800-171", citations: "Rev 2 / Rev 3", desc: "Protecting CUI in nonfederal systems", link: "" },
    { category: "Cyber", title: "NIST SP 800-53", citations: "Rev 5", desc: "Security and privacy controls for information systems", link: "" },
    { category: "Ethics", title: "Procurement Integrity Act", citations: "41 U.S.C. 2102-2107", desc: "Restrictions on obtaining/disclosing procurement information", link: "" },
    { category: "Ethics", title: "Organizational Conflicts of Interest", citations: "FAR Subpart 9.5", desc: "OCI identification, avoidance, and mitigation", link: "" },
    { category: "Labor", title: "Service Contract Labor Standards", citations: "41 U.S.C. 6701-6707", desc: "Wage determinations for service contracts", link: "" },
    { category: "Labor", title: "Davis-Bacon Act", citations: "40 U.S.C. 3141-3148", desc: "Prevailing wages for construction contracts", link: "" },
  ];

  const categories = ["all", ...Array.from(new Set(REGULATIONS.map(r => r.category)))];

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

  async function askAboutRegulation(title: string) {
    setAsking(true); setAiResult(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "compliance", message: `Explain ${title} in the context of federal government contracting. Include: 1) What it requires 2) Who it applies to 3) Key compliance steps 4) Common violations to avoid 5) Tips for small businesses.` }) });
      if (res.ok) { const d = await res.json(); setAiResult(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setAsking(false);
  }

  const filtered = REGULATIONS.filter(r => (activeCategory === "all" || r.category === activeCategory) && (!searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.desc.toLowerCase().includes(searchQuery.toLowerCase())));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Regulation Library</h1><p className="text-slate-400 mt-1">Browse federal contracting regulations and standards</p></div>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input type="text" placeholder="Search regulations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
        <div className="flex flex-wrap gap-2">{categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${activeCategory === c ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>{c === "all" ? "All" : c}</button>
        ))}</div>
      </div>
      {aiResult && (
        <div className="mb-6 p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <div className="flex justify-between items-start mb-3"><h2 className="text-lg font-semibold text-emerald-400">AI Explanation</h2><button onClick={() => setAiResult(null)} className="text-slate-500 hover:text-white">&times;</button></div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">{aiResult}</pre>
        </div>
      )}
      <div className="space-y-3">
        {filtered.map((r, i) => (
          <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-slate-800 rounded text-xs text-emerald-400 font-medium">{r.category}</span>
                  <h3 className="font-medium text-sm">{r.title}</h3>
                </div>
                <p className="text-xs text-slate-500">{r.citations}</p>
                <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
              </div>
              <button onClick={() => askAboutRegulation(r.title)} disabled={asking} className="ml-3 px-3 py-1 bg-emerald-600/10 text-emerald-400 rounded text-xs hover:bg-emerald-600/20 disabled:opacity-50">Explain</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
