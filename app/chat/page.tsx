"use client";

import { motion } from "framer-motion";
import { Send, Mic, Paperclip, Sparkles } from "lucide-react";
import { useState } from "react";

export default function ChatPage() {
  const [messages] = useState([
    { role: "assistant", content: "Hi! I'm your AI assistant. How can I help you find government contracts today?" },
    { role: "user", content: "Show me IT contracts for DOD" },
    { role: "assistant", content: "I found 47 active IT infrastructure contracts from the Department of Defense. The top match is a $2.1M cloud modernization project with a 94% compatibility score. Would you like details?" }
  ]);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div><h1 className="text-xl font-bold">AI Assistant</h1><p className="text-sm text-gray-600">Powered by GPT-4</p></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-2xl px-6 py-4 rounded-2xl ${msg.role === "user" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" : "bg-white shadow-lg"}`}>{msg.content}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border-t p-6">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input type="text" placeholder="Ask anything..." className="flex-1 px-6 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold"><Send size={20} /></button>
        </div>
      </div>
    </div>
  );
}