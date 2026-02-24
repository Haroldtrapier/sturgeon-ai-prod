"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, DollarSign, Clock, Search, Filter, Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold gradient-text">Sturgeon AI</span>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Welcome back! 👋</h1>
        
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Active Opportunities", value: "847", icon: <Target size={24} /> },
            { label: "Win Rate", value: "94%", icon: <TrendingUp size={24} /> },
            { label: "Contract Value", value: "$2.4M", icon: <DollarSign size={24} /> },
            { label: "Pending Proposals", value: "12", icon: <Clock size={24} /> }
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
              {s.icon}
              <div className="text-3xl font-bold mt-4">{s.value}</div>
              <div className="text-sm text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Top Matched Opportunities</h2>
          <div className="space-y-4">
            {[
              { title: "IT Infrastructure Modernization", agency: "DOD", value: "$850K" },
              { title: "Cloud Migration Services", agency: "NASA", value: "$1.2M" },
              { title: "Cybersecurity Assessment", agency: "DHS", value: "$650K" }
            ].map((o, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b">
                <div>
                  <div className="font-semibold">{o.title}</div>
                  <div className="text-sm text-gray-600">{o.agency}</div>
                </div>
                <div className="font-semibold">{o.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}