"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ComplianceHelpChatPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([{ role: "assistant", content: "I'm the Compliance Specialist agent. I can help with FAR/DFARS regulations, CMMC requirements, certification eligibility, SAM.gov registration, and compliance matrix creation. What do you need help with?" }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const QUICK_PROMPTS = ["Explain FAR 52.219-8 small business requirements", "What are the CMMC Level 2 requirements?", "Help me with SAM.gov registration", "What clauses apply to SDVOSB set-asides?", "Review my compliance matrix"];

  useEffect(() => { const init = async () => { const supabase = createClient(); const { data: { session } } = await supabase.auth.getSession(); if (!session) { router.push("/login"); return; } setToken(session.access_token); setLoading(false); }; init(); }, [router]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(msg: string) {
    if (!msg.trim() || sending) return;
    setInput(""); setMessages(prev => [...prev, { role: "user", content: msg }]); setSending(true);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: "compliance", message: msg }) });
      if (res.ok) { const d = await res.json(); setMessages(prev => [...prev, { role: "assistant", content: typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2) }]); }
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error." }]); }
    setSending(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      <div className="flex-shrink-0 px-4 py-3 border-b border-stone-200">
        <h1 className="text-xl font-bold">Compliance Help</h1>
        <p className="text-xs text-stone-500">Powered by the Compliance Specialist Agent</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 ${m.role === "user" ? "bg-lime-700 text-white" : "bg-stone-100 text-stone-600"}`}>
              <pre className="text-sm whitespace-pre-wrap font-sans">{m.content}</pre>
            </div>
          </div>
        ))}
        {sending && <div className="flex justify-start"><div className="bg-stone-100 rounded-xl px-4 py-3 text-sm text-stone-500">Analyzing compliance requirements...</div></div>}
        <div ref={endRef} />
      </div>
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">{QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => send(p)} className="px-3 py-1.5 bg-stone-100 border border-stone-300 rounded-lg text-xs text-stone-600 hover:border-lime-600 hover:text-lime-700 transition-colors">{p}</button>
        ))}</div>
      )}
      <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex-shrink-0 px-4 py-3 border-t border-stone-200">
        <div className="flex gap-3">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about compliance..." disabled={sending} className="flex-1 px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none disabled:opacity-50" />
          <button type="submit" disabled={sending || !input.trim()} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium">Send</button>
        </div>
      </form>
    </div>
  );
}
