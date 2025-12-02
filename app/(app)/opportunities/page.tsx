"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";

type Opp = {
  id: string;
  source: string;
  title: string;
  agency: string | null;
  status: string;
  metadata: {
    notes?: string;
    [key: string]: unknown;
  };
};

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<Opp[]>([]);
  const [form, setForm] = useState({
    title: "",
    agency: "",
    source: "manual",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  async function loadOpps() {
    const res = await fetch("/api/opportunities/list");
    const data = await res.json();
    if (res.ok) setOpps(data.opportunities ?? []);
  }

  useEffect(() => {
    loadOpps();
  }, []);

  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/opportunities/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          agency: form.agency,
          source: form.source,
          status: "watchlist",
          metadata: { notes: form.notes },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setForm({
        title: "",
        agency: "",
        source: "manual",
        notes: "",
      });
      await loadOpps();
    } catch (e) {
      console.error(e);
      alert("Error saving opportunity");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-50">
        Saved Opportunities
      </h1>
      <Card className="space-y-3">
        <div className="text-sm text-slate-300">
          Save opportunities you want to track across SAM, Unison, GovWin,
          GovSpend, or manual sources.
        </div>
        <Input
          placeholder="Title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
        <Input
          placeholder="Agency"
          value={form.agency}
          onChange={(e) => updateField("agency", e.target.value)}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Source (sam, unison, govwin, govspend, manual)"
            value={form.source}
            onChange={(e) => updateField("source", e.target.value)}
          />
        </div>
        <TextArea
          rows={3}
          placeholder="Notes, URL, or quick summary…"
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
        />
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving…" : "Save opportunity"}
        </Button>
      </Card>
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-slate-50">
          Saved list
        </h2>
        {opps.length === 0 ? (
          <div className="text-sm text-slate-400">No opportunities saved.</div>
        ) : (
          <div className="space-y-2 text-sm text-slate-100">
            {opps.map((o) => (
              <div
                key={o.id}
                className="rounded-md border border-slate-800 bg-slate-900/70 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{o.title}</div>
                  <div className="text-xs text-slate-400">
                    {o.source.toUpperCase()} • {o.status}
                  </div>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {o.agency || ""}
                </div>
                {o.metadata?.notes && (
                  <div className="mt-1 text-xs text-slate-300">
                    {o.metadata.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
