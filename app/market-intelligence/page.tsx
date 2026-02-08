"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MarketIntelligencePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"contracts" | "vendors" | "trends" | "forecast">("contracts");
  const [searchQuery, setSearchQuery] = useState("");
  const [naics, setNaics] = useState("");
  const [agency, setAgency] = useState("");
  const [results, setResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

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

  async function searchContracts(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true); setResults(null); setMessage("");
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("keyword", searchQuery);
      if (naics) params.set("naics", naics);
      if (agency) params.set("agency", agency);
      params.set("limit", "25");
      const res = await fetch(`${API}/api/market/contracts/search?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setResults(await res.json());
      else setMessage("Search failed.");
    } catch { setMessage("Error searching contracts."); }
    setSearching(false);
  }

  async function searchVendors(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true); setResults(null); setMessage("");
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("keyword", searchQuery);
      if (naics) params.set("naics", naics);
      params.set("limit", "25");
      const res = await fetch(`${API}/api/market/vendors/search?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setResults(await res.json());
      else setMessage("Search failed.");
    } catch { setMessage("Error searching vendors."); }
    setSearching(false);
  }

  async function fetchTrends(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true); setResults(null); setMessage("");
    try {
      const params = new URLSearchParams();
      if (naics) params.set("naics", naics);
      if (agency) params.set("agency", agency);
      const res = await fetch(`${API}/api/market/trends?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setResults(await res.json());
      else setMessage("Failed to fetch trends.");
    } catch { setMessage("Error loading trends."); }
    setSearching(false);
  }

  async function fetchForecast(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true); setResults(null); setMessage("");
    try {
      const params = new URLSearchParams();
      if (naics) params.set("naics", naics);
      if (agency) params.set("agency", agency);
      const res = await fetch(`${API}/api/market/forecast?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setResults(await res.json());
      else setMessage("Failed to fetch forecast.");
    } catch { setMessage("Error loading forecast."); }
    setSearching(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Market Intelligence</h1>
        <p className="text-slate-400 mt-1">Research contracts, vendors, spending trends, and forecasts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {(["contracts", "vendors", "trends", "forecast"] as const).map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); setResults(null); }} className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${activeTab === tab ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>{tab}</button>
        ))}
      </div>

      {message && <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}

      {/* Search Form */}
      <form onSubmit={activeTab === "contracts" ? searchContracts : activeTab === "vendors" ? searchVendors : activeTab === "trends" ? fetchTrends : fetchForecast} className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(activeTab === "contracts" || activeTab === "vendors") && (
            <input type="text" placeholder="Keyword search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          )}
          <input type="text" placeholder="NAICS Code" value={naics} onChange={(e) => setNaics(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          {activeTab !== "vendors" && (
            <input type="text" placeholder="Agency" value={agency} onChange={(e) => setAgency(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          )}
        </div>
        <button type="submit" disabled={searching} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
          {searching ? "Loading..." : `Search ${activeTab}`}
        </button>
      </form>

      {/* Results */}
      {results && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          {activeTab === "contracts" && results.results && (
            <>
              <h2 className="text-lg font-semibold mb-4">Contract Results ({results.results.length})</h2>
              <div className="space-y-3">
                {results.results.map((c: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
                    <h3 className="font-medium">{c.Award?.description || c.recipient_name || "Contract"}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                      {c.Award?.total_obligation && <span>Value: ${Number(c.Award.total_obligation).toLocaleString()}</span>}
                      {c.Award?.awarding_agency && <span>Agency: {c.Award.awarding_agency}</span>}
                      {c.Award?.period_of_performance_start_date && <span>Start: {c.Award.period_of_performance_start_date}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "vendors" && results.results && (
            <>
              <h2 className="text-lg font-semibold mb-4">Vendor Results ({results.results.length})</h2>
              <div className="space-y-3">
                {results.results.map((v: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
                    <h3 className="font-medium">{v.recipient_name || v.name || "Vendor"}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
                      {v.amount && <span>Total Awards: ${Number(v.amount).toLocaleString()}</span>}
                      {v.recipient_id && <span>ID: {v.recipient_id}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "trends" && (
            <>
              <h2 className="text-lg font-semibold mb-4">Spending Trends</h2>
              {results.results && results.results.map((t: any, i: number) => (
                <div key={i} className="p-4 bg-slate-800 border border-slate-700 rounded-lg mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t.time_period?.fiscal_year || t.time_period?.month || `Period ${i + 1}`}</span>
                    <span className="text-emerald-400 font-bold">${Number(t.aggregated_amount || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "forecast" && (
            <>
              <h2 className="text-lg font-semibold mb-4">AI Forecast</h2>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-slate-800 p-4 rounded-lg">{typeof results === "string" ? results : JSON.stringify(results, null, 2)}</pre>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
