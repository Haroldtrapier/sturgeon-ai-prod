"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("company");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();
      setProfile(data || { user_id: user.id, email: user.email });
      setLoading(false);
    };
    init();
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("user_profiles").upsert(profile);
    setMessage(error ? "Failed to save." : "Profile saved successfully.");
    setSaving(false);
  }

  function update(field: string, value: any) {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const tabs = ["company", "capabilities", "contacts", "team"];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Company Profile</h1><p className="text-slate-400 mt-1">Manage your business information</p></div>
      {message && <div className="mb-6 p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm">{message}</div>}
      <div className="flex gap-2 mb-6">{tabs.map(t => (
        <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === t ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{t}</button>
      ))}</div>
      <form onSubmit={saveProfile} className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        {activeTab === "company" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs text-slate-400 mb-1">Company Name</label><input type="text" value={profile.company_name || ""} onChange={e => update("company_name", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">DBA Name</label><input type="text" value={profile.dba_name || ""} onChange={e => update("dba_name", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">UEI</label><input type="text" value={profile.uei || ""} onChange={e => update("uei", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">CAGE Code</label><input type="text" value={profile.cage_code || ""} onChange={e => update("cage_code", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">EIN</label><input type="text" value={profile.ein || ""} onChange={e => update("ein", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">Business Type</label>
                <select value={profile.business_type || ""} onChange={e => update("business_type", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
                  <option value="">Select type</option><option>Sole Proprietorship</option><option>LLC</option><option>S-Corporation</option><option>C-Corporation</option><option>Partnership</option>
                </select>
              </div>
            </div>
            <div><label className="block text-xs text-slate-400 mb-1">Address</label><input type="text" value={profile.address || ""} onChange={e => update("address", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs text-slate-400 mb-1">City</label><input type="text" value={profile.city || ""} onChange={e => update("city", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">State</label><input type="text" value={profile.state || ""} onChange={e => update("state", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">ZIP</label><input type="text" value={profile.zip || ""} onChange={e => update("zip", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
            </div>
          </div>
        )}
        {activeTab === "capabilities" && (
          <div className="space-y-4">
            <div><label className="block text-xs text-slate-400 mb-1">NAICS Codes (comma-separated)</label><input type="text" value={(profile.naics_codes || []).join(", ")} onChange={e => update("naics_codes", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Keywords (comma-separated)</label><input type="text" value={(profile.keywords || []).join(", ")} onChange={e => update("keywords", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Capability Statement</label><textarea value={profile.capability_statement || ""} onChange={e => update("capability_statement", e.target.value)} rows={5} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Core Competencies</label><textarea value={profile.core_competencies || ""} onChange={e => update("core_competencies", e.target.value)} rows={3} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
          </div>
        )}
        {activeTab === "contacts" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-xs text-slate-400 mb-1">Primary Contact Name</label><input type="text" value={profile.contact_name || ""} onChange={e => update("contact_name", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">Title</label><input type="text" value={profile.contact_title || ""} onChange={e => update("contact_title", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">Phone</label><input type="text" value={profile.phone || ""} onChange={e => update("phone", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">Website</label><input type="text" value={profile.website || ""} onChange={e => update("website", e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
            </div>
          </div>
        )}
        {activeTab === "team" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Manage your team members and their roles.</p>
            <div className="p-8 border border-dashed border-slate-700 rounded-lg text-center">
              <p className="text-sm text-slate-400">Team management coming soon.</p>
              <p className="text-xs text-slate-500 mt-1">Invite team members, assign roles, and manage access permissions.</p>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{saving ? "Saving..." : "Save Profile"}</button>
        </div>
      </form>
    </div>
  );
}
