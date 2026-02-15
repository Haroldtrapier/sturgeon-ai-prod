"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VendorProfilesPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [vendors, setVendors] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      setLoading(false);
    };
    init();
  }, [router]);

  async function searchVendors(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`${API}/api/market/vendors/search?keyword=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setVendors(d.vendors || d.results || []); }
    } catch {}
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Vendor Profiles</h1><p className="text-slate-400 mt-1">Research federal contractors and their award history</p></div>
      <form onSubmit={searchVendors} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex gap-3">
          <input type="text" placeholder="Search vendor name..." value={query} onChange={e => setQuery(e.target.value)} className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <button type="submit" disabled={searching} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">{searching ? "Searching..." : "Search"}</button>
        </div>
      </form>
      {vendors.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{vendors.length} Vendors Found</h2>
          {vendors.map((v, i) => (
            <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="font-semibold text-blue-400">{v.recipient_name || v.name || "Unknown Vendor"}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm text-slate-400">
                {v.duns && <div><span className="text-slate-500">DUNS:</span> {v.duns}</div>}
                {v.cage_code && <div><span className="text-slate-500">CAGE:</span> {v.cage_code}</div>}
                {v.total_obligations && <div><span className="text-slate-500">Total Awards:</span> ${Number(v.total_obligations).toLocaleString()}</div>}
                {v.contract_count && <div><span className="text-slate-500">Contracts:</span> {v.contract_count}</div>}
                {v.state && <div><span className="text-slate-500">State:</span> {v.state}</div>}
                {v.business_types && <div><span className="text-slate-500">Type:</span> {v.business_types}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {vendors.length === 0 && !searching && <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl"><p className="text-slate-400">Search for a vendor to view their profile and contract history</p></div>}
    </div>
  );
}
