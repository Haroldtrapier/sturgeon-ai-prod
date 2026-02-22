"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OpportunityAlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("");
  const [naics, setNaics] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("saved_searches").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setAlerts(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  async function createAlert(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("saved_searches").insert({ user_id: user.id, name: keyword || naics || "New Alert", search_criteria: { keyword, naics }, is_active: true });
    if (error) setMessage("Failed to create alert.");
    else { setMessage("Alert created."); setKeyword(""); setNaics(""); const { data } = await supabase.from("saved_searches").select("*").eq("user_id", user.id).order("created_at", { ascending: false }); setAlerts(data || []); }
    setSaving(false);
  }

  async function deleteAlert(id: string) {
    const supabase = createClient();
    await supabase.from("saved_searches").delete().eq("id", id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Opportunity Alerts</h1><p className="text-stone-500 mt-1">Get notified when matching opportunities appear</p></div>
      {message && <div className="mb-6 p-4 bg-stone-100 border border-stone-300 rounded-lg text-sm">{message}</div>}
      <form onSubmit={createAlert} className="mb-8 p-6 bg-white border border-stone-200 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold">Create New Alert</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Keywords" value={keyword} onChange={e => setKeyword(e.target.value)} className="px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
          <input type="text" placeholder="NAICS Code" value={naics} onChange={e => setNaics(e.target.value)} className="px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
        </div>
        <button type="submit" disabled={saving || (!keyword && !naics)} className="px-6 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 font-medium">{saving ? "Saving..." : "Create Alert"}</button>
      </form>
      <div className="space-y-3">
        {alerts.length === 0 ? <p className="text-stone-8000 text-center py-8">No alerts configured</p> : alerts.map(a => (
          <div key={a.id} className="p-4 bg-white border border-stone-200 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="font-medium text-sm">{a.name}</h3>
              <p className="text-xs text-stone-500 mt-1">{a.search_criteria?.keyword && `Keywords: ${a.search_criteria.keyword}`} {a.search_criteria?.naics && `NAICS: ${a.search_criteria.naics}`}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded ${a.is_active ? "bg-lime-700/20 text-lime-700" : "bg-stone-200 text-stone-500"}`}>{a.is_active ? "Active" : "Paused"}</span>
              <button onClick={() => deleteAlert(a.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
