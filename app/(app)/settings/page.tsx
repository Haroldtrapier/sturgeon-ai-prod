"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    naicsCodes: "",
    pscCodes: "",
    cageCode: "",
    duns: "",
    capabilitiesSummary: "",
    certifications: "",
    phone: "",
    website: "",
  });

  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (res.ok && data.profile) {
          const p = data.profile;
          setForm({
            companyName: p.companyName ?? "",
            naicsCodes: (p.naicsCodes ?? []).join(", "),
            pscCodes: (p.pscCodes ?? []).join(", "),
            cageCode: p.cageCode ?? "",
            duns: p.duns ?? "",
            capabilitiesSummary: p.capabilitiesSummary ?? "",
            certifications: (p.certifications ?? []).join(", "),
            phone: p.phone ?? "",
            website: p.website ?? "",
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          naicsCodes: form.naicsCodes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          pscCodes: form.pscCodes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          cageCode: form.cageCode,
          duns: form.duns,
          capabilitiesSummary: form.capabilitiesSummary,
          certifications: form.certifications
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          phone: form.phone,
          website: form.website,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      alert("Profile saved");
    } catch (e) {
      console.error(e);
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-50">
        Company Profile
      </h1>
      <Card className="space-y-3">
        {loading ? (
          <div className="text-sm text-slate-400">Loading…</div>
        ) : (
          <>
            <Input
              placeholder="Company name"
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
            />
            <Input
              placeholder="NAICS codes (comma separated)"
              value={form.naicsCodes}
              onChange={(e) => updateField("naicsCodes", e.target.value)}
            />
            <Input
              placeholder="PSC codes (comma separated)"
              value={form.pscCodes}
              onChange={(e) => updateField("pscCodes", e.target.value)}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="CAGE code"
                value={form.cageCode}
                onChange={(e) => updateField("cageCode", e.target.value)}
              />
              <Input
                placeholder="DUNS (if still used)"
                value={form.duns}
                onChange={(e) => updateField("duns", e.target.value)}
              />
            </div>
            <TextArea
              rows={3}
              placeholder="Capabilities summary"
              value={form.capabilitiesSummary}
              onChange={(e) =>
                updateField("capabilitiesSummary", e.target.value)
              }
            />
            <Input
              placeholder="Certifications (comma separated: SDVOSB, HUBZone, etc.)"
              value={form.certifications}
              onChange={(e) => updateField("certifications", e.target.value)}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
              <Input
                placeholder="Website"
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
              />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
