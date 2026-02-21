"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Papa from "papaparse";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  agency?: string;
  role?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
}

interface NewContact {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  agency: string;
  role: string;
  notes: string;
  tags: string;
}

const EMPTY_CONTACT: NewContact = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  company: "",
  title: "",
  agency: "",
  role: "",
  notes: "",
  tags: "",
};

export default function ContactsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [newContact, setNewContact] = useState<NewContact>(EMPTY_CONTACT);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    setToken(session.access_token);
    await fetchContacts(session.access_token);
    setLoading(false);
  }

  async function fetchContacts(t?: string) {
    const authToken = t || token;
    if (!authToken) return;
    try {
      const res = await fetch(`${API}/contacts?limit=500`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch {
      const supabase = createClient();
      const { data } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (data) setContacts(data as Contact[]);
    }
  }

  async function addContact(e: React.FormEvent) {
    e.preventDefault();
    if (!newContact.first_name && !newContact.last_name) return;
    setSaving(true);
    setMessage(null);
    try {
      const payload: any = { ...newContact };
      if (payload.tags) {
        payload.tags = payload.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
      } else {
        payload.tags = [];
      }

      const res = await fetch(`${API}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(prev => [data.contact, ...prev]);
        setNewContact(EMPTY_CONTACT);
        setShowAdd(false);
        setMessage({ type: "success", text: "Contact added successfully" });
      } else {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const record: any = { ...newContact, user_id: user.id };
        if (record.tags) record.tags = record.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
        else record.tags = [];
        const { data, error } = await supabase.from("contacts").insert(record).select().single();
        if (data) {
          setContacts(prev => [data as Contact, ...prev]);
          setNewContact(EMPTY_CONTACT);
          setShowAdd(false);
          setMessage({ type: "success", text: "Contact added successfully" });
        } else {
          setMessage({ type: "error", text: error?.message || "Failed to add contact" });
        }
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to add contact" });
    }
    setSaving(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setCsvPreview(results.data as any[]);
          setShowUpload(true);
        } else {
          setMessage({ type: "error", text: "No data found in CSV file" });
        }
      },
      error: () => {
        setMessage({ type: "error", text: "Failed to parse CSV file" });
      },
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function mapCsvRow(row: any): any | null {
    const normalize = (key: string) => key.toLowerCase().replace(/[\s-]/g, "_");

    const mapped: any = {};
    for (const [key, value] of Object.entries(row)) {
      const nk = normalize(key);
      const v = (value as string || "").trim();
      if (!v) continue;

      if (["first_name", "first", "firstname", "given_name"].includes(nk)) mapped.first_name = v;
      else if (["last_name", "last", "lastname", "surname", "family_name"].includes(nk)) mapped.last_name = v;
      else if (["name", "full_name", "fullname", "contact_name"].includes(nk)) {
        const parts = v.split(/\s+/);
        mapped.first_name = parts[0] || "";
        mapped.last_name = parts.slice(1).join(" ") || "";
      }
      else if (["email", "email_address", "e_mail"].includes(nk)) mapped.email = v;
      else if (["phone", "phone_number", "telephone", "tel", "mobile"].includes(nk)) mapped.phone = v;
      else if (["company", "company_name", "organization", "org"].includes(nk)) mapped.company = v;
      else if (["title", "job_title", "position"].includes(nk)) mapped.title = v;
      else if (["agency", "department", "govt_agency", "government_agency"].includes(nk)) mapped.agency = v;
      else if (["role", "type", "contact_type"].includes(nk)) mapped.role = v;
      else if (["notes", "note", "comments", "description"].includes(nk)) mapped.notes = v;
      else if (["tags", "labels", "categories"].includes(nk)) mapped.tags = v.split(",").map((t: string) => t.trim()).filter(Boolean);
    }

    if (!mapped.first_name && !mapped.last_name) return null;
    if (!mapped.tags) mapped.tags = [];
    return mapped;
  }

  async function uploadCsvContacts() {
    if (!csvPreview || csvPreview.length === 0) return;
    setUploading(true);
    setMessage(null);

    const mapped = csvPreview.map(mapCsvRow).filter(Boolean);
    if (mapped.length === 0) {
      setMessage({ type: "error", text: "No valid contacts found. CSV needs columns like: first_name, last_name, email, phone, company" });
      setUploading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/contacts/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contacts: mapped }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage({ type: "success", text: `Successfully imported ${data.created} contacts` });
        setCsvPreview(null);
        setShowUpload(false);
        await fetchContacts();
      } else {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const records = mapped.map((c: any) => ({ ...c, user_id: user.id }));
        const { data, error } = await supabase.from("contacts").insert(records).select();
        if (data) {
          setMessage({ type: "success", text: `Successfully imported ${data.length} contacts` });
          setCsvPreview(null);
          setShowUpload(false);
          await fetchContacts();
        } else {
          setMessage({ type: "error", text: error?.message || "Failed to import contacts" });
        }
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to upload contacts" });
    }
    setUploading(false);
  }

  async function deleteSelected() {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    setMessage(null);
    try {
      for (const id of Array.from(selectedIds)) {
        await fetch(`${API}/contacts/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setContacts(prev => prev.filter(c => !selectedIds.has(c.id)));
      setMessage({ type: "success", text: `Deleted ${selectedIds.size} contacts` });
      setSelectedIds(new Set());
    } catch {
      setMessage({ type: "error", text: "Failed to delete some contacts" });
    }
    setDeleting(false);
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  }

  function downloadTemplate() {
    const csv = "first_name,last_name,email,phone,company,title,agency,role,notes,tags\nJohn,Smith,john@example.com,555-0100,Acme Corp,Director,DoD,Client,Key decision maker,\"priority,defense\"\nJane,Doe,jane@example.com,555-0200,GovTech Inc,Program Manager,GSA,Partner,Teaming partner,\"teaming,IT\"";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = contacts.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.first_name || "").toLowerCase().includes(q) ||
      (c.last_name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.company || "").toLowerCase().includes(q) ||
      (c.agency || "").toLowerCase().includes(q) ||
      (c.title || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-slate-400 mt-1">Manage your government contracting contacts and relationships</p>
        </div>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium cursor-pointer flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
            Upload CSV
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
          </label>
          <button onClick={() => { setShowAdd(!showAdd); setShowUpload(false); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
            + Add Contact
          </button>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className={`mb-6 p-3 rounded-lg text-sm border ${message.type === "success" ? "bg-emerald-900/30 border-emerald-800 text-emerald-300" : "bg-red-900/30 border-red-800 text-red-300"}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="float-right text-xs opacity-60 hover:opacity-100">dismiss</button>
        </div>
      )}

      {/* CSV Upload Preview */}
      {showUpload && csvPreview && (
        <div className="mb-6 p-6 bg-slate-900 border border-blue-800/50 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-blue-400">CSV Preview</h2>
              <p className="text-xs text-slate-400 mt-1">{csvPreview.length} rows detected &middot; Review before importing</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setCsvPreview(null); setShowUpload(false); }} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700">Cancel</button>
              <button onClick={uploadCsvContacts} disabled={uploading} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                {uploading ? "Importing..." : `Import ${csvPreview.length} Contacts`}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0">
                <tr className="bg-slate-800">
                  {Object.keys(csvPreview[0] || {}).map(col => (
                    <th key={col} className="px-3 py-2 text-left text-slate-400 font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvPreview.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t border-slate-800">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="px-3 py-1.5 text-slate-300 truncate max-w-[200px]">{val as string}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {csvPreview.length > 10 && (
              <p className="text-xs text-slate-500 text-center py-2">... and {csvPreview.length - 10} more rows</p>
            )}
          </div>
        </div>
      )}

      {/* Add Contact Form */}
      {showAdd && (
        <form onSubmit={addContact} className="mb-6 p-6 bg-slate-900 border border-emerald-800/50 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Add Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">First Name *</label>
              <input type="text" value={newContact.first_name} onChange={e => setNewContact(p => ({ ...p, first_name: e.target.value }))} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Last Name *</label>
              <input type="text" value={newContact.last_name} onChange={e => setNewContact(p => ({ ...p, last_name: e.target.value }))} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input type="email" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Phone</label>
              <input type="text" value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company</label>
              <input type="text" value={newContact.company} onChange={e => setNewContact(p => ({ ...p, company: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Title</label>
              <input type="text" value={newContact.title} onChange={e => setNewContact(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Agency</label>
              <input type="text" value={newContact.agency} onChange={e => setNewContact(p => ({ ...p, agency: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Role</label>
              <select value={newContact.role} onChange={e => setNewContact(p => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
                <option value="">Select role</option>
                <option value="Client">Client</option>
                <option value="Partner">Partner</option>
                <option value="Subcontractor">Subcontractor</option>
                <option value="Contracting Officer">Contracting Officer</option>
                <option value="Program Manager">Program Manager</option>
                <option value="Vendor">Vendor</option>
                <option value="Mentor">Mentor</option>
                <option value="Reference">Reference</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tags (comma-separated)</label>
              <input type="text" value={newContact.tags} onChange={e => setNewContact(p => ({ ...p, tags: e.target.value }))} placeholder="e.g. priority, defense, IT" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs text-slate-400 mb-1">Notes</label>
            <textarea value={newContact.notes} onChange={e => setNewContact(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium disabled:opacity-50">
              {saving ? "Saving..." : "Add Contact"}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{contacts.length}</p>
          <p className="text-xs text-slate-400">Total Contacts</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-400">{contacts.filter(c => c.agency).length}</p>
          <p className="text-xs text-slate-400">Government</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-purple-400">{contacts.filter(c => c.company).length}</p>
          <p className="text-xs text-slate-400">Industry</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-yellow-400">{new Set(contacts.map(c => c.company).filter(Boolean)).size}</p>
          <p className="text-xs text-slate-400">Companies</p>
        </div>
      </div>

      {/* Search + Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search contacts by name, email, company, or agency..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
        />
        <div className="flex gap-2">
          <button onClick={downloadTemplate} className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs hover:bg-slate-700 whitespace-nowrap">
            Download Template
          </button>
          {selectedIds.size > 0 && (
            <button onClick={deleteSelected} disabled={deleting} className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 disabled:opacity-50 whitespace-nowrap">
              {deleting ? "Deleting..." : `Delete (${selectedIds.size})`}
            </button>
          )}
        </div>
      </div>

      {/* Contacts Table */}
      {filtered.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p className="text-slate-400 mb-2">{search ? "No contacts match your search" : "No contacts yet"}</p>
          <p className="text-xs text-slate-500 mb-4">
            {search ? "Try a different search term" : "Add contacts individually or upload a CSV file to bulk import"}
          </p>
          {!search && (
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">Add Contact</button>
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer">
                Upload CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-800" />
                </th>
                <th className="px-4 py-3 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs text-slate-400 font-medium uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs text-slate-400 font-medium uppercase tracking-wider hidden lg:table-cell">Company</th>
                <th className="px-4 py-3 text-left text-xs text-slate-400 font-medium uppercase tracking-wider hidden lg:table-cell">Title</th>
                <th className="px-4 py-3 text-left text-xs text-slate-400 font-medium uppercase tracking-wider hidden xl:table-cell">Agency</th>
                <th className="px-4 py-3 text-left text-xs text-slate-400 font-medium uppercase tracking-wider hidden xl:table-cell">Role</th>
                <th className="px-4 py-3 text-left text-xs text-slate-400 font-medium uppercase tracking-wider hidden xl:table-cell">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className={`border-t border-slate-800/50 hover:bg-slate-800/30 ${selectedIds.has(c.id) ? "bg-emerald-900/10" : ""}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-800" />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {c.first_name} {c.last_name}
                    {c.phone && <span className="block text-xs text-slate-500 md:hidden">{c.phone}</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{c.company || "—"}</td>
                  <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{c.title || "—"}</td>
                  <td className="px-4 py-3 text-slate-400 hidden xl:table-cell">{c.agency || "—"}</td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    {c.role ? <span className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-300">{c.role}</span> : "—"}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {(c.tags || []).slice(0, 3).map(t => (
                        <span key={t} className="px-1.5 py-0.5 bg-emerald-900/30 text-emerald-400 rounded text-xs">{t}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
            Showing {filtered.length} of {contacts.length} contacts
          </div>
        </div>
      )}
    </div>
  );
}
