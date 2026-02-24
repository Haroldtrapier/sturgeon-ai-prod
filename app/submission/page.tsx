"use client";

import { CheckCircle, Clock, AlertTriangle, FileText } from "lucide-react";

export default function SubmissionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Submissions</h1>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[{label: "Pending", count: "3", icon: <Clock size={24} />},{label: "Under Review", count: "5", icon: <AlertTriangle size={24} />},{label: "Approved", count: "12", icon: <CheckCircle size={24} />},{label: "Total", count: "20", icon: <FileText size={24} />}].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-blue-600 mb-3">{s.icon}</div>
              <div className="text-3xl font-bold mb-1">{s.count}</div>
              <div className="text-sm text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}