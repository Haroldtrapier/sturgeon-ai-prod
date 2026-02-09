"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ChatCustomizationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({ default_agent: "general", tone: "professional", response_length: "detailed", include_citations: true, include_recommendations: true, auto_save_chats: true });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("user_profiles").select("settings").eq("user_id", user.id).single();
      if (data?.settings?.chat) setSettings({ ...settings, ...data.settings.chat });
      setLoading(false);
    };
    init();
  }, [router]);

  async function save() {
    setSaving(true); setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: existing } = await supabase.from("user_profiles").select("settings").eq("user_id", user.id).single();
    const current = existing?.settings || {};
    const { error } = await supabase.from("user_profiles").upsert({ user_id: user.id, settings: { ...current, chat: settings } });
    setMessage(error ? "Failed to save." : "Chat preferences saved.");
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Chat Customization</h1><p className="text-slate-400 mt-1">Configure AI agent behavior and preferences</p></div>
      {message && <div className="mb-6 p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm">{message}</div>}
      <div className="space-y-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Default Agent</h2>
          <select value={settings.default_agent} onChange={e => setSettings((s: any) => ({ ...s, default_agent: e.target.value }))} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
            <option value="general">General Assistant</option><option value="research">Research Agent</option><option value="opportunity">Opportunity Analyst</option><option value="compliance">Compliance Specialist</option><option value="proposal">Proposal Assistant</option><option value="market">Market Analyst</option>
          </select>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Response Style</h2>
          <div className="space-y-4">
            <div><label className="block text-sm text-slate-300 mb-1">Tone</label>
              <select value={settings.tone} onChange={e => setSettings((s: any) => ({ ...s, tone: e.target.value }))} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
                <option value="professional">Professional</option><option value="casual">Casual</option><option value="technical">Technical</option><option value="executive">Executive Brief</option>
              </select>
            </div>
            <div><label className="block text-sm text-slate-300 mb-1">Response Length</label>
              <select value={settings.response_length} onChange={e => setSettings((s: any) => ({ ...s, response_length: e.target.value }))} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
                <option value="concise">Concise</option><option value="detailed">Detailed</option><option value="comprehensive">Comprehensive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Features</h2>
          <div className="space-y-3">
            {[
              { key: "include_citations", label: "Include Citations", desc: "Reference specific FAR/DFARS clauses and regulations" },
              { key: "include_recommendations", label: "Include Recommendations", desc: "Add actionable next steps to responses" },
              { key: "auto_save_chats", label: "Auto-Save Conversations", desc: "Automatically save chat history" },
            ].map(f => (
              <div key={f.key} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div><p className="text-sm font-medium">{f.label}</p><p className="text-xs text-slate-400">{f.desc}</p></div>
                <button onClick={() => setSettings((s: any) => ({ ...s, [f.key]: !s[f.key] }))} className={`w-12 h-6 rounded-full transition-colors relative ${settings[f.key] ? "bg-emerald-600" : "bg-slate-600"}`}><div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settings[f.key] ? "translate-x-6" : "translate-x-0.5"}`} /></button>
              </div>
            ))}
          </div>
        </div>
        <button onClick={save} disabled={saving} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{saving ? "Saving..." : "Save Preferences"}</button>
      </div>
    </div>
  );
}
