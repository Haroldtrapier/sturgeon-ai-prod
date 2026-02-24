"use client";

import { BarChart3, TrendingUp, Users, Target } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics</h1>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[{label: "Bids", value: "127", icon: <BarChart3 size={24} />},{label: "Win Rate", value: "94%", icon: <Target size={24} />},{label: "Proposals", value: "23", icon: <Users size={24} />},{label: "Revenue", value: "$12M", icon: <TrendingUp size={24} />}].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-blue-600 mb-3">{s.icon}</div>
              <div className="text-3xl font-bold mb-1">{s.value}</div>
              <div className="text-sm text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}