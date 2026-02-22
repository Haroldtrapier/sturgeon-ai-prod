"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  company?: string;
  title?: string;
  agency?: string;
  notes?: string;
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  script?: string;
  status: string;
  total_contacts: number;
  total_calls?: number;
  completed_calls?: number;
  connected_calls?: number;
  created_at: string;
}

interface CallLog {
  id: string;
  campaign_id: string;
  contact_id: string;
  outcome: string;
  duration_seconds?: number;
  notes?: string;
  callback_at?: string;
  called_at?: string;
  contacts?: Contact;
}

interface CallStats {
  total_campaigns: number;
  total_contacts_queued: number;
  total_calls_made: number;
  total_connected: number;
  connect_rate: number;
  total_duration_seconds: number;
  total_interested: number;
  total_closed: number;
  total_callbacks: number;
}

type View = "campaigns" | "create" | "dialer" | "stats";

const OUTCOMES = [
  { value: "connected", label: "Connected", color: "bg-lime-700" },
  { value: "voicemail", label: "Voicemail", color: "bg-yellow-600" },
  { value: "no_answer", label: "No Answer", color: "bg-slate-600" },
  { value: "busy", label: "Busy", color: "bg-orange-600" },
  { value: "wrong_number", label: "Wrong Number", color: "bg-red-600" },
  { value: "callback", label: "Schedule Callback", color: "bg-blue-600" },
  { value: "interested", label: "Interested", color: "bg-lime-600" },
  { value: "not_interested", label: "Not Interested", color: "bg-slate-500" },
  { value: "closed", label: "Closed / Won", color: "bg-green-500" },
];

export default function CallsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [view, setView] = useState<View>("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CallStats | null>(null);

  // Create campaign state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [contactSearch, setContactSearch] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [campaignDesc, setCampaignDesc] = useState("");
  const [campaignScript, setCampaignScript] = useState("");
  const [creating, setCreating] = useState(false);

  // Dialer state
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [currentCallIdx, setCurrentCallIdx] = useState(0);
  const [callNotes, setCallNotes] = useState("");
  const [callbackDate, setCallbackDate] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [loggingCall, setLoggingCall] = useState(false);
  const [campaignStats, setCampaignStats] = useState<any>(null);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  async function init() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    setToken(session.access_token);
    await fetchCampaigns(session.access_token);
    setLoading(false);
  }

  async function fetchCampaigns(t?: string) {
    const authToken = t || token;
    try {
      const res = await fetch(`${API}/calls/campaigns`, { headers: { Authorization: `Bearer ${authToken}` } });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch {}
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API}/calls/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setStats(await res.json());
    } catch {}
  }

  async function fetchContacts() {
    try {
      const res = await fetch(`${API}/contacts?limit=1000`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch {
      const supabase = createClient();
      const { data } = await supabase.from("contacts").select("*").order("created_at", { ascending: false }).limit(1000);
      if (data) setContacts(data as Contact[]);
    }
  }

  async function openCreateView() {
    setView("create");
    setSelectedContactIds(new Set());
    setCampaignName("");
    setCampaignDesc("");
    setCampaignScript("");
    await fetchContacts();
  }

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!campaignName || selectedContactIds.size === 0) return;
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`${API}/calls/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: campaignName,
          description: campaignDesc,
          script: campaignScript,
          contact_ids: Array.from(selectedContactIds),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage({ type: "success", text: data.message });
        await fetchCampaigns();
        setView("campaigns");
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: err.detail || "Failed to create campaign" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create campaign" });
    }
    setCreating(false);
  }

  async function openDialer(campaign: Campaign) {
    setActiveCampaign(campaign);
    setCurrentCallIdx(0);
    setCallNotes("");
    setCallbackDate("");
    setCallDuration(0);
    setTimerRunning(false);
    setView("dialer");

    try {
      const res = await fetch(`${API}/calls/campaigns/${campaign.id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setCallLogs(data.call_logs || []);
        setCampaignStats(data.stats || {});
        const firstPending = (data.call_logs || []).findIndex((l: CallLog) => l.outcome === "pending");
        if (firstPending >= 0) setCurrentCallIdx(firstPending);
      }
    } catch {}
  }

  async function logCallOutcome(outcome: string) {
    const currentLog = callLogs[currentCallIdx];
    if (!currentLog || !activeCampaign) return;
    setLoggingCall(true);
    setTimerRunning(false);

    try {
      await fetch(`${API}/calls/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          campaign_id: activeCampaign.id,
          contact_id: currentLog.contact_id,
          outcome,
          duration_seconds: callDuration,
          notes: callNotes,
          callback_at: outcome === "callback" && callbackDate ? callbackDate : null,
        }),
      });

      setCallLogs(prev => prev.map((l, i) =>
        i === currentCallIdx ? { ...l, outcome, notes: callNotes, duration_seconds: callDuration } : l
      ));

      setCampaignStats((prev: any) => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.pending = Math.max(0, (updated.pending || 0) - 1);
        updated[outcome] = (updated[outcome] || 0) + 1;
        return updated;
      });

      // Advance to next pending
      const nextIdx = callLogs.findIndex((l, i) => i > currentCallIdx && l.outcome === "pending");
      if (nextIdx >= 0) {
        setCurrentCallIdx(nextIdx);
      } else {
        setMessage({ type: "success", text: "All contacts in this campaign have been called!" });
      }

      setCallNotes("");
      setCallbackDate("");
      setCallDuration(0);
    } catch {
      setMessage({ type: "error", text: "Failed to log call" });
    }
    setLoggingCall(false);
  }

  async function deleteCampaign(id: string) {
    try {
      await fetch(`${API}/calls/campaigns/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setCampaigns(prev => prev.filter(c => c.id !== id));
      setMessage({ type: "success", text: "Campaign deleted" });
    } catch {}
  }

  function toggleContact(id: string) {
    setSelectedContactIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllContacts() {
    const filtered = filteredContacts();
    if (selectedContactIds.size === filtered.length) {
      setSelectedContactIds(new Set());
    } else {
      setSelectedContactIds(new Set(filtered.map(c => c.id)));
    }
  }

  function filteredContacts() {
    if (!contactSearch) return contacts.filter(c => c.phone);
    const q = contactSearch.toLowerCase();
    return contacts.filter(c =>
      c.phone && (
        (c.first_name || "").toLowerCase().includes(q) ||
        (c.last_name || "").toLowerCase().includes(q) ||
        (c.company || "").toLowerCase().includes(q) ||
        (c.agency || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q)
      )
    );
  }

  function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function outcomeColor(outcome: string) {
    const map: Record<string, string> = {
      pending: "text-stone-500",
      connected: "text-lime-700",
      voicemail: "text-yellow-600",
      no_answer: "text-stone-8000",
      busy: "text-orange-600",
      wrong_number: "text-red-600",
      callback: "text-blue-600",
      interested: "text-lime-600",
      not_interested: "text-stone-8000",
      closed: "text-green-700",
    };
    return map[outcome] || "text-stone-500";
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;
  }

  const currentLog = view === "dialer" ? callLogs[currentCallIdx] : null;
  const currentContact = currentLog?.contacts || null;
  const pendingCount = callLogs.filter(l => l.outcome === "pending").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bulk Calls</h1>
          <p className="text-stone-500 mt-1">Create call campaigns and power through your contact list</p>
        </div>
        <div className="flex gap-2">
          {view !== "campaigns" && (
            <button onClick={() => { setView("campaigns"); fetchCampaigns(); }} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm hover:bg-stone-200">
              All Campaigns
            </button>
          )}
          {view === "campaigns" && (
            <>
              <button onClick={() => { setView("stats"); fetchStats(); }} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm hover:bg-stone-200">Stats</button>
              <button onClick={openCreateView} className="px-4 py-2 bg-lime-700 text-white rounded-lg text-sm font-medium hover:bg-lime-800">+ New Campaign</button>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-3 rounded-lg text-sm border ${message.type === "success" ? "bg-lime-50 border-lime-200 text-lime-600" : "bg-red-50 border-red-200 text-red-700"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="float-right text-xs opacity-60 hover:opacity-100">dismiss</button>
        </div>
      )}

      {/* ── Campaigns List ──────────────────────────────── */}
      {view === "campaigns" && (
        <>
          {campaigns.length === 0 ? (
            <div className="p-12 bg-white border border-stone-200 rounded-xl text-center">
              <svg className="w-12 h-12 text-stone-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              <p className="text-stone-500 mb-2">No call campaigns yet</p>
              <p className="text-xs text-stone-8000 mb-4">Create a campaign to start making bulk calls to your contacts</p>
              <button onClick={openCreateView} className="px-4 py-2 bg-lime-700 text-white rounded-lg text-sm hover:bg-lime-800">Create First Campaign</button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map(c => {
                const progress = c.total_contacts > 0 ? Math.round(((c.completed_calls || 0) / c.total_contacts) * 100) : 0;
                return (
                  <div key={c.id} className="p-5 bg-white border border-stone-200 rounded-xl hover:border-stone-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{c.name}</h3>
                        {c.description && <p className="text-xs text-stone-500 mt-0.5">{c.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openDialer(c)} className="px-4 py-2 bg-lime-700 text-white rounded-lg text-sm font-medium hover:bg-lime-800 flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                          Start Calling
                        </button>
                        <button onClick={() => deleteCampaign(c.id)} className="px-3 py-2 bg-stone-100 text-red-600 rounded-lg text-xs hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="text-center"><p className="text-lg font-bold text-stone-600">{c.total_contacts}</p><p className="text-xs text-stone-8000">Contacts</p></div>
                      <div className="text-center"><p className="text-lg font-bold text-blue-600">{c.completed_calls || 0}</p><p className="text-xs text-stone-8000">Calls Made</p></div>
                      <div className="text-center"><p className="text-lg font-bold text-lime-700">{c.connected_calls || 0}</p><p className="text-xs text-stone-8000">Connected</p></div>
                      <div className="text-center"><p className="text-lg font-bold text-yellow-600">{progress}%</p><p className="text-xs text-stone-8000">Complete</p></div>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5">
                      <div className="bg-lime-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Create Campaign ──────────────────────────────── */}
      {view === "create" && (
        <form onSubmit={createCampaign}>
          <div className="p-6 bg-white border border-stone-200 rounded-xl mb-6">
            <h2 className="text-lg font-semibold mb-4">Campaign Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1">Campaign Name *</label>
                <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} required placeholder="e.g. Q1 Agency Outreach" className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Description</label>
                <input type="text" value={campaignDesc} onChange={e => setCampaignDesc(e.target.value)} placeholder="Brief description" className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">Call Script (displayed during calls)</label>
              <textarea value={campaignScript} onChange={e => setCampaignScript(e.target.value)} rows={4} placeholder="Hi [Name], this is [Your Name] from [Company]. I'm reaching out because..." className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none" />
            </div>
          </div>

          <div className="p-6 bg-white border border-stone-200 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Select Contacts</h2>
                <p className="text-xs text-stone-500 mt-0.5">{selectedContactIds.size} selected &middot; Only contacts with phone numbers are shown</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={selectAllContacts} className="px-3 py-1.5 bg-stone-100 text-stone-600 rounded text-xs hover:bg-stone-200">
                  {selectedContactIds.size === filteredContacts().length ? "Deselect All" : "Select All"}
                </button>
              </div>
            </div>
            <input type="text" value={contactSearch} onChange={e => setContactSearch(e.target.value)} placeholder="Search contacts..." className="w-full px-3 py-2 mb-4 bg-stone-100 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none" />
            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredContacts().length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-stone-500">No contacts with phone numbers found</p>
                  <button type="button" onClick={() => router.push("/contacts")} className="text-xs text-lime-700 hover:underline mt-1">Go to Contacts to add some</button>
                </div>
              ) : (
                filteredContacts().map(c => (
                  <label key={c.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedContactIds.has(c.id) ? "bg-lime-50 border border-lime-200" : "hover:bg-stone-100 border border-transparent"}`}>
                    <input type="checkbox" checked={selectedContactIds.has(c.id)} onChange={() => toggleContact(c.id)} className="rounded border-stone-300 text-lime-600 focus:ring-lime-500 bg-stone-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{c.first_name} {c.last_name}</p>
                      <p className="text-xs text-stone-500 truncate">{c.phone}{c.company ? ` · ${c.company}` : ""}{c.agency ? ` · ${c.agency}` : ""}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={creating || selectedContactIds.size === 0 || !campaignName} className="px-6 py-2 bg-lime-700 text-white rounded-lg text-sm font-medium hover:bg-lime-800 disabled:opacity-50">
              {creating ? "Creating..." : `Create Campaign (${selectedContactIds.size} contacts)`}
            </button>
            <button type="button" onClick={() => setView("campaigns")} className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm hover:bg-stone-200">Cancel</button>
          </div>
        </form>
      )}

      {/* ── Power Dialer ──────────────────────────────── */}
      {view === "dialer" && activeCampaign && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main dialer panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Current contact card */}
            {currentContact ? (
              <div className="p-6 bg-white border border-lime-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-stone-500">Contact {currentCallIdx + 1} of {callLogs.length} &middot; {pendingCount} remaining</p>
                  <div className="flex items-center gap-2">
                    {timerRunning && <span className="text-sm font-mono text-lime-700">{formatDuration(callDuration)}</span>}
                    <span className={`px-2 py-0.5 rounded text-xs ${currentLog?.outcome === "pending" ? "bg-yellow-50 text-yellow-600" : "bg-lime-50 text-lime-700"}`}>
                      {currentLog?.outcome || "pending"}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-lime-700 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                    {(currentContact.first_name?.[0] || "")}{(currentContact.last_name?.[0] || "")}
                  </div>
                  <h2 className="text-2xl font-bold">{currentContact.first_name} {currentContact.last_name}</h2>
                  {currentContact.title && <p className="text-sm text-stone-500">{currentContact.title}</p>}
                  {currentContact.company && <p className="text-sm text-stone-500">{currentContact.company}</p>}
                  {currentContact.agency && <p className="text-sm text-blue-600">{currentContact.agency}</p>}
                  {currentContact.phone && (
                    <a href={`tel:${currentContact.phone}`} className="inline-flex items-center gap-2 mt-3 px-6 py-3 bg-lime-700 text-white rounded-full text-lg font-semibold hover:bg-lime-800 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                      {currentContact.phone}
                    </a>
                  )}
                  {currentContact.email && <p className="text-xs text-stone-8000 mt-2">{currentContact.email}</p>}
                </div>

                {!timerRunning && currentLog?.outcome === "pending" && (
                  <button onClick={() => { setTimerRunning(true); setCallDuration(0); }} className="w-full py-3 bg-lime-700 text-white rounded-lg font-medium hover:bg-lime-800 mb-4">
                    Start Call Timer
                  </button>
                )}
                {timerRunning && (
                  <button onClick={() => setTimerRunning(false)} className="w-full py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 mb-4">
                    Stop Timer ({formatDuration(callDuration)})
                  </button>
                )}

                {/* Call notes */}
                <div className="mb-4">
                  <label className="block text-xs text-stone-500 mb-1">Call Notes</label>
                  <textarea value={callNotes} onChange={e => setCallNotes(e.target.value)} rows={2} placeholder="Notes from this call..." className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>

                {/* Outcome buttons */}
                <div>
                  <p className="text-xs text-stone-500 mb-2">Log Outcome:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {OUTCOMES.map(o => (
                      <button
                        key={o.value}
                        onClick={() => logCallOutcome(o.value)}
                        disabled={loggingCall}
                        className={`px-3 py-2 ${o.color} text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Callback date picker (shows when callback is selected) */}
                <div className="mt-3">
                  <label className="block text-xs text-stone-500 mb-1">Callback Date/Time (for &quot;Schedule Callback&quot;)</label>
                  <input type="datetime-local" value={callbackDate} onChange={e => setCallbackDate(e.target.value)} className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>

                {/* Navigation */}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setCurrentCallIdx(Math.max(0, currentCallIdx - 1))} disabled={currentCallIdx === 0} className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm disabled:opacity-30">Previous</button>
                  <button onClick={() => { const next = callLogs.findIndex((l, i) => i > currentCallIdx && l.outcome === "pending"); if (next >= 0) setCurrentCallIdx(next); else setCurrentCallIdx(Math.min(callLogs.length - 1, currentCallIdx + 1)); }} disabled={currentCallIdx >= callLogs.length - 1} className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm disabled:opacity-30">Next Pending</button>
                </div>
              </div>
            ) : (
              <div className="p-12 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-lime-700 text-lg font-semibold mb-2">Campaign Complete!</p>
                <p className="text-sm text-stone-500">All contacts have been called.</p>
              </div>
            )}

            {/* Script */}
            {activeCampaign.script && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Call Script</h3>
                <p className="text-sm text-stone-600 whitespace-pre-wrap">{activeCampaign.script}</p>
              </div>
            )}

            {currentContact?.notes && (
              <div className="p-4 bg-white border border-stone-200 rounded-xl">
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Contact Notes</h3>
                <p className="text-sm text-stone-600">{currentContact.notes}</p>
              </div>
            )}
          </div>

          {/* Call log sidebar */}
          <div className="space-y-4">
            <div className="p-4 bg-white border border-stone-200 rounded-xl">
              <h3 className="font-semibold text-sm mb-3">{activeCampaign.name}</h3>
              {campaignStats && (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-stone-100 rounded-lg"><p className="text-lg font-bold text-lime-700">{campaignStats.total - (campaignStats.pending || 0)}</p><p className="text-xs text-stone-8000">Called</p></div>
                  <div className="p-2 bg-stone-100 rounded-lg"><p className="text-lg font-bold text-yellow-600">{campaignStats.pending || 0}</p><p className="text-xs text-stone-8000">Pending</p></div>
                  <div className="p-2 bg-stone-100 rounded-lg"><p className="text-lg font-bold text-blue-600">{(campaignStats.connected || 0) + (campaignStats.interested || 0) + (campaignStats.closed || 0)}</p><p className="text-xs text-stone-8000">Connected</p></div>
                  <div className="p-2 bg-stone-100 rounded-lg"><p className="text-lg font-bold text-green-700">{campaignStats.interested || 0}</p><p className="text-xs text-stone-8000">Interested</p></div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl">
              <h3 className="font-semibold text-sm mb-3">Call Queue</h3>
              <div className="max-h-[400px] overflow-y-auto space-y-1">
                {callLogs.map((log, i) => {
                  const ct = log.contacts;
                  return (
                    <button
                      key={log.id || i}
                      onClick={() => { setCurrentCallIdx(i); setCallNotes(""); setCallDuration(0); setTimerRunning(false); }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${i === currentCallIdx ? "bg-lime-50 border border-lime-300" : "hover:bg-stone-100 border border-transparent"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{ct ? `${ct.first_name} ${ct.last_name}` : "Unknown"}</span>
                        <span className={`capitalize ${outcomeColor(log.outcome)}`}>{log.outcome}</span>
                      </div>
                      {ct?.phone && <span className="text-stone-8000">{ct.phone}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats ──────────────────────────────── */}
      {view === "stats" && (
        <div>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="p-5 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-stone-600">{stats.total_campaigns}</p>
                <p className="text-xs text-stone-500 mt-1">Campaigns</p>
              </div>
              <div className="p-5 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.total_calls_made}</p>
                <p className="text-xs text-stone-500 mt-1">Calls Made</p>
              </div>
              <div className="p-5 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-lime-700">{stats.total_connected}</p>
                <p className="text-xs text-stone-500 mt-1">Connected</p>
              </div>
              <div className="p-5 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-yellow-600">{stats.connect_rate}%</p>
                <p className="text-xs text-stone-500 mt-1">Connect Rate</p>
              </div>
              <div className="p-5 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-green-700">{stats.total_interested + stats.total_closed}</p>
                <p className="text-xs text-stone-500 mt-1">Interested / Closed</p>
              </div>
              <div className="p-5 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-stone-600">{stats.total_contacts_queued}</p>
                <p className="text-xs text-stone-500 mt-1">Total Queued</p>
              </div>
              <div className="p-5 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-purple-600">{stats.total_callbacks}</p>
                <p className="text-xs text-stone-500 mt-1">Callbacks</p>
              </div>
              <div className="p-5 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-green-700">{stats.total_closed}</p>
                <p className="text-xs text-stone-500 mt-1">Closed / Won</p>
              </div>
              <div className="p-5 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-cyan-600">{formatDuration(stats.total_duration_seconds)}</p>
                <p className="text-xs text-stone-500 mt-1">Total Talk Time</p>
              </div>
              <div className="p-5 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-3xl font-bold text-orange-600">{stats.total_calls_made > 0 ? formatDuration(Math.round(stats.total_duration_seconds / stats.total_calls_made)) : "0:00"}</p>
                <p className="text-xs text-stone-500 mt-1">Avg Call Duration</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-stone-500">Loading stats...</div>
          )}
        </div>
      )}
    </div>
  );
}
