"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type SavedSearch = {
  id: string;
  name: string;
  query: string;
  marketplace: string | null;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<SavedSearch[]>([]);
  const [form, setForm] = useState({
    name: "",
    query: "",
    marketplace: "sam",
  });
  const [loading, setLoading] = useState(false);

  async function loadAlerts() {
    const res = await fetch("/api/alerts/list");
    const data = await res.json();
    if (res.ok) setAlerts(data.savedSearches ?? []);
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setForm({ name: "", query: "", marketplace: "sam" });
      await loadAlerts();
    } catch (e) {
      console.error(e);
      alert("Error saving alert");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-50">Alerts</h1>
      <Card className="space-y-3">
        <div className="text-sm text-slate-300">
          Create saved searches you want Sturgeon to monitor (in future
          automation we can poll and send notifications).
        </div>
        <Input
          placeholder="Alert name (e.g., SDVOSB IT Services – NC)"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
        <Input
          placeholder="Keyword query"
          value={form.query}
          onChange={(e) => updateField("query", e.target.value)}
        />
        <Input
          placeholder="Marketplace (sam, unison, govwin, govspend)"
          value={form.marketplace}
          onChange={(e) => updateField("marketplace", e.target.value)}
        />
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving…" : "Save alert"}
        </Button>
      </Card>
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-slate-50">
          Saved alerts
        </h2>
        {alerts.length === 0 ? (
          <div className="text-sm text-slate-400">No alerts yet.</div>
        ) : (
          <div className="space-y-2 text-sm text-slate-100">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="rounded-md border border-slate-800 bg-slate-900/70 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-slate-400">
                    {a.marketplace?.toUpperCase() ?? "ANY"}
                  </div>
                </div>
                <div className="mt-1 text-xs text-slate-300">{a.query}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
