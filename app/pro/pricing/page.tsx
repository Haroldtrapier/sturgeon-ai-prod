"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState("free");

  const PLANS = [
    { id: "starter", name: "Starter", price: "$97", period: "/month", features: ["100 opportunities/month", "10 proposals/month", "1 user", "Basic AI agents", "SAM.gov search", "Email support"], cta: "Start Free Trial", highlight: false },
    { id: "professional", name: "Professional", price: "$197", period: "/month", features: ["Unlimited opportunities", "Unlimited proposals", "5 users", "All 6 AI agents", "ContractMatch Engine", "Market intelligence", "Priority support", "API access"], cta: "Start Free Trial", highlight: true },
    { id: "enterprise", name: "Enterprise", price: "$397", period: "/month", features: ["Everything in Professional", "20 users", "White-label option", "SSO/SAML", "Custom integrations", "Dedicated support", "SLA guarantee", "Training sessions"], cta: "Contact Sales", highlight: false },
  ];

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("user_profiles").select("subscription_tier").eq("user_id", user.id).single();
      if (data?.subscription_tier) setCurrentPlan(data.subscription_tier);
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12"><h1 className="text-3xl font-bold">Pricing Plans</h1><p className="text-slate-400 mt-2">Choose the plan that fits your government contracting needs</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {PLANS.map(p => (
          <div key={p.id} className={`p-6 bg-slate-900 border rounded-xl ${p.highlight ? "border-emerald-600 ring-2 ring-emerald-600/20" : "border-slate-800"}`}>
            {p.highlight && <p className="text-xs text-emerald-400 font-medium mb-2">MOST POPULAR</p>}
            <h2 className="text-xl font-bold">{p.name}</h2>
            <div className="mt-2 mb-6"><span className="text-4xl font-bold text-emerald-400">{p.price}</span><span className="text-slate-400">{p.period}</span></div>
            <ul className="space-y-2 mb-6">{p.features.map(f => (<li key={f} className="flex items-start gap-2 text-sm text-slate-300"><span className="text-emerald-400 mt-0.5">&#10003;</span>{f}</li>))}</ul>
            <button onClick={() => router.push("/billing")} className={`w-full py-3 rounded-lg font-medium transition-colors ${p.highlight ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-800 text-slate-300 hover:bg-slate-700"} ${currentPlan === p.id ? "opacity-50 cursor-default" : ""}`}>{currentPlan === p.id ? "Current Plan" : p.cta}</button>
          </div>
        ))}
      </div>
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center">
        <h2 className="font-semibold mb-2">Need a custom plan?</h2>
        <p className="text-sm text-slate-400 mb-4">We offer custom pricing for large organizations and special requirements.</p>
        <button onClick={() => router.push("/support")} className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm">Contact Sales</button>
      </div>
    </div>
  );
}
