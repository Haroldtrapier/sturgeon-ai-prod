"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProposalHelpChatPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([{ role: "assistant", content: "I'm the Proposal Writing Assistant. I can help draft proposal sections, develop win themes, create executive summaries, write past performance narratives, and review your content. What would you like to work on?" }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const QUICK_PROMPTS = ["Draft a technical approach section", "Write an executive summary", "Generate win themes for my proposal", "Create a management approach outline", "Help with past performance narrative"];

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setToken(session.access_token); setLoading(false); }; init(); }, [router]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(msg: string) {
    if (!msg.trim() || sending) return;
    setInput(""); setMessages(prev => [...prev, { role: "user", content: msg }]); setSending(true);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "proposal", message: msg }) });
      if (res.ok) { const d = await res.json(); setMessages(prev => [...prev, { role: "assistant", content: typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2) }]); }
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error." }]); }
    setSending(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      <div className="flex-shrink-0 px-4 py-3 border-b border-stone-200"><h1 className="text-xl font-bold">Proposal Help</h1><p className="text-xs text-stone-500">Powered by the Proposal Writing Assistant</p></div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (<div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-xl px-4 py-3 ${m.role === "user" ? "bg-lime-700 text-white" : "bg-stone-100 text-stone-600"}`}><pre className="text-sm whitespace-pre-wrap font-sans">{m.content}</pre></div></div>))}
        {sending && <div className="flex justify-start"><div className="bg-stone-100 rounded-xl px-4 py-3 text-sm text-stone-500">Drafting proposal content...</div></div>}
        <div ref={endRef} />
      </div>
      {messages.length <= 1 && (<div className="px-4 pb-2 flex flex-wrap gap-2">{QUICK_PROMPTS.map(p => (<button key={p} onClick={() => send(p)} className="px-3 py-1.5 bg-stone-100 border border-stone-300 rounded-lg text-xs text-stone-600 hover:border-lime-600 hover:text-lime-700 transition-colors">{p}</button>))}</div>)}
      <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex-shrink-0 px-4 py-3 border-t border-stone-200">
        <div className="flex gap-3"><input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask for proposal writing help..." disabled={sending} className="flex-1 px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none disabled:opacity-50" /><button type="submit" disabled={sending || !input.trim()} className="px-6 py-3 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 font-medium">Send</button></div>
      </form>
    </div>
  );
}
