"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PricingHelpChatPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([{ role: "assistant", content: "I can help with government contract pricing strategy, cost volume development, labor rate analysis, and competitive pricing. I cover T&M, FFP, CPFF, and other contract types. What pricing question do you have?" }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const QUICK_PROMPTS = ["Help with cost volume structure", "Explain GSA pricing methodology", "Build a labor rate table", "FFP vs T&M pricing strategy", "Develop a basis of estimate"];

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setToken(session.access_token); setLoading(false); }; init(); }, [router]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(msg: string) {
    if (!msg.trim() || sending) return;
    setInput(""); setMessages(prev => [...prev, { role: "user", content: msg }]); setSending(true);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "general", message: `As a government contracting pricing expert: ${msg}` }) });
      if (res.ok) { const d = await res.json(); setMessages(prev => [...prev, { role: "assistant", content: typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2) }]); }
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error." }]); }
    setSending(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-800"><h1 className="text-xl font-bold">Pricing Help</h1><p className="text-xs text-slate-400">Government contract pricing strategy assistant</p></div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (<div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-xl px-4 py-3 ${m.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-200"}`}><pre className="text-sm whitespace-pre-wrap font-sans">{m.content}</pre></div></div>))}
        {sending && <div className="flex justify-start"><div className="bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400">Analyzing pricing strategy...</div></div>}
        <div ref={endRef} />
      </div>
      {messages.length <= 1 && (<div className="px-4 pb-2 flex flex-wrap gap-2">{QUICK_PROMPTS.map(p => (<button key={p} onClick={() => send(p)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:border-emerald-600 hover:text-emerald-400 transition-colors">{p}</button>))}</div>)}
      <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex-shrink-0 px-4 py-3 border-t border-slate-800">
        <div className="flex gap-3"><input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about pricing..." disabled={sending} className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50" /><button type="submit" disabled={sending || !input.trim()} className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 font-medium">Send</button></div>
      </form>
    </div>
  );
}
