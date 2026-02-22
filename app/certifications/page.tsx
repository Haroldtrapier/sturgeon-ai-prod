"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Certification {
  id: string;
  certification_type: string;
  status: string;
  expiration_date: string | null;
  issuing_agency: string;
  notes: string;
  created_at: string;
}

const CERT_TYPES = [
  { id: "SDVOSB", name: "Service-Disabled Veteran-Owned Small Business", color: "bg-blue-600" },
  { id: "8a", name: "8(a) Business Development", color: "bg-purple-600" },
  { id: "HUBZone", name: "HUBZone", color: "bg-lime-700" },
  { id: "WOSB", name: "Women-Owned Small Business", color: "bg-pink-600" },
  { id: "EDWOSB", name: "Economically Disadvantaged WOSB", color: "bg-rose-600" },
  { id: "MBE", name: "Minority Business Enterprise", color: "bg-amber-600" },
];

export default function CertificationsPage() {
  const router = useRouter();
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [certType, setCertType] = useState("SDVOSB");
  const [expDate, setExpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      await fetchCerts(session.access_token);
    };
    init();
  }, [router]);

  async function fetchCerts(t: string) {
    try {
      const res = await fetch(`${API}/api/certifications/`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setCerts(data.certifications || []);
      }
    } catch { /* empty */ }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMessage("");
    try {
      const res = await fetch(`${API}/api/certifications/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ certification_type: certType, expiration_date: expDate || null, notes }),
      });
      if (res.ok) {
        setMessage("Certification added.");
        setShowAdd(false); setCertType("SDVOSB"); setExpDate(""); setNotes("");
        await fetchCerts(token);
      } else { setMessage("Failed to add certification."); }
    } catch { setMessage("Error adding certification."); }
    setSaving(false);
  }

  function getCertColor(type: string) {
    return CERT_TYPES.find((c) => c.id === type)?.color || "bg-slate-600";
  }

  function getCertName(type: string) {
    return CERT_TYPES.find((c) => c.id === type)?.name || type;
  }

  function isExpiringSoon(date: string | null) {
    if (!date) return false;
    const diff = new Date(date).getTime() - Date.now();
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Certifications</h1>
          <p className="text-stone-500 mt-1">Track and manage your small business certifications</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 font-medium">+ Add Certification</button>
      </div>

      {message && <div className="mb-6 p-4 bg-stone-100 border border-stone-300 rounded-lg text-sm">{message}</div>}

      {showAdd && (
        <form onSubmit={handleAdd} className="mb-8 p-6 bg-white border border-stone-200 rounded-xl space-y-4">
          <h2 className="text-lg font-semibold">Add Certification</h2>
          <select value={certType} onChange={(e) => setCertType(e.target.value)} className="w-full px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none">
            {CERT_TYPES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="w-full px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" placeholder="Expiration Date" />
          <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-6 py-2 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 font-medium">{saving ? "Saving..." : "Add"}</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2 bg-stone-200 text-white rounded-lg hover:bg-slate-600">Cancel</button>
          </div>
        </form>
      )}

      {/* Certification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {CERT_TYPES.map((ct) => {
          const cert = certs.find((c) => c.certification_type === ct.id);
          return (
            <div key={ct.id} className={`p-6 bg-white border rounded-xl ${cert ? "border-lime-600" : "border-stone-200 opacity-60"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 text-xs font-bold rounded ${ct.color}`}>{ct.id}</span>
                {cert ? (
                  <span className="text-xs font-medium text-lime-700">Active</span>
                ) : (
                  <span className="text-xs font-medium text-stone-8000">Not Added</span>
                )}
              </div>
              <h3 className="font-semibold text-sm">{ct.name}</h3>
              {cert && (
                <div className="mt-3 space-y-1">
                  {cert.expiration_date && (
                    <p className={`text-xs ${isExpiringSoon(cert.expiration_date) ? "text-yellow-600" : "text-stone-500"}`}>
                      Expires: {new Date(cert.expiration_date).toLocaleDateString()}
                      {isExpiringSoon(cert.expiration_date) && " (Expiring Soon!)"}
                    </p>
                  )}
                  {cert.notes && <p className="text-xs text-stone-8000">{cert.notes}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* All Certs Table */}
      {certs.length > 0 && (
        <div className="p-6 bg-white border border-stone-200 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">All Certifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-300 text-stone-500">
                  <th className="text-left py-3 px-2">Type</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Expiration</th>
                  <th className="text-left py-3 px-2">Added</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.id} className="border-b border-stone-200">
                    <td className="py-3 px-2 font-medium">{getCertName(c.certification_type)}</td>
                    <td className="py-3 px-2"><span className="px-2 py-1 text-xs rounded bg-lime-700/20 text-lime-700">{c.status}</span></td>
                    <td className="py-3 px-2 text-stone-500">{c.expiration_date ? new Date(c.expiration_date).toLocaleDateString() : "N/A"}</td>
                    <td className="py-3 px-2 text-stone-8000">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
