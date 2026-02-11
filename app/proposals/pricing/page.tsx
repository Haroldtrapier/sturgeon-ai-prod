"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface LineItem {
  id: string;
  clin: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

export default function ProposalPricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams?.get("proposal_id");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", clin: "0001", description: "Program Management", quantity: 12, unit: "Months", unit_price: 15000, total: 180000 },
    { id: "2", clin: "0002", description: "Technical Services", quantity: 12, unit: "Months", unit_price: 45000, total: 540000 },
    { id: "3", clin: "0003", description: "Travel", quantity: 1, unit: "Lot", unit_price: 25000, total: 25000 },
  ]);
  const [overhead, setOverhead] = useState(35);
  const [gna, setGna] = useState(12);
  const [profit, setProfit] = useState(10);
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

  function updateItem(id: string, field: string, value: string | number) {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      updated.total = updated.quantity * updated.unit_price;
      return updated;
    }));
  }

  function addItem() {
    const num = items.length + 1;
    setItems(prev => [...prev, {
      id: String(Date.now()),
      clin: String(num).padStart(4, "0"),
      description: "",
      quantity: 1,
      unit: "Each",
      unit_price: 0,
      total: 0,
    }]);
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  async function generatePricing() {
    setGenerating(true);
    try {
      await fetch(`${API}/api/agents/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          agent_type: "market",
          message: `Analyze market pricing for these contract line items and suggest competitive rates: ${JSON.stringify(items.map(i => i.description))}. Consider current GSA rates and market data.`,
        }),
      });
    } catch {}
    setGenerating(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" /></div>;

  const directCost = items.reduce((sum, i) => sum + i.total, 0);
  const overheadAmt = directCost * (overhead / 100);
  const gnaAmt = (directCost + overheadAmt) * (gna / 100);
  const subtotal = directCost + overheadAmt + gnaAmt;
  const profitAmt = subtotal * (profit / 100);
  const totalPrice = subtotal + profitAmt;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Cost/Pricing Volume</h1>
          <p className="text-slate-400 mt-1">Build your pricing proposal with rate analysis</p>
        </div>
        <button onClick={generatePricing} disabled={generating} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium">
          {generating ? "Analyzing..." : "AI Rate Analysis"}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800">
                <th className="px-3 py-3 w-20">CLIN</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3 w-20">Qty</th>
                <th className="px-3 py-3 w-24">Unit</th>
                <th className="px-3 py-3 w-28">Unit Price</th>
                <th className="px-3 py-3 w-28 text-right">Total</th>
                <th className="px-3 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-slate-800/50">
                  <td className="px-3 py-2"><input type="text" value={item.clin} onChange={e => updateItem(item.id, "clin", e.target.value)} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs" /></td>
                  <td className="px-3 py-2"><input type="text" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs" placeholder="Line item description" /></td>
                  <td className="px-3 py-2"><input type="number" value={item.quantity} onChange={e => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs" /></td>
                  <td className="px-3 py-2">
                    <select value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs">
                      {["Each", "Hours", "Months", "Lot", "Year"].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2"><input type="number" value={item.unit_price} onChange={e => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs" /></td>
                  <td className="px-3 py-2 text-right font-mono text-xs">${item.total.toLocaleString()}</td>
                  <td className="px-3 py-2"><button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 text-xs">&#x2715;</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-2 border-t border-slate-800">
          <button onClick={addItem} className="text-xs text-emerald-400 hover:underline">+ Add Line Item</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Rate Structure</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm">Overhead Rate</label>
                <span className="text-sm text-emerald-400">{overhead}%</span>
              </div>
              <input type="range" min={0} max={100} value={overhead} onChange={e => setOverhead(parseInt(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm">G&A Rate</label>
                <span className="text-sm text-emerald-400">{gna}%</span>
              </div>
              <input type="range" min={0} max={50} value={gna} onChange={e => setGna(parseInt(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm">Profit/Fee</label>
                <span className="text-sm text-emerald-400">{profit}%</span>
              </div>
              <input type="range" min={0} max={15} value={profit} onChange={e => setProfit(parseInt(e.target.value))} className="w-full accent-emerald-500" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-emerald-800 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Price Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Direct Costs</span><span className="font-mono">${directCost.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Overhead ({overhead}%)</span><span className="font-mono">${overheadAmt.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">G&A ({gna}%)</span><span className="font-mono">${gnaAmt.toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-slate-700 pt-2"><span className="text-slate-400">Subtotal</span><span className="font-mono">${subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Profit/Fee ({profit}%)</span><span className="font-mono">${profitAmt.toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-emerald-800 pt-2 text-lg font-bold">
              <span className="text-emerald-400">Total Price</span>
              <span className="text-emerald-400 font-mono">${totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
