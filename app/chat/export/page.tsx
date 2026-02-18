"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ChatExportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("chat_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      setSessions(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  function selectAll() {
    if (selected.size === sessions.length) setSelected(new Set());
    else setSelected(new Set(sessions.map(s => s.id)));
  }

  async function exportSelected(format: "json" | "csv" | "txt") {
    setExporting(true);
    const supabase = createClient();
    const ids = Array.from(selected);
    const { data: messages } = await supabase.from("chat_messages").select("*").in("session_id", ids).order("created_at", { ascending: true });

    let content = "";
    const filename = `chat-export-${new Date().toISOString().slice(0, 10)}`;

    if (format === "json") {
      content = JSON.stringify({ exported_at: new Date().toISOString(), sessions: ids.length, messages: messages || [] }, null, 2);
    } else if (format === "csv") {
      content = "session_id,role,content,agent_type,created_at\n";
      (messages || []).forEach((m: any) => { content += `"${m.session_id}","${m.role}","${(m.content || "").replace(/"/g, '""')}","${m.agent_type || ""}","${m.created_at}"\n`; });
    } else {
      (messages || []).forEach((m: any) => { content += `[${m.role?.toUpperCase()}] ${m.content}\n\n`; });
    }

    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.${format}`; a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Export Chats</h1><p className="text-slate-400 mt-1">Download your chat conversations</p></div>
        <button onClick={() => router.push("/chat")} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Back to Chat</button>
      </div>
      {selected.size > 0 && (
        <div className="mb-6 p-4 bg-slate-900 border border-emerald-800 rounded-xl flex items-center justify-between">
          <p className="text-sm">{selected.size} session(s) selected</p>
          <div className="flex gap-2">
            <button onClick={() => exportSelected("json")} disabled={exporting} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50">Export JSON</button>
            <button onClick={() => exportSelected("csv")} disabled={exporting} className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50">Export CSV</button>
            <button onClick={() => exportSelected("txt")} disabled={exporting} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 disabled:opacity-50">Export TXT</button>
          </div>
        </div>
      )}
      <div className="mb-4 flex items-center gap-3">
        <button onClick={selectAll} className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700">{selected.size === sessions.length ? "Deselect All" : "Select All"}</button>
        <span className="text-xs text-slate-500">{sessions.length} sessions available</span>
      </div>
      {sessions.length > 0 ? (
        <div className="space-y-2">
          {sessions.map(s => (
            <div key={s.id} onClick={() => toggleSelect(s.id)} className={`p-4 bg-slate-900 border rounded-xl cursor-pointer transition-colors ${selected.has(s.id) ? "border-emerald-600" : "border-slate-800 hover:border-slate-700"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${selected.has(s.id) ? "border-emerald-500 bg-emerald-600" : "border-slate-600"}`}>{selected.has(s.id) && <span className="text-white text-xs">&#10003;</span>}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{s.title || s.first_message || "Chat session"}</p>
                  <p className="text-xs text-slate-500">{new Date(s.created_at).toLocaleDateString()} &middot; {s.agent_type || "general"} &middot; {s.message_count || 0} messages</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">No chat sessions to export</p></div>
      )}
    </div>
  );
}
