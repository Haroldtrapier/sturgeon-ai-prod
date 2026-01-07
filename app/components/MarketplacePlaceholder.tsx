// app/components/MarketplacePlaceholder.tsx
"use client";

import { ExternalLink, Sparkles, Lock, Workflow } from "lucide-react";

type MarketplacePlaceholderProps = {
  name: string;
  loginUrl: string;
  description: string;
  bullets: string[];
  comingSoon: string[];
  logo?: string;
  color?: "emerald" | "blue" | "purple";
};

export default function MarketplacePlaceholder({
  name,
  loginUrl,
  description,
  bullets,
  comingSoon,
  logo,
  color = "emerald",
}: MarketplacePlaceholderProps) {
  const colorClasses = {
    emerald: {
      badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
      button: "bg-emerald-500 shadow-emerald-500/30 hover:bg-emerald-400",
      step: "bg-emerald-500/20 text-emerald-300",
      coming: "border-emerald-500/40 bg-emerald-500/5 text-emerald-200",
      dot: "bg-emerald-400",
    },
    blue: {
      badge: "border-blue-500/40 bg-blue-500/10 text-blue-300",
      button: "bg-blue-500 shadow-blue-500/30 hover:bg-blue-400",
      step: "bg-blue-500/20 text-blue-300",
      coming: "border-blue-500/40 bg-blue-500/5 text-blue-200",
      dot: "bg-blue-400",
    },
    purple: {
      badge: "border-purple-500/40 bg-purple-500/10 text-purple-300",
      button: "bg-purple-500 shadow-purple-500/30 hover:bg-purple-400",
      step: "bg-purple-500/20 text-purple-300",
      coming: "border-purple-500/40 bg-purple-500/5 text-purple-200",
      dot: "bg-purple-400",
    },
  };

  const colors = colorClasses[color];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-8">
      <section className="max-w-5xl mx-auto mb-10">
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold mb-3 ${colors.badge}`}>
          <Sparkles className="w-3 h-3 mr-1.5" />
          Marketplace Integration · Placeholder
        </span>
        
        <div className="flex items-center gap-4 mb-3">
          {logo && <img src={logo} alt={`${name} logo`} className="h-12 w-12 rounded-lg" />}
          <h1 className="text-3xl md:text-4xl font-bold">{name} + Sturgeon AI</h1>
        </div>
        
        <p className="text-slate-300 max-w-2xl mb-6">{description}</p>
        
        <div className="flex flex-wrap gap-3">
          <a href={loginUrl} target="_blank" rel="noreferrer"
            className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg transition ${colors.button}`}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open {name}
          </a>
          <button type="button" disabled
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sf font-semibold text-slate-100 hover:border-emerald-500/70 hover:text-emerald-200 transition">
            <Sparkles className="w-4 h-4 mr-2" />
            Coming Soon: Auto-Analysis
          </button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            How you&apos;ll use {name} with Sturgeon
          </h2>
          <p className="text-sm text-slate-300 mb-3">
            This page is a Sturgeon AI workspace dedicated to <span className="font-semibold">{name}</span>. 
            For now, it is a placeholder while we prepare deeper integrations. You will:
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-200 list-disc list-inside">
            {bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5">
          <h3 className="text-sm font-semibold text-amber-300 mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Why this is a placeholder
          </h3>
          <p className="text-xs text-amber-100">
            {name} requires you to log in directly on their website. Sturgeon AI does not store your credentials 
            and cannot automatically access your account. You&apos;ll log in on the official portal and then copy 
            listings or export data into Sturgeon for analysis, bidding, pricing, and tracking.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold mb-3">Workflow with Sturgeon AI</h2>
          <ol className="space-y-3 text-sm text-slate-200">
            { [
              { title: `Log into ${name}`, desc: `Open the official ${name} portal in a new tab and sign in with your own account.` },
              { title: "Locate opportunities", desc: `Search for relevant buys, RFQs, or opportunities inside ${name}.` },
              { title: "Bring data into Sturgeon", desc: "Copy opportunity text, download attachments, or export data, then paste/upload into Sturgeon's analysis, proposal, or ContractMatch tools." },
              { title: "Use AI to win", desc: "Let Sturgeon AI summarize, score, price, and build proposals for your selected opportunities." },
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className={`mt-0.5 h-6 w-6 flex items-center justify-center rounded-full text-xs font-semibold ${colors.step}`}>
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-slate-400">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className={`rounded-2xl border p-5 ${colors.coming}`}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Coming soon in this workspace
          </h2>
          <ul className="space-y-2 text-sm">
            {comingSoon.map((c) => (
              <li key={c} className="flex gap-2">
                <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                <span>{c}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs opacity-80 mt-3">
            These features will be layered on top of your existing {name} workflow, without storing your 
            credentials or changing how you sign in to the portal.
          </p>
        </div>
      </section>
    </main>
  );
}
