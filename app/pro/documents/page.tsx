"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  category: string;
  uploaded_at: string;
}

export default function ProDocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (data) setDocuments(data.map(d => ({
        id: d.id,
        name: d.name || d.filename || "Untitled",
        type: d.type || d.mime_type || "document",
        size: d.size || "—",
        category: d.category || "general",
        uploaded_at: d.created_at,
      })));
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const CATEGORIES = [
    { id: "all", label: "All Documents" },
    { id: "proposals", label: "Proposals" },
    { id: "certifications", label: "Certifications" },
    { id: "past_performance", label: "Past Performance" },
    { id: "compliance", label: "Compliance" },
    { id: "templates", label: "Templates" },
    { id: "general", label: "General" },
  ];

  const filtered = activeCategory === "all" ? documents : documents.filter(d => d.category === activeCategory);

  const typeIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("doc") || type.includes("word")) return "📝";
    if (type.includes("xls") || type.includes("sheet")) return "📊";
    if (type.includes("image") || type.includes("png") || type.includes("jpg")) return "🖼️";
    return "📎";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-slate-400 mt-1">Manage proposals, certifications, and supporting documents</p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">Upload Document</button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === c.id ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-400">{documents.length}</p>
          <p className="text-xs text-slate-400">Total Files</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-blue-400">{documents.filter(d => d.category === "proposals").length}</p>
          <p className="text-xs text-slate-400">Proposals</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-purple-400">{documents.filter(d => d.category === "certifications").length}</p>
          <p className="text-xs text-slate-400">Certifications</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-2xl font-bold text-yellow-400">{documents.filter(d => d.category === "templates").length}</p>
          <p className="text-xs text-slate-400">Templates</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <p className="text-slate-400 mb-2">No documents found</p>
          <p className="text-xs text-slate-500">Upload documents to organize your proposals, certifications, and supporting files</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <span>{typeIcon(doc.type)}</span>
                    <span className="text-slate-200">{doc.name}</span>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-400">{doc.category.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-slate-400">{doc.size}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-500 mt-4">Document management is available on Professional and Enterprise plans. Max file size: 50MB.</p>
    </div>
  );
}
