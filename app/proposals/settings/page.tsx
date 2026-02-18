"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProposalSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    default_font: "Times New Roman",
    default_font_size: "12",
    default_margins: "1 inch",
    default_line_spacing: "1.0",
    auto_compliance_check: true,
    auto_save_interval: 30,
    require_review: false,
    default_template: "none",
    include_cover_letter: true,
    include_table_of_contents: true,
    ai_tone: "professional",
    ai_detail_level: "detailed",
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
      if (data?.settings?.proposals) {
        setSettings(prev => ({ ...prev, ...data.settings.proposals }));
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
        settings: { ...(profile?.settings || {}), proposals: settings },
      }).eq("id", session.user.id);
    }
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Proposal Settings</h1>
        <p className="text-slate-400 mt-1">Configure default formatting, AI behavior, and workflow preferences</p>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Formatting Defaults</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Font</label>
              <select value={settings.default_font} onChange={e => setSettings(p => ({ ...p, default_font: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                {["Times New Roman", "Arial", "Calibri", "Georgia", "Helvetica"].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Font Size</label>
              <select value={settings.default_font_size} onChange={e => setSettings(p => ({ ...p, default_font_size: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                {["10", "11", "12", "14"].map(s => <option key={s}>{s}pt</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Margins</label>
              <select value={settings.default_margins} onChange={e => setSettings(p => ({ ...p, default_margins: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                {["0.5 inch", "0.75 inch", "1 inch", "1.25 inch"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Line Spacing</label>
              <select value={settings.default_line_spacing} onChange={e => setSettings(p => ({ ...p, default_line_spacing: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                {["1.0", "1.15", "1.5", "2.0"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">AI Writing Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Tone</label>
              <select value={settings.ai_tone} onChange={e => setSettings(p => ({ ...p, ai_tone: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                {["professional", "formal", "technical", "persuasive", "concise"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Detail Level</label>
              <select value={settings.ai_detail_level} onChange={e => setSettings(p => ({ ...p, ai_detail_level: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                {["brief", "moderate", "detailed", "comprehensive"].map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Workflow</h2>
          <div className="space-y-4">
            {[
              { key: "auto_compliance_check", label: "Auto Compliance Check", desc: "Run compliance checks automatically when sections are generated" },
              { key: "require_review", label: "Require Review Before Submit", desc: "Proposals must be reviewed before they can be submitted" },
              { key: "include_cover_letter", label: "Include Cover Letter", desc: "Generate a cover letter section by default" },
              { key: "include_table_of_contents", label: "Include Table of Contents", desc: "Auto-generate a table of contents" },
            ].map(opt => (
              <div key={opt.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-slate-400">{opt.desc}</p>
                </div>
                <button onClick={() => setSettings(p => ({ ...p, [opt.key]: !p[opt.key as keyof typeof p] }))} className={`w-11 h-6 rounded-full transition-colors relative ${settings[opt.key as keyof typeof settings] ? "bg-emerald-600" : "bg-slate-700"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings[opt.key as keyof typeof settings] ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
            <div>
              <label className="text-sm font-medium">Auto-Save Interval (seconds)</label>
              <select value={settings.auto_save_interval} onChange={e => setSettings(p => ({ ...p, auto_save_interval: parseInt(e.target.value) }))} className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                {[15, 30, 60, 120].map(s => <option key={s} value={s}>{s}s</option>)}
              </select>
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving} className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
