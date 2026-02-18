"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SystemIntegrationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [testing, setTesting] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, "connected" | "error" | "untested">>({});
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

  async function testConnection(key: string) {
    setTesting(key);
    try {
      const res = await fetch(`${API}/api/system/test-integration`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ integration: key }),
      });
      setStatuses(prev => ({ ...prev, [key]: res.ok ? "connected" : "error" }));
    } catch {
      setStatuses(prev => ({ ...prev, [key]: "error" }));
    }
    setTesting(null);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const INTEGRATIONS = [
    { key: "supabase", name: "Supabase", desc: "PostgreSQL database, auth, and real-time subscriptions", category: "Core" },
    { key: "openai", name: "OpenAI / Claude", desc: "AI model provider for all agent capabilities", category: "Core" },
    { key: "stripe", name: "Stripe", desc: "Payment processing and subscription management", category: "Core" },
    { key: "sam_gov", name: "SAM.gov API", desc: "Federal opportunity search and entity validation", category: "Data Sources" },
    { key: "fpds", name: "FPDS.gov", desc: "Federal procurement data and contract history", category: "Data Sources" },
    { key: "usaspending", name: "USASpending.gov", desc: "Federal spending data and award details", category: "Data Sources" },
    { key: "ebuy", name: "GSA eBuy", desc: "GSA Schedule RFQ and RFI listings", category: "Data Sources" },
    { key: "sendgrid", name: "SendGrid", desc: "Transactional email notifications and alerts", category: "Services" },
    { key: "vercel", name: "Vercel", desc: "Frontend hosting and edge functions", category: "Infrastructure" },
    { key: "railway", name: "Railway", desc: "Backend API hosting and job scheduling", category: "Infrastructure" },
  ];

  const categories = [...Array.from(new Set(INTEGRATIONS.map(i => i.category)))];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">System Integrations</h1>
        <p className="text-slate-400 mt-1">Monitor and test platform integrations</p>
      </div>

      {categories.map(cat => (
        <div key={cat} className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-slate-300">{cat}</h2>
          <div className="space-y-3">
            {INTEGRATIONS.filter(i => i.category === cat).map(i => (
              <div key={i.key} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <h3 className="font-semibold text-sm">{i.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{i.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  {statuses[i.key] && (
                    <span className={`text-xs font-medium ${statuses[i.key] === "connected" ? "text-emerald-400" : "text-red-400"}`}>
                      {statuses[i.key] === "connected" ? "Connected" : "Error"}
                    </span>
                  )}
                  <button onClick={() => testConnection(i.key)} disabled={testing === i.key} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs hover:bg-slate-700 disabled:opacity-50">
                    {testing === i.key ? "Testing..." : "Test"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
