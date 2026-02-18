"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ComplianceMatrixPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [rfpText, setRfpText] = useState("");
  const [matrix, setMatrix] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setToken(session.access_token);
      setLoading(false);
    };
    init();
  }, [router]);

  async function generateMatrix(e: React.FormEvent) {
    e.preventDefault();
    if (!rfpText.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API}/api/compliance/extract-requirements`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ solicitation_text: rfpText }) });
      if (res.ok) {
        const d = await res.json();
        const reqs = d.requirements || [];
        setMatrix(reqs.map((r: any, i: number) => ({ id: i + 1, requirement: typeof r === "string" ? r : r.requirement || r.text || JSON.stringify(r), section: r.section || "—", status: "Not Started", response: "", volume: r.volume || "Technical" })));
      }
    } catch {}
    setGenerating(false);
  }

  function updateStatus(id: number, status: string) {
    setMatrix(matrix.map(m => m.id === id ? { ...m, status } : m));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const statusColors: Record<string, string> = { "Not Started": "text-slate-400 bg-slate-800", "In Progress": "text-yellow-400 bg-yellow-900/20", "Complete": "text-emerald-400 bg-emerald-900/20", "N/A": "text-slate-500 bg-slate-800" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Compliance Matrix</h1><p className="text-slate-400 mt-1">Generate and track proposal compliance requirements</p></div>
      {matrix.length === 0 ? (
        <form onSubmit={generateMatrix} className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-sm text-slate-400 mb-3">Paste RFP text to auto-generate a compliance matrix</p>
          <textarea value={rfpText} onChange={e => setRfpText(e.target.value)} rows={8} placeholder="Paste solicitation or RFP text here..." className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-4 text-sm" />
          <button type="submit" disabled={generating} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">{generating ? "Generating..." : "Generate Matrix"}</button>
        </form>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {["Not Started", "In Progress", "Complete", "N/A"].map(s => (
              <div key={s} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
                <p className="text-xl font-bold text-emerald-400">{matrix.filter(m => m.status === s).length}</p>
                <p className="text-xs text-slate-400">{s}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="pb-3 pr-3 w-12">#</th><th className="pb-3 pr-3">Requirement</th><th className="pb-3 pr-3 w-24">Section</th><th className="pb-3 pr-3 w-24">Volume</th><th className="pb-3 w-32">Status</th>
              </tr></thead>
              <tbody>{matrix.map(m => (
                <tr key={m.id} className="border-b border-slate-800/50">
                  <td className="py-3 pr-3 text-slate-500">{m.id}</td>
                  <td className="py-3 pr-3">{m.requirement}</td>
                  <td className="py-3 pr-3 text-slate-400">{m.section}</td>
                  <td className="py-3 pr-3 text-slate-400">{m.volume}</td>
                  <td className="py-3">
                    <select value={m.status} onChange={e => updateStatus(m.id, e.target.value)} className={`px-2 py-1 rounded text-xs font-medium ${statusColors[m.status] || ""} border-0 focus:outline-none`}>
                      <option>Not Started</option><option>In Progress</option><option>Complete</option><option>N/A</option>
                    </select>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <button onClick={() => setMatrix([])} className="mt-4 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700">Generate New Matrix</button>
        </>
      )}
    </div>
  );
}
