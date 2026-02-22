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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500" /></div>;

  const statusColors: Record<string, string> = { "Not Started": "text-stone-500 bg-stone-100", "In Progress": "text-yellow-600 bg-yellow-900/20", "Complete": "text-lime-700 bg-lime-50", "N/A": "text-stone-8000 bg-stone-100" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Compliance Matrix</h1><p className="text-stone-500 mt-1">Generate and track proposal compliance requirements</p></div>
      {matrix.length === 0 ? (
        <form onSubmit={generateMatrix} className="p-6 bg-white border border-stone-200 rounded-xl">
          <p className="text-sm text-stone-500 mb-3">Paste RFP text to auto-generate a compliance matrix</p>
          <textarea value={rfpText} onChange={e => setRfpText(e.target.value)} rows={8} placeholder="Paste solicitation or RFP text here..." className="w-full px-4 py-3 bg-stone-100 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none mb-4 text-sm" />
          <button type="submit" disabled={generating} className="px-6 py-3 bg-lime-700 text-white rounded-lg hover:bg-lime-800 disabled:opacity-50 font-medium">{generating ? "Generating..." : "Generate Matrix"}</button>
        </form>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {["Not Started", "In Progress", "Complete", "N/A"].map(s => (
              <div key={s} className="p-3 bg-white border border-stone-200 rounded-xl text-center">
                <p className="text-xl font-bold text-lime-700">{matrix.filter(m => m.status === s).length}</p>
                <p className="text-xs text-stone-500">{s}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-stone-500 border-b border-stone-200">
                <th className="pb-3 pr-3 w-12">#</th><th className="pb-3 pr-3">Requirement</th><th className="pb-3 pr-3 w-24">Section</th><th className="pb-3 pr-3 w-24">Volume</th><th className="pb-3 w-32">Status</th>
              </tr></thead>
              <tbody>{matrix.map(m => (
                <tr key={m.id} className="border-b border-stone-200">
                  <td className="py-3 pr-3 text-stone-8000">{m.id}</td>
                  <td className="py-3 pr-3">{m.requirement}</td>
                  <td className="py-3 pr-3 text-stone-500">{m.section}</td>
                  <td className="py-3 pr-3 text-stone-500">{m.volume}</td>
                  <td className="py-3">
                    <select value={m.status} onChange={e => updateStatus(m.id, e.target.value)} className={`px-2 py-1 rounded text-xs font-medium ${statusColors[m.status] || ""} border-0 focus:outline-none`}>
                      <option>Not Started</option><option>In Progress</option><option>Complete</option><option>N/A</option>
                    </select>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <button onClick={() => setMatrix([])} className="mt-4 px-4 py-2 bg-stone-100 text-stone-600 rounded-lg text-sm hover:bg-stone-200">Generate New Matrix</button>
        </>
      )}
    </div>
  );
}
