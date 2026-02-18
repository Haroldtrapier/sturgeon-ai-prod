"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({ widgets: { stats: true, activity: true, deadlines: true, pipeline: true, quickLinks: true }, refreshInterval: 5, defaultView: "overview" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("user_profiles").select("settings").eq("user_id", user.id).single();
      if (data?.settings?.dashboard) setSettings({ ...settings, ...data.settings.dashboard });
      setLoading(false);
    };
    init();
  }, [router]);

  async function saveSettings() {
    setSaving(true); setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: existing } = await supabase.from("user_profiles").select("settings").eq("user_id", user.id).single();
    const currentSettings = existing?.settings || {};
    const { error } = await supabase.from("user_profiles").upsert({ user_id: user.id, settings: { ...currentSettings, dashboard: settings } });
    setMessage(error ? "Failed to save." : "Settings saved.");
    setSaving(false);
  }

  function toggleWidget(key: string) {
    setSettings((prev: any) => ({ ...prev, widgets: { ...prev.widgets, [key]: !prev.widgets[key] } }));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Dashboard Settings</h1><p className="text-slate-400 mt-1">Customize your dashboard layout and preferences</p></div>
        <button onClick={() => router.push("/dashboard")} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Back</button>
      </div>
      {message && <div className="mb-6 p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm">{message}</div>}
      <div className="space-y-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Visible Widgets</h2>
          <div className="space-y-3">
            {[
              { key: "stats", label: "Statistics Cards", desc: "Proposal count, saved opportunities, certifications" },
              { key: "activity", label: "Recent Activity", desc: "Latest actions and updates" },
              { key: "deadlines", label: "Upcoming Deadlines", desc: "Opportunity response deadlines" },
              { key: "pipeline", label: "Pipeline Summary", desc: "Proposal pipeline overview" },
              { key: "quickLinks", label: "Quick Links", desc: "Shortcut buttons to key features" },
            ].map(w => (
              <div key={w.key} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div><p className="text-sm font-medium">{w.label}</p><p className="text-xs text-slate-400">{w.desc}</p></div>
                <button onClick={() => toggleWidget(w.key)} className={`w-12 h-6 rounded-full transition-colors relative ${settings.widgets[w.key] ? "bg-emerald-600" : "bg-slate-600"}`}><div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settings.widgets[w.key] ? "translate-x-6" : "translate-x-0.5"}`} /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Auto-Refresh Interval</label>
              <select value={settings.refreshInterval} onChange={e => setSettings((s: any) => ({ ...s, refreshInterval: Number(e.target.value) }))} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
                <option value={0}>Disabled</option><option value={1}>1 minute</option><option value={5}>5 minutes</option><option value={15}>15 minutes</option><option value={30}>30 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Default View</label>
              <select value={settings.defaultView} onChange={e => setSettings((s: any) => ({ ...s, defaultView: e.target.value }))} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
                <option value="overview">Overview</option><option value="analytics">Analytics</option><option value="pipeline">Pipeline</option><option value="activity">Activity Feed</option>
              </select>
            </div>
          </div>
        </div>
        <button onClick={saveSettings} disabled={saving} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{saving ? "Saving..." : "Save Settings"}</button>
      </div>
    </div>
  );
}
