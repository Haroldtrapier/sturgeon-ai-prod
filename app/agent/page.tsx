"use client";

import { useState } from "react";

export default function AgentPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  async function sendMessage() {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);

    setInput("");

    try {
      // Call backend agent API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/agent/ask`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input.trim() }),
        }
      );

      if (!response.ok) throw new Error("Agent API error");

      const data = await response.json();
      const botResponse = {
        role: "assistant",
        content: data.response || "Sorry, I couldn't process that.",
      };

      setMessages((m) => [...m, botResponse]);
    } catch (error) {
      const errorMsg = {
        role: "assistant",
        content: "Error connecting to AI agent. Please try again.",
      };
      setMessages((m) => [...m, errorMsg]);
    }
  }

  return (
    <div className="h-[80vh] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">AI Assistant (AgentKit)</h1>
        <p className="text-sm text-slate-400">
          This will connect to your Sturgeon Agent via OpenAI AgentKit & ChatKit.
        </p>
      </div>

      <div className="flex-1 border border-slate-800 rounded-xl bg-slate-900/70 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`px-3 py-2 rounded-lg text-sm ${
              m.role === "user"
                ? "bg-emerald-500 text-slate-950 self-end"
                : "bg-slate-800 text-slate-100"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          placeholder="Ask your AI assistant anything…"
        />
        <button
          onClick={sendMessage}
          className="rounded-lg bg-emerald-500 text-slate-950 px-4 text-sm font-semibold hover:bg-emerald-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}
