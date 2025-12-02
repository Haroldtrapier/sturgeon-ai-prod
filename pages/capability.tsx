import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";

export default function CapabilityPage() {
  const [companyName, setCompanyName] = useState("");
  const [naicsCodes, setNaicsCodes] = useState("");
  const [pscCodes, setPscCodes] = useState("");
  const [capabilitiesSummary, setCapabilitiesSummary] = useState("");
  const [differentiators, setDifferentiators] = useState("");
  const [pastPerformance, setPastPerformance] = useState("");
  const [certifications, setCertifications] = useState("");
  const [contactBlock, setContactBlock] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load profile to pre-fill basics
    (async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (res.ok && data.profile) {
          setCompanyName(data.profile.companyName ?? "");
          setNaicsCodes((data.profile.naicsCodes ?? []).join(", "));
          setPscCodes((data.profile.pscCodes ?? []).join(", "));
          setCertifications((data.profile.certifications ?? []).join(", "));
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        // Silently fail - user can still fill form manually
      }
    })();
  }, []);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/capability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          naics: naicsCodes.split(",").map((s) => s.trim()).filter(Boolean),
          psc: pscCodes.split(",").map((s) => s.trim()).filter(Boolean),
          capabilitiesSummary,
          differentiators,
          pastPerformance,
          certifications: certifications.split(",").map((s) => s.trim()).filter(Boolean),
          contactBlock,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate capability statement");
      setResult(data.capabilityStatement ?? "");
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "Error generating capability statement";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
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
            placeholder="NAICS codes (comma separated)"
            value={naicsCodes}
            onChange={(e) => setNaicsCodes(e.target.value)}
          />
          <Input
            placeholder="PSC codes (comma separated)"
            value={pscCodes}
            onChange={(e) => setPscCodes(e.target.value)}
          />
          <TextArea
            rows={3}
            placeholder="Capabilities summary"
            value={capabilitiesSummary}
            onChange={(e) => setCapabilitiesSummary(e.target.value)}
          />
          <TextArea
            rows={3}
            placeholder="Differentiators"
            value={differentiators}
            onChange={(e) => setDifferentiators(e.target.value)}
          />
          <TextArea
            rows={3}
            placeholder="Past performance highlights"
            value={pastPerformance}
            onChange={(e) => setPastPerformance(e.target.value)}
          />
          <Input
            placeholder="Certifications (comma separated)"
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
          />
          <TextArea
            rows={3}
            placeholder="Contact block (name, phone, email, address)"
            value={contactBlock}
            onChange={(e) => setContactBlock(e.target.value)}
          />
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating…" : "Generate capability statement"}
          </Button>
        </Card>
        {result && (
          <Card>
            <h2 className="mb-2 text-sm font-semibold text-slate-50">
              Generated capability statement
            </h2>
            <pre className="whitespace-pre-wrap text-sm text-slate-100">
              {result}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}
