"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export default function BillingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      setUserId(session.user.id);
      await Promise.all([fetchPlans(), fetchSubscription(session.access_token, session.user.id)]);
      setLoading(false);
    };
    init();
  }, [router]);

  async function fetchPlans() {
    try {
      const res = await fetch(`${API}/billing/plans`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch { /* empty */ }
  }

  async function fetchSubscription(t: string, uid: string) {
    try {
      const res = await fetch(`${API}/billing/subscription?user_id=${uid}`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
        setCurrentPlan(data.plan || "free");
      }
    } catch { /* empty */ }
  }

  async function handleUpgrade(planId: string) {
    if (planId === "free" || planId === currentPlan) return;
    setUpgrading(planId);
    try {
      const res = await fetch(`${API}/billing/create-checkout?plan_id=${planId}&user_id=${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } else { setMessage("Failed to create checkout session."); }
    } catch { setMessage("Error processing upgrade."); }
    setUpgrading(null);
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch(`${API}/billing/cancel?user_email=${encodeURIComponent(user?.email || "")}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage("Subscription cancelled. You'll retain access until the billing period ends.");
        setCurrentPlan("free");
      } else { setMessage("Failed to cancel subscription."); }
    } catch { setMessage("Error cancelling subscription."); }
  }

  const planHighlights: Record<string, { color: string; badge?: string }> = {
    free: { color: "border-slate-700" },
    pro: { color: "border-emerald-600", badge: "Most Popular" },
    enterprise: { color: "border-purple-600", badge: "Best Value" },
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Plans</h1>
        <p className="text-slate-400 mt-1">Manage your subscription and billing</p>
      </div>

      {message && <div className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}

      {/* Current Plan */}
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="text-lg font-semibold mb-2">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-emerald-400 capitalize">{currentPlan}</p>
            <p className="text-sm text-slate-400 mt-1">
              {subscription?.status === "active" ? "Active subscription" : "Free tier - upgrade for more features"}
            </p>
          </div>
          {currentPlan !== "free" && (
            <button onClick={handleCancel} className="px-4 py-2 bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600/20 text-sm font-medium">Cancel Subscription</button>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const highlight = planHighlights[plan.id] || { color: "border-slate-700" };
          const isCurrent = plan.id === currentPlan;
          return (
            <div key={plan.id} className={`p-6 bg-slate-900 border-2 rounded-xl relative ${highlight.color} ${isCurrent ? "ring-2 ring-emerald-400" : ""}`}>
              {highlight.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">{highlight.badge}</span>
              )}
              <h3 className="text-xl font-bold mt-2">{plan.name}</h3>
              <p className="text-3xl font-bold mt-4">
                ${plan.price}<span className="text-sm text-slate-400 font-normal">/mo</span>
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || plan.id === "free" || !!upgrading}
                className={`w-full mt-6 px-4 py-3 rounded-lg font-medium text-sm ${isCurrent ? "bg-slate-700 text-slate-400 cursor-not-allowed" : plan.id === "free" ? "bg-slate-800 text-slate-400 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"} disabled:opacity-50`}
              >
                {isCurrent ? "Current Plan" : upgrading === plan.id ? "Processing..." : plan.id === "free" ? "Free Forever" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
