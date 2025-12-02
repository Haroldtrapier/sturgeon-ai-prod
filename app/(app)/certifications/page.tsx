"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";

type Cert = {
  id: string;
  certType: string;
  status: string;
  notes: string | null;
  checklist: any;
};

export default function CertificationsPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [form, setForm] = useState({
    certType: "SDVOSB",
    status: "planning",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  async function loadCerts() {
    const res = await fetch("/api/certifications");
    const data = await res.json();
    if (res.ok) setCerts(data.applications ?? []);
  }

  useEffect(() => {
    loadCerts();
  }, []);

  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch("/api/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setForm({
        certType: "SDVOSB",
        status: "planning",
        notes: "",
      });
      await loadCerts();
    } catch (e) {
      console.error(e);
      alert("Error creating certification tracker");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-50">
        Certifications Center
      </h1>
      <Card className="space-y-3">
        <div className="text-sm text-slate-300">
          Track SBA and VA certifications like 8(a), HUBZone, SDVOSB, WOSB,
          EDWOSB.
        </div>
        <Input
          placeholder="Certification type (8(a), HUBZone, SDVOSB, WOSB, EDWOSB, etc.)"
          value={form.certType}
          onChange={(e) => updateField("certType", e.target.value)}
        />
        <Input
          placeholder="Status (planning, in_progress, submitted, approved, denied)"
          value={form.status}
          onChange={(e) => updateField("status", e.target.value)}
        />
        <TextArea
          rows={3}
          placeholder="Notes, tasks, and reminders…"
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
        />
        <Button onClick={handleCreate} disabled={loading}>
          {loading ? "Saving…" : "Add certification"}
        </Button>
      </Card>
      <Card>
        <h2 className="mb-2 text-sm font-semibold text-slate-50">
          Certification trackers
        </h2>
        {certs.length === 0 ? (
          <div className="text-sm text-slate-400">
            No certifications being tracked.
          </div>
        ) : (
          <div className="space-y-2 text-sm text-slate-100">
            {certs.map((c) => (
              <div
                key={c.id}
                className="rounded-md border border-slate-800 bg-slate-900/70 p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{c.certType}</div>
                  <div className="text-xs text-slate-400">
                    {c.status.toUpperCase()}
                  </div>
                </div>
                {c.notes && (
                  <div className="mt-1 text-xs text-slate-300">
                    {c.notes}
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
