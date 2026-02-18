"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OpportunityFiltersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({ naics_codes: [], keywords: [], agencies: [], set_asides: [], min_value: "", max_value: "", notice_types: [], states: [] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const SET_ASIDE_OPTIONS = ["Total Small Business", "SBA Certified 8(a)", "HUBZone", "SDVOSB", "WOSB", "EDWOSB", "Partial Small Business"];
  const NOTICE_TYPES = ["Presolicitation", "Combined Synopsis/Solicitation", "Solicitation", "Sources Sought", "Special Notice", "Award Notice", "Intent to Bundle"];

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("user_profiles").select("settings").eq("user_id", user.id).single();
      if (data?.settings?.opportunity_filters) setFilters({ ...filters, ...data.settings.opportunity_filters });
      setLoading(false);
    };
    init();
  }, [router]);

  async function saveFilters(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: existing } = await supabase.from("user_profiles").select("settings").eq("user_id", user.id).single();
    const settings = existing?.settings || {};
    const { error } = await supabase.from("user_profiles").upsert({ user_id: user.id, settings: { ...settings, opportunity_filters: filters } });
    setMessage(error ? "Failed to save." : "Filters saved. These will apply to opportunity searches.");
    setSaving(false);
  }

  function toggleSetAside(sa: string) {
    setFilters((f: any) => ({ ...f, set_asides: f.set_asides.includes(sa) ? f.set_asides.filter((s: string) => s !== sa) : [...f.set_asides, sa] }));
  }

  function toggleNoticeType(nt: string) {
    setFilters((f: any) => ({ ...f, notice_types: f.notice_types.includes(nt) ? f.notice_types.filter((n: string) => n !== nt) : [...f.notice_types, nt] }));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Search Filters</h1><p className="text-slate-400 mt-1">Configure default filters for opportunity searches</p></div>
      {message && <div className="mb-6 p-3 bg-slate-900 border border-slate-800 rounded-lg text-sm">{message}</div>}
      <form onSubmit={saveFilters} className="space-y-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">NAICS Codes</h2>
          <input type="text" value={filters.naics_codes.join(", ")} onChange={e => setFilters((f: any) => ({ ...f, naics_codes: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }))} placeholder="e.g. 541512, 541511, 518210" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Keywords</h2>
          <input type="text" value={filters.keywords.join(", ")} onChange={e => setFilters((f: any) => ({ ...f, keywords: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) }))} placeholder="e.g. cybersecurity, cloud migration, IT support" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Contract Value Range</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-slate-400 mb-1">Minimum ($)</label><input type="number" value={filters.min_value} onChange={e => setFilters((f: any) => ({ ...f, min_value: e.target.value }))} placeholder="0" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
            <div><label className="block text-xs text-slate-400 mb-1">Maximum ($)</label><input type="number" value={filters.max_value} onChange={e => setFilters((f: any) => ({ ...f, max_value: e.target.value }))} placeholder="No limit" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" /></div>
          </div>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Set-Aside Types</h2>
          <div className="flex flex-wrap gap-2">{SET_ASIDE_OPTIONS.map(sa => (
            <button key={sa} type="button" onClick={() => toggleSetAside(sa)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filters.set_asides.includes(sa) ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>{sa}</button>
          ))}</div>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Notice Types</h2>
          <div className="flex flex-wrap gap-2">{NOTICE_TYPES.map(nt => (
            <button key={nt} type="button" onClick={() => toggleNoticeType(nt)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filters.notice_types.includes(nt) ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>{nt}</button>
          ))}</div>
        </div>
        <button type="submit" disabled={saving} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{saving ? "Saving..." : "Save Filters"}</button>
      </form>
    </div>
  );
}
