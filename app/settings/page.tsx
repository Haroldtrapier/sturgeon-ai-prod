"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "account" | "danger">("general");

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setUser(session.user);
      setToken(session.access_token);
      await fetchSettings(session.access_token);
      setLoading(false);
    };
    init();
  }, [router]);

  async function fetchSettings(t: string) {
    try {
      const res = await fetch(`${API}/api/settings`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) setSettings(await res.json());
    } catch { /* empty */ }
  }

  async function saveSettings() {
    setSaving(true); setMessage("");
    try {
      const res = await fetch(`${API}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (res.ok) setMessage("Settings saved.");
      else setMessage("Failed to save settings.");
    } catch { setMessage("Error saving settings."); }
    setSaving(false);
  }

  async function handleExportData() {
    try {
      const res = await fetch(`${API}/api/settings/export`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setMessage(data.message); }
    } catch { setMessage("Error requesting data export."); }
  }

  async function handleDeleteAccount() {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/api/settings/account`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setMessage(data.message); }
    } catch { setMessage("Error scheduling account deletion."); }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      {message && <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}

      <div className="flex gap-2 mb-8 flex-wrap">
        {(["general", "notifications", "account", "danger"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${activeTab === tab ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>{tab === "danger" ? "Danger Zone" : tab}</button>
        ))}
      </div>

      {activeTab === "general" && settings && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
            <select value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
            <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
            <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
          <button onClick={saveSettings} disabled={saving} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{saving ? "Saving..." : "Save Settings"}</button>
        </div>
      )}

      {activeTab === "notifications" && settings && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold">Notification Preferences</h2>
          {[
            { key: "email", label: "Email Notifications" },
            { key: "push", label: "Push Notifications" },
            { key: "sms", label: "SMS Notifications" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer">
              <span className="text-sm">{label}</span>
              <input type="checkbox" checked={settings.notifications?.[key] ?? false} onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, [key]: e.target.checked } })} className="w-4 h-4 accent-emerald-500" />
            </label>
          ))}
          <h3 className="text-sm font-semibold text-slate-400 mt-4">Email Preferences</h3>
          {[
            { key: "daily_digest", label: "Daily Digest" },
            { key: "opportunity_alerts", label: "Opportunity Alerts" },
            { key: "proposal_reminders", label: "Proposal Reminders" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer">
              <span className="text-sm">{label}</span>
              <input type="checkbox" checked={settings.email_preferences?.[key] ?? false} onChange={(e) => setSettings({ ...settings, email_preferences: { ...settings.email_preferences, [key]: e.target.checked } })} className="w-4 h-4 accent-emerald-500" />
            </label>
          ))}
          <button onClick={saveSettings} disabled={saving} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{saving ? "Saving..." : "Save Preferences"}</button>
        </div>
      )}

      {activeTab === "account" && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <p className="text-sm">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Plan</label>
            <p className="text-sm font-semibold text-emerald-400">Free</p>
            <Link href="/billing" className="text-xs text-blue-400 hover:underline">Upgrade Plan</Link>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Member Since</label>
            <p className="text-sm">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}</p>
          </div>
          <button onClick={handleExportData} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm">Export My Data</button>
        </div>
      )}

      {activeTab === "danger" && (
        <div className="p-6 bg-slate-900 border border-red-900/30 rounded-xl space-y-6">
          <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
          <div className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg">
            <div>
              <p className="font-medium text-sm">Sign Out</p>
              <p className="text-xs text-slate-400">Sign out of your account</p>
            </div>
            <button onClick={handleSignOut} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm">Sign Out</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-800 border border-red-900/30 rounded-lg">
            <div>
              <p className="font-medium text-sm text-red-400">Delete Account</p>
              <p className="text-xs text-slate-400">Permanently delete your account and all data</p>
            </div>
            <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Delete Account</button>
          </div>
        </div>
      )}
    </div>
  );
}
