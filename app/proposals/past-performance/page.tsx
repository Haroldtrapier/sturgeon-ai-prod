"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PastPerformancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contract_number: "", title: "", agency: "", value: "", period: "", description: "", contact_name: "", contact_email: "", contact_phone: "", rating: "Exceptional" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("past_performance").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setRecords(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("past_performance").insert({ ...form, user_id: user.id, value: form.value ? Number(form.value) : null }).select().single();
    if (!error && data) { setRecords(prev => [data, ...prev]); setShowForm(false); setForm({ contract_number: "", title: "", agency: "", value: "", period: "", description: "", contact_name: "", contact_email: "", contact_phone: "", rating: "Exceptional" }); }
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Past Performance</h1><p className="text-slate-400 mt-1">Manage your contract performance references</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm">{showForm ? "Cancel" : "Add Record"}</button>
      </div>
      {showForm && (
        <form onSubmit={addRecord} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Contract Number" value={form.contract_number} onChange={e => setForm({ ...form, contract_number: e.target.value })} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
            <input type="text" placeholder="Contract Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
            <input type="text" placeholder="Agency" value={form.agency} onChange={e => setForm({ ...form, agency: e.target.value })} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
            <input type="number" placeholder="Contract Value ($)" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
            <input type="text" placeholder="Period of Performance" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
            <select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm">
              <option>Exceptional</option><option>Very Good</option><option>Satisfactory</option><option>Marginal</option>
            </select>
          </div>
          <textarea placeholder="Description of work performed" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full mb-4 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input type="text" placeholder="Reference Name" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
            <input type="email" placeholder="Reference Email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
            <input type="text" placeholder="Reference Phone" value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{saving ? "Saving..." : "Add Record"}</button>
        </form>
      )}
      {records.length > 0 ? (
        <div className="space-y-3">{records.map(r => (
          <div key={r.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{r.title}</h3>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                  {r.agency && <span>{r.agency}</span>}
                  {r.contract_number && <span>#{r.contract_number}</span>}
                  {r.value && <span className="text-emerald-400">${Number(r.value).toLocaleString()}</span>}
                  {r.period && <span>{r.period}</span>}
                </div>
                {r.description && <p className="text-sm text-slate-400 mt-2">{r.description}</p>}
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${r.rating === "Exceptional" ? "bg-emerald-900/30 text-emerald-400" : r.rating === "Very Good" ? "bg-blue-900/30 text-blue-400" : "bg-slate-800 text-slate-400"}`}>{r.rating}</span>
            </div>
          </div>
        ))}</div>
      ) : !showForm && <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">No past performance records. Add your contract history to strengthen proposals.</p></div>}
    </div>
  );
}
