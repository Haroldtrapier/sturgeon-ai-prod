"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OpportunitySettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_alerts: true,
    daily_digest: true,
    match_threshold: 70,
    auto_save_matches: false,
    alert_before_deadline: 3,
    notify_new_sources: true,
    notify_modifications: true,
    notify_awards: false,
    sources_enabled: ["sam_gov", "ebuy", "fpds", "usaspending"],
  });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase
        .from("user_profiles")
        .select("settings")
        .eq("id", session.user.id)
        .single();
      if (data?.settings?.opportunities) {
        setSettings(prev => ({ ...prev, ...data.settings.opportunities }));
      }
      setLoading(false);
    };
    init();
  }, [router]);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("settings")
        .eq("id", session.user.id)
        .single();
      await supabase.from("user_profiles").update({
        settings: { ...(profile?.settings || {}), opportunities: settings },
      }).eq("id", session.user.id);
    }
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const SOURCES = [
    { id: "sam_gov", name: "SAM.gov" },
    { id: "ebuy", name: "GSA eBuy" },
    { id: "fpds", name: "FPDS.gov" },
    { id: "usaspending", name: "USASpending.gov" },
    { id: "govwin", name: "GovWin" },
    { id: "govspend", name: "GovSpend" },
  ];

  function toggleSource(id: string) {
    setSettings(prev => ({
      ...prev,
      sources_enabled: prev.sources_enabled.includes(id)
        ? prev.sources_enabled.filter(s => s !== id)
        : [...prev.sources_enabled, id],
    }));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Opportunity Settings</h1>
        <p className="text-slate-400 mt-1">Configure alerts, matching, and data source preferences</p>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            {[
              { key: "email_alerts", label: "Email Alerts", desc: "Receive email notifications for new matching opportunities" },
              { key: "daily_digest", label: "Daily Digest", desc: "Get a daily summary of new opportunities" },
              { key: "notify_new_sources", label: "New Opportunity Alerts", desc: "Alert when new opportunities are posted" },
              { key: "notify_modifications", label: "Modification Alerts", desc: "Alert when watched opportunities are modified" },
              { key: "notify_awards", label: "Award Notifications", desc: "Notify when tracked opportunities are awarded" },
            ].map(opt => (
              <div key={opt.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-slate-400">{opt.desc}</p>
                </div>
                <button onClick={() => setSettings(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof typeof prev] }))} className={`w-11 h-6 rounded-full transition-colors relative ${settings[opt.key as keyof typeof settings] ? "bg-emerald-600" : "bg-slate-700"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings[opt.key as keyof typeof settings] ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Matching Preferences</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Match Score Threshold</label>
                <span className="text-sm text-emerald-400">{settings.match_threshold}%</span>
              </div>
              <input type="range" min={30} max={100} value={settings.match_threshold} onChange={e => setSettings(prev => ({ ...prev, match_threshold: parseInt(e.target.value) }))} className="w-full accent-emerald-500" />
              <p className="text-xs text-slate-400 mt-1">Only show opportunities scoring above this threshold</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-Save Matches</p>
                <p className="text-xs text-slate-400">Automatically save high-scoring opportunities</p>
              </div>
              <button onClick={() => setSettings(prev => ({ ...prev, auto_save_matches: !prev.auto_save_matches }))} className={`w-11 h-6 rounded-full transition-colors relative ${settings.auto_save_matches ? "bg-emerald-600" : "bg-slate-700"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.auto_save_matches ? "translate-x-5" : ""}`} />
              </button>
            </div>
            <div>
              <label className="text-sm font-medium">Alert Before Deadline (days)</label>
              <select value={settings.alert_before_deadline} onChange={e => setSettings(prev => ({ ...prev, alert_before_deadline: parseInt(e.target.value) }))} className="mt-1 w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
                {[1, 2, 3, 5, 7, 14].map(d => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Data Sources</h2>
          <div className="space-y-3">
            {SOURCES.map(src => (
              <div key={src.id} className="flex items-center justify-between">
                <span className="text-sm">{src.name}</span>
                <button onClick={() => toggleSource(src.id)} className={`w-11 h-6 rounded-full transition-colors relative ${settings.sources_enabled.includes(src.id) ? "bg-emerald-600" : "bg-slate-700"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.sources_enabled.includes(src.id) ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving} className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
