"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpgradePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [upgrading, setUpgrading] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      const { data } = await supabase.from("user_profiles").select("subscription_tier").eq("user_id", session.user.id).single();
      if (data?.subscription_tier) setCurrentPlan(data.subscription_tier);
      setLoading(false);
    };
    init();
  }, [router]);

  async function upgrade(plan: string) {
    setUpgrading(true);
    try {
      const res = await fetch(`${API}/billing/create-checkout`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ plan }) });
      if (res.ok) { const d = await res.json(); if (d.url) window.location.href = d.url; }
    } catch {}
    setUpgrading(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const COMPARISON = [
    { feature: "Opportunities/month", free: "25", pro: "Unlimited", enterprise: "Unlimited" },
    { feature: "Proposals/month", free: "3", pro: "Unlimited", enterprise: "Unlimited" },
    { feature: "AI Agent queries", free: "50/month", pro: "Unlimited", enterprise: "Unlimited" },
    { feature: "Users", free: "1", pro: "5", enterprise: "20" },
    { feature: "ContractMatch Engine", free: "—", pro: "Yes", enterprise: "Yes" },
    { feature: "Market Intelligence", free: "Basic", pro: "Full", enterprise: "Full + Custom" },
    { feature: "Proposal Templates", free: "3", pro: "All", enterprise: "All + Custom" },
    { feature: "API Access", free: "—", pro: "Yes", enterprise: "Yes" },
    { feature: "Priority Support", free: "—", pro: "Yes", enterprise: "Dedicated" },
    { feature: "White Label", free: "—", pro: "—", enterprise: "Yes" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8"><h1 className="text-3xl font-bold">Upgrade Your Plan</h1><p className="text-slate-400 mt-2">Current plan: <span className="text-emerald-400 capitalize">{currentPlan}</span></p></div>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-800"><th className="pb-3 pr-4 text-left">Feature</th><th className="pb-3 pr-4 text-center">Free</th><th className="pb-3 pr-4 text-center text-emerald-400">Professional ($197/mo)</th><th className="pb-3 text-center">Enterprise ($397/mo)</th></tr></thead>
          <tbody>{COMPARISON.map(c => (
            <tr key={c.feature} className="border-b border-slate-800/50">
              <td className="py-3 pr-4 text-slate-300">{c.feature}</td>
              <td className="py-3 pr-4 text-center text-slate-400">{c.free}</td>
              <td className="py-3 pr-4 text-center">{c.pro}</td>
              <td className="py-3 text-center text-slate-400">{c.enterprise}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => upgrade("pro")} disabled={upgrading || currentPlan === "pro"} className="p-6 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 text-center">
          <p className="text-xl font-bold">Upgrade to Professional</p>
          <p className="text-sm mt-1 opacity-80">$197/month &middot; 14-day free trial</p>
        </button>
        <button onClick={() => upgrade("enterprise")} disabled={upgrading || currentPlan === "enterprise"} className="p-6 bg-slate-800 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 text-center">
          <p className="text-xl font-bold">Upgrade to Enterprise</p>
          <p className="text-sm mt-1 opacity-80">$397/month &middot; Contact sales</p>
        </button>
      </div>
    </div>
  );
}
