"use client";

import { motion } from "framer-motion";
import { TrendingUp, BarChart3, PieChart } from "lucide-react";

export default function MarketIntelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Market Intelligence</h1>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[{title: "Total Market Value", value: "$24.5B", icon: <TrendingUp size={24} />},{title: "Active Agencies", value: "127", icon: <BarChart3 size={24} />},{title: "Avg Contract Size", value: "$2.8M", icon: <PieChart size={24} />}].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="p-3 bg-blue-50 rounded-lg mb-4">{s.icon}</div>
              <div className="text-3xl font-bold mb-1">{s.value}</div>
              <div className="text-sm text-gray-600">{s.title}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Top Agencies by Spend</h2>
          {[{name: "DOD", value: "$8.2B", percent: 85},{name: "NASA", value: "$4.1B", percent: 65}].map((a, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between mb-2"><span className="font-semibold">{a.name}</span><span>{a.value}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{width: `${a.percent}%`}}></div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}