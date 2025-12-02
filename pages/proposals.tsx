import { useState } from "react";
import { TextArea } from "@/components/ui/TextArea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type GenerateResult = {
  proposalId: string;
  analysis: string;
  outline: string;
  draft: string;
};

export default function ProposalsPage() {
  const [requirements, setRequirements] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawRequirements: requirements,
          title,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Error generating proposal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold text-slate-50">Proposal Builder</h1>
      <Card className="space-y-4">
        <Input
          placeholder="Opportunity title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextArea
          rows={8}
          placeholder="Paste solicitation requirements, SOW, PWS, or Section C here…"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />
        <Button onClick={handleGenerate} disabled={loading || !requirements}>
          {loading ? "Generating…" : "Generate Proposal"}
        </Button>
      </Card>
      {result && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-slate-50">
              Requirements Analysis
            </h2>
            <pre className="whitespace-pre-wrap text-xs text-slate-200">
              {result.analysis}
            </pre>
          </Card>
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-slate-50">
              Outline
            </h2>
            <pre className="whitespace-pre-wrap text-xs text-slate-200">
              {result.outline}
            </pre>
          </Card>
          <Card className="lg:col-span-1">
            <h2 className="mb-2 text-sm font-semibold text-slate-50">
              Draft
            </h2>
            <pre className="whitespace-pre-wrap text-xs text-slate-200">
              {result.draft}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}
