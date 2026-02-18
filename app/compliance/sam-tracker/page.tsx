"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SAMTrackerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [uei, setUei] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const SAM_CHECKLIST = [
    { id: "uei", label: "Unique Entity ID (UEI)", desc: "Obtained from SAM.gov registration" },
    { id: "cage", label: "CAGE Code", desc: "Commercial and Government Entity code" },
    { id: "naics", label: "NAICS Codes", desc: "North American Industry Classification System codes" },
    { id: "core_data", label: "Core Data", desc: "Legal business name, DBA, physical address" },
    { id: "assertions", label: "Assertions", desc: "Goods/services, size standards, SBA certifications" },
    { id: "reps_certs", label: "Reps & Certs", desc: "Representations and Certifications completed" },
    { id: "pocs", label: "Points of Contact", desc: "Government POC, Electronic POC, Past Performance POC" },
    { id: "banking", label: "Banking Information", desc: "EFT/ACH banking details for payment" },
  ];

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setProfile(data);
        setUei(data.uei || "");
      }
      setLoading(false);
    };
    init();
  }, [router]);

  async function saveUEI() {
    setSaving(true); setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("user_profiles").upsert({ user_id: user.id, uei: uei.trim() });
    setMessage(error ? "Failed to save." : "UEI saved successfully.");
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const registrationDate = profile?.sam_registration_date;
  const expirationDate = profile?.sam_expiration_date;
  const daysUntilExpiry = expirationDate ? Math.ceil((new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">SAM.gov Registration Tracker</h1><p className="text-slate-400 mt-1">Track and manage your SAM.gov registration status</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{profile?.uei || "—"}</p>
          <p className="text-xs text-slate-400 mt-1">Unique Entity ID</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{registrationDate ? new Date(registrationDate).toLocaleDateString() : "—"}</p>
          <p className="text-xs text-slate-400 mt-1">Registration Date</p>
        </div>
        <div className={`p-4 bg-slate-900 border rounded-xl text-center ${daysUntilExpiry !== null && daysUntilExpiry < 60 ? "border-red-600" : "border-slate-800"}`}>
          <p className={`text-2xl font-bold ${daysUntilExpiry !== null && daysUntilExpiry < 60 ? "text-red-400" : "text-emerald-400"}`}>{daysUntilExpiry !== null ? `${daysUntilExpiry} days` : "—"}</p>
          <p className="text-xs text-slate-400 mt-1">Until Renewal</p>
        </div>
      </div>
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="font-semibold mb-3">Update UEI</h2>
        {message && <div className="mb-3 p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}
        <div className="flex gap-3">
          <input type="text" placeholder="Enter your UEI" value={uei} onChange={e => setUei(e.target.value)} className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <button onClick={saveUEI} disabled={saving} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="font-semibold mb-4">Registration Checklist</h2>
        <div className="space-y-3">{SAM_CHECKLIST.map(item => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
            <div className="w-5 h-5 rounded border border-slate-600 flex items-center justify-center flex-shrink-0">
              {profile?.[`sam_${item.id}_complete`] && <div className="w-3 h-3 rounded-sm bg-emerald-500" />}
            </div>
            <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-slate-400">{item.desc}</p></div>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
