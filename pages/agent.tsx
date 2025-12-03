"use client";

import { useState } from "react";

export default function AgentPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      // Connect to backend API
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botResponse = {
        role: "assistant",
        content: data.response || "Sorry, I couldn't process that request.",
      };

      setMessages((m) => [...m, botResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorResponse = {
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again.",
      };
      setMessages((m) => [...m, errorResponse]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
        {loading && (
          <div className="px-3 py-2 rounded-lg text-sm bg-slate-800 text-slate-100">
            <span className="animate-pulse">Thinking...</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:opacity-50"
          placeholder="Ask your AI assistant anything…"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="rounded-lg bg-emerald-500 text-slate-950 px-4 text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
