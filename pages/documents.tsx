"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Document = {
  id: string;
  filename: string;
  text: string | null;
  createdAt: string;
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadDocuments() {
    const res = await fetch("/api/documents/list");
    const data = await res.json();
    if (res.ok) {
      setDocs(data.documents ?? []);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      await loadDocuments();
      setFile(null);
    } catch (e) {
      console.error(e);
      alert("Error uploading document");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    const res = await fetch("/api/documents/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } else {
      alert("Failed to delete");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-xl font-semibold text-slate-50">Documents</h1>
      <Card className="space-y-3">
        <div className="text-sm text-slate-300">
          Upload solicitations, SOWs, PWS, or past proposals so Sturgeon can
          reference them.
        </div>
        <input
          type="file"
          className="text-sm text-slate-200"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button disabled={!file || loading} onClick={handleUpload}>
          {loading ? "Uploading…" : "Upload"}
        </Button>
      </Card>
      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-50">
          Uploaded documents
        </h2>
        {docs.length === 0 ? (
          <div className="text-sm text-slate-400">No documents yet.</div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start justify-between rounded-md border border-slate-800 bg-slate-900/70 p-3 text-sm"
              >
                <div>
                  <div className="font-medium text-slate-100">
                    {doc.filename}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {doc.text?.slice(0, 140) || "No text parsed."}
                    {doc.text && doc.text.length > 140 ? "…" : ""}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="ml-3 text-xs"
                  onClick={() => handleDelete(doc.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
