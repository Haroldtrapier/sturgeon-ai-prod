"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CertDocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const DOC_CATEGORIES = [
    { category: "Business Formation", docs: ["Articles of Incorporation / Organization", "Operating Agreement / Bylaws", "Amendments to formation documents", "Certificate of Good Standing"] },
    { category: "Ownership & Control", docs: ["Stock certificates or membership interest records", "Shareholder / Operating agreement", "Board meeting minutes", "Organizational chart"] },
    { category: "Financial Records", docs: ["3 years of tax returns (personal & business)", "Balance sheet and income statement", "Bank statements (3 months)", "Personal financial statement (SBA Form 413)"] },
    { category: "Veteran Documentation", docs: ["DD-214 (for SDVOSB)", "VA disability rating letter", "VA Benefit Summary Letter"] },
    { category: "Disadvantaged Status", docs: ["Personal narrative of disadvantage (8a)", "Social disadvantage documentation", "Economic disadvantage documentation"] },
    { category: "Certifications & Licenses", docs: ["Current SBA certifications", "State/local certifications (MBE, WBE, DBE)", "Professional licenses", "SAM.gov registration confirmation"] },
    { category: "Capability Statements", docs: ["Company capability statement", "Past performance references", "Contract history summary"] },
  ];

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("certification_documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setDocuments(data || []);
      setLoading(false);
    };
    init();
  }, [router]);

  async function uploadDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("cert-documents").upload(path, file);
    if (uploadError) { setMessage("Upload failed: " + uploadError.message); setUploading(false); return; }
    const { error: dbError } = await supabase.from("certification_documents").insert({ user_id: user.id, file_name: file.name, file_path: path, file_size: file.size, file_type: file.type });
    if (dbError) { setMessage("Failed to save record."); } else { setMessage("Document uploaded successfully."); setDocuments(prev => [{ file_name: file.name, file_path: path, file_size: file.size, created_at: new Date().toISOString() }, ...prev]); }
    setUploading(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Certification Documents</h1><p className="text-slate-400 mt-1">Manage documentation for your certifications</p></div>
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
        <h2 className="font-semibold mb-3">Upload Document</h2>
        {message && <div className="mb-3 p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm">{message}</div>}
        <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-emerald-600 transition-colors">
          <div className="text-center"><p className="text-sm text-slate-300">{uploading ? "Uploading..." : "Click to upload a document"}</p><p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX, PNG, JPG up to 10MB</p></div>
          <input type="file" className="hidden" onChange={uploadDoc} disabled={uploading} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
        </label>
      </div>
      {documents.length > 0 && (
        <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="font-semibold mb-4">Uploaded Documents ({documents.length})</h2>
          <div className="space-y-2">{documents.map((d, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <div><p className="text-sm font-medium">{d.file_name}</p><p className="text-xs text-slate-500">{new Date(d.created_at).toLocaleDateString()} &middot; {d.file_size ? `${(d.file_size / 1024).toFixed(0)} KB` : ""}</p></div>
            </div>
          ))}</div>
        </div>
      )}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Required Documents Checklist</h2>
        {DOC_CATEGORIES.map(cat => (
          <div key={cat.category} className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <h3 className="font-semibold text-emerald-400 mb-3">{cat.category}</h3>
            <div className="space-y-2">{cat.docs.map(doc => (
              <div key={doc} className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg">
                <div className="w-4 h-4 rounded border border-slate-600 flex-shrink-0" />
                <span className="text-sm text-slate-300">{doc}</span>
              </div>
            ))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
