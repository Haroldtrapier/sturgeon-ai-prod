"use client";

import { useState } from "react";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Recommendation = {
  proposalId: string;
  title: string;
  fitScore: number;
  source: string;
  why: string;
};

export default function ContractMatchPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Recommendation[]>([]);

  async function handleMatch() {
    setLoading(true);
    try {
      const res = await fetch("/api/contractmatch/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setRecs(data.recommendations ?? []);
    } catch (e) {
      console.error(e);
      alert("Error running ContractMatch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-50">
        ContractMatch AI
      </h1>
      <Card className="space-y-4">
        <p className="text-sm text-slate-300">
          Paste an opportunity description (or SAM link summary), and Sturgeon
          will compare it against your historical proposals to estimate fit.
        </p>
        <TextArea
          rows={6}
          placeholder="Paste synopsis, SOW, or summary text…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button onClick={handleMatch} disabled={loading || !text.trim()}>
          {loading ? "Analyzing…" : "Run ContractMatch"}
        </Button>
      </Card>
      {recs.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-50">
            Recommendations
          </h2>
          <div className="space-y-2 text-sm text-slate-200">
            {recs.map((r) => (
              <div
                key={r.proposalId}
                className="rounded-md border border-slate-800 bg-slate-900/70 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-slate-400">
                    Fit score: {(r.fitScore * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {r.why}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
