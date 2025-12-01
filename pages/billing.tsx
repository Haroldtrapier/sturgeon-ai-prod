import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

async function startCheckout(plan: "pro" | "enterprise") {
  const res = await fetch("/api/subscriptions/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || "Failed");
  window.location.href = data.url;
}

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<"pro" | "enterprise" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(plan: "pro" | "enterprise") {
    try {
      setLoadingPlan(plan);
      setError(null);
      await startCheckout(plan);
    } catch (e) {
      console.error(e);
      setError("Error starting checkout. Please try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-slate-50">Billing & Plans</h1>
        {error && (
          <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-2">
            <div className="text-sm font-semibold text-slate-50">Pro</div>
            <div className="text-2xl font-bold text-slate-50">$79/mo</div>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
              <li>Full access to ContractMatch</li>
              <li>Unlimited proposal drafts</li>
              <li>Capability Statement generator</li>
            </ul>
            <Button
              className="mt-4"
              onClick={() => handle("pro")}
              disabled={loadingPlan === "pro"}
            >
              {loadingPlan === "pro" ? "Redirecting…" : "Upgrade to Pro"}
            </Button>
          </Card>
          <Card className="space-y-2">
            <div className="text-sm font-semibold text-slate-50">Enterprise</div>
            <div className="text-2xl font-bold text-slate-50">$249/mo</div>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
              <li>Everything in Pro</li>
              <li>Team accounts & admin dashboard</li>
              <li>Priority support & custom modules</li>
            </ul>
            <Button
              className="mt-4"
              onClick={() => handle("enterprise")}
              disabled={loadingPlan === "enterprise"}
            >
              {loadingPlan === "enterprise" ? "Redirecting…" : "Contact Sales / Upgrade"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
