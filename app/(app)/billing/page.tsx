"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function BillingPage() {
  const [loading, setLoading] = useState<null | "pro" | "enterprise">(null);

  async function startCheckout(plan: "pro" | "enterprise") {
    setLoading(plan);
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Failed");
      window.location.href = data.url;
    } catch (e) {
      console.error(e);
      alert("Error starting checkout");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-50">Billing</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <div className="text-sm font-semibold text-slate-50">Pro</div>
          <div className="text-2xl font-bold text-slate-50">$99</div>
          <div className="text-xs text-slate-400">per month</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-300">
            <li>Full proposal builder</li>
            <li>ContractMatch AI</li>
            <li>Saved opps, alerts, wins tracking</li>
          </ul>
          <Button
            className="mt-3"
            onClick={() => startCheckout("pro")}
            disabled={loading === "pro"}
          >
            {loading === "pro" ? "Redirecting…" : "Upgrade to Pro"}
          </Button>
        </Card>
        <Card className="space-y-3">
          <div className="text-sm font-semibold text-slate-50">
            Enterprise
          </div>
          <div className="text-2xl font-bold text-slate-50">$249</div>
          <div className="text-xs text-slate-400">per month</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-300">
            <li>Everything in Pro</li>
            <li>Advanced analytics</li>
            <li>Priority support</li>
          </ul>
          <Button
            className="mt-3"
            onClick={() => startCheckout("enterprise")}
            disabled={loading === "enterprise"}
          >
            {loading === "enterprise" ? "Redirecting…" : "Upgrade to Enterprise"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
