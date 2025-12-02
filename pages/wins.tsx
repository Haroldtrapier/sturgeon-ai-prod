import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";

type Win = {
  id: string;
  opportunityTitle: string;
  agency: string | null;
  amount: number | null;
  contractNumber: string | null;
  description: string | null;
  dateWon: string | null;
};

export default function WinsPage() {
  const [wins, setWins] = useState<Win[]>([]);
  const [form, setForm] = useState({
    opportunityTitle: "",
    agency: "",
    amount: "",
    contractNumber: "",
    description: "",
    dateWon: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadWins() {
    const res = await fetch("/api/wins");
    const data = await res.json();
    if (res.ok) setWins(data.wins ?? []);
  }

  useEffect(() => {
    loadWins();
  }, []);

  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: form.amount ? Number(form.amount) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save win");
      setForm({
        opportunityTitle: "",
        agency: "",
        amount: "",
        contractNumber: "",
        description: "",
        dateWon: "",
      });
      await loadWins();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Error saving win");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-50">Wins Tracker</h1>
      <Card className="space-y-3">
        <div className="text-sm text-slate-300">
          Log every award to build past performance and track revenue.
        </div>
        {error && (
          <div className="rounded-md border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <Input
          placeholder="Opportunity title"
          value={form.opportunityTitle}
          onChange={(e) => updateField("opportunityTitle", e.target.value)}
        />
        <Input
          placeholder="Agency"
          value={form.agency}
          onChange={(e) => updateField("agency", e.target.value)}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Amount (optional)"
            value={form.amount}
            onChange={(e) => updateField("amount", e.target.value)}
          />
          <Input
            placeholder="Contract number (optional)"
            value={form.contractNumber}
            onChange={(e) => updateField("contractNumber", e.target.value)}
          />
        </div>
        <Input
          type="date"
          value={form.dateWon}
          onChange={(e) => updateField("dateWon", e.target.value)}
        />
        <TextArea
          rows={3}
          placeholder="Short description (scope, period of performance, key highlights)…"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
        <Button onClick={handleCreate} disabled={loading}>
          {loading ? "Saving…" : "Log win"}
        </Button>
      </Card>
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-slate-50">
          Logged wins
        </h2>
        {wins.length === 0 ? (
          <div className="text-sm text-slate-400">No wins logged yet.</div>
        ) : (
          <div className="space-y-2 text-sm text-slate-100">
            {wins.map((w) => (
              <div
                key={w.id}
                className="rounded-md border border-slate-800 bg-slate-900/70 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{w.opportunityTitle}</div>
                  <div className="text-xs text-slate-400">
                    {w.dateWon
                      ? new Date(w.dateWon).toLocaleDateString()
                      : ""}
                  </div>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {w.agency || ""}
                  {w.amount != null ? ` • $${w.amount.toLocaleString()}` : ""}
                  {w.contractNumber ? ` • ${w.contractNumber}` : ""}
                </div>
                {w.description && (
                  <div className="mt-1 text-xs text-slate-300">
                    {w.description}
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
