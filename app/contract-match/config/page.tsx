"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MatchConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [naicsCodes, setNaicsCodes] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [agencies, setAgencies] = useState<string[]>([]);
  const [setAsides, setSetAsides] = useState<string[]>([]);
  const [naicsInput, setNaicsInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [agencyInput, setAgencyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const SET_ASIDE_OPTIONS = ["SDVOSB", "8(a)", "HUBZone", "WOSB", "EDWOSB", "Small Business", "Total Small Business"];

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("user_profiles").select("naics_codes, keywords, preferred_agencies, set_aside_preferences").eq("user_id", user.id).single();
      if (data) {
        setNaicsCodes(data.naics_codes || []);
        setKeywords(data.keywords || []);
        setAgencies(data.preferred_agencies || []);
        setSetAsides(data.set_aside_preferences || []);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  function addItem(input: string, setInput: (s: string) => void, list: string[], setList: (l: string[]) => void) {
    const val = input.trim();
    if (val && !list.includes(val)) { setList([...list, val]); setInput(""); }
  }

  async function saveConfig() {
    setSaving(true); setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("user_profiles").upsert({ user_id: user.id, naics_codes: naicsCodes, keywords, preferred_agencies: agencies, set_aside_preferences: setAsides });
    setMessage(error ? "Failed to save." : "Configuration saved.");
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Match Configuration</h1><p className="text-slate-400 mt-1">Configure your ContractMatch preferences</p></div>
      {message && <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}
      <div className="space-y-6">
        {[{ label: "NAICS Codes", items: naicsCodes, setItems: setNaicsCodes, input: naicsInput, setInput: setNaicsInput, placeholder: "e.g. 541512" },
          { label: "Keywords", items: keywords, setItems: setKeywords, input: keywordInput, setInput: setKeywordInput, placeholder: "e.g. cybersecurity" },
          { label: "Preferred Agencies", items: agencies, setItems: setAgencies, input: agencyInput, setInput: setAgencyInput, placeholder: "e.g. Department of Defense" }
        ].map(section => (
          <div key={section.label} className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <h2 className="font-semibold mb-3">{section.label}</h2>
            <div className="flex gap-2 mb-3">
              <input type="text" placeholder={section.placeholder} value={section.input} onChange={e => section.setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addItem(section.input, section.setInput, section.items, section.setItems))} className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm" />
              <button type="button" onClick={() => addItem(section.input, section.setInput, section.items, section.setItems)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">{section.items.map(item => (<span key={item} className="px-3 py-1 bg-emerald-600/10 text-emerald-400 rounded-full text-xs flex items-center gap-2">{item}<button onClick={() => section.setItems(section.items.filter(i => i !== item))} className="hover:text-white">&times;</button></span>))}</div>
          </div>
        ))}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-3">Set-Aside Preferences</h2>
          <div className="grid grid-cols-2 gap-2">{SET_ASIDE_OPTIONS.map(sa => (<label key={sa} className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg cursor-pointer text-sm"><input type="checkbox" checked={setAsides.includes(sa)} onChange={e => setSetAsides(e.target.checked ? [...setAsides, sa] : setAsides.filter(s => s !== sa))} className="accent-emerald-500" />{sa}</label>))}</div>
        </div>
        <button onClick={saveConfig} disabled={saving} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{saving ? "Saving..." : "Save Configuration"}</button>
      </div>
    </div>
  );
}
