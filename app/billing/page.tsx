"use client";

import { useState } from "react";
import { APIClient } from "../../lib/api";

const PRODUCTS = [
  {
    id: "price_basic",
    name: "Sturgeon Basic",
    price: "$29/mo",
    features: ["Contract Search", "Document Upload", "Research Center"],
  },
  {
    id: "price_pro",
    name: "Sturgeon Pro",
    price: "$79/mo",
    features: [
      "Everything in Basic",
      "Proposal Builder",
      "Wins Tracker",
      "SBA Cert Center",
    ],
  },
  {
    id: "price_enterprise",
    name: "Sturgeon Enterprise",
    price: "$149/mo",
    features: [
      "Everything in Pro",
      "Full ContractMatch AI",
      "Team Collaboration",
      "Advanced Analytics",
    ],
  },
];

export default function BillingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(price_id: string) {
    try {
      setLoadingId(price_id);
      const session = await APIClient.createCheckoutSession({
        price_id,
        success_url: window.location.href,
        cancel_url: window.location.href,
      });
      window.location.href = session.url;
    } catch (err: any) {
      setError(err.message || "Error creating checkout session");
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Billing & Plans</h1>
        <p className="text-slate-400 text-sm mt-1">
          Choose the plan that fits your government contracting needs.
        </p>
      </div>

      {error && (
        <div className="border border-red-500/50 bg-red-500/10 rounded-xl text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {PRODUCTS.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4"
          >
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <div className="text-emerald-300 text-xl font-bold">{p.price}</div>
            <ul className="text-xs text-slate-400 space-y-1">
              {p.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>

            <button
              onClick={() => subscribe(p.id)}
              disabled={loadingId === p.id}
              className="w-full mt-4 rounded-lg bg-emerald-500 text-slate-950 text-sm font-semibold py-2 hover:bg-emerald-400 disabled:opacity-60"
            >
              {loadingId === p.id ? "Processing…" : "Choose Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
