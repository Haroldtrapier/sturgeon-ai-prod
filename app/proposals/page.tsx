"use client";

import { motion } from "framer-motion";
import { Plus, Clock, CheckCircle } from "lucide-react";

export default function ProposalsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between mb-8">
          <h1 className="text-3xl font-bold">Proposals</h1>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold"><Plus size={20} className="inline mr-2" />New Proposal</button>
        </div>
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[{label: "In Progress", count: "8"},{label: "Submitted", count: "4"},{label: "Under Review", count: "2"},{label: "Won", count: "15"}].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-3xl font-bold mb-1">{s.count}</div>
              <div className="text-sm text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}