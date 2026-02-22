"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function HelpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
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

  async function askQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true); setAnswer(null);
    try {
      const res = await fetch(`${API}/api/agents/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agent_type: "general", message: `Help the user with this question about the Harpoon AI platform: "${question}". Provide clear, actionable guidance.` }),
      });
      if (res.ok) { const d = await res.json(); setAnswer(typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2)); }
    } catch {}
    setAsking(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  const FAQ = [
    { q: "How do I search for government contracts?", a: "Navigate to Opportunities > SAM.gov Search to search by keyword, NAICS code, set-aside type, or agency. You can also use ContractMatch for AI-powered opportunity matching." },
    { q: "How does the AI proposal assistant work?", a: "Go to Proposals > Create to start a new proposal. The AI will help generate content section by section based on the RFP requirements. You can edit, regenerate, or refine any section." },
    { q: "What certifications does the platform track?", a: "We track SDVOSB, 8(a), HUBZone, WOSB/EDWOSB, GSA Schedule, and CMMC certifications. Visit Certifications to manage your status and renewal dates." },
    { q: "How do I upgrade my plan?", a: "Go to Pro > Upgrade to compare plans and features. Click the upgrade button for your desired plan to proceed through Stripe checkout." },
    { q: "Can I export my data?", a: "Yes. Proposals can be exported from the proposal editor. Chat history is available at Chat > Export. Full data exports are available under System > Backup." },
    { q: "How does ContractMatch scoring work?", a: "ContractMatch analyzes opportunities against your company profile, NAICS codes, past performance, and certifications to produce a compatibility score from 0-100." },
  ];

  const QUICK_LINKS = [
    { title: "Documentation", href: "/system/documentation", desc: "Full platform guides" },
    { title: "Support", href: "/support", desc: "Submit a ticket" },
    { title: "Chat Training", href: "/chat/training", desc: "GovCon courses" },
    { title: "API Docs", href: "/pro/api", desc: "API reference" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-stone-500 mt-1">Find answers and get support</p>
      </div>

      <form onSubmit={askQuestion} className="mb-8 p-6 bg-white border border-lime-200 rounded-xl">
        <h2 className="text-lg font-semibold mb-3">Ask AI Help Assistant</h2>
        <div className="flex gap-3">
          <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask anything about Harpoon AI..." className="flex-1 px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
          <button type="submit" disabled={asking} className="px-6 py-3 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 font-medium">{asking ? "Thinking..." : "Ask"}</button>
        </div>
        {answer && <pre className="mt-4 text-sm text-stone-600 whitespace-pre-wrap bg-stone-100 p-4 rounded-lg">{answer}</pre>}
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {QUICK_LINKS.map(l => (
          <button key={l.href} onClick={() => router.push(l.href)} className="p-4 bg-white border border-stone-200 rounded-xl text-left hover:border-lime-600 transition-colors">
            <h3 className="font-semibold text-sm text-lime-700">{l.title}</h3>
            <p className="text-xs text-stone-500 mt-1">{l.desc}</p>
          </button>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {FAQ.map(f => (
          <details key={f.q} className="p-4 bg-white border border-stone-200 rounded-xl group">
            <summary className="font-medium text-sm cursor-pointer text-stone-600 group-open:text-lime-700">{f.q}</summary>
            <p className="text-sm text-stone-500 mt-2">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
