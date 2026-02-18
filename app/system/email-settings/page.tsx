"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EmailSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    opportunity_alerts: true,
    daily_digest: true,
    weekly_summary: false,
    proposal_updates: true,
    deadline_reminders: true,
    deadline_days_before: 3,
    certification_expiry: true,
    team_activity: false,
    marketing_emails: false,
    digest_time: "08:00",
    from_name: "Sturgeon AI",
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
      if (data?.settings?.email) {
        setSettings(prev => ({ ...prev, ...data.settings.email }));
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
        settings: { ...(profile?.settings || {}), email: settings },
      }).eq("id", session.user.id);
    }
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const TOGGLES = [
    { key: "opportunity_alerts", label: "Opportunity Alerts", desc: "New opportunities matching your profile", category: "Opportunities" },
    { key: "daily_digest", label: "Daily Digest", desc: "Daily summary of new opportunities and updates", category: "Opportunities" },
    { key: "weekly_summary", label: "Weekly Summary", desc: "Weekly report of pipeline activity", category: "Opportunities" },
    { key: "proposal_updates", label: "Proposal Updates", desc: "Notifications when proposals are reviewed or updated", category: "Proposals" },
    { key: "deadline_reminders", label: "Deadline Reminders", desc: "Reminders before opportunity and proposal deadlines", category: "Proposals" },
    { key: "certification_expiry", label: "Certification Expiry Alerts", desc: "Reminders before certifications expire", category: "Compliance" },
    { key: "team_activity", label: "Team Activity", desc: "Updates when team members take actions", category: "Team" },
    { key: "marketing_emails", label: "Product Updates", desc: "New features and platform announcements", category: "General" },
  ];

  const categories = [...Array.from(new Set(TOGGLES.map(t => t.category)))];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Email Settings</h1>
        <p className="text-slate-400 mt-1">Configure email notification preferences</p>
      </div>

      <div className="space-y-6">
        {categories.map(cat => (
          <div key={cat} className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <h2 className="text-sm font-semibold text-slate-300 mb-4">{cat}</h2>
            <div className="space-y-4">
              {TOGGLES.filter(t => t.category === cat).map(t => (
                <div key={t.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-slate-400">{t.desc}</p>
                  </div>
                  <button onClick={() => setSettings(p => ({ ...p, [t.key]: !p[t.key as keyof typeof p] }))} className={`w-11 h-6 rounded-full transition-colors relative ${settings[t.key as keyof typeof settings] ? "bg-emerald-600" : "bg-slate-700"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings[t.key as keyof typeof settings] ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Timing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Digest Send Time</label>
              <input type="time" value={settings.digest_time} onChange={e => setSettings(p => ({ ...p, digest_time: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Deadline Reminder (days before)</label>
              <select value={settings.deadline_days_before} onChange={e => setSettings(p => ({ ...p, deadline_days_before: parseInt(e.target.value) }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                {[1, 2, 3, 5, 7, 14].map(d => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving} className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
          {saving ? "Saving..." : "Save Email Settings"}
        </button>
      </div>
    </div>
  );
}
