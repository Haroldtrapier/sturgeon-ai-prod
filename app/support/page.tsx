"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Ticket {
  ticket_id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  last_updated?: string;
}

interface FAQ {
  name: string;
  questions: Array<{ question: string; answer: string }>;
}

export default function SupportPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tickets" | "faq" | "new">("tickets");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [faq, setFaq] = useState<FAQ[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      await Promise.all([fetchTickets(session.access_token), fetchFAQ()]);
      setLoading(false);
    };
    init();
  }, [router]);

  async function fetchTickets(t: string) {
    try {
      const res = await fetch(`${API}/api/support/tickets`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch { /* empty */ }
  }

  async function fetchFAQ() {
    try {
      const res = await fetch(`${API}/api/support/faq`);
      if (res.ok) {
        const data = await res.json();
        setFaq(data.categories || []);
      }
    } catch { /* empty */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setMessage("");
    try {
      const res = await fetch(`${API}/api/support/ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, description, category, priority }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(`Ticket ${data.ticket_id} created. ${data.message}`);
        setSubject(""); setDescription(""); setCategory("general"); setPriority("normal");
        setActiveTab("tickets");
        await fetchTickets(token);
      } else { setMessage("Failed to create ticket."); }
    } catch { setMessage("Error creating ticket."); }
    setSubmitting(false);
  }

  const priorityColor: Record<string, string> = {
    low: "text-blue-400", normal: "text-slate-400", high: "text-yellow-400", urgent: "text-red-400",
  };

  const statusColor: Record<string, string> = {
    open: "bg-emerald-600/20 text-emerald-400", "in-progress": "bg-blue-600/20 text-blue-400", closed: "bg-slate-600/20 text-slate-400",
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="text-slate-400 mt-1">Get help and manage support tickets</p>
        </div>
        <button onClick={() => setActiveTab("new")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">New Ticket</button>
      </div>

      {message && <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}

      <div className="flex gap-2 mb-6">
        {(["tickets", "faq", "new"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${activeTab === tab ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>{tab === "new" ? "New Ticket" : tab === "faq" ? "FAQ" : "My Tickets"}</button>
        ))}
      </div>

      {activeTab === "tickets" && (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
              <p className="text-slate-400">No support tickets yet</p>
            </div>
          ) : (
            tickets.map((t) => (
              <div key={t.ticket_id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t.subject}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="text-slate-500">{t.ticket_id}</span>
                      <span className={priorityColor[t.priority] || "text-slate-400"}>{t.priority}</span>
                      <span className="text-slate-500">{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${statusColor[t.status] || "bg-slate-700 text-slate-400"}`}>{t.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "faq" && (
        <div className="space-y-6">
          {faq.map((cat, i) => (
            <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h2 className="text-lg font-semibold mb-4 text-emerald-400">{cat.name}</h2>
              <div className="space-y-4">
                {cat.questions.map((q, j) => (
                  <div key={j}>
                    <h3 className="font-medium text-sm mb-1">{q.question}</h3>
                    <p className="text-sm text-slate-400">{q.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "new" && (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold">Create Support Ticket</h2>
          <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              <option value="general">General</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Bug Report</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <textarea placeholder="Describe your issue..." value={description} onChange={(e) => setDescription(e.target.value)} required rows={6} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          <button type="submit" disabled={submitting} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      )}
    </div>
  );
}
