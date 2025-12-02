"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function CapabilityPage() {
  const [companyName, setCompanyName] = useState("");
  const [naics, setNaics] = useState("");
  const [psc, setPsc] = useState("");
  const [summary, setSummary] = useState("");
  const [diffs, setDiffs] = useState("");
  const [pastPerf, setPastPerf] = useState("");
  const [certs, setCerts] = useState("");
  const [contact, setContact] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/capability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          naics: naics.split(",").map((s) => s.trim()),
          psc: psc.split(",").map((s) => s.trim()),
          capabilitiesSummary: summary,
          differentiators: diffs,
          pastPerformance: pastPerf,
          certifications: certs.split(",").map((s) => s.trim()),
          contactBlock: contact,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data.capabilityStatement);
    } catch (e) {
      console.error(e);
      alert("Error generating capability statement");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-50">
        Capability Statement Builder
      </h1>
      <Card className="space-y-4">
        <Input
          placeholder="Company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <Input
          placeholder="NAICS codes (comma-separated)"
          value={naics}
          onChange={(e) => setNaics(e.target.value)}
        />
        <Input
          placeholder="PSC codes (comma-separated)"
          value={psc}
          onChange={(e) => setPsc(e.target.value)}
        />
        <TextArea
          rows={3}
          placeholder="Capabilities summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <TextArea
          rows={3}
          placeholder="Differentiators"
          value={diffs}
          onChange={(e) => setDiffs(e.target.value)}
        />
        <TextArea
          rows={3}
          placeholder="Past performance highlights"
          value={pastPerf}
          onChange={(e) => setPastPerf(e.target.value)}
        />
        <Input
          placeholder="Certifications (comma-separated)"
          value={certs}
          onChange={(e) => setCerts(e.target.value)}
        />
        <TextArea
          rows={3}
          placeholder="Contact block (phone, email, address)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating…" : "Generate Capability Statement"}
        </Button>
      </Card>
      {result && (
        <Card>
          <h2 className="mb-2 text-sm font-semibold text-slate-50">
            Generated Capability Statement
          </h2>
          <pre className="whitespace-pre-wrap text-sm text-slate-200">
            {result}
          </pre>
        </Card>
      )}
    </div>
  );
}
