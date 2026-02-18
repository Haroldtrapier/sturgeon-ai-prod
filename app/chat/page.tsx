"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AIChatPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; agent?: string }>>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [activeAgent, setActiveAgent] = useState("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  const AGENTS = [
    { id: "general", name: "General Assistant", desc: "General gov-con questions", color: "bg-blue-600" },
    { id: "research", name: "Research Agent", desc: "Contract & market research", color: "bg-purple-600" },
    { id: "opportunity", name: "Opportunity Analyst", desc: "Bid/no-bid decisions", color: "bg-amber-600" },
    { id: "compliance", name: "Compliance Specialist", desc: "FAR, DFARS, CMMC", color: "bg-red-600" },
    { id: "proposal", name: "Proposal Assistant", desc: "Proposal writing help", color: "bg-emerald-600" },
    { id: "market", name: "Market Analyst", desc: "Spending & competitor intel", color: "bg-cyan-600" },
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

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setSending(true);
    try {
      const res = await fetch(`${API}/api/agents/chat`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ agent_type: activeAgent, message: userMsg }) });
      if (res.ok) {
        const d = await res.json();
        const response = typeof d.response === "string" ? d.response : JSON.stringify(d.response || d, null, 2);
        setMessages(prev => [...prev, { role: "assistant", content: response, agent: activeAgent }]);
      } else { setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]); }
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please check your network." }]); }
    setSending(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const currentAgent = AGENTS.find(a => a.id === activeAgent)!;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-6xl mx-auto">
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">AI Chat</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/chat/history")} className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700">History</button>
            <button onClick={() => setMessages([])} className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700">Clear</button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {AGENTS.map(a => (
            <button key={a.id} onClick={() => setActiveAgent(a.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeAgent === a.id ? `${a.color} text-white` : "bg-slate-800 text-slate-400 hover:text-white"}`}>{a.name}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className={`w-12 h-12 rounded-full ${currentAgent.color} mx-auto mb-4 flex items-center justify-center text-white font-bold`}>{currentAgent.name[0]}</div>
            <h2 className="text-lg font-semibold">{currentAgent.name}</h2>
            <p className="text-sm text-slate-400 mt-1">{currentAgent.desc}</p>
            <p className="text-xs text-slate-500 mt-4">Ask me anything about government contracting</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 ${msg.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-200"}`}>
              {msg.role === "assistant" && msg.agent && <p className="text-xs text-slate-400 mb-1">{AGENTS.find(a => a.id === msg.agent)?.name}</p>}
              <pre className="text-sm whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start"><div className="bg-slate-800 rounded-xl px-4 py-3"><div className="flex gap-1"><div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" /><div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} /><div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} /></div></div></div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex-shrink-0 px-4 py-3 border-t border-slate-800">
        <div className="flex gap-3">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={`Ask the ${currentAgent.name}...`} disabled={sending} className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:opacity-50" />
          <button type="submit" disabled={sending || !input.trim()} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">Send</button>
        </div>
      </form>
    </div>
  );
}
