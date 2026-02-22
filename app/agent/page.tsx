'use client';

import { useState } from 'react';

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export default function AgentPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          context: {} 
        }),
      });

      const data = await response.json();

      const agentMessage: ChatMessage = {
        role: 'agent',
        content: data.reply || data.error || 'No response received',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        role: 'agent',
        content: `Error: ${err.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-sand-50 text-stone-800 flex flex-col">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-lime-700">AI Assistant</h1>
          <p className="text-stone-500 mt-1">
            Ask questions about opportunities, get proposal help, or analyze contracts
          </p>
        </div>

        <div className="flex-1 bg-stone-100 border border-stone-200 rounded-xl p-4 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-stone-8000 mt-8">
              <p className="mb-4">👋 Hi! I'm your Harpoon AI Assistant.</p>
              <p className="text-sm">Ask me about:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Analyzing contract opportunities</li>
                <li>• Drafting proposal sections</li>
                <li>• Understanding requirements</li>
                <li>• Pricing strategies</li>
              </ul>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-lime-700 text-white'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">
                    {msg.role === 'user' ? 'You' : '🤖 AI Assistant'}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  <div className="text-xs opacity-60 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-stone-100 text-stone-700 rounded-lg px-4 py-3 max-w-[80%]">
                <div className="text-sm font-semibold mb-1">🤖 AI Assistant</div>
                <div className="text-sm text-stone-500 animate-pulse">Thinking...</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask your AI assistant anything... (Press Enter to send)"
            rows={2}
            className="flex-1 px-4 py-3 bg-white border border-stone-300 rounded-lg text-stone-700 placeholder-slate-500 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 outline-none transition resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-lime-700 hover:bg-lime-800 disabled:bg-stone-200 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
