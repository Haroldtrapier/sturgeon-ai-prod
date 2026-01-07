// app/marketplaces/page.tsx
const marketplaces = [
  { slug: "unison", name: "Unison Marketplace" },
  { slug: "govspend", name: "GovSpend" },
  { slug: "govwin", name: "GovWin" },
  { slug: "fpds", name: "FPDS / Award History" },
  { slug: "usaspending", name: "USAspending.gov" },
  { slug: "gsa-ebuy", name: "GSA eBuy" },
  { slug: "gsa-advantage", name: "GSA Advantage" },
  { slug: "fedconnect", name: "FedConnect" },
  { slug: "sam-vendor", name: "SAM.gov Vendor Profile" },
  { slug: "dibbs", name: "DLA DIBBS" },
  { slug: "nasa-sewp", name: "NASA SEWP" },
];

export default function MarketplacesIndexPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-8">
      <section className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Marketplaces & Portals</h1>
        <p className="text-slate-300 mb-6">
          These pages are placeholders that explain how Sturgeon AI will work
          alongside each marketplace. You&apos;ll always log in directly on the
          official portal, then use Sturgeon for analysis, strategy, and
          proposal support.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {marketplaces.map((m) => (
            <a
              key={m.slug}
              href={`/${m.slug}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 hover:border-emerald-500/60 hover:bg-slate-900 transition"
            >
              <h2 className="text-lg font-semibold mb-1">{m.name}</h2>
              <p className="text-xs text-slate-400">
                Click to view the placeholder workspace for {m.name} and how
                it will connect to your Sturgeon AI workflow.
              </p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
