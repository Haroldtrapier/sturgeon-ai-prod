"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function APIDocumentationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const ENDPOINTS = [
    { method: "GET", path: "/api/opportunities/search", desc: "Search SAM.gov opportunities", params: "keyword, naics, set_aside, agency, limit" },
    { method: "GET", path: "/api/opportunities/{id}", desc: "Get opportunity details", params: "id" },
    { method: "POST", path: "/api/proposals", desc: "Create a new proposal", params: "title, rfp_text, opportunity_id" },
    { method: "GET", path: "/api/proposals/{id}", desc: "Get proposal details", params: "id" },
    { method: "POST", path: "/api/agents/chat", desc: "Chat with AI agents", params: "agent_type, message" },
    { method: "POST", path: "/api/compliance/check", desc: "Run compliance check", params: "proposal_id" },
    { method: "POST", path: "/api/compliance/extract", desc: "Extract requirements from RFP", params: "rfp_text" },
    { method: "POST", path: "/api/contract-match/run", desc: "Run ContractMatch engine", params: "(uses profile)" },
    { method: "GET", path: "/api/market/spending-trends", desc: "Get spending trend data", params: "naics, agency" },
    { method: "GET", path: "/api/market/vendors", desc: "Search vendor profiles", params: "name" },
    { method: "GET", path: "/api/notifications", desc: "Get user notifications", params: "limit, unread_only" },
    { method: "GET", path: "/api/billing/status", desc: "Get subscription status", params: "(none)" },
  ];

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("user_profiles").select("api_key").eq("user_id", user.id).single();
      if (data?.api_key) setApiKey(data.api_key);
      setLoading(false);
    };
    init();
  }, [router]);

  async function generateKey() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const key = `sk_sturgeon_${Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, "0")).join("")}`;
    await supabase.from("user_profiles").upsert({ user_id: user.id, api_key: key });
    setApiKey(key);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">API Documentation</h1><p className="text-slate-400 mt-1">Integrate Sturgeon AI into your workflows</p></div>
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="font-semibold mb-3">API Key</h2>
        {apiKey ? (
          <div className="flex items-center gap-3">
            <code className="flex-1 px-4 py-2 bg-slate-800 rounded-lg text-sm font-mono">{showKey ? apiKey : "sk_sturgeon_" + "•".repeat(32)}</code>
            <button onClick={() => setShowKey(!showKey)} className="px-3 py-2 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700">{showKey ? "Hide" : "Show"}</button>
          </div>
        ) : (
          <button onClick={generateKey} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">Generate API Key</button>
        )}
      </div>
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="font-semibold mb-3">Authentication</h2>
        <p className="text-sm text-slate-400 mb-3">Include your API key in the Authorization header:</p>
        <code className="block px-4 py-2 bg-slate-800 rounded-lg text-sm font-mono text-emerald-400">Authorization: Bearer YOUR_API_KEY</code>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Endpoints</h2>
        <div className="space-y-3">{ENDPOINTS.map(e => (
          <div key={e.path} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${e.method === "GET" ? "bg-blue-900/30 text-blue-400" : "bg-emerald-900/30 text-emerald-400"}`}>{e.method}</span>
              <code className="text-sm font-mono">{e.path}</code>
            </div>
            <p className="text-xs text-slate-400">{e.desc}</p>
            <p className="text-xs text-slate-500 mt-1">Params: {e.params}</p>
          </div>
        ))}</div>
      </div>
    </div>
  );
}
