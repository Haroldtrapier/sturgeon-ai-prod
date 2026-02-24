"use client";

import { motion } from "framer-motion";
import { Search, Filter, Star, MapPin, DollarSign, Calendar, ArrowRight } from "lucide-react";

export default function OpportunitiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Opportunities</h1>
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="text" placeholder="Search opportunities..." className="w-full pl-12 pr-4 py-3 border rounded-lg outline-none" />
            </div>
            <button className="px-6 py-3 border rounded-lg flex items-center gap-2"><Filter size={20} />Filters</button>
          </div>
        </div>
        <div className="space-y-4">
          {[{title: "IT Infrastructure Modernization", agency: "DOD", value: "$850K", match: 95},{title: "Cloud Migration", agency: "NASA", value: "$1.2M", match: 92}].map((o, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">{o.title}</h3>
              <p className="text-gray-600 mb-4">{o.agency}</p>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{o.value}</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{o.match}% Match</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}