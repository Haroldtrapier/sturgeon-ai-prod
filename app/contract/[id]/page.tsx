"use client";

import { ArrowLeft, Download, Star, Building, MapPin, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";

export default function ContractDetailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <Link href="/opportunities" className="flex items-center gap-2 text-gray-600 mb-6"><ArrowLeft size={20} />Back</Link>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-3">IT Infrastructure Modernization</h1>
          <div className="flex gap-4 text-gray-600 mb-6">
            <div className="flex gap-2"><Building size={16} /><span>DOD</span></div>
            <div className="flex gap-2"><MapPin size={16} /><span>Washington, DC</span></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div><div className="flex gap-2 text-sm text-gray-600 mb-1"><DollarSign size={16} />Value</div><div className="text-2xl font-bold">$850K</div></div>
            <div><div className="flex gap-2 text-sm text-gray-600 mb-1"><Calendar size={16} />Due</div><div className="text-2xl font-bold">Mar 15</div></div>
            <div><div className="text-sm text-gray-600 mb-1">NAICS</div><div className="text-2xl font-bold">541512</div></div>
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold">Create Proposal</button>
        </div>
      </div>
    </div>
  );
}