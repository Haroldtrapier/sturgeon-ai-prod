"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ChatHistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("chat_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      setSessions(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  async function deleteSession(id: string) {
    const supabase = createClient();
    await supabase.from("chat_sessions").delete().eq("id", id);
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const agentColors: Record<string, string> = { general: "bg-blue-600", research: "bg-purple-600", opportunity: "bg-amber-600", compliance: "bg-red-600", proposal: "bg-emerald-600", market: "bg-cyan-600" };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Chat History</h1><p className="text-slate-400 mt-1">Previous conversations with AI agents</p></div>
        <button onClick={() => router.push("/chat")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm">New Chat</button>
      </div>
      {sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${agentColors[s.agent_type] || "bg-slate-600"}`} />
                    <span className="text-xs text-slate-400 capitalize">{s.agent_type || "general"} agent</span>
                    <span className="text-xs text-slate-600">&middot;</span>
                    <span className="text-xs text-slate-500">{new Date(s.created_at).toLocaleDateString()} {new Date(s.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-slate-200 line-clamp-2">{s.title || s.first_message || "Chat session"}</p>
                  {s.message_count && <p className="text-xs text-slate-500 mt-1">{s.message_count} messages</p>}
                </div>
                <button onClick={() => deleteSession(s.id)} className="text-slate-600 hover:text-red-400 text-sm ml-3">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400">No chat history yet</p>
          <button onClick={() => router.push("/chat")} className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Start a Chat</button>
        </div>
      )}
    </div>
  );
}
