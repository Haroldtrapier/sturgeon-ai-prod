import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Result = {
  id: string;
  title: string;
  agency: string | null;
  status: string;
  source: string;
};

export default function MarketplacesPage() {
  const [marketplace, setMarketplace] = useState<"sam" | "govwin" | "govspend" | "unison">("sam");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  async function runSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/marketplaces/${marketplace}?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResults(data.results ?? []);
    } catch (e) {
      console.error(e);
      alert("Error searching marketplace");
    } finally {
      setLoading(false);
    }
  }

  async function saveOpp(r: Result) {
    try {
      const res = await fetch("/api/opportunities/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: r.title,
          agency: r.agency,
          source: r.source,
          externalId: r.id,
          status: "watchlist",
          metadata: {},
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      alert("Saved to opportunities");
    } catch (e) {
      console.error(e);
      alert("Error saving opportunity");
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-xl font-semibold text-slate-50">
          Marketplaces
        </h1>
        <Card className="space-y-3">
          <div className="text-sm text-slate-300">
            Unified search across SAM, Unison Marketplace, GovWin, and GovSpend
            (currently using placeholder data; plug in real APIs later).
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <Input
                placeholder="Search keywords (NAICS, PSC, or capabilities)…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Input
              placeholder="Marketplace (sam, govwin, govspend, unison)"
              value={marketplace}
              onChange={(e) =>
                setMarketplace(
                  e.target.value as "sam" | "govwin" | "govspend" | "unison"
                )
              }
            />
          </div>
          <Button onClick={runSearch} disabled={loading || !query.trim()}>
            {loading ? "Searching…" : "Search"}
          </Button>
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-slate-50">
            Results
          </h2>
          {results.length === 0 ? (
            <div className="text-sm text-slate-400">No results yet.</div>
          ) : (
            <div className="space-y-2 text-sm text-slate-100">
              {results.map((r) => (
                <div
                  key={`${r.source}-${r.id}`}
                  className="flex items-start justify-between rounded-md border border-slate-800 bg-slate-900/70 p-3"
                >
                  <div>
                    <div className="font-medium">{r.title}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {r.agency || ""} • {r.source.toUpperCase()} • {r.status}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="ml-3 text-xs"
                    onClick={() => saveOpp(r)}
                  >
                    Save
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
